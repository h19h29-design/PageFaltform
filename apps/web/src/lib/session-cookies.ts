import type { FamilyAccessSession, PlatformUserSession } from "@ysplan/auth";

export const FAMILY_ACCESS_COOKIE = "ysplan_family_access";
export const PLATFORM_USER_COOKIE = "ysplan_platform_user";

function serializePayload(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function deserializePayload<T>(value?: string): T | null {
  if (!value) {
    return null;
  }

  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
}

export function serializeFamilyAccessSession(session: FamilyAccessSession): string {
  return serializePayload(session);
}

export function parseFamilyAccessSession(value?: string): FamilyAccessSession | null {
  return deserializePayload<FamilyAccessSession>(value);
}

export function serializePlatformUserSession(session: PlatformUserSession): string {
  return serializePayload(session);
}

export function parsePlatformUserSession(value?: string): PlatformUserSession | null {
  return deserializePayload<PlatformUserSession>(value);
}

