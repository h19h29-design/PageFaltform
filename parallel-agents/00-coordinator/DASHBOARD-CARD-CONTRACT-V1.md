# Dashboard Card Contract v1

목적:

- `03 Dashboard Home`이 기준이 되고, `04`, `05`, `07`이 같은 방식으로 홈 카드 데이터를 올리도록 공통 계약 초안을 만든다.
- 이 문서는 구현 코드가 아니라 계약 문서다.

## 1. 적용 범위

초기 적용 모듈:

- 공지
- 일정
- 투두
- 진행률
- 습관

조건부 적용 모듈:

- 일반 글
- 갤러리
- 일기

메모:

- 초기 홈 허브는 "오늘 바로 봐야 할 것" 중심이라서 공지/일정/투두/진행률이 우선이다.

## 2. 홈 섹션 기본안

1. `hero`
2. `today-schedule`
3. `today-todos`
4. `important-announcements`
5. `progress-routines`
6. `recent-updates`
7. `pinned`

설명:

- `hero`는 환영 메시지, 날짜, 대표 문구 같은 정적 또는 반정적 정보다.
- `today-schedule`, `today-todos`, `important-announcements`, `progress-routines`는 핵심 운영 섹션이다.
- `recent-updates`는 여유가 있을 때만 노출해도 되는 보조 섹션이다.
- `pinned`는 관리자가 강하게 노출하고 싶은 항목을 담는다.

## 3. 카드 공통 필드

필수 필드:

```ts
type DashboardSection =
  | "today-schedule"
  | "today-todos"
  | "important-announcements"
  | "progress-routines"
  | "recent-updates"
  | "pinned";

type DashboardCard = {
  id: string;
  tenantId: string;
  moduleKey: string;
  cardType: string;
  section: DashboardSection;
  title: string;
  summary?: string;
  href: string;
  priority: number;
  featured: boolean;
  pinned: boolean;
  visibilityScope: string;
  startsAt?: string;
  endsAt?: string;
  occursAt?: string;
  createdAt: string;
  updatedAt: string;
};
```

권장 추가 필드:

```ts
type DashboardCardExtras = {
  badge?: string;
  imageUrl?: string;
  progressValue?: number;
  progressMax?: number;
  streakCount?: number;
  dueLabel?: string;
  audienceLabel?: string;
};
```

## 4. 노출 전 필수 필터

카드가 홈에 오르기 전에 아래 조건을 모두 통과해야 한다.

1. 현재 테넌트의 활성 모듈이어야 한다.
2. 현재 사용자 역할에서 읽기 가능한 항목이어야 한다.
3. `startsAt`이 있다면 현재 시각 이후에만 노출한다.
4. `endsAt`이 있다면 종료 이후에는 내린다.
5. 삭제 또는 비공개 상태가 아니어야 한다.

추가 메모:

- 공지와 고정 카드는 `featured`가 아니어도 홈에 올라올 수 있다.
- 일반 글, 갤러리, 일기는 기본적으로 `featured = true`일 때만 홈 후보가 된다.

## 5. 정렬 규칙 v1

전체 원칙:

1. `pinned = true`가 최우선
2. 섹션 고정 우선순위 적용
3. `priority` 높은 순
4. 시간 민감 카드 우선
5. 최신 수정 순

시간 민감 카드 예시:

- 오늘 일정
- 오늘 마감 투두
- 오늘 체크해야 하는 습관
- 종료 임박 공지

권장 해석:

- `priority`는 숫자가 클수록 우선으로 본다.
- 같은 `priority`라면 `occursAt` 또는 `endsAt`이 임박한 항목을 먼저 둔다.

## 6. 섹션별 슬롯 수 기본안

모바일:

- `today-schedule`: 3
- `today-todos`: 3
- `important-announcements`: 2
- `progress-routines`: 2
- `recent-updates`: 4
- `pinned`: 2

데스크톱:

- `today-schedule`: 4
- `today-todos`: 4
- `important-announcements`: 3
- `progress-routines`: 3
- `recent-updates`: 6
- `pinned`: 3

메모:

- `hero`는 카드 슬롯 개념보다 별도 배너 영역에 가깝다.
- 모바일에서는 카드 과밀을 막기 위해 `recent-updates`를 적극적으로 줄인다.

## 7. 모듈별 매핑 규칙

### 공지

- 기본 섹션: `important-announcements`
- `pinned = true`면 `pinned`에도 중복 노출 가능
- 긴급/중요 공지는 `badge`를 사용
- 읽음 확인이 필요한 경우 `summary`에 상태 요약을 붙이지 말고 상세에서 처리

### 일정

- 기본 섹션: `today-schedule`
- `occursAt` 또는 시작 시간이 오늘 범위 안에 있는 항목만 우선 노출
- 장기 일정은 오늘 관련성이 없으면 홈에서 제외 가능

### 투두

- 기본 섹션: `today-todos`
- 오늘 마감 또는 오늘 체크 대상만 우선 노출
- 완료 항목은 기본 숨김, 필요 시 요약 수치로만 노출

### 진행률

- 기본 섹션: `progress-routines`
- 퍼센트형은 `progressValue`, `progressMax` 사용
- 단계형은 `badge` 또는 `summary`로 표시

### 습관

- 기본 섹션: `progress-routines`
- 연속 기록은 `streakCount`로 표시
- 오늘 체크 필요 여부가 있으면 상단에 배치

### 일반 글/갤러리/일기

- 기본 섹션: `recent-updates`
- `featured = true` 또는 최근성 기준 충족 시만 홈 후보
- 갤러리는 이미지가 있을 때 `imageUrl` 사용 가능

## 8. 집계 책임 분리

### 각 모듈의 책임

- 자기 모듈 데이터에서 홈 후보를 뽑는다.
- 공통 `DashboardCard` 형식으로 변환한다.
- 읽기 권한과 기본 노출 조건을 1차 반영한다.

### `packages/dashboard`의 책임

- 섹션별 병합
- 전역 정렬
- 슬롯 컷오프
- 중복 제거
- 모바일/데스크톱별 노출량 조정

## 9. 충돌 방지 규칙

1. 새 모듈이 홈에 붙으려면 먼저 이 계약을 따라야 한다.
2. 공통 필드 추가는 개별 모듈 문서가 아니라 coordinator 문서와 architecture 문서를 먼저 갱신한다.
3. 카드 UI보다 payload 계약을 먼저 맞춘다.
4. `section` 이름은 임의로 늘리지 않는다.

## 10. v1에서 일부러 미루는 것

- 사용자별 카드 드래그 정렬
- 복잡한 추천 로직
- 실시간 홈 업데이트
- 카드별 세밀한 애니메이션 정책

## 11. 추후 검토 항목

- `recent-updates`를 글/사진으로 분리할지
- 기념일/D-day를 독립 섹션으로 올릴지
- 카드 중복 노출 허용 범위를 어디까지 둘지
- 개인 홈과 가족 홈을 나눌지
