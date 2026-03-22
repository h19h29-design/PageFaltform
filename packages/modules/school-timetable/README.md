# school-timetable

학교/학원 시간표 모듈입니다.

요일별 반복 시간표와 가족 구성원별 시간표 분리가 중요합니다.

## 홈 카드 요약 기준

- 오늘의 등교, 하교, 학원처럼 가족 이동에 직접 연결되는 흐름을 우선 노출합니다.
- 준비물과 특이사항은 보호자 협업이 필요할 때만 보조 카드로 올립니다.
- 학생 개인 시간표는 홈에서 최대 1장만 노출해 주간 보드가 홈을 덮지 않게 유지합니다.

## fixture

- `schoolTimetableFixtures`: familySlug/tenantId 없이 유지하는 학교/학원 원본 fixture
- `buildSchoolTimetableDashboardFeed({ familySlug, tenantId, timezone, now })`: today/focus 규칙으로 홈 카드 피드를 만드는 builder
- `schoolTimetableHomeFeedFixture`: builder로 만든 기본 샘플 피드
- `schoolTimetableHomeCardRules`: 가족 이동 우선과 학생별 보조 카드 규칙
