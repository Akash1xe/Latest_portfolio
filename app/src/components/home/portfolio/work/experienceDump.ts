import type { WorkExperience } from "@/types";

export const experiences: WorkExperience[] = [
  {
    company: "Unleash",
    position: "Open-Source Contributor",
    duration: "Open Source",
    imageSrc: "https://github.com/Unleash.png",
    achievements: [
      {
        title: "Merged PR #12632",
        description: [
          "Fixed duplicate strategy parameter validation so invalid configuration is rejected reliably.",
        ],
        icon: "FaCodeBranch",
      },
      {
        title: "Production codebase contribution",
        description: [
          "Worked through review in a mature feature-management platform and shipped the accepted fix upstream.",
        ],
        icon: "FaCheckCircle",
      },
    ],
    technologies: ["typescript", "node", "react", "git"],
    companyUrl: "https://github.com/Unleash/unleash/pull/12632",
  },
  {
    company: "GrowthBook",
    position: "Open-Source Contributor",
    duration: "Open Source",
    imageSrc: "https://github.com/growthbook.png",
    achievements: [
      {
        title: "PR #6949",
        description: [
          "Added editable display names for tags; the contribution remains open for upstream review.",
        ],
        icon: "FaTags",
      },
      {
        title: "PR #6964",
        description: [
          "Added clear validation errors for unsupported URL redirect patterns; the contribution remains open.",
        ],
        icon: "FaLink",
      },
    ],
    technologies: ["typescript", "react", "node", "mongodb", "git"],
    companyUrl: "https://github.com/growthbook/growthbook/pulls?q=is%3Apr+author%3AAkash1xe",
  },
  {
    company: "AOSSIE / PicToPy",
    position: "Open-Source Contributor",
    duration: "Open Source",
    imageSrc: "https://github.com/AOSSIE-Org.png",
    achievements: [
      {
        title: "Submitted fixes and features",
        description: [
          "Proposed changes across navigation, image sharing, folder imports, favorites, smart albums, and file opening workflows.",
        ],
        icon: "FaCodeBranch",
      },
      {
        title: "Accurate contribution status",
        description: [
          "These pull requests were submitted and closed without merge; no merged-contribution claim is made.",
        ],
        icon: "FaInfoCircle",
      },
    ],
    technologies: ["python", "react", "fastapi", "git"],
    companyUrl: "https://github.com/AOSSIE-Org/PictoPy/pulls?q=is%3Apr+author%3AAkash1xe",
  },
];
