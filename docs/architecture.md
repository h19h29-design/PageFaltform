# 아키텍처 방향

## 1. 핵심 아키텍처 결론

이 프로젝트는 초기부터 "멀티테넌트 플랫폼"을 염두에 두되, 구현은 `모듈형 모놀리식(monolithic app) + monorepo`로 시작하는 것이 가장 적합합니다.

이유는 다음과 같습니다.

- 가족용 서비스는 기능 간 연결이 많아서 초기에 과도한 서비스 분리가 오히려 개발 속도를 늦춥니다.
- 대신 인증, 테넌트, 대시보드, 게시판 모듈을 코드 레벨에서 분리하면 병렬 작업이 가능합니다.
- 나중에 특정 영역이 커지면 패키지 단위 또는 서비스 단위로 독립시키기 쉽습니다.

## 2. 추천 기술 선택

### 애플리케이션

- Next.js App Router
- 이유: 라우팅, 서버 컴포넌트, 서버 액션, API 경로, 배포 친화성을 한 프로젝트 안에서 다루기 좋음

### 데이터

- PostgreSQL
- Prisma ORM
- 이유: 테넌트 데이터 모델, 게시판/일정/관계형 데이터 관리에 적합

### 인증/권한

- 관리자/소유자: 계정 기반 인증
- 가족 입장 UX: 가족 접근 코드 또는 비밀번호
- 권한: owner / admin / member / guest / child 같은 역할 기반

### 모듈 전략

- 모든 게시판/모듈은 공통 메타데이터 계약을 공유
- 모듈별 화면은 달라도 `메인에 보이기`, `고정`, `노출 기간`, `대상 범위`는 공통 처리
- 처음에는 모듈형 모놀리식으로 구현하고, 확장 모듈은 동일 인터페이스로 붙임

### 배포

- 1차: 빠른 배포와 미리보기 환경 확보
- 2차: 와일드카드 서브도메인, 커스텀 도메인 연결, self-host 가능 구조 확보

## 3. 테넌트 구조

### 기본 개념

- 플랫폼에는 여러 `FamilyTenant`가 존재
- 각 가족은 고유 slug, 테마, 접근 정책, 활성 모듈을 가짐
- 같은 앱을 쓰더라도 가족별로 홈 화면 구성이 달라짐

### URL 전략 초안

- 루트 랜딩: `/`
- 가족 소개/진입: `/f/[familySlug]`
- 가족 앱 홈: `/app/[familySlug]`
- 플랫폼 또는 가족 설정: `/console`

장기적으로는 다음도 가능하게 설계합니다.

- `familyname.yourdomain.com`
- `myfamily.com` 같은 커스텀 도메인

## 4. 권한 모델 초안

- `owner`: 가족 공간 최상위 관리자
- `admin`: 게시판/일정/멤버 관리 가능
- `member`: 일반 작성/수정 가능
- `guest`: 읽기 위주 접근
- `child`: 허용된 모듈만 접근

중요한 점은, `가족 입장 비밀번호`는 편의용 접근 장치로 두고 관리자 기능 보호는 별도 인증으로 처리하는 것입니다.

## 5. 도메인 모델 초안

- `PlatformUser`
- `FamilyTenant`
- `FamilyMember`
- `Membership`
- `FamilyAccessPolicy`
- `FamilyTheme`
- `ModuleRegistry`
- `EnabledModule`
- `DashboardWidget`
- `PinnedSurfaceItem`
- `BoardDefinition`
- `BoardTemplate`
- `ReadReceipt`
- `Post`
- `Announcement`
- `GalleryAlbum`
- `GalleryItem`
- `DiaryEntry`
- `TodoList`
- `TodoItem`
- `CalendarEvent`
- `SchoolTimetable`
- `DayPlanner`
- `ProgressBoard`
- `ProgressEntry`
- `HabitTracker`
- `HabitCheckin`
- `AttachmentAsset`
- `CustomDomain`

## 6. 코드 구조

```text
apps/
  web/

packages/
  api/
  auth/
  config/
  dashboard/
  database/
  modules/
    core/
    announcements/
    posts/
    gallery/
    diary/
    school-timetable/
    day-planner/
    todo/
    calendar/
    progress/
    habits/
  platform/
  tenant/
  ui/

infra/
tests/
workstreams/
```

## 7. 패키지 책임 분리

### `apps/web`

- 실제 Next.js 앱
- 라우트, 화면, 레이아웃, 사용자 흐름

### `packages/tenant`

- 가족 slug 해석
- 테넌트 컨텍스트 주입
- 테넌트별 설정 로딩

### `packages/auth`

- 로그인, 세션, 권한 검사
- 접근 코드/비밀번호 검증 로직

### `packages/dashboard`

- 각 모듈이 올린 `DashboardModuleFeed` 집계
- 카드 배치 규칙과 프리셋별 섹션 순서
- 홈 카드 점수, hero 승격, overflow 계산
- 공지, 일정, 투두, 진행률, 기록 카드를 공통 섹션으로 묶어 집계

### `packages/modules/core`

- 모듈 공통 인터페이스
- 메인 노출 규칙
- 첨부파일/댓글/태그 같은 공통 기능
- 게시판 양식 템플릿과 공통 메타데이터 계약

### `packages/platform`

- 플랜/도메인/운영 설정
- 나중에 SaaS화할 때 필요한 관리 포인트

## 8. 공통 모듈 계약 초안

가족 홈으로 올라오는 데이터는 `packages/dashboard` 의 공통 계약을 따른다.

- 모듈 출력 단위: `DashboardModuleFeed`
- 카드 단위: `DashboardCardPayload`
- 핵심 필드: `priority`, `featured`, `pinned`, `visibilityScope`, `sectionHint`, `displayStartsAt`, `displayEndsAt`

이 계약이 있으면 공지, 일반 글, 일정, 진행률처럼 서로 다른 모듈도 홈에서는 같은 기준으로 정렬하고 숨기고 승격할 수 있습니다.

## 9. 게시판/모듈 타입 설계

플랫폼 차원에서 게시판은 다음 타입으로 정리합니다.

- `content`: 공지, 일반 글, 일기, 가이드
- `media`: 갤러리, 추억 보관함
- `checklist`: 투두, 장보기, 습관 체크
- `schedule`: 일정, 학교/학원 시간표, 하루 계획표
- `tracker`: 진행률 보드, 목표 달성률, 연속 기록

이 분류를 기준으로 생성 폼, 리스트 UI, 메인 카드 규칙을 재사용합니다.

## 10. 병렬 개발 전략

초기부터 아래 단위로 나눠 개발할 수 있게 합니다.

- 기초 구조/개발환경
- 디자인 시스템/첫 화면
- 인증/가족 진입
- 메인 대시보드
- 콘텐츠형 게시판 모듈
- 일정형 모듈
- 트래커/루틴형 모듈
- 플랫폼/관리 기능
- 배포/운영 파이프라인

## 11. 배포 전략

### 초기 배포

- 앱 1개
- DB 1개
- 오브젝트 스토리지 1개
- 이미지 최적화
- 미리보기 배포

### 플랫폼 확장 단계

- 와일드카드 서브도메인
- 커스텀 도메인 연결
- 테넌트별 환경값과 브랜딩
- 모니터링/로그/백업

## 12. 참고 근거

- Next.js App Router 공식 문서: https://nextjs.org/docs/app
- Next.js 인증 가이드: https://nextjs.org/docs/app/guides/authentication
- Turborepo `create-turbo`: https://turborepo.com/docs/reference/create-turbo
- Prisma PostgreSQL 지원 문서: https://docs.prisma.io/docs/orm/core-concepts/supported-databases/postgresql
- Vercel 멀티테넌트 가이드: https://vercel.com/docs/multi-tenant
- Vercel Platforms Starter Kit: https://vercel.com/templates/next.js/platforms-starter-kit
- Auth.js 공식 사이트: https://authjs.dev/
