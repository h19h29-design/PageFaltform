import {
  coreModules,
  type HomeCardItem,
  type ModuleDescriptor,
  type ModuleKey,
} from "@ysplan/modules-core";

export * from "./dashboard-feeds";

export type FamilyRole = "owner" | "admin" | "member" | "guest" | "child";

export type FamilyAccessMode = "password" | "code";

export interface FamilyTheme {
  accentColor: string;
  warmColor: string;
  surfaceColor: string;
  highlightColor: string;
}

export interface FamilyAccessPolicy {
  mode: FamilyAccessMode;
  label: string;
  helperText: string;
  secret: string;
}

export interface FamilyHighlight {
  label: string;
  value: string;
}

export interface FamilyJourneyStep {
  title: string;
  description: string;
}

export interface FamilyTenantIdentity {
  slug: string;
  name: string;
  tagline: string;
}

export interface FamilyTenantExperience {
  welcomeMessage: string;
  heroSummary: string;
  householdMood: string;
  timezone: string;
  memberCount: number;
}

export interface FamilyTenantWorkspaceSettings {
  customDomains: string[];
  enabledModules: ModuleKey[];
  highlights: FamilyHighlight[];
  entryChecklist: FamilyJourneyStep[];
  theme: FamilyTheme;
  accessPolicy: FamilyAccessPolicy;
}

export interface FamilyTenantRecord
  extends FamilyTenantIdentity, FamilyTenantExperience, FamilyTenantWorkspaceSettings {
  id: string;
}

export interface FamilyPublicPreview {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  welcomeMessage: string;
  heroSummary: string;
  householdMood: string;
  timezone: string;
  memberCount: number;
  enabledModules: ModuleKey[];
  highlights: FamilyHighlight[];
  theme: FamilyTheme;
  accessLabel: string;
  accessHelperText: string;
}

export interface FamilyTenantContext {
  tenantId: string;
  familySlug: string;
  familyName: string;
  timezone: string;
  memberCount: number;
  enabledModules: ModuleKey[];
  theme: FamilyTheme;
}

export interface TenantFixture {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  entryHint: string;
  members: number;
  modules: ModuleKey[];
  homeCards: HomeCardItem[];
}

const demoFamilies: FamilyTenantRecord[] = [
  {
    id: "family-yoon",
    slug: "yoon",
    name: "윤네 거실",
    tagline: "일상과 소식을 한 번에 보는 따뜻한 가족 허브",
    welcomeMessage: "오늘의 일정과 소식을 조용히 이어보는 가족 공간입니다.",
    heroSummary: "공지, 일정, 생활 메모가 한 장의 홈에서 부드럽게 이어지는 가족 대시보드예요.",
    householdMood: "차분한 하루 운영",
    timezone: "Asia/Seoul",
    customDomains: ["yoon-home.local"],
    memberCount: 4,
    enabledModules: ["announcements", "calendar", "todo", "posts", "gallery"],
    highlights: [
      {
        label: "핵심 흐름",
        value: "공지 → 일정 → 체크",
      },
      {
        label: "주 사용 시간",
        value: "아침 준비 / 저녁 정리",
      },
      {
        label: "화면 분위기",
        value: "따뜻한 우드 톤",
      },
    ],
    entryChecklist: [
      {
        title: "가족 비밀번호 확인",
        description: "누구나 빠르게 들어오되, 가족 밖에는 쉽게 퍼지지 않도록 단순한 진입 장치를 둡니다.",
      },
      {
        title: "오늘의 홈 미리 보기",
        description: "들어가기 전에 이 가족 홈이 어떤 분위기인지 짧게 느끼게 합니다.",
      },
      {
        title: "관리자 보안 분리",
        description: "테마나 권한 변경 같은 작업은 콘솔 계정 로그인으로 따로 보호합니다.",
      },
    ],
    theme: {
      accentColor: "#2f5e4e",
      warmColor: "#c26d4e",
      surfaceColor: "#fff9f1",
      highlightColor: "#ead7bd",
    },
    accessPolicy: {
      mode: "password",
      label: "가족 비밀번호",
      helperText: "가족이 함께 쓰는 비밀번호를 입력하고 들어오세요.",
      secret: "yoon1234",
    },
  },
  {
    id: "family-park",
    slug: "park",
    name: "박가네 라운지",
    tagline: "바쁜 하루를 한 장의 홈으로 정리하는 가족 보드",
    welcomeMessage: "일정, 할 일, 최근 사진을 한 화면에서 빠르게 확인해요.",
    heroSummary: "오늘 꼭 봐야 하는 일정과 생활 카드가 먼저 떠오르는, 더 빠른 템포의 가족 홈입니다.",
    householdMood: "리듬감 있는 하루 정리",
    timezone: "Asia/Seoul",
    customDomains: ["park-family.local"],
    memberCount: 3,
    enabledModules: ["announcements", "calendar", "todo", "progress", "gallery"],
    highlights: [
      {
        label: "핵심 흐름",
        value: "오늘 일정 → 할 일 → 진행률",
      },
      {
        label: "주 사용 시간",
        value: "등하교 전 / 주말 외출 전",
      },
      {
        label: "화면 분위기",
        value: "선명한 보드형 레이아웃",
      },
    ],
    entryChecklist: [
      {
        title: "접근 코드 입력",
        description: "한 번에 바로 이해되는 단일 입력으로 진입 마찰을 최소화합니다.",
      },
      {
        title: "오늘 카드 예고",
        description: "들어가기 전에 오늘 가장 중요하게 보일 카드 구성을 미리 보여줍니다.",
      },
      {
        title: "운영 영역 분리",
        description: "멤버 관리와 설정은 홈 화면이 아니라 콘솔에서만 다룹니다.",
      },
    ],
    theme: {
      accentColor: "#7a5531",
      warmColor: "#b95034",
      surfaceColor: "#fff7ef",
      highlightColor: "#f0d8c0",
    },
    accessPolicy: {
      mode: "password",
      label: "접근 코드",
      helperText: "초대받은 가족만 알고 있는 코드를 입력하세요.",
      secret: "springday",
    },
  },
];

function toPublicPreview(family: FamilyTenantRecord): FamilyPublicPreview {
  return {
    id: family.id,
    slug: family.slug,
    name: family.name,
    tagline: family.tagline,
    welcomeMessage: family.welcomeMessage,
    heroSummary: family.heroSummary,
    householdMood: family.householdMood,
    timezone: family.timezone,
    memberCount: family.memberCount,
    enabledModules: [...family.enabledModules],
    highlights: family.highlights.map((highlight) => ({ ...highlight })),
    theme: { ...family.theme },
    accessLabel: family.accessPolicy.label,
    accessHelperText: family.accessPolicy.helperText,
  };
}

export function cloneFamilyTenantRecord(family: FamilyTenantRecord): FamilyTenantRecord {
  return {
    ...family,
    customDomains: [...family.customDomains],
    enabledModules: [...family.enabledModules],
    highlights: family.highlights.map((highlight) => ({ ...highlight })),
    entryChecklist: family.entryChecklist.map((step) => ({ ...step })),
    theme: { ...family.theme },
    accessPolicy: { ...family.accessPolicy },
  };
}

export function toFamilyPublicPreview(family: FamilyTenantRecord): FamilyPublicPreview {
  return toPublicPreview(family);
}

export function listFamilies(): FamilyPublicPreview[] {
  return demoFamilies.map(toFamilyPublicPreview);
}

export function listFamilyRecords(): FamilyTenantRecord[] {
  return demoFamilies.map(cloneFamilyTenantRecord);
}

export function resolveFamilyFromSlug(familySlug: string): FamilyTenantRecord | null {
  const normalizedSlug = familySlug.trim().toLowerCase();
  return demoFamilies.find((family) => family.slug === normalizedSlug) ?? null;
}

export function resolveFamilyFromDomain(domain: string): FamilyTenantRecord | null {
  const normalizedDomain = domain.trim().toLowerCase();

  return (
    demoFamilies.find((family) =>
      family.customDomains.some((customDomain) => customDomain.toLowerCase() === normalizedDomain),
    ) ?? null
  );
}

export function getActiveFamilyContext(familySlug: string): FamilyTenantContext | null {
  const family = resolveFamilyFromSlug(familySlug);

  if (!family) {
    return null;
  }

  return {
    tenantId: family.id,
    familySlug: family.slug,
    familyName: family.name,
    timezone: family.timezone,
    memberCount: family.memberCount,
    enabledModules: family.enabledModules,
    theme: family.theme,
  };
}

export function getFamilyPreview(familySlug: string): FamilyPublicPreview | null {
  const family = resolveFamilyFromSlug(familySlug);
  return family ? toPublicPreview(family) : null;
}

function createHomeCards(family: FamilyTenantRecord): HomeCardItem[] {
  const cards: HomeCardItem[] = [
    {
      id: `${family.slug}-notice`,
      tenantId: family.id,
      authorId: "system",
      moduleKey: "announcements",
      moduleKind: "content",
      title: "이번 주 가족 공지",
      summary: "이번 주 일정과 준비물을 먼저 보여주는 샘플 공지 카드입니다.",
      visibilityScope: "family",
      featuredOnHome: true,
      pinnedOnHome: true,
      homePriority: 10,
      readTrackingEnabled: true,
      commentsEnabled: false,
      attachments: 0,
      href: `/app/${family.slug}`,
      badge: "중요",
      updatedLabel: "방금 업데이트",
    },
    {
      id: `${family.slug}-calendar`,
      tenantId: family.id,
      authorId: "system",
      moduleKey: "calendar",
      moduleKind: "schedule",
      title: "오늘 일정 요약",
      summary: "오늘 기준으로 가장 먼저 확인해야 할 일정 샘플 카드입니다.",
      visibilityScope: "family",
      featuredOnHome: true,
      pinnedOnHome: false,
      homePriority: 20,
      readTrackingEnabled: false,
      commentsEnabled: false,
      attachments: 0,
      href: `/app/${family.slug}`,
      badge: "오늘",
      updatedLabel: "3시간 전",
    },
  ];

  if (family.enabledModules.includes("todo")) {
    cards.push({
      id: `${family.slug}-todo`,
      tenantId: family.id,
      authorId: "system",
      moduleKey: "todo",
      moduleKind: "checklist",
      title: "남은 생활 체크",
      summary: "집안일과 준비물을 함께 확인하는 체크리스트 샘플입니다.",
      visibilityScope: "family",
      featuredOnHome: true,
      pinnedOnHome: false,
      homePriority: 30,
      readTrackingEnabled: false,
      commentsEnabled: false,
      attachments: 0,
      href: `/app/${family.slug}`,
      badge: "3건 남음",
      updatedLabel: "조금 전",
    });
  }

  if (family.enabledModules.includes("progress")) {
    cards.push({
      id: `${family.slug}-progress`,
      tenantId: family.id,
      authorId: "system",
      moduleKey: "progress",
      moduleKind: "tracker",
      title: "이번 주 목표 진행",
      summary: "가족 공통 목표 달성률이 홈 카드로 올라오는 예시입니다.",
      visibilityScope: "family",
      featuredOnHome: true,
      pinnedOnHome: false,
      homePriority: 40,
      readTrackingEnabled: false,
      commentsEnabled: true,
      attachments: 0,
      href: `/app/${family.slug}`,
      badge: "72%",
      updatedLabel: "오늘 체크",
    });
  }

  return cards;
}

function toTenantFixture(family: FamilyTenantRecord): TenantFixture {
  return {
    id: family.id,
    slug: family.slug,
    name: family.name,
    tagline: family.tagline,
    entryHint: family.accessPolicy.helperText,
    members: family.memberCount,
    modules: family.enabledModules,
    homeCards: createHomeCards(family),
  };
}

export function listTenants(): TenantFixture[] {
  return demoFamilies.map(toTenantFixture);
}

export function getDefaultTenant(): TenantFixture {
  const firstFamily = demoFamilies[0];

  if (!firstFamily) {
    throw new Error("No demo family fixtures are configured.");
  }

  return toTenantFixture(firstFamily);
}

export function getTenantBySlug(familySlug: string): TenantFixture | null {
  const family = resolveFamilyFromSlug(familySlug);
  return family ? toTenantFixture(family) : null;
}

export function getModuleDescriptors(moduleKeys: ModuleKey[]): ModuleDescriptor[] {
  const moduleMap = new Map(coreModules.map((module) => [module.key, module]));

  return moduleKeys
    .map((moduleKey) => moduleMap.get(moduleKey))
    .filter((module): module is ModuleDescriptor => Boolean(module));
}
