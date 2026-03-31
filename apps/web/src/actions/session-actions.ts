"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createAuthRuntimeService } from "@ysplan/database";

import {
  FAMILY_ACCESS_COOKIE,
  parseFamilyAccessSession,
  parsePlatformUserSession,
  PLATFORM_USER_COOKIE,
} from "../lib/session-cookies";

function isDatabaseSourceOfTruthEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL) && process.env.YSPLAN_ENABLE_DB_BASELINE === "1";
}

async function clearPlatformSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  const session = parsePlatformUserSession(
    cookieStore.get(PLATFORM_USER_COOKIE)?.value,
  );

  if (isDatabaseSourceOfTruthEnabled() && session?.sessionToken) {
    await createAuthRuntimeService().deletePlatformSession(session.sessionToken);
  }

  cookieStore.delete(PLATFORM_USER_COOKIE);
}

export async function signOutFamilyAction(formData: FormData) {
  const familySlug = String(formData.get("familySlug") ?? "").trim();
  const cookieStore = await cookies();
  const session = parseFamilyAccessSession(
    cookieStore.get(FAMILY_ACCESS_COOKIE)?.value,
  );

  if (isDatabaseSourceOfTruthEnabled() && session?.sessionToken) {
    await createAuthRuntimeService().deleteFamilyAccessSession(session.sessionToken);
  }

  cookieStore.delete(FAMILY_ACCESS_COOKIE);
  redirect(familySlug ? `/f/${familySlug}` : "/");
}

export async function signOutPlatformAction() {
  await clearPlatformSessionCookie();
  redirect("/");
}

export async function signOutConsoleAction() {
  await clearPlatformSessionCookie();
  redirect("/console/sign-in");
}
