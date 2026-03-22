# Workstreams

이 폴더는 실제 구현 범위를 분야별로 나눈 실행 지도입니다.

총괄 운영은 [parallel-agents/00-coordinator/CONTROL-TOWER.md](../parallel-agents/00-coordinator/CONTROL-TOWER.md)에서 하고, 여기서는 각 스트림이 어디까지 책임지는지만 봅니다.

## 스트림 목록

- [01 Foundation](./01-foundation.md)
- [02 Entry and Auth](./02-entry-and-auth.md)
- [03 Dashboard Home](./03-dashboard-home.md)
- [04 Content Modules](./04-content-modules.md)
- [05 Schedule Modules](./05-schedule-modules.md)
- [06 Platform and Deploy](./06-platform-and-deploy.md)
- [07 Tracker and Routines](./07-tracker-and-routines.md)

## 스트림 사용 원칙

- 각 스트림은 자기 책임 범위를 먼저 지킵니다.
- 공통 계약 변경은 먼저 총괄 스레드에서 판단합니다.
- 모듈 구현보다 먼저 계약과 경계를 고정합니다.
- 스레드별 진행 상태는 `parallel-agents/00-coordinator/THREAD-BOARD.md`에 기록합니다.

## 현재 권장 가동 순서

1. `01 Foundation`
2. `03 Dashboard Home`
3. `04 Content Modules`와 `05 Schedule Modules`
4. `07 Tracker and Routines`
5. `02 Entry and Auth`
6. `06 Platform and Deploy`

## 총괄 스레드에 보고할 때 포함할 것

- 이번 스레드의 목표
- 실제 변경 파일
- 검증 결과
- 다음 스레드에 넘길 결정 사항
- 아직 남은 리스크
