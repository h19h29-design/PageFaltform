"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  canAccessConsole,
  hashPassword,
  verifyPasswordHash,
} from "@ysplan/auth";
import {
  bootstrapAuthDataBaseline,
  createAuthRuntimeService,
} from "@ysplan/database";

import {
  PLATFORM_USER_COOKIE,
  serializePlatformUserSession,
} from "../lib/session-cookies";
import { createFamilyJoinRequest } from "../lib/family-join-requests";
import {
  createLocalPlatformSession,
  createLocalPlatformUserRecord,
  findLocalPlatformUserByEmail,
} from "../lib/local-platform-auth";
import { resolveDiscoverableRuntimeFamilyFromSlug } from "../lib/family-sites-store";

function isDatabaseSourceOfTruthEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL) && process.env.YSPLAN_ENABLE_DB_BASELINE === "1";
}

function toSafeRedirectPath(candidate: string | null, fallback: string): string {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallback;
  }

  return candidate;
}

async function writePlatformSessionCookie(
  session: Parameters<typeof serializePlatformUserSession>[0],
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(PLATFORM_USER_COOKIE, serializePlatformUserSession(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(session.expiresAt),
  });
}

export async function submitPlatformSignInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const consoleOnly = String(formData.get("consoleOnly") ?? "") === "1";
  const fallbackPath = consoleOnly ? "/console/sign-in" : "/sign-in";
  const nextPath = toSafeRedirectPath(
    String(formData.get("next") ?? ""),
    consoleOnly ? "/console" : "/",
  );

  if (!isDatabaseSourceOfTruthEnabled()) {
    const user = await findLocalPlatformUserByEmail(email);

    if (!user?.passwordHash || !verifyPasswordHash({ password, passwordHash: user.passwordHash })) {
      redirect(`${fallbackPath}?error=invalid-credentials`);
    }

    const session = createLocalPlatformSession(user);

    if (consoleOnly && !canAccessConsole(session)) {
      redirect("/console/sign-in?error=not-authorized");
    }

    await writePlatformSessionCookie(session);
    redirect(nextPath);
  }

  const runtimeService = createAuthRuntimeService();
  const user = await runtimeService.findUserByEmailForAuth(email);

  if (!user?.passwordHash || !verifyPasswordHash({ password, passwordHash: user.passwordHash })) {
    redirect(`${fallbackPath}?error=invalid-credentials`);
  }

  const session = await runtimeService.createPlatformSessionForUser({
    userId: user.id,
  });

  if (consoleOnly && !canAccessConsole(session)) {
    if (session.sessionToken) {
      await runtimeService.deletePlatformSession(session.sessionToken);
    }

    redirect("/console/sign-in?error=not-authorized");
  }

  await writePlatformSessionCookie(session);
  redirect(nextPath);
}

export async function submitLocalSignUpAction(formData: FormData) {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const selectedFamilySlug = String(formData.get("familySlug") ?? "").trim().toLowerCase();
  const nextPath = toSafeRedirectPath(String(formData.get("next") ?? ""), "/");

  if (!displayName || password.trim().length < 8) {
    redirect("/sign-up?error=weak-password");
  }

  let selectedFamilyName: string | null = null;

  if (selectedFamilySlug) {
    const family = await resolveDiscoverableRuntimeFamilyFromSlug(selectedFamilySlug);

    if (!family) {
      redirect("/sign-up?error=invalid-family");
    }

    selectedFamilyName = family.name;
  }

  if (!isDatabaseSourceOfTruthEnabled()) {
    try {
      const user = await createLocalPlatformUserRecord({
        displayName,
        email,
        passwordHash: hashPassword(password),
      });

      if (selectedFamilySlug && selectedFamilyName) {
        await createFamilyJoinRequest({
          familySlug: selectedFamilySlug,
          familyName: selectedFamilyName,
          requesterUserId: user.id,
          requesterDisplayName: user.displayName,
          requesterEmail: user.email,
          requesterPlatformRole: user.platformRole,
        });
      }

      const session = createLocalPlatformSession(user);

      await writePlatformSessionCookie(session);
      redirect(selectedFamilySlug ? `/f/${selectedFamilySlug}?state=requested` : nextPath);
    } catch (error) {
      if (error instanceof Error && error.message === "email-already-in-use") {
        redirect("/sign-up?error=email-already-in-use");
      }

      throw error;
    }
  }

  const runtimeService = createAuthRuntimeService();

  try {
    const user = await runtimeService.createLocalUser({
      displayName,
      email,
      passwordHash: hashPassword(password),
    });

    if (selectedFamilySlug && selectedFamilyName) {
      await createFamilyJoinRequest({
        familySlug: selectedFamilySlug,
        familyName: selectedFamilyName,
        requesterUserId: user.id,
        requesterDisplayName: user.displayName,
        requesterEmail: user.email,
        requesterPlatformRole: "associate-member",
      });
    }

    const session = await runtimeService.createPlatformSessionForUser({
      userId: user.id,
    });

    await writePlatformSessionCookie(session);
    redirect(selectedFamilySlug ? `/f/${selectedFamilySlug}?state=requested` : nextPath);
  } catch (error) {
    if (error instanceof Error && error.message === "email-already-in-use") {
      redirect("/sign-up?error=email-already-in-use");
    }

    throw error;
  }
}

export async function runLocalBootstrapAction() {
  if (!isDatabaseSourceOfTruthEnabled()) {
    redirect("/console/sign-in?error=db-required");
  }

  if (process.env.NODE_ENV === "production") {
    redirect("/console/sign-in?error=bootstrap-disabled");
  }

  const report = await bootstrapAuthDataBaseline();
  const familyCount =
    report.seed.importedFamilies.length + report.fileImport.importedFamilies.length;

  redirect(
    `/console/sign-in?state=bootstrapped&users=${report.seed.importedUsers.length}&families=${familyCount}`,
  );
}
