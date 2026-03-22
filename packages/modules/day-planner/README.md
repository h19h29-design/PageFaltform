# day-planner

24시간 하루 시간표 모듈입니다.

하루 단위 블록 계획과 실제 수행 체크를 다룰 수 있게 설계합니다.

## 홈 카드 요약 기준

- 픽업, 식사, 숙제처럼 가족이 같이 맞춰야 하는 시간 블록을 today 카드로 우선 노출합니다.
- 하루 전체가 아니라 다음 행동 전환이 필요한 블록만 간결하게 요약합니다.
- 개인 플래너는 돌봄 담당 전환 같은 핸드오프가 생길 때만 보조 카드 1장으로 공유합니다.

## fixture

- `dayPlannerBlockFixtures`: familySlug/tenantId 없이 유지하는 시간 블록 원본 fixture
- `buildDayPlannerDashboardFeed({ familySlug, tenantId, timezone, now })`: today/focus 규칙으로 홈 카드 피드를 만드는 builder
- `dayPlannerHomeFeedFixture`: builder로 만든 기본 샘플 피드
- `dayPlannerHomeCardRules`: 가족 공동 블록 우선과 개인 핸드오프 규칙
