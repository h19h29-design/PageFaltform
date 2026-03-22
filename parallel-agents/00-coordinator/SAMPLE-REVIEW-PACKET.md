# Sample Review Packet

목적:

- 다른 스트림 결과가 들어오면 coordinator가 사용자에게 어떤 형태로 보여줄지 미리 보는 샘플이다.
- 아래 내용은 현재 coordinator 문서의 임시 기본값을 기준으로 만든 예시다.

## 1. 완료 현황 예시

| 스트림 | 상태 | coordinator 판단 |
| --- | --- | --- |
| `01 Foundation` | 완료 | `02`, `03` 착수 가능 |
| `02 Entry/Auth` | 초안 완료 | 화면 흐름 검토 가능 |
| `03 Dashboard` | 초안 완료 | 카드 계약 검토 가능 |
| `04 Content Modules` | 대기 | 공지/일반 글 상세 착수 전 |
| `05 Schedule Modules` | 대기 | 오늘 집계 로직 대기 |
| `07 Tracker and Routines` | 대기 | 카드 규칙 확정 대기 |
| `06 Platform/Admin/Deploy` | 대기 | 설정 구조 대기 |

## 2. 사용자에게 바로 보여줄 결과 예시

### A. 진입 흐름 샘플

1. 사용자가 `/f/ys-house`에 진입한다.
2. 따뜻한 사진 중심 스플래시와 `들어가기` 버튼을 본다.
3. 가족 접근 비밀번호를 입력한다.
4. 성공 시 `/app/ys-house` 홈으로 이동한다.
5. 관리자 기능이 필요하면 별도 로그인 후 `/console` 접근이 열린다.

### B. 권한 차이 샘플

| 행동 | owner | admin | member | guest | child |
| --- | --- | --- | --- | --- | --- |
| 공지 작성 | Y | Y | N | N | N |
| 일반 글 작성 | Y | Y | Y | N | Limited |
| 메인 노출 설정 | Y | Y | N | N | N |
| 가족 설정 변경 | Y | N | N | N | N |

해석:

- 가족 공유 비밀번호로 들어왔다고 해서 관리자 기능이 열리지는 않는다.
- 메인 카드 노출 조정은 관리자 권한으로만 제한한다.

### C. 가족 홈 카드 샘플

기본 우선순위:

1. 중요 공지
2. 오늘 일정
3. 오늘 할 일
4. 진행률/습관
5. 최근 글/사진

샘플 카드 JSON:

```json
[
  {
    "id": "ann-001",
    "tenantId": "ys-house",
    "moduleKey": "announcements",
    "cardType": "announcement",
    "section": "important-announcements",
    "title": "이번 주 토요일 가족 모임",
    "summary": "오후 5시까지 외할머니댁 도착",
    "href": "/app/ys-house/announcements/ann-001",
    "priority": 100,
    "featured": true,
    "pinned": true,
    "visibilityScope": "family",
    "startsAt": "2026-03-17T09:00:00+09:00",
    "endsAt": "2026-03-22T23:00:00+09:00",
    "createdAt": "2026-03-17T09:00:00+09:00",
    "updatedAt": "2026-03-17T09:00:00+09:00",
    "badge": "중요"
  },
  {
    "id": "cal-014",
    "tenantId": "ys-house",
    "moduleKey": "calendar",
    "cardType": "calendar-event",
    "section": "today-schedule",
    "title": "민지 피아노 학원",
    "summary": "오후 4:30 - 5:30",
    "href": "/app/ys-house/calendar/cal-014",
    "priority": 80,
    "featured": true,
    "pinned": false,
    "visibilityScope": "family",
    "occursAt": "2026-03-17T16:30:00+09:00",
    "createdAt": "2026-03-16T21:00:00+09:00",
    "updatedAt": "2026-03-16T21:00:00+09:00",
    "dueLabel": "오늘 16:30"
  },
  {
    "id": "todo-022",
    "tenantId": "ys-house",
    "moduleKey": "todo",
    "cardType": "todo-item",
    "section": "today-todos",
    "title": "분리수거 내놓기",
    "summary": "저녁 8시 전까지",
    "href": "/app/ys-house/todo/todo-022",
    "priority": 70,
    "featured": true,
    "pinned": false,
    "visibilityScope": "family",
    "endsAt": "2026-03-17T20:00:00+09:00",
    "createdAt": "2026-03-17T07:00:00+09:00",
    "updatedAt": "2026-03-17T07:00:00+09:00",
    "dueLabel": "오늘 마감"
  },
  {
    "id": "habit-007",
    "tenantId": "ys-house",
    "moduleKey": "habits",
    "cardType": "habit-streak",
    "section": "progress-routines",
    "title": "영어 단어 20개",
    "summary": "7일 연속 기록 중",
    "href": "/app/ys-house/habits/habit-007",
    "priority": 60,
    "featured": true,
    "pinned": false,
    "visibilityScope": "family",
    "createdAt": "2026-03-17T06:30:00+09:00",
    "updatedAt": "2026-03-17T06:30:00+09:00",
    "streakCount": 7
  }
]
```

### D. 공지 게시판 샘플

샘플 필드:

- 제목: `이번 주 토요일 가족 모임`
- 공지 유형: `중요`
- 상단 고정: `예`
- 메인 노출: `예`
- 노출 기간: `2026-03-17 ~ 2026-03-22`
- 대상 범위: `family`
- 읽음 확인: `예`
- 댓글 허용: `아니오`

## 3. coordinator 판단 예시

- `02`와 `03`은 사용자 리뷰를 받을 정도의 초안 단계로 볼 수 있다.
- 지금 가장 큰 남은 리스크는 홈 우선 카드 3개와 공지의 실제 운영 방식이다.
- `04`, `05`, `07`은 카드 계약을 따라 바로 붙을 수 있다.

## 4. 사용자에게 바로 물을 질문 예시

1. 첫 화면이 지금처럼 따뜻한 감성형으로 가면 되는지
2. 홈 최상단 카드 3개가 공지/일정/할 일 순서가 맞는지
3. 공지에 읽음 확인을 기본으로 둘지, 중요 공지만 둘지
4. `child` 역할에 일반 글 쓰기까지 열지

## 5. 다음 액션 예시

- `04 Content Modules`: 공지 필드와 일반 글 차이 확정
- `05 Schedule Modules`: 오늘 집계 로직 확정
- `07 Tracker and Routines`: 진행률 카드 표현 방식 확정
