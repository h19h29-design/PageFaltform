export const FAMILY_WORKSPACE_COOKIE = "ysplan_family_workspace";
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
export function parseFamilyWorkspaceStore(value) {
    const parsed = deserializePayload(value);
    if (!parsed || parsed.version !== 1 || typeof parsed.families !== "object" || !parsed.families) {
        return null;
    }
    return parsed;
}
export function serializeFamilyWorkspaceStore(store) {
    return serializePayload(store);
}
export function createEmptyFamilyWorkspaceStore() {
    return {
        version: 1,
        families: {}
    };
}
export function upsertFamilyWorkspaceDraft(store, draft) {
    return {
        version: 1,
        families: {
            ...(store?.families ?? {}),
            [draft.familySlug]: draft
        }
    };
}
export function removeFamilyWorkspaceDraft(store, familySlug) {
    const nextFamilies = { ...(store?.families ?? {}) };
    delete nextFamilies[familySlug];
    return {
        version: 1,
        families: nextFamilies
    };
}
export function getFamilyWorkspaceDraft(store, familySlug) {
    return store?.families[familySlug] ?? null;
}
