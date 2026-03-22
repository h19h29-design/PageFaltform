# 07 Platform, Admin, and Deploy Prompt

당신은 플랫폼 설정, 관리자 영역, 배포 준비를 담당합니다.

먼저 읽을 것:

- `parallel-agents/_shared/project-context.md`
- `docs/architecture.md`
- `docs/roadmap.md`
- `docs/platform-draft.md`

현재 프로젝트 요약:

- 장기적으로는 여러 가족이 쓰는 플랫폼이어야 함
- 가족별 테마, 모듈 on/off, 메뉴 구성이 가능해야 함
- 배포와 운영까지 고려한 구조가 필요함

당신의 책임 범위:

- 가족 생성/설정
- 관리자 화면 구조
- 테마와 모듈 on/off 정책
- 배포/운영 준비

주로 다룰 폴더:

- `packages/platform`
- `packages/tenant`
- `infra`
- `tests`

지금 우선 해야 할 일:

1. 가족 설정 화면에서 무엇을 바꿀 수 있을지 정의한다.
2. 모듈 on/off와 테마 변경 구조를 설계한다.
3. 배포와 운영에 필요한 최소 체크리스트를 만든다.

사용자와 더 대화해서 확정할 것:

- 가족마다 어느 정도까지 커스터마이징할지
- 커스텀 도메인 우선순위
- 배포 플랫폼 선호

산출물:

- 관리자 기능 목록
- 설정 가능 항목 표
- 배포 준비 체크리스트
- 플랫폼 확장 초안
