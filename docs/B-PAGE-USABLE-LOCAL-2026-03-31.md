# B-page usable local status - 2026-03-31

## 결론

로컬에서 이제 `가족홈`과 `클럽`을 둘 다 테스트할 수 있는 수준까지 올렸습니다.

- 메인 통합 진입: 가능
- 가족 흐름: 가능
- 클럽 공개 탐색: 가능
- 클럽 가입 신청: 가능
- 클럽 승인: 가능
- 승인 후 클럽 멤버 앱 진입: 가능
- 클럽 멤버 모듈 읽기 화면: 가능

## 이번 턴에 닫은 핵심

### 1. 샘플 클럽도 실제로 수정/승인 가능한 구조로 변경

기존에는 샘플 클럽이 읽기 전용처럼 동작해서:

- 가입 승인 추가가 안 되고
- 샘플 클럽 관리 수정이 막히고
- 승인 후 실제 사용 흐름이 끊겼습니다.

이제는 샘플 클럽도 `custom override`로 승격해서:

- 멤버 승인 가능
- 설정 저장 가능
- 샘플 클럽으로도 실제 테스트 가능

### 2. 클럽 가입 상태 정리

`/clubs/[clubSlug]/join` 과 `/clubs/[clubSlug]` 기준으로:

- 이미 멤버면 바로 클럽 앱으로 진입 가능
- 신청 대기 중이면 대기 상태 표시
- 초대 우선 클럽이면 신청 대신 안내 표시
- 승인 후에는 공개 상세에서도 `클럽 들어가기` 버튼 표시

### 3. 클럽 멤버 전용 앱 추가

새 경로:

- `/clubs/[clubSlug]/app`
- `/clubs/[clubSlug]/app/[moduleKey]`

이제 승인된 멤버는:

- 클럽 전용 홈에 들어갈 수 있고
- 활성 모듈 목록을 볼 수 있고
- 공지, 이벤트, 갤러리, FAQ, 자료실, 리더보드 같은 모듈별 읽기 화면으로 이동할 수 있습니다.

## 이번 턴 핵심 파일

- `apps/web/src/lib/club-sites-store.ts`
- `apps/web/src/lib/club-join-requests.ts`
- `apps/web/src/lib/club-app-routes.ts`
- `apps/web/src/lib/club-app-access.ts`
- `apps/web/src/components/club-app-shell.tsx`
- `apps/web/app/(public)/clubs/[clubSlug]/page.tsx`
- `apps/web/app/(public)/clubs/[clubSlug]/join/page.tsx`
- `apps/web/app/(club)/clubs/[clubSlug]/app/page.tsx`
- `apps/web/app/(club)/clubs/[clubSlug]/app/[moduleKey]/page.tsx`
- `apps/web/app/(console)/console/clubs/[clubSlug]/actions.ts`

## 검증

### 빌드/타입

- `npm run typecheck --workspace @ysplan/web` 통과
- `npm run build` 통과

### HTTP 확인

- `/` -> `200`
- `/family` -> `200`
- `/club` -> `200`
- `/console/sign-in` -> `200`
- `/f/yoon` -> `200`
- `/clubs/bpage-running-crew` -> `200`
- `/clubs/bpage-running-crew/join` -> `200`
- `/api/health` -> `200`

### 클럽 멤버 앱 확인

로컬 함수 검증으로 아래 흐름을 확인했습니다.

1. 샘플 클럽 `bpage-running-crew`를 writable 상태로 저장 가능
2. 새 사용자 가입 요청 생성 가능
3. 요청 승인 가능
4. 승인 후 멤버가 club member로 추가됨
5. 승인된 멤버 세션 기준:
   - `/clubs/bpage-running-crew/app` -> `200`
   - `/clubs/bpage-running-crew/app/announcements` -> `200`
6. 비회원/비로그인 기준:
   - `/clubs/bpage-running-crew/app` -> `307`
   - `/clubs/bpage-running-crew/app/announcements` -> `307`

## 지금 바로 테스트할 주소

- 메인: `http://127.0.0.1:3001/`
- 가족 메인: `http://127.0.0.1:3001/family`
- 클럽 메인: `http://127.0.0.1:3001/club`
- 클럽 목록: `http://127.0.0.1:3001/clubs`
- 샘플 클럽 상세: `http://127.0.0.1:3001/clubs/bpage-running-crew`
- 샘플 클럽 가입: `http://127.0.0.1:3001/clubs/bpage-running-crew/join`
- 샘플 클럽 모바일 프리뷰: `http://127.0.0.1:3001/preview/mobile/club/bpage-running-crew`
- 콘솔 로그인: `http://127.0.0.1:3001/console/sign-in`
- 콘솔 마스터: `owner@yoon.local / demo-owner`
- 가족 입구: `http://127.0.0.1:3001/f/yoon`
- 가족 비밀번호: `yoon1234`

## 권장 테스트 순서

### 가족 쪽

1. `console/sign-in`
2. 가족 생성 또는 기존 가족 선택
3. `f/[slug]`
4. 입장 후 `app/[slug]`

### 클럽 쪽

1. `clubs/bpage-running-crew`
2. `가입 신청`
3. 콘솔에서 해당 클럽 승인
4. 승인된 계정으로 다시 상세 또는 join 진입
5. `클럽 들어가기`
6. `/clubs/[clubSlug]/app`
7. 모듈 페이지 이동

## 아직 남은 것

- 클럽 멤버 앱은 지금 `read-first` 버전입니다.
- 즉, 오늘 기준으로는 `읽고, 이동하고, 승인 흐름을 테스트하는 데는 충분`하지만,
  가족홈처럼 클럽 전용 CRUD 게시판까지 완전히 닫힌 것은 아닙니다.

다음 큰 작업은:

- 클럽 모듈 CRUD
- 클럽 관리자용 실시간 유지보수 흐름 강화
- 테마 스튜디오와 클럽 앱 연결 고도화
- NAS 배포 전 실브라우저 QA 정리
