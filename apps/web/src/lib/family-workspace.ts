import {
  getFamilyEntryPresetOption,
  getFamilyHomePresetOption,
  resolveFamilyWorkspace,
  type FamilyWorkspaceDraft,
} from "@ysplan/platform";
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

export function buildEffectiveFamilyWorkspace(
  family: RuntimeFamilyRecord,
  workspaceDraft: FamilyWorkspaceDraft | null,
): EffectiveFamilyWorkspace {
  const workspace = resolveFamilyWorkspace({
    familySlug: family.slug,
    defaultModules: family.enabledModules,
    override: workspaceDraft,
  });
  const homePreset = getFamilyHomePresetOption(workspace.homePreset);
  const entryPreset = getFamilyEntryPresetOption(workspace.entryPreset);
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
