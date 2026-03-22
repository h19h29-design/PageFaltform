import type { ConsoleAuthErrorCode, FamilyAccessErrorCode } from "@ysplan/auth";

type FamilyMessageCode = FamilyAccessErrorCode | "session-expired";
type PlatformMessageCode =
  | ConsoleAuthErrorCode
  | "session-required"
  | "db-required"
  | "email-already-in-use"
  | "invalid-family"
  | "weak-password"
  | "bootstrap-disabled";

const familyMessages: Record<FamilyMessageCode, string> = {
  "family-not-found": "We could not find that family entry. Please check the address and try again.",
  "invalid-secret": "The shared secret did not match.",
  "session-expired": "Your family access session expired. Please enter again.",
};

const platformMessages: Record<PlatformMessageCode, string> = {
  "invalid-credentials": "The email or password did not match.",
  "not-authorized": "This account does not have owner/admin console access.",
  "session-required": "Please sign in before opening the console.",
  "db-required": "This flow requires a local PostgreSQL connection through DATABASE_URL.",
  "email-already-in-use": "That email is already in use.",
  "invalid-family": "The selected family could not be found.",
  "weak-password": "Use a password with at least 8 characters.",
  "bootstrap-disabled": "Local bootstrap is disabled in production.",
};

export function getFamilyAccessErrorMessage(code?: string): string | null {
  if (!code) {
    return null;
  }

  return familyMessages[code as FamilyMessageCode] ?? "A family access error occurred.";
}

export function getConsoleAuthErrorMessage(code?: string): string | null {
  if (!code) {
    return null;
  }

  return platformMessages[code as PlatformMessageCode] ?? "A sign-in error occurred.";
}

export function getPlatformAuthErrorMessage(code?: string): string | null {
  if (!code) {
    return null;
  }

  return platformMessages[code as PlatformMessageCode] ?? "A sign-in error occurred.";
}

export function getBootstrapStateMessage(code?: string): string | null {
  if (code !== "bootstrapped") {
    return null;
  }

  return "Local DB bootstrap finished. You can now sign in with the seeded operator accounts.";
}
