import {
  clearSession,
  createState,
  isAuthConfigured,
  setSession,
  verifyState,
} from "../_auth";
import type { VercelRequest, VercelResponse } from "../_types";

const attempts = new Map<string, { count: number; resetAt: number }>();

const originFor = (request: VercelRequest) => {
  const proto = request.headers["x-forwarded-proto"] ?? "https";
  const host = request.headers["x-forwarded-host"] ?? request.headers.host;
  return `${proto}://${host}`;
};

const rateLimited = (request: VercelRequest) => {
  const ip = String(request.headers["x-forwarded-for"] ?? request.socket.remoteAddress ?? "unknown").split(",")[0];
  const now = Date.now();
  const current = attempts.get(ip);
  if (!current || current.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return false;
  }
  current.count += 1;
  return current.count > 8;
};

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!isAuthConfigured()) {
    return response.status(503).json({ error: "Admin authentication is not configured." });
  }
  const action = String(request.query.action ?? "login");
  if (action === "logout") {
    clearSession(response);
    return response.redirect(302, "/admin");
  }
  if (rateLimited(request)) return response.status(429).json({ error: "Too many login attempts" });

  const redirectUri = `${originFor(request)}/api/auth/github?action=callback`;
  if (action === "login") {
    const state = createState(response);
    const parameters = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID!,
      redirect_uri: redirectUri,
      scope: "read:user",
      state,
    });
    return response.redirect(302, `https://github.com/login/oauth/authorize?${parameters}`);
  }
  if (action !== "callback") return response.status(400).json({ error: "Unknown auth action" });

  const code = String(request.query.code ?? "");
  const state = String(request.query.state ?? "");
  if (!code || !verifyState(request, state)) return response.status(403).json({ error: "Invalid OAuth state" });

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  });
  const token = (await tokenResponse.json()) as { access_token?: string; error?: string };
  if (!token.access_token) return response.status(401).json({ error: token.error ?? "GitHub authentication failed" });

  const userResponse = await fetch("https://api.github.com/user", {
    headers: { authorization: `Bearer ${token.access_token}`, accept: "application/vnd.github+json" },
  });
  const user = (await userResponse.json()) as { id?: number; login?: string; avatar_url?: string };
  if (!user.id || String(user.id) !== process.env.GITHUB_ADMIN_ID) {
    return response.status(404).json({ error: "Not found" });
  }

  setSession(response, {
    id: user.id,
    login: user.login ?? "admin",
    avatar_url: user.avatar_url ?? "",
  });
  return response.redirect(302, "/admin");
}
