import type { ModuleKey } from "@ysplan/modules-core";
import type { FamilyHomePreset } from "@ysplan/platform";

export const DASHBOARD_SECTION_ORDER = [
  "hero",
  "pinned",
  "today",
  "focus",
  "progress",
  "recent",
] as const;

export type DashboardSectionKey = (typeof DASHBOARD_SECTION_ORDER)[number];

export const DASHBOARD_CARD_TYPES = [
  "announcement",
  "schedule",
  "todo",
  "progress",
  "habit",
  "post",
  "gallery",
  "pinned",
] as const;

export type DashboardCardType = (typeof DASHBOARD_CARD_TYPES)[number];

export const DASHBOARD_VIEWER_ROLES = [
  "owner",
  "admin",
  "member",
  "guest",
  "child",
] as const;

export type DashboardViewerRole = (typeof DASHBOARD_VIEWER_ROLES)[number];

export const DASHBOARD_VIEWER_STATES = [
  "signed-in",
  "signed-out",
  "read-only",
] as const;

export type DashboardViewerState = (typeof DASHBOARD_VIEWER_STATES)[number];

export const DASHBOARD_VISIBILITY_SCOPES = [
  "all",
  "adults",
  "children-safe",
  "admins",
  "private",
] as const;

export type DashboardVisibilityScope = (typeof DASHBOARD_VISIBILITY_SCOPES)[number];

export type DashboardViewport = "desktop" | "mobile";

/**
 * Canonical home-card payload consumed by `buildDashboardHomeModel`.
 * Module packages may keep richer DTOs internally, but any card that reaches
 * the family home should be normalized into this shape first.
 */
export interface DashboardCardPayload {
  id: string;
  tenantId: string;
  moduleKey: ModuleKey;
  cardType: DashboardCardType;
  title: string;
  summary: string;
  // Higher wins before tie-breakers inside the same section.
  priority: number;
  // Adds score weight, but does not bypass section ordering rules.
  featured: boolean;
  // Forces the card into the pinned band and removes it from hero promotion.
  pinned: boolean;
  visibilityScope: DashboardVisibilityScope;
  href: string;
  updatedAt: string;
  displayStartsAt?: string | null;
  displayEndsAt?: string | null;
  // Advisory only. The home model may override this based on card type support,
  // pinning, hero promotion, and fallback section rules.
  sectionHint?: DashboardSectionKey | null;
  badge?: string | null;
  startsAt?: string | null;
  dueAt?: string | null;
  imageUrl?: string | null;
  metricValue?: number | null;
  metricTarget?: number | null;
  metricUnit?: string | null;
}

/**
 * Canonical module feed for family-home aggregation.
 * Threads `02`, `03`, and `06` may shape richer module-local DTOs, but their
 * final home output should adapt to this feed contract before rendering.
 */
export interface DashboardModuleFeed {
  moduleKey: ModuleKey;
  generatedAt: string;
  cards: DashboardCardPayload[];
  meta?: {
    visibleCount?: number;
    featuredCount?: number;
    note?: string;
  };
}

export interface DashboardHomeContext {
  familySlug: string;
  tenantId: string;
  activeModuleKeys: ModuleKey[];
  viewerRole: DashboardViewerRole;
  viewerState?: DashboardViewerState;
  timezone?: string;
}

export interface DashboardHomeBuildInput {
  preset: FamilyHomePreset;
  context: DashboardHomeContext;
  feeds: readonly DashboardModuleFeed[];
}

export interface DashboardResolvedCard {
  card: DashboardCardPayload;
  score: number;
  section: DashboardSectionKey;
}

export interface DashboardSectionModel {
  key: DashboardSectionKey;
  label: string;
  description: string;
  slotLimit: number;
  rank: number;
  items: DashboardResolvedCard[];
  overflowCount: number;
}

export interface DashboardHomeSummary {
  activeModuleCount: number;
  visibleFeedCount: number;
  visibleCardCount: number;
  renderedCardCount: number;
  overflowCount: number;
  heroCardId: string | null;
}

export interface DashboardHomeModel {
  now: string;
  preset: FamilyHomePreset;
  viewport: DashboardViewport;
  sectionOrder: DashboardSectionKey[];
  sections: DashboardSectionModel[];
  overflow: DashboardResolvedCard[];
  summary: DashboardHomeSummary;
}

export interface DashboardSectionDefinition {
  key: DashboardSectionKey;
  label: string;
  description: string;
  supportedCardTypes: readonly DashboardCardType[];
  maxCardsDesktop: number;
  maxCardsMobile: number;
}

export const dashboardSectionDefinitions: Record<DashboardSectionKey, DashboardSectionDefinition> = {
  hero: {
    key: "hero",
    label: "대표 카드",
    description: "지금 화면에서 가장 먼저 읽혀야 하는 핵심 카드입니다.",
    supportedCardTypes: [
      "announcement",
      "schedule",
      "todo",
      "progress",
      "habit",
      "post",
      "gallery",
    ],
    maxCardsDesktop: 1,
    maxCardsMobile: 1,
  },
  pinned: {
    key: "pinned",
    label: "고정 알림",
    description: "오래 보여야 하는 공지와 D-day 카드를 상단 가까이에 유지합니다.",
    supportedCardTypes: DASHBOARD_CARD_TYPES,
    maxCardsDesktop: 1,
    maxCardsMobile: 1,
  },
  today: {
    key: "today",
    label: "오늘 할 일",
    description: "오늘 바로 움직여야 하는 일정과 할 일을 보여 줍니다.",
    supportedCardTypes: ["announcement", "schedule", "todo"],
    maxCardsDesktop: 2,
    maxCardsMobile: 2,
  },
  focus: {
    key: "focus",
    label: "집중 카드",
    description: "당장 다음은 아니지만 지금 챙겨야 하는 중요한 일을 모읍니다.",
    supportedCardTypes: ["announcement", "schedule", "todo"],
    maxCardsDesktop: 2,
    maxCardsMobile: 1,
  },
  progress: {
    key: "progress",
    label: "진행 상황",
    description: "목표, 루틴, 가족 진행 상황처럼 계속 추적해야 하는 흐름입니다.",
    supportedCardTypes: ["progress", "habit"],
    maxCardsDesktop: 2,
    maxCardsMobile: 1,
  },
  recent: {
    key: "recent",
    label: "최근 기록",
    description: "최근 글, 사진, 기록성 업데이트를 모아 보여 줍니다.",
    supportedCardTypes: ["post", "gallery"],
    maxCardsDesktop: 2,
    maxCardsMobile: 2,
  },
};

export const dashboardSlots = DASHBOARD_SECTION_ORDER.map(
  (sectionKey) => dashboardSectionDefinitions[sectionKey],
);

export interface DashboardModuleContractBaseline {
  moduleKey: ModuleKey;
  canonicalCardTypes: readonly DashboardCardType[];
  preferredSectionHints: readonly DashboardSectionKey[];
  notes: string;
}

export const dashboardModuleContractBaselines: Record<ModuleKey, DashboardModuleContractBaseline> = {
  announcements: {
    moduleKey: "announcements",
    canonicalCardTypes: ["announcement"],
    preferredSectionHints: ["hero", "pinned", "today", "focus"],
    notes: "Use announcement cards. Hero and pinned stay as card flags, not separate module-only card types.",
  },
  posts: {
    moduleKey: "posts",
    canonicalCardTypes: ["post"],
    preferredSectionHints: ["recent"],
    notes: "Use post cards for long-form family updates.",
  },
  gallery: {
    moduleKey: "gallery",
    canonicalCardTypes: ["gallery"],
    preferredSectionHints: ["recent"],
    notes: "Use gallery cards for album and memory recaps.",
  },
  calendar: {
    moduleKey: "calendar",
    canonicalCardTypes: ["schedule"],
    preferredSectionHints: ["today", "focus"],
    notes: "Normalize family-impacting events into schedule cards.",
  },
  todo: {
    moduleKey: "todo",
    canonicalCardTypes: ["todo"],
    preferredSectionHints: ["today", "focus"],
    notes: "Use todo cards and carry urgency through priority, badge, dueAt, and sectionHint.",
  },
  diary: {
    moduleKey: "diary",
    canonicalCardTypes: ["post"],
    preferredSectionHints: ["recent"],
    notes: "Diary entries currently normalize to post so they stay inside the Recent story lane.",
  },
  "school-timetable": {
    moduleKey: "school-timetable",
    canonicalCardTypes: ["schedule"],
    preferredSectionHints: ["today", "focus"],
    notes: "Normalize student route and prep reminders into schedule cards.",
  },
  "day-planner": {
    moduleKey: "day-planner",
    canonicalCardTypes: ["schedule"],
    preferredSectionHints: ["today", "focus"],
    notes: "Normalize handoff blocks and shared day-planning cues into schedule cards.",
  },
  progress: {
    moduleKey: "progress",
    canonicalCardTypes: ["progress"],
    preferredSectionHints: ["progress"],
    notes: "Use progress cards and fill metric fields for goal completion summaries.",
  },
  habits: {
    moduleKey: "habits",
    canonicalCardTypes: ["habit"],
    preferredSectionHints: ["progress"],
    notes: "Use habit cards and metric fields for streaks or check-in counts.",
  },
};

export interface DashboardPresetPolicy {
  key: FamilyHomePreset;
  label: string;
  description: string;
  sectionOrder: readonly DashboardSectionKey[];
  cardTypeScoreAdjustments: Partial<Record<DashboardCardType, number>>;
}

export const dashboardPresetPolicies: Record<FamilyHomePreset, DashboardPresetPolicy> = {
  balanced: {
    key: "balanced",
    label: "균형형 홈",
    description: "급한 일과 최근 기록을 함께 균형 있게 보여 주는 홈 구성입니다.",
    sectionOrder: ["hero", "pinned", "today", "focus", "progress", "recent"],
    cardTypeScoreAdjustments: {
      announcement: 2,
      schedule: 1,
      todo: 1,
    },
  },
  planner: {
    key: "planner",
    label: "실행형 홈",
    description: "오늘 할 일과 집중 카드가 먼저 올라오는 실행 중심 홈 구성입니다.",
    sectionOrder: ["hero", "today", "focus", "pinned", "progress", "recent"],
    cardTypeScoreAdjustments: {
      announcement: 2,
      schedule: 6,
      todo: 6,
      progress: 1,
      habit: 1,
      post: -3,
      gallery: -3,
    },
  },
  story: {
    key: "story",
    label: "기록형 홈",
    description: "기록과 사진이 조금 더 앞에 오되, 급한 일도 놓치지 않는 홈 구성입니다.",
    sectionOrder: ["hero", "pinned", "recent", "progress", "today", "focus"],
    cardTypeScoreAdjustments: {
      announcement: 1,
      progress: 2,
      habit: 2,
      post: 5,
      gallery: 6,
      schedule: -3,
      todo: -3,
    },
  },
};

export const DASHBOARD_FALLBACK_MODULE_ORDER: readonly ModuleKey[] = [
  "announcements",
  "calendar",
  "school-timetable",
  "day-planner",
  "todo",
  "progress",
  "habits",
  "posts",
  "diary",
  "gallery",
];
