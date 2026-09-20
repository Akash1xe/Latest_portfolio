import { Github, User } from "lucide-react";
import React from "react";

import { OutlineNode } from "@/components/home/editor/outline";
import { Heading, Text } from "@/components/ui/text";
import { usePortfolioContent } from "@/features/portfolio-content/portfolio-content-context";
import { useGitComponent } from "@/hooks/use-git-component";

const ResumeHeader: React.FC = () => {
  const ref = useGitComponent(ResumeHeader);
  const { content } = usePortfolioContent();
  const { profile } = content;
  const contacts = profile.githubUrl ? [{ icon: Github, label: profile.githubUrl.replace(/^https?:\/\//, ""), href: profile.githubUrl }] : [];

  return (
    <div
      ref={ref}
      className="border-b border-ctp-surface1 pb-6 mb-6 animate-fadeIn"
    >
      <OutlineNode
        label="Profile"
        icon={<User className="w-3 h-3" />}
        iconColor="teal"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <Heading
              as="h1"
              className="text-3xl md:text-4xl font-extrabold text-ctp-text tracking-tight"
            >
              {profile.name}
            </Heading>
            <Text variant="lead" className="mt-1 text-ctp-subtext0  text-base">
              {profile.role}
            </Text>
          </div>

        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6">
          {contacts.map(({ icon: Icon, label, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-ctp-subtext0 hover:text-ctp-text transition-colors group"
            >
              <Icon className="w-3.5 h-3.5 text-ctp-overlay0 group-hover:text-ctp-text transition-colors" />
              <Text
                as="span"
                variant="caption"
                className=" text-xs group-hover:text-ctp-text transition-colors"
              >
                {label}
              </Text>
            </a>
          ))}
        </div>
      </OutlineNode>
    </div>
  );
};

export default ResumeHeader;
