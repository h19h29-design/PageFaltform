import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import { resolveFamilyFromSlug, type FamilyRole } from "@ysplan/tenant";

export type { FamilyRole } from "@ysplan/tenant";

export type AuthFlowId = "family-access" | "console-sign-in";
export type FamilyViewerRole = Extract<FamilyRole, "guest" | "member" | "child">;
export type ConsoleManagerRole = Extract<FamilyRole, "owner" | "admin">;

export interface FamilyAccessSession {
  kind: "family-access";
  familySlug: string;
  tenantId: string;
  viewerRole: FamilyViewerRole;
  sessionToken?: string;
  userId?: string | null;
  source?: "demo" | "database";
  grantedAt: string;
  expiresAt: string;
}

export interface PlatformMembership {
  familySlug: string;
  familyName: string;
  role: Exclude<FamilyRole, "guest">;
}

export interface PlatformUserSession {
  kind: "platform-user";
  userId: string;
  displayName: string;
  email: string;
  memberships: PlatformMembership[];
  sessionToken?: string;
  source?: "demo" | "database";
  expiresAt: string;
}

export type FamilyAccessErrorCode = "family-not-found" | "invalid-secret";

export type ConsoleAuthErrorCode = "invalid-credentials" | "not-authorized";

export interface FamilyAccessResult {
  ok: boolean;
  session?: FamilyAccessSession;
  errorCode?: FamilyAccessErrorCode;
}

export interface ConsoleAuthResult {
  ok: boolean;
  session?: PlatformUserSession;
  errorCode?: ConsoleAuthErrorCode;
}

export interface AuthFlowDefinition {
  flowId: AuthFlowId;
  sessionKind: FamilyAccessSession["kind"] | PlatformUserSession["kind"];
  title: string;
  audienceLabel: string;
  routePattern: string;
  failureRedirect: string;
  sessionDurationHours: number;
  summary: string;
  grants: string[];
  denies: string[];
  dbEntities: string[];
}

export interface AuthRoleMatrixEntry {
  role: FamilyRole;
  familyEntryAllowed: boolean;
  familyHomeAllowed: boolean;
  consoleSignInAllowed: boolean;
  consoleWorkspaceVisible: boolean;
  consoleWorkspaceManageable: boolean;
  customFamilyCreationAllowed: boolean;
  notes: string;
}

export interface AuthSessionRequirement {
  flowId: AuthFlowId;
  sessionKind: FamilyAccessSession["kind"] | PlatformUserSession["kind"];
  audienceLabel: string;
  subjectRoles: FamilyRole[];
  transport: "cookie";
  validation: "shared-secret" | "email-password";
  sessionDurationHours: number;
  dbEntities: string[];
  notes: string;
}

export interface AuthRouteBoundary {
  routePattern: string;
  flowId: AuthFlowId;
  sessionKind: FamilyAccessSession["kind"] | PlatformUserSession["kind"];
  allowedRoles: FamilyRole[];
  fallbackRoute: string;
  notes: string;
}

interface DemoPlatformUser {
  id: string;
  displayName: string;
  email: string;
  password: string;
  memberships: PlatformMembership[];
}

const FAMILY_ACCESS_SESSION_HOURS = 18;
const PLATFORM_USER_SESSION_HOURS = 12;
const PASSWORD_HASH_PREFIX = "scrypt";
const PASSWORD_HASH_KEY_LENGTH = 64;

export const authFlowDefinitions = {
  familyAccess: {
    flowId: "family-access",
    sessionKind: "family-access",
    title: "가족 입장",
    audienceLabel: "가족 구성원, 아이, 초대된 손님",
    routePattern: "/f/[familySlug]",
    failureRedirect: "/f/[familySlug]?step=access",
    sessionDurationHours: FAMILY_ACCESS_SESSION_HOURS,
    summary: "가족별 공유 비밀값으로 단일 가족 홈에 들어가는 읽기 중심 흐름입니다.",
    grants: [
      "선택한 가족 홈(`/app/[familySlug]`)에 입장할 수 있습니다.",
      "콘솔 계정 없이도 가족 전용 화면을 열 수 있습니다.",
      "세션은 가족별로 나뉘며 만료 시간이 지나면 다시 확인합니다.",
    ],
    denies: [
      "관리자 콘솔(`/console`)이나 빌더 화면에는 들어갈 수 없습니다.",
      "다른 가족 슬러그에는 그대로 재사용할 수 없습니다.",
      "공유 비밀값만으로는 운영 권한(owner/admin)을 얻지 않습니다.",
    ],
    dbEntities: ["FamilyTenant", "FamilyAccessPolicy", "FamilyAccessSession"],
  },
  consoleSignIn: {
    flowId: "console-sign-in",
    sessionKind: "platform-user",
    title: "관리자 콘솔 로그인",
    audienceLabel: "owner/admin 운영자",
    routePattern: "/console/sign-in",
    failureRedirect: "/console/sign-in?error=session-required",
    sessionDurationHours: PLATFORM_USER_SESSION_HOURS,
    summary: "가족용 공유 비밀값과 분리된 운영자 로그인으로 콘솔과 빌더를 보호합니다.",
    grants: [
      "관리자 콘솔(`/console`)에 접근할 수 있습니다.",
      "배정된 가족 홈의 빌더와 설정 변경 화면을 열 수 있습니다.",
      "owner/admin 역할이 있는 가족에서는 가족 입구를 우회해 확인할 수 있습니다.",
    ],
    denies: [
      "가족 공유 비밀값을 대신하지 않습니다.",
      "배정되지 않은 가족 홈까지 자동으로 관리할 수는 없습니다.",
      "member/child/guest 전용 이용 흐름을 대체하지 않습니다.",
    ],
    dbEntities: ["User", "Membership", "Session"],
  },
} satisfies {
  familyAccess: AuthFlowDefinition;
  consoleSignIn: AuthFlowDefinition;
};

export const authSessionRequirements: AuthSessionRequirement[] = [
  {
    flowId: authFlowDefinitions.familyAccess.flowId,
    sessionKind: authFlowDefinitions.familyAccess.sessionKind,
    audienceLabel: authFlowDefinitions.familyAccess.audienceLabel,
    subjectRoles: ["guest", "member", "child"],
    transport: "cookie",
    validation: "shared-secret",
    sessionDurationHours: authFlowDefinitions.familyAccess.sessionDurationHours,
    dbEntities: authFlowDefinitions.familyAccess.dbEntities,
    notes: "공유 비밀값 검증 후 단일 가족 슬러그 범위의 세션을 발급합니다.",
  },
  {
    flowId: authFlowDefinitions.consoleSignIn.flowId,
    sessionKind: authFlowDefinitions.consoleSignIn.sessionKind,
    audienceLabel: authFlowDefinitions.consoleSignIn.audienceLabel,
    subjectRoles: ["owner", "admin"],
    transport: "cookie",
    validation: "email-password",
    sessionDurationHours: authFlowDefinitions.consoleSignIn.sessionDurationHours,
    dbEntities: authFlowDefinitions.consoleSignIn.dbEntities,
    notes: "운영자 계정 로그인 후 `/console` 전용 세션으로 취급합니다.",
  },
];

export const authRouteBoundaries: AuthRouteBoundary[] = [
  {
    routePattern: "/f/[familySlug]",
    flowId: authFlowDefinitions.familyAccess.flowId,
    sessionKind: authFlowDefinitions.familyAccess.sessionKind,
    allowedRoles: ["guest", "member", "child"],
    fallbackRoute: authFlowDefinitions.familyAccess.failureRedirect,
    notes: "공유 비밀값 확인 화면이며, 콘솔 인증을 요구하지 않습니다.",
  },
  {
    routePattern: "/app/[familySlug]",
    flowId: authFlowDefinitions.familyAccess.flowId,
    sessionKind: authFlowDefinitions.familyAccess.sessionKind,
    allowedRoles: ["guest", "member", "child", "owner", "admin"],
    fallbackRoute: "/f/[familySlug]?step=access&error=session-expired",
    notes: "가족 입장 세션이 기본이며, owner/admin 콘솔 세션은 운영 확인용으로만 우회 가능합니다.",
  },
  {
    routePattern: "/console",
    flowId: authFlowDefinitions.consoleSignIn.flowId,
    sessionKind: authFlowDefinitions.consoleSignIn.sessionKind,
    allowedRoles: ["owner", "admin"],
    fallbackRoute: authFlowDefinitions.consoleSignIn.failureRedirect,
    notes: "운영자 콘솔의 시작점입니다. member/child/guest는 진입하지 않습니다.",
  },
  {
    routePattern: "/console/families/[familySlug]",
    flowId: authFlowDefinitions.consoleSignIn.flowId,
    sessionKind: authFlowDefinitions.consoleSignIn.sessionKind,
    allowedRoles: ["owner", "admin"],
    fallbackRoute: authFlowDefinitions.consoleSignIn.failureRedirect,
    notes: "가족별 빌더와 저장 액션은 운영자 콘솔 세션만 허용합니다.",
  },
];

export const authRoleMatrix: AuthRoleMatrixEntry[] = [
  {
    role: "owner",
    familyEntryAllowed: true,
    familyHomeAllowed: true,
    consoleSignInAllowed: true,
    consoleWorkspaceVisible: true,
    consoleWorkspaceManageable: true,
    customFamilyCreationAllowed: true,
    notes: "가족 공유 입장도 가능하지만, 운영 작업은 전용 콘솔 세션으로만 처리합니다.",
  },
  {
    role: "admin",
    familyEntryAllowed: true,
    familyHomeAllowed: true,
    consoleSignInAllowed: true,
    consoleWorkspaceVisible: true,
    consoleWorkspaceManageable: true,
    customFamilyCreationAllowed: true,
    notes: "owner와 함께 콘솔 운영을 담당하는 역할입니다.",
  },
  {
    role: "member",
    familyEntryAllowed: true,
    familyHomeAllowed: true,
    consoleSignInAllowed: false,
    consoleWorkspaceVisible: false,
    consoleWorkspaceManageable: false,
    customFamilyCreationAllowed: false,
    notes: "가족 홈 이용 대상이며, 현재 앱에서는 가족 입장 세션으로 분리합니다.",
  },
  {
    role: "child",
    familyEntryAllowed: true,
    familyHomeAllowed: true,
    consoleSignInAllowed: false,
    consoleWorkspaceVisible: false,
    consoleWorkspaceManageable: false,
    customFamilyCreationAllowed: false,
    notes: "보호가 필요한 가족 홈 이용자이며, 관리 콘솔과는 분리합니다.",
  },
  {
    role: "guest",
    familyEntryAllowed: true,
    familyHomeAllowed: true,
    consoleSignInAllowed: false,
    consoleWorkspaceVisible: false,
    consoleWorkspaceManageable: false,
    customFamilyCreationAllowed: false,
    notes: "현재 공유 비밀값을 통과한 가족 홈 세션은 기본적으로 guest 뷰어로 다룹니다.",
  },
];

const demoPlatformUsers: DemoPlatformUser[] = [
  {
    id: "user-1",
    displayName: "윤 운영자",
    email: "owner@yoon.local",
    password: "demo-owner",
    memberships: [
      {
        familySlug: "yoon",
        familyName: "윤네 거실",
        role: "owner",
      },
    ],
  },
  {
    id: "user-2",
    displayName: "박 관리자",
    email: "admin@park.local",
    password: "demo-admin",
    memberships: [
      {
        familySlug: "park",
        familyName: "박가네 라운지",
        role: "admin",
      },
    ],
  },
  {
    id: "user-3",
    displayName: "윤 가족 구성원",
    email: "member@yoon.local",
    password: "demo-member",
    memberships: [
      {
        familySlug: "yoon",
        familyName: "윤네 거실",
        role: "member",
      },
      {
        familySlug: "park",
        familyName: "박가네 라운지",
        role: "child",
      },
    ],
  },
];

function addHours(now: Date, hours: number): Date {
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = scryptSync(password, `ysplan-password:${salt}`, PASSWORD_HASH_KEY_LENGTH);

  return `${PASSWORD_HASH_PREFIX}$${salt}$${derivedKey.toString("base64url")}`;
}

export function verifyPasswordHash(input: {
  password: string;
  passwordHash: string;
}): boolean {
  const [algorithm, salt, encodedHash] = input.passwordHash.split("$");

  if (algorithm !== PASSWORD_HASH_PREFIX || !salt || !encodedHash) {
    return false;
  }

  try {
    const expected = Buffer.from(encodedHash, "base64url");
    const actual = scryptSync(input.password, `ysplan-password:${salt}`, expected.length);

    return (
      expected.length === actual.length && timingSafeEqual(expected, actual)
    );
  } catch {
    return false;
  }
}

export function hashSharedSecretForFamily(
  familySlug: string,
  secret: string,
): string {
  return scryptSync(secret.trim(), `ysplan:${familySlug.trim().toLowerCase()}`, 32).toString(
    "hex",
  );
}

export function verifySharedSecretHash(input: {
  familySlug: string;
  providedSecret: string;
  sharedSecretHash: string;
}): boolean {
  const expectedHash = hashSharedSecretForFamily(
    input.familySlug,
    input.providedSecret,
  );

  try {
    const expected = Buffer.from(input.sharedSecretHash, "hex");
    const actual = Buffer.from(expectedHash, "hex");

    return (
      expected.length === actual.length && timingSafeEqual(expected, actual)
    );
  } catch {
    return false;
  }
}

export function isConsoleManagerRole(role: FamilyRole): role is ConsoleManagerRole {
  return role === "owner" || role === "admin";
}

export function toFamilyViewerRole(role: FamilyRole): FamilyViewerRole {
  if (role === "child") {
    return "child";
  }

  if (role === "member" || role === "owner" || role === "admin") {
    return "member";
  }

  return "guest";
}

export function getConsoleManagerMemberships(
  session: PlatformUserSession,
): PlatformMembership[] {
  return session.memberships.filter((membership) => isConsoleManagerRole(membership.role));
}

export function createFamilyAccessSession(input: {
  familySlug: string;
  tenantId: string;
  viewerRole?: FamilyViewerRole;
  sessionToken?: string;
  userId?: string | null;
  source?: "demo" | "database";
  expiresAt?: string | Date;
  now?: Date;
}): FamilyAccessSession {
  const now = input.now ?? new Date();
  const expiresAt =
    typeof input.expiresAt === "string"
      ? new Date(input.expiresAt)
      : input.expiresAt ?? addHours(now, authFlowDefinitions.familyAccess.sessionDurationHours);

  return {
    kind: "family-access",
    familySlug: input.familySlug,
    tenantId: input.tenantId,
    viewerRole: input.viewerRole ?? "guest",
    ...(input.sessionToken ? { sessionToken: input.sessionToken } : {}),
    ...(typeof input.userId !== "undefined" ? { userId: input.userId } : {}),
    ...(input.source ? { source: input.source } : {}),
    grantedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

export function createPlatformUserSession(input: {
  userId: string;
  displayName: string;
  email: string;
  memberships: PlatformMembership[];
  sessionToken?: string;
  source?: "demo" | "database";
  expiresAt?: string | Date;
  now?: Date;
}): PlatformUserSession {
  const now = input.now ?? new Date();
  const expiresAt =
    typeof input.expiresAt === "string"
      ? new Date(input.expiresAt)
      : input.expiresAt ?? addHours(now, PLATFORM_USER_SESSION_HOURS);

  return {
    kind: "platform-user",
    userId: input.userId,
    displayName: input.displayName,
    email: normalizeEmail(input.email),
    memberships: input.memberships,
    ...(input.sessionToken ? { sessionToken: input.sessionToken } : {}),
    ...(input.source ? { source: input.source } : {}),
    expiresAt: expiresAt.toISOString(),
  };
}

export function verifySharedSecret(input: {
  expectedSecret: string;
  providedSecret: string;
}): boolean {
  return input.expectedSecret.trim() === input.providedSecret.trim();
}

export function verifyFamilyAccess(input: {
  familySlug: string;
  secret: string;
  now?: Date;
}): FamilyAccessResult {
  const family = resolveFamilyFromSlug(input.familySlug);

  if (!family) {
    return { ok: false, errorCode: "family-not-found" };
  }

  if (
    !verifySharedSecret({
      expectedSecret: family.accessPolicy.secret,
      providedSecret: input.secret,
    })
  ) {
    return { ok: false, errorCode: "invalid-secret" };
  }

  return {
    ok: true,
    session: createFamilyAccessSession({
      familySlug: family.slug,
      tenantId: family.id,
      ...(input.now ? { now: input.now } : {}),
    }),
  };
}

export function verifyConsoleCredentials(input: {
  email: string;
  password: string;
  now?: Date;
}): ConsoleAuthResult {
  const normalizedEmail = normalizeEmail(input.email);
  const user = demoPlatformUsers.find((candidate) => candidate.email.toLowerCase() === normalizedEmail);

  if (!user || user.password !== input.password) {
    return { ok: false, errorCode: "invalid-credentials" };
  }

  if (!user.memberships.some((membership) => isConsoleManagerRole(membership.role))) {
    return { ok: false, errorCode: "not-authorized" };
  }

  return {
    ok: true,
    session: createPlatformUserSession({
      userId: user.id,
      displayName: user.displayName,
      email: user.email,
      memberships: user.memberships,
      source: "demo",
      ...(input.now ? { now: input.now } : {}),
    }),
  };
}

export function isFamilyAccessSessionActive(session: FamilyAccessSession, now = new Date()): boolean {
  return new Date(session.expiresAt).getTime() > now.getTime();
}

export function isPlatformUserSessionActive(session: PlatformUserSession, now = new Date()): boolean {
  return new Date(session.expiresAt).getTime() > now.getTime();
}

export function getMembershipForFamily(
  session: PlatformUserSession,
  familySlug: string,
): PlatformMembership | null {
  return session.memberships.find((membership) => membership.familySlug === familySlug) ?? null;
}

export function requireFamilyRole(
  session: PlatformUserSession,
  familySlug: string,
  allowedRoles: Array<Exclude<FamilyRole, "guest">>,
): boolean {
  const membership = getMembershipForFamily(session, familySlug);
  return membership ? allowedRoles.includes(membership.role) : false;
}

export function canAccessConsole(session: PlatformUserSession, familySlug?: string): boolean {
  const consoleMemberships = getConsoleManagerMemberships(session);

  if (!familySlug) {
    return consoleMemberships.length > 0;
  }

  return consoleMemberships.some((membership) => membership.familySlug === familySlug);
}

export function listDemoConsoleUsers(): Array<{
  id: string;
  email: string;
  password: string;
  displayName: string;
  memberships: PlatformMembership[];
}> {
  return demoPlatformUsers
    .filter((user) => user.memberships.some((membership) => isConsoleManagerRole(membership.role)))
    .map((user) => ({
      id: user.id,
      email: user.email,
      password: user.password,
      displayName: user.displayName,
      memberships: user.memberships,
    }));
}
