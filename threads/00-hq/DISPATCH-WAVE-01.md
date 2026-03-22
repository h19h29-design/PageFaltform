# Dispatch Wave 01

기준일: `2026-03-19`

이 wave의 목적은 `샘플 대시보드 피드`를 `실제 모듈별 피드 합성 구조`로 바꾸는 것입니다.

## HQ 판단

- `01-home-contract`는 선행 기준선을 이미 만들었습니다.
- 다음 메인 실행 대상은 `02`, `03`, `06` 병렬입니다.
- `05`는 위 세 결과를 받아 웹 런타임에 합성 연결합니다.
- `04`는 그 다음 wave에서 DB 전환 준비를 본격화합니다.

## Thread 01

역할:

- 새 구현이 기존 카드 계약을 벗어나지 않는지 감리
- 필요한 경우 계약 문서/타입의 작은 보강만 수행

지금 하지 말 것:

- 메인 구현 선도

## Thread 02

이번 wave 목표:

- `announcements`, `posts`, `gallery` 피드를 실제 런타임 합성에 넣을 준비를 끝낸다

핵심 산출물:

- 콘텐츠 모듈별 feed builder 유지/정리
- diary 처리 방향 결정 또는 최소 어댑터 추가

## Thread 03

이번 wave 목표:

- `calendar`, `todo`, `school-timetable`, `day-planner`를 하드코딩 fixture 상수에서 `builder 함수` 중심 구조로 바꾼다

핵심 산출물:

- familySlug, tenantId, timezone 기준 입력을 받는 feed builder
- 오늘 기준 / 보조 카드 기준 정리

## Thread 06

이번 wave 목표:

- `progress`, `habits` 카드 피드를 새로 만든다

핵심 산출물:

- tracker feed builder
- tracker fixture
- metric/streak 표현 규칙

## Thread 05

이번 wave 목표:

- `02`, `03`, `06` 결과를 웹 런타임에 합성한다

핵심 산출물:

- 모듈 피드 합성 함수
- `apps/web`가 `createSampleDashboardFeeds` 대신 실제 모듈 피드를 사용하도록 교체
- 가족별 enabled modules 순서와 홈 프리셋을 반영한 실제 런타임 연결

## Thread 04

이번 wave 상태:

- 대기

다음 wave 목표:

- 인증과 저장을 DB 전환 가능한 형태로 정리

## HQ가 각 스레드에 요구하는 공통 결과

1. 변경 파일
2. 검증 결과
3. 다음 스레드가 이어받아야 할 포인트
4. 공통 계약 변경 여부
