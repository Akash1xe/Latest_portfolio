import React from "react";
import { SiApachekafka } from "react-icons/si";

import { useGitComponent } from "@/hooks/use-git-component";
import { cn } from "@/lib/utils";

const RustFocus: React.FC = () => {
  const gitRef = useGitComponent(RustFocus);

  return (
    <div
      ref={gitRef}
      className={cn(
        "relative flex items-center gap-4 px-5 py-3.5 rounded-2xl overflow-hidden",
        "shadow-sm shadow-ctp-peach/20",
        "border-2 border-ctp-peach/25 hover:border-ctp-peach/50 transition-colors duration-300",
        "backdrop-blur-sm group"
      )}
    >
      {/* Current backend focus icon */}
      <div className="relative shrink-0 ml-1">
        <div className="absolute inset-0 rounded-full bg-ctp-peach/15 blur-sm scale-150" />
        <div className="relative p-1.5 rounded-full bg-ctp-peach/10 border border-ctp-peach/25">
          <SiApachekafka className="w-5 h-5 text-ctp-peach" />
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-ctp-peach/70 font-source leading-none mb-0.5">
          Current Focus
        </span>
        <p className="text-sm text-ctp-subtext1 font-source leading-snug">
          Going deeper on <span className="font-bold text-ctp-peach">distributed systems</span>
          {" & "}
          <span className="font-bold text-ctp-maroon">system design</span>
          {"  "}
          <span className="text-base">⚙️</span>
        </p>
      </div>

      <span className="hidden md:block absolute right-4 text-3xl opacity-5 select-none pointer-events-none group-hover:opacity-10 transition-opacity duration-500">
        ⚙️
      </span>
    </div>
  );
};

export default RustFocus;
