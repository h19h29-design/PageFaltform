import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createPlatformUserSession,
  normalizeEmail,
  type PlatformAccountRole,
  type PlatformMembership,
  type PlatformUserSession,
} from "@ysplan/auth";

const localPlatformAuthStorePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../data/local-platform-auth.json",
);

interface LocalPlatformAuthStore {
  version: 1;
  metadata: {
    backend: "file";
    lastWriteAt: string | null;
  };
  users: LocalPlatformUserRecord[];
}

export interface LocalPlatformUserRecord {
  id: string;
  displayName: string;
  email: string;
  passwordHash: string;
  platformRole: PlatformAccountRole;
  memberships: PlatformMembership[];
  approvedToFullMemberAt: string | null;
  approvedToFullMemberByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

function createEmptyLocalPlatformAuthStore(): LocalPlatformAuthStore {
  return {
    version: 1,
    metadata: {
      backend: "file",
      lastWriteAt: null,
    },
    users: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sanitizePlatformRole(value: unknown): PlatformAccountRole {
  if (value === "master" || value === "full-member") {
    return value;
  }

  return "associate-member";
}

function sanitizeMembership(value: unknown): PlatformMembership | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.familySlug !== "string" ||
    typeof value.familyName !== "string" ||
    typeof value.role !== "string"
  ) {
    return null;
  }

  if (
    value.role !== "member" &&
    value.role !== "child" &&
    value.role !== "owner" &&
    value.role !== "admin"
  ) {
    return null;
  }

  return {
    familySlug: value.familySlug.trim().toLowerCase(),
    familyName: value.familyName.trim(),
    role: value.role,
  };
}

function sanitizeMemberships(value: unknown): PlatformMembership[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((membership) => sanitizeMembership(membership))
    .filter((membership): membership is PlatformMembership => Boolean(membership));
}

function sanitizeLocalPlatformUserRecord(
  value: unknown,
): LocalPlatformUserRecord | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.displayName !== "string" ||
    typeof value.email !== "string" ||
    typeof value.passwordHash !== "string" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    displayName: value.displayName.trim(),
    email: normalizeEmail(value.email),
    passwordHash: value.passwordHash,
    platformRole: sanitizePlatformRole(value.platformRole),
    memberships: sanitizeMemberships(value.memberships),
    approvedToFullMemberAt:
      typeof value.approvedToFullMemberAt === "string" ? value.approvedToFullMemberAt : null,
    approvedToFullMemberByUserId:
      typeof value.approvedToFullMemberByUserId === "string"
        ? value.approvedToFullMemberByUserId
        : null,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

function cloneUserRecord(
  user: LocalPlatformUserRecord,
): LocalPlatformUserRecord {
  return {
    ...user,
    platformRole: user.platformRole,
    memberships: user.memberships.map((membership) => ({ ...membership })),
    approvedToFullMemberAt: user.approvedToFullMemberAt,
    approvedToFullMemberByUserId: user.approvedToFullMemberByUserId,
  };
}

async function ensureLocalPlatformAuthStore(): Promise<void> {
  await mkdir(path.dirname(localPlatformAuthStorePath), { recursive: true });

  try {
    await readFile(localPlatformAuthStorePath, "utf8");
  } catch {
    await writeFile(
      localPlatformAuthStorePath,
      `${JSON.stringify(createEmptyLocalPlatformAuthStore(), null, 2)}\n`,
      "utf8",
    );
  }
}

async function readLocalPlatformAuthStore(): Promise<LocalPlatformAuthStore> {
  await ensureLocalPlatformAuthStore();

  try {
    const raw = await readFile(localPlatformAuthStorePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;

    if (!isRecord(parsed)) {
      return createEmptyLocalPlatformAuthStore();
    }

    return {
      version: 1,
      metadata: {
        backend: "file",
        lastWriteAt:
          isRecord(parsed.metadata) && typeof parsed.metadata.lastWriteAt === "string"
            ? parsed.metadata.lastWriteAt
            : null,
      },
      users: Array.isArray(parsed.users)
        ? parsed.users
            .map((user) => sanitizeLocalPlatformUserRecord(user))
            .filter((user): user is LocalPlatformUserRecord => Boolean(user))
        : [],
    };
  } catch {
    return createEmptyLocalPlatformAuthStore();
  }
}

async function writeLocalPlatformAuthStore(
  store: LocalPlatformAuthStore,
): Promise<void> {
  const nextStore: LocalPlatformAuthStore = {
    version: 1,
    metadata: {
      backend: "file",
      lastWriteAt: new Date().toISOString(),
    },
    users: store.users.map((user) => cloneUserRecord(user)),
  };

  await mkdir(path.dirname(localPlatformAuthStorePath), { recursive: true });
  await writeFile(
    localPlatformAuthStorePath,
    `${JSON.stringify(nextStore, null, 2)}\n`,
    "utf8",
  );
}

export async function findLocalPlatformUserByEmail(
  email: string,
): Promise<LocalPlatformUserRecord | null> {
  const store = await readLocalPlatformAuthStore();
  const normalizedEmail = normalizeEmail(email);
  const user =
    store.users.find((candidate) => candidate.email === normalizedEmail) ?? null;

  return user ? cloneUserRecord(user) : null;
}

export async function findLocalPlatformUserById(
  userId: string,
): Promise<LocalPlatformUserRecord | null> {
  const store = await readLocalPlatformAuthStore();
  const user = store.users.find((candidate) => candidate.id === userId) ?? null;

  return user ? cloneUserRecord(user) : null;
}

export async function listLocalPlatformUsers(): Promise<LocalPlatformUserRecord[]> {
  const store = await readLocalPlatformAuthStore();
  return store.users.map((user) => cloneUserRecord(user));
}

export async function createLocalPlatformUserRecord(input: {
  displayName: string;
  email: string;
  passwordHash: string;
  platformRole?: PlatformAccountRole;
  memberships?: PlatformMembership[];
}): Promise<LocalPlatformUserRecord> {
  const store = await readLocalPlatformAuthStore();
  const normalizedEmail = normalizeEmail(input.email);

  if (store.users.some((candidate) => candidate.email === normalizedEmail)) {
    throw new Error("email-already-in-use");
  }

  const now = new Date().toISOString();
  const nextUser: LocalPlatformUserRecord = {
    id: `local-user-${randomUUID()}`,
    displayName: input.displayName.trim(),
    email: normalizedEmail,
    passwordHash: input.passwordHash,
    platformRole: input.platformRole ?? "associate-member",
    memberships: (input.memberships ?? []).map((membership) => ({ ...membership })),
    approvedToFullMemberAt: null,
    approvedToFullMemberByUserId: null,
    createdAt: now,
    updatedAt: now,
  };

  store.users.push(nextUser);
  await writeLocalPlatformAuthStore(store);

  return cloneUserRecord(nextUser);
}

export async function setLocalPlatformUserRole(input: {
  userId: string;
  platformRole: PlatformAccountRole;
  approvedByUserId?: string | null;
}): Promise<LocalPlatformUserRecord> {
  const store = await readLocalPlatformAuthStore();
  const user = store.users.find((candidate) => candidate.id === input.userId);

  if (!user) {
    throw new Error("user-not-found");
  }

  const now = new Date().toISOString();
  user.platformRole = input.platformRole;
  user.updatedAt = now;

  if (input.platformRole === "full-member") {
    user.approvedToFullMemberAt = now;
    user.approvedToFullMemberByUserId = input.approvedByUserId ?? null;
  }

  await writeLocalPlatformAuthStore(store);
  return cloneUserRecord(user);
}

export async function grantLocalPlatformMembership(input: {
  userId: string;
  membership: PlatformMembership;
}): Promise<LocalPlatformUserRecord> {
  const store = await readLocalPlatformAuthStore();
  const user = store.users.find((candidate) => candidate.id === input.userId);

  if (!user) {
    throw new Error("user-not-found");
  }

  const existingMembershipIndex = user.memberships.findIndex(
    (membership) => membership.familySlug === input.membership.familySlug,
  );

  if (existingMembershipIndex >= 0) {
    user.memberships[existingMembershipIndex] = { ...input.membership };
  } else {
    user.memberships.push({ ...input.membership });
  }

  user.updatedAt = new Date().toISOString();
  await writeLocalPlatformAuthStore(store);

  return cloneUserRecord(user);
}

export function createLocalPlatformSession(
  user: LocalPlatformUserRecord,
): PlatformUserSession {
  return createPlatformUserSession({
    userId: user.id,
    displayName: user.displayName,
    email: user.email,
    platformRole: user.platformRole,
    memberships: user.memberships.map((membership) => ({ ...membership })),
  });
}
