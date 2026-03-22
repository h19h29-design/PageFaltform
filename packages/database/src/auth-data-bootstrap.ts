import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { hashPassword, listDemoConsoleUsers } from "@ysplan/auth";
import { normalizeModuleKeys, resolveFamilyWorkspace } from "@ysplan/platform";
import { listFamilyRecords, type FamilyAccessMode, type FamilyTheme } from "@ysplan/tenant";

import {
  createAuthDataWriteService,
  type AuthDataWriteService,
  type FamilyGraphWriteInput,
} from "./auth-data-repositories";

const DEFAULT_THEME: FamilyTheme = {
  accentColor: "#2f5e4e",
  warmColor: "#c26d4e",
  surfaceColor: "#fff9f1",
  highlightColor: "#ead7bd",
};

const DEFAULT_ENABLED_MODULES = ["announcements", "calendar", "todo"] as const;

export type StoredWorkspaceDraftSource =
  | "create-family"
  | "builder-save"
  | "legacy-file";

export interface DemoAuthSeedReport {
  command: "seed-demo";
  importedUsers: string[];
  importedFamilies: string[];
  warnings: string[];
}

export interface FileBackedImportReport {
  command: "import-file-store";
  filePath: string;
  metadataLastWriteAt: string | null;
  importedFamilies: string[];
  importedWorkspaces: Array<{
    familySlug: string;
    savedAt: string;
    savedFrom: StoredWorkspaceDraftSource;
  }>;
  warnings: string[];
}

export interface AuthDataBootstrapReport {
  command: "bootstrap";
  seed: DemoAuthSeedReport;
  fileImport: FileBackedImportReport;
}

interface RawFamilySiteStoreV1 {
  version: 1;
  customFamilies: unknown[];
  workspaceDrafts: Record<string, unknown>;
}

interface RawFamilySiteStoreV2 {
  version: 2;
  metadata?: {
    lastWriteAt?: string | null;
  };
  customFamilies: unknown[];
  workspaceDrafts: Record<string, unknown>;
}

interface ImportedWorkspaceDraftEntry {
  enabledModules: string[];
  homePreset: "balanced" | "planner" | "story";
  entryPreset: "guided" | "direct";
  updatedAt: string;
  savedAt: string;
  savedFrom: StoredWorkspaceDraftSource;
}

interface ImportedCustomFamilyRecord {
  id?: string;
  ownerUserId: string | null;
  slug: string;
  name: string;
  tagline: string;
  welcomeMessage: string;
  heroSummary: string;
  householdMood: string;
  timezone: string;
  memberCount: number;
  customDomains: string[];
  enabledModules: string[];
  theme: FamilyTheme;
  accessMode: FamilyAccessMode;
  accessSecret: string;
  createdAt?: string;
  updatedAt?: string;
}

export function resolveDefaultFamilySiteStoreImportPath(): string {
  return path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../apps/web/data/family-sites.json",
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string");
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeAccessMode(value: unknown): FamilyAccessMode {
  return value === "code" ? "code" : "password";
}

function sanitizeTheme(value: unknown): FamilyTheme {
  if (!isRecord(value)) {
    return { ...DEFAULT_THEME };
  }

  return {
    accentColor:
      typeof value.accentColor === "string"
        ? value.accentColor
        : DEFAULT_THEME.accentColor,
    warmColor:
      typeof value.warmColor === "string"
        ? value.warmColor
        : DEFAULT_THEME.warmColor,
    surfaceColor:
      typeof value.surfaceColor === "string"
        ? value.surfaceColor
        : DEFAULT_THEME.surfaceColor,
    highlightColor:
      typeof value.highlightColor === "string"
        ? value.highlightColor
        : DEFAULT_THEME.highlightColor,
  };
}

function buildImportedWorkspaceDraft(
  familySlug: string,
  defaultModules: readonly string[],
  rawEntry: unknown,
): ImportedWorkspaceDraftEntry {
  const entryRecord = isRecord(rawEntry) && "draft" in rawEntry ? rawEntry : null;
  const draftRecord = entryRecord?.draft ?? rawEntry;
  const override = isRecord(draftRecord)
    ? {
        familySlug,
        enabledModules: toStringArray(draftRecord.enabledModules),
        ...(draftRecord.homePreset === "planner"
          ? { homePreset: "planner" as const }
          : draftRecord.homePreset === "story"
            ? { homePreset: "story" as const }
          : {}),
        ...(draftRecord.entryPreset === "direct"
          ? { entryPreset: "direct" as const }
          : {}),
        ...(typeof draftRecord.updatedAt === "string"
          ? { updatedAt: draftRecord.updatedAt }
          : {}),
      }
    : null;

  const resolved = resolveFamilyWorkspace({
    familySlug,
    defaultModules: normalizeModuleKeys(defaultModules),
    override,
  });

  return {
    enabledModules: resolved.enabledModules,
    homePreset: resolved.homePreset,
    entryPreset: resolved.entryPreset,
    updatedAt: resolved.updatedAt,
    savedAt:
      entryRecord && typeof entryRecord.savedAt === "string"
        ? entryRecord.savedAt
        : resolved.updatedAt,
    savedFrom:
      entryRecord?.savedFrom === "create-family" ||
      entryRecord?.savedFrom === "builder-save"
        ? entryRecord.savedFrom
        : "legacy-file",
  };
}

function parseImportedCustomFamily(rawFamily: unknown): ImportedCustomFamilyRecord | null {
  if (!isRecord(rawFamily)) {
    return null;
  }

  const slug = normalizeSlug(String(rawFamily.slug ?? ""));
  const accessPolicy = isRecord(rawFamily.accessPolicy) ? rawFamily.accessPolicy : null;
  const accessSecret =
    accessPolicy && typeof accessPolicy.secret === "string"
      ? accessPolicy.secret.trim()
      : "";

  if (!slug || !accessSecret) {
    return null;
  }

  const enabledModules = toStringArray(rawFamily.enabledModules);

  return {
    ...(typeof rawFamily.id === "string" ? { id: rawFamily.id } : {}),
    ownerUserId:
      typeof rawFamily.ownerUserId === "string" ? rawFamily.ownerUserId : null,
    slug,
    name: String(rawFamily.name ?? "").trim(),
    tagline: String(rawFamily.tagline ?? "").trim(),
    welcomeMessage: String(rawFamily.welcomeMessage ?? "").trim(),
    heroSummary: String(rawFamily.heroSummary ?? "").trim(),
    householdMood: String(rawFamily.householdMood ?? "").trim(),
    timezone: String(rawFamily.timezone ?? "Asia/Seoul").trim() || "Asia/Seoul",
    memberCount: Math.max(1, Number(rawFamily.memberCount ?? 1) || 1),
    customDomains: toStringArray(rawFamily.customDomains).map((domain) =>
      domain.trim().toLowerCase(),
    ),
    enabledModules:
      enabledModules.length > 0
        ? enabledModules
        : [...DEFAULT_ENABLED_MODULES],
    theme: sanitizeTheme(rawFamily.theme),
    accessMode: normalizeAccessMode(accessPolicy?.mode),
    accessSecret,
    ...(typeof rawFamily.createdAt === "string"
      ? { createdAt: rawFamily.createdAt }
      : {}),
    ...(typeof rawFamily.updatedAt === "string"
      ? { updatedAt: rawFamily.updatedAt }
      : {}),
  };
}

function buildFamilyGraphWriteInput(input: {
  family: ImportedCustomFamilyRecord;
  workspace: ImportedWorkspaceDraftEntry;
}): FamilyGraphWriteInput {
  return {
    family: {
      ...(input.family.id ? { id: input.family.id } : {}),
      slug: input.family.slug,
      name: input.family.name,
      description: input.family.tagline,
      tagline: input.family.tagline,
      welcomeMessage: input.family.welcomeMessage,
      heroSummary: input.family.heroSummary,
      householdMood: input.family.householdMood,
      timezone: input.family.timezone,
      memberCount: input.family.memberCount,
      createdByUserId: input.family.ownerUserId,
      customDomains: input.family.customDomains,
      theme: input.family.theme,
      accessPolicy: {
        mode: input.family.accessMode,
        secret: input.family.accessSecret,
      },
      ...(input.family.createdAt ? { createdAt: input.family.createdAt } : {}),
      ...(input.family.updatedAt ? { updatedAt: input.family.updatedAt } : {}),
    },
    workspace: {
      familySlug: input.family.slug,
      enabledModules: input.workspace.enabledModules,
      homePreset: input.workspace.homePreset,
      entryPreset: input.workspace.entryPreset,
      updatedByUserId: input.family.ownerUserId ?? null,
      ...(input.family.createdAt ? { createdAt: input.family.createdAt } : {}),
      updatedAt: input.workspace.updatedAt,
    },
  };
}

async function readFileBackedFamilySiteStore(filePath: string): Promise<{
  metadataLastWriteAt: string | null;
  customFamilies: ImportedCustomFamilyRecord[];
  workspaceDrafts: Record<string, unknown>;
}> {
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as RawFamilySiteStoreV1 | RawFamilySiteStoreV2;

  const metadataLastWriteAt =
    parsed.version === 2 && parsed.metadata?.lastWriteAt
      ? parsed.metadata.lastWriteAt
      : null;
  const customFamilies = Array.isArray(parsed.customFamilies)
    ? parsed.customFamilies
        .map((family) => parseImportedCustomFamily(family))
        .filter(
          (family): family is ImportedCustomFamilyRecord => family !== null,
        )
    : [];
  return {
    metadataLastWriteAt,
    customFamilies,
    workspaceDrafts:
      parsed.workspaceDrafts && typeof parsed.workspaceDrafts === "object"
        ? parsed.workspaceDrafts
        : {},
  };
}

async function seedDemoOperators(service: AuthDataWriteService): Promise<string[]> {
  const importedUsers: string[] = [];

  for (const user of listDemoConsoleUsers()) {
    await service.upsertOperatorGraph({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        passwordHash: hashPassword(user.password),
        memberships: user.memberships.map((membership) => ({
          familySlug: membership.familySlug,
          role: membership.role,
        })),
      },
    });
    importedUsers.push(user.email);
  }

  return importedUsers;
}

export async function seedDemoAuthData(
  service: AuthDataWriteService = createAuthDataWriteService(),
): Promise<DemoAuthSeedReport> {
  const importedUsers = await seedDemoOperators(service);
  const importedFamilies: string[] = [];
  const warnings: string[] = [];
  const ownerMembershipByFamilySlug = new Map(
    listDemoConsoleUsers()
      .flatMap((user) =>
        user.memberships
          .filter((membership) => membership.role === "owner")
          .map((membership) => [membership.familySlug, user.id] as const),
      ),
  );

  for (const family of listFamilyRecords()) {
    if (!family.accessPolicy.secret.trim()) {
      warnings.push(`Skipped demo family "${family.slug}" because no access secret was found.`);
      continue;
    }

    const workspace = resolveFamilyWorkspace({
      familySlug: family.slug,
      defaultModules: family.enabledModules,
    });

    await service.upsertFamilyGraph({
      family: {
        id: family.id,
        slug: family.slug,
        name: family.name,
        description: family.tagline,
        tagline: family.tagline,
        welcomeMessage: family.welcomeMessage,
        heroSummary: family.heroSummary,
        householdMood: family.householdMood,
        timezone: family.timezone,
        memberCount: family.memberCount,
        createdByUserId: ownerMembershipByFamilySlug.get(family.slug) ?? null,
        customDomains: family.customDomains,
        theme: family.theme,
        accessPolicy: {
          mode: family.accessPolicy.mode,
          secret: family.accessPolicy.secret,
        },
      },
      workspace: {
        familySlug: family.slug,
        enabledModules: workspace.enabledModules,
        homePreset: workspace.homePreset,
        entryPreset: workspace.entryPreset,
      },
    });
    importedFamilies.push(family.slug);
  }

  return {
    command: "seed-demo",
    importedUsers,
    importedFamilies,
    warnings,
  };
}

export async function importFileBackedAuthData(options?: {
  filePath?: string;
  service?: AuthDataWriteService;
}): Promise<FileBackedImportReport> {
  const filePath = options?.filePath ?? resolveDefaultFamilySiteStoreImportPath();
  const service = options?.service ?? createAuthDataWriteService();
  const store = await readFileBackedFamilySiteStore(filePath);
  const importedFamilies: string[] = [];
  const importedWorkspaces: Array<{
    familySlug: string;
    savedAt: string;
    savedFrom: StoredWorkspaceDraftSource;
  }> = [];
  const warnings: string[] = [];

  for (const family of store.customFamilies) {
    if (!family.name || !family.tagline || !family.welcomeMessage) {
      warnings.push(
        `Skipped file-backed family "${family.slug}" because one or more required text fields were empty.`,
      );
      continue;
    }

    const workspace = buildImportedWorkspaceDraft(
      family.slug,
      family.enabledModules,
      store.workspaceDrafts[family.slug],
    );

    await service.upsertFamilyGraph(
      buildFamilyGraphWriteInput({
        family,
        workspace,
      }),
    );

    importedFamilies.push(family.slug);
    importedWorkspaces.push({
      familySlug: family.slug,
      savedAt: workspace.savedAt,
      savedFrom: workspace.savedFrom,
    });
  }

  return {
    command: "import-file-store",
    filePath,
    metadataLastWriteAt: store.metadataLastWriteAt,
    importedFamilies,
    importedWorkspaces,
    warnings,
  };
}

export async function bootstrapAuthDataBaseline(options?: {
  filePath?: string;
}): Promise<AuthDataBootstrapReport> {
  const service = createAuthDataWriteService();
  const seed = await seedDemoAuthData(service);
  const fileImport = await importFileBackedAuthData({
    service,
    ...(options?.filePath ? { filePath: options.filePath } : {}),
  });

  return {
    command: "bootstrap",
    seed,
    fileImport,
  };
}
