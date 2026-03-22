import type { DashboardCardVisibilityScope, HomeCardAudience } from "@ysplan/modules-core";

const NUMBER_FORMATTER = new Intl.NumberFormat("ko-KR");

export function toDateTimeLocalInputValue(value?: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function formatTrackerDateTime(value: string | undefined, timeZone: string): string {
  if (!value) {
    return "미정";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "미정";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(date);
}

export function formatAudienceLabel(value: HomeCardAudience): string {
  return value === "personal" ? "개인" : "가족 공용";
}

export function formatVisibilityLabel(value: DashboardCardVisibilityScope): string {
  switch (value) {
    case "adults":
      return "성인만";
    case "children-safe":
      return "아이도 보기";
    case "admins":
      return "관리자만";
    case "private":
      return "비공개";
    default:
      return "전체";
  }
}

export function formatPercent(value: number): string {
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

export function formatCount(value: number, unit = ""): string {
  return `${NUMBER_FORMATTER.format(Math.round(value))}${unit}`;
}

export function parseDateTimeField(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}
