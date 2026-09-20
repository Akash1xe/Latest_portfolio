# Akash Kumar — Backend Engineering Portfolio

A VS Code-inspired portfolio for Akash Kumar (`Akash1xe`), focused on backend engineering, distributed systems, open source, and competitive programming.

## Highlights

- Public portfolio with projects, skills, open-source work, and recruiter mode
- Live competitive-programming dashboard for LeetCode and Codeforces
- Interactive terminal with portfolio and CP commands
- Private admin route for integration controls
- Server-side platform integrations with caching and fallback data

## Run locally

```bash
cd app
npm install
npm run dev
```

Run the frontend together with the admin/API routes:

```bash
cd app
npm run dev:fullstack
```

Copy `.env.example` to the ignored `.env.local`. GitHub OAuth requires a client ID and client secret issued by your own OAuth App; its local callback is `http://localhost:3000/api/auth/github?action=callback`.

Production check:

```bash
npm run lint
npm run build
```

## Profile

- GitHub: [Akash1xe](https://github.com/Akash1xe)
- Location: Noida, Uttar Pradesh, India

The portfolio intentionally omits education and academic-score details. Contact links are only published once verified.

## License

MIT © 2026 Akash Kumar
