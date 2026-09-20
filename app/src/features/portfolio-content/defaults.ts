import type { PortfolioContent } from "./types";

export const defaultPortfolioContent: PortfolioContent = {
  profile: {
    name: "Akash Kumar",
    handle: "Akash1xe",
    role: "Backend Developer & Software Engineer",
    tagline: "I build scalable backend systems, distributed services, and real-time products.",
    location: "Noida, Uttar Pradesh, India",
    githubUrl: "https://github.com/Akash1xe",
    linkedinUrl: "",
    email: "",
    avatarUrl: "https://avatars.githubusercontent.com/u/121711965?v=4",
    description: [
      "Backend-focused software engineer building reliable, scalable products.",
      "I work across APIs, distributed services, real-time systems, databases, and cloud-ready deployments.",
      "I enjoy system design, open source, competitive programming, and practical GenAI integrations.",
    ],
  },
  about: {
    background: [
      { question: "Who am I?", answer: "Backend developer and software engineer focused on scalable systems." },
      { question: "How did I start?", answer: "Started with web applications and moved deeper into APIs, distributed systems, and real-time products." },
      { question: "What do I enjoy?", answer: "Designing reliable backends, event-driven services, and useful developer experiences." },
      { question: "What drives me?", answer: "Creating useful applications that help people accomplish their goals." },
    ],
    focusAreas: [
      "Distributed systems and microservice architecture",
      "Kafka-driven event processing and reliable messaging",
      "Database design, caching, and performance optimization",
      "Generative AI applications and backend integrations",
      "Backtracking, binary search, and competitive programming",
    ],
    technicalInterests: [
      "Reading code of open-source projects",
      "Experimenting with new programming languages",
      "Exploring AI/ML applications in web development",
      "Reading technical blogs and papers",
    ],
    personalInterests: ["Watching Virat Kohli's batting", "Exploring new music", "Going to the gym", "Playing PES"],
    philosophy: [
      "Make it Work|Functionality first, ensuring the core requirements are met",
      "Make it Right|Clean, maintainable code that follows best practices",
      "Make it Fast|Optimize for performance and user experience",
    ],
  },
  skills: [
    { category: "Frontend", skills: ["React", "TypeScript", "Tailwind CSS", "Redux", "React Query"] },
    { category: "Backend", skills: ["Node.js", "Express", "Python", "MongoDB", "PostgreSQL", "Redis", "MySQL", "GraphQL", "REST API Design"] },
    { category: "DevOps & Cloud", skills: ["Docker", "Kafka", "Redis", "Elasticsearch", "Vercel"] },
    { category: "Tools & Others", skills: ["Git", "GitHub", "Agile Methodologies", "Unit Testing", "E2E Testing"] },
  ],
  experiences: [],
  projects: [],
  competitiveProgramming: {
    leetcodeUsername: "Uifjk2s23k",
    codeforcesUsername: "akash1xe",
    primaryLanguage: "C++",
    currentFocus: ["Backtracking", "Binary Search"],
    enabledStats: ["streaks", "calendar", "contests", "topics", "recent", "rating graph"],
    fallbackTotal: 500,
  },
  publishState: "published",
};
