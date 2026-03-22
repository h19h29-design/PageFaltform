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

const DEFAULT_CALENDAR_FEED_NOW = "2026-03-19T07:30:00+09:00";

export const calendarModule: ModuleDescriptor = {
  key: "calendar",
  kind: "schedule",
  label: "Calendar",
  description: "Events, schedules, and shared time planning.",
};

export interface CalendarScheduleFixture {
  id: string;
  slug: string;
  audience: HomeCardAudience;
  visibilityScope: DashboardVisibilityScope;
  title: string;
  startsAt: string;
  endsAt?: string;
  location?: string;
  ownerLabel?: string;
  affectsFamilyFlow: boolean;
}

export interface CalendarDashboardCard extends DashboardCardPayload {
  moduleKey: "calendar";
  cardType: "schedule";
  sectionHint: "today" | "focus";
  badge: string;
  startsAt: string;
}

export interface BuildCalendarDashboardFeedInput {
  familySlug: string;
  tenantId: string;
  timezone: string;
  now?: string | Date;
  generatedAt?: string;
  schedules?: readonly CalendarScheduleFixture[];
}

export const calendarTodayCardRules: ModuleHomeCardRule[] = [
  {
    id: "calendar-family-today-first",
    title: "오늘 가족 공용 일정 우선",
    description:
      "오늘 안에 움직여야 하는 가족 공용 약속을 먼저 today 카드로 올리고, 홈의 기본 기준선으로 삼습니다.",
  },
  {
    id: "calendar-time-sensitive-window",
    title: "시간이 정해진 약속만 요약",
    description:
      "시간 미정 메모가 아니라 시작 시각이 있는 일정만 today 요약에 포함해 곧 움직여야 하는 흐름을 명확히 합니다.",
  },
  {
    id: "calendar-personal-limit",
    title: "개인 일정은 보조 카드 1장 제한",
    description:
      "개인 일정은 픽업, 식사, 돌봄처럼 가족 동선에 영향을 줄 때만 adults 또는 children-safe 범위의 보조 카드 1장으로 노출합니다.",
  },
];

export const calendarScheduleFixtures: CalendarScheduleFixture[] = [
  {
    id: "dentist",
    slug: "dentist",
    audience: "family-shared",
    visibilityScope: "all",
    title: "민서 치과 예약",
    startsAt: "2026-03-19T15:30:00+09:00",
    endsAt: "2026-03-19T16:20:00+09:00",
    location: "연희동 치과",
    affectsFamilyFlow: true,
  },
  {
    id: "grocery-run",
    slug: "grocery-run",
    audience: "family-shared",
    visibilityScope: "all",
    title: "저녁 장보기",
    startsAt: "2026-03-19T18:10:00+09:00",
    endsAt: "2026-03-19T19:00:00+09:00",
    location: "동네 마트",
    affectsFamilyFlow: true,
  },
  {
    id: "mom-bank",
    slug: "mom-bank",
    audience: "personal",
    visibilityScope: "adults",
    title: "엄마 은행 방문",
    startsAt: "2026-03-19T12:30:00+09:00",
    endsAt: "2026-03-19T13:10:00+09:00",
    ownerLabel: "엄마",
    affectsFamilyFlow: true,
  },
  {
    id: "dad-lunch",
    slug: "dad-lunch",
    audience: "personal",
    visibilityScope: "private",
    title: "아빠 점심 약속",
    startsAt: "2026-03-19T12:00:00+09:00",
    endsAt: "2026-03-19T13:00:00+09:00",
    ownerLabel: "아빠",
    affectsFamilyFlow: false,
  },
];

function toDate(value: string | Date | undefined): Date {
  if (value instanceof Date) {
    return value;
  }

  return new Date(value ?? DEFAULT_CALENDAR_FEED_NOW);
}

function resolveGeneratedAt(
  input: Pick<BuildCalendarDashboardFeedInput, "generatedAt" | "now">,
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

function buildTodayScheduleSummary(
  entries: readonly CalendarScheduleFixture[],
  timezone: string,
): string {
  const preview = entries
    .slice(0, 2)
    .map((entry) => `${formatTimeLabel(entry.startsAt, timezone)} ${entry.title}`)
    .join(", ");
  const overflow = entries.length > 2 ? ` 외 ${entries.length - 2}건` : "";

  return `${preview}${overflow} 순서로 이어집니다. today 카드에는 오늘 안에 움직여야 하는 가족 공용 일정만 먼저 묶습니다.`;
}

function buildCalendarTodayCard(
  input: BuildCalendarDashboardFeedInput,
  generatedAt: string,
  entries: readonly CalendarScheduleFixture[],
): CalendarDashboardCard {
  return {
    id: `calendar-${input.familySlug}-today`,
    tenantId: input.tenantId,
    moduleKey: "calendar",
    cardType: "schedule",
    title: `오늘 가족 일정 ${entries.length}건`,
    summary: buildTodayScheduleSummary(entries, input.timezone),
    priority: 94,
    featured: true,
    pinned: false,
    visibilityScope: "all",
    href: `/app/${input.familySlug}/calendar/today`,
    sectionHint: "today",
    badge: `오늘 ${entries.length}건`,
    startsAt: entries[0]!.startsAt,
    updatedAt: generatedAt,
  };
}

function buildCalendarFocusCard(
  input: BuildCalendarDashboardFeedInput,
  generatedAt: string,
  entry: CalendarScheduleFixture,
): CalendarDashboardCard {
  const ownerLabel = entry.ownerLabel ? `${entry.ownerLabel} ` : "";
  const locationLabel = entry.location ? ` (${entry.location})` : "";

  return {
    id: `calendar-${input.familySlug}-focus-${entry.id}`,
    tenantId: input.tenantId,
    moduleKey: "calendar",
    cardType: "schedule",
    title: "공유가 필요한 개인 일정",
    summary:
      `${formatTimeLabel(entry.startsAt, input.timezone)} ${ownerLabel}${entry.title}${locationLabel}. ` +
      "개인 일정은 가족 흐름에 영향이 있을 때만 focus 카드 1장으로 공유합니다.",
    priority: 80,
    featured: false,
    pinned: false,
    visibilityScope: entry.visibilityScope,
    href: `/app/${input.familySlug}/calendar/${entry.slug}`,
    sectionHint: "focus",
    badge: "조율 필요",
    startsAt: entry.startsAt,
    updatedAt: generatedAt,
  };
}

export function buildCalendarDashboardFeed(
  input: BuildCalendarDashboardFeedInput,
): DashboardModuleFeed {
  const generatedAt = resolveGeneratedAt(input);
  const selection = selectCalendarDashboardSchedules(input);
  const cards: CalendarDashboardCard[] = [];

  if (selection.todaySchedules.length > 0) {
    cards.push(buildCalendarTodayCard(input, generatedAt, selection.todaySchedules));
  }

  if (selection.focusSchedule) {
    cards.push(buildCalendarFocusCard(input, generatedAt, selection.focusSchedule));
  }

  cards.sort(compareDashboardCards);

  return {
    moduleKey: "calendar",
    generatedAt,
    cards,
    meta: buildFeedMeta(
      cards,
      input.timezone,
      selection.todaySchedules.length,
      selection.focusSchedule ? 1 : 0,
    ),
  };
}

export interface CalendarDashboardSelection {
  todaySchedules: CalendarScheduleFixture[];
  focusSchedule: CalendarScheduleFixture | null;
}

export function selectCalendarDashboardSchedules(
  input: Pick<
    BuildCalendarDashboardFeedInput,
    "timezone" | "now" | "generatedAt" | "schedules"
  >,
): CalendarDashboardSelection {
  const source = input.schedules ?? calendarScheduleFixtures;
  const generatedAt = resolveGeneratedAt(input);

  return {
    todaySchedules: source.filter(
      (entry) =>
        entry.audience === "family-shared" &&
        entry.affectsFamilyFlow &&
        isSameDay(entry.startsAt, generatedAt, input.timezone),
    ),
    focusSchedule:
      source.find(
        (entry) =>
          entry.audience === "personal" &&
          entry.affectsFamilyFlow &&
          entry.visibilityScope !== "private" &&
          isSameDay(entry.startsAt, generatedAt, input.timezone),
      ) ?? null,
  };
}

export const calendarHomeFeedFixture = buildCalendarDashboardFeed({
  familySlug: "yoon",
  tenantId: "family-yoon",
  timezone: "Asia/Seoul",
  now: DEFAULT_CALENDAR_FEED_NOW,
});
