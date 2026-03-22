# todo

투두 리스트 모듈입니다.

개인/가족 공용 목록, 우선순위, 기한, 완료 상태를 관리합니다.

## 홈 카드 요약 기준

- 지연된 가족 공용 할 일을 가장 먼저 today 카드로 올립니다.
- 오늘 마감인 가족 공용 항목은 대표 카드 한 장으로 묶어 요약합니다.
- 개인 할 일은 가족 흐름을 막는 경우에만 adults 범위 보조 카드 1장으로 노출합니다.

## fixture

- `todoItemFixtures`: familySlug/tenantId 없이 유지하는 원본 할 일 fixture
- `buildTodoDashboardFeed({ familySlug, tenantId, timezone, now })`: today/focus 규칙으로 홈 카드 피드를 만드는 builder
- `todoHomeFeedFixture`: builder로 만든 기본 샘플 피드
- `todoHomeCardRules`: 지연, 오늘 마감, 개인 blocker 처리 규칙
