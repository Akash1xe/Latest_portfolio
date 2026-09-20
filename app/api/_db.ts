import postgres from "postgres";

export const getDb = () => {
  if (!process.env.DATABASE_URL) return null;
  const isLocal = ["localhost", "127.0.0.1", "::1"].includes(new URL(process.env.DATABASE_URL).hostname);
  return postgres(process.env.DATABASE_URL, { ssl: isLocal ? false : "require", max: 1, idle_timeout: 20 });
};

export const ensureSettingsTable = (db: NonNullable<ReturnType<typeof getDb>>) =>
  db`create table if not exists portfolio_settings (
    id text primary key,
    content jsonb not null,
    updated_at timestamptz not null default now()
  )`;

export const parseStoredJson = <T>(value: unknown): T | undefined => {
  if (value == null) return undefined;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
};
