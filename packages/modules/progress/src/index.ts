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

const DEFAULT_PROGRESS_FEED_GENERATED_AT = "2026-03-19T07:30:00+09:00";
const DEFAULT_PROGRESS_TIMEZONE = "Asia/Seoul";
const NUMBER_FORMATTER = new Intl.NumberFormat("ko-KR");

export const progressModule: ModuleDescriptor = {
  key: "progress",
  kind: "tracker",
  label: "Progress",
  description: "Goal tracking, streaks, and shared progress boards.",
};

export interface ProgressGoalFixture {
  id: string;
  slug: string;
  audience: HomeCardAudience;
  visibilityScope: DashboardCardVisibilityScope;
  title: string;
  goalOutcome: string;
  currentValue: number;
  targetValue: number;
  metricLabel: string;
  metricUnit: string;
  cadenceLabel: string;
  streakDays: number;
  dueAt?: string;
  featured?: boolean;
}

export type ProgressDashboardCard = DashboardCardPayload & {
  moduleKey: "progress";
  cardType: "progress";
  sectionHint: "progress";
  badge: string;
  metricValue: number;
  metricTarget: 100;
  metricUnit: "%";
};

type DashboardFeedMeta = NonNullable<DashboardModuleFeed["meta"]>;

export type ProgressDashboardFeedMeta = DashboardFeedMeta &
  ModuleHomeCardFeedMeta & {
    sharedGoalCount: number;
    averageCompletionRate: number;
    longestStreakDays: number;
    dueSoonCount: number;
  };

export interface ProgressDashboardFeed extends DashboardModuleFeed {
  moduleKey: "progress";
  cards: ProgressDashboardCard[];
  meta: ProgressDashboardFeedMeta;
}

export interface BuildProgressDashboardFeedInput
  extends ModuleHomeFeedItemsInput<ProgressGoalFixture> {
  goals?: readonly ProgressGoalFixture[];
  timezone?: string;
}

export const progressHomeCardRules: ModuleHomeCardRule[] = [
  {
    id: "progress-family-goal-first",
    title: "가족 공통 목표를 progress 상단에 우선 배치",
    description:
      "가족 모두가 같이 보는 목표는 개인 목표보다 높은 priority와 가족 배지로 올려 progress 밴드에서 먼저 읽히게 합니다.",
  },
  {
    id: "progress-badge-shows-attainment",
    title: "배지는 달성률, summary는 남은 간격과 streak",
    description:
      "progress 카드는 badge와 metric 필드에 달성률을 싣고, summary에는 남은 목표 간격과 연속 체크 streak를 함께 적어 한 장으로 상태를 파악하게 합니다.",
  },
  {
    id: "progress-due-soon-lifts-inside-band",
    title: "마감이 가까운 목표는 progress 밴드 안에서 상승",
    description:
      "tracker 카드를 today로 올리지는 않되, 마감이 가까운 목표는 dueAt과 priority를 함께 반영해 progress 섹션 안에서 먼저 보이게 합니다.",
  },
];

export const progressGoalFixtures: ProgressGoalFixture[] = [
  {
    id: "spring-trip-fund",
    slug: "spring-trip-fund",
    audience: "family-shared",
    visibilityScope: "all",
    title: "봄 가족여행 적립",
    goalOutcome: "주말 가족여행 예산 준비가 완료됩니다.",
    currentValue: 720000,
    targetValue: 1000000,
    metricLabel: "적립금",
    metricUnit: "원",
    cadenceLabel: "이번 달",
    streakDays: 5,
    dueAt: "2026-03-31T21:00:00+09:00",
    featured: true,
  },
  {
    id: "reading-challenge",
    slug: "reading-challenge",
    audience: "family-shared",
    visibilityScope: "children-safe",
    title: "가족 독서 챌린지",
    goalOutcome: "이번 주 공동 독서 챌린지를 완주합니다.",
    currentValue: 18,
    targetValue: 24,
    metricLabel: "읽은 책",
    metricUnit: "권",
    cadenceLabel: "이번 주",
    streakDays: 8,
    dueAt: "2026-03-22T20:30:00+09:00",
  },
  {
    id: "mina-piano-board",
    slug: "mina-piano-board",
    audience: "personal",
    visibilityScope: "children-safe",
    title: "민아 피아노 연습판",
    goalOutcome: "이번 주 연습 스티커 보드를 모두 채웁니다.",
    currentValue: 7,
    targetValue: 10,
    metricLabel: "연습 횟수",
    metricUnit: "회",
    cadenceLabel: "이번 주",
    streakDays: 3,
    dueAt: "2026-03-23T19:00:00+09:00",
  },
];

function toDate(value: string | Date | undefined): Date | null {
  if (!value) {
    return null;
  }

  const nextValue = value instanceof Date ? value : new Date(value);
  return Number.isNaN(nextValue.getTime()) ? null : nextValue;
}

function formatMetricAmount(value: number, unit: string): string {
  return `${NUMBER_FORMATTER.format(value)}${unit}`;
}

function hasBatchim(value: string): boolean {
  const lastCharacter = value.trim().at(-1);

  if (!lastCharacter) {
    return false;
  }

  const codePoint = lastCharacter.charCodeAt(0);

  if (codePoint < 0xac00 || codePoint > 0xd7a3) {
    return false;
  }

  return (codePoint - 0xac00) % 28 !== 0;
}

function appendObjectParticle(value: string): string {
  return `${value}${hasBatchim(value) ? "을" : "를"}`;
}

function roundRate(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function getCompletionRate(goal: ProgressGoalFixture): number {
  if (goal.targetValue <= 0) {
    return 0;
  }

  return roundRate((goal.currentValue / goal.targetValue) * 100);
}

function getDaysUntilDue(goal: ProgressGoalFixture, generatedAt: string): number | null {
  const dueAt = toDate(goal.dueAt);
  const now = toDate(generatedAt);

  if (!dueAt || !now) {
    return null;
  }

  return Math.ceil((dueAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getProgressBadge(goal: ProgressGoalFixture, completionRate: number): string {
  const prefix = goal.audience === "family-shared" ? "가족 " : "";

  return `${prefix}${completionRate}%`;
}

function getProgressPriority(
  goal: ProgressGoalFixture,
  completionRate: number,
  generatedAt: string,
): number {
  let priority = goal.audience === "family-shared" ? 72 : 64;

  if (completionRate >= 85) {
    priority += 8;
  } else if (completionRate >= 65) {
    priority += 5;
  } else if (completionRate >= 40) {
    priority += 2;
  }

  if (goal.streakDays >= 14) {
    priority += 6;
  } else if (goal.streakDays >= 7) {
    priority += 4;
  } else if (goal.streakDays >= 3) {
    priority += 2;
  }

  const daysUntilDue = getDaysUntilDue(goal, generatedAt);

  if (daysUntilDue !== null) {
    if (daysUntilDue <= 3) {
      priority += 4;
    } else if (daysUntilDue <= 7) {
      priority += 2;
    }
  }

  if (goal.featured) {
    priority += 3;
  }

  return Math.min(priority, 90);
}

function buildProgressSummary(goal: ProgressGoalFixture, completionRate: number): string {
  const remainingValue = Math.max(goal.targetValue - goal.currentValue, 0);
  const progressLabel = `${goal.cadenceLabel} ${goal.metricLabel} ${completionRate}%를 채웠고`;
  const streakLabel =
    goal.streakDays > 0
      ? ` ${goal.streakDays}일 연속으로 체크인을 이어가고 있습니다.`
      : " 오늘 다시 체크인을 시작하면 흐름을 회복할 수 있습니다.";
  const remainingLabel = appendObjectParticle(formatMetricAmount(remainingValue, goal.metricUnit));

  if (remainingValue === 0) {
    return `${progressLabel}${streakLabel} ${goal.goalOutcome}`;
  }

  return `${progressLabel}${streakLabel} 남은 ${remainingLabel} 채우면 ${goal.goalOutcome}`;
}

function compareProgressCards(left: ProgressDashboardCard, right: ProgressDashboardCard): number {
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
  source: readonly ProgressGoalFixture[],
  cards: readonly ProgressDashboardCard[],
  generatedAt: string,
  timezone: string,
): ProgressDashboardFeedMeta {
  const audienceSummary = summarizeHomeCardAudience(source);
  const completionRates = source.map(getCompletionRate);
  const averageCompletionRate =
    completionRates.length > 0
      ? roundRate(
          completionRates.reduce((sum, completionRate) => sum + completionRate, 0) /
            completionRates.length,
        )
      : 0;
  const sharedGoalCount = source.filter((goal) => goal.audience === "family-shared").length;
  const longestStreakDays = source.reduce((max, goal) => Math.max(max, goal.streakDays), 0);
  const dueSoonCount = source.filter((goal) => {
    const daysUntilDue = getDaysUntilDue(goal, generatedAt);

    return daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7;
  }).length;

  return {
    visibleCount: cards.length,
    featuredCount: cards.filter((card) => card.featured).length,
    note: `progress-ready | completion-rate + streak summary | timezone=${timezone}`,
    ...audienceSummary,
    sharedGoalCount,
    averageCompletionRate,
    longestStreakDays,
    dueSoonCount,
  };
}

export function buildProgressDashboardFeed(
  input: BuildProgressDashboardFeedInput,
): ProgressDashboardFeed {
  const source = input.items ?? input.goals ?? progressGoalFixtures;
  const generatedAt = input.generatedAt ?? DEFAULT_PROGRESS_FEED_GENERATED_AT;
  const timezone = input.timezone ?? DEFAULT_PROGRESS_TIMEZONE;
  const cards = source
    .map<ProgressDashboardCard>((goal) => {
      const completionRate = getCompletionRate(goal);

      return {
        id: `progress-${goal.id}`,
        tenantId: input.tenantId,
        moduleKey: "progress",
        cardType: "progress",
        title: goal.title,
        summary: buildProgressSummary(goal, completionRate),
        priority: getProgressPriority(goal, completionRate, generatedAt),
        featured:
          goal.featured ??
          (goal.audience === "family-shared" && completionRate >= 70 && goal.streakDays >= 5),
        pinned: false,
        visibilityScope: goal.visibilityScope,
        href: `/app/${input.familySlug}/progress/${goal.slug}`,
        sectionHint: "progress",
        badge: getProgressBadge(goal, completionRate),
        updatedAt: generatedAt,
        metricValue: completionRate,
        metricTarget: 100,
        metricUnit: "%",
        ...(goal.dueAt ? { dueAt: goal.dueAt } : {}),
      };
    })
    .sort(compareProgressCards);

  return {
    moduleKey: "progress",
    generatedAt,
    cards,
    meta: buildFeedMeta(source, cards, generatedAt, timezone),
  };
}

export const progressHomeFeedFixture = buildProgressDashboardFeed({
  familySlug: "yoon",
  tenantId: "family-yoon",
  goals: progressGoalFixtures,
  timezone: DEFAULT_PROGRESS_TIMEZONE,
  generatedAt: DEFAULT_PROGRESS_FEED_GENERATED_AT,
});
