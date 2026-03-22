# Integration Packet 2026-03-17

목적:

- `01 Foundation`, `02 Entry/Auth`, `03 Dashboard Home` 결과를 coordinator 관점에서 한 묶음으로 정리한다.
- 실제 확인한 상태, 남은 통합 리스크, 다음 디스패치 순서를 기록한다.

## 1. 회수한 스트림

- `01 Foundation`
- `02 Entry/Auth`
- `03 Dashboard Home`

## 2. 현재 통합 판단

요약:

- `01`은 워크스페이스/빌드/타입체크 기준선을 실사용 가능한 상태까지 올렸다.
- `02`는 가족 진입과 관리자 인증을 분리한 실제 라우트 스켈레톤을 앱에 붙였다.
- `03`은 카드 계약과 홈 노출 정책, 정적 프로토타입, 샘플 카드 데이터를 만들었다.

결론:

- 지금 기준으로 `04`, `05`, `07`은 카드 어댑터 작업을 시작할 수 있다.
- 단, `03` 결과를 본 앱과 워크스페이스에 연결하는 작은 통합 단계가 먼저 필요하다.

## 3. 스트림별 회수 결과

### `01 Foundation`

확인한 항목:

- 루트 워크스페이스와 명령 체계가 [package.json](/C:/gpt/01project/YSplan/package.json)과 [turbo.json](/C:/gpt/01project/YSplan/turbo.json)에 잡혀 있다.
- 공용 lint 기준이 [eslint.config.mjs](/C:/gpt/01project/YSplan/eslint.config.mjs)에 있다.
- TS 기준선이 [base.json](/C:/gpt/01project/YSplan/packages/config/typescript/base.json)에 있다.
- 멀티테넌트 초안 스키마와 Prisma 클라이언트가 [schema.prisma](/C:/gpt/01project/YSplan/packages/database/prisma/schema.prisma), [client.ts](/C:/gpt/01project/YSplan/packages/database/src/client.ts)에 있다.
- 헬스 체크가 [route.ts](/C:/gpt/01project/YSplan/apps/web/app/api/health/route.ts)에 있다.

재검증:

- `npm run lint` 통과
- `npm run typecheck` 통과
- `npm run build` 통과
- `npm run db:validate`는 현재 쉘에 `DATABASE_URL`이 없어서 재현 실패

coordinator 메모:

- `.env.example` 기반 예시는 있으나, 로컬 재검증에는 실제 `DATABASE_URL`이 필요하다.
- 현재 워크스페이스 목록에는 `packages/dashboard`가 아직 없다.

### `02 Entry/Auth`

확인한 항목:

- 랜딩 페이지가 [page.tsx](/C:/gpt/01project/YSplan/apps/web/app/(public)/page.tsx)에 있다.
- 가족 진입 화면이 [page.tsx](/C:/gpt/01project/YSplan/apps/web/app/(family)/f/[familySlug]/page.tsx)에 있다.
- 보호된 가족 홈 셸이 [page.tsx](/C:/gpt/01project/YSplan/apps/web/app/(family)/app/[familySlug]/page.tsx)에 있다.
- 관리자 로그인 화면이 [page.tsx](/C:/gpt/01project/YSplan/apps/web/app/(console)/console/sign-in/page.tsx)에 있다.
- 세션/인증 로직이 [index.ts](/C:/gpt/01project/YSplan/packages/auth/src/index.ts)에 있다.
- 가족 fixture와 tenant 해석 로직이 [index.ts](/C:/gpt/01project/YSplan/packages/tenant/src/index.ts)에 있다.

재검증:

- `npm run typecheck` 통과
- `npm run build` 통과
- 라우트 결과: `/`, `/f/[familySlug]`, `/app/[familySlug]`, `/console`, `/console/sign-in`

coordinator 메모:

- 관리자 보안과 가족 공유 접근이 실제로 분리되어 있다.
- 현재 가족 접근 세션은 `guest` 기반이라, 이후 `member/child` 확장 시 권한 해석 보강이 필요하다.
- 데모 fixture는 잘 작동하지만, 다음 단계에서 DB `FamilyAccessPolicy` 연결이 필요하다.

### `03 Dashboard Home`

확인한 항목:

- 카드 계약 구현이 [dashboard-card.mjs](/C:/gpt/01project/YSplan/packages/modules/core/src/dashboard-card.mjs)에 있다.
- 홈 노출 로직이 [home-exposure.mjs](/C:/gpt/01project/YSplan/packages/dashboard/src/home-exposure.mjs)에 있다.
- 샘플 카드 데이터가 [sample-home-cards.mjs](/C:/gpt/01project/YSplan/packages/dashboard/src/sample-home-cards.mjs)에 있다.
- 정적 프로토타입이 [index.html](/C:/gpt/01project/YSplan/apps/web/prototypes/dashboard-home/index.html), [styles.css](/C:/gpt/01project/YSplan/apps/web/prototypes/dashboard-home/styles.css), [app.mjs](/C:/gpt/01project/YSplan/apps/web/prototypes/dashboard-home/app.mjs)에 있다.
- 터미널 확인 스크립트가 [inspect.mjs](/C:/gpt/01project/YSplan/apps/web/prototypes/dashboard-home/inspect.mjs)에 있다.

재검증:

- `node apps/web/prototypes/dashboard-home/inspect.mjs` 통과
- 확인된 섹션 순서: `hero -> today -> focus -> progress -> recent -> pinned`
- 확인된 샘플 출력:
  - hero: 중요 공지
  - today: 오늘 일정, 오늘 할 일
  - focus: 지연 투두
  - progress: 진행률, 습관
  - recent: 글, 사진
  - pinned: 장기 고정 카드

coordinator 메모:

- 계약과 프로토타입은 잘 정리되어 있다.
- 하지만 현재 실제 앱 홈은 [dashboard-fixtures.ts](/C:/gpt/01project/YSplan/apps/web/src/lib/dashboard-fixtures.ts)를 사용하고 있어, `packages/dashboard` 로직과 아직 직접 연결되지 않았다.
- 또한 `packages/dashboard`는 워크스페이스에 포함되지 않아 lint/typecheck/build 범위 바깥이다.

## 4. 현재 바로 보여줄 수 있는 샘플

### 진입 흐름

1. `/`에서 데모 가족을 고른다.
2. `/f/[familySlug]`에서 가족 스플래시를 본다.
3. 비밀번호 또는 코드 입력 후 `/app/[familySlug]`로 이동한다.
4. 관리자 작업은 `/console/sign-in`에서 별도 로그인한다.

### 홈 우선 카드

1. 중요 공지
2. 오늘 일정
3. 오늘 할 일
4. 진행률/습관
5. 최근 글/사진

### inspect 결과

```text
[hero]
- 이번 주말 외할머니 댁 방문 시간 확인

[today]
- 도서관 독서 수업
- 오늘 저녁 장보기 체크

[focus]
- 학원비 정산 미완료
```

## 5. 통합 리스크

### R1. `03` 로직이 워크스페이스 검증 범위 밖에 있음

- `packages/dashboard`는 존재하지만 루트 `workspaces` 목록에 없다.
- 현재 green 상태의 `lint`, `typecheck`, `build`는 `03` 핵심 로직을 직접 검증하지 않는다.

### R2. 실제 앱 홈과 `03` 프로토타입이 분리되어 있음

- 앱 홈은 `apps/web/src/lib/dashboard-fixtures.ts`의 정적 뷰 모델을 사용한다.
- `03`이 만든 카드 계약/노출 로직은 정적 프로토타입에서만 돌고 있다.

### R3. DB 재검증은 환경 변수 의존

- 현재 쉘에서는 `DATABASE_URL`이 없어 `npm run db:validate`를 재현하지 못했다.
- Foundation 결과를 완전히 재현하려면 로컬 또는 CI 환경의 DB URL이 필요하다.

## 6. 다음 추천 순서

1. `03` 결과를 워크스페이스 또는 실제 앱 라우트에 연결하는 통합 패치
2. `04 Content Modules`가 `announcement`, `post`, `gallery` 카드 어댑터 작성
3. `05 Schedule Modules`가 `schedule`, `todo` 카드 어댑터 작성
4. `07 Tracker and Routines`가 `progress`, `habit` 카드 어댑터 작성
5. `02`와 `06`이 데모 세션을 DB 정책/관리 화면으로 연결

## 7. coordinator 판단

- `01`, `02`, `03`은 문서 단계가 아니라 실제 실행 가능한 기준선까지 왔다.
- 지금 가장 중요한 것은 새 모듈을 더 만들기보다, `03` 계약을 실제 앱과 워크스페이스에 연결해 분기된 홈 모델을 하나로 합치는 일이다.
- 그 다음부터는 `04`, `05`, `07`이 각자 `toDashboardCard` 형태의 어댑터를 병렬로 붙이면 된다.
