import { getFamilyEntryPresetOption, getFamilyHomePresetOption, resolveFamilyWorkspace, } from "@ysplan/platform";
import { getModuleDescriptors } from "@ysplan/tenant";
import { getStoredWorkspaceDraft, listConsoleFamilies, readFamilySiteStore, resolveRuntimeFamilyFromSlug, } from "./family-sites-store";
export function buildEffectiveFamilyWorkspace(family, workspaceDraft) {
    const workspace = resolveFamilyWorkspace({
        familySlug: family.slug,
        defaultModules: family.enabledModules,
        override: workspaceDraft,
    });
    const homePreset = getFamilyHomePresetOption(workspace.homePreset);
    const entryPreset = getFamilyEntryPresetOption(workspace.entryPreset);
    return {
        family,
        workspace,
        isCustomized: Boolean(workspaceDraft),
        homePresetLabel: homePreset.label,
        homePresetDescription: homePreset.description,
        entryPresetLabel: entryPreset.label,
        entryPresetDescription: entryPreset.description,
        moduleDescriptors: getModuleDescriptors(workspace.enabledModules),
    };
}
export async function getEffectiveFamilyWorkspace(familySlug) {
    const family = await resolveRuntimeFamilyFromSlug(familySlug);
    if (!family) {
        return null;
    }
    const workspaceDraft = await getStoredWorkspaceDraft(family.slug);
    return buildEffectiveFamilyWorkspace(family, workspaceDraft);
}
export async function listConsoleFamilyWorkspaces(session) {
    const consoleFamilies = await listConsoleFamilies(session);
    const store = await readFamilySiteStore();
    return consoleFamilies.map((familyRecord) => ({
        ...familyRecord,
        workspaceView: buildEffectiveFamilyWorkspace(familyRecord.family, store.workspaceDrafts[familyRecord.family.slug]?.draft ?? null),
    }));
}
export function getFamilyWorkspaceSummary(workspace) {
    const topModules = workspace.moduleDescriptors
        .slice(0, 3)
        .map((module) => module.label)
        .join(", ");
    return `${workspace.homePresetLabel} · ${workspace.entryPresetLabel} · ${topModules || "기본 모듈"}`;
}
