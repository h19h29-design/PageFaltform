"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  createFamilyAccessSession,
  toFamilyViewerRole,
  verifySharedSecret,
  verifySharedSecretHash,
} from "@ysplan/auth";
import { createAuthRuntimeService } from "@ysplan/database";

import { FAMILY_ACCESS_COOKIE, serializeFamilyAccessSession } from "../../../../src/lib/session-cookies";
import { resolveRuntimeFamilyFromSlug } from "../../../../src/lib/family-sites-store";
import {
  getActivePlatformMembershipForFamily,
  getActivePlatformUserSession,
  isDatabaseSourceOfTruthEnabled,
} from "../../../../src/lib/server-sessions";

export async function submitFamilyAccessAction(formData: FormData) {
  const familySlug = String(formData.get("familySlug") ?? "").trim().toLowerCase();
  const secret = String(formData.get("secret") ?? "");

  if (isDatabaseSourceOfTruthEnabled()) {
    const runtimeService = createAuthRuntimeService();
    const family = await runtimeService.findFamilyBySlug(familySlug);

    if (!family?.accessPolicy?.sharedSecretHash) {
      redirect(`/f/${familySlug}?step=access&error=family-not-found`);
    }

    if (
      !verifySharedSecretHash({
        familySlug,
        providedSecret: secret,
        sharedSecretHash: family.accessPolicy.sharedSecretHash,
      })
    ) {
      redirect(`/f/${familySlug}?step=access&error=invalid-secret`);
    }

    const platformSession = await getActivePlatformUserSession();
    const membership = await getActivePlatformMembershipForFamily(familySlug);
    const session = await runtimeService.createFamilyAccessSessionForFamily({
      familySlug,
      userId: platformSession?.userId ?? null,
      viewerRole: membership ? toFamilyViewerRole(membership.role) : "guest",
    });
    const cookieStore = await cookies();

    cookieStore.set(FAMILY_ACCESS_COOKIE, serializeFamilyAccessSession(session), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      expires: new Date(session.expiresAt),
    });

    redirect(`/app/${familySlug}`);
  }

  const family = await resolveRuntimeFamilyFromSlug(familySlug);

  if (!family) {
    redirect(`/f/${familySlug}?step=access&error=family-not-found`);
  }

  if (
    !verifySharedSecret({
      expectedSecret: family.accessPolicy.secret,
      providedSecret: secret,
    })
  ) {
    redirect(`/f/${familySlug}?step=access&error=invalid-secret`);
  }

  const platformSession = await getActivePlatformUserSession();
  const membership = await getActivePlatformMembershipForFamily(familySlug);
  const now = new Date();
  const session = createFamilyAccessSession({
    familySlug: family.slug,
    tenantId: family.id,
    viewerRole: membership ? toFamilyViewerRole(membership.role) : "guest",
    userId: platformSession?.userId ?? null,
    now,
  });
  const expiresAt = new Date(session.expiresAt);

  const cookieStore = await cookies();

  cookieStore.set(FAMILY_ACCESS_COOKIE, serializeFamilyAccessSession(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  redirect(`/app/${familySlug}`);
}
