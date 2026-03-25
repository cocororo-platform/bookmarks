# Bookmark Manager — Claude Code 워크숍

풀스택 북마크 매니저를 빈 scaffold에서 시작해서 완성합니다.

## 기술 스택
- Backend: Express + TypeScript + Prisma (SQLite)
- Frontend: React + TypeScript + Tailwind CSS + Vite
- Test: Vitest + Supertest

## 셋업

```bash
git clone https://github.com/cocororo-platform/bookmarks.git
cd bookmarks
npm install
cd server && npm install && npx prisma migrate dev --name init && cd ..
cd client && npm install && cd ..
```

## 개발 서버 실행
```bash
npm run dev
```
- API: http://localhost:3001
- UI: http://localhost:5173

## API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/health` | 헬스 체크 |
| GET | `/api/bookmarks` | 전체 북마크 조회 (최신순) |
| POST | `/api/bookmarks` | 북마크 생성 (`url`, `title` 필수) |
| PUT | `/api/bookmarks/:id` | 북마크 수정 |
| DELETE | `/api/bookmarks/:id` | 북마크 삭제 |

## 시드 데이터

```bash
npm run seed
```

6개의 샘플 북마크(GitHub, Claude AI, Tailwind CSS, Prisma ORM, React Docs, Hacker News)를 삽입합니다.

## 테스트

```bash
npm test
```

### 테스트 결과 (2026-03-25)

```
 ✓ src/index.test.ts (12 tests) 82ms

 Test Files  1 passed (1)
      Tests  12 passed (12)
   Duration  648ms
```

| 테스트 그룹 | 케이스 수 | 설명 |
|-------------|----------|------|
| GET /api/health | 1 | status ok 반환 |
| POST /api/bookmarks | 3 | 생성 성공, url 누락 400, title 누락 400 |
| GET /api/bookmarks | 2 | 목록 반환, 최신순 정렬 |
| PUT /api/bookmarks/:id | 3 | 수정 성공, 존재하지 않는 id 404, 유효하지 않은 id 400 |
| DELETE /api/bookmarks/:id | 3 | 삭제 성공, 존재하지 않는 id 404, 유효하지 않은 id 400 |

### 테스트 DB 격리

테스트는 개발 DB(`dev.db`)와 분리된 `test.db`를 사용합니다.

- `vitest.config.ts`에서 `TEST_DATABASE_URL` 환경변수로 테스트 DB 경로 지정
- `globalSetup`에서 `prisma db push`로 테스트 DB 스키마 적용
- 테스트 종료 후 `test.db` 자동 삭제

### 발견된 이슈 및 해결

- **정렬 테스트 실패**: `createMany`로 동시 삽입 시 SQLite의 초 단위 datetime 정밀도로 인해 `createdAt` 정렬 순서가 보장되지 않음. 명시적 `createdAt` 값을 지정하여 해결.
- **테스트 DB 격리 실패**: Prisma의 `.env` 자동 로딩이 vitest `env` 설정의 `DATABASE_URL`을 덮어씀. `TEST_DATABASE_URL`이라는 별도 환경변수를 사용하여 PrismaClient의 `datasources` 옵션으로 직접 주입하여 해결.

## scaffold 구조

이 repo는 **설정 파일만** 포함합니다. 소스 코드는 워크숍에서 Claude Code로 직접 작성합니다.

```
├── server/prisma/schema.prisma  ← DB 스키마 (미리 정의)
├── server/package.json          ← 백엔드 의존성
├── client/src/main.tsx          ← React 엔트리포인트
├── client/package.json          ← 프론트엔드 의존성
├── server/seed.ts               ← 시드 데이터 (API 완성 후 사용)
└── server/src/                  ← (비어있음 — 여기서부터 시작!)
```

## 주의 요망

코드 품질 검사(2026-03-25)에서 발견된 사항 중, 향후 개발 시 유의할 패턴들입니다.

- **PUT/POST 핸들러에서 req.body 직접 전달 금지**: `data: req.body`는 클라이언트가 `id`, `createdAt` 등 보호 필드를 조작할 수 있다. 반드시 허용 필드를 화이트리스트로 추출하여 전달할 것.
- **JSON 문자열 필드는 저장 전에 검증**: `tags`처럼 JSON 문자열로 저장하는 필드는 `JSON.parse` + `Array.isArray` 검증을 서버에서 수행할 것. 검증 없이 저장하면 클라이언트의 `JSON.parse`에서 런타임 크래시가 발생한다.
- **클라이언트에서 JSON.parse는 항상 try-catch로 감쌀 것**: 서버 검증이 있더라도 기존 데이터나 직접 DB 조작에 대한 방어가 필요하다.
- **DB를 초기화하는 엔드포인트(`/api/seed` 등)에는 환경 제한 필수**: `NODE_ENV` 체크 등으로 프로덕션에서의 실행을 차단할 것.
- **read-then-write 패턴에는 트랜잭션 사용**: 조회 후 업데이트하는 로직(예: 즐겨찾기 토글)은 `$transaction`으로 원자성을 보장할 것.
