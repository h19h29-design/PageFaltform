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

const DEFAULT_TODO_FEED_NOW = "2026-03-19T07:30:00+09:00";

export const todoModule: ModuleDescriptor = {
  key: "todo",
  kind: "checklist",
  label: "Todo",
  description: "Checklist flows such as chores and errands.",
};

export interface TodoItemFixture {
  id: string;
  slug: string;
  audience: HomeCardAudience;
  visibilityScope: DashboardVisibilityScope;
  title: string;
  dueAt: string;
  completed: boolean;
  overdue?: boolean;
  blocksFamilyFlow: boolean;
  assigneeLabel?: string;
}

export interface TodoDashboardCard extends DashboardCardPayload {
  moduleKey: "todo";
  cardType: "todo";
  sectionHint: "today" | "focus";
  badge: string;
  dueAt: string;
}

export interface BuildTodoDashboardFeedInput {
  familySlug: string;
  tenantId: string;
  timezone: string;
  now?: string | Date;
  generatedAt?: string;
  todos?: readonly TodoItemFixture[];
}

export const todoHomeCardRules: ModuleHomeCardRule[] = [
  {
    id: "todo-overdue-first",
    title: "지연된 가족 할 일 최우선",
    description:
      "기한을 넘긴 가족 공용 할 일은 오늘 카드 흐름의 최상단으로 올려 즉시 처리 여부를 결정하게 합니다.",
  },
  {
    id: "todo-today-bundle",
    title: "오늘 마감 항목은 묶음 카드로 요약",
    description:
      "오늘 안에 끝내야 하는 가족 공용 할 일은 개별 카드 남발 대신 대표 카드 한 장으로 묶어 홈의 실행 흐름을 단순하게 유지합니다.",
  },
  {
    id: "todo-personal-blocker-only",
    title: "개인 할 일은 가족 흐름 차단 시에만 노출",
    description:
      "개인 할 일은 준비물, 차량, 픽업처럼 가족 동선을 막는 경우에만 adults 범위의 보조 카드 1장으로 올립니다.",
  },
];

export const todoItemFixtures: TodoItemFixture[] = [
  {
    id: "grocery-restock",
    slug: "grocery-restock",
    audience: "family-shared",
    visibilityScope: "all",
    title: "우유와 과일 채워두기",
    dueAt: "2026-03-18T20:00:00+09:00",
    completed: false,
    overdue: true,
    blocksFamilyFlow: true,
  },
  {
    id: "indoor-shoes",
    slug: "indoor-shoes",
    audience: "family-shared",
    visibilityScope: "children-safe",
    title: "민서 실내화 챙기기",
    dueAt: "2026-03-19T07:40:00+09:00",
    completed: false,
    blocksFamilyFlow: true,
  },
  {
    id: "recycling",
    slug: "recycling",
    audience: "family-shared",
    visibilityScope: "all",
    title: "분리수거 내놓기",
    dueAt: "2026-03-19T20:30:00+09:00",
    completed: false,
    blocksFamilyFlow: true,
  },
  {
    id: "dad-gas",
    slug: "dad-gas",
    audience: "personal",
    visibilityScope: "adults",
    title: "아빠 차량 주유",
    dueAt: "2026-03-19T17:30:00+09:00",
    completed: false,
    blocksFamilyFlow: true,
    assigneeLabel: "아빠",
  },
  {
    id: "read-book",
    slug: "read-book",
    audience: "personal",
    visibilityScope: "private",
    title: "엄마 독서 메모 정리",
    dueAt: "2026-03-20T22:00:00+09:00",
    completed: false,
    blocksFamilyFlow: false,
    assigneeLabel: "엄마",
  },
];

function toDate(value: string | Date | undefined): Date {
  if (value instanceof Date) {
    return value;
  }

  return new Date(value ?? DEFAULT_TODO_FEED_NOW);
}

function resolveGeneratedAt(
  input: Pick<BuildTodoDashboardFeedInput, "generatedAt" | "now">,
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

function isOverdue(item: TodoItemFixture, todayKey: string, timezone: string): boolean {
  return Boolean(item.overdue) || getDateKey(item.dueAt, timezone) < todayKey;
}

function isDueToday(item: TodoItemFixture, todayKey: string, timezone: string): boolean {
  return getDateKey(item.dueAt, timezone) === todayKey;
}

function buildTodoPreview(items: readonly TodoItemFixture[], timezone: string): string {
  return items
    .slice(0, 2)
    .map((item) => `${formatTimeLabel(item.dueAt, timezone)} ${item.title}`)
    .join(", ");
}

function buildOverdueTodoCard(
  input: BuildTodoDashboardFeedInput,
  generatedAt: string,
  items: readonly TodoItemFixture[],
): TodoDashboardCard {
  return {
    id: `todo-${input.familySlug}-overdue`,
    tenantId: input.tenantId,
    moduleKey: "todo",
    cardType: "todo",
    title: `지연된 가족 할 일 ${items.length}건`,
    summary:
      `${buildTodoPreview(items, input.timezone)}가 아직 남아 있습니다. ` +
      "지연된 가족 공용 항목은 today 흐름에서 가장 먼저 처리 여부를 묻습니다.",
    priority: 97,
    featured: true,
    pinned: false,
    visibilityScope: "all",
    href: `/app/${input.familySlug}/todo/overdue`,
    sectionHint: "today",
    badge: "지연",
    dueAt: items[0]!.dueAt,
    updatedAt: generatedAt,
  };
}

function buildTodayTodoCard(
  input: BuildTodoDashboardFeedInput,
  generatedAt: string,
  items: readonly TodoItemFixture[],
): TodoDashboardCard {
  return {
    id: `todo-${input.familySlug}-today`,
    tenantId: input.tenantId,
    moduleKey: "todo",
    cardType: "todo",
    title: `오늘 가족 체크 ${items.length}건`,
    summary:
      `${buildTodoPreview(items, input.timezone)}를 한 장으로 묶었습니다. ` +
      "오늘 마감 항목은 대표 카드 한 장만 홈에 올립니다.",
    priority: 91,
    featured: true,
    pinned: false,
    visibilityScope: "all",
    href: `/app/${input.familySlug}/todo/today`,
    sectionHint: "today",
    badge: "오늘",
    dueAt: items[0]!.dueAt,
    updatedAt: generatedAt,
  };
}

function buildPersonalTodoFocusCard(
  input: BuildTodoDashboardFeedInput,
  generatedAt: string,
  item: TodoItemFixture,
): TodoDashboardCard {
  const assignee = item.assigneeLabel ? `${item.assigneeLabel} ` : "";

  return {
    id: `todo-${input.familySlug}-focus-${item.id}`,
    tenantId: input.tenantId,
    moduleKey: "todo",
    cardType: "todo",
    title: "공유가 필요한 개인 체크",
    summary:
      `${formatTimeLabel(item.dueAt, input.timezone)} 전 ${assignee}${item.title}를 끝내야 합니다. ` +
      "개인 할 일은 가족 흐름을 막을 때만 focus 카드 1장으로 올립니다.",
    priority: 79,
    featured: false,
    pinned: false,
    visibilityScope: item.visibilityScope,
    href: `/app/${input.familySlug}/todo/${item.slug}`,
    sectionHint: "focus",
    badge: "개인",
    dueAt: item.dueAt,
    updatedAt: generatedAt,
  };
}

export function buildTodoDashboardFeed(input: BuildTodoDashboardFeedInput): DashboardModuleFeed {
  const generatedAt = resolveGeneratedAt(input);
  const selection = selectTodoDashboardItems(input);
  const cards: TodoDashboardCard[] = [];

  if (selection.overdueItems.length > 0) {
    cards.push(buildOverdueTodoCard(input, generatedAt, selection.overdueItems));
  }

  if (selection.todayItems.length > 0) {
    cards.push(buildTodayTodoCard(input, generatedAt, selection.todayItems));
  }

  if (selection.focusItem) {
    cards.push(buildPersonalTodoFocusCard(input, generatedAt, selection.focusItem));
  }

  cards.sort(compareDashboardCards);

  return {
    moduleKey: "todo",
    generatedAt,
    cards,
    meta: buildFeedMeta(
      cards,
      input.timezone,
      selection.overdueItems.length + selection.todayItems.length,
      selection.focusItem ? 1 : 0,
    ),
  };
}

export interface TodoDashboardSelection {
  overdueItems: TodoItemFixture[];
  todayItems: TodoItemFixture[];
  focusItem: TodoItemFixture | null;
}

export function selectTodoDashboardItems(
  input: Pick<
    BuildTodoDashboardFeedInput,
    "timezone" | "now" | "generatedAt" | "todos"
  >,
): TodoDashboardSelection {
  const source = input.todos ?? todoItemFixtures;
  const generatedAt = resolveGeneratedAt(input);
  const todayKey = getDateKey(generatedAt, input.timezone);
  const activeItems = source.filter((item) => !item.completed && item.visibilityScope !== "private");

  return {
    overdueItems: activeItems.filter(
      (item) =>
        item.audience === "family-shared" &&
        item.blocksFamilyFlow &&
        isOverdue(item, todayKey, input.timezone),
    ),
    todayItems: activeItems.filter(
      (item) =>
        item.audience === "family-shared" &&
        item.blocksFamilyFlow &&
        !isOverdue(item, todayKey, input.timezone) &&
        isDueToday(item, todayKey, input.timezone),
    ),
    focusItem:
      activeItems.find(
        (item) =>
          item.audience === "personal" &&
          item.blocksFamilyFlow &&
          (isOverdue(item, todayKey, input.timezone) || isDueToday(item, todayKey, input.timezone)),
      ) ?? null,
  };
}

export const todoHomeFeedFixture = buildTodoDashboardFeed({
  familySlug: "yoon",
  tenantId: "family-yoon",
  timezone: "Asia/Seoul",
  now: DEFAULT_TODO_FEED_NOW,
});
