# YSplan

가족 홈페이지를 넘어, 여러 가족이 각자 커스터마이징해서 쓸 수 있는 "가족 플랫폼"을 만드는 프로젝트입니다.

## 우리가 만들 핵심 경험

1. 처음 진입하면 예쁜 스플래시 화면이 보입니다.
2. `들어가기` 버튼을 누르면 비밀번호 또는 접근 코드를 입력합니다.
3. 인증이 되면 해당 가족의 메인 홈으로 들어갑니다.
4. 홈에서는 각 게시판에서 체크한 글, 일정, 할 일, 사진 등을 한눈에 봅니다.
5. 가족마다 테마, 메뉴, 노출 모듈, 메인 위젯을 다르게 설정할 수 있습니다.

## 프로젝트 방향

- 단순한 가족 사이트 1개가 아니라, 여러 가족이 쓸 수 있는 플랫폼 구조로 시작합니다.
- 처음부터 마이크로서비스로 쪼개지 않고, `모듈형 모놀리식 + 모노레포`로 갑니다.
- 게시판/갤러리/일정/시간표 같은 기능은 각각 모듈 단위로 분리합니다.
- 메인 홈은 각 모듈의 "대표 카드"를 모아 보여주는 대시보드 방식으로 만듭니다.
- 초기 배포는 빠르게, 이후에는 커스텀 도메인과 멀티테넌트 확장까지 고려합니다.

## 추천 기술 방향

- 앱 구조: Next.js App Router 기반 풀스택 웹 앱
- 저장소 구조: monorepo
- 데이터베이스: PostgreSQL
- ORM: Prisma
- 인증: 계정 기반 인증 + 가족 접근 코드/비밀번호
- 배포: 초기에는 Vercel 친화적 구조, 장기적으로는 Docker/self-host 확장 여지 확보

## Foundation 기준선

- 루트 워크스페이스와 공용 TypeScript/ESLint 규칙이 설정되어 있습니다.
- `apps/web`에는 가족 진입, 가족 홈, 콘솔 진입이 연결된 Next.js App Router 앱이 있습니다.
- `packages/database`에는 Prisma 7 기준 멀티테넌트 스키마 초안이 있습니다.
- `packages/modules/*`에는 각 기능 스트림이 바로 구현을 시작할 수 있는 모듈 패키지 골격이 있습니다.
- `packages/api`, `packages/dashboard`, `packages/platform`, `packages/tenant`, `packages/ui`는 공용 계약과 베이스 패턴을 담는 패키지로 준비되어 있습니다.

## 빠른 시작

1. `npm install`
2. `.env.example`를 참고해 루트 `.env` 준비
3. `npm run db:validate`
4. `npm run db:generate`
5. `npm run dev`

자주 쓰는 명령:

- `npm run dev`: 웹 앱 개발 서버 실행
- `npm run lint`: 전체 워크스페이스 lint
- `npm run typecheck`: 전체 워크스페이스 타입 검사
- `npm run build`: 프로덕션 빌드 검증
- `npm run db:validate`: Prisma 스키마 검증
- `npm run db:generate`: Prisma Client 생성
- `npm run db:push`: 개발용 DB에 스키마 반영

## 현재 정리된 문서

- [제품 방향](./docs/product-platform.md)
- [아키텍처](./docs/architecture.md)
- [로드맵](./docs/roadmap.md)
- [초안 문서](./docs/platform-draft.md)
- [병렬 작업 스트림](./workstreams/README.md)
- [역할별 병렬 작업 프롬프트](./parallel-agents/README.md)

## 폴더 구조

```text
apps/
  web/                  실제 웹 애플리케이션
docs/                   제품/아키텍처/로드맵 문서
infra/                  배포/운영/인프라 자산
packages/
  api/                  공용 API 계약, 입력 검증, 서비스 인터페이스
  auth/                 인증, 세션, 권한
  config/               공용 설정
  dashboard/            메인 홈 위젯 집계 로직
  database/             스키마, 마이그레이션, 시드
  modules/              게시판/일정/시간표 등 도메인 모듈
  platform/             플랜, 도메인, 설정, 플랫폼 운영 기능
  tenant/               가족 단위 멀티테넌시
  ui/                   공용 UI 컴포넌트
tests/                  통합/E2E/시나리오 테스트
workstreams/            병렬 작업 단위 문서
```

## 지금 단계에서 중요한 판단

- 비밀번호로 바로 들어가는 UX는 유지하되, 관리자 보안은 별도 계정 인증으로 분리합니다.
- "가족 공간"과 "플랫폼 운영 기능"을 분리해서 설계합니다.
- 모든 게시판/모듈은 `메인에 보이기`, `고정`, `노출 기간` 같은 공통 메타데이터 규칙을 따르게 합니다.
- 처음부터 모든 모듈을 다 만들지 않고, 핵심 MVP를 먼저 만들고 확장 모듈은 같은 계약 위에 순차 추가합니다.
- 구현 순서는 화려한 기능보다 `기초 구조 -> 인증/진입 -> 메인 홈 -> 핵심 모듈 -> 배포` 순서로 갑니다.

## 다음 추천 작업

1. Entry / UX / Auth 스트림에서 가족 진입 플로우를 실제 인증 로직으로 교체합니다.
2. Dashboard 스트림에서 `packages/dashboard` 규칙과 `apps/web` 홈 화면을 실제 데이터 집계로 연결합니다.
3. Content / Schedule / Tracker 스트림에서 각 `packages/modules/*` 패키지에 도메인 모델과 UI를 채웁니다.
4. Platform / Deploy 스트림에서 환경변수 체계, 저장소, 배포 파이프라인을 확정합니다.
