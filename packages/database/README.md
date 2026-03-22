# packages/database

Prisma 스키마와 DB 전환 기준선을 관리합니다.

현재 이 패키지에서 드러내는 내용:

- 플랫폼 운영자 인증용 `User` / `Membership` / `Session`
- 가족 홈 데이터용 `FamilyTenant` / `FamilyTheme` / `EnabledModule`
- 가족 입장 전환용 `FamilyAccessPolicy` / `FamilyAccessSession`
- 홈/입장 프리셋 전환용 `FamilyWorkspace`
- 현재 파일 기반 데이터를 어떤 모델로 옮길지 정리한 `src/auth-data-transition.ts`
- 다음 wave 시작 순서를 정리한 `nextWaveDbCutoverPlan`

이번 정리에서 추가로 명확해진 점:

- 가족 입장 세션은 Auth.js `Session`과 별도 테이블로 가져가야 합니다.
- `apps/web/data/family-sites.json`의 `customFamilies` 와 `workspaceDrafts` 는 DB 전환 대상입니다.
- `packages/tenant` 와 `packages/auth` 에 남아 있는 데모 fixture도 결국 DB seed 또는 실제 인증으로 대체해야 합니다.
- 가족 공유 비밀값은 DB로 갈 때 평문이 아니라 해시로 저장해야 합니다.

자주 쓰는 명령:

- `npm run db:validate`
- `npm run db:generate`
- `npm run db:push`
- `npm run db:migrate:dev`
