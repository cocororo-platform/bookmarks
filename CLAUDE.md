# CLAUDE.md

## Project Overview
Bookmark Manager - 풀스택 북마크 매니저 앱 (Claude Code 워크숍 프로젝트)

## Tech Stack
- Backend: Express + TypeScript + Prisma (SQLite)
- Frontend: React + TypeScript + Tailwind CSS + Vite
- Test: Vitest + Supertest (server), Vitest + Testing Library (client)

## Project Structure
```
├── server/           # Express API 서버 (port 3001)
│   ├── prisma/       # Prisma 스키마 & 마이그레이션
│   └── src/          # 서버 소스코드
├── client/           # React + Vite 프론트엔드 (port 5173)
│   └── src/          # 클라이언트 소스코드
└── package.json      # 루트 스크립트 (dev, test, build)
```

## Common Commands
```bash
npm run dev            # 서버 + 클라이언트 동시 실행
npm run dev:server     # 서버만 실행
npm run dev:client     # 클라이언트만 실행
npm test               # 서버 테스트 실행 (vitest)
cd client && npm test  # 클라이언트 테스트 실행 (vitest)
cd server && npx prisma migrate dev  # DB 마이그레이션
```

## Code Rules
- 코드 수정 시 반드시 관련 테스트를 추가 작성하고 실행한 뒤 결과를 출력한다.
- Indent는 space 2칸을 사용한다.
- 빈 줄은 윗줄의 indent를 동일하게 유지한다.
- commit은 conventional commit을 따른다.
