import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { PlatformAccountRole, PlatformUserSession } from "@ysplan/auth";
import type { FamilyThemePreset } from "@ysplan/platform";

import { getSharedThemePreset } from "./shared-themes";

export type ClubVisibility = "public" | "private";
export type ClubJoinPolicy = "approval-required" | "invite-first";
export type ClubMemberRole = "owner" | "manager" | "member";

export interface ClubSectionPreview {
  key: string;
  title: string;
  description: string;
  audience: "public" | "member";
}

export interface ClubMemberRecord {
  userId: string;
  displayName: string;
  email: string;
  role: ClubMemberRole;
  joinedAt: string;
}

export interface RuntimeClubRecord {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  sportLabel: string;
  category: string;
  location: string;
  currentFocus: string;
  nextEventLabel: string;
  visibility: ClubVisibility;
  joinPolicy: ClubJoinPolicy;
  themePreset: FamilyThemePreset;
  ownerUserId?: string;
  ownerName: string;
  ownerEmail?: string;
  enabledModules: string[];
  sampleModules: string[];
  sections: ClubSectionPreview[];
  highlights: Array<{ label: string; value: string }>;
  members: ClubMemberRecord[];
  source: "demo" | "custom";
  createdAt: string;
  updatedAt: string;
}

export interface ClubPublicPreview
  extends Pick<
    RuntimeClubRecord,
    | "id"
    | "slug"
    | "name"
    | "tagline"
    | "description"
    | "sportLabel"
    | "category"
    | "location"
    | "currentFocus"
    | "nextEventLabel"
    | "visibility"
    | "joinPolicy"
    | "themePreset"
    | "ownerName"
    | "sampleModules"
    | "sections"
    | "highlights"
    | "source"
  > {
  accessLabel: string;
  memberCount: number;
}

export interface ConsoleClubAccessRecord {
  club: RuntimeClubRecord;
  role: string;
  canManage: boolean;
}

export interface ClubViewerAccess {
  club: RuntimeClubRecord;
  member: ClubMemberRecord | null;
  roleLabel: string | null;
  hasAccess: boolean;
  canManage: boolean;
}

function canCreateClubSites(session?: PlatformUserSession | null): boolean {
  return Boolean(
    session && (session.platformRole === "master" || session.platformRole === "full-member"),
  );
}

interface StoredCustomClub extends Omit<RuntimeClubRecord, "source"> {
  ownerUserId: string;
}

interface ClubSiteStore {
  version: 1;
  metadata: {
    backend: "file";
    lastWriteAt: string | null;
  };
  customClubs: StoredCustomClub[];
}

type ClubModuleKey =
  | "announcements"
  | "events"
  | "gallery"
  | "leaderboard"
  | "faq"
  | "resources";

export const clubModuleCatalog: Array<{
  key: ClubModuleKey;
  label: string;
  description: string;
}> = [
  {
    key: "announcements",
    label: "공지",
    description: "모임 공지, 준비물, 장소 변경을 빠르게 공유합니다.",
  },
  {
    key: "events",
    label: "이벤트",
    description: "정기 모임, 번개 일정, 출석 흐름을 한눈에 보여줍니다.",
  },
  {
    key: "gallery",
    label: "갤러리",
    description: "활동 사진과 기록 이미지를 모아 보여줍니다.",
  },
  {
    key: "leaderboard",
    label: "리더보드",
    description: "활동 기록이나 챌린지 순위를 공개합니다.",
  },
  {
    key: "faq",
    label: "FAQ",
    description: "가입 전 자주 묻는 질문과 준비 가이드를 정리합니다.",
  },
  {
    key: "resources",
    label: "자료실",
    description: "훈련 노트, 체크리스트, 운영 문서를 묶어 둡니다.",
  },
];

const clubSiteStorePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../data/club-sites.json",
);

const defaultEnabledClubModules = clubModuleCatalog.slice(0, 4).map((module) => module.key);

const sampleClubs: RuntimeClubRecord[] = [
  {
    id: "club-bpage-run",
    slug: "bpage-running-crew",
    name: "B-page 러닝 크루",
    tagline: "주중 러닝 일정과 활동 기록을 가볍게 이어 보는 달리기 모임",
    description:
      "초보부터 꾸준히 뛰는 멤버까지 함께 달리는 러닝 크루입니다. 공지, 일정, 활동 사진, 월간 챌린지 순위를 한 화면에서 정리합니다.",
    sportLabel: "러닝",
    category: "러닝",
    location: "서울 여의도",
    currentFocus: "4월 10km 완주 챌린지",
    nextEventLabel: "목요일 20:00 여의나루 5km",
    visibility: "public",
    joinPolicy: "approval-required",
    themePreset: "ocean-depths",
    ownerName: "민호 캡틴",
    ownerEmail: "captain-running@b-page.local",
    enabledModules: ["announcements", "events", "gallery", "leaderboard", "faq"],
    sampleModules: ["공지", "이벤트", "갤러리", "리더보드", "FAQ"],
    sections: [
      {
        key: "announcement",
        title: "이번 주 공지",
        description: "집결 장소, 우천 시 대체 동선, 준비물을 공지합니다.",
        audience: "public",
      },
      {
        key: "event",
        title: "다음 러닝 일정",
        description: "이번 주 러닝 스케줄과 페이스 그룹 안내를 보여줍니다.",
        audience: "public",
      },
      {
        key: "leaderboard",
        title: "월간 챌린지",
        description: "활동 기록을 올린 멤버 순위를 멤버 전용으로 노출합니다.",
        audience: "member",
      },
    ],
    highlights: [
      { label: "다음 모임", value: "목요일 20:00" },
      { label: "이번 달 누적", value: "624km" },
      { label: "가입 방식", value: "로그인 후 승인" },
    ],
    members: [
      {
        userId: "demo-club-owner-running",
        displayName: "민호 캡틴",
        email: "captain-running@b-page.local",
        role: "owner",
        joinedAt: "2026-03-01T09:00:00.000Z",
      },
    ],
    source: "demo",
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-30T20:00:00.000Z",
  },
  {
    id: "club-sunrise-swim",
    slug: "sunrise-swim-lab",
    name: "선라이즈 스윔 랩",
    tagline: "훈련 노트와 출석 흐름을 차분하게 관리하는 수영 커뮤니티",
    description:
      "새벽 수영을 꾸준히 이어 가는 멤버들을 위한 모임입니다. 훈련 노트, 출석, 활동 사진, 준비 체크를 함께 운영합니다.",
    sportLabel: "수영",
    category: "수영",
    location: "서울 잠실",
    currentFocus: "자유형 호흡 교정 주간",
    nextEventLabel: "토요일 08:00 인터벌 세션",
    visibility: "public",
    joinPolicy: "approval-required",
    themePreset: "arctic-frost",
    ownerName: "세연 코치",
    ownerEmail: "coach-swim@b-page.local",
    enabledModules: ["announcements", "events", "resources", "gallery", "faq"],
    sampleModules: ["공지", "이벤트", "자료실", "갤러리", "FAQ"],
    sections: [
      {
        key: "training",
        title: "이번 주 훈련 포인트",
        description: "이번 주 훈련 목표와 체크 포인트를 먼저 보여 줍니다.",
        audience: "public",
      },
      {
        key: "attendance",
        title: "출석과 기록",
        description: "개인 기록과 출석 로그는 멤버에게만 노출합니다.",
        audience: "member",
      },
    ],
    highlights: [
      { label: "이번 주 세션", value: "총 8회" },
      { label: "공유 자료", value: "훈련 노트 업데이트" },
      { label: "가입 방식", value: "로그인 후 승인" },
    ],
    members: [
      {
        userId: "demo-club-owner-swim",
        displayName: "세연 코치",
        email: "coach-swim@b-page.local",
        role: "owner",
        joinedAt: "2026-02-24T06:30:00.000Z",
      },
    ],
    source: "demo",
    createdAt: "2026-02-24T06:30:00.000Z",
    updatedAt: "2026-03-30T06:30:00.000Z",
  },
  {
    id: "club-night-photo",
    slug: "night-photo-room",
    name: "나이트 포토 룸",
    tagline: "출사 일정과 결과물을 정갈하게 정리하는 사진 모임",
    description:
      "야간 출사를 중심으로 움직이는 사진 모임입니다. 비공개 운영이며, 승인된 멤버만 결과물 큐레이션과 일정 보드를 볼 수 있습니다.",
    sportLabel: "사진",
    category: "사진",
    location: "서울 을지로",
    currentFocus: "야간 골목 스트리트 컷 큐레이션",
    nextEventLabel: "금요일 21:00 을지로 야간 출사",
    visibility: "private",
    joinPolicy: "invite-first",
    themePreset: "midnight-galaxy",
    ownerName: "하린 디렉터",
    ownerEmail: "director-photo@b-page.local",
    enabledModules: ["announcements", "events", "gallery", "faq"],
    sampleModules: ["공지", "이벤트", "갤러리", "FAQ"],
    sections: [
      {
        key: "curation",
        title: "이번 출사 큐레이션",
        description: "선별된 결과물과 멘트를 멤버 전용으로 관리합니다.",
        audience: "member",
      },
      {
        key: "schedule",
        title: "다음 출사 일정",
        description: "시간, 장소, 준비 장비를 일정표 형태로 정리합니다.",
        audience: "public",
      },
    ],
    highlights: [
      { label: "공개 범위", value: "비공개 클럽" },
      { label: "입장 방식", value: "초대 중심" },
      { label: "운영 특징", value: "결과물 큐레이션" },
    ],
    members: [
      {
        userId: "demo-club-owner-photo",
        displayName: "하린 디렉터",
        email: "director-photo@b-page.local",
        role: "owner",
        joinedAt: "2026-03-05T11:00:00.000Z",
      },
    ],
    source: "demo",
    createdAt: "2026-03-05T11:00:00.000Z",
    updatedAt: "2026-03-29T23:30:00.000Z",
  },
];

function createEmptyStore(): ClubSiteStore {
  return {
    version: 1,
    metadata: {
      backend: "file",
      lastWriteAt: null,
    },
    customClubs: [],
  };
}

function normalizeSlug(input: string): string {
  return input.trim().toLowerCase();
}

function cloneMember(member: ClubMemberRecord): ClubMemberRecord {
  return { ...member };
}

function cloneClub<TClub extends RuntimeClubRecord | StoredCustomClub>(club: TClub): TClub {
  return {
    ...club,
    enabledModules: [...club.enabledModules],
    sampleModules: [...club.sampleModules],
    sections: club.sections.map((section) => ({ ...section })),
    highlights: club.highlights.map((highlight) => ({ ...highlight })),
    members: club.members.map((member) => cloneMember(member)),
  };
}

function sanitizeEnabledModules(modules: string[]): string[] {
  const allowed = new Set(clubModuleCatalog.map((module) => module.key));
  const selected = modules
    .map((module) => module.trim())
    .filter((module) => allowed.has(module as ClubModuleKey));

  return selected.length > 0 ? Array.from(new Set(selected)) : [...defaultEnabledClubModules];
}

function sanitizeStoredClub(club: StoredCustomClub): StoredCustomClub {
  return {
    ...cloneClub(club),
    slug: normalizeSlug(club.slug),
    visibility: club.visibility === "private" ? "private" : "public",
    joinPolicy: club.joinPolicy === "invite-first" ? "invite-first" : "approval-required",
    enabledModules: sanitizeEnabledModules(club.enabledModules),
    sampleModules:
      club.sampleModules.length > 0
        ? [...club.sampleModules]
        : club.enabledModules.map((moduleKey) => getClubModuleLabel(moduleKey)),
    ownerUserId: club.ownerUserId,
    createdAt: club.createdAt,
    updatedAt: club.updatedAt,
  };
}

async function ensureStore(): Promise<void> {
  await mkdir(path.dirname(clubSiteStorePath), { recursive: true });

  try {
    await readFile(clubSiteStorePath, "utf8");
  } catch {
    await writeFile(clubSiteStorePath, `${JSON.stringify(createEmptyStore(), null, 2)}\n`, "utf8");
  }
}

async function readStore(): Promise<ClubSiteStore> {
  await ensureStore();

  try {
    const raw = await readFile(clubSiteStorePath, "utf8");
    const parsed = JSON.parse(raw) as ClubSiteStore;

    return {
      version: 1,
      metadata: {
        backend: "file",
        lastWriteAt: parsed.metadata?.lastWriteAt ?? null,
      },
      customClubs: Array.isArray(parsed.customClubs)
        ? parsed.customClubs.map((club) => sanitizeStoredClub(club))
        : [],
    };
  } catch {
    return createEmptyStore();
  }
}

async function writeStore(store: ClubSiteStore): Promise<void> {
  const nextStore: ClubSiteStore = {
    version: 1,
    metadata: {
      backend: "file",
      lastWriteAt: new Date().toISOString(),
    },
    customClubs: store.customClubs.map((club) => sanitizeStoredClub(club)),
  };

  await mkdir(path.dirname(clubSiteStorePath), { recursive: true });
  await writeFile(clubSiteStorePath, `${JSON.stringify(nextStore, null, 2)}\n`, "utf8");
}

function getClubModuleLabel(moduleKey: string): string {
  return clubModuleCatalog.find((module) => module.key === moduleKey)?.label ?? moduleKey;
}

function getClubJoinPolicyLabel(joinPolicy: ClubJoinPolicy): string {
  switch (joinPolicy) {
    case "invite-first":
      return "초대 중심";
    default:
      return "로그인 후 승인";
  }
}

function getClubRoleLabel(role: ClubMemberRole): string {
  switch (role) {
    case "owner":
      return "개설자";
    case "manager":
      return "운영진";
    default:
      return "멤버";
  }
}

function isClubMember(
  club: RuntimeClubRecord,
  viewerSession?: PlatformUserSession | null,
): boolean {
  if (!viewerSession) {
    return false;
  }

  return club.members.some((member) => member.userId === viewerSession.userId);
}

function getClubMemberRecord(
  club: RuntimeClubRecord,
  viewerSession?: PlatformUserSession | null,
): ClubMemberRecord | null {
  if (!viewerSession) {
    return null;
  }

  return club.members.find((member) => member.userId === viewerSession.userId) ?? null;
}

function canDiscoverClub(
  club: RuntimeClubRecord,
  viewerSession?: PlatformUserSession | null,
): boolean {
  if (club.visibility === "public") {
    return true;
  }

  if (!viewerSession) {
    return false;
  }

  return viewerSession.platformRole === "master" || isClubMember(club, viewerSession);
}

function toRuntimeClub(club: StoredCustomClub): RuntimeClubRecord {
  return {
    ...cloneClub(club),
    source: "custom",
  };
}

function materializeSampleClubOverride(
  store: ClubSiteStore,
  sampleClub: RuntimeClubRecord,
): StoredCustomClub {
  const existing = store.customClubs.find((candidate) => candidate.slug === sampleClub.slug);

  if (existing) {
    return existing;
  }

  const ownerMember = sampleClub.members.find((member) => member.role === "owner") ?? sampleClub.members[0];
  const writableClub: StoredCustomClub = {
    ...cloneClub(sampleClub),
    ownerUserId: sampleClub.ownerUserId ?? ownerMember?.userId ?? `club-owner-${sampleClub.slug}`,
  };

  store.customClubs.push(writableClub);
  return writableClub;
}

function getWritableClubRecord(
  store: ClubSiteStore,
  normalizedSlug: string,
): StoredCustomClub | null {
  const existing = store.customClubs.find((candidate) => candidate.slug === normalizedSlug);

  if (existing) {
    return existing;
  }

  const sampleClub = sampleClubs.find((candidate) => candidate.slug === normalizedSlug);
  return sampleClub ? materializeSampleClubOverride(store, sampleClub) : null;
}

function toClubPublicPreview(club: RuntimeClubRecord): ClubPublicPreview {
  return {
    id: club.id,
    slug: club.slug,
    name: club.name,
    tagline: club.tagline,
    description: club.description,
    sportLabel: club.sportLabel,
    category: club.category,
    location: club.location,
    currentFocus: club.currentFocus,
    nextEventLabel: club.nextEventLabel,
    visibility: club.visibility,
    joinPolicy: club.joinPolicy,
    themePreset: club.themePreset,
    ownerName: club.ownerName,
    sampleModules: [...club.sampleModules],
    sections: club.sections.map((section) => ({ ...section })),
    highlights: club.highlights.map((highlight) => ({ ...highlight })),
    accessLabel: getClubJoinPolicyLabel(club.joinPolicy),
    memberCount: club.members.length,
    source: club.source,
  };
}

export function getCustomClubCreationLimit(accountRole: PlatformAccountRole): number {
  return accountRole === "master" ? 99 : 3;
}

export function canCreateCustomClubs(session?: PlatformUserSession | null): boolean {
  return Boolean(session && canCreateClubSites(session));
}

export function canCreateClubSitesView(session?: PlatformUserSession | null): boolean {
  return canCreateCustomClubs(session);
}

export async function listRuntimeClubs(): Promise<RuntimeClubRecord[]> {
  const store = await readStore();
  const customBySlug = new Map(store.customClubs.map((club) => [club.slug, club] as const));
  const customOnly = store.customClubs.filter(
    (club) => !sampleClubs.some((sampleClub) => sampleClub.slug === club.slug),
  );

  return [
    ...sampleClubs.map((club) => {
      const override = customBySlug.get(club.slug);
      return override ? toRuntimeClub(override) : cloneClub(club);
    }),
    ...customOnly.map((club) => toRuntimeClub(club)),
  ];
}

export async function countOwnedCustomClubSites(userId: string): Promise<number> {
  const store = await readStore();
  return store.customClubs.filter((club) => club.ownerUserId === userId).length;
}

export async function listConsoleClubs(
  session: PlatformUserSession,
): Promise<ConsoleClubAccessRecord[]> {
  const clubs = await listRuntimeClubs();

  return clubs
    .map((club) => {
      if (session.platformRole === "master") {
        return { club, role: "마스터", canManage: true };
      }

      const member = club.members.find((candidate) => candidate.userId === session.userId);

      if (!member) {
        return null;
      }

      const canManage = member.role === "owner" || member.role === "manager";

      return {
        club,
        role: getClubRoleLabel(member.role),
        canManage,
      };
    })
    .filter((entry): entry is ConsoleClubAccessRecord => Boolean(entry));
}

export async function resolveRuntimeClubFromSlug(
  clubSlug: string,
): Promise<RuntimeClubRecord | null> {
  const normalizedSlug = normalizeSlug(clubSlug);
  const clubs = await listRuntimeClubs();
  return clubs.find((club) => club.slug === normalizedSlug) ?? null;
}

export async function resolveDiscoverableRuntimeClubFromSlug(
  clubSlug: string,
  viewerSession?: PlatformUserSession | null,
): Promise<RuntimeClubRecord | null> {
  const club = await resolveRuntimeClubFromSlug(clubSlug);

  if (!club) {
    return null;
  }

  return canDiscoverClub(club, viewerSession) ? club : null;
}

export async function listPublicClubPreviews(
  viewerSession?: PlatformUserSession | null,
): Promise<ClubPublicPreview[]> {
  const clubs = await listRuntimeClubs();

  return clubs
    .filter((club) => canDiscoverClub(club, viewerSession))
    .map((club) => toClubPublicPreview(club));
}

export async function resolveClubPreviewFromSlug(
  slug: string,
  viewerSession?: PlatformUserSession | null,
): Promise<ClubPublicPreview | null> {
  const club = await resolveDiscoverableRuntimeClubFromSlug(slug, viewerSession);
  return club ? toClubPublicPreview(club) : null;
}

export async function getConsoleClubBySlug(
  session: PlatformUserSession,
  clubSlug: string,
): Promise<ConsoleClubAccessRecord | null> {
  const club = await resolveRuntimeClubFromSlug(clubSlug);

  if (!club) {
    return null;
  }

  if (session.platformRole === "master") {
    return {
      club,
      role: "마스터",
      canManage: true,
    };
  }

  const member = club.members.find((candidate) => candidate.userId === session.userId);

  if (!member) {
    return null;
  }

  return {
    club,
    role: getClubRoleLabel(member.role),
    canManage: member.role === "owner" || member.role === "manager",
  };
}

export async function getClubViewerAccess(
  clubSlug: string,
  viewerSession?: PlatformUserSession | null,
): Promise<ClubViewerAccess | null> {
  const club = await resolveRuntimeClubFromSlug(clubSlug);

  if (!club) {
    return null;
  }

  if (viewerSession?.platformRole === "master") {
    return {
      club,
      member: null,
      roleLabel: "마스터",
      hasAccess: true,
      canManage: true,
    };
  }

  const member = getClubMemberRecord(club, viewerSession);
  const canManage = member?.role === "owner" || member?.role === "manager";

  return {
    club,
    member,
    roleLabel: member ? getClubRoleLabel(member.role) : null,
    hasAccess: Boolean(member),
    canManage: Boolean(canManage),
  };
}

export async function createCustomClubSite(input: {
  ownerUserId: string;
  creatorPlatformRole: PlatformAccountRole;
  ownerDisplayName: string;
  ownerEmail: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  sportLabel: string;
  location: string;
  currentFocus: string;
  nextEventLabel: string;
  visibility: ClubVisibility;
  joinPolicy: ClubJoinPolicy;
  themePreset: FamilyThemePreset;
  enabledModules: string[];
}): Promise<RuntimeClubRecord> {
  const normalizedSlug = normalizeSlug(input.slug);

  if (!/^[a-z0-9-]{2,32}$/.test(normalizedSlug)) {
    throw new Error("클럽 주소는 영문 소문자, 숫자, 하이픈만 사용해 2~32자로 만들어 주세요.");
  }

  const ownedClubCount = await countOwnedCustomClubSites(input.ownerUserId);

  if (ownedClubCount >= getCustomClubCreationLimit(input.creatorPlatformRole)) {
    throw new Error("정회원은 클럽을 최대 3개까지 만들 수 있습니다.");
  }

  const store = await readStore();
  const existsInCustom = store.customClubs.some((club) => club.slug === normalizedSlug);
  const existsInSamples = sampleClubs.some((club) => club.slug === normalizedSlug);

  if (existsInCustom || existsInSamples) {
    throw new Error("이미 사용 중인 클럽 주소입니다.");
  }

  const now = new Date().toISOString();
  const enabledModules = sanitizeEnabledModules(input.enabledModules);
  const club: StoredCustomClub = {
    id: `club-${randomUUID()}`,
    slug: normalizedSlug,
    name: input.name.trim(),
    tagline: input.tagline.trim(),
    description: input.description.trim(),
    sportLabel: input.sportLabel.trim(),
    category: input.sportLabel.trim(),
    location: input.location.trim(),
    currentFocus: input.currentFocus.trim(),
    nextEventLabel: input.nextEventLabel.trim(),
    visibility: input.visibility,
    joinPolicy: input.joinPolicy,
    themePreset: input.themePreset,
    ownerUserId: input.ownerUserId,
    ownerName: input.ownerDisplayName.trim(),
    ownerEmail: input.ownerEmail.trim().toLowerCase(),
    enabledModules,
    sampleModules: enabledModules.map((moduleKey) => getClubModuleLabel(moduleKey)),
    sections: [
      {
        key: "announcement",
        title: "운영 공지",
        description: "모임 공지와 준비 사항을 먼저 보여 줍니다.",
        audience: "public",
      },
      {
        key: "event",
        title: "다음 일정",
        description: "다가오는 모임과 신청 흐름을 정리합니다.",
        audience: "public",
      },
      {
        key: "member",
        title: "멤버 전용 보드",
        description: "승인된 멤버만 보는 기록과 운영 메모를 담습니다.",
        audience: "member",
      },
    ],
    highlights: [
      { label: "운영 초점", value: input.currentFocus.trim() },
      { label: "다음 일정", value: input.nextEventLabel.trim() },
      { label: "가입 방식", value: getClubJoinPolicyLabel(input.joinPolicy) },
    ],
    members: [
      {
        userId: input.ownerUserId,
        displayName: input.ownerDisplayName.trim(),
        email: input.ownerEmail.trim().toLowerCase(),
        role: "owner",
        joinedAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  store.customClubs.push(club);
  await writeStore(store);

  return toRuntimeClub(club);
}

export async function saveRuntimeClub(input: {
  clubSlug: string;
  name: string;
  tagline: string;
  description: string;
  sportLabel: string;
  location: string;
  currentFocus: string;
  nextEventLabel: string;
  visibility: ClubVisibility;
  joinPolicy: ClubJoinPolicy;
  themePreset: FamilyThemePreset;
  enabledModules: string[];
}): Promise<RuntimeClubRecord> {
  const normalizedSlug = normalizeSlug(input.clubSlug);
  const store = await readStore();
  const club = getWritableClubRecord(store, normalizedSlug);

  if (!club) {
    throw new Error("수정할 수 있는 클럽을 찾지 못했습니다.");
  }

  club.name = input.name.trim();
  club.tagline = input.tagline.trim();
  club.description = input.description.trim();
  club.sportLabel = input.sportLabel.trim();
  club.category = input.sportLabel.trim();
  club.location = input.location.trim();
  club.currentFocus = input.currentFocus.trim();
  club.nextEventLabel = input.nextEventLabel.trim();
  club.visibility = input.visibility;
  club.joinPolicy = input.joinPolicy;
  club.themePreset = input.themePreset;
  club.enabledModules = sanitizeEnabledModules(input.enabledModules);
  club.sampleModules = club.enabledModules.map((moduleKey) => getClubModuleLabel(moduleKey));
  club.highlights = [
    { label: "운영 초점", value: club.currentFocus },
    { label: "다음 일정", value: club.nextEventLabel },
    { label: "가입 방식", value: getClubJoinPolicyLabel(club.joinPolicy) },
  ];
  club.updatedAt = new Date().toISOString();

  await writeStore(store);
  return toRuntimeClub(club);
}

export async function addApprovedClubMember(input: {
  clubSlug: string;
  userId: string;
  displayName: string;
  email: string;
}): Promise<RuntimeClubRecord> {
  const normalizedSlug = normalizeSlug(input.clubSlug);
  const store = await readStore();
  const club = getWritableClubRecord(store, normalizedSlug);

  if (!club) {
    throw new Error("club-not-found");
  }

  const existingMember = club.members.find((member) => member.userId === input.userId);

  if (!existingMember) {
    club.members.push({
      userId: input.userId,
      displayName: input.displayName,
      email: input.email.toLowerCase(),
      role: "member",
      joinedAt: new Date().toISOString(),
    });
    club.updatedAt = new Date().toISOString();
    await writeStore(store);
  }

  return toRuntimeClub(club);
}

export async function getClubThemePreset(slug: string): Promise<FamilyThemePreset> {
  const club = await resolveRuntimeClubFromSlug(slug);
  return club?.themePreset ?? "ocean-depths";
}

export async function getClubTheme(slug: string) {
  return getSharedThemePreset(await getClubThemePreset(slug)).familyTheme;
}
