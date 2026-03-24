# 강사용 데모 프롬프트 모음

> 각 Part 데모에서 copy-paste하여 사용합니다.
> `---` 구분선 단위로 하나의 프롬프트입니다.

---

## Part 1-5: 프로젝트 분석 (시나리오 A)

```
이 프로젝트가 뭘 하는 건지 분석해서 설명해줘
```

---

## Part 1-B: DELETE 엔드포인트 추가 (시나리오 B)

```
DELETE /api/bookmarks/:id 엔드포인트 추가해줘.
존재하지 않는 ID면 404 반환. 테스트도 작성하고 실행해줘.
```

---

## Part 2-2: 원라인 모드로 PUT 추가

```bash
claude -n "bookmark-api" "PUT /api/bookmarks/:id 엔드포인트 추가해줘. 기존 DELETE 패턴 따라서. 테스트 포함."
```

---

## Part 3 Round 1: 나쁜 프롬프트 🔴

```
/clear
```
```
태그 필터링 기능 추가해줘
```

---

## Part 3 Round 1.5: Plan Mode 탐색 🔵

> Shift+Tab으로 Plan Mode 진입 후:

```
/clear
```
```
태그 필터링 기능을 추가하려고 해.
어떤 파일을 수정해야 하는지, 어떤 순서로 작업해야 하는지 먼저 파악해줘.
```

> 결과 확인 후 Shift+Tab으로 Normal Mode 복귀

---

## Part 3 Round 2: 좋은 프롬프트 🟢

```
/clear
```
```
북마크 태그 필터링 기능을 추가해줘.

백엔드:
- GET /api/bookmarks?tags=work,dev 형태로 쿼리 파라미터 지원
- 여러 태그는 OR 조건으로 필터링
- 태그 없으면 전체 반환 (기존 동작 유지)

프론트엔드:
- 기존 BookmarkList.tsx 위에 태그 칩(chip) 목록 표시
- 칩 클릭하면 필터 토글, 활성화된 칩은 색상 변경
- client/src/components/TagFilter.tsx로 분리

테스트:
- 백엔드: 태그 1개 필터, 다중 태그 필터, 태그 없는 경우 3가지 케이스
- 테스트 작성 후 실행까지 해줘
```

---

## Part 4-1: Favorite 필드 멀티파일 연쇄 수정

```
Bookmark 모델에 favorite (boolean, 기본값 false) 필드를 추가해줘.
Prisma 스키마 → DB 마이그레이션 → API 수정 → 프론트 수정 순서로.
테스트 포함.
```

---

## Part 4-2: 커밋 분리 & PR 생성

```
지금까지 변경사항을 논리적 단위로 나눠서 커밋해줘.
커밋 메시지는 영어 conventional commit 형식으로.
```

```
이 브랜치로 PR 만들어줘.
변경 내용 요약, 테스트 결과, 스크린샷 요청 체크리스트 포함해서.
```

---

## Part 5-1: CLAUDE.md 생성

```
/init
```

```
CLAUDE.md에 다음 규칙을 추가해줘:
1. 커밋 전에 항상 npm test 실행해서 통과 확인
2. API 엔드포인트 추가 시 반드시 테스트 포함
3. 커밋 메시지는 conventional commit 형식 (feat:, fix:, docs: 등)
```

---

## Part 5-2: settings.json 생성

```
우리 프로젝트에 settings.json을 만들어줘.
- npm test, npm run lint, npx prisma 명령은 자동 허용
- rm -rf, git push --force는 차단
- 기본 권한 모드는 default
```

---

## Part 7-1: 서브에이전트 생성 & 사용

```
/agents
```
> Create → Project → Generate with Claude:
```
코드 변경 후 보안과 에러 처리를 중점으로 리뷰하는 에이전트.
읽기 전용이고, 심각도별로 분류해서 알려줌.
```

> 사용:
```
@code-reviewer 방금 추가한 즐겨찾기 토글 코드 리뷰해줘
```

---

## Part 9 Step 1: 프로젝트 탐색 & 코드 냄새 탐지

> Shift+Tab으로 Plan Mode 진입 후:

```
이 프로젝트를 분석해줘.

1. 전체 구조와 기술 스택 파악
2. 코드 냄새(code smell)를 찾아줘:
   - 중복 코드, 에러 처리 누락, 매직 넘버, 불필요한 any 타입 등
3. 아직 구현되지 않은 기능이 있는지 확인
4. 심각도별로 분류: 🔴 반드시 수정 / 🟡 권장 / 🟢 사소함

코드를 수정하지 말고 분석만 해줘.
```

---

## Part 9 Step 2: 리팩토링

```
/clear

Step 1에서 찾은 코드 냄새를 수정해줘.

우선순위:
1. 모든 라우트 핸들러에 try-catch + 적절한 에러 응답 추가
2. GET/PUT의 중복 URL 검증 로직을 validateBookmarkInput 함수로 추출
3. 매직 넘버 20을 DEFAULT_PAGE_SIZE 상수로 추출
4. 미사용 import, 불필요한 any 타입 정리

조건:
- 기존 테스트가 모두 통과해야 함
- 기존 API 동작이 바뀌면 안 됨
- 수정 후 npm test 실행해줘
```

---

## Part 9 Step 3-A: 태그 필터링 추가

```
/clear

태그 필터링 기능을 추가해줘.

백엔드:
- GET /api/bookmarks?tags=work,dev 형태로 쿼리 파라미터 지원
- 여러 태그는 OR 조건으로 필터링
- 태그 없으면 전체 반환 (기존 동작 유지)

프론트엔드:
- BookmarkList 위에 태그 칩(chip) 목록 표시
- 칩 클릭하면 필터 토글, 활성화된 칩은 색상 변경

테스트:
- 태그 1개 필터, 다중 태그 필터, 태그 없는 경우 3가지 케이스
- 테스트 작성 후 실행까지 해줘
- 기존 테스트가 깨지면 안 돼
```

---

## Part 9 Step 3-B: 즐겨찾기 토글 추가

```
즐겨찾기 토글 기능을 추가해줘.

- API: PATCH /api/bookmarks/:id/favorite (현재 값 반전)
- 존재하지 않는 ID는 404 반환
- UI: BookmarkCard에 ⭐ 버튼, 클릭하면 토글
- 테스트: 토글 동작 + 없는 ID 404 케이스 포함
- 기존 테스트가 깨지면 안 돼
```

---

## Part 9 Step 4: 커밋 분리 & PR

```
지금까지 변경사항을 논리적 단위로 나눠서 커밋해줘.
커밋 메시지는 영어 conventional commit 형식으로.

예상 분리:
1. refactor: 에러 처리 추가 및 중복 코드 제거
2. feat: 태그 필터링 기능
3. feat: 즐겨찾기 토글 기능

커밋 후 PR을 생성해줘.
PR 설명에 변경사항 요약, 리팩토링 내용, 새 기능 목록, 테스트 결과를 포함해줘.
```
