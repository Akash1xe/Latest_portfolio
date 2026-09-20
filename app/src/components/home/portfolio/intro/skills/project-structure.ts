export type FileItem = {
  name: string;
  type: "file" | "folder";
  children?: FileItem[];
  extension?: string;
  description?: string;
  color: string;
  delay: number;
  depth: number;
};

export const projectStructure: FileItem[] = [
  {
    name: "frontend",
    type: "folder",
    color: "text-ctp-blue",
    delay: 0,
    depth: 0,
    children: [
      {
        name: "components",
        type: "folder",
        color: "text-ctp-blue",
        delay: 200,
        depth: 1,
        children: [
          {
            name: "App.tsx",
            type: "file",
            extension: "tsx",
            color: "text-ctp-blue",
            delay: 400,
            depth: 2,
            description:
              "I build dynamic user interfaces with React & TypeScript",
          },
          {
            name: "Button.tsx",
            type: "file",
            extension: "tsx",
            color: "text-ctp-blue",
            delay: 500,
            depth: 2,
            description: "Reusable components with TypeScript for type safety",
          },
        ],
      },
      {
        name: "styles",
        type: "folder",
        color: "text-ctp-sapphire",
        delay: 300,
        depth: 1,
        children: [
          {
            name: "globals.css",
            type: "file",
            extension: "css",
            color: "text-ctp-sapphire",
            delay: 600,
            depth: 2,
            description: "Custom CSS for pixel-perfect designs",
          },
          {
            name: "tailwind.config.js",
            type: "file",
            extension: "js",
            color: "text-ctp-yellow",
            delay: 700,
            depth: 2,
            description: "I use Tailwind CSS for rapid UI development",
          },
        ],
      },
    ],
  },
  {
    name: "backend",
    type: "folder",
    color: "text-ctp-green",
    delay: 100,
    depth: 0,
    children: [
      {
        name: "server.js",
        type: "file",
        extension: "js",
        color: "text-ctp-green",
        delay: 800,
        depth: 1,
        description: "I build scalable REST APIs with Node.js & Express",
      },
      {
        name: "api.py",
        type: "file",
        extension: "py",
        color: "text-ctp-yellow",
        delay: 900,
        depth: 1,
        description:
          "I create machine learning backends with Python, FastAPI and libraries like langchain",
      },
      {
        name: "algorithms.cpp",
        type: "file",
        extension: "cpp",
        color: "text-ctp-blue",
        delay: 1000,
        depth: 1,
        description: "Competitive programming and data structures in C++",
      },
      {
        name: "events.kafka",
        type: "file",
        extension: "kafka",
        color: "text-ctp-peach",
        delay: 1050,
        depth: 1,
        description:
          "Event-driven services and reliable asynchronous workflows with Kafka",
      },
    ],
  },
  {
    name: "devops",
    type: "folder",
    color: "text-ctp-mauve",
    delay: 150,
    depth: 0,
    children: [
      {
        name: "Dockerfile",
        type: "file",
        extension: "docker",
        color: "text-ctp-sapphire",
        delay: 1100,
        depth: 1,
        description: "I containerize applications with Docker for deployment",
      },
      {
        name: "compose.yaml",
        type: "file",
        extension: "yaml",
        color: "text-ctp-mauve",
        delay: 1200,
        depth: 1,
        description: "I run multi-service applications with Docker Compose",
      },
      {
        name: ".gitignore",
        type: "file",
        extension: "git",
        color: "text-ctp-red",
        delay: 1300,
        depth: 1,
        description:
          "I use Git for version control and collaborative development",
      },
    ],
  },
];
