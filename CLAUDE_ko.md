# CLAUDE_ko.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소에서 작업할 때 참고하는 안내 문서입니다.

## 명령어

```bash
npm run dev          # 두 서버 동시 실행 (API :3001 + UI :5173)
npm test             # 서버 테스트 실행 (vitest, 격리된 테스트 DB)
npm run seed         # 개발 DB에 샘플 북마크 6개 시드
npm run build        # 타입 검사 + 클라이언트 빌드

# 서버만
cd server && npm run test:watch   # Vitest 감시 모드
cd server && npm run dev          # tsx 감시 모드로 Express 실행

# 클라이언트만
cd client && npm run dev          # Vite 개발 서버
```

## 아키텍처

루트 `package.json`으로 두 패키지를 관리하는 모노레포 구조.

**`server/`** — Express + Prisma + SQLite
- `src/index.ts` — 모든 API 라우트 (GET/POST/PUT/DELETE `/api/bookmarks`, POST `/api/seed`)
- `src/prisma.ts` — PrismaClient 싱글턴. `TEST_DATABASE_URL` 환경변수가 있으면 테스트 DB 격리에 사용하고, 없으면 Prisma 기본값인 `.env`의 `DATABASE_URL`을 사용
- `prisma/schema.prisma` — 단일 `Bookmark` 모델. `tags` 필드는 JSON 배열을 문자열로 저장
- `seed.ts` — 개발 DB 시딩. `test-seed.json`(gitignore 대상)은 POST `/api/seed`에서 로드

**`client/`** — React 19 + Vite + Tailwind CSS
- `App.tsx` — History API 기반 클라이언트 사이드 라우팅 (react-router 미사용): `/`은 BookmarkApp, `/tester`는 ApiTester 렌더링
- `api.ts` — API 클라이언트 함수 (`fetchBookmarks`, `createBookmark`, `deleteBookmark`)
- `ApiTester.tsx` — 커스텀 요청 빌더와 실시간 로그를 갖춘 대화형 API 테스트 페이지
- Vite가 `/api` 요청을 `http://localhost:3001`로 프록시

## 테스트

- `server/src/index.test.ts`에 Vitest + Supertest 기반 12개 테스트 케이스
- 격리된 `prisma/test.db`에서 테스트 실행 (`prisma db push`로 생성, 테스트 후 자동 삭제)
- 격리 메커니즘: `vitest.config.ts`에서 `TEST_DATABASE_URL` 환경변수 설정, `prisma.ts`에서 PrismaClient의 `datasources` 옵션으로 전달 — Prisma의 `.env` 자동 로딩과의 충돌 방지
- SQLite의 초 단위 정밀도로 인한 정렬 모호성을 피하기 위해 테스트 데이터에 명시적 `createdAt` 값 사용

## 규칙

- 오류 메시지와 UI 문자열은 한국어로 작성
- API 오류는 적절한 HTTP 상태 코드와 함께 `{ error: "메시지" }` 형식으로 반환
- `tags`는 JSON 문자열로 저장 (예: `'["dev","tool"]'`), 클라이언트에서 파싱
- 스타일링은 Tailwind 유틸리티 클래스만 사용 — 커스텀 CSS 클래스 없음
