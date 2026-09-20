import { isAuthConfigured, readSession } from "../_auth.js";
import type { VercelRequest, VercelResponse } from "../_types.js";

export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== "GET")
    return response.status(405).json({ error: "Method not allowed" });
  const session = readSession(request);
  response.setHeader("cache-control", "no-store");
  return response.status(200).json({
    authenticated: Boolean(session),
    configured: isAuthConfigured(),
    user: session
      ? { login: session.login, avatarUrl: session.avatarUrl }
      : null,
  });
}
