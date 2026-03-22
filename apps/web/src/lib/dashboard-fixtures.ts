import {
  buildDashboardHomeModel,
  dashboardPresetPolicies,
  type DashboardHomeModel,
  type DashboardResolvedCard,
  type DashboardSectionKey,
  type DashboardViewerRole,
} from "@ysplan/dashboard";
import { coreModules, type ModuleKey } from "@ysplan/modules-core";
import type { FamilyHomePreset } from "@ysplan/platform";
import { buildFamilyDashboardFeeds, type FamilyDashboardFeedSource } from "@ysplan/tenant";

import type { ContentModuleKey } from "./content-modules";
import { buildFamilyContentDashboardFeeds } from "./content-store";
import { buildFamilyScheduleDashboardFeeds } from "./family-schedule-modules";
import {
  buildStoredHabitsDashboardFeed,
  buildStoredProgressDashboardFeed,
} from "./tracker-store";

export interface DashboardCardViewModel {
  title: string;
  description: string;
  badge: string;
  meta: string;
  href: string;
  tone?: "default" | "accent" | "warm";
}

export interface DashboardSectionViewModel {
  kicker: string;
  title: string;
  description: string;
  cards: DashboardCardViewModel[];
}

export interface DashboardMetricViewModel {
  label: string;
  value: string;
}

export interface DashboardViewModel {
  heroBadge: string;
  heroTitle: string;
  heroSummary: string;
  glance: DashboardMetricViewModel[];
  highlights: string[];
  sections: DashboardSectionViewModel[];
}

interface BuildDashboardInput {
  familySlug: string;
  tenantId: string;
  familyName: string;
  heroSummary: string;
  householdMood: string;
  memberCount: number;
  enabledModules: ModuleKey[];
  homePreset: FamilyHomePreset;
  timezone: string;
  now?: string | Date;
  viewerRole: DashboardViewerRole;
}

const sectionCopy: Record<
  DashboardSectionKey,
  {
    kicker: string;
    title: string;
    description: string;
  }
> = {
  hero: {
    kicker: "대표 카드",
    title: "가장 먼저 읽히는 단일 카드",
    description: "명시적인 hero 힌트가 있으면 그 카드가, 없으면 현재 화면에서 가장 높은 우선순위 카드가 이 자리를 차지합니다.",
  },
  pinned: {
    kicker: "고정 밴드",
    title: "장기 고정 리마인더",
    description: "D-day나 장기 공지처럼 계속 보여야 하는 카드를 별도 슬롯으로 고정합니다.",
  },
  today: {
    kicker: "오늘 큐",
    title: "오늘 바로 움직여야 하는 카드",
    description: "당일 일정과 오늘 마감 할 일을 우선 집계해 행동 유도가 가장 먼저 일어나도록 만듭니다.",
  },
  focus: {
    kicker: "집중 큐",
    title: "지금 챙겨야 하지만 당장은 아닌 카드",
    description: "지연된 투두, 내일 준비물, 중요 공지처럼 집중이 필요한 흐름을 별도 섹션으로 정리합니다.",
  },
  progress: {
    kicker: "진행 밴드",
    title: "가족 목표와 루틴 흐름",
    description: "진행률, 연속 기록, 루틴 카드처럼 연속성이 중요한 항목을 한 단계 아래에서 계속 보이게 둡니다.",
  },
  recent: {
    kicker: "최근 기록",
    title: "최근 글과 사진 흐름",
    description: "글, 일기, 갤러리처럼 최신성 중심의 기록 카드는 하단 스토리 밴드에서 경쟁합니다.",
  },
};

const homePresetCopy: Record<
  FamilyHomePreset,
  {
    badge: string;
    titleSuffix: string;
    summary: (input: BuildDashboardInput, topModules: string, homeModel: DashboardHomeModel) => string;
  }
> = {
  balanced: {
    badge: "균형형 홈",
    titleSuffix: "가족 홈",
    summary: (input, topModules, homeModel) =>
      `${input.heroSummary} 지금 홈은 ${topModules} 모듈을 켜 둔 상태에서 ${describeSectionFlow(homeModel)} 순서로 카드를 정리해 중요한 일과 최근 기록이 함께 보이도록 맞춰졌습니다.`,
  },
  planner: {
    badge: "실행형 홈",
    titleSuffix: "실행 보드",
    summary: (input, topModules, homeModel) =>
      `${input.heroSummary} 지금 홈은 ${topModules} 흐름을 기반으로 ${describeSectionFlow(homeModel)} 순서가 앞에 오도록 세팅해, 들어오자마자 바로 움직일 카드가 먼저 읽히게 만들었습니다.`,
  },
  story: {
    badge: "기록형 홈",
    titleSuffix: "기록 보드",
    summary: (input, topModules, homeModel) =>
      `${input.heroSummary} 지금 홈은 ${topModules} 모듈이 ${describeSectionFlow(homeModel)} 흐름으로 이어지면서, 기록형 카드가 자연스럽게 보이되 긴급 카드는 앞단에서 놓치지 않도록 정리했습니다.`,
  },
};

function getModuleLabel(moduleKey: ModuleKey): string {
  return coreModules.find((module) => module.key === moduleKey)?.label ?? moduleKey;
}

function describeTopModules(enabledModules: ModuleKey[]): string {
  const labels = enabledModules.slice(0, 3).map(getModuleLabel);

  if (labels.length === 0) {
    return "기본 모듈";
  }

  if (labels.length === 1) {
    return labels[0]!;
  }

  return `${labels.slice(0, -1).join(", ")} 그리고 ${labels.at(-1)}`;
}

function getSectionLabel(sectionKey: DashboardSectionKey) {
  return sectionCopy[sectionKey].title;
}

function describeSectionFlow(homeModel: DashboardHomeModel) {
  return homeModel.sections
    .filter((section) => section.items.length > 0)
    .slice(0, 4)
    .map((section) => getSectionLabel(section.key))
    .join(" → ");
}

function toneForCard(card: DashboardResolvedCard): NonNullable<DashboardCardViewModel["tone"]> {
  if (card.section === "hero" || card.section === "today") {
    return "accent";
  }

  if (card.section === "pinned" || card.card.cardType === "announcement") {
    return "warm";
  }

  if (card.card.cardType === "gallery") {
    return "accent";
  }

  return "default";
}

function buildCardMeta(card: DashboardResolvedCard) {
  const parts = [
    getModuleLabel(card.card.moduleKey),
    getSectionLabel(card.section),
    `점수 ${card.score}`,
  ];

  if (card.card.startsAt) {
    parts.push("일정 기준");
  } else if (card.card.dueAt) {
    parts.push("마감 기준");
  } else if (card.card.metricValue !== null && card.card.metricValue !== undefined) {
    parts.push(`${card.card.metricValue}${card.card.metricUnit ?? ""}`);
  }

  return parts.join(" · ");
}

function buildHighlights(input: BuildDashboardInput, homeModel: DashboardHomeModel, topModules: string) {
  const sectionFlow = describeSectionFlow(homeModel);
  const presetPolicy = dashboardPresetPolicies[input.homePreset];

  return [
    `${presetPolicy.label} 규칙에 따라 ${sectionFlow} 흐름을 기준선으로 고정했습니다.`,
    `${input.householdMood} 무드를 유지하되, 같은 섹션 안에서는 점수 → featured → 일정/마감 시각 → 최근 수정 → 활성 모듈 순서로 정렬합니다.`,
    `${topModules}처럼 켜 둔 모듈만 집계에 들어오고, 모듈 순서는 같은 우선순위 카드의 마지막 tie-breaker로만 작동합니다.`,
  ];
}

function describeFeedSources(sourceByModule: Partial<Record<ModuleKey, FamilyDashboardFeedSource>>) {
  const builderCount = Object.values(sourceByModule).filter((source) => source === "module-builder").length;

  return builderCount > 0
    ? `현재 홈 피드는 활성 모듈 ${builderCount}개를 모두 정식 module builder로 합성합니다.`
    : "현재 홈 피드는 활성 모듈 기준으로 합성됩니다.";
}

function buildSections(homeModel: DashboardHomeModel): DashboardSectionViewModel[] {
  return homeModel.sections
    .filter((section) => section.items.length > 0)
    .map((section) => {
      const copy = sectionCopy[section.key];
      const overflowSuffix =
        section.overflowCount > 0
          ? ` 현재는 상위 ${section.items.length}장만 노출하고 ${section.overflowCount}장은 overflow로 남깁니다.`
          : "";

      return {
        kicker: copy.kicker,
        title: copy.title,
        description: `${copy.description}${overflowSuffix}`,
        cards: section.items.map((card) => ({
          title: card.card.title,
          description: card.card.summary,
          badge: card.card.badge ?? getModuleLabel(card.card.moduleKey),
          meta: buildCardMeta(card),
          href: card.card.href,
          tone: toneForCard(card),
        })),
      };
    });
}

async function buildDashboardFeedResult(input: {
  familySlug: string;
  tenantId: string;
  enabledModules: ModuleKey[];
  timezone: string;
  now: string | Date;
}): Promise<{
  feeds: ReturnType<typeof buildFamilyDashboardFeeds>["feeds"];
  sourceByModule: Partial<Record<ModuleKey, FamilyDashboardFeedSource>>;
}> {
  const baseFeedResult = buildFamilyDashboardFeeds(input);
  const contentFeeds = await buildFamilyContentDashboardFeeds(input);
  const scheduleFeeds = await buildFamilyScheduleDashboardFeeds(input);
  const trackerFeeds = await Promise.all(
    input.enabledModules
      .filter((moduleKey): moduleKey is "progress" | "habits" => moduleKey === "progress" || moduleKey === "habits")
      .map((moduleKey) =>
        moduleKey === "progress"
          ? buildStoredProgressDashboardFeed(input)
          : buildStoredHabitsDashboardFeed(input),
      ),
  );
  const feedByModule = new Map(baseFeedResult.feeds.map((feed) => [feed.moduleKey, feed]));

  for (const feed of scheduleFeeds) {
    feedByModule.set(feed.moduleKey, feed);
  }

  for (const feed of contentFeeds) {
    feedByModule.set(feed.moduleKey, feed);
  }

  for (const feed of trackerFeeds) {
    feedByModule.set(feed.moduleKey, feed);
  }

  return {
    feeds: input.enabledModules
      .map((moduleKey) => feedByModule.get(moduleKey))
      .filter((feed): feed is (typeof baseFeedResult.feeds)[number] => Boolean(feed)),
    sourceByModule: {
      ...baseFeedResult.sourceByModule,
      ...Object.fromEntries(
        (["announcements", "posts", "gallery", "diary"] as ContentModuleKey[])
          .filter((moduleKey) => input.enabledModules.includes(moduleKey))
          .map((moduleKey) => [moduleKey, "module-builder" as const]),
      ),
    },
  };
}

export async function buildDashboardViewModel(input: BuildDashboardInput): Promise<DashboardViewModel> {
  const enabledModules: ModuleKey[] =
    input.enabledModules.length > 0 ? [...input.enabledModules] : ["announcements"];
  const now = input.now ?? new Date().toISOString();
  const feedResult = await buildDashboardFeedResult({
    familySlug: input.familySlug,
    tenantId: input.tenantId,
    enabledModules,
    timezone: input.timezone,
    now,
  });
  const homeModel = buildDashboardHomeModel(
    {
      preset: input.homePreset,
      context: {
        familySlug: input.familySlug,
        tenantId: input.tenantId,
        activeModuleKeys: enabledModules,
        viewerRole: input.viewerRole,
        viewerState: "signed-in",
        timezone: input.timezone,
      },
      feeds: feedResult.feeds,
    },
    {
      viewport: "desktop",
      now,
    },
  );
  const presetCopy = homePresetCopy[input.homePreset];
  const topModules = describeTopModules(enabledModules);
  const firstVisibleSection = homeModel.sections.find((section) => section.items.length > 0);
  const firstVisibleCard = firstVisibleSection?.items[0];

  return {
    heroBadge: presetCopy.badge,
    heroTitle: `${input.familyName} ${presetCopy.titleSuffix}`,
    heroSummary: presetCopy.summary(input, topModules, homeModel),
    glance: [
      { label: "활성 모듈", value: `${enabledModules.length}개` },
      { label: "첫 섹션", value: firstVisibleSection ? getSectionLabel(firstVisibleSection.key) : "없음" },
      { label: "첫 카드", value: firstVisibleCard?.card.title ?? "-" },
      { label: "노출 카드", value: `${homeModel.summary.renderedCardCount}장` },
      { label: "가족 구성", value: `${input.memberCount}명` },
    ],
    highlights: [
      ...buildHighlights(input, homeModel, topModules),
      describeFeedSources(feedResult.sourceByModule),
    ],
    sections: buildSections(homeModel),
  };
}
