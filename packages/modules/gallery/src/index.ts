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

export const galleryModule: ModuleDescriptor = {
  key: "gallery",
  kind: "media",
  label: "Gallery",
  description: "Shared albums and memory-keeping surfaces.",
};

export interface GalleryFixture {
  id: string;
  slug: string;
  audience: HomeCardAudience;
  visibilityScope: DashboardCardVisibilityScope;
  title: string;
  caption: string;
  photoCount: number;
  noteCount?: number;
  featured?: boolean;
  imageUrl?: string;
}

export type GalleryHomeCard = DashboardCardPayload & {
  moduleKey: "gallery";
  cardType: "gallery";
};

type DashboardFeedMeta = NonNullable<DashboardModuleFeed["meta"]>;

export type GalleryDashboardFeedMeta = DashboardFeedMeta &
  ModuleHomeCardFeedMeta & {
    albumCount: number;
    photoCount: number;
  };

export interface GalleryDashboardFeed extends DashboardModuleFeed {
  moduleKey: "gallery";
  cards: GalleryHomeCard[];
  meta: GalleryDashboardFeedMeta;
}

export interface BuildGalleryDashboardFeedInput extends ModuleHomeFeedItemsInput<GalleryFixture> {
  galleries?: readonly GalleryFixture[];
}

export const galleryHomeCardRules: ModuleHomeCardRule[] = [
  {
    id: "gallery-recent-memory-flow",
    title: "갤러리는 recent 기억 흐름 유지",
    description:
      "사진 카드는 recent 섹션에만 남겨 글 카드와 함께 기억형 흐름을 만들고, 긴급 전달 영역과 섞이지 않게 유지합니다.",
  },
  {
    id: "gallery-photo-count-badge",
    title: "배지는 사진 수 중심",
    description:
      "갤러리 카드는 몇 장의 장면이 묶였는지가 가장 빨리 읽히도록 badge를 사진 수로 고정합니다.",
  },
  {
    id: "gallery-caption-summary",
    title: "summary는 캡션과 메모 개수 결합",
    description:
      "짧은 캡션과 메모 개수를 summary에 함께 넣어 기록형 홈에서도 사진 카드가 단순 썸네일로 보이지 않게 합니다.",
  },
];

export const galleryFixtures: GalleryFixture[] = [
  {
    id: "hangang-spring-walk",
    slug: "hangang-spring-walk",
    audience: "family-shared",
    visibilityScope: "all",
    title: "한강 봄 산책 14장",
    caption: "벚꽃길, 돗자리, 저녁놀 사진을 한 앨범에 모았습니다.",
    photoCount: 14,
    noteCount: 3,
    imageUrl: "memory-hangang-spring",
  },
  {
    id: "after-school-baking",
    slug: "after-school-baking",
    audience: "family-shared",
    visibilityScope: "children-safe",
    title: "방과 후 쿠키 굽기 8장",
    caption: "밀가루 묻은 손과 완성된 쿠키 사진을 순서대로 남겼습니다.",
    photoCount: 8,
    noteCount: 2,
    featured: true,
    imageUrl: "memory-cookie-baking",
  },
];

export const galleryHomeFixtures = galleryFixtures;

function buildGallerySummary(gallery: GalleryFixture): string {
  if (!gallery.noteCount) {
    return `${gallery.caption} 사진 ${gallery.photoCount}장을 최근 기록으로 이어 봅니다.`;
  }

  return `${gallery.caption} 사진 ${gallery.photoCount}장과 캡션 ${gallery.noteCount}개를 함께 남겼습니다.`;
}

function getGalleryPriority(gallery: GalleryFixture): number {
  return gallery.featured ? 42 : 39;
}

function getGalleryUpdatedAt(gallery: GalleryFixture, generatedAt: string): string {
  const candidate = gallery as GalleryFixture & { updatedAt?: string };
  return typeof candidate.updatedAt === "string" ? candidate.updatedAt : generatedAt;
}

function compareGallery(left: GalleryHomeCard, right: GalleryHomeCard): number {
  if (right.priority !== left.priority) {
    return right.priority - left.priority;
  }

  return right.updatedAt.localeCompare(left.updatedAt);
}

export function buildGalleryDashboardFeed(
  input: BuildGalleryDashboardFeedInput,
): GalleryDashboardFeed {
  const source = input.items ?? input.galleries ?? galleryFixtures;
  const generatedAt = resolveModuleFeedGeneratedAt(input);
  const cards = source
    .map<GalleryHomeCard>((gallery) => ({
      id: `gallery-${gallery.id}`,
      tenantId: input.tenantId,
      moduleKey: "gallery",
      cardType: "gallery",
      title: gallery.title,
      summary: buildGallerySummary(gallery),
      priority: getGalleryPriority(gallery),
      featured: Boolean(gallery.featured),
      pinned: false,
      visibilityScope: gallery.visibilityScope,
      href: `/app/${input.familySlug}/gallery/${gallery.slug}`,
      sectionHint: "recent",
      badge: `${gallery.photoCount}장`,
      updatedAt: getGalleryUpdatedAt(gallery, generatedAt),
      ...(gallery.imageUrl ? { imageUrl: gallery.imageUrl } : {}),
    }))
    .sort(compareGallery);
  const audienceSummary = summarizeHomeCardAudience(source);

  return {
    moduleKey: "gallery",
    generatedAt,
    cards,
    meta: {
      visibleCount: cards.length,
      featuredCount: cards.filter((card) => card.featured).length,
      note: "Gallery cards are ready for direct recent-section composition with caption-aware summaries.",
      ...audienceSummary,
      albumCount: cards.length,
      photoCount: source.reduce((sum, gallery) => sum + gallery.photoCount, 0),
    },
  };
}

export const galleryHomeFeedFixture = buildGalleryDashboardFeed({
  familySlug: "yoon",
  tenantId: "family-yoon",
  galleries: galleryFixtures,
  generatedAt: "2026-03-19T07:30:00+09:00",
});
