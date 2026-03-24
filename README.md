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

## scaffold 구조

이 repo는 **설정 파일만** 포함합니다. 소스 코드는 워크숍에서 Claude Code로 직접 작성합니다.

```
├── server/prisma/schema.prisma  ← DB 스키마 (미리 정의)
├── server/package.json          ← 백엔드 의존성
├── client/src/main.tsx          ← React 엔트리포인트
├── client/package.json          ← 프론트엔드 의존성
├── seed.ts                      ← 시드 데이터 (API 완성 후 사용)
└── server/src/                  ← (비어있음 — 여기서부터 시작!)
```
