# Parallel Agents

이 폴더는 `YSplan`을 분야별 스레드로 나눠 병렬 진행할 때 쓰는 운영 문서 모음입니다.

이제부터는 현재 대화 스레드를 `총괄 허브`로 쓰고, 다른 스레드는 `실행 스레드`로 나눠 움직이는 방식을 기본으로 잡습니다.

## 먼저 볼 문서

1. [Control Tower](./00-coordinator/CONTROL-TOWER.md)
2. [Thread Board](./00-coordinator/THREAD-BOARD.md)
3. [Thread Kickoffs](./00-coordinator/THREAD-KICKOFFS.md)
4. [Shared Context](./_shared/project-context.md)

## 운영 방식

### 총괄 스레드

- 우선순위를 정합니다.
- 어떤 스레드를 열지 결정합니다.
- 공통 계약 변경 여부를 판단합니다.
- 각 스레드 결과를 모아 통합 판단을 내립니다.

### 실행 스레드

- 지정된 범위 안에서만 구현합니다.
- 완료 기준까지 작업합니다.
- 변경 파일, 검증 결과, 남은 리스크를 보고합니다.
- 공통 계약을 건드려야 하면 먼저 총괄 스레드로 되돌립니다.

## 권장 순서

1. `00 Coordinator`
2. `01 Foundation`
3. `03 Dashboard Home`
4. `04 Content Modules`, `05 Schedule Modules`, `07 Tracker and Routines`
5. `02 Entry and Auth`
6. `06 Platform, Admin, and Deploy`

현재 기준으로는 `01`이 기반선을 깔았고, `03`과 `06`이 다음 확장에 가장 큰 영향이 있습니다.

## 이 스레드에서 할 수 있는 지시 예시

- `03 스레드 열어. 홈 카드 계약부터 정리해`
- `04와 05 병렬로 돌릴 패킷 줘`
- `02는 DB 인증 전환 범위만 잘라서 보내`
- `현황판 업데이트해`
- `통합 관점에서 충돌 가능성 검토해`

## 실행 스레드 공통 규칙

- 시작 전에 `_shared/project-context.md`를 읽습니다.
- 해당 스레드의 `PROMPT.md`를 읽습니다.
- 가능하면 `THREAD-BOARD.md`의 최신 상태를 함께 읽습니다.
- 공통 패키지 변경은 신중하게 다룹니다.

공통 패키지:

- `packages/modules/core`
- `packages/dashboard`
- `packages/auth`
- `packages/tenant`
- `packages/database`
- `packages/ui`

## 참고 문서

- [Root README](../README.md)
- [Workstreams](../workstreams/README.md)
- [Architecture](../docs/architecture.md)
- [Roadmap](../docs/roadmap.md)
