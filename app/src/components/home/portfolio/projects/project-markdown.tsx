import { Download, ExternalLink, FileText, Image as ImageIcon, Play } from "lucide-react";
import React, { useEffect } from "react";
import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import { HiOutlineBookOpen, HiOutlineCode } from "react-icons/hi";

import { technologies } from "@/components/base/technologies";
import { MarkdownRender } from "@/components/home/editor/markdown-renderer";
import { Heading, Text } from "@/components/ui/text";
import { useSectionNav } from "@/hooks/use-editor-actions";
import { useGitComponent } from "@/hooks/use-git-component";
import { useMarkdownOutlineBridge } from "@/hooks/use-markdown-outline-bridge";
import useMobile from "@/hooks/use-mobile";
import { useSwipe } from "@/hooks/use-swipe";
import { cn } from "@/lib/utils";
import { useMarkdownHeadingStore } from "@/store";
import useProjectStore from "@/store/projects/projects-store";
import type { ProjectAsset, ProjectDeepDive } from "@/types";
import { getProjectSlug } from "@/utils/project-slug";

const COVER_GRADIENTS = [
  "from-ctp-mauve/40 via-ctp-mantle to-ctp-base",
  "from-ctp-blue/40 via-ctp-mantle to-ctp-base",
  "from-ctp-green/40 via-ctp-mantle to-ctp-base",
  "from-ctp-peach/40 via-ctp-mantle to-ctp-base",
  "from-ctp-pink/40 via-ctp-mantle to-ctp-base",
  "from-ctp-teal/40 via-ctp-mantle to-ctp-base",
  "from-ctp-yellow/40 via-ctp-mantle to-ctp-base",
  "from-ctp-red/40 via-ctp-mantle to-ctp-base",
] as const;

function pickGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return COVER_GRADIENTS[hash % COVER_GRADIENTS.length];
}

const SectionHeading: React.FC<{
  children: React.ReactNode;
  color?: string;
}> = ({ children, color = "bg-ctp-blue" }) => (
  <div className="flex items-center gap-3 mt-10 mb-4">
    <span className={cn("w-0.5 h-4 rounded-full shrink-0", color)} />
    <Heading as="h6">{children}</Heading>
    <span className="flex-1 border-t border-ctp-surface1" />
  </div>
);

const CoverBand: React.FC<{ coverImage?: string; name: string }> = ({
  coverImage,
  name,
}) => {
  const gradient = pickGradient(name);

  if (coverImage) {
    return (
      <div className="relative w-full h-44 overflow-hidden rounded-t-xl">
        <img
          src={coverImage}
          alt={`${name} cover`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ctp-base/40 to-ctp-base/90" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full h-36 rounded-t-xl bg-gradient-to-b",
        gradient
      )}
    >
      {/* Subtle noise texture via repeating tiny radial */}
      <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle,_rgb(var(--ctp-overlay2))_1px,_transparent_1px)] [background-size:20px_20px]" />
    </div>
  );
};

const PageIcon: React.FC<{ icon?: string; name: string }> = ({
  icon,
  name,
}) => {
  const label = icon ?? name.charAt(0).toUpperCase();
  const isEmoji = icon !== undefined;

  return (
    <div
      className={cn(
        "relative -mt-14 ml-6 flex items-center justify-center z-10",
        "w-24 h-24 rounded-2xl shadow-md ring-[6px] ring-ctp-base",
        "bg-ctp-base text-5xl select-none",
        !isEmoji && "bg-ctp-surface0 text-ctp-mauve font-bold text-4xl"
      )}
    >
      {label}
    </div>
  );
};

const DeepDiveLoading: React.FC<{ name: string; icon?: string }> = ({
  name,
  icon,
}) => (
  <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
    {icon && <span className="text-3xl">{icon}</span>}
    <p className="text-sm text-ctp-subtext1 font-source font-medium">{name}</p>
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-ctp-blue animate-pulse"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </div>
    <p className="text-xs text-ctp-subtext0 font-source">
      Downloading{" "}
      <code className="px-1 py-0.5 rounded bg-ctp-surface1/50 text-ctp-blue font-mono">
        .md
      </code>{" "}
      file…
    </p>
  </div>
);

const FeatureCard: React.FC<{ feature: string; index: number }> = ({
  feature,
}) => {
  let title = feature;
  let description = "";
  const splitIndex = feature.indexOf(": ");
  if (splitIndex !== -1) {
    title = feature.substring(0, splitIndex);
    description = feature.substring(splitIndex + 2);
  }

  return (
    <li className="relative pl-5 py-0.5">
      <div className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-ctp-surface2" />
      <span className="text-sm font-medium text-ctp-text">{title}</span>
      {description && (
        <span className="text-[13px] text-ctp-subtext0 block mt-1 leading-relaxed">
          {description}
        </span>
      )}
    </li>
  );
};

const OverviewTab: React.FC<{
  description: string;
  keyFeatures: string[];
}> = ({ description, keyFeatures }) => (
  <div className="px-6 pb-12 space-y-10 font-source">
    {/* Description */}
    <div className="space-y-4">
      <SectionHeading color="bg-ctp-mauve">Project Overview</SectionHeading>
      <div className="p-6 rounded-2xl bg-gradient-to-br from-ctp-surface0/20 to-transparent border border-ctp-surface0/50">
        <Text variant="subtitle" className="leading-relaxed text-ctp-subtext1">
          {description}
        </Text>
      </div>
    </div>

    {/* Features */}
    {keyFeatures && keyFeatures.length > 0 && (
      <div className="space-y-6">
        <SectionHeading color="bg-ctp-green">Key Features</SectionHeading>
        <ul className="grid grid-cols-1 sm:grid-cols-1 gap-y-4">
          {keyFeatures.map((feature, i) => (
            <FeatureCard key={i} feature={feature} index={i} />
          ))}
        </ul>
      </div>
    )}
  </div>
);

type Tab = "overview" | "deepdive";

const TabBar: React.FC<{
  active: Tab;
  onChange: (t: Tab) => void;
}> = ({ active, onChange }) => {
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "overview",
      label: "Overview",
      icon: <HiOutlineBookOpen className="w-3.5 h-3.5" />,
    },
    {
      id: "deepdive",
      label: "Deep Dive",
      icon: <HiOutlineCode className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="flex items-center gap-1 px-6 mt-6 border-b border-ctp-surface1 font-source">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 transition-colors -mb-px",
            active === tab.id
              ? "border-ctp-blue text-ctp-blue"
              : "border-transparent text-ctp-subtext0 hover:text-ctp-text"
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

type LoadState = "loading" | "loaded" | "error";

const buildDeepDiveMarkdown = (deepDive: ProjectDeepDive) => {
  const sections: string[] = [];
  if (deepDive.overview.trim()) sections.push(`# Project deep dive\n\n${deepDive.overview.trim()}`);
  if (deepDive.research.trim()) sections.push(`# Research before building\n\n${deepDive.research.trim()}`);
  if (deepDive.technologyDecisions.length > 0) {
    const decisions = deepDive.technologyDecisions
      .filter((decision) => decision.technology.trim())
      .map((decision) => `## ${decision.technology}\n\n**Used for:** ${decision.purpose || "—"}\n\n**Why this choice:** ${decision.reason || "—"}`)
      .join("\n\n");
    if (decisions) sections.push(`# Technology decisions\n\n${decisions}`);
  }
  if (deepDive.architecture.trim()) sections.push(`# Architecture and data flow\n\n${deepDive.architecture.trim()}`);
  if (deepDive.implementation.trim()) sections.push(`# Implementation notes\n\n${deepDive.implementation.trim()}`);
  return sections.join("\n\n---\n\n");
};

const assetCategoryLabels: Record<ProjectAsset["category"], string> = {
  research: "Research material",
  architecture: "Architecture diagrams",
  demo: "Product demos",
  documentation: "Documentation",
};

const AssetLibrary: React.FC<{ assets: ProjectAsset[] }> = ({ assets }) => {
  if (assets.length === 0) return null;
  const categories = (["research", "architecture", "demo", "documentation"] as const)
    .map((category) => ({ category, assets: assets.filter((asset) => asset.category === category) }))
    .filter((group) => group.assets.length > 0);

  return (
    <div className="mt-12 space-y-10">
      {categories.map((group) => (
        <section key={group.category}>
          <SectionHeading color="bg-ctp-teal">{assetCategoryLabels[group.category]}</SectionHeading>
          <div className="grid gap-4 md:grid-cols-2">
            {group.assets.map((asset) => {
              const isDirectVideo = asset.storage === "database" || /\.(mp4|webm)(\?.*)?$/i.test(asset.url);
              return (
                <article key={asset.id} className="overflow-hidden rounded-2xl border border-ctp-surface1 bg-ctp-mantle/60">
                  {asset.type === "image" ? (
                    <a href={asset.url} target="_blank" rel="noreferrer" className="block bg-ctp-crust">
                      <img src={asset.url} alt={asset.caption || asset.title} loading="lazy" className="h-56 w-full object-contain" />
                    </a>
                  ) : null}
                  {asset.type === "video" && isDirectVideo ? (
                    <video controls preload="metadata" className="h-56 w-full bg-black object-contain">
                      <source src={asset.url} type={asset.mimeType} />
                    </video>
                  ) : null}
                  {asset.type !== "image" && !(asset.type === "video" && isDirectVideo) ? (
                    <a href={asset.url} target="_blank" rel="noreferrer" className="flex h-36 items-center justify-center gap-3 bg-ctp-crust text-ctp-blue hover:text-ctp-sky">
                      {asset.type === "video" ? <Play className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
                      <span className="text-sm font-semibold">{asset.type === "video" ? "Open video" : "Open document"}</span>
                    </a>
                  ) : null}
                  <div className="flex items-start gap-3 p-4">
                    <div className="rounded-lg bg-ctp-surface0 p-2 text-ctp-blue">
                      {asset.type === "image" ? <ImageIcon className="h-4 w-4" /> : asset.type === "video" ? <Play className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1"><h4 className="text-sm font-semibold text-ctp-text">{asset.title}</h4>{asset.caption ? <p className="mt-1 text-xs leading-5 text-ctp-subtext0">{asset.caption}</p> : null}</div>
                    <a href={asset.url} target="_blank" rel="noreferrer" aria-label={`Open ${asset.title}`} className="rounded-lg p-2 text-ctp-overlay1 hover:bg-ctp-surface0 hover:text-ctp-blue"><ExternalLink className="h-4 w-4" /></a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

const StructuredDeepDive: React.FC<{ deepDive: ProjectDeepDive }> = ({ deepDive }) => {
  const markdown = buildDeepDiveMarkdown(deepDive);
  return (
    <div className="px-6 pb-12 font-sans">
      {markdown ? <MarkdownRender markdown={markdown} /> : <p className="py-16 text-center text-sm text-ctp-subtext0">This deep dive is being prepared.</p>}
      <AssetLibrary assets={deepDive.assets} />
    </div>
  );
};

interface ProjectMarkdownProps {
  projectId: string;
}

const ProjectMarkdown: React.FC<ProjectMarkdownProps> = ({ projectId }) => {
  const ref = useGitComponent(ProjectMarkdown);
  const project = useProjectStore((state) =>
    state.projects.find((p) => p.name === projectId)
  );
  const allProjects = useProjectStore((state) => state.projects);
  const { openProject } = useSectionNav();
  const { isMobile } = useMobile();

  const currentProjectIndex = allProjects.findIndex(
    (p) => p.name === projectId
  );
  const projectSwipeHandlers = useSwipe({
    disabled: !isMobile,
    onSwipeLeft: () => {
      if (currentProjectIndex < allProjects.length - 1)
        openProject(allProjects[currentProjectIndex + 1]);
    },
    onSwipeRight: () => {
      if (currentProjectIndex > 0)
        openProject(allProjects[currentProjectIndex - 1]);
    },
  });

  const slug = project ? getProjectSlug(project.name) : "";
  const markdown = useProjectStore((s) => s.markdownCache[slug] ?? "");
  const loadState = useProjectStore(
    (s) => (s.markdownStates[slug] as LoadState) ?? "loading"
  );

  const [activeTab, setActiveTab] = React.useState<Tab>("overview");
  useMarkdownOutlineBridge(project?.name ?? projectId);
  const setIsDeepDive = useMarkdownHeadingStore((s) => s.setIsDeepDive);
  const setActiveHeadings = useMarkdownHeadingStore((s) => s.setActiveHeadings);

  useEffect(() => {
    setIsDeepDive(activeTab === "deepdive");
    if (activeTab !== "deepdive") {
      setActiveHeadings({ h1: null, h2: null, h3: null });
    }
  }, [activeTab, setIsDeepDive, setActiveHeadings]);

  useEffect(() => {
    return () => {
      setIsDeepDive(false);
      setActiveHeadings({ h1: null, h2: null, h3: null });
    };
  }, [setIsDeepDive, setActiveHeadings]);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full text-ctp-overlay0 font-source text-sm">
        Loading project…
      </div>
    );
  }

  return (
    <div ref={ref}>
      <article
        className="max-w-4xl mx-auto font-source text-sm text-ctp-text leading-relaxed mt-4"
        {...projectSwipeHandlers}
      >
        <CoverBand coverImage={project.coverImage} name={project.name} />
        <PageIcon icon={project.icon} name={project.name} />

        <div className="px-6 mt-6 mb-4 font-source">
          <Heading as="h1">{project.name}</Heading>
          {project.tagline && (
            <Text variant="lead" className="mt-3">
              {project.tagline}
            </Text>
          )}
        </div>

        <div className="flex items-center gap-3 px-6 mt-3 font-source">
          {project.githubLink &&
            project.githubLink !== "private-repository" && (
              <a
                href={project.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-ctp-subtext1 hover:text-ctp-mauve transition-colors"
              >
                <FaGithub className="w-3.5 h-3.5" />
                GitHub
              </a>
            )}
          {project.liveLink && (
            <>
              <span className="text-ctp-surface2">·</span>
              <a
                href={project.liveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-ctp-subtext1 hover:text-ctp-blue transition-colors"
              >
                <FaExternalLinkAlt className="w-3 h-3" />
                Live Demo
              </a>
            </>
          )}
        </div>

        {project.technologies.length > 0 && (
          <div className="px-6">
            <SectionHeading color="bg-ctp-yellow">Tech Stack</SectionHeading>
            <div className="flex flex-wrap gap-2 font-source">
              {project.technologies.map((tech) => (
                <div
                  key={tech}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-ctp-surface1/15 hover:bg-ctp-surface1/30 rounded-md transition-all duration-200 group/tech"
                >
                  <div className="flex-shrink-0 flex items-center justify-center group-hover/tech:scale-110 transition-transform duration-200">
                    <div className="w-3.5 h-3.5 flex items-center justify-center">
                      {technologies[tech].icon}
                    </div>
                  </div>
                  <span className="text-[11px] sm:text-sm text-ctp-subtext1 group-hover/tech:text-ctp-text font-medium transition-colors duration-200 -mt-[1px]">
                    {technologies[tech].name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab bar */}
        <TabBar active={activeTab} onChange={setActiveTab} />

        {/* Tab panels */}
        {activeTab === "overview" && (
          <div className="mt-6">
            <OverviewTab
              description={project.description ?? ""}
              keyFeatures={(project.keyFeatures as string[]) ?? []}
            />
          </div>
        )}

        {activeTab === "deepdive" && (
          <div className="mt-6">
            {project.deepDive?.published ? (
              <StructuredDeepDive deepDive={project.deepDive} />
            ) : null}

            {!project.deepDive?.published && loadState === "loading" && (
              <DeepDiveLoading name={project.name} icon={project.icon} />
            )}

            {!project.deepDive?.published && loadState === "loaded" && markdown && (
              <div className="px-6 pb-10 font-sans" data-git-component={slug}>
                <MarkdownRender markdown={markdown} />
              </div>
            )}

            {!project.deepDive?.published && loadState === "error" && (
              <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
                <div className="text-5xl">🚧</div>
                <div className="flex flex-col gap-1">
                  <Text
                    variant="subtitle"
                    className="text-ctp-subtext0 font-semibold"
                  >
                    Deep Dive Coming Soon
                  </Text>
                  <Text variant="caption" className="text-ctp-subtext1">
                    The write-up for this project is still being drafted. Check
                    back later!
                  </Text>
                </div>
              </div>
            )}
          </div>
        )}
      </article>
    </div>
  );
};

export default ProjectMarkdown;
