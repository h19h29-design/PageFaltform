"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FAMILY_ACCESS_COOKIE, PLATFORM_USER_COOKIE } from "../lib/session-cookies";
export async function signOutFamilyAction(formData) {
    const familySlug = String(formData.get("familySlug") ?? "").trim();
    const cookieStore = await cookies();
    cookieStore.delete(FAMILY_ACCESS_COOKIE);
    redirect(familySlug ? `/f/${familySlug}` : "/");
}
export async function signOutConsoleAction() {
    const cookieStore = await cookies();
    cookieStore.delete(PLATFORM_USER_COOKIE);
    redirect("/console/sign-in");
}
