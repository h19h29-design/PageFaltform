"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { FamilyThemePreset } from "@ysplan/platform";

import {
  clubModuleCatalog,
  getConsoleClubBySlug,
  saveRuntimeClub,
} from "../../../../../src/lib/club-sites-store";
import {
  approveClubJoinRequest,
  rejectClubJoinRequest,
} from "../../../../../src/lib/club-join-requests";
import { getActiveConsoleSession } from "../../../../../src/lib/server-sessions";

function parseClubModules(formData: FormData) {
  const allowedKeys = new Set(clubModuleCatalog.map((module) => module.key));
  return Array.from(formData.keys())
    .filter((key) => key.startsWith("module-"))
    .map((key) => key.replace(/^module-/, ""))
    .filter((key): key is (typeof clubModuleCatalog)[number]["key"] => allowedKeys.has(key as never));
}

async function requireManageableClub(clubSlug: string) {
  const consoleSession = await getActiveConsoleSession();

  if (!consoleSession) {
    redirect("/console/sign-in?error=session-required");
  }

  const clubAccess = await getConsoleClubBySlug(consoleSession, clubSlug);

  if (!clubAccess?.canManage) {
    redirect("/console");
  }

  return { consoleSession, clubAccess };
}

export async function saveClubWorkspaceAction(formData: FormData) {
  const clubSlug = String(formData.get("clubSlug") ?? "").trim().toLowerCase();
  await requireManageableClub(clubSlug);

  try {
    await saveRuntimeClub({
      clubSlug,
      name: String(formData.get("name") ?? ""),
      tagline: String(formData.get("tagline") ?? ""),
      description: String(formData.get("description") ?? ""),
      sportLabel: String(formData.get("sportLabel") ?? ""),
      location: String(formData.get("location") ?? ""),
      currentFocus: String(formData.get("currentFocus") ?? ""),
      nextEventLabel: String(formData.get("nextEventLabel") ?? ""),
      visibility:
        String(formData.get("visibility") ?? "") === "private" ? "private" : "public",
      joinPolicy:
        String(formData.get("joinPolicy") ?? "") === "invite-first"
          ? "invite-first"
          : "approval-required",
      themePreset: String(formData.get("themePreset") ?? "ocean-depths") as FamilyThemePreset,
      enabledModules: parseClubModules(formData),
    });

    revalidatePath("/clubs");
    revalidatePath(`/clubs/${clubSlug}`);
    revalidatePath(`/clubs/${clubSlug}/app`);
    revalidatePath(`/console/clubs/${clubSlug}`);
    revalidatePath("/console");
    redirect(`/console/clubs/${clubSlug}?state=saved`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "클럽 저장 중 오류가 발생했습니다.";
    redirect(`/console/clubs/${clubSlug}?error=${encodeURIComponent(message)}`);
  }
}

export async function approveClubJoinRequestAction(formData: FormData) {
  const clubSlug = String(formData.get("clubSlug") ?? "").trim().toLowerCase();
  const requestId = String(formData.get("requestId") ?? "");
  const { consoleSession } = await requireManageableClub(clubSlug);
  await approveClubJoinRequest({ requestId, decidedByUserId: consoleSession.userId });
  revalidatePath(`/clubs/${clubSlug}`);
  revalidatePath(`/clubs/${clubSlug}/app`);
  revalidatePath(`/console/clubs/${clubSlug}`);
  redirect(`/console/clubs/${clubSlug}?state=request-approved`);
}

export async function rejectClubJoinRequestAction(formData: FormData) {
  const clubSlug = String(formData.get("clubSlug") ?? "").trim().toLowerCase();
  const requestId = String(formData.get("requestId") ?? "");
  const { consoleSession } = await requireManageableClub(clubSlug);
  await rejectClubJoinRequest({ requestId, decidedByUserId: consoleSession.userId });
  revalidatePath(`/console/clubs/${clubSlug}`);
  redirect(`/console/clubs/${clubSlug}?state=request-rejected`);
}
