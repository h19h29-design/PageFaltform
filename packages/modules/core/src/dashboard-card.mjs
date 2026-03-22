export const DASHBOARD_SECTION_ORDER = Object.freeze([
  "hero",
  "today",
  "focus",
  "progress",
  "recent",
  "pinned",
]);

export const DASHBOARD_CARD_TYPES = Object.freeze([
  "announcement",
  "schedule",
  "todo",
  "progress",
  "habit",
  "post",
  "gallery",
  "pinned",
]);

export const VIEWER_ROLES = Object.freeze([
  "owner",
  "admin",
  "member",
  "guest",
  "child",
]);

export const SECTION_SUPPORT = Object.freeze({
  hero: ["announcement", "pinned"],
  today: ["announcement", "schedule", "todo"],
  focus: ["announcement", "schedule", "todo"],
  progress: ["progress", "habit"],
  recent: ["post", "gallery"],
  pinned: ["announcement", "pinned"],
});

const DEFAULT_CARD = Object.freeze({
  summary: "",
  priority: 50,
  featured: false,
  pinned: false,
  visibilityScope: "all",
  sectionHint: null,
  badge: null,
  startsAt: null,
  dueAt: null,
  displayStartsAt: null,
  displayEndsAt: null,
  imageUrl: null,
  metricValue: null,
  metricTarget: null,
  metricUnit: null,
});

const DAY_KEY_FORMATTER_CACHE = new Map();

function getDayKeyFormatter(timeZone) {
  if (!DAY_KEY_FORMATTER_CACHE.has(timeZone)) {
    DAY_KEY_FORMATTER_CACHE.set(
      timeZone,
      new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    );
  }

  return DAY_KEY_FORMATTER_CACHE.get(timeZone);
}

export function toDateOrNull(value) {
  if (!value) {
    return null;
  }

  const nextValue = value instanceof Date ? value : new Date(value);
  return Number.isNaN(nextValue.getTime()) ? null : nextValue;
}

export function toDayKey(value, timeZone = "Asia/Seoul") {
  const date = toDateOrNull(value);

  if (!date) {
    return null;
  }

  return getDayKeyFormatter(timeZone).format(date);
}

export function isSameDayInTimeZone(value, now = new Date(), timeZone = "Asia/Seoul") {
  const candidateDay = toDayKey(value, timeZone);
  const nowDay = toDayKey(now, timeZone);

  return Boolean(candidateDay && nowDay && candidateDay === nowDay);
}

export function normalizeDashboardCard(card) {
  return {
    ...DEFAULT_CARD,
    ...card,
  };
}

export function isWithinDisplayWindow(card, now = new Date()) {
  const normalizedCard = normalizeDashboardCard(card);
  const start = toDateOrNull(normalizedCard.displayStartsAt);
  const end = toDateOrNull(normalizedCard.displayEndsAt);
  const currentTime = toDateOrNull(now) ?? new Date();

  if (start && currentTime < start) {
    return false;
  }

  if (end && currentTime > end) {
    return false;
  }

  return true;
}

export function canViewerSeeCard(card, context = {}) {
  const normalizedCard = normalizeDashboardCard(card);
  const role = context.viewerRole ?? "guest";
  const scope = normalizedCard.visibilityScope;

  if (scope === "all" || scope === "children-safe") {
    return true;
  }

  if (scope === "admins") {
    return role === "owner" || role === "admin";
  }

  if (scope === "adults") {
    return role !== "child";
  }

  if (scope === "private") {
    return role === "owner" || role === "admin" || role === "member";
  }

  return true;
}

export function isDashboardCardVisible(card, context = {}, now = new Date()) {
  return isWithinDisplayWindow(card, now) && canViewerSeeCard(card, context);
}

export function isSectionSupported(cardType, section) {
  const supportedTypes = SECTION_SUPPORT[section] ?? [];
  return supportedTypes.includes(cardType);
}

export function getCardMoment(card) {
  const normalizedCard = normalizeDashboardCard(card);
  return (
    toDateOrNull(normalizedCard.dueAt) ??
    toDateOrNull(normalizedCard.startsAt) ??
    toDateOrNull(normalizedCard.updatedAt)
  );
}
