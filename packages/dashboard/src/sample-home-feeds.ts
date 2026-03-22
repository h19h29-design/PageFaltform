import type { ModuleKey } from "@ysplan/modules-core";

import type { DashboardCardPayload, DashboardModuleFeed } from "./contracts";
import { DASHBOARD_FALLBACK_MODULE_ORDER } from "./contracts";
import { toDateOrNull } from "./home-model";

export interface SampleDashboardFeedInput {
  familySlug?: string;
  tenantId?: string;
  now?: string | Date;
}

function createDateAt(base: Date, dayOffset: number, hour: number, minute = 0) {
  const nextDate = new Date(base);
  nextDate.setDate(nextDate.getDate() + dayOffset);
  nextDate.setHours(hour, minute, 0, 0);
  return nextDate.toISOString();
}

function createDateByMinutes(base: Date, minuteOffset: number) {
  const nextDate = new Date(base);
  nextDate.setMinutes(nextDate.getMinutes() + minuteOffset);
  nextDate.setSeconds(0, 0);
  return nextDate.toISOString();
}

function createFeed(moduleKey: ModuleKey, cards: DashboardCardPayload[], generatedAt: string): DashboardModuleFeed {
  return {
    moduleKey,
    generatedAt,
    cards,
    meta: {
      visibleCount: cards.length,
      featuredCount: cards.filter((card) => card.featured).length,
    },
  };
}

export function createSampleDashboardFeeds(
  input: SampleDashboardFeedInput = {},
): DashboardModuleFeed[] {
  const familySlug = input.familySlug ?? "yoon-family";
  const tenantId = input.tenantId ?? "family_yoon";
  const now = toDateOrNull(input.now) ?? new Date();
  const generatedAt = now.toISOString();
  const feedsByModule = new Map<ModuleKey, DashboardModuleFeed>([
    [
      "announcements",
      createFeed(
        "announcements",
        [
          {
            id: "announcement-weekend-plan",
            tenantId,
            moduleKey: "announcements",
            cardType: "announcement",
            title: "이번 주말 가족 모임 시간 확인",
            summary: "토요일 오후 2시에 출발합니다. 모두가 읽고 확인해야 하는 중요 공지입니다.",
            priority: 95,
            featured: true,
            pinned: false,
            displayStartsAt: createDateAt(now, -1, 8, 0),
            displayEndsAt: createDateAt(now, 2, 23, 59),
            visibilityScope: "all",
            href: `/app/${familySlug}/announcements/weekend-plan`,
            sectionHint: "hero",
            badge: "중요",
            updatedAt: createDateAt(now, 0, 8, 30),
          },
          {
            id: "announcement-parents-day",
            tenantId,
            moduleKey: "announcements",
            cardType: "announcement",
            title: "어버이날 가족 식사 준비 D-3",
            summary: "메뉴와 선물 준비를 이번 주 안에 마무리하기 위한 장기 상단 고정 카드입니다.",
            priority: 82,
            featured: false,
            pinned: true,
            displayStartsAt: createDateAt(now, -3, 9, 0),
            displayEndsAt: createDateAt(now, 5, 23, 59),
            visibilityScope: "all",
            href: `/app/${familySlug}/announcements/parents-day`,
            sectionHint: "pinned",
            badge: "D-3",
            updatedAt: createDateAt(now, -1, 19, 20),
          },
        ],
        generatedAt,
      ),
    ],
    [
      "calendar",
      createFeed(
        "calendar",
        [
          {
            id: "schedule-library-class",
            tenantId,
            moduleKey: "calendar",
            cardType: "schedule",
            title: "도서관 독서 수업",
            summary: "오늘 진행되는 가족 일정입니다. 출발 전 준비물을 한 번 더 체크해야 합니다.",
            priority: 92,
            featured: true,
            pinned: false,
            visibilityScope: "all",
            href: `/app/${familySlug}/calendar/library-class`,
            sectionHint: "today",
            badge: "곧 시작",
            startsAt: createDateByMinutes(now, 90),
            updatedAt: createDateAt(now, 0, 8, 10),
          },
        ],
        generatedAt,
      ),
    ],
    [
      "school-timetable",
      createFeed(
        "school-timetable",
        [
          {
            id: "schedule-school-first-class",
            tenantId,
            moduleKey: "school-timetable",
            cardType: "schedule",
            title: "내일 1교시 준비 체크",
            summary: "체육복과 준비물을 오늘 밤 안에 챙겨 두면 아침 루틴이 부드럽게 이어집니다.",
            priority: 74,
            featured: false,
            pinned: false,
            visibilityScope: "all",
            href: `/app/${familySlug}/school-timetable/first-class`,
            sectionHint: "focus",
            badge: "내일",
            startsAt: createDateAt(now, 1, 8, 10),
            updatedAt: createDateAt(now, 0, 7, 10),
          },
        ],
        generatedAt,
      ),
    ],
    [
      "day-planner",
      createFeed(
        "day-planner",
        [
          {
            id: "schedule-afternoon-block",
            tenantId,
            moduleKey: "day-planner",
            cardType: "schedule",
            title: "오후 가족 루틴 블록",
            summary: "하교 이후 간식, 숙제, 산책 순서가 한 카드 안에서 이어지도록 묶었습니다.",
            priority: 79,
            featured: false,
            pinned: false,
            visibilityScope: "all",
            href: `/app/${familySlug}/day-planner/afternoon-block`,
            sectionHint: "today",
            badge: "오후",
            startsAt: createDateAt(now, 0, 15, 0),
            updatedAt: createDateAt(now, 0, 7, 40),
          },
        ],
        generatedAt,
      ),
    ],
    [
      "todo",
      createFeed(
        "todo",
        [
          {
            id: "todo-dinner-checklist",
            tenantId,
            moduleKey: "todo",
            cardType: "todo",
            title: "오늘 저녁 장보기 체크",
            summary: "우유, 과일, 도시락 재료를 오늘 안에 확인해야 하는 대표 묶음 카드입니다.",
            priority: 90,
            featured: true,
            pinned: false,
            visibilityScope: "all",
            href: `/app/${familySlug}/todo/dinner-checklist`,
            sectionHint: "today",
            badge: "오늘",
            dueAt: createDateAt(now, 0, 19, 30),
            updatedAt: createDateAt(now, 0, 7, 55),
          },
          {
            id: "todo-reimbursement",
            tenantId,
            moduleKey: "todo",
            cardType: "todo",
            title: "학원비 정산 미완료",
            summary: "어제까지 처리해야 했던 항목이라 오늘의 집중 영역으로 올리는 성인 전용 카드입니다.",
            priority: 88,
            featured: false,
            pinned: false,
            visibilityScope: "adults",
            href: `/app/${familySlug}/todo/reimbursement`,
            sectionHint: "focus",
            badge: "지연",
            dueAt: createDateAt(now, -1, 21, 0),
            updatedAt: createDateAt(now, 0, 6, 50),
          },
        ],
        generatedAt,
      ),
    ],
    [
      "progress",
      createFeed(
        "progress",
        [
          {
            id: "progress-spring-trip",
            tenantId,
            moduleKey: "progress",
            cardType: "progress",
            title: "봄 여행 적금 진행률",
            summary: "이번 달 목표의 72%를 채웠고, 남은 금액은 280,000원입니다.",
            priority: 80,
            featured: false,
            pinned: false,
            visibilityScope: "all",
            href: `/app/${familySlug}/progress/spring-trip`,
            sectionHint: "progress",
            badge: "가족 72%",
            metricValue: 72,
            metricTarget: 100,
            metricUnit: "%",
            updatedAt: createDateAt(now, 0, 7, 20),
          },
        ],
        generatedAt,
      ),
    ],
    [
      "habits",
      createFeed(
        "habits",
        [
          {
            id: "habit-evening-walk",
            tenantId,
            moduleKey: "habits",
            cardType: "habit",
            title: "저녁 산책 루틴",
            summary: "12일 연속으로 이어졌고, 오늘도 20분만 걸으면 기록이 계속됩니다.",
            priority: 76,
            featured: false,
            pinned: false,
            visibilityScope: "all",
            href: `/app/${familySlug}/habits/evening-walk`,
            sectionHint: "progress",
            badge: "12일 연속",
            metricValue: 12,
            metricUnit: "일",
            updatedAt: createDateAt(now, 0, 7, 5),
          },
        ],
        generatedAt,
      ),
    ],
    [
      "posts",
      createFeed(
        "posts",
        [
          {
            id: "post-spring-note",
            tenantId,
            moduleKey: "posts",
            cardType: "post",
            title: "윤아의 봄 그림 업로드",
            summary: "오늘 아침에 그린 그림을 글과 함께 올렸고, 가족 댓글을 기다리고 있습니다.",
            priority: 60,
            featured: false,
            pinned: false,
            visibilityScope: "all",
            href: `/app/${familySlug}/posts/spring-note`,
            sectionHint: "recent",
            updatedAt: createDateAt(now, 0, 8, 40),
          },
        ],
        generatedAt,
      ),
    ],
    [
      "diary",
      createFeed(
        "diary",
        [
          {
            id: "diary-today-mood",
            tenantId,
            moduleKey: "diary",
            cardType: "post",
            title: "오늘의 가족 한 줄 기록",
            summary: "하루 분위기와 감사 메모를 짧게 남겨 홈 하단의 이야기 흐름을 이어 줍니다.",
            priority: 57,
            featured: false,
            pinned: false,
            visibilityScope: "all",
            href: `/app/${familySlug}/diary/today-mood`,
            sectionHint: "recent",
            updatedAt: createDateAt(now, 0, 8, 5),
          },
        ],
        generatedAt,
      ),
    ],
    [
      "gallery",
      createFeed(
        "gallery",
        [
          {
            id: "gallery-weekend-album",
            tenantId,
            moduleKey: "gallery",
            cardType: "gallery",
            title: "주말 한강 사진 14장",
            summary: "햇살이 좋았던 지난 주말 사진을 대표 앨범으로 정리했습니다.",
            priority: 58,
            featured: false,
            pinned: false,
            visibilityScope: "all",
            href: `/app/${familySlug}/gallery/weekend-album`,
            sectionHint: "recent",
            imageUrl: "soft-gradient",
            updatedAt: createDateAt(now, 0, 8, 15),
          },
        ],
        generatedAt,
      ),
    ],
  ]);

  return DASHBOARD_FALLBACK_MODULE_ORDER.map((moduleKey) => feedsByModule.get(moduleKey)).filter(
    (feed): feed is DashboardModuleFeed => Boolean(feed),
  );
}
