"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { FamilyThemePreset } from "@ysplan/platform";

import { createCustomClubSite, clubModuleCatalog } from "../../../../../src/lib/club-sites-store";
import { getActiveConsoleSession } from "../../../../../src/lib/server-sessions";

function parseClubModules(formData: FormData) {
  const allowedKeys = new Set(clubModuleCatalog.map((module) => module.key));
  const selectedKeys = Array.from(formData.keys())
    .filter((key) => key.startsWith("module-"))
    .map((key) => key.replace(/^module-/, "").trim());

  return selectedKeys.filter(
    (value): value is (typeof clubModuleCatalog)[number]["key"] =>
      allowedKeys.has(value as never),
  );
}

export async function createClubSiteAction(formData: FormData) {
  const consoleSession = await getActiveConsoleSession();

  if (!consoleSession) {
    redirect("/console/sign-in?error=session-required");
  }

  try {
    const club = await createCustomClubSite({
      ownerUserId: consoleSession.userId,
      creatorPlatformRole: consoleSession.platformRole,
      ownerDisplayName: consoleSession.displayName,
      ownerEmail: consoleSession.email,
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? ""),
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

    revalidatePath("/");
    revalidatePath("/club");
    revalidatePath("/clubs");
    revalidatePath("/console");
    revalidatePath(`/clubs/${club.slug}`);
    redirect(`/console/clubs/${club.slug}?state=created`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "클럽을 만드는 중 오류가 발생했습니다.";
    redirect(`/console/clubs/new?error=${encodeURIComponent(message)}`);
  }
}
