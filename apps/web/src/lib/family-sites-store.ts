import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createAuthDataWriteService,
  createAuthRuntimeService,
  type RuntimeFamilyGraphRecord as DatabaseFamilyGraphRecord,
  type RuntimeManagedFamilyRecord,
} from "@ysplan/database";
import {
  canCreateFamilySites,
  isConsoleManagerRole,
  isPlatformMaster,
  type ConsoleManagerRole,
  type PlatformAccountRole,
  type PlatformUserSession,
} from "@ysplan/auth";
import {
  normalizeModuleKeys,
  resolveFamilyWorkspace,
  familyThemePresetKeys,
  type FamilyEntryPreset,
  type FamilyHomePreset,
  type FamilyThemePreset,
  type FamilyWorkspaceDraft,
} from "@ysplan/platform";
import {
  cloneFamilyTenantRecord,
  getModuleDescriptors,
  listFamilyRecords,
  toFamilyPublicPreview,
  type FamilyAccessMode,
  type FamilyPublicPreview,
  type FamilyTenantRecord,
  type FamilyTheme,
  type FamilyVisibility,
} from "@ysplan/tenant";
import { familyThemePresetOptions } from "./shared-themes";
export { familyThemePresetOptions } from "./shared-themes";

type ConsoleFamilyRole = ConsoleManagerRole;

export interface StoredCustomFamily extends FamilyTenantRecord {
  ownerUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RuntimeFamilyRecord extends FamilyTenantRecord {
  source: "demo" | "custom";
  ownerUserId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConsoleFamilyAccessRecord {
  family: RuntimeFamilyRecord;
  role: ConsoleFamilyRole;
  canManage: boolean;
}

export type FamilySiteStorageBackend = "file";

export type StoredWorkspaceDraftSource = "create-family" | "builder-save" | "legacy-file";

export interface StoredWorkspaceDraftEntry {
  draft: FamilyWorkspaceDraft;
  savedAt: string;
  savedFrom: StoredWorkspaceDraftSource;
}

export interface FamilySiteStoreMetadata {
  backend: FamilySiteStorageBackend;
  migrationTarget: "postgres";
  lastWriteAt: string | null;
}

interface FamilySiteStore {
  version: 2;
  metadata: FamilySiteStoreMetadata;
  customFamilies: StoredCustomFamily[];
  workspaceDrafts: Record<string, StoredWorkspaceDraftEntry>;
}

interface LegacyFamilySiteStore {
  version: 1;
  customFamilies: StoredCustomFamily[];
  workspaceDrafts: Record<string, FamilyWorkspaceDraft>;
}

export type FamilyThemePresetKey = FamilyThemePreset;

const DEFAULT_DB_MODULES = ["announcements", "calendar", "todo"] as const;

const familySiteStorePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../data/family-sites.json",
);

function createFamilySiteStoreMetadata(lastWriteAt: string | null = null): FamilySiteStoreMetadata {
  return {
    backend: "file",
    migrationTarget: "postgres",
    lastWriteAt,
  };
}

function createEmptyFamilySiteStore(): FamilySiteStore {
  return {
    version: 2,
    metadata: createFamilySiteStoreMetadata(),
    customFamilies: [],
    workspaceDrafts: {},
  };
}

async function ensureFamilySiteStore(): Promise<void> {
  await mkdir(path.dirname(familySiteStorePath), { recursive: true });

  try {
    await readFile(familySiteStorePath, "utf8");
  } catch {
    await writeFile(familySiteStorePath, `${JSON.stringify(createEmptyFamilySiteStore(), null, 2)}\n`, "utf8");
  }
}

function sanitizeStoredCustomFamily(family: StoredCustomFamily): StoredCustomFamily {
  return {
    ...cloneFamilyTenantRecord(family),
    visibility: family.visibility === "private" ? "private" : "public",
    ownerUserId: family.ownerUserId,
    createdAt: family.createdAt,
    updatedAt: family.updatedAt,
  };
}

function cloneWorkspaceDraft(draft: FamilyWorkspaceDraft): FamilyWorkspaceDraft {
  return {
    familySlug: draft.familySlug,
    enabledModules: [...draft.enabledModules],
    homePreset: draft.homePreset,
    entryPreset: draft.entryPreset,
    themePreset: draft.themePreset,
    updatedAt: draft.updatedAt,
  };
}

function createStoredWorkspaceDraftEntry(
  draft: FamilyWorkspaceDraft,
  savedFrom: StoredWorkspaceDraftSource,
  savedAt = draft.updatedAt,
): StoredWorkspaceDraftEntry {
  return {
    draft: cloneWorkspaceDraft(draft),
    savedAt,
    savedFrom,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sanitizeWorkspaceDraft(
  value: unknown,
  fallbackFamilySlug: string,
): FamilyWorkspaceDraft | null {
  if (!isRecord(value)) {
    return null;
  }

  const familySlugCandidate =
    typeof value.familySlug === "string" && value.familySlug.trim().length > 0
      ? value.familySlug.trim().toLowerCase()
      : fallbackFamilySlug;

  return {
    familySlug: familySlugCandidate,
    enabledModules: normalizeModuleKeys(
      Array.isArray(value.enabledModules)
        ? value.enabledModules.filter((moduleKey): moduleKey is string => typeof moduleKey === "string")
        : [],
    ),
    homePreset:
      value.homePreset === "planner" || value.homePreset === "story" ? value.homePreset : "balanced",
    entryPreset: value.entryPreset === "direct" ? "direct" : "guided",
    themePreset:
      familyThemePresetKeys.includes(value.themePreset as FamilyThemePreset)
        ? (value.themePreset as FamilyThemePreset)
        : "ocean-depths",
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date(0).toISOString(),
  };
}

function sanitizeStoredWorkspaceDraftEntry(
  value: unknown,
  familySlug: string,
): StoredWorkspaceDraftEntry | null {
  if (isRecord(value) && "draft" in value) {
    const draft = sanitizeWorkspaceDraft(value.draft, familySlug);

    if (!draft) {
      return null;
    }

    return {
      draft,
      savedAt: typeof value.savedAt === "string" ? value.savedAt : draft.updatedAt,
      savedFrom:
        value.savedFrom === "create-family" || value.savedFrom === "builder-save"
          ? value.savedFrom
          : "legacy-file",
    };
  }

  const legacyDraft = sanitizeWorkspaceDraft(value, familySlug);

  return legacyDraft ? createStoredWorkspaceDraftEntry(legacyDraft, "legacy-file", legacyDraft.updatedAt) : null;
}

function sanitizeWorkspaceDraftMap(
  workspaceDrafts: Record<string, unknown>,
): Record<string, StoredWorkspaceDraftEntry> {
  return Object.fromEntries(
    Object.entries(workspaceDrafts)
      .map(([familySlug, draft]) => {
        const sanitizedDraft = sanitizeStoredWorkspaceDraftEntry(draft, familySlug);
        return sanitizedDraft ? ([familySlug, sanitizedDraft] as const) : null;
      })
      .filter((entry): entry is readonly [string, StoredWorkspaceDraftEntry] => Boolean(entry)),
  );
}

function sanitizeFamilySiteStoreMetadata(metadata: unknown): FamilySiteStoreMetadata {
  if (!isRecord(metadata)) {
    return createFamilySiteStoreMetadata();
  }

  return {
    backend: "file",
    migrationTarget: "postgres",
    lastWriteAt: typeof metadata.lastWriteAt === "string" ? metadata.lastWriteAt : null,
  };
}

async function writeFamilySiteStore(store: FamilySiteStore): Promise<void> {
  await ensureFamilySiteStore();
  const writtenAt = new Date().toISOString();
  const normalizedStore: FamilySiteStore = {
    version: 2,
    metadata: {
      ...sanitizeFamilySiteStoreMetadata(store.metadata),
      lastWriteAt: writtenAt,
    },
    customFamilies: store.customFamilies.map(sanitizeStoredCustomFamily),
    workspaceDrafts: sanitizeWorkspaceDraftMap(store.workspaceDrafts),
  };

  await writeFile(familySiteStorePath, `${JSON.stringify(normalizedStore, null, 2)}\n`, "utf8");
}

export async function readFamilySiteStore(): Promise<FamilySiteStore> {
  await ensureFamilySiteStore();
  const raw = await readFile(familySiteStorePath, "utf8");

  try {
    const parsed = JSON.parse(raw) as FamilySiteStore | LegacyFamilySiteStore;

    if (
      !parsed ||
      !("version" in parsed) ||
      !Array.isArray(parsed.customFamilies) ||
      !parsed.workspaceDrafts ||
      !isRecord(parsed.workspaceDrafts)
    ) {
      return createEmptyFamilySiteStore();
    }

    if (parsed.version === 1) {
      return {
        version: 2,
        metadata: createFamilySiteStoreMetadata(),
        customFamilies: parsed.customFamilies.map(sanitizeStoredCustomFamily),
        workspaceDrafts: sanitizeWorkspaceDraftMap(parsed.workspaceDrafts),
      };
    }

    if (parsed.version !== 2) {
      return createEmptyFamilySiteStore();
    }

    return {
      version: 2,
      metadata: sanitizeFamilySiteStoreMetadata(parsed.metadata),
      customFamilies: parsed.customFamilies.map(sanitizeStoredCustomFamily),
      workspaceDrafts: sanitizeWorkspaceDraftMap(parsed.workspaceDrafts),
    };
  } catch {
    return createEmptyFamilySiteStore();
  }
}

function toRuntimeFamily(family: FamilyTenantRecord): RuntimeFamilyRecord {
  return {
    ...cloneFamilyTenantRecord(family),
    source: "demo",
  };
}

function toRuntimeCustomFamily(family: StoredCustomFamily): RuntimeFamilyRecord {
  return {
    ...sanitizeStoredCustomFamily(family),
    source: "custom",
  };
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

function createAccessPolicy(mode: FamilyAccessMode, secret: string) {
  return {
    mode,
    label: mode === "code" ? "입장 코드" : "가족 비밀번호",
    helperText:
      mode === "code"
        ? "초대받은 가족만 알고 있는 코드를 입력하고 들어오세요."
        : "가족이 함께 쓰는 비밀번호를 입력하고 들어오세요.",
    secret,
  };
}

function createHighlights(input: {
  householdMood: string;
  homePreset: FamilyHomePreset;
  enabledModuleLabels: string[];
}): FamilyTenantRecord["highlights"] {
  return [
    {
      label: "이번 달 분위기",
      value: input.householdMood,
    },
    {
      label: "홈 우선순위",
      value: input.enabledModuleLabels.slice(0, 3).join(", ") || "공지",
    },
    {
      label: "화면 성격",
      value:
        input.homePreset === "planner"
          ? "실행형 보드"
          : input.homePreset === "story"
            ? "기록형 보드"
            : "균형형 보드",
    },
  ];
}

function createEntryChecklist(mode: FamilyAccessMode): FamilyTenantRecord["entryChecklist"] {
  return [
    {
      title: mode === "code" ? "입장 코드 확인" : "가족 비밀번호 확인",
      description: "가볍게 입장하되, 가족 밖에서는 바로 들어오기 어렵게 최소한의 보호를 둡니다.",
    },
    {
      title: "지금 켜진 모듈 미리 보기",
      description: "들어가기 전에 어떤 카드와 모듈이 먼저 보일지 감을 잡을 수 있도록 안내합니다.",
    },
    {
      title: "운영 화면과 분리",
      description: "설정 변경과 권한 관리는 콘솔에서만 가능하게 분리해 보안 흐름을 지킵니다.",
    },
  ];
}

export function getFamilyThemePresetTheme(key: FamilyThemePresetKey): FamilyTheme {
  const presetTheme =
    familyThemePresetOptions.find((preset) => preset.key === key)?.theme ??
    familyThemePresetOptions[0]!.theme;

  return {
    ...presetTheme,
  };
}

export function resolveFamilyThemePresetKey(theme: FamilyTheme): FamilyThemePresetKey {
  const normalizedAccent = theme.accentColor.toLowerCase();
  const normalizedWarm = theme.warmColor.toLowerCase();
  const normalizedSurface = theme.surfaceColor.toLowerCase();
  const normalizedHighlight = theme.highlightColor.toLowerCase();

  return (
    familyThemePresetOptions.find((preset) => {
      const presetTheme = preset.theme;

      return (
        presetTheme.accentColor.toLowerCase() === normalizedAccent &&
        presetTheme.warmColor.toLowerCase() === normalizedWarm &&
        presetTheme.surfaceColor.toLowerCase() === normalizedSurface &&
        presetTheme.highlightColor.toLowerCase() === normalizedHighlight
      );
    })?.key ?? "ocean-depths"
  );
}

function hasDatabaseSourceOfTruth(): boolean {
  return Boolean(process.env.DATABASE_URL) && process.env.YSPLAN_ENABLE_DB_BASELINE === "1";
}

function findDemoFamilyRecord(familySlug: string): FamilyTenantRecord | null {
  return listFamilyRecords().find((family) => family.slug === familySlug) ?? null;
}

function toRuntimeTheme(
  family: DatabaseFamilyGraphRecord,
  demoFamily: FamilyTenantRecord | null,
): FamilyTheme {
  const fallbackTheme = demoFamily?.theme ?? familyThemePresetOptions[0]!.theme;

  return {
    accentColor: family.theme?.accentColor ?? fallbackTheme.accentColor,
    warmColor: family.theme?.warmColor ?? fallbackTheme.warmColor,
    surfaceColor: family.theme?.surfaceColor ?? fallbackTheme.surfaceColor,
    highlightColor: family.theme?.highlightColor ?? fallbackTheme.highlightColor,
  };
}

function toRuntimeFamilyFromDatabase(
  family: DatabaseFamilyGraphRecord,
): RuntimeFamilyRecord {
  const demoFamily = findDemoFamilyRecord(family.slug);
  const enabledModules =
    normalizeModuleKeys(
      family.enabledModules.length > 0
        ? family.enabledModules
        : demoFamily?.enabledModules ?? [...DEFAULT_DB_MODULES],
    ) as RuntimeFamilyRecord["enabledModules"];
  const accessMode = family.accessPolicy?.entryMode ?? demoFamily?.accessPolicy.mode ?? "password";
  const homePreset = family.workspace?.homePreset ?? "balanced";
  const moduleLabels = getModuleDescriptors(enabledModules)
    .slice(0, 4)
    .map((module) => module.label);
  const secretHint = demoFamily?.accessPolicy.secret ?? "";

  return {
    id: family.id,
    slug: family.slug,
    name: family.name,
    tagline: family.tagline ?? family.description ?? demoFamily?.tagline ?? family.name,
    welcomeMessage:
      family.welcomeMessage ?? demoFamily?.welcomeMessage ?? family.name,
    heroSummary:
      family.heroSummary ?? demoFamily?.heroSummary ?? family.description ?? "",
    householdMood:
      family.householdMood ?? demoFamily?.householdMood ?? "Calm family board",
    timezone: family.timezone,
    customDomains: [...family.customDomains],
    memberCount: family.memberCount,
    enabledModules,
    highlights: createHighlights({
      householdMood:
        family.householdMood ?? demoFamily?.householdMood ?? "Calm family board",
      homePreset,
      enabledModuleLabels: moduleLabels,
    }),
    entryChecklist: createEntryChecklist(accessMode),
    theme: toRuntimeTheme(family, demoFamily),
    accessPolicy: createAccessPolicy(accessMode, secretHint),
    visibility: demoFamily?.visibility ?? "public",
    source: demoFamily ? "demo" : "custom",
    ...(family.createdByUserId ? { ownerUserId: family.createdByUserId } : {}),
    createdAt: family.createdAt,
    updatedAt: family.updatedAt,
  };
}

function toWorkspaceDraftFromDatabase(
  family: DatabaseFamilyGraphRecord,
): FamilyWorkspaceDraft | null {
  if (!family.workspace) {
    return null;
  }

  const fallbackTheme = familyThemePresetOptions[0]!.theme;
  const resolvedThemePreset = resolveFamilyThemePresetKey({
    accentColor: family.theme?.accentColor ?? fallbackTheme.accentColor,
    warmColor: family.theme?.warmColor ?? fallbackTheme.warmColor,
    surfaceColor: family.theme?.surfaceColor ?? fallbackTheme.surfaceColor,
    highlightColor: family.theme?.highlightColor ?? fallbackTheme.highlightColor,
  });

  return {
    familySlug: family.slug,
    enabledModules:
      family.enabledModules.length > 0
        ? (normalizeModuleKeys(family.enabledModules) as FamilyWorkspaceDraft["enabledModules"])
        : (normalizeModuleKeys(DEFAULT_DB_MODULES) as FamilyWorkspaceDraft["enabledModules"]),
    homePreset: family.workspace.homePreset,
    entryPreset: family.workspace.entryPreset,
    themePreset: resolvedThemePreset,
    updatedAt: family.workspace.updatedAt,
  };
}

export async function listRuntimeFamilies(): Promise<RuntimeFamilyRecord[]> {
  if (hasDatabaseSourceOfTruth()) {
    const families = await createAuthRuntimeService().listFamilyGraphs();
    return families.map((family) => toRuntimeFamilyFromDatabase(family));
  }

  const baseFamilies = listFamilyRecords().map(toRuntimeFamily);
  const store = await readFamilySiteStore();

  return [...baseFamilies, ...store.customFamilies.map(toRuntimeCustomFamily)];
}

function canDiscoverFamily(
  family: RuntimeFamilyRecord,
  viewerSession?: PlatformUserSession | null,
): boolean {
  if (family.visibility !== "private") {
    return true;
  }

  if (!viewerSession) {
    return false;
  }

  if (isPlatformMaster(viewerSession)) {
    return true;
  }

  if (family.ownerUserId && family.ownerUserId === viewerSession.userId) {
    return true;
  }

  return viewerSession.memberships.some(
    (membership) => membership.familySlug === family.slug,
  );
}

export async function listPublicFamilyPreviews(
  viewerSession?: PlatformUserSession | null,
): Promise<FamilyPublicPreview[]> {
  const families = await listRuntimeFamilies();
  return families
    .filter((family) => canDiscoverFamily(family, viewerSession))
    .map(toFamilyPublicPreview);
}

export async function countOwnedCustomFamilySites(userId: string): Promise<number> {
  if (hasDatabaseSourceOfTruth()) {
    const managedFamilies = await createAuthRuntimeService().listManagedFamiliesForUser(userId);
    return managedFamilies.filter((record) => record.family.createdByUserId === userId).length;
  }

  const store = await readFamilySiteStore();
  return store.customFamilies.filter((family) => family.ownerUserId === userId).length;
}

export function getCustomFamilyCreationLimit(
  accountRole: PlatformAccountRole,
): number {
  return accountRole === "master" ? 99 : 1;
}

export async function resolveRuntimeFamilyFromSlug(familySlug: string): Promise<RuntimeFamilyRecord | null> {
  const normalizedSlug = familySlug.trim().toLowerCase();

  if (hasDatabaseSourceOfTruth()) {
    const family = await createAuthRuntimeService().findFamilyBySlug(normalizedSlug);
    return family ? toRuntimeFamilyFromDatabase(family) : null;
  }

  const families = await listRuntimeFamilies();
  return families.find((family) => family.slug === normalizedSlug) ?? null;
}

export async function resolveDiscoverableRuntimeFamilyFromSlug(
  familySlug: string,
  viewerSession?: PlatformUserSession | null,
): Promise<RuntimeFamilyRecord | null> {
  const family = await resolveRuntimeFamilyFromSlug(familySlug);

  if (!family) {
    return null;
  }

  return canDiscoverFamily(family, viewerSession) ? family : null;
}

export async function resolveRuntimeFamilyFromDomain(domain: string): Promise<RuntimeFamilyRecord | null> {
  const normalizedDomain = domain.trim().toLowerCase();
  const families = await listRuntimeFamilies();

  return (
    families.find((family) =>
      family.customDomains.some((customDomain) => customDomain.toLowerCase() === normalizedDomain),
    ) ?? null
  );
}

export async function listConsoleFamilies(session: PlatformUserSession): Promise<ConsoleFamilyAccessRecord[]> {
  if (hasDatabaseSourceOfTruth()) {
    const managedFamilies = await createAuthRuntimeService().listManagedFamiliesForUser(session.userId);

    return managedFamilies.map((familyRecord: RuntimeManagedFamilyRecord) => ({
      family: toRuntimeFamilyFromDatabase(familyRecord.family),
      role: familyRecord.role,
      canManage: familyRecord.canManage,
    }));
  }

  const baseFamilies = new Map(listFamilyRecords().map((family) => [family.slug, family]));
  const store = await readFamilySiteStore();
  const demoFamilies: ConsoleFamilyAccessRecord[] = [];

  for (const membership of session.memberships) {
    if (!isConsoleManagerRole(membership.role)) {
      continue;
    }

    const family = baseFamilies.get(membership.familySlug);

    if (!family) {
      continue;
    }

    demoFamilies.push({
      family: toRuntimeFamily(family),
      role: membership.role,
      canManage: true,
    });
  }

  const customFamilies: ConsoleFamilyAccessRecord[] = store.customFamilies
    .filter((family) => family.ownerUserId === session.userId)
    .map((family) => ({
      family: toRuntimeCustomFamily(family),
      role: "owner" as const,
      canManage: true,
    }));

  return [...demoFamilies, ...customFamilies];
}

export async function getConsoleFamilyBySlug(
  session: PlatformUserSession,
  familySlug: string,
): Promise<ConsoleFamilyAccessRecord | null> {
  const families = await listConsoleFamilies(session);
  const normalizedSlug = familySlug.trim().toLowerCase();

  return families.find((family) => family.family.slug === normalizedSlug) ?? null;
}

export function canCreateCustomFamilies(session: PlatformUserSession): boolean {
  return canCreateFamilySites(session) || session.memberships.some((membership) => isConsoleManagerRole(membership.role));
}

export async function getStoredWorkspaceDraft(
  familySlug: string,
): Promise<FamilyWorkspaceDraft | null> {
  if (hasDatabaseSourceOfTruth()) {
    const family = await createAuthRuntimeService().findFamilyBySlug(familySlug);
    return family ? toWorkspaceDraftFromDatabase(family) : null;
  }

  const store = await readFamilySiteStore();
  return store.workspaceDrafts[familySlug]?.draft ?? null;
}

export async function saveRuntimeFamilyWorkspace(input: {
  family: RuntimeFamilyRecord;
  enabledModules: string[];
  homePreset: FamilyHomePreset;
  entryPreset: FamilyEntryPreset;
  themePreset: FamilyThemePresetKey;
  visibility?: FamilyVisibility;
  updatedByUserId?: string | null;
}): Promise<FamilyWorkspaceDraft> {
  const draft = resolveFamilyWorkspace({
    familySlug: input.family.slug,
    defaultModules: input.family.enabledModules,
    override: {
      familySlug: input.family.slug,
      enabledModules: input.enabledModules,
      homePreset: input.homePreset,
      entryPreset: input.entryPreset,
      themePreset: input.themePreset,
      updatedAt: new Date().toISOString(),
    },
  });

  if (hasDatabaseSourceOfTruth()) {
    await createAuthDataWriteService().saveFamilyWorkspace({
      familySlug: input.family.slug,
      enabledModules: draft.enabledModules,
      homePreset: draft.homePreset,
      entryPreset: draft.entryPreset,
      updatedByUserId: input.updatedByUserId ?? input.family.ownerUserId ?? null,
      ...(input.family.createdAt ? { createdAt: input.family.createdAt } : {}),
      updatedAt: draft.updatedAt,
    });

    return draft;
  }

  const store = await readFamilySiteStore();

  if (input.family.source === "custom") {
    const customFamily = store.customFamilies.find((family) => family.slug === input.family.slug);

    if (customFamily && input.visibility) {
      customFamily.visibility = input.visibility;
      customFamily.updatedAt = draft.updatedAt;
    }
  }

  store.workspaceDrafts[input.family.slug] = createStoredWorkspaceDraftEntry(draft, "builder-save");
  await writeFamilySiteStore(store);

  return draft;
}

export async function resetRuntimeFamilyWorkspace(
  familySlug: string,
  updatedByUserId?: string | null,
): Promise<void> {
  if (hasDatabaseSourceOfTruth()) {
    const family = await resolveRuntimeFamilyFromSlug(familySlug);

    if (!family) {
      return;
    }

    const draft = resolveFamilyWorkspace({
      familySlug: family.slug,
      defaultModules: family.enabledModules,
    });

    await createAuthDataWriteService().saveFamilyWorkspace({
      familySlug: family.slug,
      enabledModules: draft.enabledModules,
      homePreset: draft.homePreset,
      entryPreset: draft.entryPreset,
      updatedByUserId: updatedByUserId ?? family.ownerUserId ?? null,
      ...(family.createdAt ? { createdAt: family.createdAt } : {}),
      updatedAt: draft.updatedAt,
    });
    return;
  }

  const store = await readFamilySiteStore();
  delete store.workspaceDrafts[familySlug];
  await writeFamilySiteStore(store);
}

export async function createCustomFamilySite(input: {
  ownerUserId: string;
  creatorPlatformRole: PlatformAccountRole;
  name: string;
  slug: string;
  tagline: string;
  welcomeMessage: string;
  heroSummary: string;
  householdMood: string;
  memberCount: number;
  accessMode: FamilyAccessMode;
  accessSecret: string;
  visibility: FamilyVisibility;
  timezone: string;
  themePreset: FamilyThemePresetKey;
  enabledModules: string[];
  homePreset: FamilyHomePreset;
  entryPreset: FamilyEntryPreset;
}): Promise<RuntimeFamilyRecord> {
  const normalizedSlug = normalizeSlug(input.slug);

  if (!/^[a-z0-9-]{2,32}$/.test(normalizedSlug)) {
    throw new Error("가족 홈 주소는 영문 소문자, 숫자, 하이픈만 사용해 2~32자로 만들어 주세요.");
  }

  const duplicatedFamily = hasDatabaseSourceOfTruth()
    ? await createAuthRuntimeService().findFamilyBySlug(normalizedSlug)
    : ([...listFamilyRecords(), ...(await readFamilySiteStore()).customFamilies] as Array<{ slug: string }>).find(
        (family) => family.slug === normalizedSlug,
      );

  if (duplicatedFamily) {
    throw new Error("이미 사용 중인 가족 홈 주소입니다.");
  }

  if (!hasDatabaseSourceOfTruth() && input.creatorPlatformRole !== "master") {
    const ownedFamilyCount = await countOwnedCustomFamilySites(input.ownerUserId);

    if (ownedFamilyCount >= getCustomFamilyCreationLimit(input.creatorPlatformRole)) {
      throw new Error("정회원은 가족홈을 최대 1개까지 만들 수 있습니다.");
    }
  }

  const now = new Date().toISOString();
  const draft = resolveFamilyWorkspace({
    familySlug: normalizedSlug,
    defaultModules: ["announcements", "calendar", "todo"],
    override: {
      familySlug: normalizedSlug,
      enabledModules: input.enabledModules,
      homePreset: input.homePreset,
      entryPreset: input.entryPreset,
      themePreset: input.themePreset,
      updatedAt: now,
    },
  });
  const name = input.name.trim();
  const tagline = input.tagline.trim();
  const welcomeMessage = input.welcomeMessage.trim();
  const heroSummary = input.heroSummary.trim();
  const householdMood = input.householdMood.trim();
  const accessSecret = input.accessSecret.trim();
  const memberCount = Number.isFinite(input.memberCount) ? input.memberCount : 3;

  if (!name || !tagline || !welcomeMessage || !heroSummary || !householdMood || !accessSecret) {
    throw new Error("이름, 설명, 환영 문구, 홈 소개, 가족 무드, 입장 비밀값은 모두 입력해 주세요.");
  }

  const moduleLabels = getModuleDescriptors(draft.enabledModules)
    .slice(0, 4)
    .map((module) => module.label);
  const customFamily: StoredCustomFamily = {
    id: `custom-${randomUUID()}`,
    slug: normalizedSlug,
    name,
    tagline,
    welcomeMessage,
    heroSummary,
    householdMood,
    timezone: input.timezone.trim() || "Asia/Seoul",
    customDomains: [],
    memberCount: Math.max(1, Math.min(12, Math.round(memberCount))),
    enabledModules: draft.enabledModules,
    highlights: createHighlights({
      householdMood,
      homePreset: draft.homePreset,
      enabledModuleLabels: moduleLabels,
    }),
    entryChecklist: createEntryChecklist(input.accessMode),
    theme: getFamilyThemePresetTheme(input.themePreset),
    accessPolicy: createAccessPolicy(input.accessMode, accessSecret),
    visibility: input.visibility,
    ownerUserId: input.ownerUserId,
    createdAt: now,
    updatedAt: now,
  };

  if (hasDatabaseSourceOfTruth()) {
    await createAuthDataWriteService().upsertFamilyGraph({
      family: {
        id: customFamily.id,
        slug: customFamily.slug,
        name: customFamily.name,
        description: customFamily.tagline,
        tagline: customFamily.tagline,
        welcomeMessage: customFamily.welcomeMessage,
        heroSummary: customFamily.heroSummary,
        householdMood: customFamily.householdMood,
        timezone: customFamily.timezone,
        memberCount: customFamily.memberCount,
        createdByUserId: customFamily.ownerUserId,
        customDomains: customFamily.customDomains,
        theme: customFamily.theme,
        accessPolicy: {
          mode: customFamily.accessPolicy.mode,
          secret: customFamily.accessPolicy.secret,
        },
        createdAt: customFamily.createdAt,
        updatedAt: customFamily.updatedAt,
      },
      workspace: {
        familySlug: customFamily.slug,
        enabledModules: draft.enabledModules,
        homePreset: draft.homePreset,
        entryPreset: draft.entryPreset,
        updatedByUserId: customFamily.ownerUserId,
        createdAt: customFamily.createdAt,
        updatedAt: draft.updatedAt,
      },
    });

    const storedFamily = await createAuthRuntimeService().findFamilyBySlug(customFamily.slug);

    if (!storedFamily) {
      throw new Error("Family was written to DB but could not be reloaded.");
    }

    return toRuntimeFamilyFromDatabase(storedFamily);
  }

  const store = await readFamilySiteStore();

  store.customFamilies.push(customFamily);
  store.workspaceDrafts[customFamily.slug] = createStoredWorkspaceDraftEntry(draft, "create-family", now);
  await writeFamilySiteStore(store);

  return toRuntimeCustomFamily(customFamily);
}
