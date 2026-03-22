"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAuthDataWriteService } from "@ysplan/database";
import { createDefaultFamilyWorkspace } from "@ysplan/platform";

import {
  canCreateCustomFamilies,
  createCustomFamilySite,
  familyThemePresetOptions,
  type RuntimeFamilyRecord,
} from "../../../../../src/lib/family-sites-store";
import {
  getActiveConsoleSession,
  isDatabaseSourceOfTruthEnabled,
  isDbAuthBaselineEnabled,
} from "../../../../../src/lib/server-sessions";

function parseEnabledModules(formData: FormData): string[] {
  const raw = String(formData.get("enabledModules") ?? "");
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function isRedirectError(
  error: unknown,
): error is {
  digest: string;
} {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { digest?: unknown };
  return (
    typeof candidate.digest === "string" &&
    candidate.digest.startsWith("NEXT_REDIRECT")
  );
}

async function mirrorCreatedFamilyToDatabase(input: {
  family: RuntimeFamilyRecord;
  ownerUserId: string;
  enabledModules: string[];
  homePreset: "balanced" | "planner" | "story";
  entryPreset: "guided" | "direct";
}): Promise<void> {
  if (isDatabaseSourceOfTruthEnabled() || !isDbAuthBaselineEnabled()) {
    return;
  }

  try {
    await createAuthDataWriteService().upsertFamilyGraph({
      family: {
        id: input.family.id,
        slug: input.family.slug,
        name: input.family.name,
        description: input.family.tagline,
        tagline: input.family.tagline,
        welcomeMessage: input.family.welcomeMessage,
        heroSummary: input.family.heroSummary,
        householdMood: input.family.householdMood,
        timezone: input.family.timezone,
        memberCount: input.family.memberCount,
        createdByUserId: input.ownerUserId,
        customDomains: input.family.customDomains,
        theme: input.family.theme,
        accessPolicy: {
          mode: input.family.accessPolicy.mode,
          secret: input.family.accessPolicy.secret,
        },
        ...(input.family.createdAt ? { createdAt: input.family.createdAt } : {}),
        ...(input.family.updatedAt ? { updatedAt: input.family.updatedAt } : {}),
      },
      workspace: {
        familySlug: input.family.slug,
        enabledModules: input.enabledModules,
        homePreset: input.homePreset,
        entryPreset: input.entryPreset,
        updatedByUserId: input.ownerUserId,
        ...(input.family.createdAt ? { createdAt: input.family.createdAt } : {}),
        ...(input.family.updatedAt ? { updatedAt: input.family.updatedAt } : {}),
      },
    });
  } catch (error) {
    console.error("Failed to mirror custom family create to DB baseline.", error);
  }
}

export async function createFamilySiteAction(formData: FormData) {
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
  const themePreset =
    familyThemePresetOptions.find((preset) => preset.key === themePresetValue)
      ?.key ?? familyThemePresetOptions[0]!.key;
  const enabledModules = parseEnabledModules(formData);
  const homePreset =
    String(formData.get("homePreset") ?? "") === "planner"
      ? "planner"
      : String(formData.get("homePreset") ?? "") === "story"
        ? "story"
        : defaultWorkspace.homePreset;
  const entryPreset =
    String(formData.get("entryPreset") ?? "") === "direct"
      ? "direct"
      : defaultWorkspace.entryPreset;

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
      accessMode:
        String(formData.get("accessMode") ?? "") === "code"
          ? "code"
          : "password",
      accessSecret: String(formData.get("accessSecret") ?? ""),
      timezone: String(formData.get("timezone") ?? "Asia/Seoul"),
      themePreset,
      enabledModules,
      homePreset,
      entryPreset,
    });

    await mirrorCreatedFamilyToDatabase({
      family,
      ownerUserId: consoleSession.userId,
      enabledModules,
      homePreset,
      entryPreset,
    });

    revalidatePath("/");
    revalidatePath("/console");
    revalidatePath(`/console/families/${family.slug}`);
    revalidatePath(`/f/${family.slug}`);
    revalidatePath(`/app/${family.slug}`);
    redirect(`/console/families/${family.slug}?state=created`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message =
      error instanceof Error
        ? error.message
        : "가족 홈을 생성하는 중 문제가 발생했습니다.";
    redirect(`/console/families/new?error=${encodeURIComponent(message)}`);
  }
}
