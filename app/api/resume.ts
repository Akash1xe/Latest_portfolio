import { getDb, parseStoredJson } from "./_db.js";
import type { VercelRequest, VercelResponse } from "./_types.js";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== "GET")
    return response.status(405).json({ error: "Method not allowed" });
  const db = getDb();
  if (!db) return response.status(404).json({ error: "Resume not uploaded" });
  try {
    const rows =
      await db`select content from portfolio_settings where id = 'resume-document' limit 1`;
    const document = parseStoredJson<{
      fileName?: string;
      mimeType?: string;
      data?: string;
    }>(rows[0]?.content);
    if (!document?.data || !document.fileName || !document.mimeType)
      return response.status(404).json({ error: "Resume not uploaded" });
    const base64 = document.data.includes(",")
      ? document.data.split(",").pop()!
      : document.data;
    const safeName = document.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
    response.setHeader("content-type", document.mimeType);
    response.setHeader("content-disposition", `inline; filename="${safeName}"`);
    response.setHeader("cache-control", "public, max-age=300");
    return response.end(Buffer.from(base64, "base64"));
  } finally {
    await db.end({ timeout: 2 });
  }
}
