# YSplan 작업 기록 - 2026-03-23

## 이번 변경의 목적

- 회원 상태를 `마스터 / 정회원 / 준회원`으로 다시 정리
- 가족홈 사용 흐름을 `가입 신청 -> 정회원 승인 -> 입장`으로 변경
- 정회원만 가족홈 생성 가능, 최대 5개 제한
- 비공개 가족홈은 가입자 외 비노출

## 핵심 변경

### 1. 플랫폼 계정 등급

- `마스터`
  - 테스트 기간 중 정회원 승격 승인 가능
  - 콘솔 접근 가능
  - 가족홈 생성 제한 없음
- `정회원`
  - 콘솔 접근 가능
  - 가족홈 생성 가능, 최대 5개
  - 다른 가족홈 가입 신청 가능
- `준회원`
  - 플랫폼 콘솔 사용 불가
  - 다른 가족홈 가입 신청 가능
  - 가족홈 생성 불가

### 2. 가족홈 가입 승인 흐름

- 회원가입은 기본적으로 `준회원`으로 생성
- 회원가입 화면에서 가족홈을 선택하면 해당 가족홈에 자동으로 `가입 신청`
- 가족홈 사용은 해당 가족홈의 정회원/관리자 승인 후 가능
- 승인되면 사용자 계정에 가족 멤버십이 부여되고 가족 입구에서 바로 입장 가능

### 3. 비공개 가족홈

- 가족 생성/수정 시 `공개 / 비공개` 선택 가능
- 비공개 가족홈은:
  - 공개 목록에서 숨김
  - 가입되지 않은 사용자는 직접 접근 시에도 노출되지 않음
  - 가입자, 소유자, 관리자만 접근 가능

### 4. 마스터 승인

- 콘솔 메인에 `정회원 승격 대기 계정` 섹션 추가
- 마스터 계정으로 준회원을 정회원으로 승격 가능

## 바뀐 주요 파일

- `packages/auth/src/index.ts`
- `packages/tenant/src/index.ts`
- `apps/web/src/lib/local-platform-auth.ts`
- `apps/web/src/lib/family-sites-store.ts`
- `apps/web/src/lib/family-join-requests.ts`
- `apps/web/src/lib/server-sessions.ts`
- `apps/web/src/actions/platform-auth-actions.ts`
- `apps/web/app/(family)/f/[familySlug]/page.tsx`
- `apps/web/app/(family)/f/[familySlug]/actions.ts`
- `apps/web/app/(console)/console/page.tsx`
- `apps/web/app/(console)/console/actions.ts`
- `apps/web/app/(console)/console/families/new/page.tsx`
- `apps/web/app/(console)/console/families/new/actions.ts`
- `apps/web/app/(console)/console/families/[familySlug]/page.tsx`
- `apps/web/app/(console)/console/families/[familySlug]/actions.ts`
- `apps/web/app/(public)/sign-up/page.tsx`

## 로컬 테스트 순서

### A. 마스터로 새 가족홈 만들기

1. `http://127.0.0.1:3001/console/sign-in`
2. 계정: `owner@yoon.local / demo-owner`
3. `가족홈 만들기`
4. 공개 범위를 `공개` 또는 `비공개`로 선택
5. 생성 후 `/console/families/{slug}` 에서 설정 확인

### B. 비회원 -> 준회원 가입 -> 가족 가입 신청

1. 로그아웃 또는 새 브라우저 세션
2. `http://127.0.0.1:3001/f/{slug}`
3. `회원가입 후 신청`
4. 계정 생성
5. 가입 직후 가족 입구로 돌아와 `승인 대기` 상태 확인

### C. 마스터/관리자 승인

1. 다시 콘솔 로그인
2. `/console/families/{slug}`
3. `가입 신청 관리` 섹션에서 승인

### D. 실제 가족홈 사용

1. 신청했던 계정으로 로그인
2. `http://127.0.0.1:3001/f/{slug}`
3. `승인된 계정으로 입장`
4. `/app/{slug}` 에서 게시판 실제 사용 확인

### E. 비공개 확인

1. 가족 설정에서 `비공개 가족홈` 저장
2. 로그아웃 후 `/` 목록에서 사라졌는지 확인
3. 가입되지 않은 계정으로 직접 `/f/{slug}` 접근 시 노출 차단 확인

## 검증

- `npm --workspace @ysplan/auth run typecheck`
- `npm --workspace @ysplan/tenant run typecheck`
- `npm --workspace @ysplan/web run typecheck`
- `npm run build`
- `http://127.0.0.1:3001/` 응답 확인
- `http://127.0.0.1:3001/f/yoon` 새 가입 신청 흐름 렌더 확인

## 현재 로컬 서버

- `http://127.0.0.1:3001`
