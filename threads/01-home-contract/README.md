# 01 Home Contract

목표:

- 가족 홈의 카드 계약과 섹션 규칙을 기준선으로 고정합니다.

범위:

- `packages/dashboard`
- `apps/web/src/lib/dashboard-fixtures.ts`
- 필요 시 `docs/architecture.md`

핵심 할 일:

- 카드 payload 타입 정리
- 홈 섹션 순서 정리
- 우선순위 규칙 정리
- 다른 모듈 스레드가 따를 입력 계약 만들기

하지 말 것:

- 인증 구조 변경
- DB 마이그레이션 확장
- 개별 모듈 상세 데이터 모델 확장

완료 기준:

- `02`, `03`, `05`가 따라갈 수 있는 홈 카드 계약이 문서나 코드로 드러남
- 홈이 어떤 순서로 카드를 뽑는지 설명 가능함
