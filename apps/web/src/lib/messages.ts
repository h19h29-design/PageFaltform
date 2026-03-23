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
  "family-not-found": "가족 입구를 찾지 못했습니다. 주소를 다시 확인해주세요.",
  "invalid-secret": "가족 비밀값이 맞지 않습니다.",
  "session-expired": "가족 입장 세션이 만료되었습니다. 다시 입장해주세요.",
};

const platformMessages: Record<PlatformMessageCode, string> = {
  "invalid-credentials": "이메일 또는 비밀번호가 맞지 않습니다.",
  "not-authorized": "이 계정에는 소유자 또는 관리자 콘솔 권한이 없습니다.",
  "session-required": "콘솔을 열기 전에 먼저 로그인해주세요.",
  "db-required": "이 흐름은 `DATABASE_URL` 로 연결된 로컬 PostgreSQL 이 필요합니다.",
  "email-already-in-use": "이미 사용 중인 이메일입니다.",
  "invalid-family": "선택한 가족 홈을 찾지 못했습니다.",
  "weak-password": "비밀번호는 8자 이상으로 입력해주세요.",
  "bootstrap-disabled": "운영 환경에서는 로컬 부트스트랩이 비활성화됩니다.",
};

export function getFamilyAccessErrorMessage(code?: string): string | null {
  if (!code) {
    return null;
  }

  return familyMessages[code as FamilyMessageCode] ?? "가족 입장 중 문제가 발생했습니다.";
}

export function getConsoleAuthErrorMessage(code?: string): string | null {
  if (!code) {
    return null;
  }

  return platformMessages[code as PlatformMessageCode] ?? "로그인 중 문제가 발생했습니다.";
}

export function getPlatformAuthErrorMessage(code?: string): string | null {
  if (!code) {
    return null;
  }

  return platformMessages[code as PlatformMessageCode] ?? "로그인 중 문제가 발생했습니다.";
}

export function getBootstrapStateMessage(code?: string): string | null {
  if (code !== "bootstrapped") {
    return null;
  }

  return "로컬 DB 부트스트랩이 끝났습니다. 이제 시드된 운영자 계정으로 로그인할 수 있습니다.";
}
