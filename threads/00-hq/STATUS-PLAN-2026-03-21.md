# YSplan Status and Plan

기준일: `2026-03-21`

## 확인 범위

- 스레드 `01`부터 `06`까지의 산출물을 실제 코드 기준으로 다시 확인했다.
- `npm run check`를 `2026-03-21`에 실행했고 통과했다.
- `http://127.0.0.1:3001/`는 `200 OK`로 응답했다.
- `npm run db:validate`는 `DATABASE_URL`이 없어 아직 실패한다.

## 스레드별 확인 결과

### 01 Home Contract

- 상태: 완료
- 핵심 결과:
  - `packages/dashboard/src/contracts.ts`
  - `packages/dashboard/src/home-model.ts`
- 메모:
  - 홈 카드 계약, 섹션 순서, preset 정책이 코드 기준선으로 고정됐다.
  - 이후에는 감리와 작은 보강 역할만 남아 있다.

### 02 Content Modules

- 상태: 완료
- 핵심 결과:
  - `packages/modules/announcements/src/index.ts`
  - `packages/modules/posts/src/index.ts`
  - `packages/modules/gallery/src/index.ts`
  - `packages/modules/diary/src/index.ts`
- 메모:
  - 콘텐츠 계열은 모두 대시보드 카드 feed builder를 갖고 있다.
  - `diary`도 `post/recent` 어댑터 방식으로 실제 builder에 올라왔다.

### 03 Schedule Modules

- 상태: 완료
- 핵심 결과:
  - `packages/modules/calendar/src/index.ts`
  - `packages/modules/todo/src/index.ts`
  - `packages/modules/school-timetable/src/index.ts`
  - `packages/modules/day-planner/src/index.ts`
- 메모:
  - 일정/할 일 계열은 모두 builder 함수 중심 구조로 올라왔다.
  - today / focus 규칙이 각 모듈 코드에 반영돼 있다.

### 04 Auth and Data

- 상태: 기반 완료, 런타임 연결 전
- 핵심 결과:
  - `packages/auth/src/index.ts`
  - `packages/database/prisma/schema.prisma`
  - `packages/database/src/auth-data-repositories.ts`
  - `packages/database/src/auth-data-bootstrap.ts`
  - `packages/database/src/auth-data-cli.ts`
  - `packages/database/src/auth-data-transition.ts`
- 메모:
  - Prisma 스키마, repository/service 경계, seed/import bootstrap CLI까지 들어왔다.
  - 하지만 웹 런타임은 아직 DB를 source of truth로 직접 쓰지 않는다.

### 05 Platform Builder and Deploy

- 상태: 완료
- 핵심 결과:
  - `packages/tenant/src/dashboard-feeds.ts`
  - `apps/web/src/lib/dashboard-fixtures.ts`
- 메모:
  - 모듈 합성이 direct builder 중심으로 정리됐다.
  - 기존 fallback/fixture 기반 합성의 핵심 구멍은 닫혔다.

### 06 Tracker Modules

- 상태: 완료
- 핵심 결과:
  - `packages/modules/progress/src/index.ts`
  - `packages/modules/habits/src/index.ts`
- 메모:
  - tracker 카드에 streak, 달성률, 유지율 메타가 반영됐다.
  - progress/habit feed builder가 웹 합성에 연결 가능한 형태로 준비됐다.

## 지금까지 진행된 것

- 가족 홈 카드 계약과 대시보드 모델이 코드 기준선으로 정리됐다.
- 콘텐츠, 일정, 트래커 계열 모듈이 모두 홈 카드용 feed builder를 갖게 됐다.
- 웹 가족 홈은 모듈 builder를 조합해 렌더링하는 구조로 올라왔다.
- 여러 미니 가족 홈을 로컬과 내부망에서 직접 만들고 볼 수 있는 콘솔 흐름이 있다.
- DB 전환을 위한 Prisma 스키마와 repository/service/bootstrap 코드가 생겼다.

## 아직 남은 핵심 과제

- 웹 런타임의 저장/조회 source of truth를 파일에서 DB로 실제 전환하기
- 콘솔 로그인과 가족 입장 세션을 demo/file 흐름에서 DB 기반으로 옮기기
- thread `work/REPORT.md` 파일들을 실제 결과로 채워 HQ 기록을 맞추기
- 브라우저 자동화 환경을 안정화해 E2E 테스트를 붙이기

## 현재 리스크와 제약

- `DATABASE_URL`이 없어서 Prisma validate/push/migrate 계열 검증은 아직 못 한다.
- 현재 인증 런타임은 여전히 쿠키 + 데모 사용자 + 파일 저장 흐름에 의존한다.
- 이 PC의 Chrome 실행 정책 때문에 Playwright 브라우저 자동화는 막혀 있다.

## 앞으로의 실행 계획

### 1. DB 환경 준비

- `.env`에 `DATABASE_URL`을 설정한다.
- 로컬 PostgreSQL을 준비한다.
- `npm run db:validate`
- `npm run db:generate`
- `npm run db:push`

### 2. 콘솔 저장 경로 DB 전환

- 가족 생성과 저장 액션이 `createAuthDataWriteService`를 타도록 연결한다.
- demo family와 custom family file store를 DB bootstrap/import 흐름에 연결한다.
- 콘솔 화면이 DB에서 가족 목록과 workspace를 읽도록 바꾼다.

### 3. 인증 런타임 DB 전환

- console sign-in이 demo 사용자 대신 DB 사용자와 membership을 보도록 바꾼다.
- 가족 입장 shared secret 검증이 hash + DB session row를 쓰도록 바꾼다.
- file/demo 흐름은 점진적으로 fallback 또는 migration path로만 남긴다.

### 4. 검증과 운영 정리

- thread 보고서 파일을 실제 결과로 채운다.
- 최소 smoke 테스트 또는 E2E 스크립트를 붙인다.
- 브라우저 자동화 환경 이슈를 정리한다.

## 로컬 테스트 정보

- 앱 주소: `http://127.0.0.1:3001`
- 내부망 주소: `http://10.137.23.25:3001`
- 콘솔 로그인: `http://127.0.0.1:3001/console/sign-in`
- 관리자 계정: `owner@yoon.local / demo-owner`
- 기본 가족 입장:
  - `http://127.0.0.1:3001/f/yoon` / `yoon1234`
  - `http://127.0.0.1:3001/f/park` / `springday`
- 미니 가족 홈:
  - `http://127.0.0.1:3001/f/mini-seoul` / `mini2026`
  - `http://127.0.0.1:3001/f/mini-river` / `river2026`

## 오늘 기준 검증 결과

- `npm run check`: 통과
- `curl -I http://127.0.0.1:3001/`: `200 OK`
- `npm run db:validate`: 실패
  - 원인: `DATABASE_URL` 미설정
