import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  announcementFixtures,
  buildAnnouncementsDashboardFeed,
  type AnnouncementFixture,
} from "@ysplan/modules-announcements";
import {
  buildDiaryDashboardFeed,
  diaryEntryFixtures,
  type DiaryEntryFixture,
} from "@ysplan/modules-diary";
import {
  buildGalleryDashboardFeed,
  galleryFixtures,
  type GalleryFixture,
} from "@ysplan/modules-gallery";
import {
  buildPostsDashboardFeed,
  postFixtures,
  type PostFixture,
} from "@ysplan/modules-posts";
import type { DashboardModuleFeed } from "@ysplan/dashboard";

export interface StoredAnnouncement extends AnnouncementFixture {
  createdAt: string;
  updatedAt: string;
}

export interface StoredPost extends PostFixture {
  createdAt: string;
  updatedAt: string;
}

export interface StoredGallery extends GalleryFixture {
  createdAt: string;
  updatedAt: string;
}

export interface StoredDiaryEntry extends DiaryEntryFixture {
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyContentSnapshot {
  announcements: StoredAnnouncement[];
  posts: StoredPost[];
  gallery: StoredGallery[];
  diary: StoredDiaryEntry[];
}

interface ContentModuleStore {
  version: 1;
  families: Record<string, FamilyContentSnapshot>;
}

export type AnnouncementRecordInput = Omit<
  StoredAnnouncement,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "pinned"
  | "requiresReadAck"
  | "readAckTarget"
  | "readAckConfirmed"
  | "displayStartsAt"
  | "displayEndsAt"
> & {
  pinned?: boolean | undefined;
  requiresReadAck?: boolean | undefined;
  readAckTarget?: number | undefined;
  readAckConfirmed?: number | undefined;
  displayStartsAt?: string | undefined;
  displayEndsAt?: string | undefined;
};

export type PostRecordInput = Omit<StoredPost, "id" | "createdAt" | "updatedAt" | "featured" | "imageUrl"> & {
  featured?: boolean | undefined;
  imageUrl?: string | undefined;
};

export type GalleryRecordInput = Omit<
  StoredGallery,
  "id" | "createdAt" | "updatedAt" | "noteCount" | "featured" | "imageUrl"
> & {
  noteCount?: number | undefined;
  featured?: boolean | undefined;
  imageUrl?: string | undefined;
};

export type DiaryRecordInput = Omit<StoredDiaryEntry, "id" | "createdAt" | "updatedAt" | "moodLabel" | "highlighted"> & {
  moodLabel?: string | undefined;
  highlighted?: boolean | undefined;
};

const contentStorePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../data/content-modules.json",
);

function createEmptyContentStore(): ContentModuleStore {
  return {
    version: 1,
    families: {},
  };
}

function normalizeFamilySlug(value: string): string {
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
  const seedBase = Date.parse("2026-03-19T07:30:00+09:00");
  return new Date(seedBase - index * 3_600_000).toISOString();
}

function cloneAnnouncement(record: StoredAnnouncement): StoredAnnouncement {
  return { ...record };
}

function clonePost(record: StoredPost): StoredPost {
  return { ...record };
}

function cloneGallery(record: StoredGallery): StoredGallery {
  return { ...record };
}

function cloneDiary(record: StoredDiaryEntry): StoredDiaryEntry {
  return { ...record };
}

function cloneFamilyContentSnapshot(snapshot: FamilyContentSnapshot): FamilyContentSnapshot {
  return {
    announcements: snapshot.announcements.map(cloneAnnouncement),
    posts: snapshot.posts.map(clonePost),
    gallery: snapshot.gallery.map(cloneGallery),
    diary: snapshot.diary.map(cloneDiary),
  };
}

function sortByUpdatedAtDesc<T extends { updatedAt: string }>(records: readonly T[]): T[] {
  return [...records].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function createDefaultFamilyContentSnapshot(): FamilyContentSnapshot {
  return {
    announcements: announcementFixtures.map((record, index) => {
      const timestamp = createSeedTimestamp(index);

      return {
        ...record,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    }),
    posts: postFixtures.map((record, index) => {
      const timestamp = createSeedTimestamp(index);

      return {
        ...record,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    }),
    gallery: galleryFixtures.map((record, index) => {
      const timestamp = createSeedTimestamp(index);

      return {
        ...record,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    }),
    diary: diaryEntryFixtures.map((record, index) => {
      const timestamp = createSeedTimestamp(index);

      return {
        ...record,
        body: record.excerpt,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    }),
  };
}

async function ensureContentStore(): Promise<void> {
  await mkdir(path.dirname(contentStorePath), { recursive: true });

  try {
    await readFile(contentStorePath, "utf8");
  } catch {
    await writeFile(contentStorePath, `${JSON.stringify(createEmptyContentStore(), null, 2)}\n`, "utf8");
  }
}

async function writeContentStore(store: ContentModuleStore): Promise<void> {
  await ensureContentStore();
  const normalizedStore: ContentModuleStore = {
    version: 1,
    families: Object.fromEntries(
      Object.entries(store.families).map(([familySlug, snapshot]) => [
        normalizeFamilySlug(familySlug),
        cloneFamilyContentSnapshot(snapshot),
      ]),
    ),
  };

  await writeFile(contentStorePath, `${JSON.stringify(normalizedStore, null, 2)}\n`, "utf8");
}

async function readContentStore(): Promise<ContentModuleStore> {
  await ensureContentStore();
  const raw = await readFile(contentStorePath, "utf8");

  try {
    const parsed = JSON.parse(raw) as ContentModuleStore;

    if (!parsed || parsed.version !== 1 || !parsed.families || typeof parsed.families !== "object") {
      return createEmptyContentStore();
    }

    return {
      version: 1,
      families: Object.fromEntries(
        Object.entries(parsed.families).map(([familySlug, snapshot]) => [
          normalizeFamilySlug(familySlug),
          cloneFamilyContentSnapshot(snapshot as FamilyContentSnapshot),
        ]),
      ),
    };
  } catch {
    return createEmptyContentStore();
  }
}

async function ensureFamilySnapshot(
  familySlug: string,
): Promise<{ store: ContentModuleStore; snapshot: FamilyContentSnapshot; normalizedFamilySlug: string }> {
  const normalizedFamilySlug = normalizeFamilySlug(familySlug);
  const store = await readContentStore();

  if (!store.families[normalizedFamilySlug]) {
    store.families[normalizedFamilySlug] = createDefaultFamilyContentSnapshot();
    await writeContentStore(store);
  }

  return {
    store,
    snapshot: store.families[normalizedFamilySlug]!,
    normalizedFamilySlug,
  };
}

function ensureUniqueSlug<T extends { slug: string }>(
  records: readonly T[],
  nextSlug: string,
  excludedSlug?: string,
) {
  const duplicated = records.find((record) => record.slug === nextSlug && record.slug !== excludedSlug);

  if (duplicated) {
    throw new Error("이미 사용 중인 슬러그입니다. 다른 주소를 사용해 주세요.");
  }
}

function resolveEditableSlug(title: string, explicitSlug?: string): string {
  const normalized = normalizeSlug(explicitSlug && explicitSlug.length > 0 ? explicitSlug : title);

  if (!normalized) {
    throw new Error("제목을 기준으로 유효한 슬러그를 만들 수 없습니다.");
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

export async function getFamilyContentSnapshot(familySlug: string): Promise<FamilyContentSnapshot> {
  const { snapshot } = await ensureFamilySnapshot(familySlug);
  return cloneFamilyContentSnapshot(snapshot);
}

export async function buildFamilyContentDashboardFeeds(input: {
  familySlug: string;
  tenantId: string;
  enabledModules: readonly string[];
  now?: string | Date;
}): Promise<DashboardModuleFeed[]> {
  const snapshot = await getFamilyContentSnapshot(input.familySlug);
  const generatedAt =
    typeof input.now === "string"
      ? input.now
      : (input.now ?? new Date()).toISOString();
  const enabledModules = new Set(input.enabledModules);
  const feeds: DashboardModuleFeed[] = [];

  if (enabledModules.has("announcements")) {
    feeds.push(
      buildAnnouncementsDashboardFeed({
        familySlug: input.familySlug,
        tenantId: input.tenantId,
        generatedAt,
        items: snapshot.announcements,
        ...(input.now ? { now: input.now } : {}),
      }),
    );
  }

  if (enabledModules.has("posts")) {
    feeds.push(
      buildPostsDashboardFeed({
        familySlug: input.familySlug,
        tenantId: input.tenantId,
        generatedAt,
        items: snapshot.posts,
        ...(input.now ? { now: input.now } : {}),
      }),
    );
  }

  if (enabledModules.has("gallery")) {
    feeds.push(
      buildGalleryDashboardFeed({
        familySlug: input.familySlug,
        tenantId: input.tenantId,
        generatedAt,
        items: snapshot.gallery,
        ...(input.now ? { now: input.now } : {}),
      }),
    );
  }

  if (enabledModules.has("diary")) {
    feeds.push(
      buildDiaryDashboardFeed({
        familySlug: input.familySlug,
        tenantId: input.tenantId,
        generatedAt,
        items: snapshot.diary,
        ...(input.now ? { now: input.now } : {}),
      }),
    );
  }

  return feeds;
}

async function createRecord<TRecord extends { id: string; slug: string; createdAt: string; updatedAt: string }>(
  familySlug: string,
  getRecords: (snapshot: FamilyContentSnapshot) => TRecord[],
  setRecords: (snapshot: FamilyContentSnapshot, records: TRecord[]) => FamilyContentSnapshot,
  createNext: (inputSlug: string, now: string) => TRecord,
  title: string,
  explicitSlug?: string,
): Promise<TRecord> {
  const { store, snapshot, normalizedFamilySlug } = await ensureFamilySnapshot(familySlug);
  const nextSlug = resolveEditableSlug(title, explicitSlug);
  const records = getRecords(snapshot);
  ensureUniqueSlug(records, nextSlug);
  const now = new Date().toISOString();
  const record = createNext(nextSlug, now);

  store.families[normalizedFamilySlug] = setRecords(snapshot, [record, ...records]);
  await writeContentStore(store);

  return { ...record };
}

async function updateRecord<TRecord extends { slug: string; updatedAt: string }>(
  familySlug: string,
  currentSlug: string,
  getRecords: (snapshot: FamilyContentSnapshot) => TRecord[],
  setRecords: (snapshot: FamilyContentSnapshot, records: TRecord[]) => FamilyContentSnapshot,
  buildNext: (current: TRecord, nextSlug: string) => TRecord,
  title: string,
  explicitSlug?: string,
  missingMessage = "수정할 항목을 찾지 못했습니다.",
): Promise<TRecord> {
  const { store, snapshot, normalizedFamilySlug } = await ensureFamilySnapshot(familySlug);
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
  store.families[normalizedFamilySlug] = setRecords(snapshot, nextRecords);
  await writeContentStore(store);

  return { ...nextRecord };
}

async function deleteRecord<TRecord extends { slug: string }>(
  familySlug: string,
  slug: string,
  getRecords: (snapshot: FamilyContentSnapshot) => TRecord[],
  setRecords: (snapshot: FamilyContentSnapshot, records: TRecord[]) => FamilyContentSnapshot,
): Promise<void> {
  const { store, snapshot, normalizedFamilySlug } = await ensureFamilySnapshot(familySlug);
  const nextRecords = getRecords(snapshot).filter((record) => record.slug !== slug);
  store.families[normalizedFamilySlug] = setRecords(snapshot, nextRecords);
  await writeContentStore(store);
}

export async function listAnnouncementRecords(familySlug: string): Promise<StoredAnnouncement[]> {
  const snapshot = await getFamilyContentSnapshot(familySlug);
  return sortByUpdatedAtDesc(snapshot.announcements).map(cloneAnnouncement);
}

export async function getAnnouncementRecord(familySlug: string, slug: string): Promise<StoredAnnouncement | null> {
  const snapshot = await getFamilyContentSnapshot(familySlug);
  return snapshot.announcements.find((record) => record.slug === slug) ?? null;
}

export async function createAnnouncementRecord(familySlug: string, input: AnnouncementRecordInput): Promise<StoredAnnouncement> {
  return createRecord(
    familySlug,
    (snapshot) => snapshot.announcements,
    (snapshot, records) => ({ ...snapshot, announcements: records }),
    (nextSlug, now) => {
      const displayStartsAt = normalizeOptionalIso(input.displayStartsAt);
      const displayEndsAt = normalizeOptionalIso(input.displayEndsAt);

      return {
        id: `announcement-${randomUUID()}`,
        slug: nextSlug,
        audience: input.audience,
        visibilityScope: input.visibilityScope,
        title: input.title,
        excerpt: input.excerpt,
        body: input.body,
        severity: input.severity,
        ...(input.pinned !== undefined ? { pinned: input.pinned } : {}),
        ...(input.requiresReadAck !== undefined ? { requiresReadAck: input.requiresReadAck } : {}),
        ...(input.readAckTarget !== undefined ? { readAckTarget: input.readAckTarget } : {}),
        ...(input.readAckConfirmed !== undefined ? { readAckConfirmed: input.readAckConfirmed } : {}),
        ...(displayStartsAt ? { displayStartsAt } : {}),
        ...(displayEndsAt ? { displayEndsAt } : {}),
        createdAt: now,
        updatedAt: now,
      };
    },
    input.title,
    input.slug,
  );
}

export async function updateAnnouncementRecord(
  familySlug: string,
  currentSlug: string,
  input: AnnouncementRecordInput,
): Promise<StoredAnnouncement> {
  return updateRecord(
    familySlug,
    currentSlug,
    (snapshot) => snapshot.announcements,
    (snapshot, records) => ({ ...snapshot, announcements: records }),
    (current, nextSlug) => {
      const displayStartsAt = normalizeOptionalIso(input.displayStartsAt);
      const displayEndsAt = normalizeOptionalIso(input.displayEndsAt);

      return {
        id: current.id,
        createdAt: current.createdAt,
        slug: nextSlug,
        audience: input.audience,
        visibilityScope: input.visibilityScope,
        title: input.title,
        excerpt: input.excerpt,
        body: input.body,
        severity: input.severity,
        ...(input.pinned !== undefined ? { pinned: input.pinned } : {}),
        ...(input.requiresReadAck !== undefined ? { requiresReadAck: input.requiresReadAck } : {}),
        ...(input.readAckTarget !== undefined ? { readAckTarget: input.readAckTarget } : {}),
        ...(input.readAckConfirmed !== undefined ? { readAckConfirmed: input.readAckConfirmed } : {}),
        ...(displayStartsAt ? { displayStartsAt } : {}),
        ...(displayEndsAt ? { displayEndsAt } : {}),
        updatedAt: new Date().toISOString(),
      };
    },
    input.title,
    input.slug,
    "수정할 공지를 찾지 못했습니다.",
  );
}

export async function deleteAnnouncementRecord(familySlug: string, slug: string): Promise<void> {
  await deleteRecord(
    familySlug,
    slug,
    (snapshot) => snapshot.announcements,
    (snapshot, records) => ({ ...snapshot, announcements: records }),
  );
}

export async function listPostRecords(familySlug: string): Promise<StoredPost[]> {
  const snapshot = await getFamilyContentSnapshot(familySlug);
  return sortByUpdatedAtDesc(snapshot.posts).map(clonePost);
}

export async function getPostRecord(familySlug: string, slug: string): Promise<StoredPost | null> {
  const snapshot = await getFamilyContentSnapshot(familySlug);
  return snapshot.posts.find((record) => record.slug === slug) ?? null;
}

export async function createPostRecord(familySlug: string, input: PostRecordInput): Promise<StoredPost> {
  return createRecord(
    familySlug,
    (snapshot) => snapshot.posts,
    (snapshot, records) => ({ ...snapshot, posts: records }),
    (nextSlug, now) => ({
      id: `post-${randomUUID()}`,
      slug: nextSlug,
      audience: input.audience,
      visibilityScope: input.visibilityScope,
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      category: input.category,
      ...(input.featured !== undefined ? { featured: input.featured } : {}),
      ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
      createdAt: now,
      updatedAt: now,
    }),
    input.title,
    input.slug,
  );
}

export async function updatePostRecord(
  familySlug: string,
  currentSlug: string,
  input: PostRecordInput,
): Promise<StoredPost> {
  return updateRecord(
    familySlug,
    currentSlug,
    (snapshot) => snapshot.posts,
    (snapshot, records) => ({ ...snapshot, posts: records }),
    (current, nextSlug) => ({
      id: current.id,
      createdAt: current.createdAt,
      slug: nextSlug,
      audience: input.audience,
      visibilityScope: input.visibilityScope,
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      category: input.category,
      ...(input.featured !== undefined ? { featured: input.featured } : {}),
      ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
      updatedAt: new Date().toISOString(),
    }),
    input.title,
    input.slug,
    "수정할 글을 찾지 못했습니다.",
  );
}

export async function deletePostRecord(familySlug: string, slug: string): Promise<void> {
  await deleteRecord(
    familySlug,
    slug,
    (snapshot) => snapshot.posts,
    (snapshot, records) => ({ ...snapshot, posts: records }),
  );
}

export async function listGalleryRecords(familySlug: string): Promise<StoredGallery[]> {
  const snapshot = await getFamilyContentSnapshot(familySlug);
  return sortByUpdatedAtDesc(snapshot.gallery).map(cloneGallery);
}

export async function getGalleryRecord(familySlug: string, slug: string): Promise<StoredGallery | null> {
  const snapshot = await getFamilyContentSnapshot(familySlug);
  return snapshot.gallery.find((record) => record.slug === slug) ?? null;
}

export async function createGalleryRecord(familySlug: string, input: GalleryRecordInput): Promise<StoredGallery> {
  return createRecord(
    familySlug,
    (snapshot) => snapshot.gallery,
    (snapshot, records) => ({ ...snapshot, gallery: records }),
    (nextSlug, now) => ({
      id: `gallery-${randomUUID()}`,
      slug: nextSlug,
      audience: input.audience,
      visibilityScope: input.visibilityScope,
      title: input.title,
      caption: input.caption,
      photoCount: input.photoCount,
      ...(input.featured !== undefined ? { featured: input.featured } : {}),
      ...(input.noteCount !== undefined ? { noteCount: input.noteCount } : {}),
      ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
      createdAt: now,
      updatedAt: now,
    }),
    input.title,
    input.slug,
  );
}

export async function updateGalleryRecord(
  familySlug: string,
  currentSlug: string,
  input: GalleryRecordInput,
): Promise<StoredGallery> {
  return updateRecord(
    familySlug,
    currentSlug,
    (snapshot) => snapshot.gallery,
    (snapshot, records) => ({ ...snapshot, gallery: records }),
    (current, nextSlug) => ({
      id: current.id,
      createdAt: current.createdAt,
      slug: nextSlug,
      audience: input.audience,
      visibilityScope: input.visibilityScope,
      title: input.title,
      caption: input.caption,
      photoCount: input.photoCount,
      ...(input.featured !== undefined ? { featured: input.featured } : {}),
      ...(input.noteCount !== undefined ? { noteCount: input.noteCount } : {}),
      ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
      updatedAt: new Date().toISOString(),
    }),
    input.title,
    input.slug,
    "수정할 갤러리 항목을 찾지 못했습니다.",
  );
}

export async function deleteGalleryRecord(familySlug: string, slug: string): Promise<void> {
  await deleteRecord(
    familySlug,
    slug,
    (snapshot) => snapshot.gallery,
    (snapshot, records) => ({ ...snapshot, gallery: records }),
  );
}

export async function listDiaryRecords(familySlug: string): Promise<StoredDiaryEntry[]> {
  const snapshot = await getFamilyContentSnapshot(familySlug);
  return sortByUpdatedAtDesc(snapshot.diary).map(cloneDiary);
}

export async function getDiaryRecord(familySlug: string, slug: string): Promise<StoredDiaryEntry | null> {
  const snapshot = await getFamilyContentSnapshot(familySlug);
  return snapshot.diary.find((record) => record.slug === slug) ?? null;
}

export async function createDiaryRecord(familySlug: string, input: DiaryRecordInput): Promise<StoredDiaryEntry> {
  return createRecord(
    familySlug,
    (snapshot) => snapshot.diary,
    (snapshot, records) => ({ ...snapshot, diary: records }),
    (nextSlug, now) => ({
      id: `diary-${randomUUID()}`,
      slug: nextSlug,
      audience: input.audience,
      visibilityScope: input.visibilityScope,
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      ...(input.highlighted !== undefined ? { highlighted: input.highlighted } : {}),
      ...(input.moodLabel ? { moodLabel: input.moodLabel } : {}),
      createdAt: now,
      updatedAt: now,
    }),
    input.title,
    input.slug,
  );
}

export async function updateDiaryRecord(
  familySlug: string,
  currentSlug: string,
  input: DiaryRecordInput,
): Promise<StoredDiaryEntry> {
  return updateRecord(
    familySlug,
    currentSlug,
    (snapshot) => snapshot.diary,
    (snapshot, records) => ({ ...snapshot, diary: records }),
    (current, nextSlug) => ({
      id: current.id,
      createdAt: current.createdAt,
      slug: nextSlug,
      audience: input.audience,
      visibilityScope: input.visibilityScope,
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      ...(input.highlighted !== undefined ? { highlighted: input.highlighted } : {}),
      ...(input.moodLabel ? { moodLabel: input.moodLabel } : {}),
      updatedAt: new Date().toISOString(),
    }),
    input.title,
    input.slug,
    "수정할 일기를 찾지 못했습니다.",
  );
}

export async function deleteDiaryRecord(familySlug: string, slug: string): Promise<void> {
  await deleteRecord(
    familySlug,
    slug,
    (snapshot) => snapshot.diary,
    (snapshot, records) => ({ ...snapshot, diary: records }),
  );
}

export function getAnnouncementSeverityLabel(severity: AnnouncementFixture["severity"]): string {
  switch (severity) {
    case "urgent":
      return "긴급";
    case "important":
      return "중요";
    default:
      return "일반";
  }
}

export function getPostCategoryLabel(category: PostFixture["category"]): string {
  switch (category) {
    case "guide":
      return "가이드";
    case "note":
      return "기록";
    default:
      return "업데이트";
  }
}

export function getDiaryBadgeLabel(record: Pick<StoredDiaryEntry, "moodLabel" | "highlighted">): string {
  return record.moodLabel ?? (record.highlighted ? "기록" : "일기");
}

export function getContentRecordUpdatedLabel(updatedAt: string): string {
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
