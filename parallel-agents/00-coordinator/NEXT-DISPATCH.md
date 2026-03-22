# Next Dispatch

목적:

- `01`, `02`, `03` 회수 이후 coordinator가 다음 스트림에 무엇을 시켜야 하는지 바로 전달할 수 있게 한다.

## 1. 먼저 시킬 일

### `03 Dashboard Home` 후속 통합

먼저 해야 할 작업:

1. `packages/dashboard`를 워크스페이스 검증 범위에 넣는다.
2. 또는 `03` 핵심 로직을 실제 `apps/web` 홈 라우트에서 직접 사용하도록 연결한다.
3. `apps/web/src/lib/dashboard-fixtures.ts`와 `packages/dashboard/src/*` 중 하나를 단일 기준으로 정리한다.

왜 먼저 필요한가:

- `04`, `05`, `07`이 카드 어댑터를 만들기 전에, 어떤 계약을 어디에 연결해야 하는지가 하나로 정해져야 한다.

## 2. `04 Content Modules`에 시킬 일

목표:

- 공지, 일반 글, 갤러리 데이터에서 `Dashboard Card Contract v1` 형식의 요약 payload를 만든다.

필수 결과물:

1. `announcement -> dashboard card` 변환 함수
2. `post -> dashboard card` 변환 함수
3. `gallery -> dashboard card` 변환 함수
4. 공지의 중요/긴급/읽음 확인 정책이 반영된 샘플 카드

주의:

- 공지는 `important-announcements` 또는 `focus` 성격을 우선한다.
- 일반 글/갤러리는 `recent` 전용으로 시작한다.
- 홈 노출은 원본 폼에서 `featured/pinned/priority`를 다룰 수 있어야 한다.

## 3. `05 Schedule Modules`에 시킬 일

목표:

- 일정과 투두를 "오늘 집계" 기준으로 홈 카드에 올리는 어댑터를 만든다.

필수 결과물:

1. `calendar event -> dashboard card` 변환 함수
2. `todo item or grouped todo -> dashboard card` 변환 함수
3. 가족 타임존 기준의 today 계산 규칙
4. 오늘/지연/곧 시작 상태를 반영한 샘플 카드

주의:

- 개인 카드와 가족 공용 카드가 경쟁할 때의 기본 우선순위를 명시한다.
- 투두는 개별 카드 여러 개보다 대표 묶음 카드 전략을 먼저 검토한다.

## 4. `07 Tracker and Routines`에 시킬 일

목표:

- 진행률과 습관 데이터를 한눈에 읽히는 홈 카드로 요약한다.

필수 결과물:

1. `progress -> dashboard card` 변환 함수
2. `habit -> dashboard card` 변환 함수
3. 퍼센트형/개수형/연속형 표현 규칙
4. 가족 공통 목표와 개인 루틴의 우선순위 기준

주의:

- 상세 데이터가 아니라 요약값만 홈에 올린다.
- 가족 공통 목표는 개인 카드보다 우선 배치한다.

## 5. `02 Entry/Auth`와 `06 Platform/Admin`에 시킬 일

목표:

- 지금 데모 fixture로 동작하는 접근/권한 구조를 실제 DB 정책과 설정 화면으로 옮긴다.

필수 결과물:

1. `FamilyAccessPolicy`와 실제 검증 로직 연결
2. 관리자 콘솔에서 접근 정책을 수정하는 최소 화면 초안
3. 역할별 관리 권한이 문서와 맞는지 확인

주의:

- 가족 공유 비밀번호와 관리자 로그인은 계속 분리한다.
- `child`, `guest` 정책은 지나치게 복잡하게 열지 않는다.

## 6. coordinator가 회수할 때 꼭 볼 것

1. 새 카드가 `Dashboard Card Contract v1`을 따르는지
2. 역할이 `Role Permissions Draft`와 충돌하지 않는지
3. 샘플 데이터나 화면 예시가 포함됐는지
4. 다음 스트림이 이어받을 메모가 있는지
