"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isPlatformMaster } from "@ysplan/auth";

import { setLocalPlatformUserRole } from "../../../src/lib/local-platform-auth";
import { getActiveConsoleSession } from "../../../src/lib/server-sessions";

export async function approveFullMemberAction(formData: FormData) {
  const userId = String(formData.get("userId") ?? "").trim();
  const consoleSession = await getActiveConsoleSession();

  if (!consoleSession) {
    redirect("/console/sign-in?error=session-required");
  }

  if (!isPlatformMaster(consoleSession)) {
    redirect("/console");
  }

  await setLocalPlatformUserRole({
    userId,
    platformRole: "full-member",
    approvedByUserId: consoleSession.userId,
  });

  revalidatePath("/console");
  redirect("/console?state=full-member-approved");
}
