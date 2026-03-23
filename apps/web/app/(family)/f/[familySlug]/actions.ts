"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  canAccessConsole,
  createFamilyAccessSession,
  getMembershipForFamily,
  toFamilyViewerRole,
} from "@ysplan/auth";

import { createFamilyJoinRequest } from "../../../../src/lib/family-join-requests";
import {
  resolveDiscoverableRuntimeFamilyFromSlug,
  resolveRuntimeFamilyFromSlug,
} from "../../../../src/lib/family-sites-store";
import {
  getActivePlatformUserSession,
} from "../../../../src/lib/server-sessions";
import {
  FAMILY_ACCESS_COOKIE,
  serializeFamilyAccessSession,
} from "../../../../src/lib/session-cookies";

export async function submitFamilyJoinRequestAction(formData: FormData) {
  const familySlug = String(formData.get("familySlug") ?? "").trim().toLowerCase();
  const nextSignInPath = `/sign-in?next=${encodeURIComponent(`/f/${familySlug}`)}`;
  const platformSession = await getActivePlatformUserSession();

  if (!platformSession) {
    redirect(nextSignInPath);
  }

  const family = await resolveDiscoverableRuntimeFamilyFromSlug(
    familySlug,
    platformSession,
  );

  if (!family) {
    redirect("/?error=invalid-family");
  }

  const existingMembership = getMembershipForFamily(platformSession, family.slug);

  if (existingMembership) {
    redirect(`/f/${family.slug}?state=already-member`);
  }

  await createFamilyJoinRequest({
    familySlug: family.slug,
    familyName: family.name,
    requesterUserId: platformSession.userId,
    requesterDisplayName: platformSession.displayName,
    requesterEmail: platformSession.email,
    requesterPlatformRole: platformSession.platformRole,
  });

  redirect(`/f/${family.slug}?state=requested`);
}

export async function submitApprovedFamilyEntryAction(formData: FormData) {
  const familySlug = String(formData.get("familySlug") ?? "").trim().toLowerCase();
  const platformSession = await getActivePlatformUserSession();

  if (!platformSession) {
    redirect(`/sign-in?next=${encodeURIComponent(`/f/${familySlug}`)}`);
  }

  const family = await resolveRuntimeFamilyFromSlug(familySlug);

  if (!family) {
    redirect(`/f/${familySlug}?error=family-not-found`);
  }

  const membership = getMembershipForFamily(platformSession, family.slug);
  const hasConsoleBypass =
    canAccessConsole(platformSession, family.slug) ||
    family.ownerUserId === platformSession.userId;

  if (family.visibility === "private" && !membership && !hasConsoleBypass) {
    redirect("/?error=private-family");
  }

  if (!membership && !hasConsoleBypass) {
    redirect(`/f/${family.slug}?error=approval-required`);
  }

  const session = createFamilyAccessSession({
    familySlug: family.slug,
    tenantId: family.id,
    viewerRole: membership ? toFamilyViewerRole(membership.role) : "member",
    userId: platformSession.userId,
    now: new Date(),
  });
  const cookieStore = await cookies();

  cookieStore.set(FAMILY_ACCESS_COOKIE, serializeFamilyAccessSession(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(session.expiresAt),
  });

  redirect(`/app/${family.slug}`);
}
