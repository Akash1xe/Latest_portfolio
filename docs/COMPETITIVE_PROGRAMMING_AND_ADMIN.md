# Competitive programming and admin setup

The public dashboard is available at `/competitive-programming`. The private operations console is available at `/admin` and is intentionally not linked from public navigation.

## Runtime architecture

- `app/api/competitive-programming.ts` fetches LeetCode GraphQL and the official Codeforces API from the server.
- Results are cached for three hours and served with stale-while-revalidate headers.
- Checked-in fallback data keeps the portfolio usable when either upstream service is unavailable.
- `app/api/auth/github.ts` performs GitHub OAuth and only creates a session when the numeric GitHub user ID equals `GITHUB_ADMIN_ID`.
- Admin sessions are signed, HTTP-only, same-site cookies. OAuth state is signed and login attempts are rate limited.
- `app/api/admin/content.ts` validates settings with Zod and persists them to PostgreSQL.

## Environment variables

Copy `app/.env.example` to `app/.env.local` for local full-stack development or add the same values to the deployment environment.

Create a GitHub OAuth App with this callback URL:

```text
https://your-domain.com/api/auth/github?action=callback
```

Generate `SESSION_SECRET` with at least 32 random characters. Use the immutable numeric GitHub account ID—not the username—for `GITHUB_ADMIN_ID`.

`DATABASE_URL` can point to Neon, Vercel Postgres, or another PostgreSQL database. The settings table is created automatically on the first authenticated admin request.

## Local commands

```bash
cd app
npm install
npm run build
```

Use `vercel dev` when testing serverless API routes locally. Plain `vite` serves the frontend only, so the public dashboard will intentionally use fallback data and the admin page will show its unconfigured state.

## Terminal commands

- `cp-status`
- `leetcode`
- `codeforces`
- `recent-submissions`
- `topic-stats binary-search`

