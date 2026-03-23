import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { PlatformAccountRole, PlatformMembership } from "@ysplan/auth";

import { grantLocalPlatformMembership } from "./local-platform-auth";

const familyJoinRequestStorePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../data/family-join-requests.json",
);

export type FamilyJoinRequestStatus = "pending" | "approved" | "rejected";

interface FamilyJoinRequestStore {
  version: 1;
  metadata: {
    backend: "file";
    lastWriteAt: string | null;
  };
  requests: StoredFamilyJoinRequest[];
}

export interface StoredFamilyJoinRequest {
  id: string;
  familySlug: string;
  familyName: string;
  requesterUserId: string;
  requesterDisplayName: string;
  requesterEmail: string;
  requesterPlatformRole: PlatformAccountRole;
  status: FamilyJoinRequestStatus;
  requestedAt: string;
  decidedAt: string | null;
  decidedByUserId: string | null;
}

function createEmptyStore(): FamilyJoinRequestStore {
  return {
    version: 1,
    metadata: {
      backend: "file",
      lastWriteAt: null,
    },
    requests: [],
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

function sanitizeStatus(value: unknown): FamilyJoinRequestStatus {
  if (value === "approved" || value === "rejected") {
    return value;
  }

  return "pending";
}

function sanitizeRequest(value: unknown): StoredFamilyJoinRequest | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.familySlug !== "string" ||
    typeof value.familyName !== "string" ||
    typeof value.requesterUserId !== "string" ||
    typeof value.requesterDisplayName !== "string" ||
    typeof value.requesterEmail !== "string" ||
    typeof value.requestedAt !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    familySlug: value.familySlug.trim().toLowerCase(),
    familyName: value.familyName.trim(),
    requesterUserId: value.requesterUserId,
    requesterDisplayName: value.requesterDisplayName.trim(),
    requesterEmail: value.requesterEmail.trim().toLowerCase(),
    requesterPlatformRole: sanitizePlatformRole(value.requesterPlatformRole),
    status: sanitizeStatus(value.status),
    requestedAt: value.requestedAt,
    decidedAt: typeof value.decidedAt === "string" ? value.decidedAt : null,
    decidedByUserId:
      typeof value.decidedByUserId === "string" ? value.decidedByUserId : null,
  };
}

function cloneRequest(request: StoredFamilyJoinRequest): StoredFamilyJoinRequest {
  return { ...request };
}

async function ensureStore(): Promise<void> {
  await mkdir(path.dirname(familyJoinRequestStorePath), { recursive: true });

  try {
    await readFile(familyJoinRequestStorePath, "utf8");
  } catch {
    await writeFile(
      familyJoinRequestStorePath,
      `${JSON.stringify(createEmptyStore(), null, 2)}\n`,
      "utf8",
    );
  }
}

async function readStore(): Promise<FamilyJoinRequestStore> {
  await ensureStore();

  try {
    const raw = await readFile(familyJoinRequestStorePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;

    if (!isRecord(parsed)) {
      return createEmptyStore();
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
      requests: Array.isArray(parsed.requests)
        ? parsed.requests
            .map((request) => sanitizeRequest(request))
            .filter((request): request is StoredFamilyJoinRequest => Boolean(request))
        : [],
    };
  } catch {
    return createEmptyStore();
  }
}

async function writeStore(store: FamilyJoinRequestStore): Promise<void> {
  const nextStore: FamilyJoinRequestStore = {
    version: 1,
    metadata: {
      backend: "file",
      lastWriteAt: new Date().toISOString(),
    },
    requests: store.requests.map((request) => cloneRequest(request)),
  };

  await mkdir(path.dirname(familyJoinRequestStorePath), { recursive: true });
  await writeFile(
    familyJoinRequestStorePath,
    `${JSON.stringify(nextStore, null, 2)}\n`,
    "utf8",
  );
}

export async function listFamilyJoinRequestsForFamily(
  familySlug: string,
): Promise<StoredFamilyJoinRequest[]> {
  const store = await readStore();
  const normalizedSlug = familySlug.trim().toLowerCase();

  return store.requests
    .filter((request) => request.familySlug === normalizedSlug)
    .sort((left, right) => right.requestedAt.localeCompare(left.requestedAt))
    .map((request) => cloneRequest(request));
}

export async function getLatestFamilyJoinRequestForUser(input: {
  familySlug: string;
  userId: string;
}): Promise<StoredFamilyJoinRequest | null> {
  const requests = await listFamilyJoinRequestsForFamily(input.familySlug);

  return (
    requests.find((request) => request.requesterUserId === input.userId) ?? null
  );
}

export async function createFamilyJoinRequest(input: {
  familySlug: string;
  familyName: string;
  requesterUserId: string;
  requesterDisplayName: string;
  requesterEmail: string;
  requesterPlatformRole: PlatformAccountRole;
}): Promise<StoredFamilyJoinRequest> {
  const store = await readStore();
  const normalizedSlug = input.familySlug.trim().toLowerCase();
  const existingPending = store.requests.find(
    (request) =>
      request.familySlug === normalizedSlug &&
      request.requesterUserId === input.requesterUserId &&
      request.status === "pending",
  );

  if (existingPending) {
    return cloneRequest(existingPending);
  }

  const now = new Date().toISOString();
  const nextRequest: StoredFamilyJoinRequest = {
    id: `join-${randomUUID()}`,
    familySlug: normalizedSlug,
    familyName: input.familyName.trim(),
    requesterUserId: input.requesterUserId,
    requesterDisplayName: input.requesterDisplayName.trim(),
    requesterEmail: input.requesterEmail.trim().toLowerCase(),
    requesterPlatformRole: input.requesterPlatformRole,
    status: "pending",
    requestedAt: now,
    decidedAt: null,
    decidedByUserId: null,
  };

  store.requests.push(nextRequest);
  await writeStore(store);

  return cloneRequest(nextRequest);
}

export async function approveFamilyJoinRequest(input: {
  requestId: string;
  decidedByUserId: string;
}): Promise<StoredFamilyJoinRequest> {
  const store = await readStore();
  const request = store.requests.find((candidate) => candidate.id === input.requestId);

  if (!request) {
    throw new Error("request-not-found");
  }

  request.status = "approved";
  request.decidedAt = new Date().toISOString();
  request.decidedByUserId = input.decidedByUserId;

  await grantLocalPlatformMembership({
    userId: request.requesterUserId,
    membership: {
      familySlug: request.familySlug,
      familyName: request.familyName,
      role: "member",
    } satisfies PlatformMembership,
  });

  await writeStore(store);
  return cloneRequest(request);
}

export async function rejectFamilyJoinRequest(input: {
  requestId: string;
  decidedByUserId: string;
}): Promise<StoredFamilyJoinRequest> {
  const store = await readStore();
  const request = store.requests.find((candidate) => candidate.id === input.requestId);

  if (!request) {
    throw new Error("request-not-found");
  }

  request.status = "rejected";
  request.decidedAt = new Date().toISOString();
  request.decidedByUserId = input.decidedByUserId;

  await writeStore(store);
  return cloneRequest(request);
}
