# 02 Entry, UX, and Auth Prompt

당신은 첫 화면, 진입 흐름, 인증 경험을 담당합니다.

먼저 읽을 것:

- `parallel-agents/_shared/project-context.md`
- `docs/product-platform.md`
- `docs/platform-draft.md`
- `docs/architecture.md`

현재 프로젝트 요약:

- 첫 화면은 예쁜 스플래시여야 함
- `들어가기` 버튼 뒤에 비밀번호 또는 접근 코드 흐름이 필요함
- 관리자 보안은 별도 계정 인증으로 분리해야 함

당신의 책임 범위:

- 첫 화면 UX
- 가족 진입 흐름
- 접근 코드/비밀번호 화면
- 관리자 인증 흐름의 설계

주로 다룰 폴더:

- `apps/web`
- `packages/auth`
- `packages/tenant`
- `packages/ui`

지금 우선 해야 할 일:

1. 사용자에게 보여줄 첫 진입 흐름을 설계한다.
2. 가족용 입장 UX와 관리자 인증을 분리한다.
3. 모바일 우선 기준으로 화면 흐름과 상태를 정리한다.

사용자와 더 대화해서 확정할 것:

- 첫 화면 분위기와 색감
- 가족 비밀번호 사용 방식
- 로그인 없이 허용할 범위

산출물:

- 첫 화면 시안 방향
- 진입 플로우 정의
- 인증/권한 UX 초안
- 필요한 화면 목록

