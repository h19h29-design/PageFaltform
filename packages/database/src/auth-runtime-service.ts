import { randomBytes } from "node:crypto";

import {
  createFamilyAccessSession,
  createPlatformUserSession,
  normalizeEmail,
  type FamilyAccessSession,
  type FamilyViewerRole,
  type PlatformMembership,
  type PlatformUserSession,
} from "@ysplan/auth";
import type { FamilyEntryPreset, FamilyHomePreset } from "@ysplan/platform";

import { getPrismaClient } from "./client";
import {
  AccessEntryMode,
  FamilyEntryPreset as DbFamilyEntryPreset,
  FamilyHomePreset as DbFamilyHomePreset,
  ModuleKey as DbModuleKey,
  TenantRole,
} from "./generated/prisma/enums";
import type { PrismaClient } from "./generated/prisma/client";

const PLATFORM_SESSION_HOURS = 12;
const DEFAULT_FAMILY_SESSION_HOURS = 18;

type AuthRuntimePrismaClient = PrismaClient;

const moduleKeyByDbModuleKey = {
  [DbModuleKey.ANNOUNCEMENTS]: "announcements",
  [DbModuleKey.POSTS]: "posts",
  [DbModuleKey.GALLERY]: "gallery",
  [DbModuleKey.CALENDAR]: "calendar",
  [DbModuleKey.TODO]: "todo",
  [DbModuleKey.DIARY]: "diary",
  [DbModuleKey.SCHOOL_TIMETABLE]: "school-timetable",
  [DbModuleKey.DAY_PLANNER]: "day-planner",
  [DbModuleKey.PROGRESS]: "progress",
  [DbModuleKey.HABITS]: "habits",
} as const;

export interface RuntimePlatformAuthUser {
  id: string;
  displayName: string;
  email: string;
  passwordHash: string | null;
  memberships: PlatformMembership[];
}

export interface RuntimeFamilyGraphRecord {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  tagline: string | null;
  welcomeMessage: string | null;
  heroSummary: string | null;
  householdMood: string | null;
  timezone: string;
  memberCount: number;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  customDomains: string[];
  enabledModules: string[];
  accessPolicy: {
    entryMode: "password" | "code";
    sharedSecretHash: string | null;
    sessionDurationHours: number;
    allowGuestRead: boolean;
    requireMemberProfile: boolean;
  } | null;
  theme: {
    brandName: string | null;
    accentColor: string | null;
    warmColor: string | null;
    surfaceColor: string | null;
    highlightColor: string | null;
  } | null;
  workspace: {
    homePreset: FamilyHomePreset;
    entryPreset: FamilyEntryPreset;
    updatedByUserId: string | null;
    updatedAt: string;
  } | null;
}

export interface RuntimeManagedFamilyRecord {
  family: RuntimeFamilyGraphRecord;
  role: Extract<PlatformMembership["role"], "owner" | "admin">;
  canManage: boolean;
}

function addHours(now: Date, hours: number): Date {
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

function fromDbTenantRole(role: TenantRole): PlatformMembership["role"] | null {
  switch (role) {
    case TenantRole.OWNER:
      return "owner";
    case TenantRole.ADMIN:
      return "admin";
    case TenantRole.CHILD:
      return "child";
    case TenantRole.GUEST:
      return null;
    default:
      return "member";
  }
}

function toDbViewerRole(role: FamilyViewerRole): TenantRole {
  switch (role) {
    case "member":
      return TenantRole.MEMBER;
    case "child":
      return TenantRole.CHILD;
    default:
      return TenantRole.GUEST;
  }
}

function fromDbViewerRole(role: TenantRole): FamilyViewerRole {
  switch (role) {
    case TenantRole.CHILD:
      return "child";
    case TenantRole.MEMBER:
      return "member";
    default:
      return "guest";
  }
}

function fromDbAccessEntryMode(mode: AccessEntryMode): "password" | "code" {
  return mode === AccessEntryMode.ACCESS_CODE ? "code" : "password";
}

function fromDbHomePreset(preset: DbFamilyHomePreset): FamilyHomePreset {
  if (preset === DbFamilyHomePreset.PLANNER) {
    return "planner";
  }

  if (preset === DbFamilyHomePreset.STORY) {
    return "story";
  }

  return "balanced";
}

function fromDbEntryPreset(preset: DbFamilyEntryPreset): FamilyEntryPreset {
  return preset === DbFamilyEntryPreset.DIRECT ? "direct" : "guided";
}

function fromDbModuleKey(moduleKey: DbModuleKey): string {
  return moduleKeyByDbModuleKey[moduleKey];
}

function toPlatformMemberships(
  memberships: Array<{
    role: TenantRole;
    tenant: { slug: string; name: string };
  }>,
): PlatformMembership[] {
  return memberships.flatMap((membership) => {
    const role = fromDbTenantRole(membership.role);

    if (!role) {
      return [];
    }

    return [
      {
        familySlug: membership.tenant.slug,
        familyName: membership.tenant.name,
        role,
      },
    ];
  });
}

function toRuntimePlatformAuthUser(user: {
  id: string;
  name: string | null;
  email: string | null;
  passwordHash: string | null;
  memberships: Array<{
    role: TenantRole;
    tenant: { slug: string; name: string };
  }>;
}): RuntimePlatformAuthUser | null {
  if (!user.email) {
    return null;
  }

  return {
    id: user.id,
    displayName: user.name?.trim() || user.email,
    email: user.email,
    passwordHash: user.passwordHash,
    memberships: toPlatformMemberships(user.memberships),
  };
}

function toRuntimeFamilyGraphRecord(family: {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  tagline: string | null;
  welcomeMessage: string | null;
  heroSummary: string | null;
  householdMood: string | null;
  timezone: string;
  memberCount: number;
  createdByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
  accessPolicy: {
    entryMode: AccessEntryMode;
    sharedSecretHash: string | null;
    sessionDurationHours: number;
    allowGuestRead: boolean;
    requireMemberProfile: boolean;
  } | null;
  theme: {
    brandName: string | null;
    accentColor: string | null;
    warmColor: string | null;
    surfaceColor: string | null;
    highlightColor: string | null;
  } | null;
  domains: Array<{ hostname: string }>;
  modules: Array<{ moduleKey: DbModuleKey }>;
  workspace: {
    homePreset: DbFamilyHomePreset;
    entryPreset: DbFamilyEntryPreset;
    updatedByUserId: string | null;
    updatedAt: Date;
  } | null;
}): RuntimeFamilyGraphRecord {
  return {
    id: family.id,
    slug: family.slug,
    name: family.name,
    description: family.description,
    tagline: family.tagline,
    welcomeMessage: family.welcomeMessage,
    heroSummary: family.heroSummary,
    householdMood: family.householdMood,
    timezone: family.timezone,
    memberCount: family.memberCount,
    createdByUserId: family.createdByUserId,
    createdAt: family.createdAt.toISOString(),
    updatedAt: family.updatedAt.toISOString(),
    customDomains: family.domains.map((domain) => domain.hostname),
    enabledModules: family.modules.map((module) => fromDbModuleKey(module.moduleKey)),
    accessPolicy: family.accessPolicy
      ? {
          entryMode: fromDbAccessEntryMode(family.accessPolicy.entryMode),
          sharedSecretHash: family.accessPolicy.sharedSecretHash,
          sessionDurationHours: family.accessPolicy.sessionDurationHours,
          allowGuestRead: family.accessPolicy.allowGuestRead,
          requireMemberProfile: family.accessPolicy.requireMemberProfile,
        }
      : null,
    theme: family.theme
      ? {
          brandName: family.theme.brandName,
          accentColor: family.theme.accentColor,
          warmColor: family.theme.warmColor,
          surfaceColor: family.theme.surfaceColor,
          highlightColor: family.theme.highlightColor,
        }
      : null,
    workspace: family.workspace
      ? {
          homePreset: fromDbHomePreset(family.workspace.homePreset),
          entryPreset: fromDbEntryPreset(family.workspace.entryPreset),
          updatedByUserId: family.workspace.updatedByUserId,
          updatedAt: family.workspace.updatedAt.toISOString(),
        }
      : null,
  };
}

async function selectRuntimeUserById(
  prisma: AuthRuntimePrismaClient,
  userId: string,
): Promise<RuntimePlatformAuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      memberships: {
        orderBy: [{ isPrimary: "desc" }, { joinedAt: "asc" }],
        select: {
          role: true,
          tenant: {
            select: {
              slug: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return user ? toRuntimePlatformAuthUser(user) : null;
}

async function selectRuntimeFamilyBySlug(
  prisma: AuthRuntimePrismaClient,
  familySlug: string,
): Promise<RuntimeFamilyGraphRecord | null> {
  const family = await prisma.familyTenant.findUnique({
    where: { slug: familySlug.trim().toLowerCase() },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      tagline: true,
      welcomeMessage: true,
      heroSummary: true,
      householdMood: true,
      timezone: true,
      memberCount: true,
      createdByUserId: true,
      createdAt: true,
      updatedAt: true,
      accessPolicy: {
        select: {
          entryMode: true,
          sharedSecretHash: true,
          sessionDurationHours: true,
          allowGuestRead: true,
          requireMemberProfile: true,
        },
      },
      theme: {
        select: {
          brandName: true,
          accentColor: true,
          warmColor: true,
          surfaceColor: true,
          highlightColor: true,
        },
      },
      domains: {
        orderBy: [{ isPrimary: "desc" }, { hostname: "asc" }],
        select: {
          hostname: true,
        },
      },
      modules: {
        where: { enabled: true },
        orderBy: { sortOrder: "asc" },
        select: {
          moduleKey: true,
        },
      },
      workspace: {
        select: {
          homePreset: true,
          entryPreset: true,
          updatedByUserId: true,
          updatedAt: true,
        },
      },
    },
  });

  return family ? toRuntimeFamilyGraphRecord(family) : null;
}

export interface AuthRuntimeService {
  findUserByEmailForAuth(email: string): Promise<RuntimePlatformAuthUser | null>;
  createLocalUser(input: {
    displayName: string;
    email: string;
    passwordHash: string;
  }): Promise<RuntimePlatformAuthUser>;
  createPlatformSessionForUser(input: {
    userId: string;
    now?: Date;
  }): Promise<PlatformUserSession>;
  resolvePlatformSession(
    sessionToken: string,
    now?: Date,
  ): Promise<PlatformUserSession | null>;
  deletePlatformSession(sessionToken: string): Promise<void>;
  listFamilyGraphs(): Promise<RuntimeFamilyGraphRecord[]>;
  findFamilyBySlug(familySlug: string): Promise<RuntimeFamilyGraphRecord | null>;
  listManagedFamiliesForUser(userId: string): Promise<RuntimeManagedFamilyRecord[]>;
  findMembershipForUserAndFamily(
    userId: string,
    familySlug: string,
  ): Promise<PlatformMembership["role"] | null>;
  createFamilyAccessSessionForFamily(input: {
    familySlug: string;
    userId?: string | null;
    viewerRole?: FamilyViewerRole;
    now?: Date;
  }): Promise<FamilyAccessSession>;
  resolveFamilyAccessSession(
    sessionToken: string,
    now?: Date,
  ): Promise<FamilyAccessSession | null>;
  deleteFamilyAccessSession(sessionToken: string): Promise<void>;
}

export function createAuthRuntimeService(
  prisma: AuthRuntimePrismaClient = getPrismaClient(),
): AuthRuntimeService {
  return {
    async findUserByEmailForAuth(email) {
      const user = await prisma.user.findUnique({
        where: { email: normalizeEmail(email) },
        select: {
          id: true,
          name: true,
          email: true,
          passwordHash: true,
          memberships: {
            orderBy: [{ isPrimary: "desc" }, { joinedAt: "asc" }],
            select: {
              role: true,
              tenant: {
                select: {
                  slug: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return user ? toRuntimePlatformAuthUser(user) : null;
    },
    async createLocalUser(input) {
      const normalizedEmail = normalizeEmail(input.email);
      const existing = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      });

      if (existing) {
        throw new Error("email-already-in-use");
      }

      const user = await prisma.user.create({
        data: {
          name: input.displayName.trim(),
          email: normalizedEmail,
          passwordHash: input.passwordHash,
          passwordSetAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          passwordHash: true,
          memberships: {
            orderBy: [{ isPrimary: "desc" }, { joinedAt: "asc" }],
            select: {
              role: true,
              tenant: {
                select: {
                  slug: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      const runtimeUser = toRuntimePlatformAuthUser(user);

      if (!runtimeUser) {
        throw new Error("created-user-missing-email");
      }

      return runtimeUser;
    },
    async createPlatformSessionForUser(input) {
      const runtimeUser = await selectRuntimeUserById(prisma, input.userId);

      if (!runtimeUser) {
        throw new Error(`User not found for session: ${input.userId}`);
      }

      const now = input.now ?? new Date();
      const expires = addHours(now, PLATFORM_SESSION_HOURS);
      const sessionToken = randomBytes(24).toString("base64url");

      await prisma.session.create({
        data: {
          sessionToken,
          userId: runtimeUser.id,
          expires,
        },
      });

      return createPlatformUserSession({
        userId: runtimeUser.id,
        displayName: runtimeUser.displayName,
        email: runtimeUser.email,
        memberships: runtimeUser.memberships,
        sessionToken,
        source: "database",
        expiresAt: expires,
        now,
      });
    },
    async resolvePlatformSession(sessionToken, now = new Date()) {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        select: {
          sessionToken: true,
          expires: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              passwordHash: true,
              memberships: {
                orderBy: [{ isPrimary: "desc" }, { joinedAt: "asc" }],
                select: {
                  role: true,
                  tenant: {
                    select: {
                      slug: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!session || session.expires.getTime() <= now.getTime()) {
        return null;
      }

      const runtimeUser = toRuntimePlatformAuthUser(session.user);

      if (!runtimeUser) {
        return null;
      }

      return createPlatformUserSession({
        userId: runtimeUser.id,
        displayName: runtimeUser.displayName,
        email: runtimeUser.email,
        memberships: runtimeUser.memberships,
        sessionToken: session.sessionToken,
        source: "database",
        expiresAt: session.expires,
        now,
      });
    },
    async deletePlatformSession(sessionToken) {
      await prisma.session.deleteMany({
        where: { sessionToken },
      });
    },
    async listFamilyGraphs() {
      const families = await prisma.familyTenant.findMany({
        orderBy: [{ createdAt: "asc" }, { slug: "asc" }],
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          tagline: true,
          welcomeMessage: true,
          heroSummary: true,
          householdMood: true,
          timezone: true,
          memberCount: true,
          createdByUserId: true,
          createdAt: true,
          updatedAt: true,
          accessPolicy: {
            select: {
              entryMode: true,
              sharedSecretHash: true,
              sessionDurationHours: true,
              allowGuestRead: true,
              requireMemberProfile: true,
            },
          },
          theme: {
            select: {
              brandName: true,
              accentColor: true,
              warmColor: true,
              surfaceColor: true,
              highlightColor: true,
            },
          },
          domains: {
            orderBy: [{ isPrimary: "desc" }, { hostname: "asc" }],
            select: {
              hostname: true,
            },
          },
          modules: {
            where: { enabled: true },
            orderBy: { sortOrder: "asc" },
            select: {
              moduleKey: true,
            },
          },
          workspace: {
            select: {
              homePreset: true,
              entryPreset: true,
              updatedByUserId: true,
              updatedAt: true,
            },
          },
        },
      });

      return families.map((family) => toRuntimeFamilyGraphRecord(family));
    },
    async findFamilyBySlug(familySlug) {
      return selectRuntimeFamilyBySlug(prisma, familySlug);
    },
    async listManagedFamiliesForUser(userId) {
      const memberships = await prisma.membership.findMany({
        where: {
          userId,
          role: {
            in: [TenantRole.OWNER, TenantRole.ADMIN],
          },
        },
        orderBy: [{ joinedAt: "asc" }],
        select: {
          role: true,
          tenant: {
            select: {
              id: true,
              slug: true,
              name: true,
              description: true,
              tagline: true,
              welcomeMessage: true,
              heroSummary: true,
              householdMood: true,
              timezone: true,
              memberCount: true,
              createdByUserId: true,
              createdAt: true,
              updatedAt: true,
              accessPolicy: {
                select: {
                  entryMode: true,
                  sharedSecretHash: true,
                  sessionDurationHours: true,
                  allowGuestRead: true,
                  requireMemberProfile: true,
                },
              },
              theme: {
                select: {
                  brandName: true,
                  accentColor: true,
                  warmColor: true,
                  surfaceColor: true,
                  highlightColor: true,
                },
              },
              domains: {
                orderBy: [{ isPrimary: "desc" }, { hostname: "asc" }],
                select: {
                  hostname: true,
                },
              },
              modules: {
                where: { enabled: true },
                orderBy: { sortOrder: "asc" },
                select: {
                  moduleKey: true,
                },
              },
              workspace: {
                select: {
                  homePreset: true,
                  entryPreset: true,
                  updatedByUserId: true,
                  updatedAt: true,
                },
              },
            },
          },
        },
      });

      return memberships.map((membership) => ({
        family: toRuntimeFamilyGraphRecord(membership.tenant),
        role: fromDbTenantRole(membership.role) as RuntimeManagedFamilyRecord["role"],
        canManage: true,
      }));
    },
    async findMembershipForUserAndFamily(userId, familySlug) {
      const membership = await prisma.membership.findFirst({
        where: {
          userId,
          tenant: {
            slug: familySlug.trim().toLowerCase(),
          },
        },
        select: {
          role: true,
        },
      });

      return membership ? fromDbTenantRole(membership.role) : null;
    },
    async createFamilyAccessSessionForFamily(input) {
      const family = await prisma.familyTenant.findUnique({
        where: { slug: input.familySlug.trim().toLowerCase() },
        select: {
          id: true,
          slug: true,
          accessPolicy: {
            select: {
              entryMode: true,
              sessionDurationHours: true,
            },
          },
        },
      });

      if (!family) {
        throw new Error(`Family tenant not found for slug: ${input.familySlug}`);
      }

      const now = input.now ?? new Date();
      const sessionToken = randomBytes(24).toString("base64url");
      const expiresAt = addHours(
        now,
        family.accessPolicy?.sessionDurationHours ?? DEFAULT_FAMILY_SESSION_HOURS,
      );
      const viewerRole = input.viewerRole ?? "guest";

      await prisma.familyAccessSession.create({
        data: {
          sessionToken,
          tenantId: family.id,
          userId: input.userId ?? null,
          viewerRole: toDbViewerRole(viewerRole),
          entryMode: family.accessPolicy?.entryMode ?? AccessEntryMode.PASSWORD,
          expiresAt,
          lastVerifiedAt: now,
        },
      });

      return createFamilyAccessSession({
        familySlug: family.slug,
        tenantId: family.id,
        viewerRole,
        sessionToken,
        userId: input.userId ?? null,
        source: "database",
        expiresAt,
        now,
      });
    },
    async resolveFamilyAccessSession(sessionToken, now = new Date()) {
      const session = await prisma.familyAccessSession.findUnique({
        where: { sessionToken },
        select: {
          sessionToken: true,
          userId: true,
          viewerRole: true,
          expiresAt: true,
          createdAt: true,
          tenant: {
            select: {
              id: true,
              slug: true,
            },
          },
        },
      });

      if (!session || session.expiresAt.getTime() <= now.getTime()) {
        return null;
      }

      return createFamilyAccessSession({
        familySlug: session.tenant.slug,
        tenantId: session.tenant.id,
        viewerRole: fromDbViewerRole(session.viewerRole),
        sessionToken: session.sessionToken,
        userId: session.userId,
        source: "database",
        expiresAt: session.expiresAt,
        now: session.createdAt,
      });
    },
    async deleteFamilyAccessSession(sessionToken) {
      await prisma.familyAccessSession.deleteMany({
        where: { sessionToken },
      });
    },
  };
}
