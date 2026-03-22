import type { DashboardCardPayload, DashboardModuleFeed } from "@ysplan/dashboard";
import type {
  DashboardCardVisibilityScope,
  HomeCardAudience,
  ModuleDescriptor,
  ModuleHomeCardRule,
  ModuleHomeFeedItemsInput,
  ModuleHomeCardFeedMeta,
} from "@ysplan/modules-core";
import { resolveModuleFeedGeneratedAt, summarizeHomeCardAudience } from "@ysplan/modules-core";

export const diaryModule: ModuleDescriptor = {
  key: "diary",
  kind: "content",
  label: "Diary",
  description: "Daily reflections and family journaling.",
};

export interface DiaryEntryFixture {
  id: string;
  slug: string;
  audience: HomeCardAudience;
  visibilityScope: DashboardCardVisibilityScope;
  title: string;
  excerpt: string;
  moodLabel?: string;
  highlighted?: boolean;
}

export type DiaryHomeCard = DashboardCardPayload & {
  moduleKey: "diary";
  cardType: "post";
};

type DashboardFeedMeta = NonNullable<DashboardModuleFeed["meta"]>;

export type DiaryDashboardFeedMeta = DashboardFeedMeta &
  ModuleHomeCardFeedMeta & {
    highlightedCount: number;
  };

export interface DiaryDashboardFeed extends DashboardModuleFeed {
  moduleKey: "diary";
  cards: DiaryHomeCard[];
  meta: DiaryDashboardFeedMeta;
}

export interface BuildDiaryDashboardFeedInput extends ModuleHomeFeedItemsInput<DiaryEntryFixture> {
  entries?: readonly DiaryEntryFixture[];
}

export const diaryHomeCardRules: ModuleHomeCardRule[] = [
  {
    id: "diary-adapts-to-post-card",
    title: "diary는 별도 cardType 대신 post로 어댑트",
    description:
      "현재 대시보드 계약에는 diary 전용 cardType이 없으므로, diary는 moduleKey를 유지한 채 cardType post와 recent 섹션으로 최소 어댑터 처리합니다.",
  },
  {
    id: "diary-mood-badge",
    title: "무드나 기록 성격은 badge로 표현",
    description:
      "일기 카드의 차분한 성격은 mood badge와 짧은 summary로 드러내고, 일반 글보다 더 조용한 recent 흐름으로 유지합니다.",
  },
  {
    id: "diary-private-default",
    title: "개인 일기는 private/adults 범위를 유지",
    description:
      "diary는 기록 성격상 개인 글이 섞일 가능성이 높으므로 audience와 visibilityScope를 그대로 보존해 홈 노출 범위를 무리하게 넓히지 않습니다.",
  },
];

export const diaryEntryFixtures: DiaryEntryFixture[] = [
  {
    id: "today-mood",
    slug: "today-mood",
    audience: "family-shared",
    visibilityScope: "children-safe",
    title: "오늘의 가족 한 줄 기록",
    excerpt: "비 온 뒤에 산책한 이야기를 짧게 남겼고, 저녁 식탁 분위기도 함께 적어 두었습니다.",
    moodLabel: "한 줄",
    highlighted: true,
  },
  {
    id: "mom-reflection",
    slug: "mom-reflection",
    audience: "personal",
    visibilityScope: "private",
    title: "엄마의 밤 회고",
    excerpt: "아이들 잠든 뒤 정리한 감정 메모와 내일 준비할 일들을 적었습니다.",
    moodLabel: "회고",
  },
];

function getDiaryBadge(entry: DiaryEntryFixture) {
  return entry.moodLabel ?? (entry.highlighted ? "기록" : "일기");
}

function getDiaryPriority(entry: DiaryEntryFixture) {
  return entry.highlighted ? 44 : 37;
}

function getDiaryUpdatedAt(entry: DiaryEntryFixture, generatedAt: string): string {
  const candidate = entry as DiaryEntryFixture & { updatedAt?: string };
  return typeof candidate.updatedAt === "string" ? candidate.updatedAt : generatedAt;
}

function compareDiary(left: DiaryHomeCard, right: DiaryHomeCard): number {
  if (right.priority !== left.priority) {
    return right.priority - left.priority;
  }

  return right.updatedAt.localeCompare(left.updatedAt);
}

export function buildDiaryDashboardFeed(input: BuildDiaryDashboardFeedInput): DiaryDashboardFeed {
  const source = input.items ?? input.entries ?? diaryEntryFixtures;
  const generatedAt = resolveModuleFeedGeneratedAt(input);
  const cards = source
    .map<DiaryHomeCard>((entry) => ({
      id: `diary-${entry.id}`,
      tenantId: input.tenantId,
      moduleKey: "diary",
      cardType: "post",
      title: entry.title,
      summary: entry.excerpt,
      priority: getDiaryPriority(entry),
      featured: Boolean(entry.highlighted),
      pinned: false,
      visibilityScope: entry.visibilityScope,
      href: `/app/${input.familySlug}/diary/${entry.slug}`,
      sectionHint: "recent",
      badge: getDiaryBadge(entry),
      updatedAt: getDiaryUpdatedAt(entry, generatedAt),
    }))
    .sort(compareDiary);
  const audienceSummary = summarizeHomeCardAudience(source);

  return {
    moduleKey: "diary",
    generatedAt,
    cards,
    meta: {
      visibleCount: cards.length,
      featuredCount: cards.filter((card) => card.featured).length,
      note: "Diary is adapted into post/recent cards so runtime composition can reuse the existing recent contract.",
      ...audienceSummary,
      highlightedCount: source.filter((entry) => entry.highlighted).length,
    },
  };
}

export const diaryHomeFeedFixture = buildDiaryDashboardFeed({
  familySlug: "yoon",
  tenantId: "family-yoon",
  entries: diaryEntryFixtures,
  generatedAt: "2026-03-19T07:30:00+09:00",
});
