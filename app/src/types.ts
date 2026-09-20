import React from "react";

import type { TechName } from "./components/base/technologies";

export type TechnologyLearning = {
  name: string;
  icon: React.ReactNode;
  description: string;
  repoLink?: string;
  category: "Database" | "Backend" | "Frontend" | "DevOps" | "AI/ML";
  learningGoals: string[];
};

export type Technology = {
  name: string;
  aboutLink: string;
  icon?: React.ReactNode;
};

export type MediaItem = {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  caption?: string;
  alt?: string;
  aspectRatio?: string;
  title: string;
  description: string;
  featured?: boolean;
  tags?: string[];
};

export type ProjectDemoVideo = {
  videoUrl: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  duration?: string;
  highlights?: string[];
  fileSize?: string;
};

export type ProjectAssetCategory =
  | "research"
  | "architecture"
  | "demo"
  | "documentation";

export type ProjectAsset = {
  id: string;
  type: "image" | "video" | "document";
  category: ProjectAssetCategory;
  title: string;
  caption?: string;
  url: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
  storage: "database" | "external";
};

export type TechnologyDecision = {
  id: string;
  technology: string;
  purpose: string;
  reason: string;
};

export type ProjectDeepDive = {
  published: boolean;
  overview: string;
  research: string;
  architecture: string;
  implementation: string;
  technologyDecisions: TechnologyDecision[];
  assets: ProjectAsset[];
};
// Flashcard type for Q&A explain section
export type Flashcard = {
  q: string; // Question (max ~10 words)
  a: string; // Answer (max ~10 words)
};

// Phase-organized flashcard collection
export type ExplainCards = {
  problem: Flashcard[];
  execution: Flashcard[];
  future: Flashcard[];
};

export type Project = {
  name: string;
  description: string;
  technologies: TechName[];
  keyFeatures?: string[];
  githubLink: string;
  liveLink?: string;
  tags?: string[];
  media?: {
    gallery?: MediaItem[];
  };
  explain: string[];
  explainCards: ExplainCards; // New flashcard format
  demoVideo?: ProjectDemoVideo;
  tagline?: string;
  /** Emoji or short string shown as the page icon, e.g. "🏊" */
  icon?: string;
  /** Relative URL for the cover image, e.g. "/data/projects/covers/gopool.jpg" */
  coverImage?: string;
  /** Admin-managed research, architecture, implementation notes and media. */
  deepDive?: ProjectDeepDive;
};

export type Article = {
  title: string;
  link: string;
  imageUrl: string;
};

export type WorkExperience = {
  company: string;
  position: string;
  duration: string;
  achievements: {
    title: string;
    description: string[];
    icon?: string;
  }[];
  technologies: TechName[];
  imageSrc: string;
  companyUrl: string;
  docsUrl?: string;
};
