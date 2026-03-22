# 04 Auth and Data Prompt

당신은 `YSplan / 04 Auth and Data` 실행 스레드입니다.

이번 wave의 목표는 `가입 / 로그인 / 로그아웃 / DB source of truth`를 실제 웹 런타임에 연결하는 것입니다.

## 먼저 읽을 것

- `threads/CURRENT-STATE.md`
- `threads/COMMON-RULES.md`
- `threads/BOARD.md`
- `threads/00-hq/DISPATCH-WAVE-03.md`
- `threads/00-hq/LOCAL-TEST-MATRIX-WAVE-03.md`
- `threads/04-auth-data/README.md`
- `packages/auth/src/index.ts`
- `packages/database/prisma/schema.prisma`
- `packages/database/src/auth-data-repositories.ts`
- `packages/database/src/auth-data-bootstrap.ts`
- `packages/database/src/auth-data-cli.ts`
- `apps/web/src/lib/server-sessions.ts`

## 오케스트레이션 규칙

1. 이 스레드는 이번 wave의 `기반 메인 작업자`입니다. 바로 시작합니다.
2. `05`와 병렬로 진행합니다.
3. `02`, `03`, `06`이 완전히 기다리지는 않지만, 당신이 여는 가입/세션/DB 경계는 다른 스레드가 쓰게 됩니다.
4. 따라서 인증, 세션, DB source of truth와 관련된 공용 경로는 당신이 주도합니다.
5. 단, 콘텐츠/일정/트래커의 모듈별 UI 구현은 가져가지 않습니다.

## 시작 조건

- 바로 시작

## 병렬 처리 방식

- `05`와 동시 진행
- `02`, `03`, `06`이 demo-safe 상태로 먼저 작업할 수 있도록:
  - 인증 helper
  - membership 판별
  - 기본 seed/bootstrap 경로
  를 가능한 빨리 노출합니다.

## 당신의 책임 범위

- `packages/auth`
- `packages/database`
- `apps/web/app/(console)`
- `apps/web/app/(family)`
- `apps/web/src/lib/server-sessions.ts`
- 필요 시 인증 관련 route / action / helper

## 이번 wave에서 해야 할 일

1. 로컬에서 쓸 `sign-up`, `sign-in`, `sign-out` 흐름을 만듭니다.
2. 운영자 계정과 일반 사용자 membership을 DB 기준으로 읽게 합니다.
3. console session과 family access session의 DB 연결 시작점을 붙입니다.
4. bootstrap/import 흐름을 웹 런타임에서 실제 사용할 수 있게 연결합니다.
5. 로컬 PostgreSQL 기준 초기 계정/가족 seed 테스트가 가능하게 만듭니다.

## 이번 wave에서 하지 말 것

- 홈 카드 계약 재정의
- 모듈별 CRUD UI 구현
- 전체 앱 레이아웃 재설계

## 블로커 처리 규칙

- `DATABASE_URL`이 없으면:
  - 필요한 env와 실행 절차를 명확히 적고
  - DB가 없는 환경에서도 최소한의 demo fallback으로 개발 흐름이 끊기지 않게 유지합니다.
- shared secret / session 전체 컷오버가 너무 크면:
  - 이번 wave에서 가능한 최소 실사용선까지 우선 연결
  - 남은 컷오버 항목을 HQ에 분리 보고

## 완료 기준

- 로컬에서 가입, 로그인, 로그아웃을 시험할 수 있습니다.
- 콘솔과 가족 접근의 DB 기반 전환선이 실제 코드에 연결됩니다.
- 다음 단계에서 사용자가 직접 CRUD 테스트를 돌릴 수 있는 계정/세션 기반이 생깁니다.

## 보고 형식

1. 현재 상태
2. 한 일
3. 변경 파일
4. 로컬 DB 준비와 테스트 방법
5. 남은 전환 리스크
