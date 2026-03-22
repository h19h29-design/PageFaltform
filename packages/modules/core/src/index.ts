export type ModuleKind =
  | "content"
  | "media"
  | "checklist"
  | "schedule"
  | "tracker";

export type ModuleKey =
  | "announcements"
  | "posts"
  | "gallery"
  | "calendar"
  | "todo"
  | "diary"
  | "school-timetable"
  | "day-planner"
  | "progress"
  | "habits";

export type DashboardCardType =
  | "announcement"
  | "schedule"
  | "todo"
  | "progress"
  | "habit"
  | "post"
  | "gallery"
  | "pinned";

export type DashboardSectionHint =
  | "hero"
  | "today"
  | "focus"
  | "progress"
  | "recent"
  | "pinned";

export type DashboardVisibilityScope =
  | "all"
  | "adults"
  | "children-safe"
  | "admins"
  | "private";

/**
 * Compatibility copy for module packages that have not switched to
 * `@ysplan/dashboard` yet.
 *
 * The canonical family-home contract now lives in `@ysplan/dashboard`, and any
 * home-facing output should ultimately normalize to that package's
 * `DashboardCardPayload` / `DashboardModuleFeed` pair.
 */
export interface DashboardCard {
  id: string;
  tenantId: string;
  moduleKey: ModuleKey;
  cardType: DashboardCardType;
  title: string;
  summary: string;
  priority: number;
  featured: boolean;
  pinned: boolean;
  displayStartsAt?: string;
  displayEndsAt?: string;
  visibilityScope: DashboardVisibilityScope;
  href: string;
  sectionHint?: DashboardSectionHint;
  badge?: string;
  startsAt?: string;
  dueAt?: string;
  updatedAt: string;
  imageUrl?: string;
  metricValue?: number;
  metricTarget?: number;
  metricUnit?: string;
}

export interface DashboardCardFeedMeta {
  visibleCount: number;
  featuredCount: number;
}

/**
 * Compatibility feed type for module-local fixtures and adapters.
 * Home ordering rules should still be resolved by `@ysplan/dashboard`.
 */
export interface DashboardCardFeed<
  TCard extends DashboardCard = DashboardCard,
  TMeta extends object = object,
> {
  moduleKey: ModuleKey;
  generatedAt: string;
  cards: TCard[];
  meta: DashboardCardFeedMeta & TMeta;
}

export type VisibilityScope =
  | "family"
  | "adults"
  | "members"
  | "children"
  | "private";

/**
 * Legacy content-surface metadata for module internals.
 * Do not treat this as the family-home visibility contract.
 */
export interface HomeSurfaceMetadata {
  tenantId: string;
  authorId: string;
  title: string;
  summary?: string;
  visibilityScope: VisibilityScope;
  featuredOnHome: boolean;
  pinnedOnHome: boolean;
  homePriority: number;
  displayStartsAt?: string;
  displayEndsAt?: string;
  readTrackingEnabled: boolean;
  commentsEnabled: boolean;
  attachments: number;
}

export interface HomeCardItem extends HomeSurfaceMetadata {
  id: string;
  moduleKey: ModuleKey;
  moduleKind: ModuleKind;
  href: string;
  badge: string;
  updatedLabel: string;
}

export type HomeCardAudience = "family-shared" | "personal";

export type DashboardCardSectionHint = DashboardSectionHint;

export type DashboardCardVisibilityScope = DashboardVisibilityScope;

export type DashboardCardSummary = DashboardCard;

export interface ModuleHomeFeedBuildContext {
  familySlug: string;
  tenantId: string;
  now?: string | Date;
  generatedAt?: string;
}

export interface ModuleHomeFeedItemsInput<TItem> extends ModuleHomeFeedBuildContext {
  items?: readonly TItem[];
}

export interface ModuleHomeCardFeedMeta extends DashboardCardFeedMeta {
  familySharedCount: number;
  personalCount: number;
  note?: string;
}

export interface ModuleHomeCardRule {
  id: string;
  title: string;
  description: string;
}

export type ModuleHomeCardFeed = DashboardCardFeed<DashboardCardSummary, ModuleHomeCardFeedMeta>;

export function resolveModuleFeedGeneratedAt(
  input: Pick<ModuleHomeFeedBuildContext, "generatedAt" | "now">,
): string {
  if (input.generatedAt) {
    return input.generatedAt;
  }

  if (typeof input.now === "string") {
    return input.now;
  }

  return (input.now ?? new Date()).toISOString();
}

export function summarizeHomeCardAudience<TItem extends { audience: HomeCardAudience }>(
  items: readonly TItem[],
): Pick<ModuleHomeCardFeedMeta, "familySharedCount" | "personalCount"> {
  return {
    familySharedCount: items.filter((item) => item.audience === "family-shared").length,
    personalCount: items.filter((item) => item.audience === "personal").length,
  };
}

export interface ModuleDescriptor {
  key: ModuleKey;
  kind: ModuleKind;
  label: string;
  description: string;
}

export const coreModules: ModuleDescriptor[] = [
  {
    key: "announcements",
    kind: "content",
    label: "공지",
    description: "가족 공지, 고정 알림, 중요한 업데이트를 모아 둡니다.",
  },
  {
    key: "posts",
    kind: "content",
    label: "글",
    description: "가족 소식, 가이드, 긴 메모를 남깁니다.",
  },
  {
    key: "gallery",
    kind: "media",
    label: "사진첩",
    description: "사진 앨범과 추억 기록을 모아 봅니다.",
  },
  {
    key: "calendar",
    kind: "schedule",
    label: "일정",
    description: "가족 일정과 시간 계획을 함께 관리합니다.",
  },
  {
    key: "todo",
    kind: "checklist",
    label: "체크리스트",
    description: "할 일, 심부름, 집안일 체크를 정리합니다.",
  },
  {
    key: "diary",
    kind: "content",
    label: "일기",
    description: "하루 기록과 가족 저널을 남깁니다.",
  },
  {
    key: "school-timetable",
    kind: "schedule",
    label: "시간표",
    description: "학교와 학원 시간표를 한눈에 봅니다.",
  },
  {
    key: "day-planner",
    kind: "schedule",
    label: "데이 플래너",
    description: "하루 시간 블록과 생활 계획을 관리합니다.",
  },
  {
    key: "progress",
    kind: "tracker",
    label: "목표",
    description: "목표 진행률과 가족 공동 진행 상황을 확인합니다.",
  },
  {
    key: "habits",
    kind: "tracker",
    label: "습관",
    description: "반복 루틴과 체크인 흐름을 기록합니다.",
  }
];
