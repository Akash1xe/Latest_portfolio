import {
  ArrowLeft,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  Database,
  ExternalLink,
  FileText,
  FolderKanban,
  Github,
  Image as ImageIcon,
  Link2,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Settings2,
  ShieldCheck,
  Trash2,
  Trophy,
  Upload,
  UserRound,
  Video,
  Wrench,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { experiences as fallbackExperiences } from "@/components/home/portfolio/work/experienceDump";
import { Button } from "@/components/ui/button";
import { defaultPortfolioContent } from "@/features/portfolio-content/defaults";
import type { PortfolioContent, ResumeMetadata } from "@/features/portfolio-content/types";
import type { Project, ProjectAsset, ProjectAssetCategory, ProjectDeepDive } from "@/types";

type Session = {
  authenticated: boolean;
  configured: boolean;
  user: { login: string; avatarUrl: string } | null;
};

type EditorId = "profile" | "about" | "skills" | "projects" | "deepdive" | "experience" | "resume" | "competitive";

const managementAreas: { id: EditorId; title: string; detail: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { id: "profile", title: "Profile & links", detail: "Name, role, bio, GitHub, LinkedIn and contact details", icon: UserRound, color: "text-ctp-blue" },
  { id: "about", title: "About me", detail: "Background, focus, interests and philosophy", icon: BookOpen, color: "text-ctp-mauve" },
  { id: "skills", title: "Skills", detail: "Edit public skill categories and technologies", icon: Wrench, color: "text-ctp-green" },
  { id: "projects", title: "Projects", detail: "Edit, reorder, add or hide portfolio projects", icon: FolderKanban, color: "text-ctp-blue" },
  { id: "deepdive", title: "Project deep dives", detail: "Research, architecture, technology decisions, media and documentation", icon: BookOpen, color: "text-ctp-mauve" },
  { id: "experience", title: "Open source", detail: "Manage Unleash, GrowthBook, PicToPy and future work", icon: BriefcaseBusiness, color: "text-ctp-yellow" },
  { id: "resume", title: "Resume document", detail: "Upload and replace the public PDF, DOC or DOCX", icon: FileText, color: "text-ctp-red" },
  { id: "competitive", title: "LeetCode & Codeforces", detail: "Configure handles, focus areas and visible statistics", icon: Trophy, color: "text-ctp-teal" },
];

const inputClass = "mt-2 w-full rounded-lg border border-ctp-surface1 bg-ctp-crust px-3 py-2.5 text-sm text-ctp-text outline-none focus:border-ctp-blue";
const editorCardClass = "overflow-hidden rounded-2xl border border-ctp-surface1/70 bg-ctp-base";
const lines = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean);
const emptyDeepDive = (): ProjectDeepDive => ({
  published: false,
  overview: "",
  research: "",
  architecture: "",
  implementation: "",
  technologyDecisions: [],
  assets: [],
});
const parseProjects = (value: string): Project[] => {
  try {
    const projects = JSON.parse(value) as unknown;
    return Array.isArray(projects) ? projects as Project[] : [];
  } catch {
    return [];
  }
};

const AdminDashboard: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [content, setContent] = useState<PortfolioContent>(defaultPortfolioContent);
  const [storage, setStorage] = useState<"loading" | "postgres" | "unconfigured">("loading");
  const [activeEditor, setActiveEditor] = useState<EditorId>("profile");
  const [jsonDrafts, setJsonDrafts] = useState({ skills: "[]", projects: "[]", experiences: "[]" });
  const [resume, setResume] = useState<ResumeMetadata | null>(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/admin/session", { credentials: "include" })
      .then((response) => response.json() as Promise<Session>)
      .then(async (value) => {
        setSession(value);
        if (!value.authenticated) return;
        const [contentResponse, resumeResponse, projectsResponse] = await Promise.all([
          fetch("/api/admin/content", { credentials: "include" }),
          fetch("/api/admin/resume", { credentials: "include" }),
          fetch("/data/projects.json"),
        ]);
        const payload = await contentResponse.json() as { content?: PortfolioContent; storage?: "postgres" | "unconfigured" };
        const resumePayload = await resumeResponse.json() as { resume?: ResumeMetadata | null };
        const staticProjects = projectsResponse.ok ? await projectsResponse.json() as Project[] : [];
        if (payload.content) {
          const hydrated = {
            ...defaultPortfolioContent,
            ...payload.content,
            profile: { ...defaultPortfolioContent.profile, ...payload.content.profile },
            about: { ...defaultPortfolioContent.about, ...payload.content.about },
            competitiveProgramming: { ...defaultPortfolioContent.competitiveProgramming, ...payload.content.competitiveProgramming },
            projects: payload.content.projects?.length ? payload.content.projects : staticProjects,
            experiences: payload.content.experiences?.length ? payload.content.experiences : fallbackExperiences,
          };
          setContent(hydrated);
          setJsonDrafts({
            skills: JSON.stringify(hydrated.skills, null, 2),
            projects: JSON.stringify(hydrated.projects, null, 2),
            experiences: JSON.stringify(hydrated.experiences, null, 2),
          });
        }
        setResume(resumePayload.resume ?? null);
        setStorage(payload.storage ?? "unconfigured");
      })
      .catch(() => setSession({ authenticated: false, configured: false, user: null }));
  }, []);

  const openEditor = (id: EditorId) => {
    setActiveEditor(id);
    window.setTimeout(() => document.getElementById("content-editor")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  const updateProjects = (projects: Project[]) => {
    setContent((current) => ({ ...current, projects }));
    setJsonDrafts((current) => ({ ...current, projects: JSON.stringify(projects, null, 2) }));
  };

  const save = async () => {
    setSaving(true);
    setNotice("");
    try {
      const nextContent: PortfolioContent = {
        ...content,
        skills: JSON.parse(jsonDrafts.skills) as PortfolioContent["skills"],
        projects: JSON.parse(jsonDrafts.projects) as PortfolioContent["projects"],
        experiences: JSON.parse(jsonDrafts.experiences) as PortfolioContent["experiences"],
      };
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(nextContent),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not save content");
      setContent(nextContent);
      setNotice("Saved. Refresh the public portfolio to see the published content.");
    } catch (error) {
      setNotice(error instanceof SyntaxError ? "One of the JSON editors contains invalid JSON." : error instanceof Error ? error.message : "Could not save content");
    } finally {
      setSaving(false);
    }
  };

  const sync = async () => {
    setSyncing(true);
    setNotice("");
    try {
      await save();
      const response = await fetch("/api/competitive-programming?refresh=1", { credentials: "include" });
      if (!response.ok) throw new Error("Synchronization failed");
      const payload = await response.json() as { meta?: { lastUpdated?: string; source?: string } };
      setNotice(`Sync complete · ${payload.meta?.source ?? "unknown source"} · ${payload.meta?.lastUpdated ? new Date(payload.meta.lastUpdated).toLocaleTimeString() : "just now"}`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Synchronization failed");
    } finally {
      setSyncing(false);
    }
  };

  const uploadResume = async (file: File) => {
    setUploading(true);
    setNotice("");
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error("Resume must be 5 MB or smaller.");
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read the selected file."));
        reader.readAsDataURL(file);
      });
      const response = await fetch("/api/admin/resume", {
        method: "PUT",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fileName: file.name, mimeType: file.type, size: file.size, data }),
      });
      const result = await response.json() as { error?: string; updatedAt?: string };
      if (!response.ok) throw new Error(result.error ?? "Resume upload failed");
      setResume({ fileName: file.name, mimeType: file.type, size: file.size, updatedAt: result.updatedAt ?? new Date().toISOString() });
      setNotice("Resume uploaded and available from the public Resume section.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Resume upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (!session) return <div className="flex min-h-screen items-center justify-center bg-ctp-crust text-ctp-text"><Loader2 className="h-6 w-6 animate-spin text-ctp-blue" /></div>;

  if (!session.authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ctp-crust p-5 font-source text-ctp-text">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-ctp-surface1 bg-ctp-base shadow-2xl shadow-black/30">
          <div className="border-b border-ctp-surface0 bg-ctp-mantle/60 px-6 py-4 text-xs text-ctp-overlay1">admin.auth</div>
          <div className="p-7">
            <ShieldCheck className="mb-5 h-10 w-10 text-ctp-blue" />
            <p className="text-xs uppercase tracking-[0.2em] text-ctp-blue">Akash Backend Lab</p>
            <h1 className="mt-2 text-2xl font-semibold">Private operations console</h1>
            <p className="mt-3 text-sm leading-6 text-ctp-subtext0">Sign in with the authorized GitHub account to edit public content, integrations and your resume.</p>
            {session.configured ? (
              <Button asChild className="mt-6 w-full bg-ctp-blue text-ctp-crust hover:bg-ctp-sapphire"><a href="/api/auth/github?action=login"><Github className="mr-2 h-4 w-4" /> Continue with GitHub</a></Button>
            ) : <Button disabled className="mt-6 w-full">OAuth is not configured</Button>}
            <Link to="/" className="mt-5 flex items-center justify-center gap-2 text-xs text-ctp-overlay1 hover:text-ctp-text"><ArrowLeft className="h-3.5 w-3.5" /> Return to portfolio</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ctp-crust font-source text-ctp-text">
      <header className="sticky top-0 z-20 border-b border-ctp-surface0 bg-ctp-base/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3"><Settings2 className="h-6 w-6 text-ctp-blue" /><div><p className="text-sm font-semibold">Akash Backend Lab</p><p className="text-[11px] text-ctp-overlay1">public content control panel</p></div></div>
          <div className="flex items-center gap-2">{session.user?.avatarUrl ? <img src={session.user.avatarUrl} alt="" className="h-8 w-8 rounded-full" /> : null}<span className="hidden text-xs sm:inline">@{session.user?.login}</span><a href="/api/auth/github?action=logout" className="rounded-lg p-2 text-ctp-overlay1 hover:text-ctp-red" title="Sign out"><LogOut className="h-4 w-4" /></a></div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div><p className="text-xs uppercase tracking-[0.2em] text-ctp-green">Authenticated workspace</p><h1 className="mt-2 text-3xl font-semibold">Edit everything visitors see</h1><p className="mt-2 text-sm text-ctp-subtext0">Choose an area, edit it, then use Save all public content.</p></div>
          <Button asChild variant="outline"><Link to="/">Preview public portfolio <ExternalLink className="ml-2 h-4 w-4" /></Link></Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-ctp-surface1 bg-ctp-base p-4"><CheckCircle2 className="h-5 w-5 text-ctp-green" /><p className="mt-3 text-xs text-ctp-overlay1">Public site</p><p className="mt-1 text-sm font-semibold">Online</p></div>
          <div className="rounded-2xl border border-ctp-surface1 bg-ctp-base p-4"><Database className={`h-5 w-5 ${storage === "postgres" ? "text-ctp-green" : "text-ctp-yellow"}`} /><p className="mt-3 text-xs text-ctp-overlay1">Content database</p><p className="mt-1 text-sm font-semibold">{storage === "postgres" ? "Connected" : "Setup needed"}</p></div>
          <div className="rounded-2xl border border-ctp-surface1 bg-ctp-base p-4"><Trophy className="h-5 w-5 text-ctp-yellow" /><p className="mt-3 text-xs text-ctp-overlay1">CP accounts</p><p className="mt-1 text-sm font-semibold">{content.competitiveProgramming.leetcodeUsername} · {content.competitiveProgramming.codeforcesUsername}</p></div>
        </div>

        <section>
          <h2 className="text-lg font-semibold">Explore and manage</h2>
          <p className="mt-1 text-xs text-ctp-overlay1">Every card now opens a working editor below.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {managementAreas.map(({ id, title, detail, icon: Icon, color }) => (
              <button key={id} type="button" onClick={() => openEditor(id)} className={`group rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 ${activeEditor === id ? "border-ctp-blue bg-ctp-blue/5" : "border-ctp-surface1/70 bg-ctp-base hover:border-ctp-blue/40"}`}>
                <div className="flex items-start justify-between"><Icon className={`h-5 w-5 ${color}`} /><span className="rounded-full border border-ctp-surface1 px-2 py-1 text-[10px] uppercase">Edit</span></div>
                <h3 className="mt-4 text-sm font-semibold">{title}</h3><p className="mt-1 text-xs leading-5 text-ctp-overlay1">{detail}</p>
              </button>
            ))}
          </div>
        </section>

        <section id="content-editor" className={editorCardClass}>
          <div className="border-b border-ctp-surface0 p-5"><p className="text-[10px] uppercase tracking-[0.2em] text-ctp-blue">editor/{activeEditor}</p><h2 className="mt-1 text-lg font-semibold">{managementAreas.find((item) => item.id === activeEditor)?.title}</h2></div>
          <div className="p-5">
            {activeEditor === "profile" ? <ProfileEditor content={content} setContent={setContent} /> : null}
            {activeEditor === "about" ? <AboutEditor content={content} setContent={setContent} /> : null}
            {activeEditor === "skills" ? <JsonEditor label="Skill categories" help="Each item needs category and skills fields." value={jsonDrafts.skills} onChange={(value) => setJsonDrafts((current) => ({ ...current, skills: value }))} /> : null}
            {activeEditor === "projects" ? <JsonEditor label="Projects" help="Reorder array items to change public order. Add name, description, technologies and githubLink." value={jsonDrafts.projects} onChange={(value) => setJsonDrafts((current) => ({ ...current, projects: value }))} tall /> : null}
            {activeEditor === "deepdive" ? <DeepDiveEditor projects={parseProjects(jsonDrafts.projects)} onChange={updateProjects} onNotice={setNotice} /> : null}
            {activeEditor === "experience" ? <JsonEditor label="Open-source and experience entries" help="The public timeline uses this exact order." value={jsonDrafts.experiences} onChange={(value) => setJsonDrafts((current) => ({ ...current, experiences: value }))} tall /> : null}
            {activeEditor === "resume" ? <ResumeEditor resume={resume} uploading={uploading} onUpload={uploadResume} /> : null}
            {activeEditor === "competitive" ? <CompetitiveEditor content={content} setContent={setContent} syncing={syncing} onSync={sync} /> : null}
          </div>
          <div className="flex flex-col gap-3 border-t border-ctp-surface0 bg-ctp-mantle/40 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className={`text-xs ${notice.toLowerCase().includes("failed") || notice.toLowerCase().includes("invalid") ? "text-ctp-yellow" : "text-ctp-subtext0"}`}>{notice || "Changes remain private until you save them."}</p>
            <Button onClick={save} disabled={saving || storage !== "postgres"} className="bg-ctp-green text-ctp-crust hover:bg-ctp-teal">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save all public content</Button>
          </div>
        </section>
      </div>
    </main>
  );
};

const ProfileEditor: React.FC<{ content: PortfolioContent; setContent: React.Dispatch<React.SetStateAction<PortfolioContent>> }> = ({ content, setContent }) => {
  const update = (key: keyof PortfolioContent["profile"], value: string | string[]) => setContent((current) => ({ ...current, profile: { ...current.profile, [key]: value } }));
  return <div className="grid gap-4 md:grid-cols-2">
    {(["name", "handle", "role", "location", "githubUrl", "linkedinUrl", "email", "avatarUrl"] as const).map((key) => <label key={key} className="text-xs capitalize text-ctp-subtext0">{key.replace(/([A-Z])/g, " $1")}<input value={content.profile[key]} onChange={(event) => update(key, event.target.value)} className={inputClass} /></label>)}
    <label className="text-xs text-ctp-subtext0 md:col-span-2">Tagline<textarea value={content.profile.tagline} onChange={(event) => update("tagline", event.target.value)} className={`${inputClass} min-h-20`} /></label>
    <label className="text-xs text-ctp-subtext0 md:col-span-2">Introduction paragraphs (one per line)<textarea value={content.profile.description.join("\n")} onChange={(event) => update("description", lines(event.target.value))} className={`${inputClass} min-h-32`} /></label>
  </div>;
};

const AboutEditor: React.FC<{ content: PortfolioContent; setContent: React.Dispatch<React.SetStateAction<PortfolioContent>> }> = ({ content, setContent }) => {
  const update = (key: keyof PortfolioContent["about"], value: PortfolioContent["about"][typeof key]) => setContent((current) => ({ ...current, about: { ...current.about, [key]: value } }));
  return <div className="grid gap-4 md:grid-cols-2">
    <label className="text-xs text-ctp-subtext0 md:col-span-2">Background cards — one “Question | Answer” per line<textarea value={content.about.background.map((item) => `${item.question} | ${item.answer}`).join("\n")} onChange={(event) => update("background", lines(event.target.value).map((row) => { const [question, ...answer] = row.split("|"); return { question: question.trim(), answer: answer.join("|").trim() }; }).filter((item) => item.question && item.answer))} className={`${inputClass} min-h-36`} /></label>
    {(["focusAreas", "technicalInterests", "personalInterests", "philosophy"] as const).map((key) => <label key={key} className="text-xs capitalize text-ctp-subtext0">{key.replace(/([A-Z])/g, " $1")} (one per line)<textarea value={content.about[key].join("\n")} onChange={(event) => update(key, lines(event.target.value))} className={`${inputClass} min-h-36`} /></label>)}
  </div>;
};

const JsonEditor: React.FC<{ label: string; help: string; value: string; onChange: (value: string) => void; tall?: boolean }> = ({ label, help, value, onChange, tall }) => <label className="block text-xs text-ctp-subtext0"><span className="text-sm font-semibold text-ctp-text">{label}</span><span className="ml-2 text-ctp-overlay1">{help}</span><textarea spellCheck={false} value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} font-mono ${tall ? "min-h-[500px]" : "min-h-[320px]"}`} /></label>;

const DeepDiveEditor: React.FC<{
  projects: Project[];
  onChange: (projects: Project[]) => void;
  onNotice: (message: string) => void;
}> = ({ projects, onChange, onNotice }) => {
  const [selectedName, setSelectedName] = useState(projects[0]?.name ?? "");
  const [uploading, setUploading] = useState(false);
  const [assetTitle, setAssetTitle] = useState("");
  const [assetCategory, setAssetCategory] = useState<ProjectAssetCategory>("architecture");
  const [externalUrl, setExternalUrl] = useState("");
  const [externalTitle, setExternalTitle] = useState("");
  const [externalType, setExternalType] = useState<ProjectAsset["type"]>("video");

  useEffect(() => {
    if (!projects.some((project) => project.name === selectedName)) {
      setSelectedName(projects[0]?.name ?? "");
    }
  }, [projects, selectedName]);

  const selectedIndex = projects.findIndex((project) => project.name === selectedName);
  const selectedProject = projects[selectedIndex];
  const deepDive = {
    ...emptyDeepDive(),
    ...selectedProject?.deepDive,
    technologyDecisions: selectedProject?.deepDive?.technologyDecisions ?? [],
    assets: selectedProject?.deepDive?.assets ?? [],
  };

  const updateDeepDive = (next: ProjectDeepDive) => {
    if (selectedIndex < 0) return;
    onChange(projects.map((project, index) => index === selectedIndex ? { ...project, deepDive: next } : project));
  };

  const updateField = <K extends keyof ProjectDeepDive>(key: K, value: ProjectDeepDive[K]) => {
    updateDeepDive({ ...deepDive, [key]: value });
  };

  const uploadAsset = async (file: File) => {
    setUploading(true);
    onNotice("");
    try {
      if (file.size > 3 * 1024 * 1024) throw new Error("Files must be 3 MB or smaller. Use an external URL for larger videos.");
      const type: ProjectAsset["type"] = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "document";
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read the selected file."));
        reader.readAsDataURL(file);
      });
      const response = await fetch("/api/admin/project-assets", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          projectName: selectedProject.name,
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          type,
          category: assetCategory,
          title: assetTitle.trim() || file.name,
          data,
        }),
      });
      const result = await response.json() as { asset?: ProjectAsset; error?: string };
      if (!response.ok || !result.asset) throw new Error(result.error ?? "Upload failed");
      updateField("assets", [...deepDive.assets, result.asset]);
      setAssetTitle("");
      onNotice("Asset uploaded. Save all public content to publish it in this deep dive.");
    } catch (error) {
      onNotice(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const addExternalAsset = () => {
    try {
      const url = new URL(externalUrl);
      if (!/^https?:$/.test(url.protocol)) throw new Error();
      const asset: ProjectAsset = {
        id: crypto.randomUUID(),
        type: externalType,
        category: assetCategory,
        title: externalTitle.trim() || "External resource",
        url: url.toString(),
        storage: "external",
      };
      updateField("assets", [...deepDive.assets, asset]);
      setExternalUrl("");
      setExternalTitle("");
      onNotice("External media added. Save all public content to publish it.");
    } catch {
      onNotice("Enter a valid https:// URL for the external media.");
    }
  };

  const deleteAsset = async (asset: ProjectAsset) => {
    if (!window.confirm(`Delete “${asset.title}” from this deep dive?`)) return;
    try {
      if (asset.storage === "database") {
        const response = await fetch(`/api/admin/project-assets?id=${encodeURIComponent(asset.id)}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!response.ok) throw new Error("Could not delete the uploaded file.");
      }
      updateField("assets", deepDive.assets.filter((item) => item.id !== asset.id));
      onNotice("Asset deleted. Save all public content to finish updating the deep dive.");
    } catch (error) {
      onNotice(error instanceof Error ? error.message : "Could not delete the asset.");
    }
  };

  const resetDeepDive = async () => {
    if (!window.confirm(`Delete all structured deep-dive content and uploaded files for ${selectedProject.name}?`)) return;
    try {
      const uploaded = deepDive.assets.filter((asset) => asset.storage === "database");
      const results = await Promise.all(uploaded.map((asset) => fetch(`/api/admin/project-assets?id=${encodeURIComponent(asset.id)}`, {
        method: "DELETE",
        credentials: "include",
      })));
      if (results.some((result) => !result.ok)) throw new Error("One or more uploaded files could not be deleted.");
      updateDeepDive(emptyDeepDive());
      onNotice("Deep dive deleted. Save all public content to complete the change.");
    } catch (error) {
      onNotice(error instanceof Error ? error.message : "Could not delete the deep dive.");
    }
  };

  if (!selectedProject) {
    return <p className="text-sm text-ctp-yellow">Add at least one project before creating a deep dive.</p>;
  }

  const markdownFields: { key: "overview" | "research" | "architecture" | "implementation"; label: string; help: string }[] = [
    { key: "overview", label: "Deep-dive summary", help: "The problem, your goal and the outcome." },
    { key: "research", label: "Research before building", help: "Requirements, alternatives, benchmarks, sources and conclusions." },
    { key: "architecture", label: "Architecture and data flow", help: "Explain services, Kafka topics, queues, databases, caching and request flow." },
    { key: "implementation", label: "Implementation notes", help: "Trade-offs, difficult parts, testing, observability and future improvements." },
  ];

  return (
    <div className="space-y-7">
      <div className="grid gap-4 rounded-xl border border-ctp-surface1 bg-ctp-crust p-4 md:grid-cols-[1fr,auto,auto] md:items-end">
        <label className="text-xs text-ctp-subtext0">Project
          <select value={selectedName} onChange={(event) => setSelectedName(event.target.value)} className={inputClass}>
            {projects.map((project) => <option key={project.name} value={project.name}>{project.name}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-3 rounded-lg border border-ctp-surface1 px-4 py-3 text-sm">
          <input type="checkbox" checked={deepDive.published} onChange={(event) => updateField("published", event.target.checked)} className="h-4 w-4 accent-ctp-green" />
          Publish structured deep dive
        </label>
        <Button type="button" variant="outline" className="border-ctp-red/30 text-ctp-red" onClick={() => void resetDeepDive()}><Trash2 className="mr-2 h-4 w-4" /> Delete deep dive</Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {markdownFields.map(({ key, label, help }) => (
          <label key={key} className="block text-xs text-ctp-subtext0">
            <span className="text-sm font-semibold text-ctp-text">{label}</span>
            <span className="mt-1 block text-ctp-overlay1">{help} Markdown is supported.</span>
            <textarea value={deepDive[key]} onChange={(event) => updateField(key, event.target.value)} className={`${inputClass} min-h-48 font-mono`} />
          </label>
        ))}
      </div>

      <section className="rounded-xl border border-ctp-surface1 p-4">
        <div className="flex items-center justify-between gap-3">
          <div><h3 className="text-sm font-semibold">Technology decisions</h3><p className="mt-1 text-xs text-ctp-overlay1">Explain what each technology does and why you selected it.</p></div>
          <Button type="button" variant="outline" onClick={() => updateField("technologyDecisions", [...deepDive.technologyDecisions, { id: crypto.randomUUID(), technology: "", purpose: "", reason: "" }])}><Plus className="mr-2 h-4 w-4" /> Add technology</Button>
        </div>
        <div className="mt-4 space-y-3">
          {deepDive.technologyDecisions.length === 0 ? <p className="rounded-lg bg-ctp-crust p-4 text-xs text-ctp-overlay1">No technology decisions added yet.</p> : deepDive.technologyDecisions.map((decision, index) => (
            <div key={decision.id} className="grid gap-3 rounded-xl bg-ctp-crust p-4 md:grid-cols-3">
              <label className="text-xs text-ctp-subtext0">Technology<input value={decision.technology} onChange={(event) => updateField("technologyDecisions", deepDive.technologyDecisions.map((item, itemIndex) => itemIndex === index ? { ...item, technology: event.target.value } : item))} className={inputClass} /></label>
              <label className="text-xs text-ctp-subtext0">Used for<input value={decision.purpose} onChange={(event) => updateField("technologyDecisions", deepDive.technologyDecisions.map((item, itemIndex) => itemIndex === index ? { ...item, purpose: event.target.value } : item))} className={inputClass} /></label>
              <label className="text-xs text-ctp-subtext0">Why this choice<div className="flex gap-2"><input value={decision.reason} onChange={(event) => updateField("technologyDecisions", deepDive.technologyDecisions.map((item, itemIndex) => itemIndex === index ? { ...item, reason: event.target.value } : item))} className={inputClass} /><button type="button" onClick={() => updateField("technologyDecisions", deepDive.technologyDecisions.filter((item) => item.id !== decision.id))} className="mt-2 rounded-lg p-2 text-ctp-red hover:bg-ctp-red/10" aria-label={`Delete ${decision.technology || "technology"}`}><Trash2 className="h-4 w-4" /></button></div></label>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-ctp-surface1 p-4">
        <div><h3 className="text-sm font-semibold">Images, videos and documents</h3><p className="mt-1 text-xs text-ctp-overlay1">Upload files up to 3 MB. For longer videos, add a YouTube, Loom or hosted-video URL.</p></div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl bg-ctp-crust p-4">
            <p className="text-xs font-semibold text-ctp-text">Upload a file</p>
            <input value={assetTitle} onChange={(event) => setAssetTitle(event.target.value)} placeholder="Title (optional)" className={inputClass} />
            <select value={assetCategory} onChange={(event) => setAssetCategory(event.target.value as ProjectAssetCategory)} className={inputClass}>
              <option value="research">Research</option><option value="architecture">Architecture</option><option value="demo">Demo</option><option value="documentation">Documentation</option>
            </select>
            <label className="mt-3 inline-flex cursor-pointer items-center rounded-lg bg-ctp-blue px-4 py-2.5 text-sm font-semibold text-ctp-crust hover:bg-ctp-sapphire">
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,.pdf,.doc,.docx,.md,.txt" className="sr-only" disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadAsset(file); event.target.value = ""; }} />
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} Upload file
            </label>
          </div>
          <div className="rounded-xl bg-ctp-crust p-4">
            <p className="text-xs font-semibold text-ctp-text">Add external media</p>
            <input value={externalTitle} onChange={(event) => setExternalTitle(event.target.value)} placeholder="Title" className={inputClass} />
            <input value={externalUrl} onChange={(event) => setExternalUrl(event.target.value)} placeholder="https://…" className={inputClass} />
            <div className="grid grid-cols-2 gap-2"><select value={externalType} onChange={(event) => setExternalType(event.target.value as ProjectAsset["type"])} className={inputClass}><option value="image">Image</option><option value="video">Video</option><option value="document">Document</option></select><Button type="button" variant="outline" onClick={addExternalAsset} className="mt-2"><Link2 className="mr-2 h-4 w-4" /> Add URL</Button></div>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {deepDive.assets.map((asset) => (
            <div key={asset.id} className="flex items-center gap-3 rounded-xl border border-ctp-surface1 bg-ctp-crust p-3">
              <div className="rounded-lg bg-ctp-surface0 p-2 text-ctp-blue">{asset.type === "image" ? <ImageIcon className="h-4 w-4" /> : asset.type === "video" ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}</div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{asset.title}</p><p className="text-[11px] capitalize text-ctp-overlay1">{asset.category} · {asset.storage}</p></div>
              <a href={asset.url} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-ctp-blue hover:bg-ctp-blue/10" aria-label={`Open ${asset.title}`}><ExternalLink className="h-4 w-4" /></a>
              <button type="button" onClick={() => void deleteAsset(asset)} className="rounded-lg p-2 text-ctp-red hover:bg-ctp-red/10" aria-label={`Delete ${asset.title}`}><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const ResumeEditor: React.FC<{ resume: ResumeMetadata | null; uploading: boolean; onUpload: (file: File) => void }> = ({ resume, uploading, onUpload }) => <div className="grid gap-5 md:grid-cols-[1fr,auto] md:items-center"><div><h3 className="text-sm font-semibold">Public resume document</h3><p className="mt-2 text-xs leading-5 text-ctp-subtext0">Accepted formats: PDF, DOC and DOCX. Maximum size: 5 MB.</p>{resume ? <div className="mt-4 rounded-xl border border-ctp-green/30 bg-ctp-green/5 p-4"><p className="text-sm text-ctp-green">{resume.fileName}</p><p className="mt-1 text-xs text-ctp-overlay1">{(resume.size / 1024).toFixed(0)} KB · updated {resume.updatedAt ? new Date(resume.updatedAt).toLocaleString() : "recently"}</p><a className="mt-3 inline-flex text-xs text-ctp-blue hover:underline" href="/api/resume" target="_blank" rel="noreferrer">Open current resume <ExternalLink className="ml-1 h-3.5 w-3.5" /></a></div> : <p className="mt-4 text-xs text-ctp-yellow">No resume document has been uploaded yet.</p>}</div><label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-ctp-blue px-4 py-3 text-sm font-semibold text-ctp-crust hover:bg-ctp-sapphire"><input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="sr-only" disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(file); event.target.value = ""; }} />{uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} {resume ? "Replace resume" : "Upload resume"}</label></div>;

const CompetitiveEditor: React.FC<{ content: PortfolioContent; setContent: React.Dispatch<React.SetStateAction<PortfolioContent>>; syncing: boolean; onSync: () => void }> = ({ content, setContent, syncing, onSync }) => {
  const settings = content.competitiveProgramming;
  const update = (key: keyof typeof settings, value: string | string[] | number) => setContent((current) => ({ ...current, competitiveProgramming: { ...current.competitiveProgramming, [key]: value } }));
  return <div className="grid gap-6 lg:grid-cols-2"><div className="space-y-4">{(["leetcodeUsername", "codeforcesUsername", "primaryLanguage"] as const).map((key) => <label key={key} className="block text-xs capitalize text-ctp-subtext0">{key.replace(/([A-Z])/g, " $1")}<input value={String(settings[key])} onChange={(event) => update(key, event.target.value)} className={inputClass} /></label>)}<label className="block text-xs text-ctp-subtext0">Fallback total solved<input type="number" min="0" value={settings.fallbackTotal} onChange={(event) => update("fallbackTotal", Number(event.target.value))} className={inputClass} /></label><label className="block text-xs text-ctp-subtext0">Current focus (comma-separated)<input value={settings.currentFocus.join(", ")} onChange={(event) => update("currentFocus", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} className={inputClass} /></label></div><div><p className="text-xs text-ctp-subtext0">Visible statistics</p><div className="mt-2 grid grid-cols-2 gap-2">{["streaks", "calendar", "contests", "topics", "recent", "rating graph"].map((stat) => { const checked = settings.enabledStats.includes(stat); return <label key={stat} className="flex cursor-pointer items-center gap-2 rounded-lg border border-ctp-surface1 bg-ctp-crust p-3 text-xs"><input type="checkbox" checked={checked} onChange={() => update("enabledStats", checked ? settings.enabledStats.filter((item) => item !== stat) : [...settings.enabledStats, stat])} className="accent-ctp-blue" /><span className="capitalize">{stat}</span></label>; })}</div><Button onClick={onSync} disabled={syncing} variant="outline" className="mt-5 w-full border-ctp-blue/30 text-ctp-blue">{syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />} Save and sync both platforms</Button></div></div>;
};

export default AdminDashboard;
