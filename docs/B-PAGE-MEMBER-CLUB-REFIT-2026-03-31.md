# B-page Member and Club Refit

날짜: 2026-03-31

## 이번 단계 목표

- 가족 멤버 화면에서 남아 있던 설명형 상세 화면 축소
- 공통 fallback 모듈 페이지의 상단 설명 제거
- 클럽 멤버 공간을 설명형 데모에서 보드형 멤버 화면으로 정리
- 깨진 한글이 보이는 공통 가족 화면 복구

## 바뀐 내용

### 1. 목표 / 루틴 상세 정리

- `apps/web/app/(family)/app/[familySlug]/progress/[goalSlug]/page.tsx`
- `apps/web/app/(family)/app/[familySlug]/habits/[habitSlug]/page.tsx`

변경:

- Hero 중심 설명 화면 제거
- 진행 수치 / 표시 설정 / 한 줄 목표(루틴) / 정리 액션 중심으로 재배치
- 상단 액션을 `수정 / 목록 / 홈`으로 단순화

### 2. fallback 모듈 페이지 설명 제거

- `apps/web/app/(family)/app/[familySlug]/[moduleKey]/page.tsx`
- `apps/web/app/(family)/app/[familySlug]/[moduleKey]/new/page.tsx`
- `apps/web/app/(family)/app/[familySlug]/[moduleKey]/[itemSlug]/page.tsx`
- `apps/web/app/(family)/app/[familySlug]/[moduleKey]/[itemSlug]/edit/page.tsx`

변경:

- `subtitle={spec.summary}` 제거
- 제목을 한국어 실사용형으로 정리

### 3. 클럽 멤버 홈 정리

- `apps/web/app/(club)/clubs/[clubSlug]/app/page.tsx`

변경:

- 설명성 카드보다 `지금 바로 보기`, `열린 공간`, `공개와 멤버 공간` 중심으로 재배치
- 멤버가 실제로 보는 보드처럼 요약 정보와 모듈 진입을 앞세움

### 4. 클럽 모듈 페이지 정리

- `apps/web/app/(club)/clubs/[clubSlug]/app/[moduleKey]/page.tsx`

변경:

- 정적 스토리형 설명을 줄이고 보드형 레이아웃으로 정리
- `현재 상태`, `지금 보이는 카드`, 빠른 이동 위주로 재구성

### 5. 공통 가족 화면 한글 복구

- `apps/web/src/components/family-app-shell.tsx`
- `apps/web/src/components/family-app-nav.tsx`
- `apps/web/app/(family)/app/[familySlug]/page.tsx`

변경:

- 깨진 한글 라벨 정리
- 가족 멤버 공간 공통 제목과 네비 텍스트 정리

## 검증

- `npm run typecheck --workspace @ysplan/web` 통과
- `npm run build` 통과
- 서버 응답 확인:
  - `/` `200`
  - `/family` `200`
  - `/club` `200`
  - `/f/yoon` `200`
  - `/console/sign-in` `200`

## 현재 로컬 테스트 주소

- 메인: `http://127.0.0.1:3001/`
- 가족 공개: `http://127.0.0.1:3001/family`
- 클럽 공개: `http://127.0.0.1:3001/club`
- 가족 입구: `http://127.0.0.1:3001/f/yoon`
- 콘솔 로그인: `http://127.0.0.1:3001/console/sign-in`

## 다음에 바로 가면 좋은 것

1. 클럽 `announcements / events / gallery` 실제 CRUD 붙이기
2. 콘텐츠 상세/수정 화면의 남은 개발 설명 문구 정리
3. 가족/클럽 공통 화면의 깨진 문자열 마지막 정리
