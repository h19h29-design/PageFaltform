import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildHabitsDashboardFeed,
  habitRoutineFixtures,
  type HabitsDashboardFeed,
  type HabitRoutineFixture,
} from "@ysplan/modules-habits";
import {
  buildProgressDashboardFeed,
  progressGoalFixtures,
  type ProgressDashboardFeed,
  type ProgressGoalFixture,
} from "@ysplan/modules-progress";
import {
  resolveModuleFeedGeneratedAt,
  type DashboardCardVisibilityScope,
  type HomeCardAudience,
} from "@ysplan/modules-core";

const DEFAULT_TRACKER_TIMEZONE = "Asia/Seoul";

export interface StoredProgressGoal extends ProgressGoalFixture {
  createdAt: string;
  updatedAt: string;
}

export interface StoredHabitRoutine extends HabitRoutineFixture {
  createdAt: string;
  updatedAt: string;
}

export interface ProgressGoalDraft {
  audience: HomeCardAudience;
  visibilityScope: DashboardCardVisibilityScope;
  title: string;
  slug?: string;
  goalOutcome: string;
  currentValue: number;
  targetValue: number;
  metricLabel: string;
  metricUnit: string;
  cadenceLabel: string;
  streakDays: number;
  dueAt?: string;
  featured?: boolean;
}

export interface HabitRoutineDraft {
  audience: HomeCardAudience;
  visibilityScope: DashboardCardVisibilityScope;
  title: string;
  slug?: string;
  periodLabel: string;
  habitBenefit: string;
  completionCount: number;
  targetCount: number;
  consistencyRate: number;
  streakDays: number;
  nextCheckInAt?: string;
  featured?: boolean;
}

interface FamilyTrackerRecords {
  progressGoals: StoredProgressGoal[];
  habitRoutines: StoredHabitRoutine[];
}

interface TrackerStoreMetadata {
  backend: "file";
  migrationTarget: "postgres";
  lastWriteAt: string | null;
}

interface TrackerStore {
  version: 1;
  metadata: TrackerStoreMetadata;
  families: Record<string, FamilyTrackerRecords>;
}

export interface BuildStoredTrackerFeedInput {
  familySlug: string;
  tenantId: string;
  timezone?: string;
  generatedAt?: string;
  now?: string | Date;
}

const trackerStorePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../data/tracker-records.json",
);

function createTrackerStoreMetadata(lastWriteAt: string | null = null): TrackerStoreMetadata {
  return {
    backend: "file",
    migrationTarget: "postgres",
    lastWriteAt,
  };
}

function createEmptyTrackerStore(): TrackerStore {
  return {
    version: 1,
    metadata: createTrackerStoreMetadata(),
    families: {},
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function toRequiredString(value: unknown, fallback: string): string {
  return toOptionalString(value) ?? fallback;
}

function toRoundedNumber(value: unknown, fallback = 0): number {
  const nextValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(nextValue)) {
    return fallback;
  }

  return Math.round(nextValue);
}

function toNonNegativeNumber(value: unknown, fallback = 0): number {
  return Math.max(0, toRoundedNumber(value, fallback));
}

function toPositiveNumber(value: unknown, fallback = 1): number {
  return Math.max(1, toRoundedNumber(value, fallback));
}

function toRate(value: unknown, fallback = 0): number {
  return Math.max(0, Math.min(100, toRoundedNumber(value, fallback)));
}

function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value === "true" || value === "1" || value === "on";
  }

  return fallback;
}

function toIsoString(value: unknown): string | undefined {
  const nextValue = toOptionalString(value);

  if (!nextValue) {
    return undefined;
  }

  const date = new Date(nextValue);

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function toAudience(value: unknown): HomeCardAudience {
  return value === "personal" ? "personal" : "family-shared";
}

function toVisibilityScope(value: unknown): DashboardCardVisibilityScope {
  switch (value) {
    case "adults":
    case "children-safe":
    case "admins":
    case "private":
      return value;
    default:
      return "all";
  }
}

function cloneStoredProgressGoal(goal: StoredProgressGoal): StoredProgressGoal {
  return {
    ...goal,
  };
}

function cloneStoredHabitRoutine(habit: StoredHabitRoutine): StoredHabitRoutine {
  return {
    ...habit,
  };
}

function parseStoredProgressGoal(value: unknown): StoredProgressGoal | null {
  if (!isRecord(value)) {
    return null;
  }

  const title = toOptionalString(value.title);

  if (!title) {
    return null;
  }

  const createdAt = toIsoString(value.createdAt) ?? new Date(0).toISOString();
  const updatedAt = toIsoString(value.updatedAt) ?? createdAt;
  const dueAt = toIsoString(value.dueAt);
  const goal: StoredProgressGoal = {
    id: toRequiredString(value.id, `progress-${randomUUID()}`),
    slug: normalizeSlug(toRequiredString(value.slug, title)) || `goal-${randomUUID().slice(0, 8)}`,
    audience: toAudience(value.audience),
    visibilityScope: toVisibilityScope(value.visibilityScope),
    title,
    goalOutcome: toRequiredString(value.goalOutcome, "Track the next family milestone together."),
    currentValue: toNonNegativeNumber(value.currentValue),
    targetValue: toPositiveNumber(value.targetValue),
    metricLabel: toRequiredString(value.metricLabel, "progress"),
    metricUnit: toRequiredString(value.metricUnit, ""),
    cadenceLabel: toRequiredString(value.cadenceLabel, "This week"),
    streakDays: toNonNegativeNumber(value.streakDays),
    featured: toBoolean(value.featured),
    createdAt,
    updatedAt,
  };

  if (dueAt) {
    goal.dueAt = dueAt;
  }

  return goal;
}

function parseStoredHabitRoutine(value: unknown): StoredHabitRoutine | null {
  if (!isRecord(value)) {
    return null;
  }

  const title = toOptionalString(value.title);

  if (!title) {
    return null;
  }

  const createdAt = toIsoString(value.createdAt) ?? new Date(0).toISOString();
  const updatedAt = toIsoString(value.updatedAt) ?? createdAt;
  const nextCheckInAt = toIsoString(value.nextCheckInAt);
  const habit: StoredHabitRoutine = {
    id: toRequiredString(value.id, `habit-${randomUUID()}`),
    slug: normalizeSlug(toRequiredString(value.slug, title)) || `habit-${randomUUID().slice(0, 8)}`,
    audience: toAudience(value.audience),
    visibilityScope: toVisibilityScope(value.visibilityScope),
    title,
    periodLabel: toRequiredString(value.periodLabel, "This week"),
    habitBenefit: toRequiredString(value.habitBenefit, "Keep the routine visible and repeatable."),
    completionCount: toNonNegativeNumber(value.completionCount),
    targetCount: toPositiveNumber(value.targetCount),
    consistencyRate: toRate(value.consistencyRate),
    streakDays: toNonNegativeNumber(value.streakDays),
    featured: toBoolean(value.featured),
    createdAt,
    updatedAt,
  };

  if (nextCheckInAt) {
    habit.nextCheckInAt = nextCheckInAt;
  }

  return habit;
}

function createSeededFamilyTrackerRecords(savedAt: string): FamilyTrackerRecords {
  return {
    progressGoals: progressGoalFixtures.map((goal) => ({
      ...goal,
      createdAt: savedAt,
      updatedAt: savedAt,
    })),
    habitRoutines: habitRoutineFixtures.map((habit) => ({
      ...habit,
      createdAt: savedAt,
      updatedAt: savedAt,
    })),
  };
}

function sanitizeFamilyTrackerRecords(value: unknown): FamilyTrackerRecords {
  if (!isRecord(value)) {
    return {
      progressGoals: [],
      habitRoutines: [],
    };
  }

  return {
    progressGoals: Array.isArray(value.progressGoals)
      ? value.progressGoals
          .map((goal) => parseStoredProgressGoal(goal))
          .filter((goal): goal is StoredProgressGoal => Boolean(goal))
      : [],
    habitRoutines: Array.isArray(value.habitRoutines)
      ? value.habitRoutines
          .map((habit) => parseStoredHabitRoutine(habit))
          .filter((habit): habit is StoredHabitRoutine => Boolean(habit))
      : [],
  };
}

function sanitizeTrackerStoreMetadata(value: unknown): TrackerStoreMetadata {
  if (!isRecord(value)) {
    return createTrackerStoreMetadata();
  }

  return {
    backend: "file",
    migrationTarget: "postgres",
    lastWriteAt: typeof value.lastWriteAt === "string" ? value.lastWriteAt : null,
  };
}

async function ensureTrackerStore(): Promise<void> {
  await mkdir(path.dirname(trackerStorePath), { recursive: true });

  try {
    await readFile(trackerStorePath, "utf8");
  } catch {
    await writeFile(trackerStorePath, `${JSON.stringify(createEmptyTrackerStore(), null, 2)}\n`, "utf8");
  }
}

async function writeTrackerStore(store: TrackerStore): Promise<void> {
  await ensureTrackerStore();
  const writtenAt = new Date().toISOString();
  const normalizedStore: TrackerStore = {
    version: 1,
    metadata: {
      ...sanitizeTrackerStoreMetadata(store.metadata),
      lastWriteAt: writtenAt,
    },
    families: Object.fromEntries(
      Object.entries(store.families).map(([familySlug, value]) => [
        familySlug,
        {
          progressGoals: value.progressGoals.map(cloneStoredProgressGoal),
          habitRoutines: value.habitRoutines.map(cloneStoredHabitRoutine),
        },
      ]),
    ),
  };

  await writeFile(trackerStorePath, `${JSON.stringify(normalizedStore, null, 2)}\n`, "utf8");
}

async function readTrackerStore(): Promise<TrackerStore> {
  await ensureTrackerStore();
  const raw = await readFile(trackerStorePath, "utf8");

  try {
    const parsed = JSON.parse(raw) as TrackerStore;

    if (!parsed || parsed.version !== 1 || !isRecord(parsed.metadata) || !isRecord(parsed.families)) {
      return createEmptyTrackerStore();
    }

    return {
      version: 1,
      metadata: sanitizeTrackerStoreMetadata(parsed.metadata),
      families: Object.fromEntries(
        Object.entries(parsed.families).map(([familySlug, value]) => [
          familySlug,
          sanitizeFamilyTrackerRecords(value),
        ]),
      ),
    };
  } catch {
    return createEmptyTrackerStore();
  }
}

async function getMutableFamilyTrackerRecords(
  familySlug: string,
): Promise<{ store: TrackerStore; records: FamilyTrackerRecords; didInitialize: boolean }> {
  const normalizedFamilySlug = familySlug.trim().toLowerCase();
  const store = await readTrackerStore();
  const existing = store.families[normalizedFamilySlug];

  if (existing) {
    return {
      store,
      records: existing,
      didInitialize: false,
    };
  }

  const seededRecords = createSeededFamilyTrackerRecords(new Date().toISOString());
  store.families[normalizedFamilySlug] = seededRecords;

  return {
    store,
    records: seededRecords,
    didInitialize: true,
  };
}

function resolveUniqueSlug(
  requestedSlug: string | undefined,
  title: string,
  existingSlugs: Iterable<string>,
  fallbackPrefix: string,
): string {
  const existingSlugSet = new Set(Array.from(existingSlugs, (value) => value.toLowerCase()));
  const baseSlug =
    normalizeSlug(requestedSlug ?? "") ||
    normalizeSlug(title) ||
    `${fallbackPrefix}-${randomUUID().slice(0, 8)}`;
  let nextSlug = baseSlug;
  let suffix = 2;

  while (existingSlugSet.has(nextSlug.toLowerCase())) {
    nextSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return nextSlug;
}

function createStoredProgressGoal(
  draft: ProgressGoalDraft,
  existingGoals: readonly StoredProgressGoal[],
): StoredProgressGoal {
  const now = new Date().toISOString();
  const title = draft.title.trim() || "Untitled goal";
  const goal: StoredProgressGoal = {
    id: `progress-${randomUUID()}`,
    slug: resolveUniqueSlug(draft.slug, title, existingGoals.map((goal) => goal.slug), "goal"),
    audience: draft.audience,
    visibilityScope: draft.visibilityScope,
    title,
    goalOutcome: draft.goalOutcome.trim() || "Keep the goal moving forward on the home board.",
    currentValue: Math.max(0, Math.round(draft.currentValue)),
    targetValue: Math.max(1, Math.round(draft.targetValue)),
    metricLabel: draft.metricLabel.trim() || "progress",
    metricUnit: draft.metricUnit.trim(),
    cadenceLabel: draft.cadenceLabel.trim() || "This week",
    streakDays: Math.max(0, Math.round(draft.streakDays)),
    featured: Boolean(draft.featured),
    createdAt: now,
    updatedAt: now,
  };

  if (draft.dueAt) {
    goal.dueAt = draft.dueAt;
  }

  return goal;
}

function createStoredHabitRoutine(
  draft: HabitRoutineDraft,
  existingHabits: readonly StoredHabitRoutine[],
): StoredHabitRoutine {
  const now = new Date().toISOString();
  const title = draft.title.trim() || "Untitled habit";
  const habit: StoredHabitRoutine = {
    id: `habit-${randomUUID()}`,
    slug: resolveUniqueSlug(draft.slug, title, existingHabits.map((habit) => habit.slug), "habit"),
    audience: draft.audience,
    visibilityScope: draft.visibilityScope,
    title,
    periodLabel: draft.periodLabel.trim() || "This week",
    habitBenefit: draft.habitBenefit.trim() || "Keep the routine easy to check and repeat.",
    completionCount: Math.max(0, Math.round(draft.completionCount)),
    targetCount: Math.max(1, Math.round(draft.targetCount)),
    consistencyRate: Math.max(0, Math.min(100, Math.round(draft.consistencyRate))),
    streakDays: Math.max(0, Math.round(draft.streakDays)),
    featured: Boolean(draft.featured),
    createdAt: now,
    updatedAt: now,
  };

  if (draft.nextCheckInAt) {
    habit.nextCheckInAt = draft.nextCheckInAt;
  }

  return habit;
}

export async function listStoredProgressGoals(familySlug: string): Promise<StoredProgressGoal[]> {
  const { store, records, didInitialize } = await getMutableFamilyTrackerRecords(familySlug);

  if (didInitialize) {
    await writeTrackerStore(store);
  }

  return records.progressGoals.map(cloneStoredProgressGoal);
}

export async function listStoredHabitRoutines(familySlug: string): Promise<StoredHabitRoutine[]> {
  const { store, records, didInitialize } = await getMutableFamilyTrackerRecords(familySlug);

  if (didInitialize) {
    await writeTrackerStore(store);
  }

  return records.habitRoutines.map(cloneStoredHabitRoutine);
}

export async function getStoredProgressGoal(
  familySlug: string,
  goalSlug: string,
): Promise<StoredProgressGoal | null> {
  const goals = await listStoredProgressGoals(familySlug);
  return goals.find((goal) => goal.slug === goalSlug.trim().toLowerCase()) ?? null;
}

export async function getStoredHabitRoutine(
  familySlug: string,
  habitSlug: string,
): Promise<StoredHabitRoutine | null> {
  const habits = await listStoredHabitRoutines(familySlug);
  return habits.find((habit) => habit.slug === habitSlug.trim().toLowerCase()) ?? null;
}

export async function createProgressGoal(
  familySlug: string,
  draft: ProgressGoalDraft,
): Promise<StoredProgressGoal> {
  const { store, records } = await getMutableFamilyTrackerRecords(familySlug);
  const goal = createStoredProgressGoal(draft, records.progressGoals);

  records.progressGoals.unshift(goal);
  await writeTrackerStore(store);

  return cloneStoredProgressGoal(goal);
}

export async function updateProgressGoal(
  familySlug: string,
  goalSlug: string,
  draft: ProgressGoalDraft,
): Promise<StoredProgressGoal | null> {
  const { store, records } = await getMutableFamilyTrackerRecords(familySlug);
  const normalizedGoalSlug = goalSlug.trim().toLowerCase();
  const existingGoal = records.progressGoals.find((goal) => goal.slug === normalizedGoalSlug);

  if (!existingGoal) {
    return null;
  }

  const nextSlug = resolveUniqueSlug(
    draft.slug,
    draft.title,
    records.progressGoals.filter((goal) => goal.id !== existingGoal.id).map((goal) => goal.slug),
    "goal",
  );

  const updatedGoal: StoredProgressGoal = {
    ...existingGoal,
    slug: nextSlug,
    audience: draft.audience,
    visibilityScope: draft.visibilityScope,
    title: draft.title.trim() || existingGoal.title,
    goalOutcome: draft.goalOutcome.trim() || existingGoal.goalOutcome,
    currentValue: Math.max(0, Math.round(draft.currentValue)),
    targetValue: Math.max(1, Math.round(draft.targetValue)),
    metricLabel: draft.metricLabel.trim() || existingGoal.metricLabel,
    metricUnit: draft.metricUnit.trim(),
    cadenceLabel: draft.cadenceLabel.trim() || existingGoal.cadenceLabel,
    streakDays: Math.max(0, Math.round(draft.streakDays)),
    featured: Boolean(draft.featured),
    updatedAt: new Date().toISOString(),
  };

  if (draft.dueAt) {
    updatedGoal.dueAt = draft.dueAt;
  } else {
    delete updatedGoal.dueAt;
  }

  records.progressGoals = records.progressGoals.map((goal) =>
    goal.id === existingGoal.id ? updatedGoal : goal,
  );
  await writeTrackerStore(store);

  return cloneStoredProgressGoal(updatedGoal);
}

export async function deleteProgressGoal(familySlug: string, goalSlug: string): Promise<boolean> {
  const { store, records } = await getMutableFamilyTrackerRecords(familySlug);
  const initialLength = records.progressGoals.length;

  records.progressGoals = records.progressGoals.filter(
    (goal) => goal.slug !== goalSlug.trim().toLowerCase(),
  );

  if (records.progressGoals.length === initialLength) {
    return false;
  }

  await writeTrackerStore(store);
  return true;
}

export async function createHabitRoutine(
  familySlug: string,
  draft: HabitRoutineDraft,
): Promise<StoredHabitRoutine> {
  const { store, records } = await getMutableFamilyTrackerRecords(familySlug);
  const habit = createStoredHabitRoutine(draft, records.habitRoutines);

  records.habitRoutines.unshift(habit);
  await writeTrackerStore(store);

  return cloneStoredHabitRoutine(habit);
}

export async function updateHabitRoutine(
  familySlug: string,
  habitSlug: string,
  draft: HabitRoutineDraft,
): Promise<StoredHabitRoutine | null> {
  const { store, records } = await getMutableFamilyTrackerRecords(familySlug);
  const normalizedHabitSlug = habitSlug.trim().toLowerCase();
  const existingHabit = records.habitRoutines.find((habit) => habit.slug === normalizedHabitSlug);

  if (!existingHabit) {
    return null;
  }

  const nextSlug = resolveUniqueSlug(
    draft.slug,
    draft.title,
    records.habitRoutines.filter((habit) => habit.id !== existingHabit.id).map((habit) => habit.slug),
    "habit",
  );

  const updatedHabit: StoredHabitRoutine = {
    ...existingHabit,
    slug: nextSlug,
    audience: draft.audience,
    visibilityScope: draft.visibilityScope,
    title: draft.title.trim() || existingHabit.title,
    periodLabel: draft.periodLabel.trim() || existingHabit.periodLabel,
    habitBenefit: draft.habitBenefit.trim() || existingHabit.habitBenefit,
    completionCount: Math.max(0, Math.round(draft.completionCount)),
    targetCount: Math.max(1, Math.round(draft.targetCount)),
    consistencyRate: Math.max(0, Math.min(100, Math.round(draft.consistencyRate))),
    streakDays: Math.max(0, Math.round(draft.streakDays)),
    featured: Boolean(draft.featured),
    updatedAt: new Date().toISOString(),
  };

  if (draft.nextCheckInAt) {
    updatedHabit.nextCheckInAt = draft.nextCheckInAt;
  } else {
    delete updatedHabit.nextCheckInAt;
  }

  records.habitRoutines = records.habitRoutines.map((habit) =>
    habit.id === existingHabit.id ? updatedHabit : habit,
  );
  await writeTrackerStore(store);

  return cloneStoredHabitRoutine(updatedHabit);
}

export async function deleteHabitRoutine(familySlug: string, habitSlug: string): Promise<boolean> {
  const { store, records } = await getMutableFamilyTrackerRecords(familySlug);
  const initialLength = records.habitRoutines.length;

  records.habitRoutines = records.habitRoutines.filter(
    (habit) => habit.slug !== habitSlug.trim().toLowerCase(),
  );

  if (records.habitRoutines.length === initialLength) {
    return false;
  }

  await writeTrackerStore(store);
  return true;
}

function resolveTrackerFeedGeneratedAt(input: Pick<BuildStoredTrackerFeedInput, "generatedAt" | "now">): string {
  const nextInput: Pick<BuildStoredTrackerFeedInput, "generatedAt" | "now"> = {};

  if (input.generatedAt) {
    nextInput.generatedAt = input.generatedAt;
  }

  if (input.now !== undefined) {
    nextInput.now = input.now;
  }

  return resolveModuleFeedGeneratedAt(nextInput);
}

export async function buildStoredProgressDashboardFeed(
  input: BuildStoredTrackerFeedInput,
): Promise<ProgressDashboardFeed> {
  const goals = await listStoredProgressGoals(input.familySlug);

  return buildProgressDashboardFeed({
    familySlug: input.familySlug,
    tenantId: input.tenantId,
    goals,
    timezone: input.timezone ?? DEFAULT_TRACKER_TIMEZONE,
    generatedAt: resolveTrackerFeedGeneratedAt(input),
  });
}

export async function buildStoredHabitsDashboardFeed(
  input: BuildStoredTrackerFeedInput,
): Promise<HabitsDashboardFeed> {
  const habits = await listStoredHabitRoutines(input.familySlug);

  return buildHabitsDashboardFeed({
    familySlug: input.familySlug,
    tenantId: input.tenantId,
    habits,
    timezone: input.timezone ?? DEFAULT_TRACKER_TIMEZONE,
    generatedAt: resolveTrackerFeedGeneratedAt(input),
  });
}
