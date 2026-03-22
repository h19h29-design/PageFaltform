# 03 Dashboard Home Report

## 이번에 정리한 결과

- `apps/web/dashboard-home-layout.md`
  - 메인 홈 섹션 구조 초안
  - 모바일/데스크톱 카드 개수 초안
  - 가족 홈 분위기 초안
- `apps/web/prototypes/dashboard-home/index.html`
  - 정적 브라우저 프로토타입
  - 반응형 카드 레이아웃과 샘플 카드 렌더링
- `packages/modules/core/dashboard-card-contract.md`
  - 모듈이 홈으로 올리는 카드 공통 계약
  - 권한 축과 예시 payload
- `packages/modules/core/src/dashboard-card.mjs`
  - 카드 가시성 판단
  - 섹션 지원 여부, 날짜 헬퍼
- `packages/dashboard/home-exposure-policy.md`
  - 메인 노출 규칙
  - 카드 우선순위와 tie-breaker
  - 오늘 집계 범위
- `packages/dashboard/src/home-exposure.mjs`
  - 카드 점수 계산
  - 섹션 배치
  - 홈 모델 생성
- `packages/dashboard/src/sample-home-cards.mjs`
  - 공지/일정/투두/진행률/습관/글/사진 샘플 카드
- `packages/ui/dashboard-card-ui-guidelines.md`
  - 카드 크기와 표현 원칙
  - 섹션별 UI 해석 기준

## 현재 기준선

- 홈 최우선 카드: 중요 공지 -> 오늘 일정 -> 오늘 할 일
- 홈 구조: `Hero -> Today -> Focus -> Progress -> Recent -> Pinned`
- 모바일 최대 카드 수: 8
- 데스크톱 최대 카드 수: 10
- 가족 홈 분위기: 따뜻한 사진 중심, 정보 확인은 빠르게

## 다른 스트림에 주는 영향

### `04 Content Modules`

- 공지/글/사진 모듈은 `Dashboard Card Contract v1`에 맞춘 요약 payload를 먼저 만든다.
- 공지는 중요/긴급 여부와 읽음 확인 여부를 홈 요약에 반영한다.

### `05 Schedule Modules`

- 일정/투두는 원본 목록 전체를 넘기지 말고 홈용 대표 카드로 집계한다.
- `Today` 기준은 가족 홈 시간대의 당일 00:00~23:59다.

### `07 Tracker and Routines`

- 진행률/습관은 퍼센트, 단계, 연속 기록처럼 요약 가능한 값만 홈으로 올린다.
- 가족 공통 목표 카드가 개인 카드보다 우선한다.

## 아직 사용자 확인이 필요하지만 임시로 잠근 값

- 첫 화면 사진 비중은 높게 둔다.
- 최근 글/사진보다 공지와 오늘 행동 유도 카드가 위에 온다.
- 개인 일정/개인 투두는 가족 공용 카드보다 한 단계 낮게 처리한다.

## 다음 권장 작업

1. `01 Foundation`이 실제 워크스페이스 구조를 만들면 문서 계약을 코드 타입으로 옮긴다.
2. `02 Entry/Auth`에서 가족 컨텍스트와 역할 판별 값을 이 계약에 연결한다.
3. `04`, `05`, `07`은 홈용 요약 payload 샘플을 같은 스키마로 맞춘다.
4. 정적 프로토타입을 실제 `apps/web` 라우트로 이식한다.
