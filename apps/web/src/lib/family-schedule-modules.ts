import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { DashboardModuleFeed } from "@ysplan/dashboard";
import {
  buildCalendarDashboardFeed,
  calendarScheduleFixtures,
  selectCalendarDashboardSchedules,
  type CalendarDashboardSelection,
  type CalendarScheduleFixture,
} from "@ysplan/modules-calendar";
import {
  buildDayPlannerDashboardFeed,
  dayPlannerBlockFixtures,
  selectDayPlannerDashboardBlocks,
  type DayPlannerBlockFixture,
  type DayPlannerDashboardSelection,
} from "@ysplan/modules-day-planner";
import {
  buildSchoolTimetableDashboardFeed,
  schoolTimetableFixtures,
  selectSchoolTimetableDashboardSchedules,
  type SchoolTimetableDashboardSelection,
  type SchoolTimetableFixture,
} from "@ysplan/modules-school-timetable";
import {
  buildTodoDashboardFeed,
  selectTodoDashboardItems,
  todoItemFixtures,
  type TodoDashboardSelection,
  type TodoItemFixture,
} from "@ysplan/modules-todo";

import { buildModuleItemSlug } from "./schedule-module-utils";

const familyScheduleModuleStorePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../data/family-schedule-modules.json",
);

interface FamilyScheduleModuleStore {
  version: 1;
  metadata: {
    backend: "file";
    lastWriteAt: string | null;
  };
  families: Record<string, StoredFamilyScheduleModuleRecord>;
}

interface StoredFamilyScheduleModuleRecord {
  calendar: CalendarScheduleFixture[];
  todo: TodoItemFixture[];
  schoolTimetable: SchoolTimetableFixture[];
  dayPlanner: DayPlannerBlockFixture[];
}

export type FamilyScheduleModuleRecord = StoredFamilyScheduleModuleRecord;

export interface BuildFamilyScheduleDashboardFeedsInput {
  familySlug: string;
  tenantId: string;
  timezone: string;
  now?: string | Date;
  generatedAt?: string;
}

export interface CalendarScheduleDraft {
  id?: string | undefined;
  slug?: string | undefined;
  audience: CalendarScheduleFixture["audience"];
  visibilityScope: CalendarScheduleFixture["visibilityScope"];
  title: string;
  startsAt: string;
  endsAt?: string | undefined;
  location?: string | undefined;
  ownerLabel?: string | undefined;
  affectsFamilyFlow: boolean;
}

export interface TodoItemDraft {
  id?: string | undefined;
  slug?: string | undefined;
  audience: TodoItemFixture["audience"];
  visibilityScope: TodoItemFixture["visibilityScope"];
  title: string;
  dueAt: string;
  completed: boolean;
  overdue?: boolean | undefined;
  blocksFamilyFlow: boolean;
  assigneeLabel?: string | undefined;
}

export interface SchoolTimetableDraft {
  id?: string | undefined;
  slug?: string | undefined;
  audience: SchoolTimetableFixture["audience"];
  visibilityScope: SchoolTimetableFixture["visibilityScope"];
  studentLabel: string;
  title: string;
  startsAt: string;
  endsAt?: string | undefined;
  preparationNote?: string | undefined;
  affectsFamilyFlow: boolean;
}

export interface DayPlannerBlockDraft {
  id?: string | undefined;
  slug?: string | undefined;
  audience: DayPlannerBlockFixture["audience"];
  visibilityScope: DayPlannerBlockFixture["visibilityScope"];
  title: string;
  startsAt: string;
  endsAt: string;
  ownerLabel?: string | undefined;
  affectsFamilyFlow: boolean;
}

function cloneEntries<T extends object>(entries: readonly T[]): T[] {
  return entries.map((entry) => ({ ...entry }));
}

function createEmptyFamilyScheduleModuleStore(): FamilyScheduleModuleStore {
  return {
    version: 1,
    metadata: {
      backend: "file",
      lastWriteAt: null,
    },
    families: {},
  };
}

function createDefaultFamilyScheduleModuleRecord(): StoredFamilyScheduleModuleRecord {
  return {
    calendar: cloneEntries(calendarScheduleFixtures),
    todo: cloneEntries(todoItemFixtures),
    schoolTimetable: cloneEntries(schoolTimetableFixtures),
    dayPlanner: cloneEntries(dayPlannerBlockFixtures),
  };
}

function cloneFamilyScheduleModuleRecord(
  record: StoredFamilyScheduleModuleRecord,
): FamilyScheduleModuleRecord {
  return {
    calendar: cloneEntries(record.calendar),
    todo: cloneEntries(record.todo),
    schoolTimetable: cloneEntries(record.schoolTimetable),
    dayPlanner: cloneEntries(record.dayPlanner),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readEntries<T extends object>(value: unknown, fallback: readonly T[]): T[] {
  return Array.isArray(value) ? cloneEntries(value as T[]) : cloneEntries(fallback);
}

function sanitizeFamilyScheduleModuleRecord(value: unknown): StoredFamilyScheduleModuleRecord {
  if (!isRecord(value)) {
    return createDefaultFamilyScheduleModuleRecord();
  }

  return {
    calendar: readEntries(value.calendar, calendarScheduleFixtures),
    todo: readEntries(value.todo, todoItemFixtures),
    schoolTimetable: readEntries(value.schoolTimetable, schoolTimetableFixtures),
    dayPlanner: readEntries(value.dayPlanner, dayPlannerBlockFixtures),
  };
}

function normalizeFamilySlug(familySlug: string): string {
  return familySlug.trim().toLowerCase();
}

async function ensureFamilyScheduleModuleStore(): Promise<void> {
  await mkdir(path.dirname(familyScheduleModuleStorePath), { recursive: true });

  try {
    await readFile(familyScheduleModuleStorePath, "utf8");
  } catch {
    await writeFile(
      familyScheduleModuleStorePath,
      `${JSON.stringify(createEmptyFamilyScheduleModuleStore(), null, 2)}\n`,
      "utf8",
    );
  }
}

async function readFamilyScheduleModuleStore(): Promise<FamilyScheduleModuleStore> {
  await ensureFamilyScheduleModuleStore();

  try {
    const raw = await readFile(familyScheduleModuleStorePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;

    if (!isRecord(parsed)) {
      return createEmptyFamilyScheduleModuleStore();
    }

    const families = isRecord(parsed.families)
      ? Object.fromEntries(
          Object.entries(parsed.families).map(([familySlug, value]) => [
            familySlug,
            sanitizeFamilyScheduleModuleRecord(value),
          ]),
        )
      : {};

    return {
      version: 1,
      metadata: {
        backend: "file",
        lastWriteAt:
          isRecord(parsed.metadata) && typeof parsed.metadata.lastWriteAt === "string"
            ? parsed.metadata.lastWriteAt
            : null,
      },
      families,
    };
  } catch {
    return createEmptyFamilyScheduleModuleStore();
  }
}

async function writeFamilyScheduleModuleStore(
  store: FamilyScheduleModuleStore,
): Promise<void> {
  const nextStore: FamilyScheduleModuleStore = {
    ...store,
    metadata: {
      ...store.metadata,
      lastWriteAt: new Date().toISOString(),
    },
  };

  await mkdir(path.dirname(familyScheduleModuleStorePath), { recursive: true });
  await writeFile(
    familyScheduleModuleStorePath,
    `${JSON.stringify(nextStore, null, 2)}\n`,
    "utf8",
  );
}

function ensureStoredFamilyRecord(
  store: FamilyScheduleModuleStore,
  familySlug: string,
): StoredFamilyScheduleModuleRecord {
  const normalizedSlug = normalizeFamilySlug(familySlug);

  if (!store.families[normalizedSlug]) {
    store.families[normalizedSlug] = createDefaultFamilyScheduleModuleRecord();
  }

  return store.families[normalizedSlug]!;
}

function findItemBySlug<T extends { slug: string }>(
  items: readonly T[],
  itemSlug: string,
): T | null {
  const normalizedSlug = itemSlug.trim().toLowerCase();
  return items.find((item) => item.slug === normalizedSlug) ?? null;
}

function resolveItemSlug<T extends { id: string; slug: string }>(
  items: readonly T[],
  requestedSlug: string | undefined,
  title: string,
  currentId?: string,
): string {
  const seed = requestedSlug && requestedSlug.trim().length > 0 ? requestedSlug : title;
  const baseSlug = buildModuleItemSlug(seed) || `item-${randomUUID().slice(0, 8)}`;
  let candidateSlug = baseSlug;
  let suffix = 2;

  while (items.some((item) => item.slug === candidateSlug && item.id !== currentId)) {
    candidateSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidateSlug;
}

function upsertItem<T extends { id: string; slug: string }>(
  items: T[],
  originalSlug: string | undefined,
  nextItem: T,
): void {
  const normalizedOriginalSlug = originalSlug?.trim().toLowerCase();
  const existingIndex = normalizedOriginalSlug
    ? items.findIndex((item) => item.slug === normalizedOriginalSlug)
    : -1;

  if (existingIndex >= 0) {
    items[existingIndex] = nextItem;
    return;
  }

  items.unshift(nextItem);
}

function deleteItemBySlug<T extends { slug: string }>(items: T[], itemSlug: string): boolean {
  const normalizedSlug = itemSlug.trim().toLowerCase();
  const index = items.findIndex((item) => item.slug === normalizedSlug);

  if (index < 0) {
    return false;
  }

  items.splice(index, 1);
  return true;
}

function normalizeCalendarDraft(
  items: readonly CalendarScheduleFixture[],
  draft: CalendarScheduleDraft,
  existing?: CalendarScheduleFixture | null,
): CalendarScheduleFixture {
  return {
    id: existing?.id ?? draft.id ?? randomUUID(),
    slug: resolveItemSlug(items, draft.slug, draft.title, existing?.id ?? draft.id),
    audience: draft.audience,
    visibilityScope: draft.visibilityScope,
    title: draft.title.trim(),
    startsAt: draft.startsAt,
    affectsFamilyFlow: draft.affectsFamilyFlow,
    ...(draft.endsAt?.trim() ? { endsAt: draft.endsAt.trim() } : {}),
    ...(draft.location?.trim() ? { location: draft.location.trim() } : {}),
    ...(draft.ownerLabel?.trim() ? { ownerLabel: draft.ownerLabel.trim() } : {}),
  };
}

function normalizeTodoDraft(
  items: readonly TodoItemFixture[],
  draft: TodoItemDraft,
  existing?: TodoItemFixture | null,
): TodoItemFixture {
  return {
    id: existing?.id ?? draft.id ?? randomUUID(),
    slug: resolveItemSlug(items, draft.slug, draft.title, existing?.id ?? draft.id),
    audience: draft.audience,
    visibilityScope: draft.visibilityScope,
    title: draft.title.trim(),
    dueAt: draft.dueAt,
    completed: draft.completed,
    blocksFamilyFlow: draft.blocksFamilyFlow,
    ...(draft.overdue ? { overdue: true } : {}),
    ...(draft.assigneeLabel?.trim() ? { assigneeLabel: draft.assigneeLabel.trim() } : {}),
  };
}

function normalizeSchoolTimetableDraft(
  items: readonly SchoolTimetableFixture[],
  draft: SchoolTimetableDraft,
  existing?: SchoolTimetableFixture | null,
): SchoolTimetableFixture {
  return {
    id: existing?.id ?? draft.id ?? randomUUID(),
    slug: resolveItemSlug(items, draft.slug, draft.title, existing?.id ?? draft.id),
    audience: draft.audience,
    visibilityScope: draft.visibilityScope,
    studentLabel: draft.studentLabel.trim(),
    title: draft.title.trim(),
    startsAt: draft.startsAt,
    affectsFamilyFlow: draft.affectsFamilyFlow,
    ...(draft.endsAt?.trim() ? { endsAt: draft.endsAt.trim() } : {}),
    ...(draft.preparationNote?.trim()
      ? { preparationNote: draft.preparationNote.trim() }
      : {}),
  };
}

function normalizeDayPlannerDraft(
  items: readonly DayPlannerBlockFixture[],
  draft: DayPlannerBlockDraft,
  existing?: DayPlannerBlockFixture | null,
): DayPlannerBlockFixture {
  return {
    id: existing?.id ?? draft.id ?? randomUUID(),
    slug: resolveItemSlug(items, draft.slug, draft.title, existing?.id ?? draft.id),
    audience: draft.audience,
    visibilityScope: draft.visibilityScope,
    title: draft.title.trim(),
    startsAt: draft.startsAt,
    endsAt: draft.endsAt,
    affectsFamilyFlow: draft.affectsFamilyFlow,
    ...(draft.ownerLabel?.trim() ? { ownerLabel: draft.ownerLabel.trim() } : {}),
  };
}

function buildOptionalTimeContext(input: {
  now?: string | Date;
  generatedAt?: string;
}): {
  now?: string | Date;
  generatedAt?: string;
} {
  return {
    ...(input.now !== undefined ? { now: input.now } : {}),
    ...(input.generatedAt !== undefined ? { generatedAt: input.generatedAt } : {}),
  };
}

export async function getFamilyScheduleModuleRecord(
  familySlug: string,
): Promise<FamilyScheduleModuleRecord> {
  const store = await readFamilyScheduleModuleStore();
  const record =
    store.families[normalizeFamilySlug(familySlug)] ?? createDefaultFamilyScheduleModuleRecord();

  return cloneFamilyScheduleModuleRecord(record);
}

export async function listFamilyCalendarSchedules(
  familySlug: string,
): Promise<CalendarScheduleFixture[]> {
  return (await getFamilyScheduleModuleRecord(familySlug)).calendar;
}

export async function listFamilyTodoItems(familySlug: string): Promise<TodoItemFixture[]> {
  return (await getFamilyScheduleModuleRecord(familySlug)).todo;
}

export async function listFamilySchoolTimetableSchedules(
  familySlug: string,
): Promise<SchoolTimetableFixture[]> {
  return (await getFamilyScheduleModuleRecord(familySlug)).schoolTimetable;
}

export async function listFamilyDayPlannerBlocks(
  familySlug: string,
): Promise<DayPlannerBlockFixture[]> {
  return (await getFamilyScheduleModuleRecord(familySlug)).dayPlanner;
}

export async function getFamilyCalendarScheduleBySlug(
  familySlug: string,
  itemSlug: string,
): Promise<CalendarScheduleFixture | null> {
  return findItemBySlug(await listFamilyCalendarSchedules(familySlug), itemSlug);
}

export async function getFamilyTodoItemBySlug(
  familySlug: string,
  itemSlug: string,
): Promise<TodoItemFixture | null> {
  return findItemBySlug(await listFamilyTodoItems(familySlug), itemSlug);
}

export async function getFamilySchoolTimetableBySlug(
  familySlug: string,
  itemSlug: string,
): Promise<SchoolTimetableFixture | null> {
  return findItemBySlug(await listFamilySchoolTimetableSchedules(familySlug), itemSlug);
}

export async function getFamilyDayPlannerBlockBySlug(
  familySlug: string,
  itemSlug: string,
): Promise<DayPlannerBlockFixture | null> {
  return findItemBySlug(await listFamilyDayPlannerBlocks(familySlug), itemSlug);
}

export async function upsertFamilyCalendarSchedule(input: {
  familySlug: string;
  originalSlug?: string;
  schedule: CalendarScheduleDraft;
}): Promise<CalendarScheduleFixture> {
  const store = await readFamilyScheduleModuleStore();
  const record = ensureStoredFamilyRecord(store, input.familySlug);
  const existing = input.originalSlug
    ? findItemBySlug(record.calendar, input.originalSlug)
    : null;
  const nextSchedule = normalizeCalendarDraft(record.calendar, input.schedule, existing);

  upsertItem(record.calendar, input.originalSlug ?? input.schedule.slug, nextSchedule);
  await writeFamilyScheduleModuleStore(store);

  return { ...nextSchedule };
}

export async function upsertFamilyTodoItem(input: {
  familySlug: string;
  originalSlug?: string;
  todo: TodoItemDraft;
}): Promise<TodoItemFixture> {
  const store = await readFamilyScheduleModuleStore();
  const record = ensureStoredFamilyRecord(store, input.familySlug);
  const existing = input.originalSlug
    ? findItemBySlug(record.todo, input.originalSlug)
    : null;
  const nextTodo = normalizeTodoDraft(record.todo, input.todo, existing);

  upsertItem(record.todo, input.originalSlug ?? input.todo.slug, nextTodo);
  await writeFamilyScheduleModuleStore(store);

  return { ...nextTodo };
}

export async function upsertFamilySchoolTimetable(input: {
  familySlug: string;
  originalSlug?: string;
  schedule: SchoolTimetableDraft;
}): Promise<SchoolTimetableFixture> {
  const store = await readFamilyScheduleModuleStore();
  const record = ensureStoredFamilyRecord(store, input.familySlug);
  const existing = input.originalSlug
    ? findItemBySlug(record.schoolTimetable, input.originalSlug)
    : null;
  const nextSchedule = normalizeSchoolTimetableDraft(
    record.schoolTimetable,
    input.schedule,
    existing,
  );

  upsertItem(
    record.schoolTimetable,
    input.originalSlug ?? input.schedule.slug,
    nextSchedule,
  );
  await writeFamilyScheduleModuleStore(store);

  return { ...nextSchedule };
}

export async function upsertFamilyDayPlannerBlock(input: {
  familySlug: string;
  originalSlug?: string;
  block: DayPlannerBlockDraft;
}): Promise<DayPlannerBlockFixture> {
  const store = await readFamilyScheduleModuleStore();
  const record = ensureStoredFamilyRecord(store, input.familySlug);
  const existing = input.originalSlug
    ? findItemBySlug(record.dayPlanner, input.originalSlug)
    : null;
  const nextBlock = normalizeDayPlannerDraft(record.dayPlanner, input.block, existing);

  upsertItem(record.dayPlanner, input.originalSlug ?? input.block.slug, nextBlock);
  await writeFamilyScheduleModuleStore(store);

  return { ...nextBlock };
}

export async function deleteFamilyCalendarSchedule(
  familySlug: string,
  itemSlug: string,
): Promise<boolean> {
  const store = await readFamilyScheduleModuleStore();
  const record = ensureStoredFamilyRecord(store, familySlug);
  const deleted = deleteItemBySlug(record.calendar, itemSlug);

  if (deleted) {
    await writeFamilyScheduleModuleStore(store);
  }

  return deleted;
}

export async function deleteFamilyTodoItem(
  familySlug: string,
  itemSlug: string,
): Promise<boolean> {
  const store = await readFamilyScheduleModuleStore();
  const record = ensureStoredFamilyRecord(store, familySlug);
  const deleted = deleteItemBySlug(record.todo, itemSlug);

  if (deleted) {
    await writeFamilyScheduleModuleStore(store);
  }

  return deleted;
}

export async function deleteFamilySchoolTimetable(
  familySlug: string,
  itemSlug: string,
): Promise<boolean> {
  const store = await readFamilyScheduleModuleStore();
  const record = ensureStoredFamilyRecord(store, familySlug);
  const deleted = deleteItemBySlug(record.schoolTimetable, itemSlug);

  if (deleted) {
    await writeFamilyScheduleModuleStore(store);
  }

  return deleted;
}

export async function deleteFamilyDayPlannerBlock(
  familySlug: string,
  itemSlug: string,
): Promise<boolean> {
  const store = await readFamilyScheduleModuleStore();
  const record = ensureStoredFamilyRecord(store, familySlug);
  const deleted = deleteItemBySlug(record.dayPlanner, itemSlug);

  if (deleted) {
    await writeFamilyScheduleModuleStore(store);
  }

  return deleted;
}

export async function getCalendarDashboardSelectionForFamily(input: {
  familySlug: string;
  timezone: string;
  now?: string | Date;
  generatedAt?: string;
}): Promise<CalendarDashboardSelection> {
  const schedules = await listFamilyCalendarSchedules(input.familySlug);

  return selectCalendarDashboardSchedules({
    timezone: input.timezone,
    schedules,
    ...buildOptionalTimeContext(input),
  });
}

export async function getTodoDashboardSelectionForFamily(input: {
  familySlug: string;
  timezone: string;
  now?: string | Date;
  generatedAt?: string;
}): Promise<TodoDashboardSelection> {
  const todos = await listFamilyTodoItems(input.familySlug);

  return selectTodoDashboardItems({
    timezone: input.timezone,
    todos,
    ...buildOptionalTimeContext(input),
  });
}

export async function getSchoolTimetableDashboardSelectionForFamily(input: {
  familySlug: string;
  timezone: string;
  now?: string | Date;
  generatedAt?: string;
}): Promise<SchoolTimetableDashboardSelection> {
  const schedules = await listFamilySchoolTimetableSchedules(input.familySlug);

  return selectSchoolTimetableDashboardSchedules({
    timezone: input.timezone,
    schedules,
    ...buildOptionalTimeContext(input),
  });
}

export async function getDayPlannerDashboardSelectionForFamily(input: {
  familySlug: string;
  timezone: string;
  now?: string | Date;
  generatedAt?: string;
}): Promise<DayPlannerDashboardSelection> {
  const blocks = await listFamilyDayPlannerBlocks(input.familySlug);

  return selectDayPlannerDashboardBlocks({
    timezone: input.timezone,
    blocks,
    ...buildOptionalTimeContext(input),
  });
}

export async function buildFamilyScheduleDashboardFeeds(
  input: BuildFamilyScheduleDashboardFeedsInput,
): Promise<DashboardModuleFeed[]> {
  const record = await getFamilyScheduleModuleRecord(input.familySlug);

  return [
    buildCalendarDashboardFeed({
      familySlug: input.familySlug,
      tenantId: input.tenantId,
      timezone: input.timezone,
      schedules: record.calendar,
      ...buildOptionalTimeContext(input),
    }),
    buildTodoDashboardFeed({
      familySlug: input.familySlug,
      tenantId: input.tenantId,
      timezone: input.timezone,
      todos: record.todo,
      ...buildOptionalTimeContext(input),
    }),
    buildSchoolTimetableDashboardFeed({
      familySlug: input.familySlug,
      tenantId: input.tenantId,
      timezone: input.timezone,
      schedules: record.schoolTimetable,
      ...buildOptionalTimeContext(input),
    }),
    buildDayPlannerDashboardFeed({
      familySlug: input.familySlug,
      tenantId: input.tenantId,
      timezone: input.timezone,
      blocks: record.dayPlanner,
      ...buildOptionalTimeContext(input),
    }),
  ];
}
