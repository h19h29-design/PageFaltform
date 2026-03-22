# Dashboard Card Contract v1

## 목적

- 모든 모듈이 메인 홈으로 올리는 카드의 최소 공통 계약을 맞춘다.
- `packages/dashboard`는 이 계약만 보고 정렬, 승격, 숨김을 결정한다.
- 실제 DB 스키마가 나오기 전까지 `03 Dashboard Home` 기준선으로 사용한다.

## 가족 컨텍스트 공통값

| 필드 | 설명 |
| --- | --- |
| `familySlug` | 현재 진입한 가족 공간 식별자 |
| `tenantId` | 데이터 집계를 위한 테넌트 식별자 |
| `activeModuleKeys` | 현재 활성화된 모듈 목록 |
| `viewerRole` | 현재 사용자 역할 (`owner`, `admin`, `member`, `guest`, `child`) |
| `viewerState` | 로그인/비로그인, 읽기 전용 여부 |
| `timezone` | 홈의 오늘 집계 기준 시간대 |

## 대시보드 카드 최소 공통 필드

| 필드 | 필수 | 설명 |
| --- | --- | --- |
| `id` | 필수 | 카드 또는 원본 엔티티의 고유 식별자 |
| `tenantId` | 필수 | 가족 공간 식별자 |
| `moduleKey` | 필수 | 카드를 올린 모듈 키 (`announcements`, `calendar`, `todo`, `progress`, `habits`, `posts`, `gallery`) |
| `cardType` | 필수 | 카드 유형 |
| `title` | 필수 | 카드 제목 |
| `summary` | 필수 | 홈에서 바로 읽히는 1~2줄 요약 |
| `priority` | 필수 | 0~100 범위의 정렬 우선순위 |
| `featured` | 필수 | 홈 강조 노출 여부 |
| `pinned` | 필수 | 관리자가 메인 고정했는지 여부 |
| `displayStartsAt` | 선택 | 노출 시작 시각 |
| `displayEndsAt` | 선택 | 노출 종료 시각 |
| `visibilityScope` | 필수 | `all`, `adults`, `children-safe`, `admins`, `private` 중 하나 |
| `href` | 필수 | 카드 클릭 시 이동 경로 |
| `sectionHint` | 선택 | 희망 섹션 (`hero`, `today`, `focus`, `progress`, `recent`, `pinned`) |
| `badge` | 선택 | `중요`, `긴급`, `오늘`, `D-3` 같은 짧은 배지 |
| `startsAt` | 선택 | 일정 시작 시각 |
| `dueAt` | 선택 | 마감 시각 |
| `updatedAt` | 필수 | 최신 정렬 기준 시각 |
| `imageUrl` | 선택 | 사진/썸네일이 있는 카드용 대표 이미지 |
| `metricValue` | 선택 | 진행률, 완료율 같은 숫자 |
| `metricTarget` | 선택 | 진행률 목표값 |
| `metricUnit` | 선택 | `%`, `개`, `일` 등 단위 |

## 카드 타입 권장값

| `cardType` | 대표 모듈 | 용도 |
| --- | --- | --- |
| `announcement` | 공지 | 중요 전달, 읽음 확인 |
| `schedule` | 일정 | 오늘 일정, 곧 시작할 일정 |
| `todo` | 투두 | 마감 임박/오늘 해야 할 일 |
| `progress` | 진행률 | 퍼센트, 단계, 목표 달성 현황 |
| `habit` | 습관 | 루틴, 연속 기록 |
| `post` | 일반 글 | 최근 소식 |
| `gallery` | 사진 | 최근 사진, 앨범 업데이트 |
| `pinned` | 공통 | 장기 고정 카드, D-day |

## 카드 생산 모듈 계약

모든 모듈은 홈용 원본 데이터를 그대로 넘기지 않고, 아래 형태의 요약 payload를 만든다.

```json
{
  "moduleKey": "calendar",
  "generatedAt": "2026-03-17T09:00:00+09:00",
  "cards": [],
  "meta": {
    "visibleCount": 0,
    "featuredCount": 0
  }
}
```

### 공지 모듈

- `cardType`: `announcement`
- 우선순위 기준: `긴급 > 중요 > 일반`
- 선택 필드:
  - `badge`: `긴급`, `중요`
  - `featured`: 중요/긴급이면 기본 `true`
  - `pinned`: 상단 고정 공지일 때 `true`
- 읽음 확인이 필요한 공지는 `summary`에 확인 상태를 반영한다.

### 일정 모듈

- `cardType`: `schedule`
- 우선순위 기준: `오늘 시작`, `곧 시작`, `이번 주`
- 선택 필드:
  - `startsAt`
  - `badge`: `오늘`, `오전 10:30`, `D-1`
- 가족 공용 일정이 개인 일정보다 기본 우선한다.

### 투두 모듈

- `cardType`: `todo`
- 우선순위 기준: `지연`, `오늘 마감`, `이번 주`
- 선택 필드:
  - `dueAt`
  - `badge`: `오늘`, `지연`
- 오늘 할 일 묶음 카드는 최대 1개의 대표 카드만 홈에 올리는 것을 기본으로 한다.

### 진행률/습관 모듈

- `cardType`: `progress` 또는 `habit`
- 우선순위 기준: 가족 공통 목표, 연속 기록, 주간 달성률
- 선택 필드:
  - `metricValue`
  - `metricTarget`
  - `metricUnit`
  - `badge`: `72%`, `12일 연속`

### 글/사진 모듈

- `cardType`: `post`, `gallery`
- 우선순위 기준: 최신성 우선
- 기본적으로 `recent` 섹션에만 노출한다.
- 중요도 경쟁에서는 공지/일정/투두/진행률보다 뒤로 간다.

## 권한 판단 최소 축

| 축 | 설명 |
| --- | --- |
| `canRead` | 홈에서 카드를 볼 수 있는지 |
| `canWrite` | 원본 콘텐츠를 작성할 수 있는지 |
| `canEdit` | 원본 콘텐츠를 수정할 수 있는지 |
| `canManage` | 공지/일정/멤버 수준 관리가 가능한지 |
| `canFeatureOnHome` | 홈 노출, 고정, 우선순위를 조정할 수 있는지 |

## 권장 기본값

- `owner`: 전체 관리 + 홈 노출 설정 가능
- `admin`: 콘텐츠/일정 관리 + 홈 노출 설정 가능
- `member`: 일반 작성/수정 가능, 홈 노출 설정 불가
- `guest`: 읽기 중심
- `child`: 읽기 중심, `children-safe` 범위 우선

## 예시 카드 payload

```json
{
  "id": "announcement-welcome-week",
  "tenantId": "family_yoon",
  "moduleKey": "announcements",
  "cardType": "announcement",
  "title": "주말 가족 모임 일정 확인",
  "summary": "토요일 오후 2시에 외할머니 댁 방문 예정입니다.",
  "priority": 95,
  "featured": true,
  "pinned": false,
  "displayStartsAt": "2026-03-17T00:00:00+09:00",
  "displayEndsAt": "2026-03-20T23:59:59+09:00",
  "visibilityScope": "all",
  "href": "/app/yoon/announcements/welcome-week",
  "sectionHint": "focus",
  "badge": "중요",
  "updatedAt": "2026-03-17T08:10:00+09:00"
}
```

## 아직 열어둘 항목

- `child` 권한 범위를 모듈별로 얼마나 세밀하게 나눌지
- 개인 일정/개인 투두가 가족 홈에 들어오는 최대 범위
- 읽음 확인 공지의 강제성 수준
