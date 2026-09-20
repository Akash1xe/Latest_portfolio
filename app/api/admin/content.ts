import { z } from "zod";

import { defaultPortfolioContent } from "../../src/features/portfolio-content/defaults";
import type { PortfolioContent } from "../../src/features/portfolio-content/types";
import { requireAdmin } from "../_auth";
import { ensureSettingsTable, getDb, parseStoredJson } from "../_db";
import type { VercelRequest, VercelResponse } from "../_types";

const nonEmpty = z.string().trim().min(1).max(500);
const urlOrEmpty = z.union([z.literal(""), z.string().url().max(500)]);
const experienceSchema = z.object({
  company: nonEmpty,
  position: nonEmpty,
  duration: nonEmpty,
  imageSrc: urlOrEmpty,
  companyUrl: urlOrEmpty,
  docsUrl: urlOrEmpty.optional(),
  technologies: z.array(z.string().min(1).max(50)).max(40),
  achievements: z.array(z.object({
    title: nonEmpty,
    description: z.array(z.string().min(1).max(1000)).max(20),
    icon: z.string().max(80).optional(),
  })).max(30),
});

const contentSchema = z.object({
  profile: z.object({
    name: nonEmpty,
    handle: nonEmpty,
    role: nonEmpty,
    tagline: z.string().max(1000),
    location: z.string().max(200),
    githubUrl: urlOrEmpty,
    linkedinUrl: urlOrEmpty,
    email: z.union([z.literal(""), z.string().email().max(200)]),
    avatarUrl: urlOrEmpty,
    description: z.array(z.string().min(1).max(1500)).max(12),
  }),
  about: z.object({
    background: z.array(z.object({ question: nonEmpty, answer: z.string().min(1).max(2000) })).max(20),
    focusAreas: z.array(nonEmpty).max(20),
    technicalInterests: z.array(nonEmpty).max(30),
    personalInterests: z.array(nonEmpty).max(30),
    philosophy: z.array(nonEmpty).max(20),
  }),
  skills: z.array(z.object({ category: nonEmpty, skills: z.array(nonEmpty).max(50) })).max(20),
  experiences: z.array(experienceSchema).max(30),
  projects: z.array(z.record(z.string(), z.unknown())).max(50),
  competitiveProgramming: z.object({
    leetcodeUsername: z.string().trim().min(1).max(40),
    codeforcesUsername: z.string().trim().min(1).max(40),
    primaryLanguage: z.string().trim().min(1).max(30),
    currentFocus: z.array(nonEmpty).max(8),
    enabledStats: z.array(nonEmpty).max(30),
    fallbackTotal: z.number().int().min(0).max(100000),
  }),
  publishState: z.enum(["draft", "published"]),
});

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!requireAdmin(request, response)) return;
  response.setHeader("cache-control", "no-store");
  const db = getDb();
  if (!db) {
    if (request.method === "GET") return response.status(200).json({ content: defaultPortfolioContent, storage: "unconfigured" });
    return response.status(503).json({ error: "Set DATABASE_URL to enable admin persistence." });
  }
  try {
    await ensureSettingsTable(db);
    if (request.method === "GET") {
      const [portfolioRows, legacyRows] = await Promise.all([
        db`select content, updated_at from portfolio_settings where id = 'portfolio-content' limit 1`,
        db`select content from portfolio_settings where id = 'competitive-programming' limit 1`,
      ]);
      const saved = parseStoredJson<Partial<PortfolioContent>>(portfolioRows[0]?.content);
      const legacy = parseStoredJson<Record<string, unknown>>(legacyRows[0]?.content);
      const legacyCp = legacy ? {
        leetcodeUsername: legacy.leetcodeUsername,
        codeforcesUsername: legacy.codeforcesUsername,
        primaryLanguage: legacy.primaryLanguage,
        currentFocus: legacy.currentFocus,
        enabledStats: legacy.enabledStats,
        fallbackTotal: legacy.fallbackTotal,
      } : undefined;
      const content = {
        ...defaultPortfolioContent,
        ...saved,
        profile: { ...defaultPortfolioContent.profile, ...saved?.profile },
        about: { ...defaultPortfolioContent.about, ...saved?.about },
        competitiveProgramming: { ...defaultPortfolioContent.competitiveProgramming, ...legacyCp, ...saved?.competitiveProgramming },
      };
      return response.status(200).json({ content, updatedAt: portfolioRows[0]?.updated_at ?? null, storage: "postgres" });
    }
    if (request.method === "PUT") {
      const parsed = contentSchema.safeParse(request.body);
      if (!parsed.success) return response.status(400).json({ error: "Invalid content", details: parsed.error.flatten() });
      const value = JSON.parse(JSON.stringify(parsed.data));
      const rows = await db`
        insert into portfolio_settings (id, content, updated_at)
        values ('portfolio-content', ${db.json(value)}, now())
        on conflict (id) do update set content = excluded.content, updated_at = now()
        returning content, updated_at
      `;
      return response.status(200).json(rows[0]);
    }
    return response.status(405).json({ error: "Method not allowed" });
  } finally {
    await db.end({ timeout: 2 });
  }
}
