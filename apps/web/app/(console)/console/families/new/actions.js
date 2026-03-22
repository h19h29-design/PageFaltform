"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createDefaultFamilyWorkspace } from "@ysplan/platform";
import { canCreateCustomFamilies, createCustomFamilySite, familyThemePresetOptions, } from "../../../../../src/lib/family-sites-store";
import { getActiveConsoleSession } from "../../../../../src/lib/server-sessions";
function parseEnabledModules(formData) {
    const raw = String(formData.get("enabledModules") ?? "");
    return raw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
}
function isRedirectError(error) {
    if (!error || typeof error !== "object") {
        return false;
    }
    const candidate = error;
    return (typeof candidate.digest === "string" &&
        candidate.digest.startsWith("NEXT_REDIRECT"));
}
export async function createFamilySiteAction(formData) {
    const consoleSession = await getActiveConsoleSession();
    if (!consoleSession) {
        redirect("/console/sign-in?error=session-required");
    }
    if (!canCreateCustomFamilies(consoleSession)) {
        redirect("/console");
    }
    const defaultWorkspace = createDefaultFamilyWorkspace("draft", [
        "announcements",
        "calendar",
        "todo",
    ]);
    const themePresetValue = String(formData.get("themePreset") ?? "");
    const themePreset = familyThemePresetOptions.find((preset) => preset.key === themePresetValue)
        ?.key ?? familyThemePresetOptions[0].key;
    try {
        const family = await createCustomFamilySite({
            ownerUserId: consoleSession.userId,
            name: String(formData.get("name") ?? ""),
            slug: String(formData.get("slug") ?? ""),
            tagline: String(formData.get("tagline") ?? ""),
            welcomeMessage: String(formData.get("welcomeMessage") ?? ""),
            heroSummary: String(formData.get("heroSummary") ?? ""),
            householdMood: String(formData.get("householdMood") ?? ""),
            memberCount: Number(formData.get("memberCount") ?? 3),
            accessMode: String(formData.get("accessMode") ?? "") === "code"
                ? "code"
                : "password",
            accessSecret: String(formData.get("accessSecret") ?? ""),
            timezone: String(formData.get("timezone") ?? "Asia/Seoul"),
            themePreset,
            enabledModules: parseEnabledModules(formData),
            homePreset: String(formData.get("homePreset") ?? "") === "planner"
                ? "planner"
                : String(formData.get("homePreset") ?? "") === "story"
                    ? "story"
                    : defaultWorkspace.homePreset,
            entryPreset: String(formData.get("entryPreset") ?? "") === "direct"
                ? "direct"
                : defaultWorkspace.entryPreset,
        });
        revalidatePath("/");
        revalidatePath("/console");
        revalidatePath(`/console/families/${family.slug}`);
        revalidatePath(`/f/${family.slug}`);
        revalidatePath(`/app/${family.slug}`);
        redirect(`/console/families/${family.slug}?state=created`);
    }
    catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }
        const message = error instanceof Error
            ? error.message
            : "가족 홈을 생성하는 중 문제가 발생했습니다.";
        redirect(`/console/families/new?error=${encodeURIComponent(message)}`);
    }
}
