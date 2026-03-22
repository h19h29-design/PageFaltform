import type { DashboardCardVisibilityScope, HomeCardAudience } from "@ysplan/modules-core";

export type ContentModuleKey = "announcements" | "posts" | "gallery" | "diary";

type CrudState = "created" | "updated" | "deleted";

export interface ContentModuleDefinition {
  key: ContentModuleKey;
  label: string;
  singularLabel: string;
  segment: string;
  description: string;
  createLabel: string;
  emptyTitle: string;
  emptyDescription: string;
}

export const contentModuleDefinitions: Record<ContentModuleKey, ContentModuleDefinition> = {
  announcements: {
    key: "announcements",
    label: "공지",
    singularLabel: "공지",
    segment: "announcements",
    description: "긴급 전달, 중요 안내, 장기 고정 공지를 가족 홈과 상세 페이지에서 함께 관리합니다.",
    createLabel: "새 공지 작성",
    emptyTitle: "아직 등록된 공지가 없습니다.",
    emptyDescription: "첫 공지를 만들면 홈 hero/focus/pinned 흐름에도 바로 반영됩니다.",
  },
  posts: {
    key: "posts",
    label: "글",
    singularLabel: "글",
    segment: "posts",
    description: "업데이트, 가이드, 기록형 글을 recent 흐름과 실제 상세 페이지에서 함께 읽고 수정합니다.",
    createLabel: "새 글 작성",
    emptyTitle: "아직 등록된 글이 없습니다.",
    emptyDescription: "첫 글을 만들면 recent 스토리 밴드와 목록 페이지에서 바로 확인할 수 있습니다.",
  },
  gallery: {
    key: "gallery",
    label: "갤러리",
    singularLabel: "갤러리 항목",
    segment: "gallery",
    description: "사진 수, 캡션, 기록 메모를 바탕으로 최근 기억 흐름을 실제 페이지에서 관리합니다.",
    createLabel: "새 갤러리 항목 작성",
    emptyTitle: "아직 등록된 갤러리 항목이 없습니다.",
    emptyDescription: "첫 앨범을 만들면 recent 카드와 상세 화면에서 사진 기록 흐름이 연결됩니다.",
  },
  diary: {
    key: "diary",
    label: "일기",
    singularLabel: "일기",
    segment: "diary",
    description: "조용한 기록과 회고를 recent/post 계열로 유지하면서 실제 CRUD와 상세 페이지를 제공합니다.",
    createLabel: "새 일기 작성",
    emptyTitle: "아직 등록된 일기가 없습니다.",
    emptyDescription: "첫 일기를 만들면 recent 흐름에서 글 카드처럼 보이되 moduleKey는 diary로 유지됩니다.",
  },
};

export const audienceOptions: Array<{ value: HomeCardAudience; label: string }> = [
  { value: "family-shared", label: "가족 공유" },
  { value: "personal", label: "개인 기록" },
];

export const visibilityScopeOptions: Array<{
  value: DashboardCardVisibilityScope;
  label: string;
}> = [
  { value: "all", label: "모두" },
  { value: "adults", label: "성인만" },
  { value: "children-safe", label: "아이와 함께" },
  { value: "admins", label: "관리자만" },
  { value: "private", label: "비공개" },
];

export function getContentModuleDefinition(moduleKey: ContentModuleKey): ContentModuleDefinition {
  return contentModuleDefinitions[moduleKey];
}

export function getAudienceLabel(audience: HomeCardAudience): string {
  return audienceOptions.find((option) => option.value === audience)?.label ?? audience;
}

export function getVisibilityScopeLabel(scope: DashboardCardVisibilityScope): string {
  return visibilityScopeOptions.find((option) => option.value === scope)?.label ?? scope;
}

export function buildContentModuleListHref(
  familySlug: string,
  moduleKey: ContentModuleKey,
): string {
  return `/app/${familySlug}/${contentModuleDefinitions[moduleKey].segment}`;
}

export function buildContentModuleNewHref(
  familySlug: string,
  moduleKey: ContentModuleKey,
): string {
  return `${buildContentModuleListHref(familySlug, moduleKey)}/new`;
}

export function buildContentModuleDetailHref(
  familySlug: string,
  moduleKey: ContentModuleKey,
  slug: string,
): string {
  return `${buildContentModuleListHref(familySlug, moduleKey)}/${slug}`;
}

export function buildContentModuleEditHref(
  familySlug: string,
  moduleKey: ContentModuleKey,
  slug: string,
): string {
  return `${buildContentModuleDetailHref(familySlug, moduleKey, slug)}/edit`;
}

export function getContentCrudMessage(
  moduleKey: ContentModuleKey,
  state?: string | null,
): string | null {
  const definition = getContentModuleDefinition(moduleKey);
  const normalizedState = state?.trim().toLowerCase() as CrudState | undefined;

  switch (normalizedState) {
    case "created":
      return `${definition.singularLabel}를 생성했습니다.`;
    case "updated":
      return `${definition.singularLabel}를 수정했습니다.`;
    case "deleted":
      return `${definition.singularLabel}를 삭제했습니다.`;
    default:
      return null;
  }
}

export function getContentErrorMessage(error?: string | null): string | null {
  if (!error) {
    return null;
  }

  try {
    return decodeURIComponent(error);
  } catch {
    return error;
  }
}
