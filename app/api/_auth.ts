import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import type { VercelRequest, VercelResponse } from "./_types";

const SESSION_COOKIE = "akash_admin_session";
const STATE_COOKIE = "akash_oauth_state";
const SESSION_TTL_SECONDS = 8 * 60 * 60;

type AdminSession = {
  githubId: number;
  login: string;
  avatarUrl: string;
  expiresAt: number;
};

const secret = () => process.env.SESSION_SECRET ?? "";
const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url");

export const isAuthConfigured = () =>
  Boolean(
    process.env.GITHUB_CLIENT_ID &&
      process.env.GITHUB_CLIENT_SECRET &&
      process.env.GITHUB_ADMIN_ID &&
      secret().length >= 32
  );

export const parseCookies = (request: VercelRequest) =>
  Object.fromEntries(
    (request.headers.cookie ?? "")
      .split(";")
      .map((part) => part.trim().split("="))
      .filter(([key, value]) => key && value)
      .map(([key, value]) => [key, decodeURIComponent(value)])
  );

const safeEqual = (left: string, right: string) => {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
};

const encodeSession = (session: AdminSession) => {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
};

export const readSession = (request: VercelRequest): AdminSession | null => {
  if (!isAuthConfigured()) return null;
  const token = parseCookies(request)[SESSION_COOKIE];
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(sign(payload), signature)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSession;
    if (session.expiresAt < Date.now()) return null;
    if (String(session.githubId) !== process.env.GITHUB_ADMIN_ID) return null;
    return session;
  } catch {
    return null;
  }
};

const cookie = (name: string, value: string, maxAge: number) =>
  `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax${
    process.env.VERCEL_ENV || process.env.NODE_ENV === "production" ? "; Secure" : ""
  }; Max-Age=${maxAge}`;

export const createState = (response: VercelResponse) => {
  const nonce = randomBytes(24).toString("base64url");
  const value = `${nonce}.${sign(nonce)}`;
  response.setHeader("set-cookie", cookie(STATE_COOKIE, value, 10 * 60));
  return nonce;
};

export const verifyState = (request: VercelRequest, received: string) => {
  const value = parseCookies(request)[STATE_COOKIE];
  if (!value) return false;
  const [nonce, signature] = value.split(".");
  return nonce === received && Boolean(signature) && safeEqual(sign(nonce), signature);
};

export const setSession = (
  response: VercelResponse,
  user: { id: number; login: string; avatar_url: string }
) => {
  response.setHeader("set-cookie", [
    cookie(
      SESSION_COOKIE,
      encodeSession({
        githubId: user.id,
        login: user.login,
        avatarUrl: user.avatar_url,
        expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
      }),
      SESSION_TTL_SECONDS
    ),
    cookie(STATE_COOKIE, "", 0),
  ]);
};

export const clearSession = (response: VercelResponse) =>
  response.setHeader("set-cookie", cookie(SESSION_COOKIE, "", 0));

export const requireAdmin = (request: VercelRequest, response: VercelResponse) => {
  const session = readSession(request);
  if (!session) {
    response.status(404).json({ error: "Not found" });
    return null;
  }
  return session;
};
