# CodeBuddy

CodeBuddy is an open-source, dark-first learning platform for Roblox Luau. It includes a structured starter curriculum, interactive behavior-checked exercises, accounts, persistent progress, XP, streaks, achievements, review scheduling, profiles, and server-backed leaderboards.

## Requirements

- Node.js 20 or newer
- npm
- A supported OS for `better-sqlite3` (prebuilt binaries are commonly available)

## Run locally

```bash
git clone <your-repository-url>
cd codebuddy
npm install
cp .env.example .env
```

Set `JWT_SECRET` in `.env` to a long random secret. On PowerShell, copy the file with `Copy-Item .env.example .env`. Then run:

```bash
npm run check
npm test
npm run dev
```

Open http://localhost:3000. SQLite is created automatically at `DATABASE_PATH`. The default location is `./data/codebuddy.sqlite`.

## Environment

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port, default `3000` |
| `NODE_ENV` | Use `production` when deployed behind HTTPS |
| `DATABASE_PATH` | SQLite database file path |
| `JWT_SECRET` | Required signing secret; use a unique random value of 32+ characters |
| `COOKIE_SECURE` | Set `true` behind HTTPS |
| `AI_API_KEY` | Optional; not used unless an AI provider integration is implemented |
| `AI_API_URL` | Optional future AI provider endpoint |

## Features

- Registration and login with bcrypt password hashing and signed, HTTP-only cookies
- SQLite persistence for users, lesson attempts, review dates, and reward history
- Server-authoritative lesson completion and XP, with duplicate completion protection
- Behaviour-oriented exercise checks using a constrained evaluator, not arbitrary server-side code execution
- Curriculum browser with lesson content, code examples, hints, checks, and practical Studio tasks
- XP, levels, achievements, learning streaks, review queue, public profiles, and weekly/all-time leaderboards
- Responsive UI, keyboard-friendly controls, and reduced-motion support
- Security headers, rate limits, input validation, and parameterized SQL

## Important implementation boundaries

The browser playground does **not** execute arbitrary Luau. Exercises are evaluated by server-side checks tailored to each exercise. This is safer than running learner code directly on the application server, but it is not a general-purpose Luau interpreter. Roblox engine APIs, physics, replication, and Studio-only behavior must be tested in Roblox Studio. Lessons label Studio tasks accordingly.

The first release is a working foundation, not a claim that every Roblox API and advanced topic is fully authored. The curriculum data is intentionally extensible. The AI mentor is not enabled until a provider integration is explicitly configured and implemented. Password reset email, friend systems, offline synchronization, and production-grade email verification are not included.

## Production deployment

1. Use Node.js 20+ and install dependencies with `npm ci`.
2. Set `NODE_ENV=production`, `JWT_SECRET`, `DATABASE_PATH`, and `COOKIE_SECURE=true`.
3. Deploy behind HTTPS. Use a persistent disk for the SQLite database, or migrate the data layer to PostgreSQL for horizontally scaled deployments.
4. Configure backups and test restore procedures.
5. Run `npm test` and `npm run check` before deploying.
6. Keep `.env` and the database outside version control.

The current signed-cookie authentication is stateless; changing `JWT_SECRET` invalidates active sessions. For a high-traffic multi-instance deployment, replace SQLite and the stateless token strategy with a managed database and revocable server-side sessions.

## Security

See [SECURITY.md](SECURITY.md). Report vulnerabilities privately to the repository maintainers.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Screenshots

Add genuine screenshots here after running the application. No placeholder screenshots are represented as real captures.
