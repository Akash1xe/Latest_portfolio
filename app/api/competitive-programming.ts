import postgres from "postgres";

import { competitiveProgrammingFallback } from "../src/features/competitive-programming/fallback.js";
import type {
  CalendarDay,
  CompetitiveProgrammingData,
  ContestPoint,
  RecentProblem,
} from "../src/features/competitive-programming/types.js";
import { requireAdmin } from "./_auth.js";
import { parseStoredJson } from "./_db.js";
import type { VercelRequest, VercelResponse } from "./_types.js";

const CACHE_TTL = 3 * 60 * 60 * 1000;
const CODEFORCES_DELAY = 2_050;

type CacheEntry = { expiresAt: number; value: CompetitiveProgrammingData };
type GlobalCache = typeof globalThis & { cpStatsCacheV2?: CacheEntry };

const sleep = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

type IntegrationSettings = {
  leetcodeUsername: string;
  codeforcesUsername: string;
  primaryLanguage: string;
  currentFocus: string[];
  enabledStats: string[];
  fallbackTotal: number;
  publishState: "draft" | "published";
};

const loadSettings = async (): Promise<IntegrationSettings> => {
  const defaults: IntegrationSettings = {
    leetcodeUsername: process.env.LEETCODE_USERNAME ?? "akash1xe",
    codeforcesUsername: process.env.CODEFORCES_USERNAME ?? "akash1xe",
    primaryLanguage: "C++",
    currentFocus: ["Backtracking", "Binary Search"],
    enabledStats: [
      "streaks",
      "calendar",
      "contests",
      "topics",
      "recent",
      "rating graph",
    ],
    fallbackTotal: 500,
    publishState: "published",
  };
  if (!process.env.DATABASE_URL) return defaults;
  const isLocal = ["localhost", "127.0.0.1", "::1"].includes(
    new URL(process.env.DATABASE_URL).hostname
  );
  const db = postgres(process.env.DATABASE_URL, {
    ssl: isLocal ? false : "require",
    max: 1,
    idle_timeout: 10,
  });
  try {
    const rows =
      await db`select id, content from portfolio_settings where id in ('portfolio-content', 'competitive-programming')`;
    const portfolio = parseStoredJson<{
      competitiveProgramming?: Partial<IntegrationSettings>;
      publishState?: "draft" | "published";
    }>(rows.find((row) => row.id === "portfolio-content")?.content);
    const legacy = parseStoredJson<Partial<IntegrationSettings>>(
      rows.find((row) => row.id === "competitive-programming")?.content
    );
    return {
      ...defaults,
      ...legacy,
      ...portfolio?.competitiveProgramming,
      publishState:
        portfolio?.publishState ??
        legacy?.publishState ??
        defaults.publishState,
    };
  } catch {
    return defaults;
  } finally {
    await db.end({ timeout: 1 });
  }
};

const calculateStreaks = (calendar: CalendarDay[]) => {
  const active = new Set(
    calendar.filter((day) => day.count > 0).map((day) => day.date)
  );
  const ordered = [...active].sort();
  let maxStreak = 0;
  let run = 0;
  let previous = "";

  for (const date of ordered) {
    const prior = new Date(`${date}T00:00:00Z`);
    prior.setUTCDate(prior.getUTCDate() - 1);
    run = previous === prior.toISOString().slice(0, 10) ? run + 1 : 1;
    maxStreak = Math.max(maxStreak, run);
    previous = date;
  }

  let currentStreak = 0;
  const cursor = new Date();
  const today = cursor.toISOString().slice(0, 10);
  if (!active.has(today)) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (active.has(cursor.toISOString().slice(0, 10))) {
    currentStreak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return { currentStreak, maxStreak };
};

const fetchLeetCode = async (username: string) => {
  const query = `
    query portfolioProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats: submitStatsGlobal { acSubmissionNum { difficulty count } }
        submissionCalendar
        tagProblemCounts { advanced { tagName problemsSolved } intermediate { tagName problemsSolved } fundamental { tagName problemsSolved } }
      }
      userContestRanking(username: $username) { rating globalRanking attendedContestsCount }
      userContestRankingHistory(username: $username) { attended rating ranking contest { title startTime } }
      recentAcSubmissionList(username: $username, limit: 10) { id title titleSlug timestamp }
    }
  `;
  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      referer: `https://leetcode.com/u/${username}/`,
      "user-agent": "AkashBackendLab/1.0",
    },
    body: JSON.stringify({ query, variables: { username } }),
    signal: AbortSignal.timeout(9_000),
  });
  if (!response.ok) throw new Error(`LeetCode returned ${response.status}`);

  const payload = (await response.json()) as {
    data?: {
      matchedUser?: {
        submitStats?: {
          acSubmissionNum?: { difficulty: string; count: number }[];
        };
        submissionCalendar?: string;
        tagProblemCounts?: Record<
          string,
          { tagName: string; problemsSolved: number }[]
        >;
      };
      userContestRanking?: { rating?: number; globalRanking?: number };
      userContestRankingHistory?: {
        attended: boolean;
        rating: number;
        ranking: number;
        contest: { title: string; startTime: number };
      }[];
      recentAcSubmissionList?: {
        id: string;
        title: string;
        titleSlug: string;
        timestamp: string;
      }[];
    };
    errors?: { message: string }[];
  };
  if (!payload.data?.matchedUser)
    throw new Error(payload.errors?.[0]?.message ?? "LeetCode user not found");

  const stats = payload.data.matchedUser.submitStats?.acSubmissionNum ?? [];
  const countFor = (difficulty: string) =>
    stats.find(
      (entry) => entry.difficulty.toLowerCase() === difficulty.toLowerCase()
    )?.count ?? 0;
  const rawCalendar = JSON.parse(
    payload.data.matchedUser.submissionCalendar || "{}"
  ) as Record<string, number>;
  const calendar = Object.entries(rawCalendar)
    .map(([timestamp, count]) => ({
      date: new Date(Number(timestamp) * 1000).toISOString().slice(0, 10),
      count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const topics = Object.values(payload.data.matchedUser.tagProblemCounts ?? {})
    .flat()
    .map((topic) => ({ name: topic.tagName, count: topic.problemsSolved }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalSolved: countFor("All"),
    difficulty: {
      easy: countFor("Easy"),
      medium: countFor("Medium"),
      hard: countFor("Hard"),
    },
    ...calculateStreaks(calendar),
    contestRating: payload.data.userContestRanking?.rating ?? null,
    contestRanking: payload.data.userContestRanking?.globalRanking ?? null,
    calendar,
    topics,
    recentAccepted: (payload.data.recentAcSubmissionList ?? []).map(
      (problem): RecentProblem => ({
        id: problem.id,
        title: problem.title,
        url: `https://leetcode.com/problems/${problem.titleSlug}/`,
        solvedAt: Number(problem.timestamp),
      })
    ),
  };
};

const codeforcesRequest = async <T>(
  method: string,
  params: URLSearchParams
) => {
  const response = await fetch(
    `https://codeforces.com/api/${method}?${params}`,
    {
      headers: { "user-agent": "AkashBackendLab/1.0" },
      signal: AbortSignal.timeout(9_000),
    }
  );
  if (!response.ok) throw new Error(`Codeforces returned ${response.status}`);
  const payload = (await response.json()) as {
    status: string;
    result?: T;
    comment?: string;
  };
  if (payload.status !== "OK" || !payload.result)
    throw new Error(payload.comment ?? "Codeforces request failed");
  return payload.result;
};

const fetchCodeforces = async (username: string) => {
  type User = { rating?: number; maxRating?: number; rank?: string };
  type Rating = {
    contestName: string;
    newRating: number;
    rank: number;
    ratingUpdateTimeSeconds: number;
  };
  type Submission = {
    id: number;
    verdict?: string;
    creationTimeSeconds: number;
    programmingLanguage: string;
    problem: {
      contestId?: number;
      index: string;
      name: string;
      rating?: number;
      tags: string[];
    };
  };

  const users = await codeforcesRequest<User[]>(
    "user.info",
    new URLSearchParams({ handles: username })
  );
  await sleep(CODEFORCES_DELAY);
  const ratingHistory = await codeforcesRequest<Rating[]>(
    "user.rating",
    new URLSearchParams({ handle: username })
  );
  await sleep(CODEFORCES_DELAY);
  const submissions = await codeforcesRequest<Submission[]>(
    "user.status",
    new URLSearchParams({ handle: username, from: "1", count: "2000" })
  );

  const accepted = submissions.filter(
    (submission) => submission.verdict === "OK"
  );
  const unique = new Map<string, Submission>();
  for (const submission of accepted) {
    const key = `${submission.problem.contestId ?? "gym"}-${submission.problem.index}`;
    if (!unique.has(key)) unique.set(key, submission);
  }
  const solved = [...unique.values()];
  const tagCount = new Map<string, number>();
  solved.forEach((submission) =>
    submission.problem.tags.forEach((tag) =>
      tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1)
    )
  );
  const solvedByRating = {
    "800–1000": 0,
    "1100–1300": 0,
    "1400+": 0,
    unrated: 0,
  };
  solved.forEach((submission) => {
    const rating = submission.problem.rating;
    if (!rating) solvedByRating.unrated += 1;
    else if (rating <= 1000) solvedByRating["800–1000"] += 1;
    else if (rating <= 1300) solvedByRating["1100–1300"] += 1;
    else solvedByRating["1400+"] += 1;
  });

  const profile = users[0] ?? {};
  return {
    currentRating: profile.rating ?? null,
    maxRating: profile.maxRating ?? null,
    rank: profile.rank ?? "unrated",
    contests: ratingHistory.map((contest): ContestPoint => ({
      name: contest.contestName,
      rating: contest.newRating,
      rank: contest.rank,
      timestamp: contest.ratingUpdateTimeSeconds,
    })),
    solvedByRating,
    tags: [...tagCount.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    recentAccepted: accepted.slice(0, 10).map((submission): RecentProblem => ({
      id: String(submission.id),
      title: submission.problem.name,
      url: submission.problem.contestId
        ? `https://codeforces.com/problemset/problem/${submission.problem.contestId}/${submission.problem.index}`
        : "https://codeforces.com/problemset",
      language: submission.programmingLanguage,
      solvedAt: submission.creationTimeSeconds,
      rating: submission.problem.rating,
      tags: submission.problem.tags,
    })),
    totalSolved: solved.length,
  };
};

const buildStats = async (): Promise<CompetitiveProgrammingData> => {
  const settings = await loadSettings();
  const leetcodeUsername = settings.leetcodeUsername;
  const codeforcesUsername = settings.codeforcesUsername;
  const [leetcodeResult, codeforcesResult] = await Promise.allSettled([
    fetchLeetCode(leetcodeUsername),
    fetchCodeforces(codeforcesUsername),
  ]);
  const leetcode =
    leetcodeResult.status === "fulfilled"
      ? {
          ...competitiveProgrammingFallback.leetcode,
          username: leetcodeUsername,
          profileUrl: `https://leetcode.com/u/${leetcodeUsername}/`,
          ...leetcodeResult.value,
        }
      : {
          ...competitiveProgrammingFallback.leetcode,
          username: leetcodeUsername,
          profileUrl: `https://leetcode.com/u/${leetcodeUsername}/`,
        };
  const codeforces =
    codeforcesResult.status === "fulfilled"
      ? {
          ...competitiveProgrammingFallback.codeforces,
          username: codeforcesUsername,
          profileUrl: `https://codeforces.com/profile/${codeforcesUsername}`,
          ...codeforcesResult.value,
        }
      : {
          ...competitiveProgrammingFallback.codeforces,
          username: codeforcesUsername,
          profileUrl: `https://codeforces.com/profile/${codeforcesUsername}`,
        };
  const now = new Date();
  const bothLive =
    leetcodeResult.status === "fulfilled" &&
    codeforcesResult.status === "fulfilled";
  const bothFailed =
    leetcodeResult.status === "rejected" &&
    codeforcesResult.status === "rejected";

  return {
    profile: {
      ...competitiveProgrammingFallback.profile,
      handle: leetcodeUsername,
      primaryLanguage: settings.primaryLanguage,
      focus: settings.currentFocus,
      totalSolved: Math.max(
        leetcode.totalSolved + codeforces.totalSolved,
        settings.fallbackTotal
      ),
    },
    leetcode,
    codeforces,
    services: {
      leetcode:
        leetcodeResult.status === "fulfilled" ? "connected" : "fallback",
      codeforces:
        codeforcesResult.status === "fulfilled" ? "connected" : "fallback",
      cache: "healthy",
    },
    meta: {
      lastUpdated: now.toISOString(),
      cachedUntil: new Date(now.getTime() + CACHE_TTL).toISOString(),
      source: bothLive ? "live" : bothFailed ? "fallback" : "partial",
    },
  };
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== "GET")
    return response.status(405).json({ error: "Method not allowed" });
  const cacheHost = globalThis as GlobalCache;
  const forceRefresh = request.query.refresh === "1";
  if (forceRefresh && !requireAdmin(request, response)) return;
  if (
    !forceRefresh &&
    cacheHost.cpStatsCacheV2 &&
    cacheHost.cpStatsCacheV2.expiresAt > Date.now()
  ) {
    response.setHeader("x-stats-cache", "HIT");
    response.setHeader(
      "cache-control",
      "public, s-maxage=10800, stale-while-revalidate=86400"
    );
    return response.status(200).json(cacheHost.cpStatsCacheV2.value);
  }

  try {
    const value = await buildStats();
    cacheHost.cpStatsCacheV2 = { expiresAt: Date.now() + CACHE_TTL, value };
    response.setHeader("x-stats-cache", "MISS");
    response.setHeader(
      "cache-control",
      "public, s-maxage=10800, stale-while-revalidate=86400"
    );
    return response.status(200).json(value);
  } catch {
    return response.status(200).json(competitiveProgrammingFallback);
  }
}
