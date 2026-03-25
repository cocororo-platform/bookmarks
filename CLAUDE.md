# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (runs server:3001 + client:5173 concurrently)
npm run dev

# Run tests (server integration tests via Vitest + Supertest)
npm test                        # single run
cd server && npx vitest run     # single run (from server dir)
cd server && npx vitest         # watch mode

# Build client for production
npm run build

# Database
cd server && npx prisma migrate dev   # create/run migrations
cd server && npx prisma generate      # regenerate Prisma client
npm run seed                          # seed 6 sample bookmarks
```

## Architecture

Monorepo with two packages: `server/` (Express REST API) and `client/` (React SPA).

**Server** — Express + Prisma + SQLite. CRUD endpoints at `/api/bookmarks`. Tests use Vitest with Supertest against the real app instance (no mocks). The Express app and Prisma client are exported from `server/src/index.ts` for test imports. Server only starts listening when `NODE_ENV !== "test"`.

**Client** — React 19 + Vite + Tailwind CSS 3. Vite proxies `/api` requests to `localhost:3001`. All API calls go through `client/src/api.ts`. State lives in `App.tsx` and flows down to components via props.

**Prisma schema** — Single `Bookmark` model (id, url, title, description?, tags as JSON string, favorite, createdAt, updatedAt). SQLite database at `server/prisma/dev.db`.

## Key Conventions

- TypeScript throughout (server: ES2022, client: ES2020 with react-jsx transform)
- Server uses `tsx` for direct TS execution (no build step)
- Vitest globals enabled — no need to import `describe`, `it`, `expect`
- Korean UI text in the client
