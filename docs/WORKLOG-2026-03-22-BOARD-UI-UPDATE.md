# YSplan 작업 기록 - 2026-03-22

## 오늘 한 일

- 가족 앱 홈을 정보 우선형으로 다시 정리했습니다.
- 게시판별 성격이 더 드러나도록 화면을 분리했습니다.
  - 일정: 월간 캘린더 + 일정 목록
  - 할 일: 체크리스트형 섹션
  - 시간표: 학교 시간표 표 형식
  - 목표: 진행률이 먼저 보이는 목표 보드
  - 루틴: 유지율과 반복 흐름이 보이는 루틴 보드
- 가족별 테마를 빌더에서 고를 수 있게 연결했습니다.
- 모바일 테스트용 별도 주소를 추가했습니다.
  - `/preview/mobile/[familySlug]`
- 가족 앱 네비게이션과 빌더, 요약 라벨을 한국어 중심으로 정리했습니다.
- 샘플 데이터 일부를 한국어 중심으로 보강했습니다.

## 오늘 기준 테스트 상태

- `npm run check` 통과
- `next build` 통과
- 주요 라우트 빌드 확인
  - `/`
  - `/sign-in`
  - `/sign-up`
  - `/console`
  - `/f/[familySlug]`
  - `/app/[familySlug]`
  - `/app/[familySlug]/calendar/[[...segments]]`
  - `/app/[familySlug]/todo/[[...segments]]`
  - `/app/[familySlug]/school-timetable/[[...segments]]`
  - `/app/[familySlug]/progress`
  - `/app/[familySlug]/habits`
  - `/preview/mobile/[familySlug]`

## 지금 바로 로컬에서 볼 주소

- 메인: `http://127.0.0.1:3001/`
- 가족 입장: `http://127.0.0.1:3001/f/yoon`
- 가족 앱: `http://127.0.0.1:3001/app/yoon`
- 모바일 미리보기: `http://127.0.0.1:3001/preview/mobile/yoon`
- 콘솔: `http://127.0.0.1:3001/console/sign-in`

## 테스트용 계정과 코드

- 콘솔 운영자: `owner@yoon.local / demo-owner`
- 가족 입장 코드: `yoon1234`

## 주요 변경 파일

- `apps/web/app/(family)/app/[familySlug]/page.tsx`
- `apps/web/app/(family)/app/[familySlug]/calendar/[[...segments]]/page.tsx`
- `apps/web/app/(family)/app/[familySlug]/todo/[[...segments]]/page.tsx`
- `apps/web/app/(family)/app/[familySlug]/school-timetable/[[...segments]]/page.tsx`
- `apps/web/app/(family)/app/[familySlug]/progress/page.tsx`
- `apps/web/app/(family)/app/[familySlug]/habits/page.tsx`
- `apps/web/app/(family)/preview/mobile/[familySlug]/page.tsx`
- `apps/web/src/components/family-app-shell.tsx`
- `apps/web/src/components/family-app-nav.tsx`
- `apps/web/src/components/family-builder-form.tsx`
- `apps/web/src/lib/family-app-routes.ts`
- `apps/web/src/lib/family-workspace.ts`
- `apps/web/src/lib/schedule-module-forms.tsx`
- `apps/web/src/lib/schedule-module-page-parts.tsx`
- `apps/web/src/lib/schedule-module-utils.ts`

## 다음에 바로 볼 포인트

- 남아 있는 영어/표현 톤을 실제 테스트하면서 더 다듬기
- 게시판별 작성 UX를 더 빠르게 만들기
- 모바일 전용 레이아웃과 데스크톱 레이아웃 차이를 더 벌리기
- 테마를 사용자 설정 화면에서 더 쉽게 바꾸게 다듬기
