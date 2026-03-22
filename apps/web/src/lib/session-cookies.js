export const FAMILY_ACCESS_COOKIE = "ysplan_family_access";
export const PLATFORM_USER_COOKIE = "ysplan_platform_user";
function serializePayload(value) {
    return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}
function deserializePayload(value) {
    if (!value) {
        return null;
    }
    try {
        const decoded = Buffer.from(value, "base64url").toString("utf8");
        return JSON.parse(decoded);
    }
    catch {
        return null;
    }
}
export function serializeFamilyAccessSession(session) {
    return serializePayload(session);
}
export function parseFamilyAccessSession(value) {
    return deserializePayload(value);
}
export function serializePlatformUserSession(session) {
    return serializePayload(session);
}
export function parsePlatformUserSession(value) {
    return deserializePayload(value);
}
