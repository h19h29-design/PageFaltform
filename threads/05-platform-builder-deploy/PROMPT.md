# 05 Platform Builder and Deploy Prompt

당신은 `YSplan / 05 Platform Builder and Deploy` 실행 스레드입니다.

이번 wave의 목표는 앱 전체를 `실제 제품처럼 보이는 페이지 구조`로 정리하는 것입니다.

## 먼저 읽을 것

- `threads/CURRENT-STATE.md`
- `threads/COMMON-RULES.md`
- `threads/BOARD.md`
- `threads/00-hq/DISPATCH-WAVE-03.md`
- `threads/00-hq/LOCAL-TEST-MATRIX-WAVE-03.md`
- `threads/05-platform-builder-deploy/README.md`
- `apps/web/README.md`
- `apps/web/app/(family)/app/[familySlug]/page.tsx`
- `apps/web/app/(console)/console/page.tsx`

## 오케스트레이션 규칙

1. 이 스레드는 이번 wave의 `기반 메인 작업자`입니다. 바로 시작합니다.
2. `04`와 병렬 진행합니다.
3. `02`, `03`, `06`이 들어올 실제 route shell, 네비게이션, 모듈 메뉴, 공통 페이지 패턴을 먼저 열어줍니다.
4. 당신은 전체 라우팅과 앱 쉘을 맡고, 각 모듈의 세부 CRUD 구현은 해당 스레드가 맡습니다.
5. 다른 스레드가 자신의 모듈 페이지를 붙일 수 있도록 파일 구조와 링크 구조를 안정적으로 정리합니다.

## 시작 조건

- 바로 시작

## 병렬 처리 방식

- `04`와 동시 진행
- `02`, `03`, `06`이 기다리지 않도록:
  - 공통 family app navigation
  - 모듈별 route path 규칙
  - list / detail / new / edit 페이지 쉘
  를 가능한 빨리 만듭니다.

## 당신의 책임 범위

- `apps/web/app`
- `apps/web/src/components`
- `apps/web/src/lib`
- 필요 시 `packages/platform`
- 필요 시 `packages/tenant`
- 필요 시 `tests`

## 이번 wave에서 해야 할 일

1. 가족 앱 내부에 모든 모듈로 이동 가능한 메뉴와 경로 구조를 만듭니다.
2. `app/[familySlug]` 아래에서 더 이상 비어 있는 페이지가 없도록 route map을 잡습니다.
3. 콘솔, 가족 입장, 가족 홈, 모듈 목록/상세/작성/수정 페이지가 제품처럼 이어지게 정리합니다.
4. `02`, `03`, `06`이 붙일 수 있는 공통 쉘과 링크 패턴을 제공합니다.
5. 필요하면 smoke test 또는 route-level 검증을 추가합니다.

## 이번 wave에서 하지 말 것

- 홈 카드 계약 재정의
- 인증 도메인 주도권 가져가기
- 모듈별 세부 CRUD를 독점 구현

## 블로커 처리 규칙

- `04`의 DB 인증이 아직 완전히 안 와도:
  - 페이지 쉘과 메뉴 구조는 먼저 완성합니다.
- 모듈 세부 구현이 아직 비어 있으면:
  - placeholder가 아니라 최소 usable shell을 만들고
  - 모듈 스레드가 이어붙일 위치를 분명히 남깁니다.
- 다른 스레드 소유 파일을 크게 바꿔야 한다면 HQ에 통합 포인트를 보고합니다.

## 완료 기준

- 사용자가 가족 홈에서 모든 모듈 페이지로 이동할 수 있습니다.
- 콘솔, 입장, 홈, 상세/작성/수정 흐름이 끊기지 않습니다.
- 전체 앱이 로컬에서 실제 제품처럼 탐색 가능합니다.

## 보고 형식

1. 현재 상태
2. 한 일
3. 변경 파일
4. 전체 동선과 로컬 테스트 방법
5. 다른 스레드가 붙일 통합 포인트
