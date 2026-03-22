import type { FamilyWorkspaceDraft, FamilyWorkspaceStore } from "@ysplan/platform";

export const FAMILY_WORKSPACE_COOKIE = "ysplan_family_workspace";

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

export function parseFamilyWorkspaceStore(value?: string): FamilyWorkspaceStore | null {
  const parsed = deserializePayload<FamilyWorkspaceStore>(value);

  if (!parsed || parsed.version !== 1 || typeof parsed.families !== "object" || !parsed.families) {
    return null;
  }

  return parsed;
}

export function serializeFamilyWorkspaceStore(store: FamilyWorkspaceStore): string {
  return serializePayload(store);
}

export function createEmptyFamilyWorkspaceStore(): FamilyWorkspaceStore {
  return {
    version: 1,
    families: {}
  };
}

export function upsertFamilyWorkspaceDraft(
  store: FamilyWorkspaceStore | null,
  draft: FamilyWorkspaceDraft,
): FamilyWorkspaceStore {
  return {
    version: 1,
    families: {
      ...(store?.families ?? {}),
      [draft.familySlug]: draft
    }
  };
}

export function removeFamilyWorkspaceDraft(
  store: FamilyWorkspaceStore | null,
  familySlug: string,
): FamilyWorkspaceStore {
  const nextFamilies = { ...(store?.families ?? {}) };
  delete nextFamilies[familySlug];

  return {
    version: 1,
    families: nextFamilies
  };
}

export function getFamilyWorkspaceDraft(
  store: FamilyWorkspaceStore | null,
  familySlug: string,
): FamilyWorkspaceDraft | null {
  return store?.families[familySlug] ?? null;
}
