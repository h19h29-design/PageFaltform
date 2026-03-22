import { cookies } from "next/headers";
import { canAccessConsole, isFamilyAccessSessionActive, isPlatformUserSessionActive, } from "@ysplan/auth";
import { FAMILY_ACCESS_COOKIE, parseFamilyAccessSession, parsePlatformUserSession, PLATFORM_USER_COOKIE, } from "./session-cookies";
export async function getActiveFamilyAccessSession() {
    const cookieStore = await cookies();
    const session = parseFamilyAccessSession(cookieStore.get(FAMILY_ACCESS_COOKIE)?.value);
    if (!session || !isFamilyAccessSessionActive(session)) {
        return null;
    }
    return session;
}
export async function getActiveFamilyAccessSessionForSlug(familySlug) {
    const session = await getActiveFamilyAccessSession();
    if (!session || session.familySlug !== familySlug) {
        return null;
    }
    return session;
}
export async function getActivePlatformUserSession() {
    const cookieStore = await cookies();
    const session = parsePlatformUserSession(cookieStore.get(PLATFORM_USER_COOKIE)?.value);
    if (!session || !isPlatformUserSessionActive(session)) {
        return null;
    }
    return session;
}
export async function getActiveConsoleSession() {
    const session = await getActivePlatformUserSession();
    if (!session || !canAccessConsole(session)) {
        return null;
    }
    return session;
}
export async function getActiveConsoleSessionForFamily(familySlug) {
    const session = await getActiveConsoleSession();
    if (!session || !canAccessConsole(session, familySlug)) {
        return null;
    }
    return session;
}
