# Thread Kickoffs

이 문서는 총괄 스레드에서 다른 스레드를 열 때 바로 붙여 넣을 수 있는 시작 패킷입니다.

각 스레드는 공통으로 아래 문서를 먼저 읽습니다.

- `parallel-agents/_shared/project-context.md`
- `parallel-agents/00-coordinator/THREAD-BOARD.md`
- 해당 스레드의 `PROMPT.md`

## 03 Dashboard Home

### 바로 보낼 패킷

목표:

- `dashboard card contract v1`를 정하고, 홈 섹션과 카드 정렬 규칙의 기준선을 만든다.

범위:

- `packages/dashboard`
- `apps/web/src/lib/dashboard-fixtures.ts`
- 홈 섹션 규칙 문서화가 필요하면 `docs/architecture.md`

하지 말 것:

- 개별 모듈의 상세 데이터 모델 확장
- DB 마이그레이션 직접 확장
- 관리자 인증 플로우 변경

완료 기준:

- 카드 payload 타입 또는 계약이 정리되어 있다.
- 홈 섹션 순서와 우선순위 규칙이 문서 또는 코드에 드러난다.
- `04`, `05`, `07`이 따라갈 수 있는 입력 계약이 생긴다.

보고 형식:

- 변경 파일
- 카드 계약 요약
- 남은 열린 질문

## 04 Content Modules

### 바로 보낼 패킷

목표:

- `announcements`, `posts`, `gallery`를 대시보드 카드 계약에 맞는 요약 단위로 연결한다.

범위:

- `packages/modules-announcements`
- `packages/modules-posts`
- `packages/modules-gallery`
- 필요 시 `packages/modules-core`

하지 말 것:

- 홈 전체 섹션 규칙 재정의
- 인증/권한 구조 변경

선행 조건:

- `03`의 카드 계약을 먼저 읽고 따른다.

완료 기준:

- 각 콘텐츠 모듈에서 홈 카드용 요약 데이터 변환 로직이 있다.
- 공지와 일반 글의 차이가 드러난다.
- 갤러리 카드가 기록형 홈에 맞게 요약된다.

## 05 Schedule Modules

### 바로 보낼 패킷

목표:

- `calendar`, `todo`, `school timetable`, `day planner`를 오늘 기준 카드 흐름으로 정리한다.

범위:

- `packages/modules-calendar`
- `packages/modules-todo`
- `packages/modules-school-timetable`
- `packages/modules-day-planner`

하지 말 것:

- 가족 입장 인증 구조 변경
- 플랫폼 설정 화면 작업

선행 조건:

- `03` 카드 계약을 먼저 따른다.

완료 기준:

- 일정/할 일 계열 카드 요약 규칙이 생긴다.
- today 기준 우선순위가 정리된다.
- 가족 공용 카드와 개인 카드의 처리 기준이 드러난다.

## 07 Tracker and Routines

### 바로 보낼 패킷

목표:

- `progress`, `habits`를 홈 카드 기준으로 요약해 붙인다.

범위:

- `packages/modules-progress`
- `packages/modules-habits`

하지 말 것:

- 홈 라우팅 구조 변경
- DB 권한 구조 변경

선행 조건:

- `03` 카드 계약을 먼저 따른다.

완료 기준:

- 진행률 카드와 루틴 카드의 요약 규칙이 생긴다.
- streak, 달성률, 유지율 표현 기준이 정리된다.

## 02 Entry and Auth

### 바로 보낼 패킷

목표:

- 현재 데모 기반 입장/로그인 구조를 실제 DB 중심 구조로 옮길 준비를 한다.

범위:

- `packages/auth`
- `apps/web/app/(family)`
- `apps/web/app/(console)`
- 필요 시 `packages/database`

하지 말 것:

- 대시보드 카드 계약 변경
- 모듈 UI 상세 구현

완료 기준:

- 가족 입장과 관리자 로그인 구조가 문서와 코드에서 더 분명히 분리된다.
- 역할 매트릭스 초안이 정리된다.
- DB 전환 시 필요한 스키마와 세션 요구사항이 드러난다.

## 06 Platform and Deploy

### 바로 보낼 패킷

목표:

- 미니 가족 홈 생성/편집/저장 흐름을 파일 기반에서 더 안정적인 운영 구조로 확장할 준비를 한다.

범위:

- `packages/platform`
- `packages/tenant`
- `infra`
- `tests`
- `apps/web/src/lib/family-sites-store.ts`

하지 말 것:

- 홈 카드 계약 재정의
- 개별 모듈 세부 카드 구현

완료 기준:

- 플랫폼 설정 화면에서 앞으로 확장할 설정 항목 목록이 정리된다.
- DB 저장 전환 체크리스트가 나온다.
- 내부망 운영과 배포 준비 체크리스트가 정리된다.
