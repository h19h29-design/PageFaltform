import type { DashboardViewerRole } from "@ysplan/dashboard";

import { getConsoleFamilyBySlug } from "./family-sites-store";
import { getEffectiveFamilyWorkspace, type EffectiveFamilyWorkspace } from "./family-workspace";
import {
  getActiveConsoleSessionForFamily,
  getActiveFamilyAccessSessionForSlug,
} from "./server-sessions";

export interface FamilyAppView {
  workspaceView: EffectiveFamilyWorkspace;
  viewerRole: DashboardViewerRole;
  canManage: boolean;
  hasAccess: boolean;
}

export async function getFamilyAppView(familySlug: string): Promise<FamilyAppView | null> {
  const workspaceView = await getEffectiveFamilyWorkspace(familySlug);

  if (!workspaceView) {
    return null;
  }

  const familySession = await getActiveFamilyAccessSessionForSlug(workspaceView.family.slug);
  const consoleSession = await getActiveConsoleSessionForFamily(workspaceView.family.slug);
  const consoleAccess = consoleSession ? await getConsoleFamilyBySlug(consoleSession, workspaceView.family.slug) : null;
  const canManage = Boolean(consoleAccess?.canManage);
  const hasAccess = Boolean(familySession) || canManage;
  const viewerRole = consoleAccess?.role ?? familySession?.viewerRole ?? "guest";

  return {
    workspaceView,
    viewerRole,
    canManage,
    hasAccess,
  };
}
