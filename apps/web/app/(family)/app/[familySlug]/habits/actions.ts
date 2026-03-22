"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { DashboardCardVisibilityScope, HomeCardAudience } from "@ysplan/modules-core";

import {
  buildFamilyHomeHref,
  buildFamilyModuleDetailHref,
  buildFamilyModuleEditHref,
  buildFamilyModuleHref,
  buildFamilyModuleNewHref,
} from "../../../../../src/lib/family-app-routes";
import { getFamilyAppView } from "../../../../../src/lib/family-app-view";
import { parseDateTimeField } from "../../../../../src/lib/tracker-formatters";
import {
  createHabitRoutine,
  deleteHabitRoutine,
  updateHabitRoutine,
  type HabitRoutineDraft,
} from "../../../../../src/lib/tracker-store";

function isRedirectError(
  error: unknown,
): error is {
  digest: string;
} {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { digest?: unknown };
  return typeof candidate.digest === "string" && candidate.digest.startsWith("NEXT_REDIRECT");
}

function getStringField(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function getAudienceField(formData: FormData, key: string): HomeCardAudience {
  return getStringField(formData, key) === "personal" ? "personal" : "family-shared";
}

function getVisibilityField(formData: FormData, key: string): DashboardCardVisibilityScope {
  const value = getStringField(formData, key);

  switch (value) {
    case "adults":
    case "children-safe":
    case "admins":
    case "private":
      return value;
    default:
      return "all";
  }
}

function getNumberField(formData: FormData, key: string, fallback = 0): number {
  const value = Number(formData.get(key) ?? fallback);
  return Number.isFinite(value) ? value : fallback;
}

function buildHabitDraft(formData: FormData): HabitRoutineDraft {
  const nextCheckInAt = parseDateTimeField(formData.get("nextCheckInAt"));

  return {
    audience: getAudienceField(formData, "audience"),
    visibilityScope: getVisibilityField(formData, "visibilityScope"),
    title: getStringField(formData, "title"),
    slug: getStringField(formData, "slug"),
    periodLabel: getStringField(formData, "periodLabel"),
    habitBenefit: getStringField(formData, "habitBenefit"),
    completionCount: getNumberField(formData, "completionCount"),
    targetCount: getNumberField(formData, "targetCount", 1),
    consistencyRate: getNumberField(formData, "consistencyRate"),
    streakDays: getNumberField(formData, "streakDays"),
    ...(nextCheckInAt ? { nextCheckInAt } : {}),
    featured: formData.get("featured") === "true",
  };
}

async function requireFamilyTrackerAccess(familySlug: string) {
  const familyAppView = await getFamilyAppView(familySlug);

  if (!familyAppView?.hasAccess) {
    redirect(`/f/${familySlug}?step=access&error=session-expired`);
  }

  return familyAppView;
}

function revalidateHabitPaths(familySlug: string, habitSlug?: string) {
  revalidatePath(buildFamilyHomeHref(familySlug));
  revalidatePath(buildFamilyModuleHref(familySlug, "habits"));
  revalidatePath(buildFamilyModuleNewHref(familySlug, "habits"));

  if (habitSlug) {
    revalidatePath(buildFamilyModuleDetailHref(familySlug, "habits", habitSlug));
    revalidatePath(buildFamilyModuleEditHref(familySlug, "habits", habitSlug));
  }
}

export async function createHabitRoutineAction(formData: FormData) {
  const familySlug = getStringField(formData, "familySlug");

  await requireFamilyTrackerAccess(familySlug);

  try {
    const habit = await createHabitRoutine(familySlug, buildHabitDraft(formData));
    revalidateHabitPaths(familySlug, habit.slug);
    redirect(`${buildFamilyModuleDetailHref(familySlug, "habits", habit.slug)}?state=created`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "루틴을 만들지 못했습니다.";
    redirect(`${buildFamilyModuleNewHref(familySlug, "habits")}?error=${encodeURIComponent(message)}`);
  }
}

export async function updateHabitRoutineAction(formData: FormData) {
  const familySlug = getStringField(formData, "familySlug");
  const currentSlug = getStringField(formData, "currentSlug");

  await requireFamilyTrackerAccess(familySlug);

  try {
    const habit = await updateHabitRoutine(familySlug, currentSlug, buildHabitDraft(formData));

    if (!habit) {
      redirect(`${buildFamilyModuleHref(familySlug, "habits")}?error=${encodeURIComponent("루틴을 찾지 못했습니다.")}`);
    }

    revalidateHabitPaths(familySlug, currentSlug);
    revalidateHabitPaths(familySlug, habit.slug);
    redirect(`${buildFamilyModuleDetailHref(familySlug, "habits", habit.slug)}?state=updated`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "루틴을 저장하지 못했습니다.";
    redirect(`${buildFamilyModuleEditHref(familySlug, "habits", currentSlug)}?error=${encodeURIComponent(message)}`);
  }
}

export async function deleteHabitRoutineAction(formData: FormData) {
  const familySlug = getStringField(formData, "familySlug");
  const currentSlug = getStringField(formData, "currentSlug");

  await requireFamilyTrackerAccess(familySlug);
  await deleteHabitRoutine(familySlug, currentSlug);
  revalidateHabitPaths(familySlug, currentSlug);
  redirect(`${buildFamilyModuleHref(familySlug, "habits")}?state=deleted`);
}
