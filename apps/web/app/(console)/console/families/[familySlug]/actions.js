"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getConsoleFamilyBySlug, resetRuntimeFamilyWorkspace, saveRuntimeFamilyWorkspace } from "../../../../../src/lib/family-sites-store";
import { getActiveConsoleSession } from "../../../../../src/lib/server-sessions";
function revalidateFamilyPaths(familySlug) {
    revalidatePath("/");
    revalidatePath("/console");
    revalidatePath(`/console/families/${familySlug}`);
    revalidatePath(`/f/${familySlug}`);
    revalidatePath(`/app/${familySlug}`);
}
function parseEnabledModules(formData) {
    return String(formData.get("enabledModules") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
}
export async function saveFamilyWorkspaceAction(formData) {
    const familySlug = String(formData.get("familySlug") ?? "").trim().toLowerCase();
    const consoleSession = await getActiveConsoleSession();
    if (!consoleSession) {
        redirect("/console/sign-in?error=session-required");
    }
    const familyAccess = await getConsoleFamilyBySlug(consoleSession, familySlug);
    if (!familyAccess?.canManage) {
        redirect("/console");
    }
    await saveRuntimeFamilyWorkspace({
        family: familyAccess.family,
        enabledModules: parseEnabledModules(formData),
        homePreset: String(formData.get("homePreset") ?? "") === "planner"
            ? "planner"
            : String(formData.get("homePreset") ?? "") === "story"
                ? "story"
                : "balanced",
        entryPreset: String(formData.get("entryPreset") ?? "") === "direct" ? "direct" : "guided",
    });
    revalidateFamilyPaths(familyAccess.family.slug);
    redirect(`/console/families/${familyAccess.family.slug}?state=saved`);
}
export async function resetFamilyWorkspaceAction(formData) {
    const familySlug = String(formData.get("familySlug") ?? "").trim().toLowerCase();
    const consoleSession = await getActiveConsoleSession();
    if (!consoleSession) {
        redirect("/console/sign-in?error=session-required");
    }
    const familyAccess = await getConsoleFamilyBySlug(consoleSession, familySlug);
    if (!familyAccess?.canManage) {
        redirect("/console");
    }
    await resetRuntimeFamilyWorkspace(familyAccess.family.slug);
    revalidateFamilyPaths(familyAccess.family.slug);
    redirect(`/console/families/${familyAccess.family.slug}?state=reset`);
}
