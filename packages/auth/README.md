# packages/auth

인증과 세션 경계를 정리하는 패키지입니다.

핵심 원칙:

- 가족 입장(`/f/[familySlug]`)과 관리자 콘솔 로그인(`/console/sign-in`)은 서로 다른 흐름입니다.
- 가족 입장은 공유 비밀값으로 특정 가족 홈에 들어가는 용도입니다.
- 콘솔 로그인은 owner/admin 운영자만 사용하는 별도 세션입니다.

현재 포함 내용:

- `authFlowDefinitions`
  - 가족 입장과 콘솔 로그인 각각의 대상, 허용 범위, DB 엔터티 요구사항
- `authSessionRequirements`
  - 세션 TTL, 검증 방식, 역할 범위
- `authRouteBoundaries`
  - `/f`, `/app`, `/console` 계열이 어떤 세션을 기대하는지 정리한 경계 표
- `authRoleMatrix`
  - `owner/admin/member/child/guest` 역할별 허용 범위 초안
- `FamilyAccessSession`
  - 가족 홈 읽기 중심 세션
- `PlatformUserSession`
  - 콘솔 운영자 세션
- 데모용 콘솔 계정 검증 로직

주의:

- 현재 가족 입장 세션은 기본적으로 `guest` 뷰어 세션으로 발급됩니다.
- `member/child` 프로필 기반 가족 세션은 다음 DB 전환 단계에서 확장 대상입니다.
- 콘솔 로그인은 이제 owner/admin 역할이 있는 계정만 허용합니다.
