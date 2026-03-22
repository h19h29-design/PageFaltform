"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { DashboardVisibilityScope } from "@ysplan/dashboard";
import type { HomeCardAudience } from "@ysplan/modules-core";

import { requireFamilyAppAccessMutation } from "../lib/family-app-access";
import {
  deleteFamilyCalendarSchedule,
  deleteFamilyDayPlannerBlock,
  deleteFamilySchoolTimetable,
  deleteFamilyTodoItem,
  upsertFamilyCalendarSchedule,
  upsertFamilyDayPlannerBlock,
  upsertFamilySchoolTimetable,
  upsertFamilyTodoItem,
} from "../lib/family-schedule-modules";
import {
  parseDateTimeInputValue,
  readCheckboxField,
  readOptionalTextField,
  readTextField,
} from "../lib/schedule-module-utils";

function isRedirectError(
  error: unknown,
): error is {
  digest: string;
} {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { digest?: unknown };
  return typeof candidate.digest === "string" && candidate.digest.startsWith("NEXT_REDIRECT");
}

function readAudience(formData: FormData, name = "audience"): HomeCardAudience {
  return readTextField(formData, name) === "personal" ? "personal" : "family-shared";
}

function readVisibilityScope(
  formData: FormData,
  name = "visibilityScope",
): DashboardVisibilityScope {
  const value = readTextField(formData, name);

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

function ensureRequiredValue(value: string, label: string): string {
  if (!value) {
    throw new Error(`${label}을(를) 입력해 주세요.`);
  }

  return value;
}

function buildModulePath(
  familySlug: string,
  moduleSegment: string,
  suffix = "",
  query?: string,
): string {
  const search = query ? `?${query}` : "";
  return `/app/${familySlug}/${moduleSegment}${suffix}${search}`;
}

function redirectWithError(
  familySlug: string,
  moduleSegment: string,
  suffix: string,
  message: string,
): never {
  redirect(
    buildModulePath(
      familySlug,
      moduleSegment,
      suffix,
      `error=${encodeURIComponent(message)}`,
    ),
  );
}

function revalidateModulePaths(
  familySlug: string,
  moduleSegment: string,
  itemSlug?: string,
): void {
  revalidatePath(`/app/${familySlug}`);
  revalidatePath(`/app/${familySlug}/${moduleSegment}`);
  revalidatePath(`/app/${familySlug}/${moduleSegment}/new`);

  if (moduleSegment === "todo") {
    revalidatePath(`/app/${familySlug}/${moduleSegment}/today`);
    revalidatePath(`/app/${familySlug}/${moduleSegment}/overdue`);
  } else {
    revalidatePath(`/app/${familySlug}/${moduleSegment}/today`);
  }

  if (itemSlug) {
    revalidatePath(`/app/${familySlug}/${moduleSegment}/${itemSlug}`);
    revalidatePath(`/app/${familySlug}/${moduleSegment}/${itemSlug}/edit`);
  }
}

export async function createCalendarScheduleAction(formData: FormData) {
  const familySlug = readTextField(formData, "familySlug");

  try {
    const { workspaceView } = await requireFamilyAppAccessMutation(familySlug);
    const timezone = workspaceView.family.timezone;
    const title = ensureRequiredValue(readTextField(formData, "title"), "제목");
    const startsAt = parseDateTimeInputValue(
      ensureRequiredValue(readTextField(formData, "startsAt"), "시작 시각"),
      timezone,
    );
    const endsAtValue = readTextField(formData, "endsAt");
    const schedule = await upsertFamilyCalendarSchedule({
      familySlug,
      schedule: {
        slug: readOptionalTextField(formData, "slug"),
        audience: readAudience(formData),
        visibilityScope: readVisibilityScope(formData),
        title,
        startsAt,
        endsAt: endsAtValue ? parseDateTimeInputValue(endsAtValue, timezone) : undefined,
        location: readOptionalTextField(formData, "location"),
        ownerLabel: readOptionalTextField(formData, "ownerLabel"),
        affectsFamilyFlow: readCheckboxField(formData, "affectsFamilyFlow"),
      },
    });

    revalidateModulePaths(familySlug, "calendar", schedule.slug);
    redirect(buildModulePath(familySlug, "calendar", `/${schedule.slug}`, "state=created"));
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirectWithError(
      familySlug,
      "calendar",
      "/new",
      error instanceof Error ? error.message : "일정을 저장하지 못했습니다.",
    );
  }
}

export async function updateCalendarScheduleAction(formData: FormData) {
  const familySlug = readTextField(formData, "familySlug");
  const originalSlug = readTextField(formData, "originalSlug");

  try {
    const { workspaceView } = await requireFamilyAppAccessMutation(familySlug);
    const timezone = workspaceView.family.timezone;
    const title = ensureRequiredValue(readTextField(formData, "title"), "제목");
    const startsAt = parseDateTimeInputValue(
      ensureRequiredValue(readTextField(formData, "startsAt"), "시작 시각"),
      timezone,
    );
    const endsAtValue = readTextField(formData, "endsAt");
    const schedule = await upsertFamilyCalendarSchedule({
      familySlug,
      originalSlug,
      schedule: {
        slug: readOptionalTextField(formData, "slug"),
        audience: readAudience(formData),
        visibilityScope: readVisibilityScope(formData),
        title,
        startsAt,
        endsAt: endsAtValue ? parseDateTimeInputValue(endsAtValue, timezone) : undefined,
        location: readOptionalTextField(formData, "location"),
        ownerLabel: readOptionalTextField(formData, "ownerLabel"),
        affectsFamilyFlow: readCheckboxField(formData, "affectsFamilyFlow"),
      },
    });

    revalidateModulePaths(familySlug, "calendar", schedule.slug);
    redirect(buildModulePath(familySlug, "calendar", `/${schedule.slug}`, "state=updated"));
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirectWithError(
      familySlug,
      "calendar",
      `/${originalSlug}/edit`,
      error instanceof Error ? error.message : "일정을 수정하지 못했습니다.",
    );
  }
}

export async function deleteCalendarScheduleAction(formData: FormData) {
  const familySlug = readTextField(formData, "familySlug");
  const itemSlug = readTextField(formData, "itemSlug");

  try {
    await requireFamilyAppAccessMutation(familySlug);
    await deleteFamilyCalendarSchedule(familySlug, itemSlug);
    revalidateModulePaths(familySlug, "calendar", itemSlug);
    redirect(buildModulePath(familySlug, "calendar", "", "state=deleted"));
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirectWithError(
      familySlug,
      "calendar",
      `/${itemSlug}`,
      error instanceof Error ? error.message : "일정을 삭제하지 못했습니다.",
    );
  }
}

export async function createTodoItemAction(formData: FormData) {
  const familySlug = readTextField(formData, "familySlug");

  try {
    const { workspaceView } = await requireFamilyAppAccessMutation(familySlug);
    const timezone = workspaceView.family.timezone;
    const title = ensureRequiredValue(readTextField(formData, "title"), "제목");
    const dueAt = parseDateTimeInputValue(
      ensureRequiredValue(readTextField(formData, "dueAt"), "마감 시각"),
      timezone,
    );
    const todo = await upsertFamilyTodoItem({
      familySlug,
      todo: {
        slug: readOptionalTextField(formData, "slug"),
        audience: readAudience(formData),
        visibilityScope: readVisibilityScope(formData),
        title,
        dueAt,
        completed: readCheckboxField(formData, "completed"),
        overdue: readCheckboxField(formData, "overdue"),
        blocksFamilyFlow: readCheckboxField(formData, "blocksFamilyFlow"),
        assigneeLabel: readOptionalTextField(formData, "assigneeLabel"),
      },
    });

    revalidateModulePaths(familySlug, "todo", todo.slug);
    redirect(buildModulePath(familySlug, "todo", `/${todo.slug}`, "state=created"));
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirectWithError(
      familySlug,
      "todo",
      "/new",
      error instanceof Error ? error.message : "할 일을 저장하지 못했습니다.",
    );
  }
}

export async function updateTodoItemAction(formData: FormData) {
  const familySlug = readTextField(formData, "familySlug");
  const originalSlug = readTextField(formData, "originalSlug");

  try {
    const { workspaceView } = await requireFamilyAppAccessMutation(familySlug);
    const timezone = workspaceView.family.timezone;
    const title = ensureRequiredValue(readTextField(formData, "title"), "제목");
    const dueAt = parseDateTimeInputValue(
      ensureRequiredValue(readTextField(formData, "dueAt"), "마감 시각"),
      timezone,
    );
    const todo = await upsertFamilyTodoItem({
      familySlug,
      originalSlug,
      todo: {
        slug: readOptionalTextField(formData, "slug"),
        audience: readAudience(formData),
        visibilityScope: readVisibilityScope(formData),
        title,
        dueAt,
        completed: readCheckboxField(formData, "completed"),
        overdue: readCheckboxField(formData, "overdue"),
        blocksFamilyFlow: readCheckboxField(formData, "blocksFamilyFlow"),
        assigneeLabel: readOptionalTextField(formData, "assigneeLabel"),
      },
    });

    revalidateModulePaths(familySlug, "todo", todo.slug);
    redirect(buildModulePath(familySlug, "todo", `/${todo.slug}`, "state=updated"));
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirectWithError(
      familySlug,
      "todo",
      `/${originalSlug}/edit`,
      error instanceof Error ? error.message : "할 일을 수정하지 못했습니다.",
    );
  }
}

export async function deleteTodoItemAction(formData: FormData) {
  const familySlug = readTextField(formData, "familySlug");
  const itemSlug = readTextField(formData, "itemSlug");

  try {
    await requireFamilyAppAccessMutation(familySlug);
    await deleteFamilyTodoItem(familySlug, itemSlug);
    revalidateModulePaths(familySlug, "todo", itemSlug);
    redirect(buildModulePath(familySlug, "todo", "", "state=deleted"));
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirectWithError(
      familySlug,
      "todo",
      `/${itemSlug}`,
      error instanceof Error ? error.message : "할 일을 삭제하지 못했습니다.",
    );
  }
}

export async function createSchoolTimetableAction(formData: FormData) {
  const familySlug = readTextField(formData, "familySlug");

  try {
    const { workspaceView } = await requireFamilyAppAccessMutation(familySlug);
    const timezone = workspaceView.family.timezone;
    const studentLabel = ensureRequiredValue(
      readTextField(formData, "studentLabel"),
      "학생 이름",
    );
    const title = ensureRequiredValue(readTextField(formData, "title"), "제목");
    const startsAt = parseDateTimeInputValue(
      ensureRequiredValue(readTextField(formData, "startsAt"), "시작 시각"),
      timezone,
    );
    const endsAtValue = readTextField(formData, "endsAt");
    const schedule = await upsertFamilySchoolTimetable({
      familySlug,
      schedule: {
        slug: readOptionalTextField(formData, "slug"),
        audience: readAudience(formData),
        visibilityScope: readVisibilityScope(formData),
        studentLabel,
        title,
        startsAt,
        endsAt: endsAtValue ? parseDateTimeInputValue(endsAtValue, timezone) : undefined,
        preparationNote: readOptionalTextField(formData, "preparationNote"),
        affectsFamilyFlow: readCheckboxField(formData, "affectsFamilyFlow"),
      },
    });

    revalidateModulePaths(familySlug, "school-timetable", schedule.slug);
    redirect(
      buildModulePath(
        familySlug,
        "school-timetable",
        `/${schedule.slug}`,
        "state=created",
      ),
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirectWithError(
      familySlug,
      "school-timetable",
      "/new",
      error instanceof Error ? error.message : "시간표를 저장하지 못했습니다.",
    );
  }
}

export async function updateSchoolTimetableAction(formData: FormData) {
  const familySlug = readTextField(formData, "familySlug");
  const originalSlug = readTextField(formData, "originalSlug");

  try {
    const { workspaceView } = await requireFamilyAppAccessMutation(familySlug);
    const timezone = workspaceView.family.timezone;
    const studentLabel = ensureRequiredValue(
      readTextField(formData, "studentLabel"),
      "학생 이름",
    );
    const title = ensureRequiredValue(readTextField(formData, "title"), "제목");
    const startsAt = parseDateTimeInputValue(
      ensureRequiredValue(readTextField(formData, "startsAt"), "시작 시각"),
      timezone,
    );
    const endsAtValue = readTextField(formData, "endsAt");
    const schedule = await upsertFamilySchoolTimetable({
      familySlug,
      originalSlug,
      schedule: {
        slug: readOptionalTextField(formData, "slug"),
        audience: readAudience(formData),
        visibilityScope: readVisibilityScope(formData),
        studentLabel,
        title,
        startsAt,
        endsAt: endsAtValue ? parseDateTimeInputValue(endsAtValue, timezone) : undefined,
        preparationNote: readOptionalTextField(formData, "preparationNote"),
        affectsFamilyFlow: readCheckboxField(formData, "affectsFamilyFlow"),
      },
    });

    revalidateModulePaths(familySlug, "school-timetable", schedule.slug);
    redirect(
      buildModulePath(
        familySlug,
        "school-timetable",
        `/${schedule.slug}`,
        "state=updated",
      ),
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirectWithError(
      familySlug,
      "school-timetable",
      `/${originalSlug}/edit`,
      error instanceof Error ? error.message : "시간표를 수정하지 못했습니다.",
    );
  }
}

export async function deleteSchoolTimetableAction(formData: FormData) {
  const familySlug = readTextField(formData, "familySlug");
  const itemSlug = readTextField(formData, "itemSlug");

  try {
    await requireFamilyAppAccessMutation(familySlug);
    await deleteFamilySchoolTimetable(familySlug, itemSlug);
    revalidateModulePaths(familySlug, "school-timetable", itemSlug);
    redirect(buildModulePath(familySlug, "school-timetable", "", "state=deleted"));
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirectWithError(
      familySlug,
      "school-timetable",
      `/${itemSlug}`,
      error instanceof Error ? error.message : "시간표를 삭제하지 못했습니다.",
    );
  }
}

export async function createDayPlannerBlockAction(formData: FormData) {
  const familySlug = readTextField(formData, "familySlug");

  try {
    const { workspaceView } = await requireFamilyAppAccessMutation(familySlug);
    const timezone = workspaceView.family.timezone;
    const title = ensureRequiredValue(readTextField(formData, "title"), "제목");
    const startsAt = parseDateTimeInputValue(
      ensureRequiredValue(readTextField(formData, "startsAt"), "시작 시각"),
      timezone,
    );
    const endsAt = parseDateTimeInputValue(
      ensureRequiredValue(readTextField(formData, "endsAt"), "종료 시각"),
      timezone,
    );
    const block = await upsertFamilyDayPlannerBlock({
      familySlug,
      block: {
        slug: readOptionalTextField(formData, "slug"),
        audience: readAudience(formData),
        visibilityScope: readVisibilityScope(formData),
        title,
        startsAt,
        endsAt,
        ownerLabel: readOptionalTextField(formData, "ownerLabel"),
        affectsFamilyFlow: readCheckboxField(formData, "affectsFamilyFlow"),
      },
    });

    revalidateModulePaths(familySlug, "day-planner", block.slug);
    redirect(buildModulePath(familySlug, "day-planner", `/${block.slug}`, "state=created"));
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirectWithError(
      familySlug,
      "day-planner",
      "/new",
      error instanceof Error ? error.message : "플래너 블록을 저장하지 못했습니다.",
    );
  }
}

export async function updateDayPlannerBlockAction(formData: FormData) {
  const familySlug = readTextField(formData, "familySlug");
  const originalSlug = readTextField(formData, "originalSlug");

  try {
    const { workspaceView } = await requireFamilyAppAccessMutation(familySlug);
    const timezone = workspaceView.family.timezone;
    const title = ensureRequiredValue(readTextField(formData, "title"), "제목");
    const startsAt = parseDateTimeInputValue(
      ensureRequiredValue(readTextField(formData, "startsAt"), "시작 시각"),
      timezone,
    );
    const endsAt = parseDateTimeInputValue(
      ensureRequiredValue(readTextField(formData, "endsAt"), "종료 시각"),
      timezone,
    );
    const block = await upsertFamilyDayPlannerBlock({
      familySlug,
      originalSlug,
      block: {
        slug: readOptionalTextField(formData, "slug"),
        audience: readAudience(formData),
        visibilityScope: readVisibilityScope(formData),
        title,
        startsAt,
        endsAt,
        ownerLabel: readOptionalTextField(formData, "ownerLabel"),
        affectsFamilyFlow: readCheckboxField(formData, "affectsFamilyFlow"),
      },
    });

    revalidateModulePaths(familySlug, "day-planner", block.slug);
    redirect(buildModulePath(familySlug, "day-planner", `/${block.slug}`, "state=updated"));
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirectWithError(
      familySlug,
      "day-planner",
      `/${originalSlug}/edit`,
      error instanceof Error ? error.message : "플래너 블록을 수정하지 못했습니다.",
    );
  }
}

export async function deleteDayPlannerBlockAction(formData: FormData) {
  const familySlug = readTextField(formData, "familySlug");
  const itemSlug = readTextField(formData, "itemSlug");

  try {
    await requireFamilyAppAccessMutation(familySlug);
    await deleteFamilyDayPlannerBlock(familySlug, itemSlug);
    revalidateModulePaths(familySlug, "day-planner", itemSlug);
    redirect(buildModulePath(familySlug, "day-planner", "", "state=deleted"));
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirectWithError(
      familySlug,
      "day-planner",
      `/${itemSlug}`,
      error instanceof Error ? error.message : "플래너 블록을 삭제하지 못했습니다.",
    );
  }
}
