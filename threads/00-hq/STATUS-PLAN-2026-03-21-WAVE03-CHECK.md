# YSplan Wave 03 점검 및 다음 계획

작성일: 2026-03-21
기준: 실제 코드와 로컬 실행 결과 기준 확인

## 1. 이번 확인의 결론

- `01`부터 `06`까지 스레드별 핵심 목표는 코드 기준으로 실제 반영되어 있습니다.
- 현재 프로젝트는 `가족별 홈 + 콘솔 + 가입/로그인 + 모듈별 상세 페이지 + 다수 CRUD 흐름`까지 로컬에서 직접 확인 가능한 수준입니다.
- 다만 저장 구조는 아직 혼합 상태입니다.
  - 인증/세션은 `DATABASE_URL`이 있으면 DB source of truth 경로를 탈 수 있습니다.
  - 콘텐츠, 트래커, 일정 계열 CRUD는 현재 파일 저장 기반으로도 실제 동작합니다.
- 따라서 지금 상태는 `완성형에 가까운 로컬 데모/검증선`이고, 다음 메인 단계는 `DB 환경 연결 후 실제 운영형 컷오버`입니다.

## 2. 검증 결과

### 명령 검증

- `npm run check` 통과
- `npm run db:validate` 실패
  - 원인: `DATABASE_URL` 미설정

### HTTP 확인

- `GET http://127.0.0.1:3001/` -> `200 OK`
- `GET http://127.0.0.1:3001/sign-up` -> `200 OK`
- `GET http://127.0.0.1:3001/console/sign-in` -> `200 OK`
- `GET http://127.0.0.1:3001/f/yoon` -> `200 OK`
- `GET http://127.0.0.1:3001/app/yoon/announcements` -> `307`
  - 비로그인 상태에서 가족 접근 세션으로 리다이렉트되는 흐름 확인

## 3. 스레드별 확인 결과

### 01 Home Contract

- 홈 카드 계약과 섹션 모델 기준선이 유지되고 있습니다.
- 대시보드 계약은 여전히 패키지 레벨의 기준점으로 작동합니다.
- 이번 단계에서는 메인 구현보다 `감리/일관성 기준` 역할이 유지된 상태입니다.

핵심 경로:

- `packages/dashboard/src/contracts.ts`
- `packages/dashboard/src/home-model.ts`

### 02 Content Modules

- `announcements`, `posts`, `gallery`, `diary`에 대해 실제 읽기/쓰기 경로가 붙어 있습니다.
- 가족 앱 내부에 `list / detail / new / edit` 흐름이 모두 보입니다.
- 콘텐츠 계열 저장은 파일 기반으로 실제 CRUD가 가능합니다.

확인 포인트:

- `apps/web/app/(family)/app/[familySlug]/announcements/...`
- `apps/web/app/(family)/app/[familySlug]/posts/...`
- `apps/web/app/(family)/app/[familySlug]/gallery/...`
- `apps/web/app/(family)/app/[familySlug]/diary/...`
- `apps/web/src/lib/content-store.ts`

### 03 Schedule Modules

- `calendar`, `todo`, `school-timetable`, `day-planner`가 캐치올 라우트 기반으로 실제 페이지 흐름을 갖고 있습니다.
- 목록, 상세, 생성, 수정, 삭제 액션이 연결되어 있습니다.
- 일정 계열도 파일 저장 기반 CRUD가 실제 동작하는 구조입니다.

확인 포인트:

- `apps/web/app/(family)/app/[familySlug]/calendar/[[...segments]]/page.tsx`
- `apps/web/app/(family)/app/[familySlug]/todo/[[...segments]]/page.tsx`
- `apps/web/app/(family)/app/[familySlug]/school-timetable/[[...segments]]/page.tsx`
- `apps/web/app/(family)/app/[familySlug]/day-planner/[[...segments]]/page.tsx`
- `apps/web/src/lib/family-schedule-modules.ts`
- `apps/web/src/actions/schedule-module-actions.ts`

### 04 Auth and Data

- DB 전환은 문서 수준을 넘어 실제 런타임 서비스 경계까지 들어왔습니다.
- 가입, 로그인, 부트스트랩 액션이 있고, `DATABASE_URL`이 있을 때 DB 경로를 타도록 되어 있습니다.
- 세션도 점진적 컷오버 구조로 정리되어 있습니다.

확인 포인트:

- `apps/web/app/(public)/sign-up/page.tsx`
- `apps/web/src/actions/platform-auth-actions.ts`
- `apps/web/src/lib/server-sessions.ts`
- `packages/database/src/auth-runtime-service.ts`
- `packages/database/src/auth-data-repositories.ts`
- `packages/database/src/auth-data-bootstrap.ts`
- `packages/database/src/auth-data-cli.ts`

### 05 Platform Builder and Deploy

- 전체 앱의 공용 동선이 많이 확장됐습니다.
- 공개 페이지, 콘솔, 가족 입장, 가족 앱 내부 네비게이션, 모듈별 페이지 구조가 제품처럼 이어집니다.
- 가족 홈은 모듈 기반 합성 구조 위에서 동작합니다.

확인 포인트:

- `apps/web/app/(public)/...`
- `apps/web/app/(console)/...`
- `apps/web/app/(family)/f/[familySlug]/...`
- `apps/web/app/(family)/app/[familySlug]/...`
- `packages/tenant/src/dashboard-feeds.ts`

### 06 Tracker Modules

- `progress`, `habits`에 실제 피드 builder와 CRUD 페이지 흐름이 들어와 있습니다.
- 목록, 상세, 생성, 수정, 삭제 흐름이 가족 앱 안에서 이어집니다.
- 저장은 파일 기반으로 실제 동작합니다.

확인 포인트:

- `apps/web/app/(family)/app/[familySlug]/progress/...`
- `apps/web/app/(family)/app/[familySlug]/habits/...`
- `apps/web/src/lib/tracker-store.ts`
- `packages/modules/progress/src/index.ts`
- `packages/modules/habits/src/index.ts`

## 4. 지금 로컬에서 실제로 테스트할 수 있는 것

### 공개 및 접근

- 랜딩 페이지 진입
- 회원가입 페이지 진입
- 콘솔 로그인 페이지 진입
- 가족 입장 페이지 진입

### 가족 앱

- 가족 홈 보기
- 홈 카드에서 모듈 페이지로 이동
- 공지, 글, 갤러리, 일기 CRUD
- 일정, 할 일, 시간표, 데이플래너 CRUD
- 진행률, 습관 CRUD

### 콘솔

- 콘솔 로그인
- 가족별 설정/빌더 흐름
- 가족별 미니 홈 운영 흐름 일부

## 5. 현재 한계와 주의점

- `DATABASE_URL`이 없으면 DB 기반 가입/세션 검증을 끝까지 확인할 수 없습니다.
- 현재 저장은 도메인별로 혼합 상태입니다.
  - 인증/세션: DB 컷오버 준비 완료, 환경 필요
  - 콘텐츠/일정/트래커: 파일 저장 기반으로 동작
- 브라우저 E2E 자동화는 아직 마무리되지 않았습니다.
- 스레드별 `work/REPORT.md`는 구현 상태와 완전히 동기화되어 있지 않을 수 있으므로, 현재 기준 진실은 코드입니다.

## 6. 다음 단계 계획

### 최우선

1. `.env`에 `DATABASE_URL` 설정
2. `npm run db:validate`
3. `npm run db:generate`
4. 가능하면 `db:push` 또는 개발 마이그레이션 수행
5. 로컬 bootstrap 계정/가족 데이터 적재

### 그 다음

1. 회원가입 -> 로그인 -> 콘솔 진입 -> 가족 생성 흐름을 DB 기준으로 재검증
2. 가족 입장 세션과 앱 접근 흐름을 DB 기준으로 재검증
3. 각 모듈 CRUD 후 홈 카드 반영 여부 수동 테스트
4. 스레드별 `REPORT.md`를 실제 결과로 정리
5. smoke test 또는 Playwright 시나리오 추가

## 7. 로컬 테스트 시작점

기본 주소:

- `http://127.0.0.1:3001`

주요 페이지:

- 홈: `http://127.0.0.1:3001/`
- 회원가입: `http://127.0.0.1:3001/sign-up`
- 콘솔 로그인: `http://127.0.0.1:3001/console/sign-in`
- 가족 입장: `http://127.0.0.1:3001/f/yoon`
- 가족 앱 홈: `http://127.0.0.1:3001/app/yoon`

참고:

- `/app/...` 경로는 세션이 없으면 가족 입장 흐름으로 리다이렉트될 수 있습니다.
- DB 기반 가입/로그인은 `DATABASE_URL`이 있어야 끝까지 검증됩니다.

## 8. HQ 판단

현재 프로젝트는 `설계/목업 단계`를 넘어서 `직접 눌러보며 CRUD를 검증할 수 있는 로컬 제품 단계`에 들어왔습니다.

다음 진짜 승부처는 하나입니다.

- `DB 환경을 붙여서 인증과 저장을 운영형 경로로 끌어올리는 것`

그 단계만 닫히면, 이후부터는 기능 확장보다 `테스트, 안정화, 데이터 이전, 운영 준비`의 성격이 더 강해집니다.
