import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createPlatformUserSession,
  normalizeEmail,
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
  memberships: PlatformMembership[];
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
    memberships: sanitizeMemberships(value.memberships),
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

function cloneUserRecord(
  user: LocalPlatformUserRecord,
): LocalPlatformUserRecord {
  return {
    ...user,
    memberships: user.memberships.map((membership) => ({ ...membership })),
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

export async function createLocalPlatformUserRecord(input: {
  displayName: string;
  email: string;
  passwordHash: string;
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
    memberships: (input.memberships ?? []).map((membership) => ({ ...membership })),
    createdAt: now,
    updatedAt: now,
  };

  store.users.push(nextUser);
  await writeLocalPlatformAuthStore(store);

  return cloneUserRecord(nextUser);
}

export function createLocalPlatformSession(
  user: LocalPlatformUserRecord,
): PlatformUserSession {
  return createPlatformUserSession({
    userId: user.id,
    displayName: user.displayName,
    email: user.email,
    memberships: user.memberships.map((membership) => ({ ...membership })),
  });
}

