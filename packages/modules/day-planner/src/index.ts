import type {
  DashboardCardPayload,
  DashboardModuleFeed,
  DashboardVisibilityScope,
} from "@ysplan/dashboard";
import type {
  HomeCardAudience,
  ModuleDescriptor,
  ModuleHomeCardRule,
} from "@ysplan/modules-core";

const DEFAULT_DAY_PLANNER_FEED_NOW = "2026-03-19T07:30:00+09:00";

export const dayPlannerModule: ModuleDescriptor = {
  key: "day-planner",
  kind: "schedule",
  label: "Day Planner",
  description: "24-hour personal and household planning.",
};

export interface DayPlannerBlockFixture {
  id: string;
  slug: string;
  audience: HomeCardAudience;
  visibilityScope: DashboardVisibilityScope;
  title: string;
  startsAt: string;
  endsAt: string;
  ownerLabel?: string;
  affectsFamilyFlow: boolean;
}

export interface DayPlannerDashboardCard extends DashboardCardPayload {
  moduleKey: "day-planner";
  cardType: "schedule";
  sectionHint: "today" | "focus";
  badge: string;
  startsAt: string;
}

export interface BuildDayPlannerDashboardFeedInput {
  familySlug: string;
  tenantId: string;
  timezone: string;
  now?: string | Date;
  generatedAt?: string;
  blocks?: readonly DayPlannerBlockFixture[];
}

export const dayPlannerHomeCardRules: ModuleHomeCardRule[] = [
  {
    id: "day-planner-shared-blocks-first",
    title: "가족이 같이 맞춰야 하는 시간 블록 우선",
    description:
      "픽업, 식사, 숙제처럼 가족 핸드오프가 생기는 시간 블록을 개인 계획보다 먼저 today 카드로 올립니다.",
  },
  {
    id: "day-planner-next-action-window",
    title: "다음 행동 구간만 간결하게 요약",
    description:
      "하루 전체를 펼치지 않고, 오늘 남은 시간 중 실제 행동 전환이 필요한 블록만 요약해 홈 카드 밀도를 낮춥니다.",
  },
  {
    id: "day-planner-personal-handoff-only",
    title: "개인 플래너는 핸드오프 공유용 보조 카드",
    description:
      "개인 시간 블록은 돌봄 담당 전환처럼 가족 협업이 필요한 경우에만 adults 범위 보조 카드 1장으로 남깁니다.",
  },
];

export const dayPlannerBlockFixtures: DayPlannerBlockFixture[] = [
  {
    id: "afternoon-route",
    slug: "afternoon-route",
    audience: "family-shared",
    visibilityScope: "all",
    title: "오후 이동과 저녁 준비",
    startsAt: "2026-03-19T16:30:00+09:00",
    endsAt: "2026-03-19T19:00:00+09:00",
    affectsFamilyFlow: true,
  },
  {
    id: "dad-focus",
    slug: "dad-focus",
    audience: "personal",
    visibilityScope: "adults",
    title: "아빠 운동과 집중 시간",
    startsAt: "2026-03-19T20:30:00+09:00",
    endsAt: "2026-03-19T21:30:00+09:00",
    ownerLabel: "아빠",
    affectsFamilyFlow: true,
  },
  {
    id: "mom-journal",
    slug: "mom-journal",
    audience: "personal",
    visibilityScope: "private",
    title: "엄마 저널 시간",
    startsAt: "2026-03-19T22:00:00+09:00",
    endsAt: "2026-03-19T22:30:00+09:00",
    ownerLabel: "엄마",
    affectsFamilyFlow: false,
  },
];

function toDate(value: string | Date | undefined): Date {
  if (value instanceof Date) {
    return value;
  }

  return new Date(value ?? DEFAULT_DAY_PLANNER_FEED_NOW);
}

function resolveGeneratedAt(
  input: Pick<BuildDayPlannerDashboardFeedInput, "generatedAt" | "now">,
): string {
  if (input.generatedAt) {
    return input.generatedAt;
  }

  if (typeof input.now === "string") {
    return input.now;
  }

  return toDate(input.now).toISOString();
}

function getDateKey(value: string | Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(toDate(value));
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";

  return `${year}-${month}-${day}`;
}

function formatTimeLabel(value: string, timezone: string): string {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(value));
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";

  return `${hour}:${minute}`;
}

function isSameDay(value: string, reference: string, timezone: string): boolean {
  return getDateKey(value, timezone) === getDateKey(reference, timezone);
}

function compareDashboardCards(left: DashboardCardPayload, right: DashboardCardPayload): number {
  if (right.priority !== left.priority) {
    return right.priority - left.priority;
  }

  return right.updatedAt.localeCompare(left.updatedAt);
}

function buildFeedMeta(
  cards: readonly DashboardCardPayload[],
  timezone: string,
  familySharedCount: number,
  personalCount: number,
): NonNullable<DashboardModuleFeed["meta"]> {
  return {
    visibleCount: cards.length,
    featuredCount: cards.filter((card) => card.featured).length,
    note: `today/focus | family-shared=${familySharedCount} | personal=${personalCount} | timezone=${timezone}`,
  };
}

function buildSharedBlockSummary(
  entries: readonly DayPlannerBlockFixture[],
  timezone: string,
): string {
  const preview = entries
    .slice(0, 2)
    .map(
      (entry) =>
        `${formatTimeLabel(entry.startsAt, timezone)}-${formatTimeLabel(entry.endsAt, timezone)} ${entry.title}`,
    )
    .join(", ");

  return `${preview}만 today 카드로 요약합니다. 가족이 같이 맞춰야 하는 시간 블록을 개인 계획보다 먼저 올립니다.`;
}

function buildSharedBlockCard(
  input: BuildDayPlannerDashboardFeedInput,
  generatedAt: string,
  entries: readonly DayPlannerBlockFixture[],
): DayPlannerDashboardCard {
  return {
    id: `day-planner-${input.familySlug}-today`,
    tenantId: input.tenantId,
    moduleKey: "day-planner",
    cardType: "schedule",
    title: "오늘 가족 공동 시간 블록",
    summary: buildSharedBlockSummary(entries, input.timezone),
    priority: 84,
    featured: true,
    pinned: false,
    visibilityScope: "all",
    href: `/app/${input.familySlug}/day-planner/today`,
    sectionHint: "today",
    badge: "공동 블록",
    startsAt: entries[0]!.startsAt,
    updatedAt: generatedAt,
  };
}

function buildPersonalHandoffCard(
  input: BuildDayPlannerDashboardFeedInput,
  generatedAt: string,
  entry: DayPlannerBlockFixture,
): DayPlannerDashboardCard {
  const owner = entry.ownerLabel ? `${entry.ownerLabel} ` : "";

  return {
    id: `day-planner-${input.familySlug}-focus-${entry.id}`,
    tenantId: input.tenantId,
    moduleKey: "day-planner",
    cardType: "schedule",
    title: "공유가 필요한 개인 집중 시간",
    summary:
      `${formatTimeLabel(entry.startsAt, input.timezone)}-${formatTimeLabel(entry.endsAt, input.timezone)} ${owner}${entry.title}. ` +
      "개인 플래너는 가족 핸드오프가 생길 때만 focus 카드 1장으로 남깁니다.",
    priority: 74,
    featured: false,
    pinned: false,
    visibilityScope: entry.visibilityScope,
    href: `/app/${input.familySlug}/day-planner/${entry.slug}`,
    sectionHint: "focus",
    badge: "핸드오프",
    startsAt: entry.startsAt,
    updatedAt: generatedAt,
  };
}

export function buildDayPlannerDashboardFeed(
  input: BuildDayPlannerDashboardFeedInput,
): DashboardModuleFeed {
  const generatedAt = resolveGeneratedAt(input);
  const selection = selectDayPlannerDashboardBlocks(input);
  const cards: DayPlannerDashboardCard[] = [];

  if (selection.todayBlocks.length > 0) {
    cards.push(buildSharedBlockCard(input, generatedAt, selection.todayBlocks));
  }

  if (selection.focusBlock) {
    cards.push(buildPersonalHandoffCard(input, generatedAt, selection.focusBlock));
  }

  cards.sort(compareDashboardCards);

  return {
    moduleKey: "day-planner",
    generatedAt,
    cards,
    meta: buildFeedMeta(
      cards,
      input.timezone,
      selection.todayBlocks.length,
      selection.focusBlock ? 1 : 0,
    ),
  };
}

export interface DayPlannerDashboardSelection {
  todayBlocks: DayPlannerBlockFixture[];
  focusBlock: DayPlannerBlockFixture | null;
}

export function selectDayPlannerDashboardBlocks(
  input: Pick<
    BuildDayPlannerDashboardFeedInput,
    "timezone" | "now" | "generatedAt" | "blocks"
  >,
): DayPlannerDashboardSelection {
  const source = input.blocks ?? dayPlannerBlockFixtures;
  const generatedAt = resolveGeneratedAt(input);

  return {
    todayBlocks: source.filter(
      (entry) =>
        entry.audience === "family-shared" &&
        entry.affectsFamilyFlow &&
        isSameDay(entry.startsAt, generatedAt, input.timezone),
    ),
    focusBlock:
      source.find(
        (entry) =>
          entry.audience === "personal" &&
          entry.affectsFamilyFlow &&
          entry.visibilityScope !== "private" &&
          isSameDay(entry.startsAt, generatedAt, input.timezone),
      ) ?? null,
  };
}

export const dayPlannerHomeFeedFixture = buildDayPlannerDashboardFeed({
  familySlug: "yoon",
  tenantId: "family-yoon",
  timezone: "Asia/Seoul",
  now: DEFAULT_DAY_PLANNER_FEED_NOW,
});
