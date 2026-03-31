import type {
  ClubAnnouncementSeverity,
  ClubContentVisibility,
  ClubEventRecord,
  ClubGalleryRecord,
} from "./club-content-store";

export function getClubSeverityLabel(severity: ClubAnnouncementSeverity): string {
  switch (severity) {
    case "urgent":
      return "긴급";
    case "important":
      return "중요";
    default:
      return "일반";
  }
}

export function getClubSeverityTone(
  severity: ClubAnnouncementSeverity,
): "neutral" | "warm" | "accent" {
  if (severity === "urgent") {
    return "accent";
  }

  if (severity === "important") {
    return "warm";
  }

  return "neutral";
}

export function getClubVisibilityCopy(visibility: ClubContentVisibility): string {
  return visibility === "public" ? "공개" : "멤버 전용";
}

export function formatClubUpdatedAt(updatedAt: string): string {
  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return updatedAt;
  }

  return date.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatClubEventWindow(record: Pick<ClubEventRecord, "startsAt" | "endsAt">): string {
  const start = new Date(record.startsAt);
  const end = new Date(record.endsAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "시간 미정";
  }

  const format = new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${format.format(start)} - ${format.format(end)}`;
}

export function getClubGalleryBadgeCopy(
  record: Pick<ClubGalleryRecord, "featured" | "photoCount">,
): string {
  return record.featured ? `추천 ${record.photoCount}장` : `${record.photoCount}장`;
}
