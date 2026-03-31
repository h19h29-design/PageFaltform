import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type ClubContentVisibility = "public" | "member";
export type ClubAnnouncementSeverity = "normal" | "important" | "urgent";
export type ClubContentModuleKey = "announcements" | "events" | "gallery";

export interface ClubAnnouncementRecord {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  severity: ClubAnnouncementSeverity;
  visibility: ClubContentVisibility;
  pinned: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClubEventRecord {
  id: string;
  slug: string;
  title: string;
  summary: string;
  startsAt: string;
  endsAt: string;
  location: string;
  attendanceTarget?: number;
  visibility: ClubContentVisibility;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClubGalleryRecord {
  id: string;
  slug: string;
  title: string;
  caption: string;
  photoCount: number;
  noteCount?: number;
  imageUrl?: string;
  visibility: ClubContentVisibility;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClubContentSnapshot {
  announcements: ClubAnnouncementRecord[];
  events: ClubEventRecord[];
  gallery: ClubGalleryRecord[];
}

interface ClubContentStore {
  version: 1;
  clubs: Record<string, ClubContentSnapshot>;
}

export type ClubAnnouncementRecordInput = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  severity: ClubAnnouncementSeverity;
  visibility: ClubContentVisibility;
  pinned?: boolean | undefined;
  featured?: boolean | undefined;
};

export type ClubEventRecordInput = {
  title: string;
  slug: string;
  summary: string;
  startsAt: string;
  endsAt: string;
  location: string;
  attendanceTarget?: number | undefined;
  visibility: ClubContentVisibility;
  featured?: boolean | undefined;
};

export type ClubGalleryRecordInput = {
  title: string;
  slug: string;
  caption: string;
  photoCount: number;
  noteCount?: number | undefined;
  imageUrl?: string | undefined;
  visibility: ClubContentVisibility;
  featured?: boolean | undefined;
};

export type ClubAnnouncementInput = ClubAnnouncementRecordInput;
export type ClubEventInput = ClubEventRecordInput;
export type ClubGalleryInput = ClubGalleryRecordInput;

export interface ClubContentSummary {
  announcementCount: number;
  eventCount: number;
  galleryCount: number;
  featuredCount: number;
  lastUpdatedAt: string | null;
}

const clubContentStorePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../data/club-content-modules.json",
);

function createEmptyStore(): ClubContentStore {
  return {
    version: 1,
    clubs: {},
  };
}

function normalizeClubSlug(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

function createSeedTimestamp(index: number): string {
  const seedBase = Date.parse("2026-03-24T07:30:00+09:00");
  return new Date(seedBase - index * 3_600_000).toISOString();
}

function createDefaultClubSnapshot(): ClubContentSnapshot {
  const announcementSeed: Array<Omit<ClubAnnouncementRecord, "id" | "createdAt" | "updatedAt">> = [
    {
      slug: "this-week-notice",
      title: "이번 주 운영 공지",
      summary: "이번 주 공지와 확인 사항만 빠르게 보이게 정리했습니다.",
      body: "이번 주는 주중 저녁 모임과 주말 정리 일정이 있습니다. 참가 여부만 눌러 주세요.",
      severity: "important",
      visibility: "member",
      pinned: true,
      featured: true,
    },
    {
      slug: "welcome-guide",
      title: "새 멤버 안내",
      summary: "처음 들어온 멤버가 바로 따라할 수 있게 핵심만 묶었습니다.",
      body: "게시판은 공지, 일정, 갤러리 세 개가 기본입니다. 새 글은 상단 `새로 만들기`에서 작성하세요.",
      severity: "normal",
      visibility: "public",
      pinned: false,
      featured: false,
    },
  ];

  const eventSeed: Array<Omit<ClubEventRecord, "id" | "createdAt" | "updatedAt">> = [
    {
      slug: "evening-meeting",
      title: "저녁 정기 모임",
      summary: "이번 주 모임은 짧게 시작해서 후기 정리까지 한 번에 진행합니다.",
      startsAt: "2026-03-24T19:30:00.000Z",
      endsAt: "2026-03-24T21:00:00.000Z",
      location: "동네 커뮤니티실",
      attendanceTarget: 12,
      visibility: "member",
      featured: true,
    },
    {
      slug: "weekend-walk",
      title: "주말 산책 일정",
      summary: "가볍게 만나는 오픈 일정입니다. 늦지 않게 출발만 확인하세요.",
      startsAt: "2026-03-29T09:00:00.000Z",
      endsAt: "2026-03-29T10:30:00.000Z",
      location: "한강 산책로",
      attendanceTarget: 8,
      visibility: "public",
      featured: false,
    },
  ];

  const gallerySeed: Array<Omit<ClubGalleryRecord, "id" | "createdAt" | "updatedAt">> = [
    {
      slug: "spring-crew-photo",
      title: "봄 모임 사진",
      caption: "가벼운 분위기와 핵심 장면만 보이게 정리한 최근 사진입니다.",
      photoCount: 14,
      noteCount: 6,
      visibility: "member",
      featured: true,
    },
    {
      slug: "weekend-highlight",
      title: "주말 하이라이트",
      caption: "처음 보는 사람도 분위기를 알 수 있게 대표 장면만 올렸습니다.",
      photoCount: 8,
      noteCount: 2,
      imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
      visibility: "public",
      featured: false,
    },
  ];

  return {
    announcements: announcementSeed.map((record, index) => {
      const timestamp = createSeedTimestamp(index);
      return {
        id: `club-announcement-${randomUUID()}`,
        ...record,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    }),
    events: eventSeed.map((record, index) => {
      const timestamp = createSeedTimestamp(index);
      return {
        id: `club-event-${randomUUID()}`,
        ...record,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    }),
    gallery: gallerySeed.map((record, index) => {
      const timestamp = createSeedTimestamp(index);
      return {
        id: `club-gallery-${randomUUID()}`,
        ...record,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    }),
  };
}

function cloneAnnouncement(record: ClubAnnouncementRecord): ClubAnnouncementRecord {
  return { ...record };
}

function cloneEvent(record: ClubEventRecord): ClubEventRecord {
  return { ...record };
}

function cloneGallery(record: ClubGalleryRecord): ClubGalleryRecord {
  return { ...record };
}

function cloneSnapshot(snapshot: ClubContentSnapshot): ClubContentSnapshot {
  return {
    announcements: snapshot.announcements.map(cloneAnnouncement),
    events: snapshot.events.map(cloneEvent),
    gallery: snapshot.gallery.map(cloneGallery),
  };
}

function sortByUpdatedAtDesc<T extends { updatedAt: string }>(records: readonly T[]): T[] {
  return [...records].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

async function ensureStore(): Promise<void> {
  await mkdir(path.dirname(clubContentStorePath), { recursive: true });

  try {
    await readFile(clubContentStorePath, "utf8");
  } catch {
    await writeFile(clubContentStorePath, `${JSON.stringify(createEmptyStore(), null, 2)}\n`, "utf8");
  }
}

async function readStore(): Promise<ClubContentStore> {
  await ensureStore();

  try {
    const raw = await readFile(clubContentStorePath, "utf8");
    const parsed = JSON.parse(raw) as ClubContentStore;

    if (!parsed || parsed.version !== 1 || typeof parsed.clubs !== "object" || !parsed.clubs) {
      return createEmptyStore();
    }

    return {
      version: 1,
      clubs: Object.fromEntries(
        Object.entries(parsed.clubs).map(([clubSlug, snapshot]) => [
          normalizeClubSlug(clubSlug),
          cloneSnapshot(snapshot as ClubContentSnapshot),
        ]),
      ),
    };
  } catch {
    return createEmptyStore();
  }
}

async function writeStore(store: ClubContentStore): Promise<void> {
  const normalizedStore: ClubContentStore = {
    version: 1,
    clubs: Object.fromEntries(
      Object.entries(store.clubs).map(([clubSlug, snapshot]) => [
        normalizeClubSlug(clubSlug),
        cloneSnapshot(snapshot),
      ]),
    ),
  };

  await mkdir(path.dirname(clubContentStorePath), { recursive: true });
  await writeFile(clubContentStorePath, `${JSON.stringify(normalizedStore, null, 2)}\n`, "utf8");
}

async function ensureClubSnapshot(
  clubSlug: string,
): Promise<{
  store: ClubContentStore;
  snapshot: ClubContentSnapshot;
  normalizedClubSlug: string;
}> {
  const normalizedClubSlug = normalizeClubSlug(clubSlug);
  const store = await readStore();

  if (!store.clubs[normalizedClubSlug]) {
    store.clubs[normalizedClubSlug] = createDefaultClubSnapshot();
    await writeStore(store);
  }

  return {
    store,
    snapshot: store.clubs[normalizedClubSlug]!,
    normalizedClubSlug,
  };
}

function ensureUniqueSlug<T extends { slug: string }>(
  records: readonly T[],
  nextSlug: string,
  excludedSlug?: string,
): void {
  if (records.some((record) => record.slug === nextSlug && record.slug !== excludedSlug)) {
    throw new Error("이미 사용 중인 주소입니다. 다른 주소를 사용해 주세요.");
  }
}

function resolveEditableSlug(title: string, explicitSlug?: string): string {
  const normalized = normalizeSlug(explicitSlug && explicitSlug.length > 0 ? explicitSlug : title);

  if (!normalized) {
    throw new Error("제목을 바탕으로 사용할 수 있는 주소를 만들 수 없습니다.");
  }

  return normalized;
}

function normalizeOptionalIso(value?: string | null): string | undefined {
  if (!value || value.trim().length === 0) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("날짜 형식이 올바르지 않습니다.");
  }

  return date.toISOString();
}

function normalizeRequiredIso(value: string, fieldLabel: string): string {
  const normalized = normalizeOptionalIso(value);

  if (!normalized) {
    throw new Error(`${fieldLabel}을(를) 입력해 주세요.`);
  }

  return normalized;
}

export function getClubAnnouncementSeverityLabel(severity: ClubAnnouncementSeverity): string {
  switch (severity) {
    case "urgent":
      return "긴급";
    case "important":
      return "중요";
    default:
      return "일반";
  }
}

export function getClubVisibilityLabel(visibility: ClubContentVisibility): string {
  return visibility === "public" ? "공개" : "멤버 전용";
}

export function getClubRecordUpdatedLabel(updatedAt: string): string {
  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return updatedAt;
  }

  return date.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getClubEventWindowLabel(record: Pick<ClubEventRecord, "startsAt" | "endsAt">): string {
  const start = new Date(record.startsAt);
  const end = new Date(record.endsAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "시간 미정";
  }

  const format = new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${format.format(start)} - ${format.format(end)}`;
}

export function getClubGalleryBadgeLabel(record: Pick<ClubGalleryRecord, "featured" | "photoCount">): string {
  return record.featured ? `추천 ${record.photoCount}장` : `${record.photoCount}장`;
}

export async function getClubContentSnapshot(clubSlug: string): Promise<ClubContentSnapshot> {
  const { snapshot } = await ensureClubSnapshot(clubSlug);
  return cloneSnapshot(snapshot);
}

export async function buildClubContentSummary(clubSlug: string): Promise<ClubContentSummary> {
  const snapshot = await getClubContentSnapshot(clubSlug);
  const allRecords = [...snapshot.announcements, ...snapshot.events, ...snapshot.gallery];

  return {
    announcementCount: snapshot.announcements.length,
    eventCount: snapshot.events.length,
    galleryCount: snapshot.gallery.length,
    featuredCount:
      snapshot.announcements.filter((record) => record.featured).length +
      snapshot.events.filter((record) => record.featured).length +
      snapshot.gallery.filter((record) => record.featured).length,
    lastUpdatedAt:
      sortByUpdatedAtDesc(allRecords)[0]?.updatedAt ?? null,
  };
}

async function createRecord<TRecord extends { id: string; slug: string; createdAt: string; updatedAt: string }>(
  clubSlug: string,
  getRecords: (snapshot: ClubContentSnapshot) => TRecord[],
  setRecords: (snapshot: ClubContentSnapshot, records: TRecord[]) => ClubContentSnapshot,
  createNext: (inputSlug: string, now: string) => TRecord,
  title: string,
  explicitSlug?: string,
): Promise<TRecord> {
  const { store, snapshot, normalizedClubSlug } = await ensureClubSnapshot(clubSlug);
  const nextSlug = resolveEditableSlug(title, explicitSlug);
  const records = getRecords(snapshot);
  ensureUniqueSlug(records, nextSlug);
  const now = new Date().toISOString();
  const record = createNext(nextSlug, now);

  store.clubs[normalizedClubSlug] = setRecords(snapshot, [record, ...records]);
  await writeStore(store);

  return { ...record };
}

async function updateRecord<TRecord extends { slug: string; updatedAt: string }>(
  clubSlug: string,
  currentSlug: string,
  getRecords: (snapshot: ClubContentSnapshot) => TRecord[],
  setRecords: (snapshot: ClubContentSnapshot, records: TRecord[]) => ClubContentSnapshot,
  buildNext: (current: TRecord, nextSlug: string) => TRecord,
  title: string,
  explicitSlug?: string,
  missingMessage = "수정할 항목을 찾지 못했습니다.",
): Promise<TRecord> {
  const { store, snapshot, normalizedClubSlug } = await ensureClubSnapshot(clubSlug);
  const records = getRecords(snapshot);
  const currentIndex = records.findIndex((record) => record.slug === currentSlug);

  if (currentIndex === -1) {
    throw new Error(missingMessage);
  }

  const nextSlug = resolveEditableSlug(title, explicitSlug);
  ensureUniqueSlug(records, nextSlug, currentSlug);
  const nextRecord = buildNext(records[currentIndex]!, nextSlug);
  const nextRecords = [...records];
  nextRecords[currentIndex] = nextRecord;
  store.clubs[normalizedClubSlug] = setRecords(snapshot, nextRecords);
  await writeStore(store);

  return { ...nextRecord };
}

async function deleteRecord<TRecord extends { slug: string }>(
  clubSlug: string,
  slug: string,
  getRecords: (snapshot: ClubContentSnapshot) => TRecord[],
  setRecords: (snapshot: ClubContentSnapshot, records: TRecord[]) => ClubContentSnapshot,
): Promise<void> {
  const { store, snapshot, normalizedClubSlug } = await ensureClubSnapshot(clubSlug);
  const nextRecords = getRecords(snapshot).filter((record) => record.slug !== slug);
  store.clubs[normalizedClubSlug] = setRecords(snapshot, nextRecords);
  await writeStore(store);
}

export async function listClubAnnouncementRecords(clubSlug: string): Promise<ClubAnnouncementRecord[]> {
  const snapshot = await getClubContentSnapshot(clubSlug);
  return sortByUpdatedAtDesc(snapshot.announcements).map(cloneAnnouncement);
}

export async function getClubAnnouncementRecord(
  clubSlug: string,
  slug: string,
): Promise<ClubAnnouncementRecord | null> {
  const snapshot = await getClubContentSnapshot(clubSlug);
  return snapshot.announcements.find((record) => record.slug === slug) ?? null;
}

export async function createClubAnnouncementRecord(
  clubSlug: string,
  input: ClubAnnouncementInput,
): Promise<ClubAnnouncementRecord> {
  return createRecord(
    clubSlug,
    (snapshot) => snapshot.announcements,
    (snapshot, records) => ({ ...snapshot, announcements: records }),
    (nextSlug, now) => ({
      id: `club-announcement-${randomUUID()}`,
      slug: nextSlug,
      title: input.title,
      summary: input.summary,
      body: input.body,
      severity: input.severity,
      visibility: input.visibility,
      pinned: Boolean(input.pinned),
      featured: Boolean(input.featured),
      createdAt: now,
      updatedAt: now,
    }),
    input.title,
    input.slug,
  );
}

export async function updateClubAnnouncementRecord(
  clubSlug: string,
  currentSlug: string,
  input: ClubAnnouncementInput,
): Promise<ClubAnnouncementRecord> {
  return updateRecord(
    clubSlug,
    currentSlug,
    (snapshot) => snapshot.announcements,
    (snapshot, records) => ({ ...snapshot, announcements: records }),
    (current, nextSlug) => ({
      id: current.id,
      createdAt: current.createdAt,
      slug: nextSlug,
      title: input.title,
      summary: input.summary,
      body: input.body,
      severity: input.severity,
      visibility: input.visibility,
      pinned: Boolean(input.pinned),
      featured: Boolean(input.featured),
      updatedAt: new Date().toISOString(),
    }),
    input.title,
    input.slug,
    "수정할 공지를 찾지 못했습니다.",
  );
}

export async function deleteClubAnnouncementRecord(clubSlug: string, slug: string): Promise<void> {
  await deleteRecord(
    clubSlug,
    slug,
    (snapshot) => snapshot.announcements,
    (snapshot, records) => ({ ...snapshot, announcements: records }),
  );
}

export async function listClubEventRecords(clubSlug: string): Promise<ClubEventRecord[]> {
  const snapshot = await getClubContentSnapshot(clubSlug);
  return sortByUpdatedAtDesc(snapshot.events).map(cloneEvent);
}

export async function getClubEventRecord(clubSlug: string, slug: string): Promise<ClubEventRecord | null> {
  const snapshot = await getClubContentSnapshot(clubSlug);
  return snapshot.events.find((record) => record.slug === slug) ?? null;
}

export async function createClubEventRecord(
  clubSlug: string,
  input: ClubEventInput,
): Promise<ClubEventRecord> {
  return createRecord(
    clubSlug,
    (snapshot) => snapshot.events,
    (snapshot, records) => ({ ...snapshot, events: records }),
    (nextSlug, now) => ({
      id: `club-event-${randomUUID()}`,
      slug: nextSlug,
      title: input.title,
      summary: input.summary,
      startsAt: normalizeRequiredIso(input.startsAt, "시작 시간"),
      endsAt: normalizeRequiredIso(input.endsAt, "종료 시간"),
      location: input.location,
      ...(input.attendanceTarget !== undefined ? { attendanceTarget: input.attendanceTarget } : {}),
      visibility: input.visibility,
      featured: Boolean(input.featured),
      createdAt: now,
      updatedAt: now,
    }),
    input.title,
    input.slug,
  );
}

export async function updateClubEventRecord(
  clubSlug: string,
  currentSlug: string,
  input: ClubEventInput,
): Promise<ClubEventRecord> {
  return updateRecord(
    clubSlug,
    currentSlug,
    (snapshot) => snapshot.events,
    (snapshot, records) => ({ ...snapshot, events: records }),
    (current, nextSlug) => ({
      id: current.id,
      createdAt: current.createdAt,
      slug: nextSlug,
      title: input.title,
      summary: input.summary,
      startsAt: normalizeRequiredIso(input.startsAt, "시작 시간"),
      endsAt: normalizeRequiredIso(input.endsAt, "종료 시간"),
      location: input.location,
      ...(input.attendanceTarget !== undefined ? { attendanceTarget: input.attendanceTarget } : {}),
      visibility: input.visibility,
      featured: Boolean(input.featured),
      updatedAt: new Date().toISOString(),
    }),
    input.title,
    input.slug,
    "수정할 일정을 찾지 못했습니다.",
  );
}

export async function deleteClubEventRecord(clubSlug: string, slug: string): Promise<void> {
  await deleteRecord(
    clubSlug,
    slug,
    (snapshot) => snapshot.events,
    (snapshot, records) => ({ ...snapshot, events: records }),
  );
}

export async function listClubGalleryRecords(clubSlug: string): Promise<ClubGalleryRecord[]> {
  const snapshot = await getClubContentSnapshot(clubSlug);
  return sortByUpdatedAtDesc(snapshot.gallery).map(cloneGallery);
}

export async function getClubGalleryRecord(clubSlug: string, slug: string): Promise<ClubGalleryRecord | null> {
  const snapshot = await getClubContentSnapshot(clubSlug);
  return snapshot.gallery.find((record) => record.slug === slug) ?? null;
}

export async function createClubGalleryRecord(
  clubSlug: string,
  input: ClubGalleryInput,
): Promise<ClubGalleryRecord> {
  return createRecord(
    clubSlug,
    (snapshot) => snapshot.gallery,
    (snapshot, records) => ({ ...snapshot, gallery: records }),
    (nextSlug, now) => ({
      id: `club-gallery-${randomUUID()}`,
      slug: nextSlug,
      title: input.title,
      caption: input.caption,
      photoCount: input.photoCount,
      ...(input.noteCount !== undefined ? { noteCount: input.noteCount } : {}),
      ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
      visibility: input.visibility,
      featured: Boolean(input.featured),
      createdAt: now,
      updatedAt: now,
    }),
    input.title,
    input.slug,
  );
}

export async function updateClubGalleryRecord(
  clubSlug: string,
  currentSlug: string,
  input: ClubGalleryInput,
): Promise<ClubGalleryRecord> {
  return updateRecord(
    clubSlug,
    currentSlug,
    (snapshot) => snapshot.gallery,
    (snapshot, records) => ({ ...snapshot, gallery: records }),
    (current, nextSlug) => ({
      id: current.id,
      createdAt: current.createdAt,
      slug: nextSlug,
      title: input.title,
      caption: input.caption,
      photoCount: input.photoCount,
      ...(input.noteCount !== undefined ? { noteCount: input.noteCount } : {}),
      ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
      visibility: input.visibility,
      featured: Boolean(input.featured),
      updatedAt: new Date().toISOString(),
    }),
    input.title,
    input.slug,
    "수정할 갤러리를 찾지 못했습니다.",
  );
}

export async function deleteClubGalleryRecord(clubSlug: string, slug: string): Promise<void> {
  await deleteRecord(
    clubSlug,
    slug,
    (snapshot) => snapshot.gallery,
    (snapshot, records) => ({ ...snapshot, gallery: records }),
  );
}
