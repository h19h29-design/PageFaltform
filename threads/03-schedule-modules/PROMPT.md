# 03 Schedule Modules Prompt

당신은 `YSplan / 03 Schedule Modules` 실행 스레드입니다.

이번 wave의 목표는 일정/할 일 계열 모듈을 `실제 읽기/쓰기 가능한 페이지`로 완성하는 것입니다.

## 먼저 읽을 것

- `threads/CURRENT-STATE.md`
- `threads/COMMON-RULES.md`
- `threads/BOARD.md`
- `threads/00-hq/DISPATCH-WAVE-03.md`
- `threads/00-hq/LOCAL-TEST-MATRIX-WAVE-03.md`
- `threads/03-schedule-modules/README.md`
- `packages/modules/calendar/src/index.ts`
- `packages/modules/todo/src/index.ts`
- `packages/modules/school-timetable/src/index.ts`
- `packages/modules/day-planner/src/index.ts`

## 오케스트레이션 규칙

1. 바로 시작할 수 있습니다.
2. `05`의 공통 쉘을 기다리지 말고, 당신 범위의 route / form / action / CRUD부터 먼저 만듭니다.
3. 인증/세션은 `04` 소유입니다. 인증이 완전하지 않아도 페이지와 CRUD는 먼저 진행합니다.
4. 공통 네비게이션이나 전체 레이아웃을 대신 설계하지 않습니다.
5. 일정 카드 규칙 자체는 `01` 계약을 따르고, 다시 정의하지 않습니다.

## 시작 조건

- 바로 시작 가능

## 병렬 처리 방식

- `04`, `05`, `02`, `06`과 병렬 진행
- `05`가 공통 route를 아직 정리 중이면:
  - 모듈별 `list / detail / new / edit`와 서버 액션을 먼저 구현

## 당신의 책임 범위

- `packages/modules/calendar`
- `packages/modules/todo`
- `packages/modules/school-timetable`
- `packages/modules/day-planner`
- 필요 시 `apps/web/app/(family)/app/[familySlug]/...` 아래 일정 계열 route

## 이번 wave에서 해야 할 일

1. `calendar`, `todo`, `school-timetable`, `day-planner`에 대해 `list`, `detail`, `new`, `edit` 페이지를 만듭니다.
2. 생성, 수정, 삭제 가능한 폼과 액션을 만듭니다.
3. today / focus 카드에서 실제 상세 또는 관련 목록으로 이어지게 합니다.
4. 수정 후 홈에서 다시 반영을 확인할 수 있게 흐름을 맞춥니다.
5. 로컬 테스트용 일정/할 일 CRUD 시나리오를 정리할 수 있게 만듭니다.

## 이번 wave에서 하지 말 것

- 홈 전체 섹션 규칙 재정의
- 가입/로그인 구조 변경
- 콘텐츠/트래커 모듈 구현
- 전체 앱 메뉴 구조 재설계

## 블로커 처리 규칙

- 상위 공통 route가 늦어도 멈추지 않습니다.
- 당신 범위 안에서 CRUD 화면과 액션을 먼저 완성합니다.
- 공유 네비게이션 연결이 필요하면 HQ에 필요한 route/path를 보고합니다.

## 완료 기준

- 일정/할 일 계열의 `list / detail / new / edit`가 로컬에서 열립니다.
- 생성, 수정, 삭제가 직접 테스트 가능합니다.
- 홈 카드와 실제 상세/목록 페이지가 연결됩니다.

## 보고 형식

1. 현재 상태
2. 한 일
3. 변경 파일
4. 로컬 테스트 방법
5. `05` 또는 HQ가 이어받을 통합 포인트
