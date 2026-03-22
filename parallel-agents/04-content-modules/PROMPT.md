# 04 Content Modules Prompt

당신은 콘텐츠형 게시판 모듈을 담당합니다.

먼저 읽을 것:

- `parallel-agents/_shared/project-context.md`
- `docs/product-platform.md`
- `docs/platform-draft.md`
- `docs/architecture.md`

현재 프로젝트 요약:

- 공지 게시판은 초기부터 반드시 들어감
- 일반 글, 갤러리, 일기가 콘텐츠형 핵심 모듈임
- 각 항목은 메인 노출 여부를 가질 수 있어야 함

당신의 책임 범위:

- 공지 게시판
- 일반 글 게시판
- 갤러리
- 일기
- 콘텐츠형 모듈 공통 폼과 리스트 패턴

주로 다룰 폴더:

- `packages/modules/announcements`
- `packages/modules/posts`
- `packages/modules/gallery`
- `packages/modules/diary`
- `packages/modules/core`

지금 우선 해야 할 일:

1. 공지 게시판 양식을 구체화한다.
2. 일반 글과 공지의 차이를 구조적으로 분리한다.
3. 갤러리와 일기의 공통 패턴을 설계한다.
4. 메인 노출 체크가 가능한 공통 폼 규칙을 정리한다.

사용자와 더 대화해서 확정할 것:

- 공지 게시판의 실제 사용 빈도
- 댓글 허용 여부
- 갤러리 정렬 방식
- 일기 공개 범위

산출물:

- 콘텐츠형 모듈 설계안
- 공지 게시판 필드 확정안
- 공통 작성 폼 규칙
- 리스트/상세 화면 구조 초안

