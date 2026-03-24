# 강사용 데모 프롬프트 모음 [빌드업 버전]

> 각 Part 실습에서 copy-paste하여 사용합니다.
> 수강생에게도 공유 가능 — 직접 작성하게 한 뒤 이 프롬프트와 비교하면 효과적입니다.

---

## Part 2: 프로젝트 셋업

### scaffold 탐색

```
이 프로젝트의 구조를 분석해줘.
어떤 파일이 있고, 어떤 기술 스택을 쓰는지, 아직 구현되지 않은 부분은 뭔지 정리해줘.
```

---

## Part 3: 프롬프트 원칙 + 백엔드 구현

### 나쁜 프롬프트 (강사 데모용) 🔴

```
서버 만들어줘
```

### 좋은 프롬프트 — Express 서버 셋업 🟢

```
Express + TypeScript 서버를 셋업해줘.

- server/src/index.ts에 Express 앱 생성
- CORS 허용, JSON 파싱 미들웨어 포함
- 포트 3001에서 실행
- /api/health 엔드포인트 추가 (상태 확인용)
- NODE_ENV이 "test"일 때는 listen하지 않게 (테스트용 export)

서버 실행해서 http://localhost:3001/api/health 응답 확인해줘.
```

### CRUD API 구현

```
/clear

@server/prisma/schema.prisma 의 Bookmark 모델을 참고해서 CRUD API를 구현해줘.

server/src/routes/bookmarks.ts에 라우터를 만들고 index.ts에 연결해줘.

엔드포인트:
- GET /api/bookmarks — 전체 목록 (createdAt 내림차순)
- POST /api/bookmarks — 추가 (url, title 필수. url은 http:// 또는 https://로 시작해야 함)
- PUT /api/bookmarks/:id — 수정 (같은 검증 규칙)
- DELETE /api/bookmarks/:id — 삭제 (없는 ID면 404)

테스트도 작성해줘 (server/src/__tests__/bookmarks.test.ts):
- GET: 목록 반환 확인
- POST: 정상 추가(201), url 누락(400), 잘못된 URL 형식(400)
- DELETE: 정상 삭제(200), 없는 ID(404)

테스트 작성 후 실행까지 해줘.
```

### 시드 데이터 삽입

```
server/seed.ts를 실행해서 샘플 북마크 데이터를 DB에 넣어줘.
그 다음 GET /api/bookmarks로 데이터가 반환되는지 확인해줘.
```

---

## Part 4: 멀티파일 수정 + 프론트엔드

### React UI 전체 생성

```
/clear

@server/src/routes/bookmarks.ts 의 API를 참고해서 프론트엔드를 만들어줘.

필요한 파일:
- client/src/api.ts — API 호출 함수 (fetchBookmarks, createBookmark, deleteBookmark)
- client/src/components/BookmarkCard.tsx — 개별 북마크 카드 (제목, URL, 태그 표시, 삭제 버튼)
- client/src/components/BookmarkList.tsx — 카드 목록
- client/src/components/AddBookmarkForm.tsx — URL, 제목 입력 폼
- client/src/App.tsx — 위 컴포넌트 조합

Tailwind CSS로 기본 스타일링하고, 개발 서버 실행해줘.
브라우저에서 북마크 추가/삭제가 동작하는지 확인해줘.
```

---

## Part 5: CLAUDE.md & 프로젝트 설정

### CLAUDE.md 생성

```
/init
```

### 규칙 추가

```
CLAUDE.md에 다음 규칙을 추가해줘:
1. 커밋 전에 항상 npm test 실행해서 통과 확인
2. API 엔드포인트 추가 시 반드시 테스트 포함
3. 커밋 메시지는 conventional commit 형식 (feat:, fix:, docs:, refactor:)
```

### settings.json 생성

```
프로젝트에 .claude/settings.json을 만들어줘.
- npm test, npm run lint, npx prisma 명령은 자동 허용
- rm -rf, git push --force는 차단
- 기본 권한 모드는 default
```

---

## Part 6: 고급 기능 + 태그 필터링

### Plan Mode로 설계 (Shift+Tab 진입 후)

```
태그 필터링 기능을 추가하려고 해.
현재 코드를 분석해서 어떤 파일을 수정해야 하는지, 어떤 순서로 작업하면 좋을지 계획을 세워줘.
코드는 수정하지 마.
```

> Shift+Tab으로 Normal Mode 복귀 후:

### 태그 필터링 구현

```
/clear

태그 필터링 기능을 추가해줘.

백엔드:
- GET /api/bookmarks?tags=work,dev 형태로 쿼리 파라미터 지원
- 여러 태그는 OR 조건으로 필터링
- 태그 없으면 전체 반환 (기존 동작 유지)

프론트엔드:
- BookmarkList 위에 태그 칩(chip) 목록 표시
- DB에 있는 모든 태그를 수집해서 칩으로 표시
- 칩 클릭하면 필터 토글, 활성화된 칩은 색상 변경
- client/src/components/TagFilter.tsx로 분리

테스트:
- 태그 1개 필터, 다중 태그 필터, 태그 없는 경우 3가지 케이스
- 테스트 작성 후 실행까지 해줘
- 기존 테스트가 깨지면 안 돼
```

---

## Part 7: 멀티 에이전트 + 즐겨찾기

### 즐겨찾기 토글 구현

```
/clear

즐겨찾기 토글 기능을 추가해줘.

- API: PATCH /api/bookmarks/:id/favorite (현재 값 반전)
- 존재하지 않는 ID는 404 반환
- UI: BookmarkCard에 ⭐ 버튼, 클릭하면 토글
- 즐겨찾기된 북마크는 ★(채워진 별), 아닌 건 ☆(빈 별)
- 테스트: 토글 동작 + 없는 ID 404 케이스 포함
- 기존 테스트가 깨지면 안 돼
```

### 서브에이전트 리뷰

```
서브에이전트로 방금 추가한 즐겨찾기 토글 코드를 리뷰해줘.
보안, 에러 처리, 엣지케이스 관점에서 검토하고 심각도별로 분류해줘.
```

### (선택) 커스텀 에이전트 생성

```
/agents
```

> Create → Project → Generate with Claude:

```
코드 변경 후 보안과 에러 처리를 중점으로 리뷰하는 에이전트.
읽기 전용이고, 심각도별로 분류해서 알려줌.
```

---

## Part 8: 한계 & 리팩토링

### 코드 냄새 탐지 (Shift+Tab → Plan Mode)

```
내가 지금까지 만든 코드를 분석해줘.

코드 냄새(code smell)를 찾아줘:
- 에러 처리 누락
- 중복 코드
- 매직 넘버
- 불필요한 any 타입
- 입력 검증 부족

심각도별로 분류: 🔴 반드시 수정 / 🟡 권장 / 🟢 사소함
코드를 수정하지 말고 분석만 해줘.
```

> Shift+Tab으로 Normal Mode 복귀 후:

### 리팩토링

```
/clear

방금 찾은 코드 냄새를 수정해줘.

우선순위:
1. 라우트 핸들러에 try-catch + 적절한 에러 응답 추가
2. POST/PUT의 중복 검증 로직을 별도 함수로 추출
3. 매직 넘버가 있으면 상수로 추출
4. 불필요한 any 타입 제거

조건:
- 기존 테스트가 모두 통과해야 함
- 기존 API 동작이 바뀌면 안 됨
- 수정 후 npm test 실행해줘
```

---

## Part 9: Git 워크플로우 & PR

### 커밋 분리

```
지금까지 변경사항을 논리적 단위로 나눠서 커밋해줘.
커밋 메시지는 영어 conventional commit 형식으로.

예상 분리:
1. feat: add Express server with CRUD API and tests
2. feat: add React frontend with Tailwind UI
3. chore: add CLAUDE.md and project settings
4. feat: add tag filtering
5. feat: add favorite toggle
6. refactor: improve error handling and extract validation

커밋 후 PR을 생성해줘.
PR 설명에 변경사항 요약, 기능 목록, 테스트 결과를 포함해줘.
```
