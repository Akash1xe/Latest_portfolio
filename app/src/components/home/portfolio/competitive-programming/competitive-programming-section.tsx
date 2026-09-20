import {
  Activity,
  ArrowUpRight,
  Braces,
  CalendarDays,
  Code2,
  Flame,
  Gauge,
  RefreshCw,
  Trophy,
} from "lucide-react";
import React from "react";

import Section from "@/components/home/editor/section/portfolio-section";
import { Button } from "@/components/ui/button";
import type {
  CalendarDay,
  ContestPoint,
  RecentProblem,
} from "@/features/competitive-programming/types";
import { useCompetitiveProgramming } from "@/features/competitive-programming/use-competitive-programming";

const number = new Intl.NumberFormat("en-IN");

const Metric = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) => (
  <div className="rounded-xl border border-ctp-surface1/70 bg-ctp-mantle/60 p-4">
    <p className="text-[10px] uppercase tracking-[0.18em] text-ctp-overlay1">
      {label}
    </p>
    <p className="mt-2 text-2xl font-semibold text-ctp-text">{value}</p>
    {hint && <p className="mt-1 text-xs text-ctp-overlay1">{hint}</p>}
  </div>
);

const StatusDot = ({ status }: { status: "connected" | "fallback" | "error" }) => (
  <span
    className={`h-2 w-2 rounded-full ${
      status === "connected"
        ? "bg-ctp-green shadow-[0_0_8px_rgb(var(--ctp-green))]"
        : status === "fallback"
          ? "bg-ctp-yellow"
          : "bg-ctp-red"
    }`}
  />
);

const Heatmap = ({ days }: { days: CalendarDay[] }) => {
  const visible = days.slice(-91);
  return (
    <div>
      <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-2">
        {visible.map((day) => (
          <span
            key={day.date}
            title={`${day.date}: ${day.count} submission${day.count === 1 ? "" : "s"}`}
            className={`h-3 w-3 rounded-[3px] border border-ctp-surface0/40 ${
              day.count >= 4
                ? "bg-ctp-green"
                : day.count >= 2
                  ? "bg-ctp-green/70"
                  : day.count === 1
                    ? "bg-ctp-green/35"
                    : "bg-ctp-surface0/60"
            }`}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-ctp-overlay1">
        <span>Less</span>
        {["bg-ctp-surface0/60", "bg-ctp-green/35", "bg-ctp-green/70", "bg-ctp-green"].map(
          (className) => (
            <span key={className} className={`h-2.5 w-2.5 rounded-[2px] ${className}`} />
          )
        )}
        <span>More</span>
      </div>
    </div>
  );
};

const RatingGraph = ({ points }: { points: ContestPoint[] }) => {
  if (points.length < 2) {
    return <div className="py-10 text-center text-sm text-ctp-overlay1">No rated contests yet.</div>;
  }

  const ratings = points.map((point) => point.rating);
  const min = Math.min(...ratings) - 50;
  const max = Math.max(...ratings) + 50;
  const coordinates = points.map((point, index) => {
    const x = 12 + (index / (points.length - 1)) * 276;
    const y = 94 - ((point.rating - min) / Math.max(max - min, 1)) * 74;
    return { x, y, ...point };
  });
  const path = coordinates.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <svg viewBox="0 0 300 110" className="h-44 w-full" role="img" aria-label="Codeforces rating history">
      <defs>
        <linearGradient id="rating-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--ctp-blue))" stopOpacity=".35" />
          <stop offset="100%" stopColor="rgb(var(--ctp-blue))" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[25, 55, 85].map((y) => (
        <line key={y} x1="8" y1={y} x2="292" y2={y} stroke="rgb(var(--ctp-surface1))" strokeWidth="1" />
      ))}
      <polygon points={`12,100 ${path} 288,100`} fill="url(#rating-fill)" />
      <polyline points={path} fill="none" stroke="rgb(var(--ctp-blue))" strokeWidth="2.5" strokeLinejoin="round" />
      {coordinates.map((point) => (
        <circle key={`${point.name}-${point.timestamp}`} cx={point.x} cy={point.y} r="3" fill="rgb(var(--ctp-crust))" stroke="rgb(var(--ctp-blue))">
          <title>{`${point.name}: ${point.rating}`}</title>
        </circle>
      ))}
    </svg>
  );
};

const TopicBars = ({ topics }: { topics: { name: string; count: number }[] }) => {
  const max = Math.max(...topics.map((topic) => topic.count), 1);
  return (
    <div className="space-y-3">
      {topics.slice(0, 6).map((topic) => (
        <div key={topic.name}>
          <div className="mb-1 flex justify-between gap-3 text-xs">
            <span className="truncate text-ctp-subtext1">{topic.name}</span>
            <span className="text-ctp-overlay1">{topic.count}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-ctp-surface0">
            <div
              className="h-full rounded-full bg-gradient-to-r from-ctp-blue to-ctp-mauve"
              style={{ width: `${Math.max((topic.count / max) * 100, 4)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const RecentList = ({ items }: { items: RecentProblem[] }) => (
  <div className="divide-y divide-ctp-surface0/70">
    {items.slice(0, 5).map((item) => (
      <a
        key={item.id}
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center justify-between gap-4 py-3 text-sm"
      >
        <div className="min-w-0">
          <p className="truncate text-ctp-text transition-colors group-hover:text-ctp-blue">{item.title}</p>
          <p className="mt-0.5 text-[11px] text-ctp-overlay1">
            {[item.language, item.rating].filter(Boolean).join(" · ") || "Accepted"}
          </p>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-ctp-overlay0 transition-colors group-hover:text-ctp-blue" />
      </a>
    ))}
  </div>
);

const Panel = ({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) => (
  <section className="overflow-hidden rounded-2xl border border-ctp-surface1/70 bg-ctp-base/70 shadow-xl shadow-black/10">
    <header className="border-b border-ctp-surface0 px-5 py-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-ctp-blue">{eyebrow}</p>
      <h3 className="mt-1 text-lg font-semibold text-ctp-text">{title}</h3>
    </header>
    <div className="p-5">{children}</div>
  </section>
);

const CompetitiveProgramming: React.FC = () => {
  const { data, isLoading } = useCompetitiveProgramming();
  const updated = new Date(data.meta.lastUpdated).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Section
      id="competitive-programming"
      label="Competitive Programming"
      title={`Competitive Programming — ${data.profile.handle}`}
      description="Live problem-solving analytics from LeetCode and Codeforces"
      headerIcon={Trophy}
      icon="code"
      showHeader
    >
      <div className="mx-auto w-full max-w-7xl space-y-6 px-1 pb-8 font-source sm:px-4">
        <div className="flex flex-col gap-4 rounded-2xl border border-ctp-blue/20 bg-gradient-to-br from-ctp-blue/10 via-ctp-surface0/20 to-ctp-mauve/10 p-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs text-ctp-green">
              <Activity className="h-4 w-4" />
              <span>{isLoading ? "Synchronizing services…" : "Analytics pipeline online"}</span>
            </div>
            <h2 className="text-2xl font-semibold text-ctp-text sm:text-3xl">Competitive Programming</h2>
            <p className="mt-2 text-sm text-ctp-subtext0">
              <span className="text-ctp-blue">{data.profile.handle}</span> · {data.profile.primaryLanguage} · {data.profile.focus.join(" · ")}
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-4xl font-bold text-ctp-text">{number.format(data.profile.totalSolved)}+</p>
            <p className="text-xs uppercase tracking-wider text-ctp-overlay1">combined solved</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Total solved" value={`${number.format(data.profile.totalSolved)}+`} hint="Across both platforms" />
          <Metric label="Primary language" value={data.profile.primaryLanguage} hint="Contest-ready toolchain" />
          <Metric label="Platforms" value="2" hint="LeetCode · Codeforces" />
          <Metric label="Current focus" value="2 tracks" hint={data.profile.focus.join(" · ")} />
        </div>

        <Panel title="Service registry" eyebrow="Backend health">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["leetcode-service", data.services.leetcode, data.services.leetcode === "connected" ? "Connected" : "Fallback active"],
              ["codeforces-service", data.services.codeforces, data.services.codeforces === "connected" ? "Connected" : "Fallback active"],
              ["stats-cache", data.services.cache === "healthy" ? "connected" : "fallback", data.services.cache === "healthy" ? "Healthy" : "Stale"],
              ["last-sync", "connected", updated],
            ].map(([name, status, detail]) => (
              <div key={name} className="rounded-xl border border-ctp-surface0 bg-ctp-mantle/60 p-3">
                <div className="flex items-center gap-2 text-xs text-ctp-subtext1">
                  <StatusDot status={status as "connected" | "fallback" | "error"} />
                  <span>{name}</span>
                </div>
                <p className="mt-2 truncate text-xs text-ctp-overlay1">{detail}</p>
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="LeetCode" eyebrow="leetcode-service">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric label="Solved" value={data.leetcode.totalSolved} />
              <Metric label="Contest rating" value={data.leetcode.contestRating ? Math.round(data.leetcode.contestRating) : "—"} />
              <Metric label="Current streak" value={`${data.leetcode.currentStreak}d`} />
              <Metric label="Max streak" value={`${data.leetcode.maxStreak}d`} />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {Object.entries(data.leetcode.difficulty).map(([label, value]) => (
                <div key={label} className="rounded-xl bg-ctp-mantle/60 p-3 text-center">
                  <p className={`text-lg font-semibold ${label === "easy" ? "text-ctp-green" : label === "medium" ? "text-ctp-yellow" : "text-ctp-red"}`}>{value}</p>
                  <p className="text-[10px] uppercase text-ctp-overlay1">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2 text-sm text-ctp-subtext1"><CalendarDays className="h-4 w-4 text-ctp-green" /> Submission calendar</div>
              <Heatmap days={data.leetcode.calendar} />
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h4 className="mb-4 flex items-center gap-2 text-sm text-ctp-subtext1"><Braces className="h-4 w-4 text-ctp-mauve" /> Most-practised topics</h4>
                <TopicBars topics={data.leetcode.topics} />
              </div>
              <div>
                <h4 className="mb-1 flex items-center gap-2 text-sm text-ctp-subtext1"><Code2 className="h-4 w-4 text-ctp-blue" /> Recent accepted</h4>
                <RecentList items={data.leetcode.recentAccepted} />
              </div>
            </div>

            <Button asChild variant="outline" className="mt-6 w-full border-ctp-blue/30 bg-ctp-blue/5 text-ctp-blue hover:bg-ctp-blue/10 hover:text-ctp-blue">
              <a href={data.leetcode.profileUrl} target="_blank" rel="noreferrer">Open LeetCode profile <ArrowUpRight className="ml-2 h-4 w-4" /></a>
            </Button>
          </Panel>

          <Panel title="Codeforces" eyebrow="codeforces-service">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric label="Current rating" value={data.codeforces.currentRating ?? "—"} />
              <Metric label="Maximum" value={data.codeforces.maxRating ?? "—"} />
              <Metric label="Current rank" value={data.codeforces.rank} />
              <Metric label="Solved" value={data.codeforces.totalSolved} />
            </div>

            <div className="mt-6">
              <h4 className="mb-2 flex items-center gap-2 text-sm text-ctp-subtext1"><Gauge className="h-4 w-4 text-ctp-blue" /> Rating history</h4>
              <RatingGraph points={data.codeforces.contests} />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.entries(data.codeforces.solvedByRating).map(([range, value]) => (
                <div key={range} className="rounded-xl bg-ctp-mantle/60 p-3 text-center">
                  <p className="text-lg font-semibold text-ctp-peach">{value}</p>
                  <p className="text-[10px] uppercase text-ctp-overlay1">{range}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h4 className="mb-4 flex items-center gap-2 text-sm text-ctp-subtext1"><Flame className="h-4 w-4 text-ctp-peach" /> Problems by tag</h4>
                <TopicBars topics={data.codeforces.tags} />
              </div>
              <div>
                <h4 className="mb-1 flex items-center gap-2 text-sm text-ctp-subtext1"><RefreshCw className="h-4 w-4 text-ctp-teal" /> Recent accepted</h4>
                <RecentList items={data.codeforces.recentAccepted} />
              </div>
            </div>

            <Button asChild variant="outline" className="mt-6 w-full border-ctp-peach/30 bg-ctp-peach/5 text-ctp-peach hover:bg-ctp-peach/10 hover:text-ctp-peach">
              <a href={data.codeforces.profileUrl} target="_blank" rel="noreferrer">Open Codeforces profile <ArrowUpRight className="ml-2 h-4 w-4" /></a>
            </Button>
          </Panel>
        </div>

        <p className="text-center text-xs text-ctp-overlay0">
          Last updated {updated} · Source: {data.meta.source} · Cached for three hours
        </p>
      </div>
    </Section>
  );
};

export default CompetitiveProgramming;
