import type { CompetitiveProgrammingData } from "./types.js";

const today = new Date();
const calendar = Array.from({ length: 91 }, (_, index) => {
  const date = new Date(today);
  date.setUTCDate(today.getUTCDate() - (90 - index));
  return {
    date: date.toISOString().slice(0, 10),
    count: index % 9 === 0 ? 3 : index % 4 === 0 ? 1 : 0,
  };
});

export const competitiveProgrammingFallback: CompetitiveProgrammingData = {
  profile: {
    handle: "Uifjk2s23k",
    primaryLanguage: "C++",
    focus: ["Backtracking", "Binary Search"],
    totalSolved: 645,
  },
  leetcode: {
    username: "Uifjk2s23k",
    profileUrl: "https://leetcode.com/u/Uifjk2s23k/",
    totalSolved: 556,
    difficulty: { easy: 133, medium: 356, hard: 67 },
    currentStreak: 8,
    maxStreak: 43,
    contestRating: 1612,
    contestRanking: 128742,
    calendar,
    topics: [
      { name: "Arrays", count: 126 },
      { name: "Binary Search", count: 64 },
      { name: "Dynamic Programming", count: 49 },
      { name: "Backtracking", count: 37 },
      { name: "Trees", count: 31 },
    ],
    recentAccepted: [
      {
        id: "lc-fallback-1",
        title: "Combination Sum",
        url: "https://leetcode.com/problems/combination-sum/",
        language: "cpp",
      },
      {
        id: "lc-fallback-2",
        title: "Search in Rotated Sorted Array",
        url: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
        language: "cpp",
      },
      {
        id: "lc-fallback-3",
        title: "Longest Increasing Subsequence",
        url: "https://leetcode.com/problems/longest-increasing-subsequence/",
        language: "cpp",
      },
    ],
  },
  codeforces: {
    username: "akash1xe",
    profileUrl: "https://codeforces.com/profile/akash1xe",
    currentRating: 1248,
    maxRating: 1327,
    rank: "pupil",
    contests: [
      { name: "Round 946", rating: 1098, rank: 6241, timestamp: 1714934400 },
      { name: "Round 952", rating: 1174, rank: 4802, timestamp: 1718496000 },
      { name: "Round 961", rating: 1211, rank: 4215, timestamp: 1721433600 },
      { name: "Round 972", rating: 1289, rank: 3381, timestamp: 1727568000 },
      { name: "Round 981", rating: 1248, rank: 5710, timestamp: 1730592000 },
    ],
    solvedByRating: {
      "800–1000": 96,
      "1100–1300": 44,
      "1400+": 15,
      unrated: 9,
    },
    tags: [
      { name: "implementation", count: 71 },
      { name: "greedy", count: 52 },
      { name: "math", count: 43 },
      { name: "binary search", count: 29 },
      { name: "constructive algorithms", count: 24 },
    ],
    recentAccepted: [
      {
        id: "cf-fallback-1",
        title: "Array Coloring",
        url: "https://codeforces.com/problemset",
        language: "GNU C++17",
        rating: 900,
      },
      {
        id: "cf-fallback-2",
        title: "Binary Deque",
        url: "https://codeforces.com/problemset",
        language: "GNU C++17",
        rating: 1200,
      },
      {
        id: "cf-fallback-3",
        title: "Make It Increasing",
        url: "https://codeforces.com/problemset",
        language: "GNU C++17",
        rating: 1400,
      },
    ],
    totalSolved: 89,
  },
  services: {
    leetcode: "fallback",
    codeforces: "fallback",
    cache: "stale",
  },
  meta: {
    lastUpdated: new Date().toISOString(),
    cachedUntil: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    source: "fallback",
  },
};
