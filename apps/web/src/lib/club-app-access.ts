import type { CSSProperties, ReactNode } from "react";
import { redirect } from "next/navigation";

import type { PlatformUserSession } from "@ysplan/auth";
import type { FamilyThemePreset } from "@ysplan/platform";

import {
  buildClubAppHomeHref,
  buildClubConsoleHref,
  buildClubDetailHref,
  buildClubMobilePreviewHref,
} from "./club-app-routes";
import { getDisplayClub, getClubModuleCopy } from "./club-copy";
import { getSharedThemePreset } from "./shared-themes";
import { createFamilySceneStyle } from "./theme-scene";
import {
  clubModuleCatalog,
  resolveRuntimeClubFromSlug,
  type ClubMemberRole,
  type RuntimeClubRecord,
} from "./club-sites-store";
import { getActivePlatformUserSession } from "./server-sessions";

export interface ClubAppModuleEntry {
  moduleKey: string;
  label: string;
  description: string;
  href: string;
}

export interface ClubAppAccess {
  club: RuntimeClubRecord;
  theme: ReturnType<typeof getSharedThemePreset>;
  themePreset: FamilyThemePreset;
  themeLabel: string;
  themeMood: string;
  themeDescription: string;
  viewerRole: ClubMemberRole | "master";
  canManage: boolean;
  memberCount: number;
  session: PlatformUserSession;
  moduleEntries: ClubAppModuleEntry[];
}

function getClubMemberRoleLabel(role: ClubMemberRole | "master"): string {
  switch (role) {
    case "owner":
      return "클럽장";
    case "manager":
      return "운영진";
    case "member":
      return "멤버";
    case "master":
      return "마스터";
    default:
      return "멤버";
  }
}

function buildClubModuleEntries(club: RuntimeClubRecord): ClubAppModuleEntry[] {
  return club.enabledModules
    .map((moduleKey) => {
      const module = clubModuleCatalog.find((candidate) => candidate.key === moduleKey);

      if (!module) {
        return null;
      }

      const moduleCopy = getClubModuleCopy(moduleKey);

      return {
        moduleKey,
        label: moduleCopy.label,
        description: moduleCopy.description,
        href: `/clubs/${club.slug}/app/${moduleKey}`,
      };
    })
    .filter((entry): entry is ClubAppModuleEntry => Boolean(entry));
}

export function createClubAppSceneStyle(club: RuntimeClubRecord): CSSProperties {
  return createFamilySceneStyle(
    getSharedThemePreset(club.themePreset).familyTheme,
    club.themePreset,
  );
}

export async function getClubAppAccess(clubSlug: string): Promise<ClubAppAccess | null> {
  const clubRecord = await resolveRuntimeClubFromSlug(clubSlug);

  if (!clubRecord) {
    return null;
  }

  const club = getDisplayClub(clubRecord);
  const session = await getActivePlatformUserSession();

  if (!session) {
    return null;
  }

  const member = club.members.find((candidate) => candidate.userId === session.userId);
  const canManage =
    session.platformRole === "master" ||
    member?.role === "owner" ||
    member?.role === "manager";

  if (!member && !canManage) {
    return null;
  }

  const theme = getSharedThemePreset(club.themePreset);
  const viewerRole: ClubMemberRole | "master" =
    session.platformRole === "master" ? "master" : member?.role ?? "member";

  return {
    club,
    theme,
    themePreset: club.themePreset,
    themeLabel: theme.label,
    themeMood: theme.mood,
    themeDescription: theme.description,
    viewerRole,
    canManage,
    memberCount: club.members.length,
    session,
    moduleEntries: buildClubModuleEntries(club),
  };
}

export async function requireClubAppAccess(clubSlug: string): Promise<ClubAppAccess> {
  const access = await getClubAppAccess(clubSlug);

  if (!access) {
    redirect(buildClubDetailHref(clubSlug));
  }

  return access;
}

export async function requireClubManageAccess(clubSlug: string): Promise<ClubAppAccess> {
  const access = await requireClubAppAccess(clubSlug);

  if (!access.canManage) {
    redirect(buildClubAppHomeHref(clubSlug));
  }

  return access;
}

export function getClubMemberRoleBadge(role: ClubMemberRole | "master"): ReactNode {
  return getClubMemberRoleLabel(role);
}

export function buildClubAppMobilePreviewHref(clubSlug: string): string {
  return buildClubMobilePreviewHref(clubSlug);
}

export function buildClubAppConsoleHref(clubSlug: string): string {
  return buildClubConsoleHref(clubSlug);
}
