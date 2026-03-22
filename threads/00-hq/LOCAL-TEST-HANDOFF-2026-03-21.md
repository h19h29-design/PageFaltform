# YSplan 로컬 테스트 핸드오프

작성일: 2026-03-21

## 지금 바로 테스트 가능한 것

- 일반 회원가입
- 일반 로그인
- 가족 입장
- 콘텐츠 CRUD
  - announcements
  - posts
  - gallery
  - diary
- 일정/체크리스트 CRUD
  - calendar
  - todo
  - school-timetable
  - day-planner
- 트래커 CRUD
  - progress
  - habits
- 콘솔 로그인과 가족 빌더

## 기본 주소

- 홈: `http://127.0.0.1:3001/`
- 회원가입: `http://127.0.0.1:3001/sign-up`
- 일반 로그인: `http://127.0.0.1:3001/sign-in`
- 콘솔 로그인: `http://127.0.0.1:3001/console/sign-in`
- 가족 입장: `http://127.0.0.1:3001/f/yoon`
- 가족 앱 홈: `http://127.0.0.1:3001/app/yoon`

## 빠른 테스트 순서

1. `/sign-up` 에서 계정을 만듭니다.
2. `Join one family now` 에서 `yoon` 을 고릅니다.
3. 가입 후 `/f/yoon?step=access` 로 이동하면 `yoon1234` 로 입장합니다.
4. `/app/yoon` 에서 홈과 모듈 런처를 확인합니다.
5. 아래 모듈에서 생성/수정/삭제를 직접 시험합니다.

## 콘솔 데모 계정

- `owner@yoon.local / demo-owner`

## 가족 입장용 비밀번호/코드

- `yoon` -> `yoon1234`
- `park` -> `springday`
- `mini-seoul` -> `mini2026`
- `mini-river` -> `river2026`

## 추천 테스트 경로

### 콘텐츠

- `/app/yoon/announcements`
- `/app/yoon/posts`
- `/app/yoon/gallery`
- `/app/yoon/diary`

### 일정/체크리스트

- `/app/yoon/calendar`
- `/app/yoon/todo`
- `/app/yoon/school-timetable`
- `/app/yoon/day-planner`

### 트래커

- `/app/yoon/progress`
- `/app/yoon/habits`

## 이번 통합 검증에서 실제로 만든 샘플 데이터

- announcement: `Wave 03 announcement`
- todo: `Wave 03 todo updated`
- school timetable: `After-school English`
- progress: `Wave 03 reading goal`

이 항목들은 목록/상세/수정 흐름이 실제로 통과했는지 확인하기 위해 남겨둔 예시 데이터입니다.

## 현재 로컬 런타임 방식

- `DATABASE_URL` 이 없으면:
  - 일반 회원가입/로그인: 로컬 파일 저장소 사용
  - 콘텐츠/일정/트래커 CRUD: 로컬 파일 저장소 사용
  - 콘솔: demo fallback 사용
- `DATABASE_URL` 이 있으면:
  - 가입/로그인/세션은 DB 경로를 탑니다.

## 확인 완료 메모

- `npm run check` 통과
- 가족 앱 주요 라우트 `200` 확인
- 실제 서버 액션 POST로 다음 흐름 검증 완료
  - sign-up
  - sign-in
  - family access
  - announcement create
  - todo create/update
  - school timetable create
  - progress create

## 참고

- 브라우저 자동화는 이 PC의 Chrome 정책 때문에 막혀 있어, 이번 검증은 실제 HTTP 폼 제출과 라우트 응답 기준으로 확인했습니다.
