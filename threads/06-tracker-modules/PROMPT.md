# 06 Tracker Modules Prompt

당신은 `YSplan / 06 Tracker Modules` 실행 스레드입니다.

이번 wave의 목표는 tracker 계열 모듈을 `실제 읽기/쓰기 가능한 페이지`로 완성하는 것입니다.

## 먼저 읽을 것

- `threads/CURRENT-STATE.md`
- `threads/COMMON-RULES.md`
- `threads/BOARD.md`
- `threads/00-hq/DISPATCH-WAVE-03.md`
- `threads/00-hq/LOCAL-TEST-MATRIX-WAVE-03.md`
- `threads/06-tracker-modules/README.md`
- `packages/modules/progress/src/index.ts`
- `packages/modules/habits/src/index.ts`

## 오케스트레이션 규칙

1. 바로 시작할 수 있습니다.
2. `05`의 공통 쉘을 기다리지 말고, 당신 범위의 `list / detail / new / edit / CRUD`를 먼저 만듭니다.
3. 인증/세션은 `04` 소유입니다. 인증이 완전히 안 열려도 tracker 페이지는 먼저 완성합니다.
4. progress/habit 카드 계약은 다시 정의하지 않고 현재 기준을 따릅니다.
5. 공통 메뉴나 상위 레이아웃은 `05`가 주도하므로 그 파일을 크게 건드리지 않습니다.

## 시작 조건

- 바로 시작 가능

## 병렬 처리 방식

- `04`, `05`, `02`, `03`과 병렬 진행
- 상위 route shell이 늦어도:
  - tracker 페이지와 폼, 액션부터 완성합니다.

## 당신의 책임 범위

- `packages/modules/progress`
- `packages/modules/habits`
- 필요 시 `apps/web/app/(family)/app/[familySlug]/...` 아래 tracker 계열 route

## 이번 wave에서 해야 할 일

1. `progress`, `habits`에 대해 `list`, `detail`, `new`, `edit` 페이지를 만듭니다.
2. 목표/루틴 생성, 수정, 삭제 가능한 폼과 액션을 만듭니다.
3. streak, 달성률, 유지율 메타가 상세/목록/홈 흐름에서 일관되게 보이게 합니다.
4. 홈의 progress band에서 들어가 실제 수정 후 다시 결과를 확인할 수 있게 만듭니다.
5. 로컬 테스트용 tracker CRUD 시나리오를 정리할 수 있게 만듭니다.

## 이번 wave에서 하지 말 것

- 홈 카드 계약 재정의
- 인증 구조 변경
- 콘텐츠/일정 모듈 구현
- 전체 앱 메뉴 재설계

## 블로커 처리 규칙

- 공통 메뉴나 상위 라우트가 늦어도 멈추지 않습니다.
- tracker 페이지/CRUD를 먼저 완성하고, 통합이 필요한 경로만 HQ에 보고합니다.

## 완료 기준

- tracker 계열의 `list / detail / new / edit`가 로컬에서 열립니다.
- 생성, 수정, 삭제가 직접 테스트 가능합니다.
- 홈 카드와 tracker 상세/편집이 실제로 이어집니다.

## 보고 형식

1. 현재 상태
2. 한 일
3. 변경 파일
4. 로컬 테스트 방법
5. `05` 또는 HQ가 이어받을 통합 포인트
