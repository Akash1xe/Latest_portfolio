import type { Project, WorkExperience } from "../../types";

export type PortfolioContent = {
  profile: {
    name: string;
    handle: string;
    role: string;
    tagline: string;
    location: string;
    githubUrl: string;
    linkedinUrl: string;
    email: string;
    avatarUrl: string;
    description: string[];
  };
  about: {
    background: { question: string; answer: string }[];
    focusAreas: string[];
    technicalInterests: string[];
    personalInterests: string[];
    philosophy: string[];
  };
  skills: { category: string; skills: string[] }[];
  experiences: WorkExperience[];
  projects: Project[];
  competitiveProgramming: {
    leetcodeUsername: string;
    codeforcesUsername: string;
    primaryLanguage: string;
    currentFocus: string[];
    enabledStats: string[];
    fallbackTotal: number;
  };
  publishState: "draft" | "published";
};

export type ResumeMetadata = {
  fileName: string;
  mimeType: string;
  size: number;
  updatedAt: string | null;
};
