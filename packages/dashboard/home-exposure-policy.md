# Home Exposure Policy v1

## 목적

- 가족 홈 카드의 최소 payload 계약을 `packages/dashboard`에서 하나로 고정한다.
- 홈 프리셋, 섹션 순서, 카드 점수 규칙을 코드와 문서에서 같은 기준으로 유지한다.
- `02`, `03`, `05` 스레드가 바로 따라올 수 있는 입력 구조를 제공한다.

## 기준 입력 구조

모듈은 원본 엔티티를 그대로 넘기지 않고 아래 feed 계약을 만든다.

```json
{
  "moduleKey": "calendar",
  "generatedAt": "2026-03-19T09:00:00+09:00",
  "cards": [],
  "meta": {
    "visibleCount": 0,
    "featuredCount": 0
  }
}
```

각 `cards[]` 원소는 아래 공통 필드를 따른다.

- 필수: `id`, `tenantId`, `moduleKey`, `cardType`, `title`, `summary`, `priority`, `featured`, `pinned`, `visibilityScope`, `href`, `updatedAt`
- 선택: `displayStartsAt`, `displayEndsAt`, `sectionHint`, `badge`, `startsAt`, `dueAt`, `imageUrl`, `metricValue`, `metricTarget`, `metricUnit`

### 홈 집계 컨텍스트

- `familySlug`: 현재 가족 홈 식별자
- `tenantId`: 카드가 속한 가족 공간 식별자
- `activeModuleKeys`: 현재 켜진 모듈 순서
- `viewerRole`: `owner | admin | member | guest | child`
- `viewerState`: 예시 `signed-in`, `signed-out`, `read-only`
- `timezone`: 오늘/당장 판단 기준 시간대
- `preset`: `balanced | planner | story`

## 섹션 규칙

### 공통 슬롯 수

| 섹션 | 역할 | 허용 카드 | 데스크톱 | 모바일 |
| --- | --- | --- | --- | --- |
| `Hero` | 이번 방문의 단일 최우선 카드 | 모든 일반 카드 | 1 | 1 |
| `Pinned` | 장기 리마인더, D-day, 고정 카드 | 모든 카드 (`pinned = true` 우선) | 1 | 1 |
| `Today` | 오늘 바로 움직여야 하는 카드 | `announcement`, `schedule`, `todo` | 2 | 2 |
| `Focus` | 지금 챙겨야 하지만 당장은 아닌 카드 | `announcement`, `schedule`, `todo` | 2 | 1 |
| `Progress` | 루틴, 목표, 진행률 | `progress`, `habit` | 2 | 1 |
| `Recent` | 최신 글, 일기, 사진 | `post`, `gallery` | 2 | 2 |

총량은 슬롯 수의 합으로 결정된다.

- 데스크톱: 최대 10장
- 모바일: 최대 8장

### 프리셋별 섹션 순서

| 프리셋 | 섹션 순서 |
| --- | --- |
| `balanced` | `Hero -> Pinned -> Today -> Focus -> Progress -> Recent` |
| `planner` | `Hero -> Today -> Focus -> Pinned -> Progress -> Recent` |
| `story` | `Hero -> Pinned -> Recent -> Progress -> Today -> Focus` |

## Hero 선택 규칙

1. `sectionHint = hero` 인 카드가 있으면 그중 최고 점수 카드가 `Hero`를 차지한다.
2. 없으면 `pinned`가 아닌 카드 중 최고 점수 카드가 `Hero`를 차지한다.
3. `Hero`로 승격된 카드는 원래 섹션에서 제거한다.

## 기본 섹션 배치 규칙

- `pinned = true` 또는 `cardType = pinned` 이면 `Pinned`
- `sectionHint`가 있고 그 섹션이 해당 카드 타입을 허용하면 그 섹션을 우선
- `announcement`: 기본 `Today`, `featured`면 `Focus`
- `schedule`, `todo`: `timezone` 기준 오늘이면 `Today`, 아니면 `Focus`
- `progress`, `habit`: `Progress`
- `post`, `gallery`: `Recent`

## 점수 규칙

### 기본 점수 축

| 카드 유형 | 기본 점수 |
| --- | --- |
| `announcement` | 70 |
| `schedule` | 68 |
| `todo` | 66 |
| `progress` | 58 |
| `habit` | 55 |
| `post` | 40 |
| `gallery` | 38 |
| `pinned` | 50 |

### 공통 보정

| 조건 | 보정값 |
| --- | --- |
| `pinned = true` | `1000`으로 고정, 일반 경쟁에서 제외 |
| `featured = true` | `+8` |
| `badge`에 `중요` 포함 | `+5` |
| 공지 배지에 `긴급` 포함 | `+10` |
| 일정 시작이 3시간 이내 | `+4` |
| 투두 배지에 `오늘` 포함 | `+4` |
| 투두 배지에 `지연` 포함 | `+4` |
| 진행률/습관 배지에 `가족` 포함 | `+3` |
| `visibilityScope = private` | `-3` |

### 프리셋별 카드 타입 보정

| 프리셋 | 추가 보정 |
| --- | --- |
| `balanced` | 공지 `+2`, 일정 `+1`, 투두 `+1` |
| `planner` | 일정 `+6`, 투두 `+6`, 공지 `+2`, 진행률/습관 `+1`, 글/사진 `-3` |
| `story` | 글 `+5`, 사진 `+6`, 진행률/습관 `+2`, 공지 `+1`, 일정/투두 `-3` |

## 같은 점수일 때 정렬 기준

1. `featured = true`
2. `dueAt`, `startsAt` 중 더 이른 시각
3. `updatedAt` 이 더 최근인 카드
4. 현재 `activeModuleKeys` 에서 더 앞선 모듈
5. 그래도 같으면 제목 오름차순

중요한 점은 모듈 순서가 전역 섹션 규칙을 뒤엎지 않는다는 점이다.

- 모듈 on/off: 어떤 feed가 집계에 참여하는지 결정
- 모듈 순서: 같은 우선순위 카드의 마지막 tie-breaker

## 권한/가시성 규칙

- `displayStartsAt` 이전, `displayEndsAt` 이후 카드는 비노출
- `children-safe` 는 누구나 노출
- `adults` 는 `child` 에게 비노출
- `admins` 는 `owner`, `admin` 에게만 노출
- `private` 는 `owner`, `admin`, `member` 에게만 노출

## 스레드별 기준선

### `02-content-modules`

- `announcements` 는 `announcement`
- `posts`, `diary` 는 `post`
- `gallery` 는 `gallery`

### `03-schedule-modules`

- `calendar`, `school-timetable`, `day-planner` 는 `schedule`
- `todo` 는 `todo`

### `05-platform-builder-deploy`

- 빌더는 `activeModuleKeys` 순서와 `preset`만 저장한다.
- 홈 우선순위 자체는 `packages/dashboard` 규칙이 결정한다.
