# homepage + huhahuha 통합 검토

작성일: 2026-03-31

## 결론

두 저장소를 그냥 한 폴더로 합치는 방식은 비추천이다.

가장 안전한 방향은 아래와 같다.

1. `homepage`를 메인 호스트 저장소로 유지한다.
2. `huhahuha`에서는 루트 Vite 앱이 아니라 `apps/web`의 Next.js 플랫폼 영역만 가져온다.
3. 메인 홈페이지에서 `가족홈`과 `클럽/동호회 홈`으로 선택 진입하게 만든다.
4. 인증, 권한, 테마, 공개/비공개, 가입 승인 같은 공통 정책만 공유한다.
5. 가족 도메인과 클럽 도메인의 데이터 모델과 라우트는 분리한다.

## 왜 `homepage`를 호스트로 잡는가

`homepage`는 이미 현재 작업 기준선이 여기 있다.

- 가족홈 진입/앱/콘솔 흐름이 이미 실제 테스트 가능한 상태다.
- `packages/*` 구조로 공용화가 되어 있다.
- 가족 모듈 CRUD, 가족 승인 흐름, 공개/비공개, 역할 정책이 이미 녹아 있다.
- 사용자가 최근까지 계속 검증한 작업이 모두 이 저장소에 쌓여 있다.

핵심 근거 파일:

- `C:\gpt\01project\YSplan\apps\web\app\(public)\page.tsx`
- `C:\gpt\01project\YSplan\apps\web\app\(console)\console\page.tsx`
- `C:\gpt\01project\YSplan\apps\web\src\lib\server-sessions.ts`
- `C:\gpt\01project\YSplan\apps\web\src\lib\family-sites-store.ts`
- `C:\gpt\01project\YSplan\packages\tenant\src\index.ts`
- `C:\gpt\01project\YSplan\packages\database\prisma\schema.prisma`

## `huhahuha`에서 가져올 가치가 큰 부분

`huhahuha`는 루트 기준으로는 Vite 프로토타입과 Next 앱이 같이 섞여 있다. 실제 통합 대상으로 봐야 하는 쪽은 `apps/web`이다.

가져올 가치가 큰 건 아래다.

- 메인 분기형 진입 아이디어: `/`, `/main-a`, `/main-b`
- 클럽/동호회 플랫폼 도메인
- 클럽 생성, 가입 신청, 승인, 관리, 뱃지, 이벤트, 활동 업로드, FAQ, 리더보드
- DB 우선 구조와 smoke test 스크립트

핵심 근거 파일:

- `C:\gpt\01project\repo-compare\huhahuha\apps\web\src\app\page.tsx`
- `C:\gpt\01project\repo-compare\huhahuha\apps\web\src\app\main-a\page.tsx`
- `C:\gpt\01project\repo-compare\huhahuha\apps\web\src\app\main-b\page.tsx`
- `C:\gpt\01project\repo-compare\huhahuha\apps\web\src\app\platform\page.tsx`
- `C:\gpt\01project\repo-compare\huhahuha\apps\web\src\lib\session.ts`
- `C:\gpt\01project\repo-compare\huhahuha\apps\web\src\lib\platform-data.ts`
- `C:\gpt\01project\repo-compare\huhahuha\apps\web\prisma\schema.prisma`

## 그대로 합치면 충돌하는 부분

### 1. 앱 구조

- `homepage`: Next.js 모노레포
- `huhahuha`: 루트는 Vite 단일 앱, 내부 `apps/web`는 별도 Next 앱

즉, `huhahuha`는 저장소 구조가 두 갈래다. 루트 Vite 앱까지 같이 합치면 기준선이 흐려진다.

### 2. 인증과 세션

- `homepage`: 현재 파일 저장 + 쿠키 세션, DB 컷오버 준비 상태
- `huhahuha/apps/web`: Prisma/SQLite + JWT 쿠키 세션이 이미 중심

둘 다 역할 개념은 비슷하지만 구현 방식은 다르다.

### 3. 데이터 모델

- `homepage`: `FamilyTenant`, `Membership`, `EnabledModule`, `FamilyWorkspace`
- `huhahuha/apps/web`: `Club`, `ClubMember`, `ClubJoinRequest`, `ClubHomeSection`, `ClubActivityUpload`

공통 정책은 공유 가능하지만, 엔티티는 별도 bounded context로 두는 편이 낫다.

### 4. 라우트 철학

- `homepage`: `/f/[familySlug]`, `/app/[familySlug]`, `/console`
- `huhahuha/apps/web`: `/platform`, `/platform/clubs/[slug]`, `/main-a`, `/main-b`

메인 진입만 통합하고, 내부 도메인 라우트는 분리 유지하는 편이 안정적이다.

## 실제 통합 추천안

### 추천 방향

`homepage` 안에 `클럽 플랫폼`을 새 도메인으로 넣는다.

예시 라우트:

- `/` : 메인 통합 홈
- `/family` : 기존 가족홈 진입 소개
- `/club` : 클럽/동호회 플랫폼 진입 소개
- `/f/[familySlug]` : 가족 입구
- `/app/[familySlug]` : 가족 앱
- `/clubs` 또는 `/platform/clubs` : 클럽 목록/플랫폼
- `/clubs/[clubSlug]` : 클럽 공개 홈
- `/clubs/[clubSlug]/join` : 가입 신청
- `/clubs/[clubSlug]/manage` : 클럽 관리자 빌더

### 공용화 가능한 레이어

- 플랫폼 계정
- 역할 등급
  - master
  - full-member
  - associate-member
- 공개/비공개 발견 정책
- 가입 신청 승인 정책
- 테마 preset 시스템
- 공통 UI shell
- 공통 media/upload helper

### 분리 유지해야 하는 레이어

- 가족 모듈 CRUD
- 클럽 활동/이벤트/배지/리더보드
- 가족 홈 카드 모델
- 클럽 홈 섹션 모델

## 추천 우선순위

### 1단계

통합 메인 홈만 먼저 만든다.

- 가족홈으로 들어가기
- 클럽/동호회 플랫폼으로 들어가기

이 단계에서는 두 도메인의 내부 구현을 억지로 합치지 않는다.

### 2단계

인증/권한 정책을 하나로 맞춘다.

- master
- full-member
- associate-member
- 가족 생성 한도
- 클럽 생성 한도
- 가입 승인 정책

### 3단계

`huhahuha/apps/web`의 클럽 도메인을 `homepage` 안으로 이관한다.

권장 방향:

- `packages/clubs-*` 또는
- `apps/web/src/features/clubs/*`

루트 Vite 프로토타입은 이관 대상에서 제외한다.

### 4단계

DB 모델을 통합한다.

권장 방향:

- `homepage`의 `packages/database`를 기준으로 확장
- `FamilyTenant`와 `Club`을 나란히 두고
- `User`, `PlatformRole`, `Membership` 공통축만 정리

## 최종 판단

통합은 충분히 가능하다. 다만 “두 저장소를 그냥 붙이는 것”이 아니라, 아래처럼 해야 한다.

- 호스트: `homepage`
- 흡수 대상: `huhahuha/apps/web`
- 제외 대상: `huhahuha` 루트 Vite 프로토타입
- 공용화 대상: auth, role, theme, visibility, approval
- 분리 유지 대상: family domain, club domain

## 바로 다음 액션 추천

1. `homepage`에 통합 메인 홈을 먼저 만든다.
2. `/family`, `/club` 분기 진입을 만든다.
3. 그 다음 `huhahuha/apps/web`의 클럽 페이지군을 어떤 순서로 옮길지 이관 계획을 세운다.

가장 무난한 이관 순서:

1. 클럽 공개 홈
2. 클럽 가입 신청
3. 클럽 관리자 홈
4. 이벤트/공지
5. 활동 업로드/배지/리더보드
