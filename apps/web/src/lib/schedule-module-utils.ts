import type { DashboardVisibilityScope } from "@ysplan/dashboard";
import type { HomeCardAudience } from "@ysplan/modules-core";

export const audienceOptions: Array<{
  value: HomeCardAudience;
  label: string;
  description: string;
}> = [
  {
    value: "family-shared",
    label: "가족 공용",
    description: "홈 today 카드와 가족 공용 목록 후보에 먼저 들어갑니다.",
  },
  {
    value: "personal",
    label: "개인",
    description: "가족 흐름에 영향을 줄 때만 focus 보조 카드 후보가 됩니다.",
  },
];

export const visibilityScopeOptions: Array<{
  value: DashboardVisibilityScope;
  label: string;
}> = [
  { value: "all", label: "전체" },
  { value: "adults", label: "성인만" },
  { value: "children-safe", label: "아이도 보기" },
  { value: "admins", label: "관리자만" },
  { value: "private", label: "비공개" },
];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function parseOffsetMinutes(offsetLabel: string): number {
  const match = offsetLabel.match(/^GMT([+-])(\d{1,2})(?::?(\d{2}))?$/);

  if (!match) {
    return 0;
  }

  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2] ?? "0");
  const minutes = Number(match[3] ?? "0");

  return sign * (hours * 60 + minutes);
}

function getTimeZoneOffsetMinutes(date: Date, timezone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
  });
  const offsetLabel =
    formatter.formatToParts(date).find((part) => part.type === "timeZoneName")?.value ?? "GMT+0";

  return parseOffsetMinutes(offsetLabel);
}

function formatToParts(
  value: string | Date,
  timezone: string,
): Record<"year" | "month" | "day" | "hour" | "minute", string> {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = formatter.formatToParts(date);

  return {
    year: parts.find((part) => part.type === "year")?.value ?? "0000",
    month: parts.find((part) => part.type === "month")?.value ?? "00",
    day: parts.find((part) => part.type === "day")?.value ?? "00",
    hour: parts.find((part) => part.type === "hour")?.value ?? "00",
    minute: parts.find((part) => part.type === "minute")?.value ?? "00",
  };
}

export function readTextField(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

export function readOptionalTextField(formData: FormData, name: string): string | undefined {
  const value = readTextField(formData, name);
  return value.length > 0 ? value : undefined;
}

export function readCheckboxField(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}

export function buildModuleItemSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatAudienceLabel(audience: HomeCardAudience): string {
  return audience === "family-shared" ? "가족 공용" : "개인";
}

export function formatVisibilityScopeLabel(scope: DashboardVisibilityScope): string {
  return visibilityScopeOptions.find((option) => option.value === scope)?.label ?? scope;
}

export function formatDateTimeInputValue(value: string, timezone: string): string {
  const parts = formatToParts(value, timezone);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function parseDateTimeInputValue(value: string, timezone: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);

  if (!match) {
    throw new Error("날짜와 시간을 다시 확인해 주세요.");
  }

  const [, year, month, day, hour, minute] = match;
  const guessUtc = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );
  let offsetMinutes = getTimeZoneOffsetMinutes(new Date(guessUtc), timezone);
  let resolvedDate = new Date(guessUtc - offsetMinutes * 60_000);
  const adjustedOffsetMinutes = getTimeZoneOffsetMinutes(resolvedDate, timezone);

  if (adjustedOffsetMinutes !== offsetMinutes) {
    offsetMinutes = adjustedOffsetMinutes;
    resolvedDate = new Date(guessUtc - offsetMinutes * 60_000);
  }

  return resolvedDate.toISOString();
}

export function formatFamilyDateTime(value: string, timezone: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: timezone,
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function formatFamilyDateTimeRange(
  startsAt: string,
  endsAt: string | undefined,
  timezone: string,
): string {
  if (!endsAt) {
    return formatFamilyDateTime(startsAt, timezone);
  }

  const startParts = formatToParts(startsAt, timezone);
  const endParts = formatToParts(endsAt, timezone);
  const sameDay =
    startParts.year === endParts.year &&
    startParts.month === endParts.month &&
    startParts.day === endParts.day;

  if (sameDay) {
    return `${startParts.year}-${startParts.month}-${startParts.day} ${startParts.hour}:${startParts.minute} - ${endParts.hour}:${endParts.minute}`;
  }

  return `${formatFamilyDateTime(startsAt, timezone)} - ${formatFamilyDateTime(endsAt, timezone)}`;
}

export function formatTodayKey(value: string | Date, timezone: string): string {
  const parts = formatToParts(value, timezone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function createFallbackDateTimeInputValue(daysFromNow = 0): string {
  const now = new Date();
  const next = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);

  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}T${pad(next.getHours())}:${pad(next.getMinutes())}`;
}
