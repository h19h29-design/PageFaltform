"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createClubAnnouncementRecord,
  createClubEventRecord,
  createClubGalleryRecord,
  deleteClubAnnouncementRecord,
  deleteClubEventRecord,
  deleteClubGalleryRecord,
  updateClubAnnouncementRecord,
  updateClubEventRecord,
  updateClubGalleryRecord,
  type ClubAnnouncementRecordInput,
  type ClubContentModuleKey,
  type ClubEventRecordInput,
  type ClubGalleryRecordInput,
} from "../lib/club-content-store";
import { requireClubManageAccess } from "../lib/club-app-access";

function isRedirectError(error: unknown): error is { digest: string } {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { digest?: unknown };
  return typeof candidate.digest === "string" && candidate.digest.startsWith("NEXT_REDIRECT");
}

function encodeError(error: unknown): string {
  return encodeURIComponent(
    error instanceof Error ? error.message : "예상하지 못한 오류가 발생했습니다.",
  );
}

function parseClubSlug(formData: FormData): string {
  return String(formData.get("clubSlug") ?? "").trim().toLowerCase();
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
    throw new Error("숫자 형식이 올바르지 않습니다.");
  }

  return parsed;
}

function parseOptionalText(formData: FormData, fieldName: string): string | undefined {
  const raw = String(formData.get(fieldName) ?? "").trim();
  return raw.length > 0 ? raw : undefined;
}

function parseRequiredText(formData: FormData, fieldName: string): string {
  const raw = String(formData.get(fieldName) ?? "").trim();

  if (!raw) {
    throw new Error("필수 항목을 입력해 주세요.");
  }

  return raw;
}

function parseVisibility(formData: FormData): "public" | "member" {
  return String(formData.get("visibility") ?? "") === "public" ? "public" : "member";
}

function parseIso(formData: FormData, fieldName: string, fieldLabel: string): string {
  const raw = String(formData.get(fieldName) ?? "").trim();

  if (!raw) {
    throw new Error(`${fieldLabel}을 입력해 주세요.`);
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldLabel} 형식이 올바르지 않습니다.`);
  }

  return date.toISOString();
}

function parseContentModuleKey(formData: FormData): ClubContentModuleKey {
  const raw = String(formData.get("moduleKey") ?? "").trim();

  if (raw === "announcements" || raw === "events" || raw === "gallery") {
    return raw;
  }

  throw new Error("지원하지 않는 게시판입니다.");
}

function buildClubModuleListHref(clubSlug: string, moduleKey: ClubContentModuleKey): string {
  return `/clubs/${clubSlug}/app/${moduleKey}`;
}

function buildClubModuleNewHref(clubSlug: string, moduleKey: ClubContentModuleKey): string {
  return `${buildClubModuleListHref(clubSlug, moduleKey)}/new`;
}

function buildClubModuleDetailHref(
  clubSlug: string,
  moduleKey: ClubContentModuleKey,
  slug: string,
): string {
  return `${buildClubModuleListHref(clubSlug, moduleKey)}/${slug}`;
}

function buildClubModuleEditHref(
  clubSlug: string,
  moduleKey: ClubContentModuleKey,
  slug: string,
): string {
  return `${buildClubModuleDetailHref(clubSlug, moduleKey, slug)}/edit`;
}

function revalidateClubContentPaths(
  clubSlug: string,
  moduleKey: ClubContentModuleKey,
  slug?: string,
) {
  const base = `/clubs/${clubSlug}`;

  revalidatePath(base);
  revalidatePath(`${base}/app`);
  revalidatePath(`${base}/app/${moduleKey}`);
  revalidatePath(`${base}/app/${moduleKey}/new`);
  revalidatePath(`/preview/mobile/club/${clubSlug}`);

  if (slug) {
    revalidatePath(`${base}/app/${moduleKey}/${slug}`);
    revalidatePath(`${base}/app/${moduleKey}/${slug}/edit`);
  }
}

async function requireClubContentMutationAccess(clubSlug: string) {
  await requireClubManageAccess(clubSlug);
}

function parseAnnouncementInput(formData: FormData): ClubAnnouncementRecordInput {
  return {
    title: parseRequiredText(formData, "title"),
    slug: String(formData.get("slug") ?? "").trim().toLowerCase(),
    summary: parseRequiredText(formData, "summary"),
    body: parseRequiredText(formData, "body"),
    severity:
      String(formData.get("severity") ?? "") === "urgent"
        ? "urgent"
        : String(formData.get("severity") ?? "") === "important"
          ? "important"
          : "normal",
    visibility: parseVisibility(formData),
    pinned: parseCheckbox(formData, "pinned"),
    featured: parseCheckbox(formData, "featured"),
  };
}

function parseEventInput(formData: FormData): ClubEventRecordInput {
  return {
    title: parseRequiredText(formData, "title"),
    slug: String(formData.get("slug") ?? "").trim().toLowerCase(),
    summary: parseRequiredText(formData, "summary"),
    startsAt: parseIso(formData, "startsAt", "시작 시간"),
    endsAt: parseIso(formData, "endsAt", "종료 시간"),
    location: parseRequiredText(formData, "location"),
    attendanceTarget: parseOptionalNumber(formData, "attendanceTarget"),
    visibility: parseVisibility(formData),
    featured: parseCheckbox(formData, "featured"),
  };
}

function parseGalleryInput(formData: FormData): ClubGalleryRecordInput {
  return {
    title: parseRequiredText(formData, "title"),
    slug: String(formData.get("slug") ?? "").trim().toLowerCase(),
    caption: parseRequiredText(formData, "caption"),
    photoCount: parseOptionalNumber(formData, "photoCount") ?? 1,
    noteCount: parseOptionalNumber(formData, "noteCount"),
    imageUrl: parseOptionalText(formData, "imageUrl"),
    visibility: parseVisibility(formData),
    featured: parseCheckbox(formData, "featured"),
  };
}

export async function createClubAnnouncementAction(formData: FormData) {
  const clubSlug = parseClubSlug(formData);

  await requireClubContentMutationAccess(clubSlug);

  try {
    const record = await createClubAnnouncementRecord(clubSlug, parseAnnouncementInput(formData));
    revalidateClubContentPaths(clubSlug, "announcements", record.slug);
    redirect(`${buildClubModuleDetailHref(clubSlug, "announcements", record.slug)}?state=created`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(`${buildClubModuleNewHref(clubSlug, "announcements")}?error=${encodeError(error)}`);
  }
}

export async function updateClubAnnouncementAction(formData: FormData) {
  const clubSlug = parseClubSlug(formData);
  const currentSlug = parseSlug(formData, "currentSlug");

  await requireClubContentMutationAccess(clubSlug);

  try {
    const record = await updateClubAnnouncementRecord(
      clubSlug,
      currentSlug,
      parseAnnouncementInput(formData),
    );
    revalidateClubContentPaths(clubSlug, "announcements", record.slug);
    redirect(`${buildClubModuleDetailHref(clubSlug, "announcements", record.slug)}?state=updated`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(`${buildClubModuleEditHref(clubSlug, "announcements", currentSlug)}?error=${encodeError(error)}`);
  }
}

export async function deleteClubAnnouncementAction(formData: FormData) {
  const clubSlug = parseClubSlug(formData);
  const currentSlug = parseSlug(formData, "currentSlug");

  await requireClubContentMutationAccess(clubSlug);
  await deleteClubAnnouncementRecord(clubSlug, currentSlug);
  revalidateClubContentPaths(clubSlug, "announcements");
  redirect(`${buildClubModuleListHref(clubSlug, "announcements")}?state=deleted`);
}

export async function createClubEventAction(formData: FormData) {
  const clubSlug = parseClubSlug(formData);

  await requireClubContentMutationAccess(clubSlug);

  try {
    const record = await createClubEventRecord(clubSlug, parseEventInput(formData));
    revalidateClubContentPaths(clubSlug, "events", record.slug);
    redirect(`${buildClubModuleDetailHref(clubSlug, "events", record.slug)}?state=created`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(`${buildClubModuleNewHref(clubSlug, "events")}?error=${encodeError(error)}`);
  }
}

export async function updateClubEventAction(formData: FormData) {
  const clubSlug = parseClubSlug(formData);
  const currentSlug = parseSlug(formData, "currentSlug");

  await requireClubContentMutationAccess(clubSlug);

  try {
    const record = await updateClubEventRecord(clubSlug, currentSlug, parseEventInput(formData));
    revalidateClubContentPaths(clubSlug, "events", record.slug);
    redirect(`${buildClubModuleDetailHref(clubSlug, "events", record.slug)}?state=updated`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(`${buildClubModuleEditHref(clubSlug, "events", currentSlug)}?error=${encodeError(error)}`);
  }
}

export async function deleteClubEventAction(formData: FormData) {
  const clubSlug = parseClubSlug(formData);
  const currentSlug = parseSlug(formData, "currentSlug");

  await requireClubContentMutationAccess(clubSlug);
  await deleteClubEventRecord(clubSlug, currentSlug);
  revalidateClubContentPaths(clubSlug, "events");
  redirect(`${buildClubModuleListHref(clubSlug, "events")}?state=deleted`);
}

export async function createClubGalleryAction(formData: FormData) {
  const clubSlug = parseClubSlug(formData);

  await requireClubContentMutationAccess(clubSlug);

  try {
    const record = await createClubGalleryRecord(clubSlug, parseGalleryInput(formData));
    revalidateClubContentPaths(clubSlug, "gallery", record.slug);
    redirect(`${buildClubModuleDetailHref(clubSlug, "gallery", record.slug)}?state=created`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(`${buildClubModuleNewHref(clubSlug, "gallery")}?error=${encodeError(error)}`);
  }
}

export async function updateClubGalleryAction(formData: FormData) {
  const clubSlug = parseClubSlug(formData);
  const currentSlug = parseSlug(formData, "currentSlug");

  await requireClubContentMutationAccess(clubSlug);

  try {
    const record = await updateClubGalleryRecord(clubSlug, currentSlug, parseGalleryInput(formData));
    revalidateClubContentPaths(clubSlug, "gallery", record.slug);
    redirect(`${buildClubModuleDetailHref(clubSlug, "gallery", record.slug)}?state=updated`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(`${buildClubModuleEditHref(clubSlug, "gallery", currentSlug)}?error=${encodeError(error)}`);
  }
}

export async function deleteClubGalleryAction(formData: FormData) {
  const clubSlug = parseClubSlug(formData);
  const currentSlug = parseSlug(formData, "currentSlug");

  await requireClubContentMutationAccess(clubSlug);
  await deleteClubGalleryRecord(clubSlug, currentSlug);
  revalidateClubContentPaths(clubSlug, "gallery");
  redirect(`${buildClubModuleListHref(clubSlug, "gallery")}?state=deleted`);
}
