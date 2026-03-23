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
      eyebrow="콘솔 로그인"
      title="운영자 접근은 별도로 관리합니다"
      subtitle="가족 입장과 운영자 콘솔은 서로 다른 세션을 사용해 빌더와 관리 화면을 보호합니다."
      actions={
        <Link className="button button--ghost" href="/">
          홈으로
        </Link>
      }
    >
      <HeroCard
        eyebrow="운영자 전용 흐름"
        title="플랫폼 콘솔에 로그인"
        subtitle={
          hasDatabase
            ? "DB 기반 운영자 계정으로 콘솔과 빌더에 접근합니다. 가족 입장 비밀번호로는 이 화면을 열 수 없습니다."
            : "현재는 데모 운영자 계정으로 콘솔과 빌더를 확인합니다. DATABASE_URL이 없으면 데모 폴백이 유지됩니다."
        }
        meta={
          <>
            <StatusPill tone={hasDatabase ? "accent" : "warm"}>
              {hasDatabase ? "DB 기준 모드" : "데모 폴백"}
            </StatusPill>
            <StatusPill tone="warm">운영자 / 관리자</StatusPill>
          </>
        }
      />

      <div className="grid-two">
        <SurfaceCard
          title="로그인 폼"
          description={
            hasDatabase
              ? "운영자 계정으로 콘솔과 빌더에 접근합니다. 첫 로그인 전에 시드 계정이 필요하면 로컬 부트스트랩을 한 번 실행하세요."
              : "운영자 계정으로 콘솔과 빌더를 확인합니다. DB 연결 전에는 로컬 검증용 데모 계정을 계속 사용할 수 있습니다."
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
                <strong>세션 유지</strong>: {authFlowDefinitions.consoleSignIn.sessionDurationHours}시간
              </p>
              {hasDatabase && resolvedSearchParams.state === "bootstrapped" ? (
                <p>
                  <strong>부트스트랩 결과</strong>: 사용자 {resolvedSearchParams.users ?? "0"}명,{" "}
                  가족 {resolvedSearchParams.families ?? "0"}개
                </p>
              ) : null}
              <p>운영자 세션은 가족 입장 세션과 분리되어 빌더와 관리 화면을 보호합니다.</p>
              <p>가족 비밀번호나 입장 코드만으로는 콘솔과 운영 설정 화면에 들어올 수 없습니다.</p>
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
              ? "웹 런타임에서 데모 운영자, 데모 가족, 파일 기반 가족 정보를 바로 준비할 수 있습니다."
              : "DB 연결 전에도 아래 계정으로 로컬 테스트를 이어갈 수 있습니다."
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
                <p>데모 운영자 계정을 만들고, 파일 기반 가족 데이터를 함께 가져옵니다.</p>
                <p>새 로컬 PostgreSQL 데이터베이스라면 `prisma db push` 뒤에 한 번 실행하면 됩니다.</p>
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
