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

export const announcementsModule: ModuleDescriptor = {
  key: "announcements",
  kind: "content",
  label: "Announcements",
  description: "Pinned notices and time-bound family updates.",
};

export type AnnouncementSeverity = "urgent" | "important" | "general";

export interface AnnouncementFixture {
  id: string;
  slug: string;
  audience: HomeCardAudience;
  visibilityScope: DashboardCardVisibilityScope;
  title: string;
  excerpt: string;
  body: string;
  severity: AnnouncementSeverity;
  pinned?: boolean;
  requiresReadAck?: boolean;
  readAckTarget?: number;
  readAckConfirmed?: number;
  displayStartsAt?: string;
  displayEndsAt?: string;
}

export type AnnouncementHomeCard = DashboardCardPayload & {
  moduleKey: "announcements";
  cardType: "announcement";
};

type DashboardFeedMeta = NonNullable<DashboardModuleFeed["meta"]>;

export type AnnouncementsDashboardFeedMeta = DashboardFeedMeta &
  ModuleHomeCardFeedMeta & {
    urgentCount: number;
    requiresReadAckCount: number;
    pinnedCount: number;
  };

export interface AnnouncementsDashboardFeed extends DashboardModuleFeed {
  moduleKey: "announcements";
  cards: AnnouncementHomeCard[];
  meta: AnnouncementsDashboardFeedMeta;
}

export interface BuildAnnouncementsDashboardFeedInput
  extends ModuleHomeFeedItemsInput<AnnouncementFixture> {
  announcements?: readonly AnnouncementFixture[];
}

export const announcementsHomeCardRules: ModuleHomeCardRule[] = [
  {
    id: "announcements-urgent-first",
    title: "긴급 공지는 hero 우선",
    description:
      "가족이 바로 행동해야 하는 긴급 전달은 hero 후보가 되도록 높은 priority와 긴급 배지를 함께 올립니다.",
  },
  {
    id: "announcements-read-ack-in-summary",
    title: "읽음 확인 상태는 summary에 직접 포함",
    description:
      "공지 모듈의 차이가 홈 카드에서 보이도록 읽음 확인이 필요한 전달은 남은 확인 인원을 summary에 바로 적습니다.",
  },
  {
    id: "announcements-pinned-surface",
    title: "장기 고정 공지는 pinned 흐름 유지",
    description:
      "행사 준비나 장기 안내처럼 계속 보여야 하는 공지는 pinned 카드로 만들어 recent 계열과 분리합니다.",
  },
];

export const announcementFixtures: AnnouncementFixture[] = [
  {
    id: "saturday-visit",
    slug: "saturday-visit",
    audience: "family-shared",
    visibilityScope: "all",
    title: "토요일 외할머니 댁 방문 시간 확인",
    excerpt: "토요일 오후 2시에 출발합니다. 금요일 저녁까지 준비물을 확인해 주세요.",
    body: "토요일 오후 2시에 출발합니다. 금요일 저녁까지 준비물을 확인해 주세요.",
    severity: "important",
    requiresReadAck: true,
    readAckTarget: 4,
    readAckConfirmed: 2,
    displayStartsAt: "2026-03-17T08:00:00+09:00",
    displayEndsAt: "2026-03-20T23:59:00+09:00",
  },
  {
    id: "lunchbag-swap",
    slug: "lunchbag-swap",
    audience: "family-shared",
    visibilityScope: "all",
    title: "내일 도시락 가방 교체 알림",
    excerpt: "지퍼가 고장 나서 내일 아침 전까지 예비 가방으로 바꿔 주세요.",
    body: "지퍼가 고장 나서 내일 아침 전까지 예비 가방으로 바꿔 주세요.",
    severity: "urgent",
    displayStartsAt: "2026-03-18T18:00:00+09:00",
    displayEndsAt: "2026-03-19T09:00:00+09:00",
  },
  {
    id: "spring-cleanup",
    slug: "spring-cleanup",
    audience: "family-shared",
    visibilityScope: "all",
    title: "주말 봄맞이 정리 순서",
    excerpt: "토요일 오전에는 창고, 오후에는 책장 정리를 나눠 진행합니다.",
    body: "토요일 오전에는 창고, 오후에는 책장 정리를 나눠 진행합니다.",
    severity: "general",
    pinned: true,
  },
];

export const announcementHomeFixtures = announcementFixtures;

function getAnnouncementBadge(announcement: AnnouncementFixture): string | null {
  if (announcement.severity === "urgent") {
    return "긴급";
  }

  if (announcement.severity === "important") {
    return "중요";
  }

  if (announcement.requiresReadAck) {
    return "확인 필요";
  }

  return null;
}

function getAnnouncementPriority(announcement: AnnouncementFixture): number {
  const basePriority =
    announcement.severity === "urgent"
      ? 96
      : announcement.severity === "important"
        ? 88
        : 72;

  if (announcement.pinned) {
    return Math.max(basePriority, 94);
  }

  return basePriority;
}

function getAnnouncementSectionHint(announcement: AnnouncementFixture) {
  if (announcement.pinned) {
    return "pinned" as const;
  }

  if (announcement.severity === "urgent") {
    return "hero" as const;
  }

  if (announcement.severity === "important") {
    return "focus" as const;
  }

  return "today" as const;
}

function buildAnnouncementSummary(announcement: AnnouncementFixture): string {
  if (!announcement.requiresReadAck) {
    return announcement.excerpt;
  }

  const confirmed = announcement.readAckConfirmed ?? 0;
  const target = announcement.readAckTarget ?? confirmed;
  const remaining = Math.max(target - confirmed, 0);

  if (remaining === 0) {
    return `${announcement.excerpt} 읽음 확인이 모두 완료되었습니다.`;
  }

  return `${announcement.excerpt} 읽음 확인 ${remaining}명 남았습니다.`;
}

function getAnnouncementUpdatedAt(
  announcement: AnnouncementFixture,
  generatedAt: string,
): string {
  const candidate = announcement as AnnouncementFixture & { updatedAt?: string };
  return typeof candidate.updatedAt === "string" ? candidate.updatedAt : generatedAt;
}

function compareAnnouncements(left: AnnouncementHomeCard, right: AnnouncementHomeCard): number {
  if (right.priority !== left.priority) {
    return right.priority - left.priority;
  }

  return right.updatedAt.localeCompare(left.updatedAt);
}

export function buildAnnouncementsDashboardFeed(
  input: BuildAnnouncementsDashboardFeedInput,
): AnnouncementsDashboardFeed {
  const source = input.items ?? input.announcements ?? announcementFixtures;
  const generatedAt = resolveModuleFeedGeneratedAt(input);
  const cards = source
    .map<AnnouncementHomeCard>((announcement) => {
      const badge = getAnnouncementBadge(announcement);

      return {
        id: `announcement-${announcement.id}`,
        tenantId: input.tenantId,
        moduleKey: "announcements",
        cardType: "announcement",
        title: announcement.title,
        summary: buildAnnouncementSummary(announcement),
        priority: getAnnouncementPriority(announcement),
        featured: announcement.severity !== "general" || Boolean(announcement.pinned),
        pinned: Boolean(announcement.pinned),
        visibilityScope: announcement.visibilityScope,
        href: `/app/${input.familySlug}/announcements/${announcement.slug}`,
        sectionHint: getAnnouncementSectionHint(announcement),
        ...(announcement.displayStartsAt
          ? { displayStartsAt: announcement.displayStartsAt }
          : {}),
        ...(announcement.displayEndsAt
          ? { displayEndsAt: announcement.displayEndsAt }
          : {}),
        ...(badge ? { badge } : {}),
        updatedAt: getAnnouncementUpdatedAt(announcement, generatedAt),
      } satisfies AnnouncementHomeCard;
    })
    .sort(compareAnnouncements);
  const audienceSummary = summarizeHomeCardAudience(source);

  return {
    moduleKey: "announcements",
    generatedAt,
    cards,
    meta: {
      visibleCount: cards.length,
      featuredCount: cards.filter((card) => card.featured).length,
      note: "Urgent notices and read-ack summaries are ready for direct dashboard composition.",
      ...audienceSummary,
      urgentCount: source.filter((announcement) => announcement.severity === "urgent").length,
      requiresReadAckCount: source.filter((announcement) => announcement.requiresReadAck).length,
      pinnedCount: source.filter((announcement) => announcement.pinned).length,
    },
  };
}

export const announcementsHomeFeedFixture = buildAnnouncementsDashboardFeed({
  familySlug: "yoon",
  tenantId: "family-yoon",
  announcements: announcementFixtures,
  generatedAt: "2026-03-19T07:30:00+09:00",
});
