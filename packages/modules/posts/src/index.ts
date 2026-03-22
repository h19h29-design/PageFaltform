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

export const postsModule: ModuleDescriptor = {
  key: "posts",
  kind: "content",
  label: "Posts",
  description: "Long-form family updates, guides, and notes.",
};

export type PostCategory = "update" | "guide" | "note";

export interface PostFixture {
  id: string;
  slug: string;
  audience: HomeCardAudience;
  visibilityScope: DashboardCardVisibilityScope;
  title: string;
  excerpt: string;
  body: string;
  category: PostCategory;
  featured?: boolean;
  imageUrl?: string;
}

export type PostHomeCard = DashboardCardPayload & {
  moduleKey: "posts";
  cardType: "post";
};

type DashboardFeedMeta = NonNullable<DashboardModuleFeed["meta"]>;

export type PostsDashboardFeedMeta = DashboardFeedMeta &
  ModuleHomeCardFeedMeta & {
    guideCount: number;
    updateCount: number;
  };

export interface PostsDashboardFeed extends DashboardModuleFeed {
  moduleKey: "posts";
  cards: PostHomeCard[];
  meta: PostsDashboardFeedMeta;
}

export interface BuildPostsDashboardFeedInput extends ModuleHomeFeedItemsInput<PostFixture> {
  posts?: readonly PostFixture[];
}

export const postsHomeCardRules: ModuleHomeCardRule[] = [
  {
    id: "posts-recent-only",
    title: "일반 글은 recent 흐름 고정",
    description:
      "공지처럼 즉시 행동을 요구하지 않는 장문 글은 recent 전용 카드로만 노출해 홈의 역할 차이를 유지합니다.",
  },
  {
    id: "posts-category-badge",
    title: "업데이트·가이드·기록 배지 구분",
    description:
      "일반 글 내부의 성격 차이는 badge로만 드러내고, 공지처럼 긴급도를 올리지 않아 정보 우선순위를 흔들지 않습니다.",
  },
  {
    id: "posts-editor-feature-stays-recent",
    title: "featured 글도 recent 안에서만 상승",
    description:
      "편집상 강조한 글이 있더라도 recent 영역 안에서만 앞으로 오게 해서 공지/일정 영역을 침범하지 않게 합니다.",
  },
];

export const postFixtures: PostFixture[] = [
  {
    id: "weekly-ops-note",
    slug: "weekly-ops-note",
    audience: "family-shared",
    visibilityScope: "all",
    title: "이번 주 운영 메모",
    excerpt: "학교, 병원, 외출 시간을 한 글에서 다시 확인할 수 있게 정리했습니다.",
    body: "학교, 병원, 외출 시간을 한 글에서 다시 확인할 수 있게 정리했습니다.",
    category: "update",
  },
  {
    id: "spring-outing-guide",
    slug: "spring-outing-guide",
    audience: "family-shared",
    visibilityScope: "all",
    title: "봄나들이 준비 가이드",
    excerpt: "돗자리, 물티슈, 여벌옷처럼 반복 준비물을 한 번에 묶어 두었습니다.",
    body: "돗자리, 물티슈, 여벌옷처럼 반복 준비물을 한 번에 묶어 두었습니다.",
    category: "guide",
    featured: true,
  },
  {
    id: "drawing-note",
    slug: "drawing-note",
    audience: "family-shared",
    visibilityScope: "children-safe",
    title: "민아가 그린 봄 그림 메모",
    excerpt: "오늘 아침에 그린 그림과 짧은 코멘트를 함께 남겼습니다.",
    body: "오늘 아침에 그린 그림과 짧은 코멘트를 함께 남겼습니다.",
    category: "note",
  },
];

export const postHomeFixtures = postFixtures;

function getPostBadge(category: PostCategory) {
  switch (category) {
    case "guide":
      return "가이드" as const;
    case "note":
      return "기록" as const;
    default:
      return "업데이트" as const;
  }
}

function getPostPriority(post: PostFixture): number {
  const basePriority =
    post.category === "update" ? 46 : post.category === "guide" ? 43 : 40;

  return post.featured ? basePriority + 2 : basePriority;
}

function getPostUpdatedAt(post: PostFixture, generatedAt: string): string {
  const candidate = post as PostFixture & { updatedAt?: string };
  return typeof candidate.updatedAt === "string" ? candidate.updatedAt : generatedAt;
}

function comparePosts(left: PostHomeCard, right: PostHomeCard): number {
  if (right.priority !== left.priority) {
    return right.priority - left.priority;
  }

  return right.updatedAt.localeCompare(left.updatedAt);
}

export function buildPostsDashboardFeed(input: BuildPostsDashboardFeedInput): PostsDashboardFeed {
  const source = input.items ?? input.posts ?? postFixtures;
  const generatedAt = resolveModuleFeedGeneratedAt(input);
  const cards = source
    .map<PostHomeCard>((post) => ({
      id: `post-${post.id}`,
      tenantId: input.tenantId,
      moduleKey: "posts",
      cardType: "post",
      title: post.title,
      summary: post.excerpt,
      priority: getPostPriority(post),
      featured: Boolean(post.featured),
      pinned: false,
      visibilityScope: post.visibilityScope,
      href: `/app/${input.familySlug}/posts/${post.slug}`,
      sectionHint: "recent",
      badge: getPostBadge(post.category),
      updatedAt: getPostUpdatedAt(post, generatedAt),
      ...(post.imageUrl ? { imageUrl: post.imageUrl } : {}),
    }))
    .sort(comparePosts);
  const audienceSummary = summarizeHomeCardAudience(source);

  return {
    moduleKey: "posts",
    generatedAt,
    cards,
    meta: {
      visibleCount: cards.length,
      featuredCount: cards.filter((card) => card.featured).length,
      note: "Posts are normalized into recent/post cards for direct runtime composition.",
      ...audienceSummary,
      guideCount: source.filter((post) => post.category === "guide").length,
      updateCount: source.filter((post) => post.category === "update").length,
    },
  };
}

export const postsHomeFeedFixture = buildPostsDashboardFeed({
  familySlug: "yoon",
  tenantId: "family-yoon",
  posts: postFixtures,
  generatedAt: "2026-03-19T07:30:00+09:00",
});
