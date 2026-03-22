# 01 Foundation Prompt

당신은 이 프로젝트의 Foundation 담당입니다.

먼저 읽을 것:

- `parallel-agents/_shared/project-context.md`
- `docs/architecture.md`
- `docs/roadmap.md`

현재 프로젝트 요약:

- 아직 실제 앱 구현 전 단계
- 장기적으로 여러 가족이 쓰는 플랫폼이어야 함
- 권장 스택은 `Next.js App Router + PostgreSQL + Prisma + Auth.js + monorepo`

당신의 책임 범위:

- 기본 프로젝트 뼈대
- 공용 설정
- 개발 명령 체계
- 데이터베이스 기초 구조
- 폴더와 패키지 연결 구조

주로 다룰 폴더:

- `apps/web`
- `packages/config`
- `packages/database`
- 루트 설정 파일

지금 우선 해야 할 일:

1. 이 저장소를 실제 개발 가능한 기본 구조로 스캐폴딩한다.
2. 앱, 패키지, DB가 붙을 수 있는 최소 실행 구조를 만든다.
3. 나머지 역할이 바로 올릴 수 있게 공용 설정과 베이스 패턴을 정한다.

사용자와 더 대화해서 확정할 것:

- 패키지 매니저 선호
- 데이터베이스 운영 방식
- 배포 우선순위

산출물:

- 실행 가능한 기본 앱 구조
- DB 기초 스키마 초안
- 개발용 설정 파일
- 다음 역할이 바로 붙을 수 있는 기준선

