"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAuthDataWriteService } from "@ysplan/database";
import { createDefaultFamilyWorkspace } from "@ysplan/platform";

import {
  getConsoleFamilyBySlug,
  resetRuntimeFamilyWorkspace,
  saveRuntimeFamilyWorkspace,
  type RuntimeFamilyRecord,
} from "../../../../../src/lib/family-sites-store";
import {
  getActiveConsoleSession,
  isDatabaseSourceOfTruthEnabled,
  isDbAuthBaselineEnabled,
} from "../../../../../src/lib/server-sessions";

function revalidateFamilyPaths(familySlug: string) {
  revalidatePath("/");
  revalidatePath("/console");
  revalidatePath(`/console/families/${familySlug}`);
  revalidatePath(`/f/${familySlug}`);
  revalidatePath(`/app/${familySlug}`);
}

function parseEnabledModules(formData: FormData): string[] {
  return String(formData.get("enabledModules") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

async function mirrorFamilyWorkspaceToDatabase(input: {
  family: RuntimeFamilyRecord;
  updatedByUserId: string;
  enabledModules: string[];
  homePreset: "balanced" | "planner" | "story";
  entryPreset: "guided" | "direct";
}): Promise<void> {
  if (isDatabaseSourceOfTruthEnabled() || !isDbAuthBaselineEnabled()) {
    return;
  }

  const now = new Date().toISOString();

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
        createdByUserId: input.family.ownerUserId ?? input.updatedByUserId,
        customDomains: input.family.customDomains,
        theme: input.family.theme,
        accessPolicy: {
          mode: input.family.accessPolicy.mode,
          secret: input.family.accessPolicy.secret,
        },
        ...(input.family.createdAt ? { createdAt: input.family.createdAt } : {}),
        updatedAt: now,
      },
      workspace: {
        familySlug: input.family.slug,
        enabledModules: input.enabledModules,
        homePreset: input.homePreset,
        entryPreset: input.entryPreset,
        updatedByUserId: input.updatedByUserId,
        ...(input.family.createdAt ? { createdAt: input.family.createdAt } : {}),
        updatedAt: now,
      },
    });
  } catch (error) {
    console.error("Failed to mirror family workspace to DB baseline.", error);
  }
}

export async function saveFamilyWorkspaceAction(formData: FormData) {
  const familySlug = String(formData.get("familySlug") ?? "").trim().toLowerCase();
  const consoleSession = await getActiveConsoleSession();

  if (!consoleSession) {
    redirect("/console/sign-in?error=session-required");
  }

  const familyAccess = await getConsoleFamilyBySlug(consoleSession, familySlug);

  if (!familyAccess?.canManage) {
    redirect("/console");
  }

  const enabledModules = parseEnabledModules(formData);
  const homePreset =
    String(formData.get("homePreset") ?? "") === "planner"
      ? "planner"
      : String(formData.get("homePreset") ?? "") === "story"
        ? "story"
        : "balanced";
  const entryPreset =
    String(formData.get("entryPreset") ?? "") === "direct" ? "direct" : "guided";

  await saveRuntimeFamilyWorkspace({
    family: familyAccess.family,
    enabledModules,
    homePreset,
    entryPreset,
    updatedByUserId: consoleSession.userId,
  });

  await mirrorFamilyWorkspaceToDatabase({
    family: familyAccess.family,
    updatedByUserId: consoleSession.userId,
    enabledModules,
    homePreset,
    entryPreset,
  });

  revalidateFamilyPaths(familyAccess.family.slug);
  redirect(`/console/families/${familyAccess.family.slug}?state=saved`);
}

export async function resetFamilyWorkspaceAction(formData: FormData) {
  const familySlug = String(formData.get("familySlug") ?? "").trim().toLowerCase();
  const consoleSession = await getActiveConsoleSession();

  if (!consoleSession) {
    redirect("/console/sign-in?error=session-required");
  }

  const familyAccess = await getConsoleFamilyBySlug(consoleSession, familySlug);

  if (!familyAccess?.canManage) {
    redirect("/console");
  }

  await resetRuntimeFamilyWorkspace(
    familyAccess.family.slug,
    consoleSession.userId,
  );
  const defaultWorkspace = createDefaultFamilyWorkspace(
    familyAccess.family.slug,
    familyAccess.family.enabledModules,
  );
  await mirrorFamilyWorkspaceToDatabase({
    family: familyAccess.family,
    updatedByUserId: consoleSession.userId,
    enabledModules: defaultWorkspace.enabledModules,
    homePreset: defaultWorkspace.homePreset,
    entryPreset: defaultWorkspace.entryPreset,
  });
  revalidateFamilyPaths(familyAccess.family.slug);
  redirect(`/console/families/${familyAccess.family.slug}?state=reset`);
}
