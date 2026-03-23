# YSplan 작업기록 - 2026-03-23

## 이번 작업

- 전역 상단에 `설명 보기` 버튼을 추가했습니다.
- 설명성 문구는 기본으로 숨기고, 버튼을 눌렀을 때만 보이게 바꿨습니다.
- 로그인, 회원가입, 콘솔, 새 가족 생성 화면의 영어 문구를 한글로 정리했습니다.
- 공통 모듈 셸과 일부 상태 라벨의 영어 표기를 추가로 한글화했습니다.

## 주요 변경 파일

- `C:/gpt/01project/YSplan/packages/ui/src/explanation-toggle.tsx`
- `C:/gpt/01project/YSplan/packages/ui/src/index.tsx`
- `C:/gpt/01project/YSplan/apps/web/app/globals.css`
- `C:/gpt/01project/YSplan/apps/web/app/layout.tsx`
- `C:/gpt/01project/YSplan/apps/web/app/(public)/sign-in/page.tsx`
- `C:/gpt/01project/YSplan/apps/web/app/(public)/sign-up/page.tsx`
- `C:/gpt/01project/YSplan/apps/web/app/(console)/console/page.tsx`
- `C:/gpt/01project/YSplan/apps/web/app/(console)/console/families/new/page.tsx`
- `C:/gpt/01project/YSplan/apps/web/src/components/family-module-shell.tsx`

## 로컬 테스트

- 메인: `http://127.0.0.1:3001/`
- 로그인: `http://127.0.0.1:3001/sign-in`
- 회원가입: `http://127.0.0.1:3001/sign-up`
- 콘솔 로그인: `http://127.0.0.1:3001/console/sign-in`
- 가족 입구: `http://127.0.0.1:3001/f/yoon?step=access`

## 확인 포인트

- 상단에 `설명 보기` 버튼이 보이는지
- 버튼을 누르기 전에는 부가 설명 문구가 숨겨지는지
- 버튼을 누르면 숨겨진 설명이 다시 보이는지
- 로그인/회원가입/콘솔 주요 라벨이 한글로 보이는지
- `오늘`, `집중`, `인계` 같은 상태 라벨이 영어 대신 한글로 보이는지

## 검증

- `npm run check` 통과
- `http://127.0.0.1:3001/` 응답 확인
- `http://127.0.0.1:3001/sign-in` 응답 확인
- `http://127.0.0.1:3001/console/sign-in` 응답 확인
