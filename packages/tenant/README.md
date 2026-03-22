# packages/tenant

가족 단위 멀티테넌트 처리와 가족 홈 런타임 계약을 담당합니다.

slug, 도메인, 설정, 현재 가족 컨텍스트 해석이 핵심 책임입니다.

## 필드 묶음

- `FamilyTenantIdentity`: slug, name, tagline
- `FamilyTenantExperience`: welcomeMessage, heroSummary, householdMood, timezone, memberCount
- `FamilyTenantWorkspaceSettings`: customDomains, enabledModules, highlights, entryChecklist, theme, accessPolicy

`FamilyTenantRecord`는 위 세 묶음을 합친 현재 런타임 계약입니다.

## 왜 이렇게 나누는가

- 파일 저장에서는 한 객체로 다루더라도, DB 저장에서는 `FamilyTenant`, `FamilyAccessPolicy`,
  `FamilyTheme`, `EnabledModule`처럼 테이블이 분리될 가능성이 높습니다.
- 빌더가 자주 바꾸는 값과 공개 홈이 읽기만 하는 값을 나눠 보면 저장소 어댑터를 바꾸기 쉬워집니다.
- `cloneFamilyTenantRecord`, `toFamilyPublicPreview`를 공용 helper로 두어 파일 저장과 fixture가 같은 규칙을 따르게 했습니다.
