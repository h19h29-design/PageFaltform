import type { DashboardCardPayload, DashboardModuleFeed } from "@ysplan/dashboard";
import type {
  DashboardCardVisibilityScope,
  HomeCardAudience,
  ModuleDescriptor,
  ModuleHomeCardFeedMeta,
  ModuleHomeCardRule,
  ModuleHomeFeedItemsInput,
} from "@ysplan/modules-core";
import { summarizeHomeCardAudience } from "@ysplan/modules-core";

const DEFAULT_HABITS_FEED_GENERATED_AT = "2026-03-19T07:30:00+09:00";
const DEFAULT_HABITS_TIMEZONE = "Asia/Seoul";

export const habitsModule: ModuleDescriptor = {
  key: "habits",
  kind: "tracker",
  label: "Habits",
  description: "Repeatable routines and check-in tracking.",
};

export interface HabitRoutineFixture {
  id: string;
  slug: string;
  audience: HomeCardAudience;
  visibilityScope: DashboardCardVisibilityScope;
  title: string;
  periodLabel: string;
  habitBenefit: string;
  completionCount: number;
  targetCount: number;
  consistencyRate: number;
  streakDays: number;
  nextCheckInAt?: string;
  featured?: boolean;
}

export type HabitDashboardCard = DashboardCardPayload & {
  moduleKey: "habits";
  cardType: "habit";
  sectionHint: "progress";
  badge: string;
  metricValue: number;
  metricTarget: 100;
  metricUnit: "%";
};

type DashboardFeedMeta = NonNullable<DashboardModuleFeed["meta"]>;

export type HabitsDashboardFeedMeta = DashboardFeedMeta &
  ModuleHomeCardFeedMeta & {
    sharedHabitCount: number;
    averageCompletionRate: number;
    averageConsistencyRate: number;
    longestStreakDays: number;
  };

export interface HabitsDashboardFeed extends DashboardModuleFeed {
  moduleKey: "habits";
  cards: HabitDashboardCard[];
  meta: HabitsDashboardFeedMeta;
}

export interface BuildHabitsDashboardFeedInput
  extends ModuleHomeFeedItemsInput<HabitRoutineFixture> {
  habits?: readonly HabitRoutineFixture[];
  timezone?: string;
}

export const habitsHomeCardRules: ModuleHomeCardRule[] = [
  {
    id: "habits-family-routine-first",
    title: "가족 공통 루틴을 habit 상단에 우선 배치",
    description:
      "아침 준비, 저녁 산책처럼 함께 지키는 루틴은 가족 배지와 높은 priority를 줘 progress 밴드에서 먼저 확인하게 합니다.",
  },
  {
    id: "habits-summary-shows-rate-and-consistency",
    title: "summary에 달성률·유지율·streak를 함께 표기",
    description:
      "습관 카드는 이번 주 달성률, 최근 유지율, 연속 기록을 한 문장에 모아 넣어 체크인 밀도를 홈 카드 한 장에서 바로 읽히게 합니다.",
  },
  {
    id: "habits-next-checkin-breaks-ties",
    title: "다음 체크 시간이 가까운 루틴이 같은 점수에서 먼저 노출",
    description:
      "같은 progress 밴드 안에서는 다음 체크 시간이 가까운 루틴을 앞에 두어 당일 루틴 흐름을 잃지 않게 합니다.",
  },
];

export const habitRoutineFixtures: HabitRoutineFixture[] = [
  {
    id: "evening-walk",
    slug: "evening-walk",
    audience: "family-shared",
    visibilityScope: "all",
    title: "저녁 산책 루틴",
    periodLabel: "이번 주",
    habitBenefit: "오늘 20분만 걸으면 저녁 루틴을 안정적으로 이어갑니다.",
    completionCount: 6,
    targetCount: 7,
    consistencyRate: 91,
    streakDays: 14,
    nextCheckInAt: "2026-03-19T20:10:00+09:00",
    featured: true,
  },
  {
    id: "water-before-school",
    slug: "water-before-school",
    audience: "family-shared",
    visibilityScope: "children-safe",
    title: "등교 전 물 챙기기",
    periodLabel: "이번 주",
    habitBenefit: "아침 준비 흐름을 가볍게 유지하는 기본 루틴입니다.",
    completionCount: 7,
    targetCount: 7,
    consistencyRate: 88,
    streakDays: 9,
    nextCheckInAt: "2026-03-20T07:10:00+09:00",
  },
  {
    id: "mom-stretching",
    slug: "mom-stretching",
    audience: "personal",
    visibilityScope: "adults",
    title: "엄마 밤 스트레칭",
    periodLabel: "이번 주",
    habitBenefit: "잠들기 전 정리 루틴을 놓치지 않게 도와줍니다.",
    completionCount: 4,
    targetCount: 5,
    consistencyRate: 82,
    streakDays: 11,
    nextCheckInAt: "2026-03-19T22:00:00+09:00",
  },
];

function toDate(value: string | Date | undefined): Date | null {
  if (!value) {
    return null;
  }

  const nextValue = value instanceof Date ? value : new Date(value);
  return Number.isNaN(nextValue.getTime()) ? null : nextValue;
}

function roundRate(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function getCompletionRate(habit: HabitRoutineFixture): number {
  if (habit.targetCount <= 0) {
    return 0;
  }

  return roundRate((habit.completionCount / habit.targetCount) * 100);
}

function getHoursUntilCheckIn(habit: HabitRoutineFixture, generatedAt: string): number | null {
  const nextCheckInAt = toDate(habit.nextCheckInAt);
  const now = toDate(generatedAt);

  if (!nextCheckInAt || !now) {
    return null;
  }

  return (nextCheckInAt.getTime() - now.getTime()) / (1000 * 60 * 60);
}

function getHabitBadge(habit: HabitRoutineFixture): string {
  const prefix = habit.audience === "family-shared" ? "가족 " : "";

  return `${prefix}${habit.streakDays}일 연속`;
}

function getHabitPriority(
  habit: HabitRoutineFixture,
  completionRate: number,
  generatedAt: string,
): number {
  let priority = habit.audience === "family-shared" ? 71 : 63;

  if (habit.consistencyRate >= 90) {
    priority += 8;
  } else if (habit.consistencyRate >= 80) {
    priority += 5;
  } else if (habit.consistencyRate >= 70) {
    priority += 2;
  }

  if (completionRate >= 90) {
    priority += 4;
  } else if (completionRate >= 75) {
    priority += 2;
  }

  if (habit.streakDays >= 21) {
    priority += 6;
  } else if (habit.streakDays >= 14) {
    priority += 4;
  } else if (habit.streakDays >= 7) {
    priority += 2;
  }

  const hoursUntilCheckIn = getHoursUntilCheckIn(habit, generatedAt);

  if (hoursUntilCheckIn !== null && hoursUntilCheckIn >= 0 && hoursUntilCheckIn <= 12) {
    priority += 2;
  }

  if (habit.featured) {
    priority += 3;
  }

  return Math.min(priority, 90);
}

function buildHabitSummary(habit: HabitRoutineFixture, completionRate: number): string {
  return `${habit.periodLabel} ${habit.completionCount}/${habit.targetCount}회 체크로 달성률 ${completionRate}%를 기록했고 유지율 ${habit.consistencyRate}%로 ${habit.streakDays}일 연속입니다. ${habit.habitBenefit}`;
}

function compareHabitCards(left: HabitDashboardCard, right: HabitDashboardCard): number {
  if (right.priority !== left.priority) {
    return right.priority - left.priority;
  }

  if (left.dueAt && right.dueAt && left.dueAt !== right.dueAt) {
    return left.dueAt.localeCompare(right.dueAt);
  }

  if (left.dueAt && !right.dueAt) {
    return -1;
  }

  if (!left.dueAt && right.dueAt) {
    return 1;
  }

  return right.updatedAt.localeCompare(left.updatedAt);
}

function buildFeedMeta(
  source: readonly HabitRoutineFixture[],
  cards: readonly HabitDashboardCard[],
  timezone: string,
): HabitsDashboardFeedMeta {
  const audienceSummary = summarizeHomeCardAudience(source);
  const completionRates = source.map(getCompletionRate);
  const averageCompletionRate =
    completionRates.length > 0
      ? roundRate(
          completionRates.reduce((sum, completionRate) => sum + completionRate, 0) /
            completionRates.length,
        )
      : 0;
  const averageConsistencyRate =
    source.length > 0
      ? roundRate(
          source.reduce((sum, habit) => sum + habit.consistencyRate, 0) / source.length,
        )
      : 0;
  const sharedHabitCount = source.filter((habit) => habit.audience === "family-shared").length;
  const longestStreakDays = source.reduce((max, habit) => Math.max(max, habit.streakDays), 0);

  return {
    visibleCount: cards.length,
    featuredCount: cards.filter((card) => card.featured).length,
    note: `habits-ready | completion-rate + consistency-rate + streak summary | timezone=${timezone}`,
    ...audienceSummary,
    sharedHabitCount,
    averageCompletionRate,
    averageConsistencyRate,
    longestStreakDays,
  };
}

export function buildHabitsDashboardFeed(
  input: BuildHabitsDashboardFeedInput,
): HabitsDashboardFeed {
  const source = input.items ?? input.habits ?? habitRoutineFixtures;
  const generatedAt = input.generatedAt ?? DEFAULT_HABITS_FEED_GENERATED_AT;
  const timezone = input.timezone ?? DEFAULT_HABITS_TIMEZONE;
  const cards = source
    .map<HabitDashboardCard>((habit) => {
      const completionRate = getCompletionRate(habit);

      return {
        id: `habit-${habit.id}`,
        tenantId: input.tenantId,
        moduleKey: "habits",
        cardType: "habit",
        title: habit.title,
        summary: buildHabitSummary(habit, completionRate),
        priority: getHabitPriority(habit, completionRate, generatedAt),
        featured:
          habit.featured ??
          (habit.audience === "family-shared" &&
            habit.consistencyRate >= 85 &&
            habit.streakDays >= 7),
        pinned: false,
        visibilityScope: habit.visibilityScope,
        href: `/app/${input.familySlug}/habits/${habit.slug}`,
        sectionHint: "progress",
        badge: getHabitBadge(habit),
        updatedAt: generatedAt,
        metricValue: habit.consistencyRate,
        metricTarget: 100,
        metricUnit: "%",
        ...(habit.nextCheckInAt ? { dueAt: habit.nextCheckInAt } : {}),
      };
    })
    .sort(compareHabitCards);

  return {
    moduleKey: "habits",
    generatedAt,
    cards,
    meta: buildFeedMeta(source, cards, timezone),
  };
}

export const habitsHomeFeedFixture = buildHabitsDashboardFeed({
  familySlug: "yoon",
  tenantId: "family-yoon",
  habits: habitRoutineFixtures,
  timezone: DEFAULT_HABITS_TIMEZONE,
  generatedAt: DEFAULT_HABITS_FEED_GENERATED_AT,
});
