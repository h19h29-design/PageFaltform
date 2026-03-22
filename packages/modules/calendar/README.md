# calendar

일정/캘린더 모듈입니다.

가족 공용 일정, 개인 일정, 반복 일정, D-day 확장을 염두에 둡니다.

## 홈 카드 요약 기준

- today 카드에는 오늘 안에 움직여야 하는 가족 공용 일정만 먼저 올립니다.
- 시작 시각이 확정된 일정만 홈 카드 요약 대상으로 삼습니다.
- 개인 일정은 픽업, 식사, 돌봄처럼 가족 동선에 영향을 줄 때만 보조 카드 1장으로 제한합니다.

## fixture

- `calendarScheduleFixtures`: familySlug/tenantId 없이 유지하는 원본 일정 fixture
- `buildCalendarDashboardFeed({ familySlug, tenantId, timezone, now })`: today/focus 규칙으로 홈 카드 피드를 만드는 builder
- `calendarHomeFeedFixture`: builder로 만든 기본 샘플 피드
- `calendarTodayCardRules`: 가족 공용 우선과 개인 카드 제한 규칙
