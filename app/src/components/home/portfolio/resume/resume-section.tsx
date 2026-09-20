import { Download, FileText } from "lucide-react";
import React from "react";

import { OutlineNode } from "@/components/home/editor/outline";
import Section from "@/components/home/editor/section/portfolio-section";
import { useGitComponent } from "@/hooks/use-git-component";

import ResumeExperience from "./resume-experience";
import ResumeHeader from "./resume-header";
import ResumeProjects from "./resume-projects";
import ResumeSkills from "./resume-skills";

const ResumeSection: React.FC = () => {
  const ref = useGitComponent(ResumeSection);

  return (
    <Section
      id="resume"
      label="profile.ts"
      title="Professional Profile"
      description="Backend work, open source, projects, and technical strengths."
      headerIcon={FileText}
      icon="code"
      showHeader
      className="h-full"
    >
      <div
        ref={ref}
        className="max-w-[850px] mx-auto p-8 sm:p-12 md:p-16 bg-ctp-crust border border-ctp-surface2 rounded-xl shadow-2xl font-mono ring-1 ring-ctp-surface1/50 my-6"
      >
        <a href="/api/resume" target="_blank" rel="noreferrer" className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-ctp-blue/30 bg-ctp-blue/10 px-4 py-3 text-sm font-semibold text-ctp-blue hover:bg-ctp-blue/20">
          <Download className="h-4 w-4" /> View or download uploaded resume
        </a>
        <OutlineNode
          label="Resume Content"
          icon={<FileText className="w-3 h-3" />}
          iconColor="lavender"
        >
          <ResumeHeader />

          <div className="flex flex-col gap-8">
            <ResumeExperience />

            <div>
              <ResumeProjects />
            </div>

            <div>
              <ResumeSkills />
            </div>
          </div>
        </OutlineNode>
      </div>
    </Section>
  );
};

export default ResumeSection;
