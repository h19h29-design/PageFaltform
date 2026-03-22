import { randomBytes } from "node:crypto";

import {
  hashSharedSecretForFamily,
  type FamilyViewerRole,
  type PlatformMembership,
} from "@ysplan/auth";
import {
  normalizeModuleKeys,
  type FamilyEntryPreset,
  type FamilyHomePreset,
} from "@ysplan/platform";
import type { FamilyAccessMode, FamilyTheme } from "@ysplan/tenant";

import { getPrismaClient } from "./client";
import {
  AccessEntryMode,
  FamilyEntryPreset as DbFamilyEntryPreset,
  FamilyHomePreset as DbFamilyHomePreset,
  ModuleKey as DbModuleKey,
  TenantRole,
  TenantStatus,
} from "./generated/prisma/enums";
import type { PrismaClient } from "./generated/prisma/client";

const DEFAULT_FAMILY_SESSION_HOURS = 18;

const dbModuleKeyByModuleKey = {
  announcements: DbModuleKey.ANNOUNCEMENTS,
  posts: DbModuleKey.POSTS,
  gallery: DbModuleKey.GALLERY,
  calendar: DbModuleKey.CALENDAR,
  todo: DbModuleKey.TODO,
  diary: DbModuleKey.DIARY,
  "school-timetable": DbModuleKey.SCHOOL_TIMETABLE,
  "day-planner": DbModuleKey.DAY_PLANNER,
  progress: DbModuleKey.PROGRESS,
  habits: DbModuleKey.HABITS,
} as const;

type AuthDataPrismaClient = PrismaClient;

export interface AuthDataServiceBoundary {
  key:
    | "family-tenant"
    | "family-workspace"
    | "family-access"
    | "operator-membership";
  readModels: string[];
  writeModels: string[];
  primaryEntrypoints: string[];
  notes: string;
}

export const authDataServiceBoundaries: AuthDataServiceBoundary[] = [
  {
    key: "family-tenant",
    readModels: ["FamilyTenant", "FamilyTheme", "FamilyDomain"],
    writeModels: ["FamilyTenant", "FamilyTheme", "FamilyDomain"],
    primaryEntrypoints: [
      "console family create",
      "console family save",
      "demo family seed",
      "file-store custom family import",
    ],
    notes:
      "Family identity, theme, and domains should move together so slug/name/theme/domain writes stay in one service boundary.",
  },
  {
    key: "family-workspace",
    readModels: ["FamilyWorkspace", "EnabledModule"],
    writeModels: ["FamilyWorkspace", "EnabledModule"],
    primaryEntrypoints: [
      "console family save",
      "console family reset",
      "demo family seed",
      "file-store workspace import",
    ],
    notes:
      "Home/entry presets and enabled-module ordering are a separate write boundary from tenant identity.",
  },
  {
    key: "family-access",
    readModels: ["FamilyAccessPolicy", "FamilyAccessSession"],
    writeModels: ["FamilyAccessPolicy", "FamilyAccessSession"],
    primaryEntrypoints: [
      "family shared-secret entry",
      "custom family create",
      "demo family seed",
      "file-store custom family import",
    ],
    notes:
      "Family access stays separate from Auth.js Session so shared-secret entry can cut over without rewriting console auth first.",
  },
  {
    key: "operator-membership",
    readModels: ["User", "Membership", "Session"],
    writeModels: ["User", "Membership"],
    primaryEntrypoints: [
      "demo operator seed",
      "console sign-in cutover",
      "custom family owner assignment",
    ],
    notes:
      "Operator identity/membership is the console boundary. Session rows can cut over after seeded operator users and memberships exist.",
  },
];

export interface FamilyThemeWriteInput extends FamilyTheme {
  brandName?: string | null;
}

export interface FamilyAccessPolicyWriteInput {
  mode: FamilyAccessMode;
  secret: string;
  allowGuestRead?: boolean;
  requireMemberProfile?: boolean;
  sessionDurationHours?: number;
}

export interface FamilyTenantWriteInput {
  id?: string;
  slug: string;
  name: string;
  description?: string | null;
  tagline: string;
  welcomeMessage: string;
  heroSummary: string;
  householdMood: string;
  timezone: string;
  memberCount: number;
  status?: "ACTIVE" | "ARCHIVED" | "TRIAL";
  createdByUserId?: string | null;
  customDomains: string[];
  theme: FamilyThemeWriteInput;
  accessPolicy: FamilyAccessPolicyWriteInput;
  createdAt?: string;
  updatedAt?: string;
}

export interface FamilyWorkspaceWriteInput {
  familySlug: string;
  enabledModules: string[];
  homePreset: FamilyHomePreset;
  entryPreset: FamilyEntryPreset;
  updatedByUserId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface OperatorUserWriteInput {
  id?: string;
  email: string;
  displayName: string;
  passwordHash?: string | null;
  memberships: Array<Pick<PlatformMembership, "familySlug" | "role">>;
}

export interface FamilyGraphWriteInput {
  family: FamilyTenantWriteInput;
  workspace: FamilyWorkspaceWriteInput;
}

export interface OperatorGraphWriteInput {
  user: OperatorUserWriteInput;
}

export interface FamilyAccessSessionWriteInput {
  familySlug: string;
  userId?: string | null;
  viewerRole?: FamilyViewerRole;
  entryMode: FamilyAccessMode;
  sessionToken?: string;
  sessionDurationHours?: number;
  expiresAt?: Date;
  now?: Date;
}

export interface AuthDataRepositories {
  familyTenants: {
    findBySlug(slug: string): Promise<{ id: string; slug: string; name: string } | null>;
    upsertCore(input: FamilyTenantWriteInput): Promise<{ id: string; slug: string; name: string }>;
  };
  familyThemes: {
    upsertForFamily(familyId: string, input: FamilyThemeWriteInput): Promise<void>;
  };
  familyDomains: {
    replaceForFamily(familyId: string, domains: string[]): Promise<void>;
  };
  familyAccessPolicies: {
    upsertForFamily(input: {
      familyId: string;
      familySlug: string;
      policy: FamilyAccessPolicyWriteInput;
    }): Promise<void>;
  };
  familyWorkspaces: {
    upsertForFamily(familyId: string, input: FamilyWorkspaceWriteInput): Promise<void>;
  };
  enabledModules: {
    replaceForFamily(familyId: string, moduleKeys: string[]): Promise<void>;
  };
  operatorUsers: {
    findByEmail(email: string): Promise<{ id: string; email: string | null; name: string | null } | null>;
    upsertCore(input: OperatorUserWriteInput): Promise<{ id: string; email: string | null; name: string | null }>;
  };
  memberships: {
    replaceForUser(
      userId: string,
      memberships: Array<Pick<PlatformMembership, "familySlug" | "role">>,
    ): Promise<void>;
    upsertOwnerForFamily(input: { userId: string; familyId: string }): Promise<void>;
  };
  familyAccessSessions: {
    create(
      input: FamilyAccessSessionWriteInput,
    ): Promise<{ id: string; sessionToken: string; tenantId: string; expiresAt: Date }>;
  };
}

export interface AuthDataWriteService {
  repositories: AuthDataRepositories;
  upsertFamilyGraph(
    input: FamilyGraphWriteInput,
  ): Promise<{ id: string; slug: string; name: string }>;
  saveFamilyWorkspace(input: {
    familySlug: string;
    enabledModules: string[];
    homePreset: FamilyHomePreset;
    entryPreset: FamilyEntryPreset;
    updatedByUserId?: string | null;
    createdAt?: string;
    updatedAt?: string;
  }): Promise<{ id: string; slug: string; name: string }>;
  upsertOperatorGraph(
    input: OperatorGraphWriteInput,
  ): Promise<{ id: string; email: string | null; name: string | null }>;
  createFamilyAccessSessionRecord(
    input: FamilyAccessSessionWriteInput,
  ): Promise<{ id: string; sessionToken: string; tenantId: string; expiresAt: Date }>;
}

function normalizeSlug(value: string): string {
  return value.trim().toLowerCase();
}

function parseDate(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function toDbAccessEntryMode(mode: FamilyAccessMode): typeof AccessEntryMode[keyof typeof AccessEntryMode] {
  return mode === "code" ? AccessEntryMode.ACCESS_CODE : AccessEntryMode.PASSWORD;
}

function toDbHomePreset(preset: FamilyHomePreset): typeof DbFamilyHomePreset[keyof typeof DbFamilyHomePreset] {
  if (preset === "planner") {
    return DbFamilyHomePreset.PLANNER;
  }

  if (preset === "story") {
    return DbFamilyHomePreset.STORY;
  }

  return DbFamilyHomePreset.BALANCED;
}

function toDbEntryPreset(
  preset: FamilyEntryPreset,
): typeof DbFamilyEntryPreset[keyof typeof DbFamilyEntryPreset] {
  return preset === "direct" ? DbFamilyEntryPreset.DIRECT : DbFamilyEntryPreset.GUIDED;
}

function toDbTenantRole(role: PlatformMembership["role"] | FamilyViewerRole): typeof TenantRole[keyof typeof TenantRole] {
  switch (role) {
    case "owner":
      return TenantRole.OWNER;
    case "admin":
      return TenantRole.ADMIN;
    case "child":
      return TenantRole.CHILD;
    case "guest":
      return TenantRole.GUEST;
    default:
      return TenantRole.MEMBER;
  }
}

function toDbTenantStatus(
  status?: FamilyTenantWriteInput["status"],
): typeof TenantStatus[keyof typeof TenantStatus] {
  if (status === "ARCHIVED") {
    return TenantStatus.ARCHIVED;
  }

  if (status === "TRIAL") {
    return TenantStatus.TRIAL;
  }

  return TenantStatus.ACTIVE;
}

function toDbModuleKeys(moduleKeys: string[]): DbModuleKey[] {
  return normalizeModuleKeys(moduleKeys)
    .map((moduleKey) => dbModuleKeyByModuleKey[moduleKey])
    .filter((moduleKey): moduleKey is DbModuleKey => Boolean(moduleKey));
}

export function hashFamilySharedSecret(familySlug: string, secret: string): string {
  return hashSharedSecretForFamily(normalizeSlug(familySlug), secret);
}

async function resolveExistingUserId(
  prisma: AuthDataPrismaClient,
  userId?: string | null,
): Promise<string | null> {
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  return user?.id ?? null;
}

async function resolveFamilyIdBySlug(
  prisma: AuthDataPrismaClient,
  familySlug: string,
): Promise<string | null> {
  const family = await prisma.familyTenant.findUnique({
    where: { slug: normalizeSlug(familySlug) },
    select: { id: true },
  });

  return family?.id ?? null;
}

export function createAuthDataRepositories(
  prisma: AuthDataPrismaClient = getPrismaClient(),
): AuthDataRepositories {
  return {
    familyTenants: {
      async findBySlug(slug) {
        return prisma.familyTenant.findUnique({
          where: { slug: normalizeSlug(slug) },
          select: { id: true, slug: true, name: true },
        });
      },
      async upsertCore(input) {
        const normalizedSlug = normalizeSlug(input.slug);
        const createdByUserId = await resolveExistingUserId(prisma, input.createdByUserId);
        const description = input.description?.trim() || input.tagline.trim();

        return prisma.familyTenant.upsert({
          where: { slug: normalizedSlug },
          create: {
            ...(input.id ? { id: input.id } : {}),
            slug: normalizedSlug,
            name: input.name.trim(),
            description,
            tagline: input.tagline.trim(),
            welcomeMessage: input.welcomeMessage.trim(),
            heroSummary: input.heroSummary.trim(),
            householdMood: input.householdMood.trim(),
            timezone: input.timezone.trim() || "Asia/Seoul",
            memberCount: Math.max(1, Math.round(input.memberCount)),
            status: toDbTenantStatus(input.status),
            ...(createdByUserId ? { createdByUserId } : {}),
            ...(parseDate(input.createdAt) ? { createdAt: parseDate(input.createdAt)! } : {}),
            ...(parseDate(input.updatedAt) ? { updatedAt: parseDate(input.updatedAt)! } : {}),
          },
          update: {
            name: input.name.trim(),
            description,
            tagline: input.tagline.trim(),
            welcomeMessage: input.welcomeMessage.trim(),
            heroSummary: input.heroSummary.trim(),
            householdMood: input.householdMood.trim(),
            timezone: input.timezone.trim() || "Asia/Seoul",
            memberCount: Math.max(1, Math.round(input.memberCount)),
            status: toDbTenantStatus(input.status),
            createdByUserId,
            ...(parseDate(input.updatedAt) ? { updatedAt: parseDate(input.updatedAt)! } : {}),
          },
          select: { id: true, slug: true, name: true },
        });
      },
    },
    familyThemes: {
      async upsertForFamily(familyId, input) {
        await prisma.familyTheme.upsert({
          where: { tenantId: familyId },
          create: {
            tenantId: familyId,
            brandName: input.brandName?.trim() || null,
            accentColor: input.accentColor,
            warmColor: input.warmColor,
            surfaceColor: input.surfaceColor,
            highlightColor: input.highlightColor,
          },
          update: {
            brandName: input.brandName?.trim() || null,
            accentColor: input.accentColor,
            warmColor: input.warmColor,
            surfaceColor: input.surfaceColor,
            highlightColor: input.highlightColor,
          },
        });
      },
    },
    familyDomains: {
      async replaceForFamily(familyId, domains) {
        const normalizedDomains = [...new Set(domains.map((domain) => domain.trim().toLowerCase()).filter(Boolean))];

        await prisma.familyDomain.deleteMany({
          where: { tenantId: familyId },
        });

        for (const [index, hostname] of normalizedDomains.entries()) {
          await prisma.familyDomain.create({
            data: {
              tenantId: familyId,
              hostname,
              isPrimary: index === 0,
            },
          });
        }
      },
    },
    familyAccessPolicies: {
      async upsertForFamily({ familyId, familySlug, policy }) {
        await prisma.familyAccessPolicy.upsert({
          where: { tenantId: familyId },
          create: {
            tenantId: familyId,
            entryMode: toDbAccessEntryMode(policy.mode),
            sharedSecretHash: hashFamilySharedSecret(familySlug, policy.secret),
            allowGuestRead: policy.allowGuestRead ?? true,
            requireMemberProfile: policy.requireMemberProfile ?? false,
            sessionDurationHours: policy.sessionDurationHours ?? DEFAULT_FAMILY_SESSION_HOURS,
          },
          update: {
            entryMode: toDbAccessEntryMode(policy.mode),
            sharedSecretHash: hashFamilySharedSecret(familySlug, policy.secret),
            allowGuestRead: policy.allowGuestRead ?? true,
            requireMemberProfile: policy.requireMemberProfile ?? false,
            sessionDurationHours: policy.sessionDurationHours ?? DEFAULT_FAMILY_SESSION_HOURS,
          },
        });
      },
    },
    familyWorkspaces: {
      async upsertForFamily(familyId, input) {
        await prisma.familyWorkspace.upsert({
          where: { tenantId: familyId },
          create: {
            tenantId: familyId,
            homePreset: toDbHomePreset(input.homePreset),
            entryPreset: toDbEntryPreset(input.entryPreset),
            ...(input.updatedByUserId ? { updatedByUserId: input.updatedByUserId } : {}),
            ...(parseDate(input.createdAt) ? { createdAt: parseDate(input.createdAt)! } : {}),
            ...(parseDate(input.updatedAt) ? { updatedAt: parseDate(input.updatedAt)! } : {}),
          },
          update: {
            homePreset: toDbHomePreset(input.homePreset),
            entryPreset: toDbEntryPreset(input.entryPreset),
            updatedByUserId: input.updatedByUserId ?? null,
            ...(parseDate(input.updatedAt) ? { updatedAt: parseDate(input.updatedAt)! } : {}),
          },
        });
      },
    },
    enabledModules: {
      async replaceForFamily(familyId, moduleKeys) {
        const dbModuleKeys = toDbModuleKeys(moduleKeys);

        await prisma.enabledModule.deleteMany({
          where: { tenantId: familyId },
        });

        for (const [index, moduleKey] of dbModuleKeys.entries()) {
          await prisma.enabledModule.create({
            data: {
              tenantId: familyId,
              moduleKey,
              enabled: true,
              sortOrder: index,
            },
          });
        }
      },
    },
    operatorUsers: {
      async findByEmail(email) {
        return prisma.user.findUnique({
          where: { email: email.trim().toLowerCase() },
          select: { id: true, email: true, name: true },
        });
      },
      async upsertCore(input) {
        const normalizedEmail = input.email.trim().toLowerCase();
        const passwordPayload =
          typeof input.passwordHash !== "undefined"
            ? {
                passwordHash: input.passwordHash,
                passwordSetAt: input.passwordHash ? new Date() : null,
              }
            : {};

        return prisma.user.upsert({
          where: { email: normalizedEmail },
          create: {
            ...(input.id ? { id: input.id } : {}),
            email: normalizedEmail,
            name: input.displayName.trim(),
            ...passwordPayload,
          },
          update: {
            name: input.displayName.trim(),
            ...passwordPayload,
          },
          select: { id: true, email: true, name: true },
        });
      },
    },
    memberships: {
      async replaceForUser(userId, memberships) {
        const resolvedMemberships: Array<{ tenantId: string; role: PlatformMembership["role"] }> = [];

        for (const membership of memberships) {
          const tenantId = await resolveFamilyIdBySlug(prisma, membership.familySlug);

          if (!tenantId) {
            continue;
          }

          resolvedMemberships.push({
            tenantId,
            role: membership.role,
          });
        }

        if (resolvedMemberships.length > 0) {
          await prisma.membership.deleteMany({
            where: {
              userId,
              tenantId: {
                notIn: resolvedMemberships.map((membership) => membership.tenantId),
              },
            },
          });
        }

        for (const membership of resolvedMemberships) {
          await prisma.membership.upsert({
            where: {
              userId_tenantId: {
                userId,
                tenantId: membership.tenantId,
              },
            },
            create: {
              userId,
              tenantId: membership.tenantId,
              role: toDbTenantRole(membership.role),
            },
            update: {
              role: toDbTenantRole(membership.role),
            },
          });
        }
      },
      async upsertOwnerForFamily({ userId, familyId }) {
        const existingUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true },
        });

        if (!existingUser) {
          return;
        }

        await prisma.membership.upsert({
          where: {
            userId_tenantId: {
              userId,
              tenantId: familyId,
            },
          },
          create: {
            userId,
            tenantId: familyId,
            role: TenantRole.OWNER,
          },
          update: {
            role: TenantRole.OWNER,
          },
        });
      },
    },
    familyAccessSessions: {
      async create(input) {
        const family = await prisma.familyTenant.findUnique({
          where: { slug: normalizeSlug(input.familySlug) },
          select: {
            id: true,
            accessPolicy: {
              select: {
                sessionDurationHours: true,
              },
            },
          },
        });

        if (!family) {
          throw new Error(`Family tenant not found for slug: ${input.familySlug}`);
        }

        const now = input.now ?? new Date();
        const expiresAt =
          input.expiresAt ??
          new Date(
            now.getTime() +
              (input.sessionDurationHours ??
                family.accessPolicy?.sessionDurationHours ??
                DEFAULT_FAMILY_SESSION_HOURS) *
                60 *
                60 *
                1000,
          );

        return prisma.familyAccessSession.create({
          data: {
            sessionToken: input.sessionToken ?? randomBytes(24).toString("base64url"),
            tenantId: family.id,
            userId: input.userId ?? null,
            viewerRole: toDbTenantRole(input.viewerRole ?? "guest"),
            entryMode: toDbAccessEntryMode(input.entryMode),
            expiresAt,
            lastVerifiedAt: now,
          },
          select: {
            id: true,
            sessionToken: true,
            tenantId: true,
            expiresAt: true,
          },
        });
      },
    },
  };
}

export function createAuthDataWriteService(
  prisma: AuthDataPrismaClient = getPrismaClient(),
): AuthDataWriteService {
  const repositories = createAuthDataRepositories(prisma);

  return {
    repositories,
    async upsertFamilyGraph(input) {
      const family = await repositories.familyTenants.upsertCore(input.family);
      await repositories.familyThemes.upsertForFamily(family.id, input.family.theme);
      await repositories.familyDomains.replaceForFamily(family.id, input.family.customDomains);
      await repositories.familyAccessPolicies.upsertForFamily({
        familyId: family.id,
        familySlug: family.slug,
        policy: input.family.accessPolicy,
      });
      await repositories.familyWorkspaces.upsertForFamily(family.id, input.workspace);
      await repositories.enabledModules.replaceForFamily(
        family.id,
        input.workspace.enabledModules,
      );

      if (input.family.createdByUserId) {
        await repositories.memberships.upsertOwnerForFamily({
          userId: input.family.createdByUserId,
          familyId: family.id,
        });
      }

      return family;
    },
    async saveFamilyWorkspace(input) {
      const family = await repositories.familyTenants.findBySlug(input.familySlug);

      if (!family) {
        throw new Error(`Family tenant not found for slug: ${input.familySlug}`);
      }

      await repositories.familyWorkspaces.upsertForFamily(family.id, {
        familySlug: family.slug,
        enabledModules: input.enabledModules,
        homePreset: input.homePreset,
        entryPreset: input.entryPreset,
        updatedByUserId: input.updatedByUserId ?? null,
        ...(input.createdAt ? { createdAt: input.createdAt } : {}),
        ...(input.updatedAt ? { updatedAt: input.updatedAt } : {}),
      });
      await repositories.enabledModules.replaceForFamily(
        family.id,
        input.enabledModules,
      );

      return family;
    },
    async upsertOperatorGraph(input) {
      const user = await repositories.operatorUsers.upsertCore(input.user);
      await repositories.memberships.replaceForUser(user.id, input.user.memberships);
      return user;
    },
    async createFamilyAccessSessionRecord(input) {
      return repositories.familyAccessSessions.create(input);
    },
  };
}
