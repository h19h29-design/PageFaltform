import { resolveFamilyWorkspace, type FamilyWorkspaceDraft } from "@ysplan/platform";
import { getModuleDescriptors } from "@ysplan/tenant";

import {
  familyThemePresetOptions,
  getStoredWorkspaceDraft,
  listConsoleFamilies,
  resolveRuntimeFamilyFromSlug,
  type ConsoleFamilyAccessRecord,
  type RuntimeFamilyRecord,
} from "./family-sites-store";

export interface EffectiveFamilyWorkspace {
  family: RuntimeFamilyRecord;
  workspace: FamilyWorkspaceDraft;
  isCustomized: boolean;
  homePresetLabel: string;
  homePresetDescription: string;
  entryPresetLabel: string;
  entryPresetDescription: string;
  themePresetLabel: string;
  themePresetDescription: string;
  moduleDescriptors: ReturnType<typeof getModuleDescriptors>;
}

const homePresetMeta = {
  balanced: {
    label: "균형형 홈",
    description: "중요 공지와 오늘 일정, 최근 기록을 고르게 보여주는 기본 홈입니다.",
  },
  planner: {
    label: "플래너형 홈",
    description: "오늘 해야 할 일과 일정 카드를 가장 먼저 보여주는 실행 중심 홈입니다.",
  },
  story: {
    label: "기록형 홈",
    description: "사진, 글, 최근 기록을 자연스럽게 이어 붙여 보여주는 스토리형 홈입니다.",
  },
} as const;

const entryPresetMeta = {
  guided: {
    label: "안내형 입장",
    description: "가족 분위기와 모듈 구성을 먼저 보여준 뒤 입장 확인으로 이어집니다.",
  },
  direct: {
    label: "바로 입장",
    description: "입구에서 곧바로 비밀번호나 입장 코드를 확인하는 빠른 흐름입니다.",
  },
} as const;

export function buildEffectiveFamilyWorkspace(
  family: RuntimeFamilyRecord,
  workspaceDraft: FamilyWorkspaceDraft | null,
): EffectiveFamilyWorkspace {
  const workspace = resolveFamilyWorkspace({
    familySlug: family.slug,
    defaultModules: family.enabledModules,
    override: workspaceDraft,
  });
  const homePreset = homePresetMeta[workspace.homePreset];
  const entryPreset = entryPresetMeta[workspace.entryPreset];
  const themePreset =
    familyThemePresetOptions.find((option) => option.key === workspace.themePreset) ??
    familyThemePresetOptions[0]!;
  const effectiveFamily: RuntimeFamilyRecord = {
    ...family,
    theme: workspaceDraft ? { ...themePreset.theme } : family.theme,
  };

  return {
    family: effectiveFamily,
    workspace,
    isCustomized: Boolean(workspaceDraft),
    homePresetLabel: homePreset.label,
    homePresetDescription: homePreset.description,
    entryPresetLabel: entryPreset.label,
    entryPresetDescription: entryPreset.description,
    themePresetLabel: themePreset.label,
    themePresetDescription: themePreset.description,
    moduleDescriptors: getModuleDescriptors(workspace.enabledModules),
  };
}

export async function getEffectiveFamilyWorkspace(
  familySlug: string,
): Promise<EffectiveFamilyWorkspace | null> {
  const family = await resolveRuntimeFamilyFromSlug(familySlug);

  if (!family) {
    return null;
  }

  const workspaceDraft = await getStoredWorkspaceDraft(family.slug);
  return buildEffectiveFamilyWorkspace(family, workspaceDraft);
}

export async function listConsoleFamilyWorkspaces(
  session: Parameters<typeof listConsoleFamilies>[0],
): Promise<Array<ConsoleFamilyAccessRecord & { workspaceView: EffectiveFamilyWorkspace }>> {
  const consoleFamilies = await listConsoleFamilies(session);
  const workspaceViews = await Promise.all(
    consoleFamilies.map(async (familyRecord) => ({
      ...familyRecord,
      workspaceView: buildEffectiveFamilyWorkspace(
        familyRecord.family,
        await getStoredWorkspaceDraft(familyRecord.family.slug),
      ),
    })),
  );

  return workspaceViews;
}

export function getFamilyWorkspaceSummary(workspace: EffectiveFamilyWorkspace): string {
  const topModules = workspace.moduleDescriptors
    .slice(0, 3)
    .map((module) => module.label)
    .join(", ");

  return `${workspace.homePresetLabel} · ${workspace.entryPresetLabel} · ${workspace.themePresetLabel} · ${
    topModules || "기본 모듈"
  }`;
}
