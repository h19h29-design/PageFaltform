import Link from "next/link";
import { redirect } from "next/navigation";
import { authFlowDefinitions, authRoleMatrix, listDemoConsoleUsers } from "@ysplan/auth";
import { HeroCard, PageShell, StatusPill, SurfaceCard } from "@ysplan/ui";
import { getConsoleAuthErrorMessage } from "../../../../src/lib/messages";
import { getActiveConsoleSession } from "../../../../src/lib/server-sessions";
import { submitConsoleSignInAction } from "./actions";
export default async function ConsoleSignInPage(props) {
    const searchParams = await props.searchParams;
    const activeSession = await getActiveConsoleSession();
    if (activeSession) {
        redirect("/console");
    }
    const errorMessage = getConsoleAuthErrorMessage(searchParams.error);
    const demoUsers = listDemoConsoleUsers();
    const consoleFlow = authFlowDefinitions.consoleSignIn;
    const consoleRoles = authRoleMatrix
        .filter((entry) => entry.consoleSignInAllowed)
        .map((entry) => entry.role)
        .join(", ");
    return (<PageShell eyebrow="Console Sign-In" title="관리자 작업은 별도 계정으로 보호" subtitle="가족 공용 비밀번호와 관리자 계정 인증을 섞지 않기 위해, 운영 작업은 이 경로에서 따로 로그인합니다." actions={<Link className="button button--ghost" href="/">
          홈으로 돌아가기
        </Link>}>
      <HeroCard eyebrow="Separated Security" title="누가 운영 중인지 식별하는 로그인" subtitle="가족 홈에 들어오는 경험은 가볍게 두고, 설정 변경과 권한 관리는 콘솔에서만 하도록 분리했습니다." meta={<>
            <StatusPill tone="warm">owner / admin 보호</StatusPill>
            <StatusPill>console only</StatusPill>
          </>}/>

      <div className="grid-two">
        <SurfaceCard title="관리자 로그인" description={`${consoleFlow.summary} 현재는 데모 계정으로 세션 흐름만 확인합니다.`} badge={errorMessage ? <StatusPill tone="danger">로그인 실패</StatusPill> : null} tone="accent">
          <form action={submitConsoleSignInAction} className="form-stack">
            <label className="form-label">
              이메일
              <input className="text-input" name="email" placeholder="owner@yoon.local" type="email"/>
            </label>
            <label className="form-label">
              비밀번호
              <input className="text-input" name="password" placeholder="demo-owner" type="password"/>
            </label>
            {errorMessage ? <p className="helper-text">{errorMessage}</p> : null}
            <div className="surface-note">
              <p>
                <strong>허용 역할</strong>: {consoleRoles}
              </p>
              <p>세션 유지 시간: {consoleFlow.sessionDurationHours}시간</p>
              <p>{consoleFlow.grants[0]}</p>
              <p>{consoleFlow.denies[2]}</p>
            </div>
            <div className="inline-actions">
              <button className="button button--primary" type="submit">
                콘솔 로그인
              </button>
              <Link className="button button--secondary" href="/f/yoon">
                가족 입구 보기
              </Link>
            </div>
          </form>
        </SurfaceCard>

        <SurfaceCard title="데모 계정" description="로컬 스켈레톤 확인용 계정입니다. 이후 DB/실인증으로 바꾸면 이 영역은 제거하면 됩니다.">
          <div className="surface-stack">
            {demoUsers.map((user) => (<div className="surface-note" key={user.email}>
                <p>
                  <strong>{user.displayName}</strong> · {user.email}
                </p>
                <p>비밀번호: {user.password}</p>
                <p>권한: {user.memberships.map((membership) => `${membership.familySlug}(${membership.role})`).join(", ")}</p>
              </div>))}
          </div>
        </SurfaceCard>
      </div>
    </PageShell>);
}
