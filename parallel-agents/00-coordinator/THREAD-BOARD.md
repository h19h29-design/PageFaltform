# Thread Board

기준일: `2026-03-19`

이 문서는 총괄 스레드에서 각 실행 스레드의 상태를 빠르게 파악하기 위한 현황판입니다.

## 현재 상태

| Thread | 상태 | 현재 기준선 | 다음 우선 과제 |
| --- | --- | --- | --- |
| `00 Coordinator` | active | 총괄 허브 운영, 범위 조정, 통합 검토 | 스레드별 디스패치와 상태 관리 유지 |
| `01 Foundation` | stable | monorepo, Next.js, Prisma 7, 공용 설정, 기본 패키지 구조 완료 | DB 실제 연결과 마이그레이션 체계 안정화 |
| `02 Entry and Auth` | ready | 데모 관리자 로그인, 가족 입장 비밀값 흐름, 세션 분리 동작 | DB 기반 인증/권한 구조와 실제 역할 매트릭스 연결 |
| `03 Dashboard Home` | highest | 랜딩, 가족 입구, 가족 홈, 홈 프리셋/모듈 순서 UI까지 로컬 동작 | `dashboard card contract v1` 정의와 홈 섹션 규칙 고정 |
| `04 Content Modules` | waiting-on-03 | `announcements`, `posts`, `gallery` 모듈 골격과 목업 데이터 존재 | 콘텐츠 모듈을 카드 계약에 맞는 요약 payload로 변환 |
| `05 Schedule Modules` | waiting-on-03 | `calendar`, `todo`, `school timetable`, `day planner` 골격 존재 | 일정/할 일 계열의 today 기준 카드 요약 규칙 정의 |
| `07 Tracker and Routines` | waiting-on-03 | `progress`, `habits` 골격 존재 | 진행률, 연속성, 루틴 체크 카드 규칙 정의 |
| `06 Platform and Deploy` | in-progress | 콘솔에서 미니 가족 홈 생성, 서버 파일 저장, 내부망 LAN 미리보기 가능 | DB 저장 전환, 운영 설정 화면 확장, 배포 체크리스트 정리 |

## 지금 총괄 스레드가 알고 있어야 할 핵심 사실

- 여러 개의 미니 가족 홈을 콘솔에서 직접 만들 수 있습니다.
- 생성된 가족 홈은 서버 파일 저장소에 기록되어 내부망 다른 기기에서도 같이 보입니다.
- 로컬 내부망 확인 주소는 `http://10.137.23.25:3001` 입니다.
- 현재 인증과 데이터는 일부 데모/파일 기반이므로, 다음 단계에서 DB 전환이 중요합니다.

## 추천 디스패치 순서

1. `03 Dashboard Home`
2. `04 Content Modules`
3. `05 Schedule Modules`
4. `07 Tracker and Routines`
5. `02 Entry and Auth`
6. `06 Platform and Deploy`

## 총괄 관점의 주의 구간

### 계약 충돌 가능성 높음

- `packages/dashboard`
- `packages/modules/core`
- `packages/auth`
- `packages/database`
- `packages/tenant`

### 바로 병렬 가능한 조합

- `04` + `05`
- `04` + `07`
- `05` + `07`

조건:

- `03`에서 카드 계약과 섹션 규칙이 먼저 나와야 합니다.

## 이 문서를 갱신하는 경우

- 새 스레드를 열었을 때
- 어떤 스레드가 완료되었을 때
- 공통 계약이 바뀌었을 때
- 우선순위가 바뀌었을 때
