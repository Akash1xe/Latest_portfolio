import { z } from "zod";

import { requireAdmin } from "../_auth";
import { ensureSettingsTable, getDb, parseStoredJson } from "../_db";
import type { VercelRequest, VercelResponse } from "../_types";

const uploadSchema = z.object({
  fileName: z.string().trim().min(1).max(180),
  mimeType: z.enum(["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]),
  size: z.number().int().positive().max(5 * 1024 * 1024),
  data: z.string().min(1).max(8 * 1024 * 1024),
});

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!requireAdmin(request, response)) return;
  response.setHeader("cache-control", "no-store");
  const db = getDb();
  if (!db) return response.status(503).json({ error: "Set DATABASE_URL to enable resume uploads." });
  try {
    await ensureSettingsTable(db);
    if (request.method === "GET") {
      const rows = await db`select content, updated_at from portfolio_settings where id = 'resume-document' limit 1`;
      const document = parseStoredJson<{ fileName?: string; mimeType?: string; size?: number }>(rows[0]?.content);
      return response.status(200).json({
        resume: document ? { fileName: document.fileName, mimeType: document.mimeType, size: document.size, updatedAt: rows[0].updated_at } : null,
      });
    }
    if (request.method === "PUT") {
      const parsed = uploadSchema.safeParse(request.body);
      if (!parsed.success) return response.status(400).json({ error: "Upload a PDF, DOC, or DOCX file up to 5 MB." });
      const rows = await db`
        insert into portfolio_settings (id, content, updated_at)
        values ('resume-document', ${db.json(parsed.data)}, now())
        on conflict (id) do update set content = excluded.content, updated_at = now()
        returning updated_at
      `;
      return response.status(200).json({ ok: true, updatedAt: rows[0].updated_at });
    }
    return response.status(405).json({ error: "Method not allowed" });
  } finally {
    await db.end({ timeout: 2 });
  }
}
