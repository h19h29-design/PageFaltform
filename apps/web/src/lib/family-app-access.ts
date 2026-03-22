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
  viewerRole: DashboardViewerRole;
  consoleAccess: ConsoleFamilyAccessRecord | null;
}

async function resolveFamilyAppAccess(
  familySlug: string,
): Promise<FamilyAppAccessContext | null> {
  const workspaceView = await getEffectiveFamilyWorkspace(familySlug);

  if (!workspaceView) {
    return null;
  }

  const familySession = await getActiveFamilyAccessSessionForSlug(workspaceView.family.slug);
  const consoleSession = await getActiveConsoleSessionForFamily(workspaceView.family.slug);
  const consoleAccess = consoleSession
    ? await getConsoleFamilyBySlug(consoleSession, workspaceView.family.slug)
    : null;
  const hasConsoleBypass = Boolean(consoleAccess?.canManage);

  if (!familySession && !hasConsoleBypass) {
    return null;
  }

  return {
    workspaceView,
    viewerRole: consoleAccess?.role ?? familySession?.viewerRole ?? "guest",
    consoleAccess,
  };
}

export async function requireFamilyAppAccessPage(
  familySlug: string,
): Promise<FamilyAppAccessContext> {
  const workspaceView = await getEffectiveFamilyWorkspace(familySlug);

  if (!workspaceView) {
    notFound();
  }

  const context = await resolveFamilyAppAccess(workspaceView.family.slug);

  if (!context) {
    redirect(`/f/${workspaceView.family.slug}?step=access&error=session-expired`);
  }

  return context;
}

export async function requireFamilyAppAccessMutation(
  familySlug: string,
): Promise<FamilyAppAccessContext> {
  const context = await resolveFamilyAppAccess(familySlug);

  if (!context) {
    redirect(`/f/${familySlug}?step=access&error=session-expired`);
  }

  return context;
}
