import Link from "next/link";
import { redirect } from "next/navigation";

import { authFlowDefinitions, authRoleMatrix, listDemoConsoleUsers } from "@ysplan/auth";
import { HeroCard, PageShell, StatusPill, SurfaceCard } from "@ysplan/ui";

import { runLocalBootstrapAction } from "../../../../src/actions/platform-auth-actions";
import {
  getBootstrapStateMessage,
  getConsoleAuthErrorMessage,
} from "../../../../src/lib/messages";
import {
  getActiveConsoleSession,
  isDatabaseSourceOfTruthEnabled,
} from "../../../../src/lib/server-sessions";
import { submitConsoleSignInAction } from "./actions";

type ConsoleSignInPageProps = {
  searchParams: Promise<{ error?: string; state?: string; users?: string; families?: string }>;
};

export default async function ConsoleSignInPage({ searchParams }: ConsoleSignInPageProps) {
  const resolvedSearchParams = await searchParams;
  const activeSession = await getActiveConsoleSession();

  if (activeSession) {
    redirect("/console");
  }

  const errorMessage = getConsoleAuthErrorMessage(resolvedSearchParams.error);
  const stateMessage = getBootstrapStateMessage(resolvedSearchParams.state);
  const demoUsers = listDemoConsoleUsers();
  const hasDatabase = isDatabaseSourceOfTruthEnabled();
  const consoleRoles = authRoleMatrix
    .filter((entry) => entry.consoleSignInAllowed)
    .map((entry) => entry.role)
    .join(", ");

  return (
    <PageShell
      mode="console"
      eyebrow="콘솔 로그인"
      title="운영자 콘솔 로그인"
      subtitle="관리용 세션만 따로 엽니다."
      actions={
        <Link className="button button--ghost" href="/">
          홈으로
        </Link>
      }
    >
      <HeroCard
        eyebrow="운영 전용 흐름"
        title="플랫폼 콘솔에 로그인합니다."
        subtitle={
          hasDatabase
            ? "DB 기반 운영자 계정으로 콘솔과 빌더에 접근합니다. 가족 비밀번호나 입장 코드만으로는 이 화면에 들어올 수 없습니다."
            : "현재는 데모 운영자 계정으로 콘솔과 빌더를 테스트합니다. DB를 붙이지 않아도 로컬 운영 흐름은 바로 확인할 수 있습니다."
        }
        meta={
          <>
            <StatusPill tone={hasDatabase ? "accent" : "warm"}>
              {hasDatabase ? "DB 기준 모드" : "데모 계정 모드"}
            </StatusPill>
            <StatusPill tone="warm">운영자 / 관리자</StatusPill>
          </>
        }
      />

      <div className="grid-two">
        <SurfaceCard
          title="콘솔 로그인"
          description={
            hasDatabase
              ? "운영자 계정 이메일과 비밀번호로 로그인합니다. 첫 로그인 전에 부트스트랩이 필요하면 오른쪽에서 바로 실행할 수 있습니다."
              : "데모 운영자 계정으로 콘솔과 빌더를 테스트합니다. DB가 없어도 로컬 운영 흐름은 유지됩니다."
          }
          badge={errorMessage ? <StatusPill tone="danger">로그인 실패</StatusPill> : null}
          tone="accent"
        >
          <form action={submitConsoleSignInAction} className="form-stack">
            <input name="consoleOnly" type="hidden" value="1" />
            <input name="next" type="hidden" value="/console" />
            <label className="form-label">
              이메일
              <input className="text-input" name="email" placeholder="owner@yoon.local" type="email" />
            </label>

            <label className="form-label">
              비밀번호
              <input className="text-input" name="password" placeholder="demo-owner" type="password" />
            </label>

            {stateMessage ? <p className="helper-text">{stateMessage}</p> : null}
            {errorMessage ? <p className="helper-text">{errorMessage}</p> : null}

            <div className="surface-note">
              <p>
                <strong>허용 역할</strong>: {consoleRoles}
              </p>
              <p>
                <strong>세션 시간</strong>: {authFlowDefinitions.consoleSignIn.sessionDurationHours}시간
              </p>
              {hasDatabase && resolvedSearchParams.state === "bootstrapped" ? (
                <p>
                  <strong>부트스트랩 결과</strong>: 사용자 {resolvedSearchParams.users ?? "0"}명, 가족{" "}
                  {resolvedSearchParams.families ?? "0"}개
                </p>
              ) : null}
              <p>운영자 세션은 가족 입장 세션과 분리되어 빌더와 승인 화면을 보호합니다.</p>
            </div>

            <div className="inline-actions">
              <button className="button button--primary" type="submit">
                로그인
              </button>
              <Link className="button button--secondary" href="/sign-up">
                회원가입
              </Link>
              <Link className="button button--secondary" href="/f/yoon">
                가족 입구 열기
              </Link>
            </div>
          </form>
        </SurfaceCard>

        <SurfaceCard
          title={hasDatabase ? "로컬 부트스트랩" : "데모 계정"}
          description={
            hasDatabase
              ? "로컬 테스트에 필요한 운영자 계정과 기본 데이터를 한 번에 넣습니다."
              : "DB 없이도 바로 콘솔을 볼 수 있도록 준비된 데모 운영자 계정입니다."
          }
        >
          {hasDatabase ? (
            <div className="surface-stack">
              <form action={runLocalBootstrapAction}>
                <button className="button button--primary" type="submit">
                  로컬 부트스트랩 실행
                </button>
              </form>
              <div className="surface-note">
                <p>데모 운영자 계정과 파일 기반 가족 데이터를 DB 기준선으로 준비합니다.</p>
                <p>로컬 PostgreSQL이 있으면 이후 `prisma db push` 뒤에 바로 검증할 수 있습니다.</p>
              </div>
            </div>
          ) : null}
          <div className="surface-stack">
            {demoUsers.map((user) => (
              <div className="surface-note" key={user.email}>
                <p>
                  <strong>{user.displayName}</strong> - {user.email}
                </p>
                <p>비밀번호: {user.password}</p>
                <p>
                  소속:{" "}
                  {user.memberships.map((membership) => `${membership.familySlug}(${membership.role})`).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </PageShell>
  );
}
