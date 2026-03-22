"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createFamilyAccessSession, verifySharedSecret } from "@ysplan/auth";
import { FAMILY_ACCESS_COOKIE, serializeFamilyAccessSession } from "../../../../src/lib/session-cookies";
import { resolveRuntimeFamilyFromSlug } from "../../../../src/lib/family-sites-store";
export async function submitFamilyAccessAction(formData) {
    const familySlug = String(formData.get("familySlug") ?? "").trim().toLowerCase();
    const secret = String(formData.get("secret") ?? "");
    const family = await resolveRuntimeFamilyFromSlug(familySlug);
    if (!family) {
        redirect(`/f/${familySlug}?step=access&error=family-not-found`);
    }
    if (!verifySharedSecret({
        expectedSecret: family.accessPolicy.secret,
        providedSecret: secret,
    })) {
        redirect(`/f/${familySlug}?step=access&error=invalid-secret`);
    }
    const now = new Date();
    const session = createFamilyAccessSession({
        familySlug: family.slug,
        tenantId: family.id,
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
