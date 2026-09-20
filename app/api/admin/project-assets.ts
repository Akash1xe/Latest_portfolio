import { randomUUID } from "node:crypto";

import { z } from "zod";

import { requireAdmin } from "../_auth";
import { ensureSettingsTable, getDb } from "../_db";
import type { VercelRequest, VercelResponse } from "../_types";

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/markdown",
  "text/plain",
] as const;

const uploadSchema = z.object({
  projectName: z.string().trim().min(1).max(120),
  fileName: z.string().trim().min(1).max(180),
  mimeType: z.enum(allowedMimeTypes),
  size: z.number().int().positive().max(MAX_FILE_SIZE),
  type: z.enum(["image", "video", "document"]),
  category: z.enum(["research", "architecture", "demo", "documentation"]),
  title: z.string().trim().min(1).max(160),
  caption: z.string().trim().max(1000).optional(),
  data: z.string().min(1).max(4_500_000),
});

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!requireAdmin(request, response)) return;
  response.setHeader("cache-control", "no-store");
  const db = getDb();
  if (!db) return response.status(503).json({ error: "Set DATABASE_URL to enable project uploads." });

  try {
    await ensureSettingsTable(db);

    if (request.method === "POST") {
      const parsed = uploadSchema.safeParse(request.body);
      if (!parsed.success) {
        return response.status(400).json({
          error: "Upload a supported image, MP4/WebM video, PDF, DOC, DOCX, Markdown or text file up to 3 MB.",
        });
      }

      const id = randomUUID();
      const stored = { id, ...parsed.data, uploadedAt: new Date().toISOString() };
      await db`
        insert into portfolio_settings (id, content, updated_at)
        values (${`project-asset:${id}`}, ${db.json(stored)}, now())
      `;

      const { data, ...asset } = stored;
      void data;
      return response.status(201).json({
        asset: {
          ...asset,
          url: `/api/project-assets?id=${encodeURIComponent(id)}`,
          storage: "database",
        },
      });
    }

    if (request.method === "DELETE") {
      const id = typeof request.query.id === "string" ? request.query.id : "";
      if (!/^[a-f0-9-]{36}$/i.test(id)) return response.status(400).json({ error: "Invalid asset id." });
      await db`delete from portfolio_settings where id = ${`project-asset:${id}`}`;
      return response.status(200).json({ ok: true });
    }

    return response.status(405).json({ error: "Method not allowed" });
  } finally {
    await db.end({ timeout: 2 });
  }
}
