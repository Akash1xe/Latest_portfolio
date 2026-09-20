import { useMemo } from "react";

import { technologies } from "@/components/base/technologies";
import { useActiveSection } from "@/components/home/editor/context/editor-store";
import {
  sections,
  type SectionType,
} from "@/components/home/editor/context/editor-store";
import { articles } from "@/components/home/portfolio/articles/articles-dump";
import {
  databases,
  frameworks,
  languages,
  tools,
} from "@/components/home/portfolio/skills/data";
import { experiences } from "@/components/home/portfolio/work/experienceDump";
import { profile } from "@/data/profile";
import { competitiveProgrammingFallback as cp } from "@/features/competitive-programming/fallback";
import { useSectionNav } from "@/hooks/use-editor-actions";
import { useProject } from "@/hooks/use-project";

export type Command = {
  /** The name of the command */
  name: string;

  /** A brief description of what the command does */
  description: string;

  /** The usage syntax for the command */
  usage: string;

  /** A function that returns an array of argument options for the command */
  args: (existingArgs?: string[]) => string[];

  /** A function that executes the command with the provided arguments and returns a string result */
  execute: (args: string[]) => string;
};

/**
 * Custom hook that provides Linux-like terminal commands for navigation and information display.
 *
 * This hook offers familiar commands such as:
 * - cd: Navigate between different sections of the portfolio
 * - ls: List available sections or content within sections
 * - cat: Display details about specific projects, articles, or skills
 * - clear: Clear the terminal screen
 * - whoami: Display basic information about the portfolio owner
 * - pwd: Show the current active section
 *
 * @returns {Record<string, Command>} A collection of command objects that can be executed in the terminal
 */
export const useLinuxCommands = () => {
  const { setActiveSection } = useSectionNav();
  const activeSection = useActiveSection();
  const { projects } = useProject();
  return useMemo(() => {
    const cd = {
      name: "cd",
      description: "Change to a different section",
      usage: "cd [section]",
      args: () => sections.map((section) => section.toLowerCase()),
      execute: (args: string[]) => {
        const section = args[0];
        if (!section) return "Please specify a section";

        if (sections.includes(section as SectionType)) {
          setActiveSection(section as SectionType);
          return `Navigated to ${section}`;
        }
        return `Section '${section}' not found`;
      },
    };

    const ls = {
      name: "ls",
      description: "List available sections or content",
      usage: "ls [section]",
      args: () => ["projects", "skills", "articles", "experience"],
      execute: (args: string[]) => {
        if (!args.length) return _arrayJoin([...sections], "  ");

        const section = args[0];
        switch (section) {
          case "projects":
            return projects.map((p) => p.name).join("\n");
          case "skills":
            return Object.keys(technologies).join("  ");
          case "articles":
            return articles.map((a) => a.title).join("\n");
          case "experience":
            return experiences.map((e) => e.company).join("\n");
          default:
            return `Unknown section: ${section}`;
        }
      },
    };

    const clear = {
      name: "clear",
      description: "Clear the terminal",
      usage: "clear",
      args: () => [],
      execute: () => {
        return "CLEAR_TERMINAL";
      },
    };

    const cat = {
      name: "cat",
      description: "Display details of a specific item",
      usage: "cat [type] [name]",
      args: (existingArgs?: string[]) => {
        if (!existingArgs || existingArgs.length === 0) {
          return ["project", "article", "skill"];
        }

        const type = existingArgs[0];
        switch (type) {
          case "project": {
            return projects.map((p) => p.name);
          }
          case "article": {
            return articles.map((a) => a.title);
          }
          case "skill": {
            return Object.keys(technologies);
          }
          default: {
            return [];
          }
        }
      },
      execute: (args: string[]) => {
        const [type, ...nameParts] = args;
        const name = nameParts.join(" ");

        switch (type) {
          case "project": {
            const project = projects.find(
              (p) => p.name.toLowerCase() === name.toLowerCase()
            );
            if (project) {
              return `
Name: ${project.name}
Description: ${project.description}
Tech: ${project.technologies
                .filter((t) => technologies[t])
                .map((t) => technologies[t].name)
                .join(", ")}
GitHub: ${project.githubLink}
${project.liveLink ? `Live: ${project.liveLink}` : ""}
              `;
            }
            return `Project '${name}' not found`;
          }

          case "article": {
            const article = articles.find((a) =>
              a.title.toLowerCase().includes(name.toLowerCase())
            );
            if (article) {
              return `
Title: ${article.title}
Link: ${article.link}
              `;
            }
            return `Article '${name}' not found`;
          }

          default:
            return `Unknown type: ${type}`;
        }
      },
    };

    const whoami = {
      name: "whoami",
      description: "Display information about me",
      usage: "whoami",
      args: () => [],
      execute: () => {
        return `
Akash Kumar
=================
Backend Developer & Software Engineer

I build scalable APIs, distributed services, and real-time products with Node.js,
JavaScript/TypeScript, Python, databases, Kafka, Redis, and Docker.

Type 'about' for more information or 'contact' to get in touch.
        `;
      },
    };

    const pwd = {
      name: "pwd",
      description: "Print current section",
      usage: "pwd",
      args: () => [],
      execute: () => `Current section: ${activeSection}`,
    };

    const commands: Record<string, Command> = {
      cd,
      ls,
      cat,
      clear,
      whoami,
      pwd,
    } as const;

    return commands;
  }, [setActiveSection, activeSection, projects]);
};

/**
 * Custom hook that provides content-related commands for exploring portfolio sections.
 *
 * This hook offers commands to explore different aspects of the portfolio:
 * - skills: Browse technical skills by category (languages, frameworks, databases, tools)
 * - projects: View projects and their details
 * - articles: Read articles written by the portfolio owner
 * - contact: Get contact information
 * - about: Learn more about the portfolio owner's background and experience
 *
 * @returns {Record<string, Command>} A collection of command objects for exploring portfolio content
 */
export const useSectionCommands = () => {
  const { projects } = useProject();
  return useMemo(() => {
    const skillsCMD = {
      name: "skills",
      description: "List my technical skills",
      usage: "skills [category]",
      args: () => ["languages", "frameworks", "databases", "tools"],
      execute: (args: string[]) => {
        const category = args[0]?.toLowerCase();

        if (category) {
          switch (category) {
            case "languages":
              return _arrayJoin([...languages]);
            case "frameworks":
              return Object.entries(frameworks)
                .map(([lang, fws]) => `${lang}: ${_arrayJoin([...fws])}`)
                .join("\n");
            case "databases":
              return _arrayJoin([...databases]);
            case "tools":
              return _arrayJoin([...tools]);
            default:
              return `Unknown category: ${category}`;
          }
        }

        return `
Skills Categories:
-----------------
languages   - Programming languages
frameworks  - Frameworks and libraries
databases   - Database systems
tools       - Development tools

Use "skills [category]" to see specific skills.
        `;
      },
    };

    const projectsCMD = {
      name: "projects",
      description: "Show my projects",
      usage: "projects [name]",
      args: () => projects.map((p) => p.name),
      execute: (args: string[]) => {
        const name = args.join(" ");

        if (name) {
          const project = projects.find(
            (p) => p.name.toLowerCase() === name.toLowerCase()
          );

          if (project) {
            return `
Project: ${project.name}
----------------------------
${project.description}

Technologies: ${project.technologies
              .filter((t) => technologies[t])
              .map((t) => technologies[t].name)
              .join(", ")}

Key Features:
${
  project.keyFeatures?.map((f) => `- ${f}`).join("\n") ||
  "No features documented"
}

Links:
- GitHub: ${project.githubLink}
${project.liveLink ? `- Live Demo: ${project.liveLink}` : ""}
            `;
          }
          return `Project '${name}' not found. Use 'projects' to see all projects.`;
        }

        return `
Projects:
--------
${projects.map((p) => p.name).join("\n")}

Use "projects [name]" to see details of a specific project.
        `;
      },
    };

    const articlesCMD = {
      name: "articles",
      description: "View my articles",
      usage: "articles [number]",
      args: () => articles.map((_, i) => (i + 1).toString()),
      execute: (args: string[]) => {
        const index = parseInt(args[0]);

        if (!isNaN(index) && index > 0 && index <= articles.length) {
          const article = articles[index - 1];
          return `
Article: ${article.title}
------------------------

Link: ${article.link}
          `;
        }

        return `
Articles:
--------
${articles.map((a, i) => `${i + 1}. ${a.title}`).join("\n")}

Use "articles [number]" to see details of a specific article.
        `;
      },
    };

    const contactCMD = {
      name: "contact",
      description: "View my contact information",
      usage: "contact",
      args: () => [],
      execute: () => {
        return `
Contact Information:
------------------
GitHub: https://github.com/Akash1xe
Location: Noida, Uttar Pradesh, India
        `;
      },
    };

    const aboutCMD = {
      name: "about",
      description: "Show information about me",
      usage: "about",
      args: () => [],
      execute: () => {
        return `
About Akash:
------------
I'm a backend-focused software engineer interested in distributed systems,
microservices, system design, real-time products, open source, and GenAI.

I enjoy turning complex requirements into reliable services with clean APIs,
thoughtful data models, caching, event-driven processing, and observability.

Type 'projects' to see what I've built, or 'skills' to see my technical expertise.
        `;
      },
    };

    const commands: Record<string, Command> = {
      skills: skillsCMD,
      projects: projectsCMD,
      articles: articlesCMD,
      contact: contactCMD,
      about: aboutCMD,
    };

    return commands;
  }, [projects]);
};

/**
 * Custom hook that provides utility commands for searching and external navigation.
 *
 * This hook offers helpful utility commands:
 * - find: Search across all portfolio content (projects, articles, skills)
 * - open: Open external links in a new browser tab (GitHub, LinkedIn, Twitter, projects, articles)
 *
 * These commands help users discover content and access external resources related to the portfolio.
 *
 * @returns {Record<string, Command>} A collection of utility command objects
 */
export const useUtilityCommands = () => {
  const { projects } = useProject();
  return useMemo(() => {
    const findCMD = {
      name: "find",
      description: "Search across all content",
      usage: "find [query]",
      args: () => [],
      execute: (args: string[]) => {
        const query = args.join(" ").toLowerCase();
        if (!query) return "Please provide a search term";

        const results = [];

        // Search projects
        const matchedProjects = projects.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.technologies.some(
              (t) =>
                technologies[t] &&
                technologies[t].name.toLowerCase().includes(query)
            )
        );

        if (matchedProjects.length) {
          results.push(`Projects (${matchedProjects.length}):`);
          matchedProjects.forEach((p) => results.push(`  - ${p.name}`));
        }

        // Search articles
        const matchedArticles = articles.filter((a) =>
          a.title.toLowerCase().includes(query)
        );

        if (matchedArticles.length) {
          results.push(`Articles (${matchedArticles.length}):`);
          matchedArticles.forEach((a) => results.push(`  - ${a.title}`));
        }

        // Search skills
        const matchedSkills = Object.keys(technologies).filter((t) =>
          t.toLowerCase().includes(query)
        );

        if (matchedSkills.length) {
          results.push(`Skills (${matchedSkills.length}):`);
          results.push(`  - ${matchedSkills.join(", ")}`);
        }

        return results.length ? results.join("\n") : "No results found";
      },
    };

    const openCMD = {
      name: "open",
      description: "Open a link in a new tab",
      usage: "open [type] [name]",
      args: (existingArgs?: string[]) => {
        if (!existingArgs || existingArgs.length === 0) {
          return ["github", "project", "article"];
        }

        const type = existingArgs[0];
        if (type === "project") return projects.map((p) => p.name);
        else if (type === "article") return articles.map((a) => a.title);
        return [];
      },
      execute: (args: string[]) => {
        const [type, ...nameParts] = args;
        const name = nameParts.join(" ");

        switch (type) {
          case "github":
            window.open(profile.githubUrl, "_blank");
            return "Opening GitHub profile...";

          case "project": {
            const project = projects.find(
              (p) => p.name.toLowerCase() === name.toLowerCase()
            );
            if (project) {
              window.open(project.githubLink, "_blank");
              return `Opening project: ${project.name}`;
            }
            return `Project '${name}' not found`;
          }

          case "article": {
            const article = articles.find((a) =>
              a.title.toLowerCase().includes(name.toLowerCase())
            );
            if (article) {
              window.open(article.link, "_blank");
              return `Opening article: ${article.title}`;
            }
            return `Article '${name}' not found`;
          }
          default:
            return `Unknown type: ${type}`;
        }
      },
    };

    const commands: Record<string, Command> = {
      find: findCMD,
      open: openCMD,
    } as const;

    return commands;
  }, [projects]);
};

export const useCompetitiveProgrammingCommands = () =>
  useMemo<Record<string, Command>>(() => {
    const openProfile = (url: string, label: string) => {
      window.open(url, "_blank", "noopener,noreferrer");
      return `Opening ${label} profile for akash1xe…`;
    };

    return {
      "cp-status": {
        name: "cp-status",
        description: "Show competitive-programming service health",
        usage: "cp-status",
        args: () => [],
        execute: () => `Competitive Programming — akash1xe
----------------------------------
Total Solved       ${cp.profile.totalSolved}+
Primary Language   ${cp.profile.primaryLanguage}
Platforms          LeetCode · Codeforces
Current Focus      ${cp.profile.focus.join(" · ")}

leetcode-service   ● ${cp.services.leetcode === "connected" ? "Connected" : "Fallback ready"}
codeforces-service ● ${cp.services.codeforces === "connected" ? "Connected" : "Fallback ready"}
stats-cache        ● Healthy

Run: cd competitive-programming`,
      },
      leetcode: {
        name: "leetcode",
        description: "Open the akash1xe LeetCode profile",
        usage: "leetcode",
        args: () => [],
        execute: () => openProfile(cp.leetcode.profileUrl, "LeetCode"),
      },
      codeforces: {
        name: "codeforces",
        description: "Open the akash1xe Codeforces profile",
        usage: "codeforces",
        args: () => [],
        execute: () => openProfile(cp.codeforces.profileUrl, "Codeforces"),
      },
      "recent-submissions": {
        name: "recent-submissions",
        description: "List recently accepted problems",
        usage: "recent-submissions",
        args: () => [],
        execute: () =>
          [
            "Recent accepted submissions",
            "---------------------------",
            ...cp.leetcode.recentAccepted.slice(0, 3).map((item) => `[LC] ${item.title}`),
            ...cp.codeforces.recentAccepted.slice(0, 3).map((item) => `[CF] ${item.title} (${item.rating ?? "unrated"})`),
          ].join("\n"),
      },
      "topic-stats": {
        name: "topic-stats",
        description: "Show solved counts for a topic",
        usage: "topic-stats [topic]",
        args: () => [...new Set([...cp.leetcode.topics, ...cp.codeforces.tags].map((topic) => topic.name.toLowerCase()))],
        execute: (args) => {
          const query = args.join(" ").toLowerCase();
          if (!query) return "Usage: topic-stats binary-search";
          const normalized = query.replace(/-/g, " ");
          const matches = [...cp.leetcode.topics, ...cp.codeforces.tags].filter((topic) =>
            topic.name.toLowerCase().includes(normalized)
          );
          if (!matches.length) return `No tracked topic matched '${query}'.`;
          return matches.map((topic) => `${topic.name.padEnd(28)} ${topic.count} solved`).join("\n");
        },
      },
    };
  }, []);

/**
 * Helper function to join array elements with a delimiter.
 *
 * @param {string[]} arr - The array of strings to join
 * @param {string} delimiter - The delimiter to use between elements (default: ", ")
 * @returns {string} The joined string
 */
const _arrayJoin = (arr: string[], delimiter: string = ", ") => {
  return arr.join(delimiter);
};
