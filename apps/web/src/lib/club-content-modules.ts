import type { ClubContentModuleKey } from "./club-content-store";

export interface ClubContentModuleDefinition {
  key: ClubContentModuleKey;
  label: string;
  singularLabel: string;
  createLabel: string;
  emptyTitle: string;
  emptyDescription: string;
}

export const clubContentModuleDefinitions: Record<
  ClubContentModuleKey,
  ClubContentModuleDefinition
> = {
  announcements: {
    key: "announcements",
    label: "공지",
    singularLabel: "공지",
    createLabel: "새 공지",
    emptyTitle: "아직 등록된 공지가 없습니다.",
    emptyDescription: "첫 공지를 올리면 멤버 공간과 공개 보드에서 바로 확인할 수 있습니다.",
  },
  events: {
    key: "events",
    label: "일정",
    singularLabel: "일정",
    createLabel: "새 일정",
    emptyTitle: "아직 등록된 일정이 없습니다.",
    emptyDescription: "첫 일정을 만들면 클럽 홈과 일정 보드에 바로 반영됩니다.",
  },
  gallery: {
    key: "gallery",
    label: "갤러리",
    singularLabel: "앨범",
    createLabel: "새 앨범",
    emptyTitle: "아직 등록된 앨범이 없습니다.",
    emptyDescription: "첫 앨범을 만들면 최근 사진 흐름과 갤러리 보드에서 바로 보입니다.",
  },
};

export function getClubContentModuleDefinition(
  moduleKey: ClubContentModuleKey,
): ClubContentModuleDefinition {
  return clubContentModuleDefinitions[moduleKey];
}

export function getClubContentCrudMessage(
  moduleKey: ClubContentModuleKey,
  state?: string | null,
): string | null {
  const definition = getClubContentModuleDefinition(moduleKey);

  switch (state?.trim().toLowerCase()) {
    case "created":
      return `${definition.singularLabel}를 만들었습니다.`;
    case "updated":
      return `${definition.singularLabel}를 수정했습니다.`;
    case "deleted":
      return `${definition.singularLabel}를 삭제했습니다.`;
    default:
      return null;
  }
}

export function getClubContentErrorMessage(error?: string | null): string | null {
  if (!error) {
    return null;
  }

  try {
    return decodeURIComponent(error);
  } catch {
    return error;
  }
}
