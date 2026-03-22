# Dispatch Wave 02

기준일: `2026-03-19`

이 wave의 목적은 `남아 있는 fallback/fixture 합성 구간을 닫고`, 다음 단계인 `DB source of truth 전환`을 실제 작업선으로 올리는 것입니다.

## HQ 판단

- `06-tracker-modules`는 패키지 기준으로 완료되었습니다.
- 하지만 웹 런타임 합성기인 `packages/tenant/src/dashboard-feeds.ts`는 아직 `progress`, `habits`, `diary`를 fallback으로, 일정 계열을 fixture adapter로 처리하고 있습니다.
- 이번 wave의 메인 실행 대상은 `05`와 `04`입니다.
- `01`은 계약 감리만 맡고, `02`, `03`, `06`은 필요한 경우 지원만 붙입니다.

## Thread 05

이번 wave 목표:

- `packages/tenant/src/dashboard-feeds.ts`가 완료된 모듈들의 `실제 builder`를 직접 사용하도록 바꿉니다.

이번 wave에서 해야 할 일:

1. `calendar`, `todo`, `school-timetable`, `day-planner`를 fixture adapter가 아니라 각 패키지의 builder 함수로 직접 연결합니다.
2. `diary`, `progress`, `habits`를 tenant fallback이 아니라 각 패키지의 builder 함수로 직접 연결합니다.
3. `familySlug`, `tenantId`, `timezone`, `generatedAt/now`가 모든 builder에 일관되게 전달되도록 정리합니다.
4. `sourceByModule`가 실제 source를 정확히 보여주도록 맞춥니다.
5. 가족별 enabled modules, 순서, preset이 실제 합성 결과에 그대로 반영되는지 다시 검증합니다.

완료 기준:

- `diary`, `progress`, `habits`에 tenant fallback이 남아 있지 않습니다.
- 일정 계열이 fixture adapter가 아니라 direct builder 연결로 바뀝니다.
- 웹 가족 홈이 실질적으로 `모듈 builder 중심 합성` 상태가 됩니다.

검증 요청:

1. `npm run check`
2. `/`
3. `/console/sign-in`
4. `/f/[familySlug]`
5. `/app/[familySlug]`

## Thread 04

이번 wave 목표:

- 파일/데모 기반 저장과 인증을 DB source of truth로 옮기기 위한 첫 실제 실행선을 만듭니다.

이번 wave에서 해야 할 일:

1. `FamilyTenant`, `FamilyWorkspace`, `EnabledModule`, `FamilyAccessPolicy`, `User`, `Membership` 기준의 read/write 경계 또는 service/repository 초안을 만듭니다.
2. 현재 demo families, demo operator users, file-based custom families/workspace drafts를 DB로 옮길 seed/import entry point를 만듭니다.
3. 콘솔 생성/저장과 가족 입장 세션이 앞으로 어떤 DB 경로를 타야 하는지 코드 기준으로 분리합니다.
4. 아직 런타임 전체 컷오버는 하지 않되, `파일만 source of truth인 상태`는 이번 wave에서 깨기 시작합니다.

완료 기준:

- DB 전환용 서비스 경계가 생깁니다.
- seed/import 시작점이 생깁니다.
- 다음 wave에서 실제 콘솔 저장/가족 입장 DB 컷오버를 바로 시작할 수 있습니다.

주의:

- 기존 내부망 데모 흐름을 깨지 말 것
- 이번 wave에서 전체 인증 재설계까지 한 번에 하려고 하지 말 것

## Thread 01

이번 wave 역할:

- 감리 전용

이번 wave에서 해야 할 일:

1. `05`가 direct builder 합성으로 바꾼 뒤 카드 계약을 벗어나는 지점이 없는지 확인합니다.
2. tracker 카드가 progress 섹션 규칙과 충돌하지 않는지 확인합니다.
3. 꼭 필요한 경우에만 계약 타입/문서를 작게 보강합니다.

## Thread 02

이번 wave 역할:

- 지원 전용

지원 포인트:

- `05`가 `diary` 또는 콘텐츠 카드 메타 연결 중 막히면 즉시 보조

## Thread 03

이번 wave 역할:

- 지원 전용

지원 포인트:

- `05`가 일정 계열 direct builder 연결 중 입력 구조나 규칙 정리에서 막히면 즉시 보조

## Thread 06

이번 wave 역할:

- 지원 전용

지원 포인트:

- `05`가 `progress`, `habits` 카드 메타나 입력 구조 연결 중 막히면 즉시 보조

## HQ가 각 스레드에 요구하는 공통 결과

1. 한 일
2. 변경 파일
3. 검증 결과
4. 다음 스레드가 이어받아야 할 포인트
5. 남은 리스크
