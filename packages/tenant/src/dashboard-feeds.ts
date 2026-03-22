import type { DashboardModuleFeed } from "@ysplan/dashboard";
import { buildAnnouncementsDashboardFeed } from "@ysplan/modules-announcements";
import { buildCalendarDashboardFeed } from "@ysplan/modules-calendar";
import type { ModuleKey } from "@ysplan/modules-core";
import { buildDayPlannerDashboardFeed } from "@ysplan/modules-day-planner";
import { buildDiaryDashboardFeed } from "@ysplan/modules-diary";
import { buildGalleryDashboardFeed } from "@ysplan/modules-gallery";
import { buildHabitsDashboardFeed } from "@ysplan/modules-habits";
import { buildPostsDashboardFeed } from "@ysplan/modules-posts";
import { buildProgressDashboardFeed } from "@ysplan/modules-progress";
import { buildSchoolTimetableDashboardFeed } from "@ysplan/modules-school-timetable";
import { buildTodoDashboardFeed } from "@ysplan/modules-todo";

const DEFAULT_DASHBOARD_FEED_TIMEZONE = "Asia/Seoul";

export type FamilyDashboardFeedSource = "module-builder";

export interface BuildFamilyDashboardFeedsInput {
  familySlug: string;
  tenantId: string;
  enabledModules: readonly ModuleKey[];
  timezone?: string;
  now?: string | Date;
}

export interface BuildFamilyDashboardFeedsResult {
  feeds: DashboardModuleFeed[];
  sourceByModule: Partial<Record<ModuleKey, FamilyDashboardFeedSource>>;
}

type FeedFactoryResult = {
  feed: DashboardModuleFeed;
  source: FamilyDashboardFeedSource;
};

type ResolvedDashboardFeedContext = {
  generatedAt: string;
  now: string | Date;
  timezone: string;
};

function toIsoString(value?: string | Date): string {
  if (typeof value === "string") {
    return value;
  }

  return (value ?? new Date()).toISOString();
}

function resolveEnabledModules(moduleKeys: readonly ModuleKey[]): ModuleKey[] {
  const orderedKeys: ModuleKey[] = [];
  const seenKeys = new Set<ModuleKey>();

  for (const moduleKey of moduleKeys) {
    if (seenKeys.has(moduleKey)) {
      continue;
    }

    seenKeys.add(moduleKey);
    orderedKeys.push(moduleKey);
  }

  return orderedKeys.length > 0 ? orderedKeys : ["announcements"];
}

function resolveFeedContext(input: BuildFamilyDashboardFeedsInput): ResolvedDashboardFeedContext {
  const now = input.now ?? new Date();

  return {
    generatedAt: toIsoString(now),
    now,
    timezone: input.timezone ?? DEFAULT_DASHBOARD_FEED_TIMEZONE,
  };
}

function withFeedNote(feed: DashboardModuleFeed): DashboardModuleFeed {
  const note = feed.meta?.note
    ? `${feed.meta.note} | source=module-builder`
    : "source=module-builder";
  const meta = feed.meta
    ? {
        ...feed.meta,
        note,
      }
    : {
        note,
      };

  return {
    ...feed,
    meta,
  };
}

function createFeedForModule(
  moduleKey: ModuleKey,
  input: BuildFamilyDashboardFeedsInput,
  context: ResolvedDashboardFeedContext,
): FeedFactoryResult | null {
  switch (moduleKey) {
    case "announcements": {
      const feed = buildAnnouncementsDashboardFeed({
        familySlug: input.familySlug,
        tenantId: input.tenantId,
        now: context.now,
        generatedAt: context.generatedAt,
      });

      return {
        feed: withFeedNote(feed),
        source: "module-builder",
      };
    }
    case "posts": {
      const feed = buildPostsDashboardFeed({
        familySlug: input.familySlug,
        tenantId: input.tenantId,
        now: context.now,
        generatedAt: context.generatedAt,
      });

      return {
        feed: withFeedNote(feed),
        source: "module-builder",
      };
    }
    case "gallery": {
      const feed = buildGalleryDashboardFeed({
        familySlug: input.familySlug,
        tenantId: input.tenantId,
        now: context.now,
        generatedAt: context.generatedAt,
      });

      return {
        feed: withFeedNote(feed),
        source: "module-builder",
      };
    }
    case "calendar": {
      const feed = buildCalendarDashboardFeed({
        familySlug: input.familySlug,
        tenantId: input.tenantId,
        timezone: context.timezone,
        now: context.now,
        generatedAt: context.generatedAt,
      });

      return {
        feed: withFeedNote(feed),
        source: "module-builder",
      };
    }
    case "todo": {
      const feed = buildTodoDashboardFeed({
        familySlug: input.familySlug,
        tenantId: input.tenantId,
        timezone: context.timezone,
        now: context.now,
        generatedAt: context.generatedAt,
      });

      return {
        feed: withFeedNote(feed),
        source: "module-builder",
      };
    }
    case "diary": {
      const feed = buildDiaryDashboardFeed({
        familySlug: input.familySlug,
        tenantId: input.tenantId,
        now: context.now,
        generatedAt: context.generatedAt,
      });

      return {
        feed: withFeedNote(feed),
        source: "module-builder",
      };
    }
    case "school-timetable": {
      const feed = buildSchoolTimetableDashboardFeed({
        familySlug: input.familySlug,
        tenantId: input.tenantId,
        timezone: context.timezone,
        now: context.now,
        generatedAt: context.generatedAt,
      });

      return {
        feed: withFeedNote(feed),
        source: "module-builder",
      };
    }
    case "day-planner": {
      const feed = buildDayPlannerDashboardFeed({
        familySlug: input.familySlug,
        tenantId: input.tenantId,
        timezone: context.timezone,
        now: context.now,
        generatedAt: context.generatedAt,
      });

      return {
        feed: withFeedNote(feed),
        source: "module-builder",
      };
    }
    case "progress": {
      const feed = buildProgressDashboardFeed({
        familySlug: input.familySlug,
        tenantId: input.tenantId,
        now: context.now,
        timezone: context.timezone,
        generatedAt: context.generatedAt,
      });

      return {
        feed: withFeedNote(feed),
        source: "module-builder",
      };
    }
    case "habits": {
      const feed = buildHabitsDashboardFeed({
        familySlug: input.familySlug,
        tenantId: input.tenantId,
        now: context.now,
        timezone: context.timezone,
        generatedAt: context.generatedAt,
      });

      return {
        feed: withFeedNote(feed),
        source: "module-builder",
      };
    }
    default:
      return null;
  }
}

export function buildFamilyDashboardFeeds(
  input: BuildFamilyDashboardFeedsInput,
): BuildFamilyDashboardFeedsResult {
  const enabledModules = resolveEnabledModules(input.enabledModules);
  const context = resolveFeedContext(input);
  const feeds: DashboardModuleFeed[] = [];
  const sourceByModule: Partial<Record<ModuleKey, FamilyDashboardFeedSource>> = {};

  for (const moduleKey of enabledModules) {
    const result = createFeedForModule(moduleKey, input, context);

    if (!result) {
      continue;
    }

    feeds.push(result.feed);
    sourceByModule[moduleKey] = result.source;
  }

  return {
    feeds,
    sourceByModule,
  };
}
