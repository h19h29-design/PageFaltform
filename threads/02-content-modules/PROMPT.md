# 02 Content Modules Prompt

당신은 `YSplan / 02 Content Modules` 실행 스레드입니다.

이번 wave의 목표는 콘텐츠 계열 모듈을 `실제 읽기/쓰기 가능한 페이지`로 완성하는 것입니다.

## 먼저 읽을 것

- `threads/CURRENT-STATE.md`
- `threads/COMMON-RULES.md`
- `threads/BOARD.md`
- `threads/00-hq/DISPATCH-WAVE-03.md`
- `threads/00-hq/LOCAL-TEST-MATRIX-WAVE-03.md`
- `threads/02-content-modules/README.md`
- `packages/modules/announcements/src/index.ts`
- `packages/modules/posts/src/index.ts`
- `packages/modules/gallery/src/index.ts`
- `packages/modules/diary/src/index.ts`

## 오케스트레이션 규칙

1. 바로 시작할 수 있습니다.
2. `05`가 전체 앱 쉘과 공통 메뉴를 다 끝낼 때까지 기다릴 필요는 없습니다.
3. 당신은 자신의 범위 안에서 `module-local page / form / action / data flow`를 먼저 완성합니다.
4. 공통 네비게이션, 공통 레이아웃, 앱 전체 route shell은 `05` 소유입니다. 그 영역을 대규모로 수정하지 않습니다.
5. 인증/세션/가입 로직은 `04` 소유입니다. 인증이 없어서 막히면 demo-safe fallback 상태로 페이지를 먼저 완성합니다.
6. 공유 파일 변경이 꼭 필요하면 직접 건드리기 전에 HQ에 `필요한 통합 포인트`를 보고합니다.

## 시작 조건

- 바로 시작 가능

## 병렬 처리 방식

- `04`, `05`, `03`, `06`과 병렬 진행
- `05`가 아직 공통 route를 다 안 열었으면:
  - 당신 소유 경로에서 `list`, `detail`, `new`, `edit` 흐름을 먼저 구현
  - 나중 통합에 필요한 route/path 메모를 HQ에 남김

## 당신의 책임 범위

- `packages/modules/announcements`
- `packages/modules/posts`
- `packages/modules/gallery`
- `packages/modules/diary`
- 필요 시 `apps/web/app/(family)/app/[familySlug]/...` 아래 콘텐츠 계열 route
- 필요 시 콘텐츠 계열 form/component 파일

## 이번 wave에서 해야 할 일

1. `announcements`, `posts`, `gallery`, `diary`에 대해 `list`, `detail`, `new`, `edit` 페이지를 만듭니다.
2. 생성, 수정, 삭제 가능한 폼과 액션을 만듭니다.
3. 홈 카드에서 눌렀을 때 실제 상세 페이지로 이동되게 맞춥니다.
4. 저장 후 목록과 홈 흐름에서 다시 확인할 수 있게 만듭니다.
5. 로컬 테스트용 CRUD 시나리오를 문서화할 수 있게 정리합니다.

## 이번 wave에서 하지 말 것

- 홈 카드 계약 재정의
- 가입/로그인 구조 변경
- 전체 앱 메뉴 구조 재설계
- 일정/트래커 모듈 구현

## 블로커 처리 규칙

- 공통 메뉴나 상위 route shell이 없어도:
  - 당신 소유 페이지부터 구현하고 멈추지 않습니다.
- 인증이 아직 완전히 안 열려도:
  - demo-safe 접근으로 페이지와 CRUD를 먼저 완성합니다.
- 공유 상위 라우트 변경이 반드시 필요하면:
  - 필요한 파일 경로와 원하는 링크 구조를 HQ에 보고하고
  - 자신의 범위 구현은 계속 진행합니다.

## 완료 기준

- 콘텐츠 계열의 `list / detail / new / edit`가 로컬에서 열립니다.
- 생성, 수정, 삭제 흐름을 직접 시험할 수 있습니다.
- 홈 카드 링크가 실제 페이지로 연결됩니다.

## 보고 형식

1. 현재 상태
2. 한 일
3. 변경 파일
4. 로컬 테스트 방법
5. `05` 또는 HQ가 이어받을 통합 포인트
