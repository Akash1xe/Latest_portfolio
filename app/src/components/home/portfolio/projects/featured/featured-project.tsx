import React, { useState } from "react";
import { FaAward, FaStar } from "react-icons/fa";

import Reveal from "@/components/animations/reveal/Reveal";
import GradientText from "@/components/ui/gradient-text";
import { Heading } from "@/components/ui/text";
import { useGitComponent } from "@/hooks/use-git-component";
import { useMobileContext } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

import styles from "./featured-project.module.css";
import ProjectContent from "./project-content";

interface FeaturedProjectProps {
  featuredProject: Project;
  handleProjectSelect: (project: Project) => void;
}
type Tab = "overview" | "features";

const FeaturedProject: React.FC<FeaturedProjectProps> = ({
  featuredProject,
  handleProjectSelect,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { isMobile } = useMobileContext();
  const gitRef = useGitComponent(FeaturedProject);

  return (
    <div ref={gitRef} className="mb-16 max-w-6xl mx-auto relative">
      <FeaturedHeader />
      <Reveal effect="zoom-in" duration={0.5}>
        <div className="overflow-hidden">
          <div className="relative">
            {/* Main content card */}
            <Reveal effect="fade-up" duration={0.6} delay={0.2}>
              <div
                className={cn(
                  "relative rounded-xl overflow-auto shadow-xl",
                  !isMobile && "bg-gradient-to-br from-ctp-mantle to-ctp-crust"
                )}
              >
                <div className="relative px-8 pt-8 pb-4">
                  {!isMobile && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-ctp-peach/20 text-ctp-peach border border-ctp-peach/10 text-xs font-semibold">
                      <FaStar className="text-ctp-peach" />
                      Featured
                    </div>
                  )}

                  <Reveal effect="slide-in" direction="up" duration={0.6}>
                    <Heading as="h2" className="text-pretty">
                      <GradientText from="peach" via="maroon" to="peach">
                        {featuredProject.name}
                      </GradientText>
                    </Heading>
                  </Reveal>
                </div>

                {/* Tab navigation */}
                <TabNavigation
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />

                <div
                  className={cn(
                    "p-8",
                    !isMobile &&
                      "bg-gradient-to-br from-ctp-mantle to-ctp-crust"
                  )}
                >
                  <div className="flex flex-col xl:flex-row gap-10 items-center">
                    <ProjectContent
                      activeTab={activeTab}
                      featuredProject={featuredProject}
                      handleProjectSelect={handleProjectSelect}
                    />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Reveal>
    </div>
  );
};

interface TabNavigationProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="flex">
      <button
        className={`px-6 py-2.5 text-sm font-medium transition-colors relative ${
          activeTab === "overview"
            ? "text-ctp-peach"
            : "text-ctp-subtext0 hover:text-ctp-text"
        }`}
        onClick={() => setActiveTab("overview")}
      >
        Overview
        {activeTab === "overview" && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-ctp-peach" />
        )}
      </button>
      <button
        className={`px-6 py-2.5 text-sm font-medium transition-colors relative ${
          activeTab === "features"
            ? "text-ctp-peach"
            : "text-ctp-subtext0 hover:text-ctp-text"
        }`}
        onClick={() => setActiveTab("features")}
      >
        Key Features
        {activeTab === "features" && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-ctp-peach" />
        )}
      </button>
    </div>
  );
};

/**
 * FeaturedHeader component displays the header for the featured project section.
 * It includes a title, an animated sparkles icon, a divider, and a button to toggle
 * the visibility of the featured project details.
 */
const FeaturedHeader: React.FC = () => {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={styles.sparkleIcon}>
        <div className="p-2 bg-gradient-to-r from-ctp-peach to-ctp-yellow rounded-full">
          <FaAward className="w-5 h-5 text-ctp-crust" />
        </div>
      </div>

      <Heading as="h3" className={styles.titleSlideIn}>
        <GradientText from="peach" to="yellow">
          Featured Project
        </GradientText>
      </Heading>

      <div
        className={`h-px flex-grow ${styles.lineGrow}`}
        style={{
          background:
            "linear-gradient(90deg, rgba(250,179,135,0.5) 0%, rgba(137,180,250,0) 100%)",
        }}
      />
    </div>
  );
};

export default FeaturedProject;
