export type DifficultyBreakdown = {
  easy: number;
  medium: number;
  hard: number;
};

export type RecentProblem = {
  id: string;
  title: string;
  url: string;
  language?: string;
  solvedAt?: number;
  rating?: number;
  tags?: string[];
};

export type CalendarDay = {
  date: string;
  count: number;
};

export type ContestPoint = {
  name: string;
  rating: number;
  rank: number;
  timestamp: number;
};

export type CompetitiveProgrammingData = {
  profile: {
    handle: string;
    primaryLanguage: string;
    focus: string[];
    totalSolved: number;
  };
  leetcode: {
    username: string;
    profileUrl: string;
    totalSolved: number;
    difficulty: DifficultyBreakdown;
    currentStreak: number;
    maxStreak: number;
    contestRating: number | null;
    contestRanking: number | null;
    calendar: CalendarDay[];
    topics: { name: string; count: number }[];
    recentAccepted: RecentProblem[];
  };
  codeforces: {
    username: string;
    profileUrl: string;
    currentRating: number | null;
    maxRating: number | null;
    rank: string;
    contests: ContestPoint[];
    solvedByRating: {
      "800–1000": number;
      "1100–1300": number;
      "1400+": number;
      unrated: number;
    };
    tags: { name: string; count: number }[];
    recentAccepted: RecentProblem[];
    totalSolved: number;
  };
  services: {
    leetcode: "connected" | "fallback" | "error";
    codeforces: "connected" | "fallback" | "error";
    cache: "healthy" | "stale";
  };
  meta: {
    lastUpdated: string;
    cachedUntil: string;
    source: "live" | "partial" | "fallback";
  };
};

