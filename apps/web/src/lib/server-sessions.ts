import { cookies } from "next/headers";

import {
  canAccessConsole,
  getMembershipForFamily,
  isFamilyAccessSessionActive,
  isPlatformUserSessionActive,
  type PlatformMembership,
  type FamilyAccessSession,
  type PlatformUserSession,
} from "@ysplan/auth";
import { createAuthRuntimeService } from "@ysplan/database";

import {
  FAMILY_ACCESS_COOKIE,
  parseFamilyAccessSession,
  parsePlatformUserSession,
  PLATFORM_USER_COOKIE,
} from "./session-cookies";
import {
  createLocalPlatformSession,
  findLocalPlatformUserById,
} from "./local-platform-auth";

export interface AuthDataCutoverPath {
  key: "console-create-save" | "family-access-session";
  currentSource: string;
  nextDbService: string;
  targetModels: string[];
  notes: string;
}

export const authDataCutoverPaths: AuthDataCutoverPath[] = [
  {
    key: "console-create-save",
    currentSource: "family-sites.json customFamilies/workspaceDrafts writes",
    nextDbService: "createAuthDataWriteService().upsertFamilyGraph(...)",
    targetModels: [
      "FamilyTenant",
      "FamilyTheme",
      "FamilyDomain",
      "FamilyWorkspace",
      "EnabledModule",
      "FamilyAccessPolicy",
      "Membership",
    ],
    notes:
      "Console create/save should dual-write here before file-store cutover.",
  },
  {
    key: "family-access-session",
    currentSource: "shared-secret cookie issue without DB row",
    nextDbService: "createAuthDataWriteService().createFamilyAccessSessionRecord(...)",
    targetModels: ["FamilyAccessPolicy", "FamilyAccessSession"],
    notes:
      "Family entry keeps the cookie transport for now, but the server should start minting DB-backed access session rows.",
  },
];

export function isDatabaseSourceOfTruthEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL) && process.env.YSPLAN_ENABLE_DB_BASELINE === "1";
}

export function isDbAuthBaselineEnabled(): boolean {
  return isDatabaseSourceOfTruthEnabled();
}

export async function getActiveFamilyAccessSession(): Promise<FamilyAccessSession | null> {
  const cookieStore = await cookies();
  const session = parseFamilyAccessSession(cookieStore.get(FAMILY_ACCESS_COOKIE)?.value);

  if (!session) {
    return null;
  }

  if (isDatabaseSourceOfTruthEnabled()) {
    if (!session.sessionToken) {
      return null;
    }

    try {
      return await createAuthRuntimeService().resolveFamilyAccessSession(
        session.sessionToken,
      );
    } catch (error) {
      console.error("Failed to resolve DB-backed family access session.", error);
      return null;
    }
  }

  return isFamilyAccessSessionActive(session) ? session : null;
}

export async function getActiveFamilyAccessSessionForSlug(
  familySlug: string,
): Promise<FamilyAccessSession | null> {
  const session = await getActiveFamilyAccessSession();

  if (!session || session.familySlug !== familySlug) {
    return null;
  }

  return session;
}

export async function getActivePlatformUserSession(): Promise<PlatformUserSession | null> {
  const cookieStore = await cookies();
  const session = parsePlatformUserSession(cookieStore.get(PLATFORM_USER_COOKIE)?.value);

  if (!session) {
    return null;
  }

  if (isDatabaseSourceOfTruthEnabled()) {
    if (!session.sessionToken) {
      return null;
    }

    try {
      return await createAuthRuntimeService().resolvePlatformSession(
        session.sessionToken,
      );
    } catch (error) {
      console.error("Failed to resolve DB-backed platform session.", error);
      return null;
    }
  }

  if (!isPlatformUserSessionActive(session)) {
    return null;
  }

  const localUser = await findLocalPlatformUserById(session.userId);

  return localUser ? createLocalPlatformSession(localUser) : session;
}

export async function getActiveConsoleSession(): Promise<PlatformUserSession | null> {
  const session = await getActivePlatformUserSession();

  if (!session || !canAccessConsole(session)) {
    return null;
  }

  return session;
}

export async function getActiveConsoleSessionForFamily(
  _familySlug: string,
): Promise<PlatformUserSession | null> {
  const session = await getActiveConsoleSession();

  if (!session) {
    return null;
  }

  return session;
}

export async function getActivePlatformMembershipForFamily(
  familySlug: string,
): Promise<PlatformMembership | null> {
  const session = await getActivePlatformUserSession();

  if (!session) {
    return null;
  }

  return getMembershipForFamily(session, familySlug);
}
