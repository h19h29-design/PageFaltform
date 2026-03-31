# B-page User-First UI Refit

날짜: 2026-03-31

## 이번 정리 목적

- 설명을 읽지 않아도 바로 사용할 수 있게 화면 우선순위를 재정리
- 가족/클럽 멤버 화면의 상단 설명 카드 축소
- 한 테마 한 폰트 원칙 적용
- 색상만 다른 테마가 아니라 모서리, 표면감, 그림자까지 달라지게 정리

## 핵심 변경

### 1. 가족 멤버 화면 상단 축소

- `apps/web/src/components/family-app-shell.tsx`
  - 기존 상단 설명 카드 제거
  - 얇은 컨텍스트 바와 하단 `백스테이지` 패널로 변경

- `apps/web/app/(family)/app/[familySlug]/page.tsx`
  - 홈 상단 요약 카드를 줄이고 바로 카드/게시판 위주로 시작
  - 모듈 카드와 홈 카드 중심으로 재배치

- `apps/web/src/components/family-module-shell.tsx`
  - 공통 모듈 셸의 설명성 블록을 제거하고 빠른 이동 중심으로 단순화

### 2. 일정/체크리스트/시간표/데이플래너 설명 축소

- `apps/web/app/(family)/app/[familySlug]/calendar/[[...segments]]/page.tsx`
- `apps/web/app/(family)/app/[familySlug]/todo/[[...segments]]/page.tsx`
- `apps/web/app/(family)/app/[familySlug]/school-timetable/[[...segments]]/page.tsx`
- `apps/web/app/(family)/app/[familySlug]/day-planner/[[...segments]]/page.tsx`

위 네 화면에서:

- 상단 `설명`, `규칙`, `입력 전에 볼 규칙` 성격의 카드 제거 또는 뒤쪽으로 이동
- 목록과 입력 폼이 먼저 보이게 정리

### 3. 클럽 멤버 화면도 같은 방향으로 정리

- `apps/web/src/components/club-app-shell.tsx`
- `apps/web/src/lib/club-app-access.ts`

- 가족 쪽과 같은 컨텍스트 바 / 백스테이지 구조 적용
- 클럽도 동일한 테마 토큰을 공유하도록 정리

### 4. 테마 구조 재정리

- `apps/web/src/lib/shared-themes.ts`
- `apps/web/src/lib/theme-scene.ts`
- `apps/web/src/components/theme-preset-selector.tsx`
- `apps/web/app/(console)/console/themes/page.tsx`
- `apps/web/app/layout.tsx`

변경 내용:

- 한 테마당 하나의 폰트만 사용
- `shapePreset`, `surfacePreset` 추가
- 테마별로 카드 반경, 버튼 반경, 표면감, 그림자가 달라짐
- 테마 선택 카드와 콘솔 테마 화면도 새 구조를 반영

### 5. 전역 스타일 정리

- `apps/web/app/globals.css`

변경 내용:

- 설명보다 사용을 우선하는 member 화면 정리
- `member-context-strip`, `member-backstage-panel` 추가
- pill, button, input, swatch를 테마 반경 변수로 통일
- 카드와 히어로 표면도 테마 토큰을 따라가게 조정

## 추가 정리

- 예전 `.jsx`, `.js` 복제 페이지 파일 제거
  - dev 서버 중복 라우트 경고 해소

## 검증

- `npm run typecheck --workspace @ysplan/web` 통과
- `npm run build` 통과
- 로컬 서버 `http://127.0.0.1:3001` 응답 확인

## 지금 테스트 포인트

- 가족 멤버 화면 상단이 설명 카드가 아니라 얇은 상태 바처럼 보이는지
- 가족 홈이 설명보다 카드와 게시판 위주로 시작하는지
- 일정 / 체크리스트 / 시간표 / 데이플래너가 바로 입력/목록 중심으로 보이는지
- 테마마다 폰트와 표면감이 실제로 달라 보이는지
