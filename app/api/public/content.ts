import { defaultPortfolioContent } from "../../src/features/portfolio-content/defaults";
import type { PortfolioContent } from "../../src/features/portfolio-content/types";
import { getDb, parseStoredJson } from "../_db";
import type { VercelRequest, VercelResponse } from "../_types";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "GET") return response.status(405).json({ error: "Method not allowed" });
  response.setHeader("cache-control", "public, max-age=0, s-maxage=60, stale-while-revalidate=300");
  const db = getDb();
  if (!db) return response.status(200).json({ content: defaultPortfolioContent, source: "fallback" });
  try {
    const rows = await db`select content, updated_at from portfolio_settings where id = 'portfolio-content' limit 1`;
    const saved = parseStoredJson<Partial<PortfolioContent>>(rows[0]?.content);
    const content: PortfolioContent = {
      ...defaultPortfolioContent,
      ...saved,
      profile: { ...defaultPortfolioContent.profile, ...saved?.profile },
      about: { ...defaultPortfolioContent.about, ...saved?.about },
      competitiveProgramming: { ...defaultPortfolioContent.competitiveProgramming, ...saved?.competitiveProgramming },
    };
    return response.status(200).json({ content, updatedAt: rows[0]?.updated_at ?? null, source: saved ? "postgres" : "fallback" });
  } catch {
    return response.status(200).json({ content: defaultPortfolioContent, source: "fallback" });
  } finally {
    await db.end({ timeout: 2 });
  }
}
