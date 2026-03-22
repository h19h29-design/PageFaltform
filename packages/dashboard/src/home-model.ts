import type { ModuleKey } from "@ysplan/modules-core";

import {
  DASHBOARD_FALLBACK_MODULE_ORDER,
  dashboardPresetPolicies,
  dashboardSectionDefinitions,
  type DashboardCardPayload,
  type DashboardCardType,
  type DashboardHomeBuildInput,
  type DashboardHomeContext,
  type DashboardHomeModel,
  type DashboardResolvedCard,
  type DashboardSectionKey,
  type DashboardViewport,
  type DashboardVisibilityScope,
  type DashboardViewerRole,
} from "./contracts";

const DEFAULT_TIMEZONE = "Asia/Seoul";

const DEFAULT_CARD_VALUES = Object.freeze({
  summary: "",
  priority: 50,
  featured: false,
  pinned: false,
  displayStartsAt: null,
  displayEndsAt: null,
  visibilityScope: "all" as DashboardVisibilityScope,
  sectionHint: null as DashboardSectionKey | null,
  badge: null as string | null,
  startsAt: null as string | null,
  dueAt: null as string | null,
  imageUrl: null as string | null,
  metricValue: null as number | null,
  metricTarget: null as number | null,
  metricUnit: null as string | null,
});

const CARD_TYPE_BASE_PRIORITY: Record<DashboardCardType, number> = Object.freeze({
  announcement: 70,
  schedule: 68,
  todo: 66,
  progress: 58,
  habit: 55,
  post: 40,
  gallery: 38,
  pinned: 50,
});

const DAY_KEY_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();

interface RankedDashboardEntry {
  card: DashboardCardPayload;
  score: number;
  targetSection: DashboardSectionKey;
}

function getDayKeyFormatter(timeZone: string) {
  if (!DAY_KEY_FORMATTER_CACHE.has(timeZone)) {
    DAY_KEY_FORMATTER_CACHE.set(
      timeZone,
      new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    );
  }

  return DAY_KEY_FORMATTER_CACHE.get(timeZone)!;
}

function getActiveModuleOrder(moduleKeys: readonly ModuleKey[]): ModuleKey[] {
  const orderedKeys: ModuleKey[] = [];
  const seenKeys = new Set<ModuleKey>();

  for (const moduleKey of [...moduleKeys, ...DASHBOARD_FALLBACK_MODULE_ORDER]) {
    if (seenKeys.has(moduleKey)) {
      continue;
    }

    seenKeys.add(moduleKey);
    orderedKeys.push(moduleKey);
  }

  return orderedKeys;
}

function createModuleRankLookup(moduleKeys: readonly ModuleKey[]): Map<ModuleKey, number> {
  return new Map(getActiveModuleOrder(moduleKeys).map((moduleKey, index) => [moduleKey, index]));
}

function isUrgentBadge(badge: string | null | undefined) {
  return (badge ?? "").includes("긴급");
}

function isImportantBadge(badge: string | null | undefined) {
  return (badge ?? "").includes("중요");
}

function getPrimaryMoment(card: DashboardCardPayload) {
  return toDateOrNull(card.dueAt) ?? toDateOrNull(card.startsAt);
}

function getSectionLimit(section: DashboardSectionKey, viewport: DashboardViewport) {
  const definition = dashboardSectionDefinitions[section];
  return viewport === "mobile" ? definition.maxCardsMobile : definition.maxCardsDesktop;
}

function isSectionSupported(cardType: DashboardCardType, section: DashboardSectionKey) {
  return dashboardSectionDefinitions[section].supportedCardTypes.includes(cardType);
}

function compareSectionEntries(
  left: DashboardResolvedCard,
  right: DashboardResolvedCard,
  moduleRanks: Map<ModuleKey, number>,
) {
  if (right.score !== left.score) {
    return right.score - left.score;
  }

  if (right.card.featured !== left.card.featured) {
    return Number(right.card.featured) - Number(left.card.featured);
  }

  const leftMoment = getPrimaryMoment(left.card);
  const rightMoment = getPrimaryMoment(right.card);

  if (leftMoment && rightMoment && leftMoment.getTime() !== rightMoment.getTime()) {
    return leftMoment.getTime() - rightMoment.getTime();
  }

  if (leftMoment && !rightMoment) {
    return -1;
  }

  if (!leftMoment && rightMoment) {
    return 1;
  }

  const leftUpdatedAt = toDateOrNull(left.card.updatedAt);
  const rightUpdatedAt = toDateOrNull(right.card.updatedAt);

  if (leftUpdatedAt && rightUpdatedAt && leftUpdatedAt.getTime() !== rightUpdatedAt.getTime()) {
    return rightUpdatedAt.getTime() - leftUpdatedAt.getTime();
  }

  const leftRank = moduleRanks.get(left.card.moduleKey) ?? moduleRanks.size;
  const rightRank = moduleRanks.get(right.card.moduleKey) ?? moduleRanks.size;

  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }

  return left.card.title.localeCompare(right.card.title, "ko");
}

function chooseHeroEntry(
  entries: RankedDashboardEntry[],
  moduleRanks: Map<ModuleKey, number>,
): DashboardResolvedCard | null {
  const explicitHeroEntries = entries
    .filter((entry) => !entry.card.pinned && entry.card.sectionHint === "hero")
    .map((entry) => ({
      card: entry.card,
      score: entry.score,
      section: "hero" as const,
    }))
    .sort((left, right) => compareSectionEntries(left, right, moduleRanks));

  if (explicitHeroEntries[0]) {
    return explicitHeroEntries[0];
  }

  const automaticHeroEntries = entries
    .filter((entry) => !entry.card.pinned)
    .map((entry) => ({
      card: entry.card,
      score: entry.score,
      section: "hero" as const,
    }))
    .sort((left, right) => compareSectionEntries(left, right, moduleRanks));

  return automaticHeroEntries[0] ?? null;
}

export function toDateOrNull(value: string | Date | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const nextValue = value instanceof Date ? value : new Date(value);
  return Number.isNaN(nextValue.getTime()) ? null : nextValue;
}

export function toDayKey(value: string | Date | null | undefined, timeZone = DEFAULT_TIMEZONE) {
  const date = toDateOrNull(value);

  if (!date) {
    return null;
  }

  return getDayKeyFormatter(timeZone).format(date);
}

export function isSameDayInTimeZone(
  value: string | Date | null | undefined,
  now = new Date(),
  timeZone = DEFAULT_TIMEZONE,
) {
  const candidateDay = toDayKey(value, timeZone);
  const nowDay = toDayKey(now, timeZone);

  return Boolean(candidateDay && nowDay && candidateDay === nowDay);
}

export function normalizeDashboardCard(card: DashboardCardPayload): DashboardCardPayload {
  const priority = Number.isFinite(card.priority) ? card.priority : DEFAULT_CARD_VALUES.priority;

  return {
    ...DEFAULT_CARD_VALUES,
    ...card,
    priority,
  };
}

export function isWithinDisplayWindow(card: DashboardCardPayload, now = new Date()) {
  const normalizedCard = normalizeDashboardCard(card);
  const start = toDateOrNull(normalizedCard.displayStartsAt);
  const end = toDateOrNull(normalizedCard.displayEndsAt);
  const currentTime = toDateOrNull(now) ?? new Date();

  if (start && currentTime < start) {
    return false;
  }

  if (end && currentTime > end) {
    return false;
  }

  return true;
}

export function canViewerSeeCard(card: DashboardCardPayload, context: Partial<DashboardHomeContext> = {}) {
  const normalizedCard = normalizeDashboardCard(card);
  const role: DashboardViewerRole = context.viewerRole ?? "guest";
  const scope = normalizedCard.visibilityScope;

  if (scope === "all" || scope === "children-safe") {
    return true;
  }

  if (scope === "admins") {
    return role === "owner" || role === "admin";
  }

  if (scope === "adults") {
    return role !== "child";
  }

  if (scope === "private") {
    return role === "owner" || role === "admin" || role === "member";
  }

  return true;
}

export function isDashboardCardVisible(
  card: DashboardCardPayload,
  context: Partial<DashboardHomeContext> = {},
  now = new Date(),
) {
  return isWithinDisplayWindow(card, now) && canViewerSeeCard(card, context);
}

export function computeDashboardCardScore(
  card: DashboardCardPayload,
  input: Pick<DashboardHomeBuildInput, "preset" | "context">,
  now = new Date(),
) {
  const normalizedCard = normalizeDashboardCard(card);
  const presetPolicy = dashboardPresetPolicies[input.preset];

  if (normalizedCard.pinned) {
    return 1000;
  }

  let score = Number.isFinite(normalizedCard.priority)
    ? normalizedCard.priority
    : CARD_TYPE_BASE_PRIORITY[normalizedCard.cardType];

  score += presetPolicy.cardTypeScoreAdjustments[normalizedCard.cardType] ?? 0;

  if (normalizedCard.featured) {
    score += 8;
  }

  if (isImportantBadge(normalizedCard.badge)) {
    score += 5;
  }

  if (normalizedCard.cardType === "announcement" && isUrgentBadge(normalizedCard.badge)) {
    score += 10;
  }

  if (normalizedCard.cardType === "schedule") {
    const startsAt = toDateOrNull(normalizedCard.startsAt);

    if (startsAt) {
      const nextHours = (startsAt.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (nextHours >= 0 && nextHours <= 3) {
        score += 4;
      }
    }
  }

  if (normalizedCard.cardType === "todo") {
    if ((normalizedCard.badge ?? "").includes("지연")) {
      score += 4;
    }

    if ((normalizedCard.badge ?? "").includes("오늘")) {
      score += 4;
    }
  }

  if (
    (normalizedCard.cardType === "progress" || normalizedCard.cardType === "habit") &&
    (normalizedCard.badge ?? "").includes("가족")
  ) {
    score += 3;
  }

  if (normalizedCard.visibilityScope === "private") {
    score -= 3;
  }

  return score;
}

/**
 * Converts a normalized card into its default target section.
 * `sectionHint` can steer the result when it matches a supported section, but
 * `hero` is resolved separately and pinned cards always win the pinned band.
 */
export function resolveDashboardSection(
  card: DashboardCardPayload,
  context: Partial<DashboardHomeContext> = {},
  now = new Date(),
): DashboardSectionKey {
  const normalizedCard = normalizeDashboardCard(card);
  const timeZone = context.timezone ?? DEFAULT_TIMEZONE;

  if (normalizedCard.pinned || normalizedCard.cardType === "pinned") {
    return "pinned";
  }

  if (
    normalizedCard.sectionHint &&
    normalizedCard.sectionHint !== "hero" &&
    isSectionSupported(normalizedCard.cardType, normalizedCard.sectionHint)
  ) {
    return normalizedCard.sectionHint;
  }

  if (normalizedCard.cardType === "announcement") {
    return normalizedCard.featured ? "focus" : "today";
  }

  if (normalizedCard.cardType === "schedule" || normalizedCard.cardType === "todo") {
    return isSameDayInTimeZone(normalizedCard.startsAt ?? normalizedCard.dueAt, now, timeZone)
      ? "today"
      : "focus";
  }

  if (normalizedCard.cardType === "progress" || normalizedCard.cardType === "habit") {
    return "progress";
  }

  return "recent";
}

/**
 * Final arbiter for family-home ordering.
 * Module feeds contribute payloads, priority, and hints, but hero promotion,
 * section placement, slot limits, overflow, and tie-breakers are resolved here.
 */
export function buildDashboardHomeModel(
  input: DashboardHomeBuildInput,
  options: {
    now?: string | Date;
    viewport?: DashboardViewport;
  } = {},
): DashboardHomeModel {
  const now = toDateOrNull(options.now) ?? new Date();
  const viewport = options.viewport === "mobile" ? "mobile" : "desktop";
  const activeModuleKeys =
    input.context.activeModuleKeys.length > 0
      ? [...input.context.activeModuleKeys]
      : [DASHBOARD_FALLBACK_MODULE_ORDER[0]!];
  const activeModuleSet = new Set(activeModuleKeys);
  const moduleRanks = createModuleRankLookup(activeModuleKeys);
  const visibleEntries = input.feeds
    .filter((feed) => activeModuleSet.has(feed.moduleKey))
    .flatMap((feed) => feed.cards)
    .map((card) => normalizeDashboardCard(card))
    .filter((card) => card.tenantId === input.context.tenantId)
    .filter((card) => activeModuleSet.has(card.moduleKey))
    .filter((card) => isDashboardCardVisible(card, input.context, now))
    .map((card) => ({
      card,
      score: computeDashboardCardScore(card, input, now),
      targetSection: resolveDashboardSection(card, input.context, now),
    }));
  const heroEntry = chooseHeroEntry(visibleEntries, moduleRanks);
  const groupedEntries: Record<DashboardSectionKey, DashboardResolvedCard[]> = {
    hero: [],
    pinned: [],
    today: [],
    focus: [],
    progress: [],
    recent: [],
  };

  if (heroEntry) {
    groupedEntries.hero.push(heroEntry);
  }

  for (const entry of visibleEntries) {
    if (entry.card.id === heroEntry?.card.id) {
      continue;
    }

    groupedEntries[entry.targetSection].push({
      card: entry.card,
      score: entry.score,
      section: entry.targetSection,
    });
  }

  const sectionOrder = [...dashboardPresetPolicies[input.preset].sectionOrder];
  const overflow: DashboardResolvedCard[] = [];
  const sections = sectionOrder.map((sectionKey, index) => {
    const sortedEntries = [...groupedEntries[sectionKey]].sort((left, right) =>
      compareSectionEntries(left, right, moduleRanks),
    );
    const slotLimit = getSectionLimit(sectionKey, viewport);
    const visibleItems = sortedEntries.slice(0, slotLimit);
    const sectionOverflow = sortedEntries.slice(slotLimit);

    overflow.push(...sectionOverflow);

    return {
      key: sectionKey,
      label: dashboardSectionDefinitions[sectionKey].label,
      description: dashboardSectionDefinitions[sectionKey].description,
      slotLimit,
      rank: index + 1,
      items: visibleItems,
      overflowCount: sectionOverflow.length,
    };
  });

  const renderedCardCount = sections.reduce((total, section) => total + section.items.length, 0);

  return {
    now: now.toISOString(),
    preset: input.preset,
    viewport,
    sectionOrder,
    sections,
    overflow,
    summary: {
      activeModuleCount: activeModuleKeys.length,
      visibleFeedCount: new Set(visibleEntries.map((entry) => entry.card.moduleKey)).size,
      visibleCardCount: visibleEntries.length,
      renderedCardCount,
      overflowCount: overflow.length,
      heroCardId: heroEntry?.card.id ?? null,
    },
  };
}
