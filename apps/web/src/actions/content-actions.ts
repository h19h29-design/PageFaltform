"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { DashboardCardVisibilityScope, HomeCardAudience } from "@ysplan/modules-core";

import {
  buildContentModuleDetailHref,
  buildContentModuleEditHref,
  buildContentModuleListHref,
  buildContentModuleNewHref,
} from "../lib/content-modules";
import {
  createAnnouncementRecord,
  createDiaryRecord,
  createGalleryRecord,
  createPostRecord,
  deleteAnnouncementRecord,
  deleteDiaryRecord,
  deleteGalleryRecord,
  deletePostRecord,
  updateAnnouncementRecord,
  updateDiaryRecord,
  updateGalleryRecord,
  updatePostRecord,
  type AnnouncementRecordInput,
  type DiaryRecordInput,
  type GalleryRecordInput,
  type PostRecordInput,
} from "../lib/content-store";
import { requireFamilyAppAccess } from "../lib/family-app-context";

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

function encodeError(error: unknown): string {
  return encodeURIComponent(
    error instanceof Error ? error.message : "저장 중 문제가 발생했습니다.",
  );
}

function parseFamilySlug(formData: FormData): string {
  return String(formData.get("familySlug") ?? "").trim().toLowerCase();
}

function parseSlug(formData: FormData, fieldName: string): string {
  return String(formData.get(fieldName) ?? "").trim().toLowerCase();
}

function parseCheckbox(formData: FormData, fieldName: string): boolean {
  return formData.get(fieldName) === "on";
}

function parseOptionalNumber(formData: FormData, fieldName: string): number | undefined {
  const raw = String(formData.get(fieldName) ?? "").trim();

  if (!raw) {
    return undefined;
  }

  const parsed = Number(raw);

  if (!Number.isFinite(parsed)) {
    throw new Error("숫자 입력 형식이 올바르지 않습니다.");
  }

  return parsed;
}

function parseOptionalText(formData: FormData, fieldName: string): string | undefined {
  const raw = String(formData.get(fieldName) ?? "").trim();
  return raw.length > 0 ? raw : undefined;
}

function parseAudience(formData: FormData): HomeCardAudience {
  return String(formData.get("audience") ?? "") === "personal"
    ? "personal"
    : "family-shared";
}

function parseVisibilityScope(formData: FormData): DashboardCardVisibilityScope {
  const scope = String(formData.get("visibilityScope") ?? "").trim();

  if (
    scope === "adults" ||
    scope === "children-safe" ||
    scope === "admins" ||
    scope === "private"
  ) {
    return scope;
  }

  return "all";
}

async function requireContentMutationAccess(familySlug: string) {
  await requireFamilyAppAccess(familySlug);
}

function revalidateContentPaths(familySlug: string, moduleSegment: string, slug?: string) {
  revalidatePath(`/f/${familySlug}`);
  revalidatePath(`/app/${familySlug}`);
  revalidatePath(`/app/${familySlug}/${moduleSegment}`);
  revalidatePath(`/app/${familySlug}/${moduleSegment}/new`);

  if (slug) {
    revalidatePath(`/app/${familySlug}/${moduleSegment}/${slug}`);
    revalidatePath(`/app/${familySlug}/${moduleSegment}/${slug}/edit`);
  }
}

function parseAnnouncementInput(formData: FormData): AnnouncementRecordInput {
  return {
    title: String(formData.get("title") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
    severity:
      String(formData.get("severity") ?? "") === "urgent"
        ? "urgent"
        : String(formData.get("severity") ?? "") === "important"
          ? "important"
          : "general",
    audience: parseAudience(formData),
    visibilityScope: parseVisibilityScope(formData),
    pinned: parseCheckbox(formData, "pinned"),
    requiresReadAck: parseCheckbox(formData, "requiresReadAck"),
    readAckTarget: parseOptionalNumber(formData, "readAckTarget"),
    readAckConfirmed: parseOptionalNumber(formData, "readAckConfirmed"),
    displayStartsAt: parseOptionalText(formData, "displayStartsAt"),
    displayEndsAt: parseOptionalText(formData, "displayEndsAt"),
  };
}

function parsePostInput(formData: FormData): PostRecordInput {
  return {
    title: String(formData.get("title") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
    category:
      String(formData.get("category") ?? "") === "guide"
        ? "guide"
        : String(formData.get("category") ?? "") === "note"
          ? "note"
          : "update",
    audience: parseAudience(formData),
    visibilityScope: parseVisibilityScope(formData),
    featured: parseCheckbox(formData, "featured"),
    imageUrl: parseOptionalText(formData, "imageUrl"),
  };
}

function parseGalleryInput(formData: FormData): GalleryRecordInput {
  return {
    title: String(formData.get("title") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    caption: String(formData.get("caption") ?? "").trim(),
    photoCount: parseOptionalNumber(formData, "photoCount") ?? 1,
    noteCount: parseOptionalNumber(formData, "noteCount"),
    audience: parseAudience(formData),
    visibilityScope: parseVisibilityScope(formData),
    featured: parseCheckbox(formData, "featured"),
    imageUrl: parseOptionalText(formData, "imageUrl"),
  };
}

function parseDiaryInput(formData: FormData): DiaryRecordInput {
  return {
    title: String(formData.get("title") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
    moodLabel: parseOptionalText(formData, "moodLabel"),
    audience: parseAudience(formData),
    visibilityScope: parseVisibilityScope(formData),
    highlighted: parseCheckbox(formData, "highlighted"),
  };
}

export async function createAnnouncementAction(formData: FormData) {
  const familySlug = parseFamilySlug(formData);

  await requireContentMutationAccess(familySlug);

  try {
    const record = await createAnnouncementRecord(familySlug, parseAnnouncementInput(formData));
    revalidateContentPaths(familySlug, "announcements", record.slug);
    redirect(`${buildContentModuleDetailHref(familySlug, "announcements", record.slug)}?state=created`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(`${buildContentModuleNewHref(familySlug, "announcements")}?error=${encodeError(error)}`);
  }
}

export async function updateAnnouncementAction(formData: FormData) {
  const familySlug = parseFamilySlug(formData);
  const currentSlug = parseSlug(formData, "currentSlug");

  await requireContentMutationAccess(familySlug);

  try {
    const record = await updateAnnouncementRecord(
      familySlug,
      currentSlug,
      parseAnnouncementInput(formData),
    );
    revalidateContentPaths(familySlug, "announcements", record.slug);
    redirect(`${buildContentModuleDetailHref(familySlug, "announcements", record.slug)}?state=updated`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(`${buildContentModuleEditHref(familySlug, "announcements", currentSlug)}?error=${encodeError(error)}`);
  }
}

export async function deleteAnnouncementAction(formData: FormData) {
  const familySlug = parseFamilySlug(formData);
  const currentSlug = parseSlug(formData, "currentSlug");

  await requireContentMutationAccess(familySlug);
  await deleteAnnouncementRecord(familySlug, currentSlug);
  revalidateContentPaths(familySlug, "announcements");
  redirect(`${buildContentModuleListHref(familySlug, "announcements")}?state=deleted`);
}

export async function createPostAction(formData: FormData) {
  const familySlug = parseFamilySlug(formData);

  await requireContentMutationAccess(familySlug);

  try {
    const record = await createPostRecord(familySlug, parsePostInput(formData));
    revalidateContentPaths(familySlug, "posts", record.slug);
    redirect(`${buildContentModuleDetailHref(familySlug, "posts", record.slug)}?state=created`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(`${buildContentModuleNewHref(familySlug, "posts")}?error=${encodeError(error)}`);
  }
}

export async function updatePostAction(formData: FormData) {
  const familySlug = parseFamilySlug(formData);
  const currentSlug = parseSlug(formData, "currentSlug");

  await requireContentMutationAccess(familySlug);

  try {
    const record = await updatePostRecord(familySlug, currentSlug, parsePostInput(formData));
    revalidateContentPaths(familySlug, "posts", record.slug);
    redirect(`${buildContentModuleDetailHref(familySlug, "posts", record.slug)}?state=updated`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(`${buildContentModuleEditHref(familySlug, "posts", currentSlug)}?error=${encodeError(error)}`);
  }
}

export async function deletePostAction(formData: FormData) {
  const familySlug = parseFamilySlug(formData);
  const currentSlug = parseSlug(formData, "currentSlug");

  await requireContentMutationAccess(familySlug);
  await deletePostRecord(familySlug, currentSlug);
  revalidateContentPaths(familySlug, "posts");
  redirect(`${buildContentModuleListHref(familySlug, "posts")}?state=deleted`);
}

export async function createGalleryAction(formData: FormData) {
  const familySlug = parseFamilySlug(formData);

  await requireContentMutationAccess(familySlug);

  try {
    const record = await createGalleryRecord(familySlug, parseGalleryInput(formData));
    revalidateContentPaths(familySlug, "gallery", record.slug);
    redirect(`${buildContentModuleDetailHref(familySlug, "gallery", record.slug)}?state=created`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(`${buildContentModuleNewHref(familySlug, "gallery")}?error=${encodeError(error)}`);
  }
}

export async function updateGalleryAction(formData: FormData) {
  const familySlug = parseFamilySlug(formData);
  const currentSlug = parseSlug(formData, "currentSlug");

  await requireContentMutationAccess(familySlug);

  try {
    const record = await updateGalleryRecord(familySlug, currentSlug, parseGalleryInput(formData));
    revalidateContentPaths(familySlug, "gallery", record.slug);
    redirect(`${buildContentModuleDetailHref(familySlug, "gallery", record.slug)}?state=updated`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(`${buildContentModuleEditHref(familySlug, "gallery", currentSlug)}?error=${encodeError(error)}`);
  }
}

export async function deleteGalleryAction(formData: FormData) {
  const familySlug = parseFamilySlug(formData);
  const currentSlug = parseSlug(formData, "currentSlug");

  await requireContentMutationAccess(familySlug);
  await deleteGalleryRecord(familySlug, currentSlug);
  revalidateContentPaths(familySlug, "gallery");
  redirect(`${buildContentModuleListHref(familySlug, "gallery")}?state=deleted`);
}

export async function createDiaryAction(formData: FormData) {
  const familySlug = parseFamilySlug(formData);

  await requireContentMutationAccess(familySlug);

  try {
    const record = await createDiaryRecord(familySlug, parseDiaryInput(formData));
    revalidateContentPaths(familySlug, "diary", record.slug);
    redirect(`${buildContentModuleDetailHref(familySlug, "diary", record.slug)}?state=created`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(`${buildContentModuleNewHref(familySlug, "diary")}?error=${encodeError(error)}`);
  }
}

export async function updateDiaryAction(formData: FormData) {
  const familySlug = parseFamilySlug(formData);
  const currentSlug = parseSlug(formData, "currentSlug");

  await requireContentMutationAccess(familySlug);

  try {
    const record = await updateDiaryRecord(familySlug, currentSlug, parseDiaryInput(formData));
    revalidateContentPaths(familySlug, "diary", record.slug);
    redirect(`${buildContentModuleDetailHref(familySlug, "diary", record.slug)}?state=updated`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(`${buildContentModuleEditHref(familySlug, "diary", currentSlug)}?error=${encodeError(error)}`);
  }
}

export async function deleteDiaryAction(formData: FormData) {
  const familySlug = parseFamilySlug(formData);
  const currentSlug = parseSlug(formData, "currentSlug");

  await requireContentMutationAccess(familySlug);
  await deleteDiaryRecord(familySlug, currentSlug);
  revalidateContentPaths(familySlug, "diary");
  redirect(`${buildContentModuleListHref(familySlug, "diary")}?state=deleted`);
}
