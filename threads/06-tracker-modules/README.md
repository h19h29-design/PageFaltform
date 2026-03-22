# 06 Tracker Modules

목표:

- `progress`, `habits`를 가족 홈 카드 계약에 맞는 실제 모듈 피드로 연결합니다.

범위:

- `packages/modules/progress`
- `packages/modules/habits`
- 필요 시 `packages/modules/core`

핵심 할 일:

- 진행률 카드 요약 규칙
- 습관 카드 요약 규칙
- streak, 달성률, 유지율 표현 기준
- 트래커 모듈 fixture와 피드 생성 함수 정리

하지 말 것:

- 홈 전체 섹션 규칙 재정의
- 인증/권한 구조 변경
- 플랫폼 저장 구조 변경

선행 조건:

- `01-home-contract` 기준선을 따른다

완료 기준:

- `progress`, `habits` 모두 홈 카드 피드를 만들 수 있다
- `05`가 웹 런타임에 바로 붙일 수 있는 출력 구조가 있다
