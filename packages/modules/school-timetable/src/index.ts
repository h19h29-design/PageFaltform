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

const DEFAULT_SCHOOL_TIMETABLE_FEED_NOW = "2026-03-19T07:30:00+09:00";

export const schoolTimetableModule: ModuleDescriptor = {
  key: "school-timetable",
  kind: "schedule",
  label: "School Timetable",
  description: "Weekly school and academy schedule views.",
};

export interface SchoolTimetableFixture {
  id: string;
  slug: string;
  audience: HomeCardAudience;
  visibilityScope: DashboardVisibilityScope;
  studentLabel: string;
  title: string;
  startsAt: string;
  endsAt?: string;
  preparationNote?: string;
  affectsFamilyFlow: boolean;
}

export interface SchoolTimetableDashboardCard extends DashboardCardPayload {
  moduleKey: "school-timetable";
  cardType: "schedule";
  sectionHint: "today" | "focus";
  badge: string;
  startsAt: string;
}

export interface BuildSchoolTimetableDashboardFeedInput {
  familySlug: string;
  tenantId: string;
  timezone: string;
  now?: string | Date;
  generatedAt?: string;
  schedules?: readonly SchoolTimetableFixture[];
}

export const schoolTimetableHomeCardRules: ModuleHomeCardRule[] = [
  {
    id: "school-timetable-today-route-first",
    title: "오늘 등하교 흐름 우선",
    description:
      "오늘의 등교, 하교, 학원처럼 가족 이동에 직접 연결되는 시간표만 today 카드로 먼저 묶습니다.",
  },
  {
    id: "school-timetable-prep-only-when-needed",
    title: "준비물은 협업이 필요할 때만 노출",
    description:
      "준비물이나 특이사항은 보호자 확인이 필요한 경우에만 보조 카드로 올려, 주간 시간표 전체가 홈을 과도하게 차지하지 않게 합니다.",
  },
  {
    id: "school-timetable-student-specific-limit",
    title: "개인 시간표는 1명 기준 보조 카드",
    description:
      "학생 개인 시간표는 오늘 가족 일정 조율에 영향을 줄 때만 한 명 기준의 보조 카드 1장으로 노출합니다.",
  },
];

export const schoolTimetableFixtures: SchoolTimetableFixture[] = [
  {
    id: "minseo-school-route",
    slug: "minseo-school-route",
    audience: "family-shared",
    visibilityScope: "children-safe",
    studentLabel: "민서",
    title: "학교 수업과 영어학원",
    startsAt: "2026-03-19T08:20:00+09:00",
    endsAt: "2026-03-19T17:40:00+09:00",
    preparationNote: "체육복, 리코더",
    affectsFamilyFlow: true,
  },
  {
    id: "jiwoo-art",
    slug: "jiwoo-art",
    audience: "personal",
    visibilityScope: "children-safe",
    studentLabel: "지우",
    title: "방과 후 미술 수업",
    startsAt: "2026-03-19T16:10:00+09:00",
    endsAt: "2026-03-19T17:00:00+09:00",
    preparationNote: "앞치마 지참",
    affectsFamilyFlow: true,
  },
  {
    id: "jiwoo-reading",
    slug: "jiwoo-reading",
    audience: "personal",
    visibilityScope: "private",
    studentLabel: "지우",
    title: "독서 기록 정리",
    startsAt: "2026-03-19T20:00:00+09:00",
    affectsFamilyFlow: false,
  },
];

function toDate(value: string | Date | undefined): Date {
  if (value instanceof Date) {
    return value;
  }

  return new Date(value ?? DEFAULT_SCHOOL_TIMETABLE_FEED_NOW);
}

function resolveGeneratedAt(
  input: Pick<BuildSchoolTimetableDashboardFeedInput, "generatedAt" | "now">,
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

function buildRouteSummary(entries: readonly SchoolTimetableFixture[], timezone: string): string {
  const preview = entries
    .slice(0, 2)
    .map((entry) => `${formatTimeLabel(entry.startsAt, timezone)} ${entry.studentLabel} ${entry.title}`)
    .join(", ");

  return `${preview} 흐름만 today 카드에 올립니다. 오늘의 등하교와 학원 동선처럼 가족 이동에 직접 연결되는 시간표를 먼저 묶습니다.`;
}

function buildSchoolRouteCard(
  input: BuildSchoolTimetableDashboardFeedInput,
  generatedAt: string,
  entries: readonly SchoolTimetableFixture[],
): SchoolTimetableDashboardCard {
  return {
    id: `school-timetable-${input.familySlug}-today`,
    tenantId: input.tenantId,
    moduleKey: "school-timetable",
    cardType: "schedule",
    title: "오늘 등하교와 학원 흐름",
    summary: buildRouteSummary(entries, input.timezone),
    priority: 89,
    featured: true,
    pinned: false,
    visibilityScope: "children-safe",
    href: `/app/${input.familySlug}/school-timetable/today`,
    sectionHint: "today",
    badge: "등교일",
    startsAt: entries[0]!.startsAt,
    updatedAt: generatedAt,
  };
}

function buildSchoolFocusCard(
  input: BuildSchoolTimetableDashboardFeedInput,
  generatedAt: string,
  entry: SchoolTimetableFixture,
): SchoolTimetableDashboardCard {
  const preparationNote = entry.preparationNote ? `${entry.preparationNote}. ` : "";

  return {
    id: `school-timetable-${input.familySlug}-focus-${entry.id}`,
    tenantId: input.tenantId,
    moduleKey: "school-timetable",
    cardType: "schedule",
    title: `${entry.studentLabel} 준비물 확인`,
    summary:
      `${formatTimeLabel(entry.startsAt, input.timezone)} ${entry.title} 전 ${preparationNote}` +
      "학생 개인 시간표는 보호자 협업이 필요한 경우에만 focus 카드 1장으로 남깁니다.",
    priority: 78,
    featured: false,
    pinned: false,
    visibilityScope: entry.visibilityScope,
    href: `/app/${input.familySlug}/school-timetable/${entry.slug}`,
    sectionHint: "focus",
    badge: "준비물",
    startsAt: entry.startsAt,
    updatedAt: generatedAt,
  };
}

export function buildSchoolTimetableDashboardFeed(
  input: BuildSchoolTimetableDashboardFeedInput,
): DashboardModuleFeed {
  const generatedAt = resolveGeneratedAt(input);
  const selection = selectSchoolTimetableDashboardSchedules(input);
  const cards: SchoolTimetableDashboardCard[] = [];

  if (selection.todaySchedules.length > 0) {
    cards.push(buildSchoolRouteCard(input, generatedAt, selection.todaySchedules));
  }

  if (selection.focusSchedule) {
    cards.push(buildSchoolFocusCard(input, generatedAt, selection.focusSchedule));
  }

  cards.sort(compareDashboardCards);

  return {
    moduleKey: "school-timetable",
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

export interface SchoolTimetableDashboardSelection {
  todaySchedules: SchoolTimetableFixture[];
  focusSchedule: SchoolTimetableFixture | null;
}

export function selectSchoolTimetableDashboardSchedules(
  input: Pick<
    BuildSchoolTimetableDashboardFeedInput,
    "timezone" | "now" | "generatedAt" | "schedules"
  >,
): SchoolTimetableDashboardSelection {
  const source = input.schedules ?? schoolTimetableFixtures;
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

export const schoolTimetableHomeFeedFixture = buildSchoolTimetableDashboardFeed({
  familySlug: "yoon",
  tenantId: "family-yoon",
  timezone: "Asia/Seoul",
  now: DEFAULT_SCHOOL_TIMETABLE_FEED_NOW,
});
