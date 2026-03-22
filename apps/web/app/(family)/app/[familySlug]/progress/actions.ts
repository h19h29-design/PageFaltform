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
  createProgressGoal,
  deleteProgressGoal,
  updateProgressGoal,
  type ProgressGoalDraft,
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

function buildProgressDraft(formData: FormData): ProgressGoalDraft {
  const dueAt = parseDateTimeField(formData.get("dueAt"));

  return {
    audience: getAudienceField(formData, "audience"),
    visibilityScope: getVisibilityField(formData, "visibilityScope"),
    title: getStringField(formData, "title"),
    slug: getStringField(formData, "slug"),
    goalOutcome: getStringField(formData, "goalOutcome"),
    currentValue: getNumberField(formData, "currentValue"),
    targetValue: getNumberField(formData, "targetValue", 1),
    metricLabel: getStringField(formData, "metricLabel"),
    metricUnit: getStringField(formData, "metricUnit"),
    cadenceLabel: getStringField(formData, "cadenceLabel"),
    streakDays: getNumberField(formData, "streakDays"),
    ...(dueAt ? { dueAt } : {}),
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

function revalidateProgressPaths(familySlug: string, goalSlug?: string) {
  revalidatePath(buildFamilyHomeHref(familySlug));
  revalidatePath(buildFamilyModuleHref(familySlug, "progress"));
  revalidatePath(buildFamilyModuleNewHref(familySlug, "progress"));

  if (goalSlug) {
    revalidatePath(buildFamilyModuleDetailHref(familySlug, "progress", goalSlug));
    revalidatePath(buildFamilyModuleEditHref(familySlug, "progress", goalSlug));
  }
}

export async function createProgressGoalAction(formData: FormData) {
  const familySlug = getStringField(formData, "familySlug");

  await requireFamilyTrackerAccess(familySlug);

  try {
    const goal = await createProgressGoal(familySlug, buildProgressDraft(formData));
    revalidateProgressPaths(familySlug, goal.slug);
    redirect(`${buildFamilyModuleDetailHref(familySlug, "progress", goal.slug)}?state=created`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Could not create the goal.";
    redirect(`${buildFamilyModuleNewHref(familySlug, "progress")}?error=${encodeURIComponent(message)}`);
  }
}

export async function updateProgressGoalAction(formData: FormData) {
  const familySlug = getStringField(formData, "familySlug");
  const currentSlug = getStringField(formData, "currentSlug");

  await requireFamilyTrackerAccess(familySlug);

  try {
    const goal = await updateProgressGoal(familySlug, currentSlug, buildProgressDraft(formData));

    if (!goal) {
      redirect(`${buildFamilyModuleHref(familySlug, "progress")}?error=Goal%20not%20found`);
    }

    revalidateProgressPaths(familySlug, currentSlug);
    revalidateProgressPaths(familySlug, goal.slug);
    redirect(`${buildFamilyModuleDetailHref(familySlug, "progress", goal.slug)}?state=updated`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Could not save the goal.";
    redirect(
      `${buildFamilyModuleEditHref(familySlug, "progress", currentSlug)}?error=${encodeURIComponent(message)}`,
    );
  }
}

export async function deleteProgressGoalAction(formData: FormData) {
  const familySlug = getStringField(formData, "familySlug");
  const currentSlug = getStringField(formData, "currentSlug");

  await requireFamilyTrackerAccess(familySlug);
  await deleteProgressGoal(familySlug, currentSlug);
  revalidateProgressPaths(familySlug, currentSlug);
  redirect(`${buildFamilyModuleHref(familySlug, "progress")}?state=deleted`);
}
