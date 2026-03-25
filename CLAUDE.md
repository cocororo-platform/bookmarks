# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack bookmark manager (React + Express + Prisma + SQLite) structured as a monorepo with `client/` and `server/` directories.

## Commands

```bash
# Development (runs both client:5173 and server:3001)
npm run dev

# Run only server or client
npm run dev:server
npm run dev:client

# Tests (Vitest + Supertest, server only)
npm test                        # single run
cd server && npm run test:watch # watch mode

# Build client
npm run build

# Database
npm run seed                    # seed sample data
cd server && npx prisma migrate dev   # run migrations
cd server && npx prisma generate      # regenerate client after schema changes
```

## Architecture

- **Client** (`client/`): React 19 + Vite + Tailwind CSS. Vite proxies `/api` requests to `localhost:3001`.
- **Server** (`server/`): Express with all CRUD routes in `src/index.ts`. Uses Prisma ORM with SQLite (`server/prisma/dev.db`).
- **Schema**: Single `Bookmark` model defined in `server/prisma/schema.prisma` — fields: `id`, `url`, `title`, `description`, `tags` (JSON string array), `favorite`, `createdAt`, `updatedAt`.

Client components: `App.tsx` (state & handlers) → `BookmarkForm.tsx` + `BookmarkList.tsx` → `BookmarkCard.tsx`. API calls live in `api.ts`.

## Testing

- Server tests in `server/src/bookmarks.test.ts` — uses Supertest to test Express routes directly against the app instance.
- E2E test in `e2e-test.mjs` — Playwright chromium automation (requires dev server running).

## Development Workflow (Writer-Reviewer Cycle)

기능 구현 시 다음 사이클을 반복한다:

1. **Write**: 코드 구현
2. **Review**: `@reviewer` 서브 에이전트를 호출하여 리뷰 요청
3. **Fix**: 리뷰에서 나온 🔴 심각 / 🟡 경고 항목을 수정
4. **Repeat**: 이슈가 없을 때까지 2-3 반복

리뷰어가 "통과"만 남길 때까지 사이클을 종료하지 않는다.

## Project Rules

### API 라우트
- 모든 API 경로는 `/api/` 접두사를 사용한다 (Vite 프록시 설정과 일치해야 함).
- POST/PUT 핸들러에서 `url`, `title` 필수 검증 패턴을 유지한다.
- `tags`는 서버에서 `JSON.stringify`로 저장하고, 클라이언트에서 `JSON.parse`로 읽는다.

### 테스트
- 테스트 설명(`it` 문)은 한국어로 작성한다 (예: `"북마크를 생성한다"`).
- `beforeEach`에서 `prisma.bookmark.deleteMany()`로 DB를 초기화하고, `afterAll`에서 `prisma.$disconnect()`를 호출한다.
- Supertest로 실제 DB에 연동하여 테스트한다 (mock 사용 안 함).

### 클라이언트
- API 호출 함수와 `Bookmark` 타입은 모두 `client/src/api.ts`에서 관리하고 export한다.
- 스타일링은 Tailwind CSS 유틸리티 클래스만 사용한다 (별도 CSS 파일 작성 안 함).

### DB 스키마 변경
- `server/prisma/schema.prisma` 수정 후 반드시 `npx prisma migrate dev`를 실행한다.
- 새 필드 추가 시 `client/src/api.ts`의 `Bookmark` 인터페이스도 함께 업데이트한다.
