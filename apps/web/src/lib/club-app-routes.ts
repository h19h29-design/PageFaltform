export function buildClubDirectoryHref(): string {
  return "/clubs";
}

export function buildClubDetailHref(clubSlug: string): string {
  return `/clubs/${clubSlug}`;
}

export function buildClubJoinHref(clubSlug: string): string {
  return `${buildClubDetailHref(clubSlug)}/join`;
}

export function buildClubConsoleHref(clubSlug: string): string {
  return `/console/clubs/${clubSlug}`;
}

export function buildClubAppHomeHref(clubSlug: string): string {
  return `${buildClubDetailHref(clubSlug)}/app`;
}

export function buildClubAppModuleHref(clubSlug: string, moduleKey: string): string {
  return `${buildClubAppHomeHref(clubSlug)}/${moduleKey}`;
}

export function buildClubAppModuleNewHref(clubSlug: string, moduleKey: string): string {
  return `${buildClubAppModuleHref(clubSlug, moduleKey)}/new`;
}

export function buildClubAppModuleDetailHref(
  clubSlug: string,
  moduleKey: string,
  itemSlug: string,
): string {
  return `${buildClubAppModuleHref(clubSlug, moduleKey)}/${itemSlug}`;
}

export function buildClubAppModuleEditHref(
  clubSlug: string,
  moduleKey: string,
  itemSlug: string,
): string {
  return `${buildClubAppModuleDetailHref(clubSlug, moduleKey, itemSlug)}/edit`;
}

export function buildClubMobilePreviewHref(clubSlug: string, screen?: string): string {
  return screen
    ? `/preview/mobile/club/${clubSlug}?screen=${screen}`
    : `/preview/mobile/club/${clubSlug}`;
}

export function getClubModuleRouteSpec(
  moduleKey: string,
): { label: string; summary: string } | null {
  switch (moduleKey) {
    case "announcements":
      return { label: "공지", summary: "운영 공지와 변경 안내를 모아보는 게시판" };
    case "events":
      return { label: "일정", summary: "모임 일정과 준비 정보를 보는 게시판" };
    case "gallery":
      return { label: "갤러리", summary: "활동 사진과 기록을 모아보는 게시판" };
    case "leaderboard":
      return { label: "리더보드", summary: "참여 기록과 순위를 보는 공간" };
    case "faq":
      return { label: "FAQ", summary: "자주 묻는 질문을 빠르게 찾는 공간" };
    case "resources":
      return { label: "자료실", summary: "운영 문서와 체크리스트를 모아두는 공간" };
    default:
      return null;
  }
}
