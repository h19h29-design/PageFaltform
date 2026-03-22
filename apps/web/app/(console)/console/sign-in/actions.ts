"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyConsoleCredentials } from "@ysplan/auth";

import { PLATFORM_USER_COOKIE, serializePlatformUserSession } from "../../../../src/lib/session-cookies";
import { submitPlatformSignInAction } from "../../../../src/actions/platform-auth-actions";

export async function submitConsoleSignInAction(formData: FormData) {
  if (process.env.DATABASE_URL) {
    return submitPlatformSignInAction(formData);
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const result = verifyConsoleCredentials({
    email,
    password,
  });

  if (!result.ok || !result.session) {
    redirect(`/console/sign-in?error=${result.errorCode ?? "invalid-credentials"}`);
  }

  const cookieStore = await cookies();

  cookieStore.set(PLATFORM_USER_COOKIE, serializePlatformUserSession(result.session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(result.session.expiresAt),
  });

  redirect("/console");
}
