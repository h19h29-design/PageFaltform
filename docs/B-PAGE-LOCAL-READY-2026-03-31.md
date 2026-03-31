# B-page Local Ready - 2026-03-31

## 이번 턴에 닫은 것

- `B-page` 통합 기준으로 `family / club / 공통 진입` 라우트가 다시 빌드 가능 상태로 복구됨
- 공용 테마 소스(`shared-themes`)를 가족/클럽 콘솔에서 같이 쓰도록 정리함
- 클럽 관리 화면에서 테마 선택 UI를 공통 `ThemePresetSelector`로 통일함
- 클럽 모바일 프리뷰 라우트와 콘솔 테마 스튜디오 라우트의 import 경로 오류를 수정함
- 콘솔 메인에서 가족 카드에 잘못 섞여 있던 클럽 모바일 링크 버그를 제거함
- 로컬 DB baseline은 `YSPLAN_ENABLE_DB_BASELINE=1`일 때만 강제로 타도록 유지해서, 기본 로컬 테스트가 덜 막히게 맞춤

## 실제 검증 결과

- `npm run typecheck --workspace @ysplan/web` 통과
- `npm run build` 통과
- 최신 서버를 `http://127.0.0.1:3001` 에서 다시 실행 확인

### HTTP 확인

- `/` -> `200`
- `/family` -> `200`
- `/club` -> `200`
- `/clubs` -> `200`
- `/clubs/bpage-running-crew` -> `200`
- `/clubs/bpage-running-crew/join` -> `200`
- `/preview/mobile/club/bpage-running-crew` -> `200`
- `/sign-in` -> `200`
- `/sign-up` -> `200`
- `/f/yoon` -> `200`
- `/app/yoon` -> `307` (가족 세션 없으면 정상 리다이렉트)
- `/console/sign-in` -> `200`
- `/console/themes` -> `307` (콘솔 세션 없으면 정상 리다이렉트)
- `/api/health` -> `200`

## 지금 바로 테스트할 주소

### 메인 진입

- `http://127.0.0.1:3001/`
- `http://127.0.0.1:3001/family`
- `http://127.0.0.1:3001/club`

### 가족 흐름

- 가족 입구: `http://127.0.0.1:3001/f/yoon`
- 가족 앱: `http://127.0.0.1:3001/app/yoon`
- 가족 모바일 프리뷰: `http://127.0.0.1:3001/preview/mobile/yoon`

### 클럽 흐름

- 클럽 목록: `http://127.0.0.1:3001/clubs`
- 샘플 클럽 상세: `http://127.0.0.1:3001/clubs/bpage-running-crew`
- 샘플 클럽 가입: `http://127.0.0.1:3001/clubs/bpage-running-crew/join`
- 클럽 모바일 프리뷰: `http://127.0.0.1:3001/preview/mobile/club/bpage-running-crew`

### 콘솔 흐름

- 콘솔 로그인: `http://127.0.0.1:3001/console/sign-in`
- 콘솔 메인: `http://127.0.0.1:3001/console`
- 가족 생성: `http://127.0.0.1:3001/console/families/new`
- 클럽 생성: `http://127.0.0.1:3001/console/clubs/new`
- 테마 스튜디오: `http://127.0.0.1:3001/console/themes`

## 테스트 계정

- 콘솔 마스터: `owner@yoon.local / demo-owner`
- 기본 가족 입장: `yoon1234`

## 이번 턴에서 손댄 핵심 파일

- `apps/web/src/lib/family-sites-store.ts`
- `apps/web/app/(console)/console/page.tsx`
- `apps/web/app/(console)/console/themes/page.tsx`
- `apps/web/app/(public)/preview/mobile/club/[clubSlug]/page.tsx`
- `apps/web/app/(console)/console/clubs/[clubSlug]/page.tsx`
- `apps/web/src/components/theme-preset-selector.tsx`

## 다음 큰 작업

- `B-page` 메인 홈에서 가족/클럽 선택 경험을 더 완성형으로 다듬기
- 클럽 쪽 member-only app 영역과 실제 CRUD 모듈 붙이기
- 가족/클럽 공통 계정 정책을 웹 UX에서 더 분명하게 보이게 만들기
- NAS 배포 전 로컬 브라우저 실사용 QA 체크리스트 돌리기
