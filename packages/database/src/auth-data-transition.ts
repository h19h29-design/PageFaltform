export interface AuthSessionMigrationRequirement {
  flow: "family-access" | "console-sign-in";
  currentTransport: string;
  targetModels: string[];
  requiredFields: string[];
  notes: string;
}

export interface FileBackedMigrationTarget {
  source: string;
  currentLocation: string;
  targetModels: string[];
  persistedFields: string[];
  derivedFields: string[];
  notes: string;
}

export interface NextWaveDbCutoverTask {
  order: number;
  title: string;
  sourceRecords: string[];
  targetModels: string[];
  exitCriteria: string;
}

export const authSessionMigrationRequirements: AuthSessionMigrationRequirement[] = [
  {
    flow: "family-access",
    currentTransport: "Shared secret check on `/f/[familySlug]` + `ysplan_family_access` cookie",
    targetModels: ["FamilyAccessPolicy", "FamilyAccessSession"],
    requiredFields: [
      "FamilyAccessPolicy.entryMode",
      "FamilyAccessPolicy.sharedSecretHash",
      "FamilyAccessPolicy.sessionDurationHours",
      "FamilyAccessSession.sessionToken",
      "FamilyAccessSession.viewerRole",
      "FamilyAccessSession.expiresAt",
      "FamilyAccessSession.lastVerifiedAt",
    ],
    notes:
      "Current app issues a guest-family session without a DB row. DB cutover needs hash-only shared secret storage and server-side revocation/audit.",
  },
  {
    flow: "console-sign-in",
    currentTransport: "Demo credential lookup in `packages/auth` + `ysplan_platform_user` cookie",
    targetModels: ["User", "Membership", "Session"],
    requiredFields: [
      "User.email",
      "Membership.tenantId",
      "Membership.role",
      "Session.sessionToken",
      "Session.expires",
    ],
    notes:
      "Only owner/admin should reach `/console`. Demo users must become seeded or real operator accounts before removing the file/demo flow.",
  },
];

export const fileBackedMigrationTargets: FileBackedMigrationTarget[] = [
  {
    source: "File store metadata",
    currentLocation: "apps/web/data/family-sites.json#metadata",
    targetModels: ["Import audit log or migration report"],
    persistedFields: ["lastWriteAt"],
    derivedFields: ["backend", "migrationTarget"],
    notes:
      "앱 런타임의 핵심 데이터는 아니지만, 마지막 파일 저장 시점은 컷오버 검증 보고서에 남겨 둘 가치가 있습니다.",
  },
  {
    source: "Custom family records",
    currentLocation: "apps/web/data/family-sites.json#customFamilies",
    targetModels: ["FamilyTenant", "FamilyTheme", "FamilyDomain", "FamilyAccessPolicy", "Membership"],
    persistedFields: [
      "slug",
      "name",
      "tagline",
      "welcomeMessage",
      "heroSummary",
      "householdMood",
      "timezone",
      "memberCount",
      "customDomains[]",
      "theme.*",
      "ownerUserId",
      "accessPolicy.mode",
      "accessPolicy.secret",
      "createdAt",
      "updatedAt",
    ],
    derivedFields: ["highlights[]", "entryChecklist[]"],
    notes:
      "Highlights and entry checklist are currently regenerated from presets and access mode, so they can stay derived unless HQ wants editor-managed copy.",
  },
  {
    source: "Family workspace drafts",
    currentLocation: "apps/web/data/family-sites.json#workspaceDrafts",
    targetModels: ["FamilyWorkspace", "EnabledModule"],
    persistedFields: ["homePreset", "entryPreset", "enabledModules[]", "updatedAt", "savedAt", "savedFrom"],
    derivedFields: [],
    notes:
      "Module ordering belongs in `EnabledModule.sortOrder`; home/entry presets belong in `FamilyWorkspace`.",
  },
  {
    source: "Demo base families",
    currentLocation: "packages/tenant/src/index.ts#demoFamilies",
    targetModels: ["FamilyTenant", "FamilyTheme", "FamilyAccessPolicy", "EnabledModule"],
    persistedFields: [
      "slug",
      "name",
      "tagline",
      "welcomeMessage",
      "heroSummary",
      "householdMood",
      "timezone",
      "memberCount",
      "enabledModules[]",
      "theme.*",
      "accessPolicy.*",
    ],
    derivedFields: ["home card fixture text", "preview-only highlights"],
    notes:
      "Even demo tenants should move to DB seeding so file-backed and DB-backed families stop diverging.",
  },
  {
    source: "Demo operator accounts",
    currentLocation: "packages/auth/src/index.ts#demoPlatformUsers",
    targetModels: ["User", "Membership"],
    persistedFields: ["email", "displayName", "memberships[].familySlug", "memberships[].role"],
    derivedFields: ["plain-text demo password"],
    notes:
      "Passwords should not migrate as-is. Replace them with real auth or hashed seed credentials.",
  },
];

export const dbCutoverChecklist = [
  "Hash family shared secrets before any DB import; do not carry `accessPolicy.secret` forward in plain text.",
  "Seed or import owner/admin accounts before switching `/console` off the demo verifier.",
  "Choose whether `highlights` and `entryChecklist` remain derived copy or become editor-managed tables.",
  "Map `workspaceDrafts.enabledModules[]` into ordered `EnabledModule` rows during import.",
];

export const nextWaveDbCutoverPlan: NextWaveDbCutoverTask[] = [
  {
    order: 1,
    title: "가족/운영자 seed 기준선 만들기",
    sourceRecords: [
      "packages/tenant/src/index.ts#demoFamilies",
      "packages/auth/src/index.ts#demoPlatformUsers",
    ],
    targetModels: ["FamilyTenant", "FamilyTheme", "FamilyAccessPolicy", "EnabledModule", "User", "Membership"],
    exitCriteria: "DB에서 demo family와 owner/admin membership을 읽어 콘솔과 가족 홈 목록을 구성할 수 있음",
  },
  {
    order: 2,
    title: "파일 기반 custom family import 붙이기",
    sourceRecords: [
      "apps/web/data/family-sites.json#customFamilies",
      "apps/web/data/family-sites.json#workspaceDrafts",
    ],
    targetModels: ["FamilyTenant", "FamilyDomain", "FamilyWorkspace", "EnabledModule"],
    exitCriteria: "기존 file store custom family를 DB로 적재하고 동일 slug로 조회 가능함",
  },
  {
    order: 3,
    title: "콘솔 저장 경로를 DB 쓰기로 전환",
    sourceRecords: ["builder save/create actions"],
    targetModels: ["FamilyTenant", "FamilyWorkspace", "EnabledModule"],
    exitCriteria: "`/console/families/new`, `/console/families/[familySlug]`가 파일 대신 DB를 source of truth로 사용함",
  },
  {
    order: 4,
    title: "가족 입장 세션을 DB 세션으로 승격",
    sourceRecords: ["`/f/[familySlug]` shared-secret flow"],
    targetModels: ["FamilyAccessPolicy", "FamilyAccessSession"],
    exitCriteria: "가족 입장 성공 시 DB에 session row가 남고, 만료/재확인 기준을 서버에서 통제함",
  },
];
