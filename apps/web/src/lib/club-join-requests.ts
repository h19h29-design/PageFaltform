import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { PlatformAccountRole } from "@ysplan/auth";

import { addApprovedClubMember } from "./club-sites-store";
import { resolveRuntimeClubFromSlug } from "./club-sites-store";

export type ClubJoinRequestStatus = "pending" | "approved" | "rejected";

export interface StoredClubJoinRequest {
  id: string;
  clubSlug: string;
  clubName: string;
  requesterUserId: string;
  requesterDisplayName: string;
  requesterEmail: string;
  requesterPlatformRole: PlatformAccountRole;
  introMessage: string;
  status: ClubJoinRequestStatus;
  requestedAt: string;
  decidedAt: string | null;
  decidedByUserId: string | null;
}

interface ClubJoinRequestStore {
  version: 1;
  metadata: {
    backend: "file";
    lastWriteAt: string | null;
  };
  requests: StoredClubJoinRequest[];
}

const clubJoinRequestStorePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../data/club-join-requests.json",
);

function createEmptyStore(): ClubJoinRequestStore {
  return {
    version: 1,
    metadata: {
      backend: "file",
      lastWriteAt: null,
    },
    requests: [],
  };
}

function cloneRequest(request: StoredClubJoinRequest): StoredClubJoinRequest {
  return { ...request };
}

async function ensureStore(): Promise<void> {
  await mkdir(path.dirname(clubJoinRequestStorePath), { recursive: true });

  try {
    await readFile(clubJoinRequestStorePath, "utf8");
  } catch {
    await writeFile(
      clubJoinRequestStorePath,
      `${JSON.stringify(createEmptyStore(), null, 2)}\n`,
      "utf8",
    );
  }
}

async function readStore(): Promise<ClubJoinRequestStore> {
  await ensureStore();

  try {
    const raw = await readFile(clubJoinRequestStorePath, "utf8");
    const parsed = JSON.parse(raw) as ClubJoinRequestStore;
    return {
      version: 1,
      metadata: {
        backend: "file",
        lastWriteAt: parsed.metadata?.lastWriteAt ?? null,
      },
      requests: Array.isArray(parsed.requests)
        ? parsed.requests.map((request) => cloneRequest(request))
        : [],
    };
  } catch {
    return createEmptyStore();
  }
}

async function writeStore(store: ClubJoinRequestStore): Promise<void> {
  const nextStore: ClubJoinRequestStore = {
    version: 1,
    metadata: {
      backend: "file",
      lastWriteAt: new Date().toISOString(),
    },
    requests: store.requests.map((request) => cloneRequest(request)),
  };

  await mkdir(path.dirname(clubJoinRequestStorePath), { recursive: true });
  await writeFile(
    clubJoinRequestStorePath,
    `${JSON.stringify(nextStore, null, 2)}\n`,
    "utf8",
  );
}

export async function listClubJoinRequestsForClub(
  clubSlug: string,
): Promise<StoredClubJoinRequest[]> {
  const store = await readStore();
  return store.requests
    .filter((request) => request.clubSlug === clubSlug)
    .sort((left, right) => right.requestedAt.localeCompare(left.requestedAt))
    .map((request) => cloneRequest(request));
}

export async function getLatestClubJoinRequestForUser(input: {
  clubSlug: string;
  userId: string;
}): Promise<StoredClubJoinRequest | null> {
  const requests = await listClubJoinRequestsForClub(input.clubSlug);
  return requests.find((request) => request.requesterUserId === input.userId) ?? null;
}

export async function createClubJoinRequest(input: {
  clubSlug: string;
  clubName: string;
  requesterUserId: string;
  requesterDisplayName: string;
  requesterEmail: string;
  requesterPlatformRole: PlatformAccountRole;
  introMessage: string;
}): Promise<StoredClubJoinRequest> {
  const club = await resolveRuntimeClubFromSlug(input.clubSlug);

  if (!club) {
    throw new Error("club-not-found");
  }

  if (club.members.some((member) => member.userId === input.requesterUserId)) {
    throw new Error("already-member");
  }

  const store = await readStore();
  const existingPending = store.requests.find(
    (request) =>
      request.clubSlug === input.clubSlug &&
      request.requesterUserId === input.requesterUserId &&
      request.status === "pending",
  );

  if (existingPending) {
    return cloneRequest(existingPending);
  }

  const now = new Date().toISOString();
  const request: StoredClubJoinRequest = {
    id: `club-join-${randomUUID()}`,
    clubSlug: input.clubSlug,
    clubName: input.clubName,
    requesterUserId: input.requesterUserId,
    requesterDisplayName: input.requesterDisplayName,
    requesterEmail: input.requesterEmail.toLowerCase(),
    requesterPlatformRole: input.requesterPlatformRole,
    introMessage: input.introMessage.trim(),
    status: "pending",
    requestedAt: now,
    decidedAt: null,
    decidedByUserId: null,
  };

  store.requests.push(request);
  await writeStore(store);
  return cloneRequest(request);
}

export async function approveClubJoinRequest(input: {
  requestId: string;
  decidedByUserId: string;
}): Promise<StoredClubJoinRequest> {
  const store = await readStore();
  const request = store.requests.find((candidate) => candidate.id === input.requestId);

  if (!request) {
    throw new Error("request-not-found");
  }

  request.status = "approved";
  request.decidedAt = new Date().toISOString();
  request.decidedByUserId = input.decidedByUserId;

  await addApprovedClubMember({
    clubSlug: request.clubSlug,
    userId: request.requesterUserId,
    displayName: request.requesterDisplayName,
    email: request.requesterEmail,
  });

  await writeStore(store);
  return cloneRequest(request);
}

export async function rejectClubJoinRequest(input: {
  requestId: string;
  decidedByUserId: string;
}): Promise<StoredClubJoinRequest> {
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
