import { notFound, redirect } from "next/navigation";

import type { DashboardViewerRole } from "@ysplan/dashboard";

import type { ConsoleFamilyAccessRecord } from "./family-sites-store";
import { getConsoleFamilyBySlug } from "./family-sites-store";
import type { EffectiveFamilyWorkspace } from "./family-workspace";
import { getEffectiveFamilyWorkspace } from "./family-workspace";
import {
  getActiveConsoleSessionForFamily,
  getActiveFamilyAccessSessionForSlug,
} from "./server-sessions";

export interface FamilyAppAccessContext {
  workspaceView: EffectiveFamilyWorkspace;
  consoleAccess: ConsoleFamilyAccessRecord | null;
  viewerRole: DashboardViewerRole;
  canManage: boolean;
}

export async function requireFamilyAppAccess(
  familySlug: string,
): Promise<FamilyAppAccessContext> {
  const workspaceView = await getEffectiveFamilyWorkspace(familySlug);

  if (!workspaceView) {
    notFound();
  }

  const familySession = await getActiveFamilyAccessSessionForSlug(workspaceView.family.slug);
  const consoleSession = await getActiveConsoleSessionForFamily(workspaceView.family.slug);
  const consoleAccess = consoleSession
    ? await getConsoleFamilyBySlug(consoleSession, workspaceView.family.slug)
    : null;
  const canManage = Boolean(consoleAccess?.canManage);

  if (!familySession && !canManage) {
    redirect(`/f/${workspaceView.family.slug}?step=access&error=session-expired`);
  }

  return {
    workspaceView,
    consoleAccess,
    viewerRole: consoleAccess?.role ?? familySession?.viewerRole ?? "guest",
    canManage,
  };
}
