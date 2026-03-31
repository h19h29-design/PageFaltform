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

export function getClubModuleRouteSpec(moduleKey: string): { label: string; summary: string } | null {
  switch (moduleKey) {
    case "announcements":
      return { label: "공지", summary: "운영 공지와 준비 사항을 빠르게 공유하는 보드" };
    case "events":
      return { label: "이벤트", summary: "다가오는 일정과 모임 흐름을 한눈에 보는 보드" };
    case "gallery":
      return { label: "갤러리", summary: "활동 사진과 결과 기록을 모아보는 공간" };
    case "leaderboard":
      return { label: "리더보드", summary: "이번 시즌 기록과 참여 순위를 확인하는 공간" };
    case "faq":
      return { label: "FAQ", summary: "가입 전에 자주 묻는 질문과 운영 답변" };
    case "resources":
      return { label: "자료실", summary: "체크리스트, 준비물, 운영 문서를 모아두는 공간" };
    default:
      return null;
  }
}
