# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start both servers (API :3001 + UI :5173)
npm test             # Run server tests (vitest, isolated test DB)
npm run seed         # Seed dev DB with 6 sample bookmarks
npm run build        # Type-check + build client

# Server only
cd server && npm run test:watch   # Vitest watch mode
cd server && npm run dev          # Express with tsx watch

# Client only
cd client && npm run dev          # Vite dev server
```

## Architecture

Monorepo with two packages sharing a root `package.json` for orchestration.

**`server/`** — Express + Prisma + SQLite
- `src/index.ts` — All API routes (GET/POST/PUT/DELETE `/api/bookmarks`, POST `/api/seed`)
- `src/prisma.ts` — PrismaClient singleton. Uses `TEST_DATABASE_URL` env var when present (for test DB isolation), otherwise falls back to Prisma's default `DATABASE_URL` from `.env`
- `prisma/schema.prisma` — Single `Bookmark` model. `tags` field stores JSON array as string
- `seed.ts` — Seeds dev DB. `test-seed.json` (gitignored) is loaded by POST `/api/seed`

**`client/`** — React 19 + Vite + Tailwind CSS
- `App.tsx` — Client-side routing via History API (no react-router): `/` renders BookmarkApp, `/tester` renders ApiTester
- `api.ts` — API client functions (`fetchBookmarks`, `createBookmark`, `deleteBookmark`)
- `ApiTester.tsx` — Interactive API testing page with custom request builder and live log
- Vite proxies `/api` requests to `http://localhost:3001`

## Testing

- 12 test cases in `server/src/index.test.ts` using Vitest + Supertest
- Tests run against an isolated `prisma/test.db` (created via `prisma db push`, auto-deleted after tests)
- Isolation mechanism: `vitest.config.ts` sets `TEST_DATABASE_URL` env var, `prisma.ts` passes it to PrismaClient's `datasources` option — this avoids conflict with Prisma's auto-loading of `.env`
- Use explicit `createdAt` values in test data to avoid SQLite second-precision ordering ambiguity

## Conventions

- Error messages and UI strings are in Korean
- API errors return `{ error: "message" }` with appropriate HTTP status codes
- `tags` is stored as a JSON string (e.g. `'["dev","tool"]'`), parsed on the client side
- Styling uses Tailwind utility classes only — no custom CSS classes
