import { Code2, Database, Layers, Server } from "lucide-react";
import { FaJava, FaTools } from "react-icons/fa";
import {
  SiApachekafka,
  SiCplusplus,
  SiDocker,
  SiElasticsearch,
  SiExpress,
  SiFastapi,
  SiGit,
  SiJavascript,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiPostgresql,
  SiPython,
  SiReact,
  SiRedis,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";

export const skillCategories = [
  {
    id: "languages",
    title: "Languages",
    icon: <Code2 className="w-5 h-5" />,
    color: "blue",
    description: "Core programming languages",
    skills: [
      {
        name: "C++",
        icon: <SiCplusplus className="w-5 h-5" />,
        color: "blue",
      },
      {
        name: "JavaScript",
        icon: <SiJavascript className="w-5 h-5" />,
        color: "yellow",
      },
      {
        name: "TypeScript",
        icon: <SiTypescript className="w-5 h-5" />,
        color: "blue",
      },
      {
        name: "Python",
        icon: <SiPython className="w-5 h-5" />,
        color: "yellow",
      },
      {
        name: "Java",
        icon: <FaJava className="w-5 h-5" />,
        color: "red",
      },
    ],
  },
  {
    id: "frontend",
    title: "Frontend",
    icon: <Layers className="w-5 h-5" />,
    color: "sapphire",
    description: "UI/UX frameworks & libraries",
    skills: [
      {
        name: "React",
        icon: <SiReact className="w-5 h-5" />,
        color: "sapphire",
      },
      {
        name: "Next.js",
        icon: <SiNextdotjs className="w-5 h-5" />,
        color: "text",
      },
      {
        name: "Tailwind CSS",
        icon: <SiTailwindcss className="w-5 h-5" />,
        color: "teal",
      },
    ],
  },
  {
    id: "backend",
    title: "Backend",
    icon: <Server className="w-5 h-5" />,
    color: "green",
    description: "Server-side frameworks",
    skills: [
      {
        name: "Express",
        icon: <SiExpress className="w-5 h-5" />,
        color: "text",
      },
      {
        name: "FastAPI",
        icon: <SiFastapi className="w-5 h-5" />,
        color: "green",
      },
      {
        name: "Node.js",
        icon: <SiJavascript className="w-5 h-5" />,
        color: "green",
      },
    ],
  },
  {
    id: "databases",
    title: "Databases",
    icon: <Database className="w-5 h-5" />,
    color: "mauve",
    description: "Data storage solutions",
    skills: [
      {
        name: "MySQL",
        icon: <SiMysql className="w-5 h-5" />,
        color: "blue",
      },
      {
        name: "PostgreSQL",
        icon: <SiPostgresql className="w-5 h-5" />,
        color: "blue",
      },
      {
        name: "MongoDB",
        icon: <SiMongodb className="w-5 h-5" />,
        color: "green",
      },
      {
        name: "Redis",
        icon: <SiRedis className="w-5 h-5" />,
        color: "red",
      },
      {
        name: "Elasticsearch",
        icon: <SiElasticsearch className="w-5 h-5" />,
        color: "yellow",
      },
    ],
  },
  {
    id: "tools",
    title: "DevOps & Tools",
    icon: <FaTools className="w-5 h-5" />,
    color: "peach",
    description: "Development & deployment tools",
    skills: [
      {
        name: "Docker",
        icon: <SiDocker className="w-5 h-5" />,
        color: "blue",
      },
      {
        name: "Kafka",
        icon: <SiApachekafka className="w-5 h-5" />,
        color: "text",
      },
      {
        name: "Git",
        icon: <SiGit className="w-5 h-5" />,
        color: "red",
      },
      {
        name: "Redis",
        icon: <SiRedis className="w-5 h-5" />,
        color: "red",
      },
    ],
  },
];

export const databases = ["PostgreSQL", "MongoDB", "MySQL", "Redis", "Elasticsearch"] as const;

export const tools = ["Kafka", "Redis", "Git", "Docker", "Vercel"] as const;

export const languages = [
  "C++",
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
] as const;

export const frameworks = [
  "React",
  "Next.js",
  "Tailwind CSS",
  "Express",
  "FastAPI",
] as const;
