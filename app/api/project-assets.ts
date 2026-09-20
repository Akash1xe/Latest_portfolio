import { getDb, parseStoredJson } from "./_db";
import type { VercelRequest, VercelResponse } from "./_types";

type StoredAsset = {
  fileName: string;
  mimeType: string;
  data: string;
};

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "GET") return response.status(405).json({ error: "Method not allowed" });
  const id = typeof request.query.id === "string" ? request.query.id : "";
  if (!/^[a-f0-9-]{36}$/i.test(id)) return response.status(404).json({ error: "Asset not found" });

  const db = getDb();
  if (!db) return response.status(404).json({ error: "Asset not found" });
  try {
    const rows = await db`select content from portfolio_settings where id = ${`project-asset:${id}`} limit 1`;
    const asset = parseStoredJson<StoredAsset>(rows[0]?.content);
    if (!asset?.data || !asset.fileName || !asset.mimeType) {
      return response.status(404).json({ error: "Asset not found" });
    }

    const base64 = asset.data.includes(",") ? asset.data.split(",").pop()! : asset.data;
    const safeName = asset.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
    const disposition = asset.mimeType.startsWith("image/") || asset.mimeType.startsWith("video/") || asset.mimeType === "application/pdf"
      ? "inline"
      : "attachment";
    response.setHeader("content-type", asset.mimeType);
    response.setHeader("content-disposition", `${disposition}; filename="${safeName}"`);
    response.setHeader("cache-control", "public, max-age=3600, immutable");
    return response.end(Buffer.from(base64, "base64"));
  } finally {
    await db.end({ timeout: 2 });
  }
}
