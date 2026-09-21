import { Code2, ExternalLink, Github } from "lucide-react";
import React from "react";

import { OutlineNode } from "@/components/home/editor/outline";
import { Heading, Text } from "@/components/ui/text";
import { useGitComponent } from "@/hooks/use-git-component";

interface Project {
  name: string;
  tagline: string;
  technologies: string[];
  githubLink?: string;
  liveLink?: string;
}

const featuredProjects: Project[] = [
  {
    name: "CargoFlow",
    tagline: "Distributed logistics and cargo-capacity booking platform",
    technologies: ["Node.js", "Kafka", "PostgreSQL", "Redis", "Docker"],
    githubLink: "https://github.com/Akash1xe/CARGO",
  },
  {
    name: "Samvid",
    tagline: "Civic-tech product built for practical community impact",
    technologies: ["React", "JavaScript", "Node.js"],
    githubLink: "https://github.com/Akash1xe/Hackathon",
    liveLink: "https://samvid-india.vercel.app/",
  },
  {
    name: "BidX",
    tagline: "Real-time auction platform with event-driven bidding",
    technologies: ["Node.js", "React", "MongoDB", "Socket.IO"],
    githubLink: "https://github.com/Akash1xe/BIDX",
  },
  {
    name: "SafeRoute",
    tagline: "Safety-aware route planning and navigation",
    technologies: ["TypeScript", "React", "Node.js"],
    githubLink: "https://github.com/Akash1xe/SafeRoute",
  },
  {
    name: "RentX",
    tagline: "Full-stack rental marketplace",
    technologies: ["React", "Node.js", "MongoDB"],
    githubLink: "https://github.com/Akash1xe/Rental",
  },
  {
    name: "IRCTC Backend",
    tagline: "Railway search and booking API service",
    technologies: ["Node.js", "REST", "MySQL"],
    githubLink: "https://github.com/Akash1xe/irctc-backend",
  },
  {
    name: "SentinelAI",
    tagline: "AI-assisted monitoring and analysis",
    technologies: ["Python", "FastAPI", "React"],
    githubLink: "https://github.com/Akash1xe/sentenintalAI",
  },
];

const ResumeProjects: React.FC = () => {
  const ref = useGitComponent(ResumeProjects);

  return (
    <div
      ref={ref}
      className="animate-fadeIn"
      style={{ animationDelay: "0.3s" }}
    >
      <OutlineNode
        label="Projects"
        icon={<Code2 className="w-3 h-3" />}
        iconColor="mauve"
      >
        <Heading
          as="h4"
          className="mb-4 text-xl border-b-2 border-ctp-surface2 pb-2 uppercase tracking-widest text-ctp-text"
        >
          Notable Projects
        </Heading>

        <div className="flex flex-col gap-5">
          {featuredProjects.map((project) => (
            <div key={project.name} className="flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-0.5">
                <Text
                  as="span"
                  variant="caption"
                  className="text-ctp-text font-bold text-base"
                >
                  {project.name}
                </Text>
                <div className="flex items-center gap-1 shrink-0">
                  {project.githubLink && (
                    <a
                      href={project.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ctp-overlay0 hover:text-ctp-text transition-colors"
                    >
                      <Github className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {project.liveLink && (
                    <a
                      href={project.liveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ctp-overlay0 hover:text-ctp-text transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              <Text
                variant="muted"
                className="text-xs leading-snug mb-2 text-ctp-subtext0"
              >
                {project.tagline}
              </Text>

              <div className="flex flex-wrap gap-1">
                {project.technologies.map((tech, index) => (
                  <span key={tech} className="text-xs text-ctp-overlay0">
                    {tech}
                    {index < project.technologies.length - 1 ? " • " : ""}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </OutlineNode>
    </div>
  );
};

export default ResumeProjects;
