import Link from "next/link";
import { redirect } from "next/navigation";

import { canAccessConsole } from "@ysplan/auth";
import { HeroCard, PageShell, StatusPill, SurfaceCard } from "@ysplan/ui";

import { submitPlatformSignInAction } from "../../../src/actions/platform-auth-actions";
import { getPlatformAuthErrorMessage } from "../../../src/lib/messages";
import {
  getActivePlatformUserSession,
  isDatabaseSourceOfTruthEnabled,
} from "../../../src/lib/server-sessions";

type SignInPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function SignInPage(props: SignInPageProps) {
  const searchParams = await props.searchParams;
  const activeSession = await getActivePlatformUserSession();

  if (activeSession) {
    redirect(canAccessConsole(activeSession) ? "/console" : "/");
  }

  const errorMessage = getPlatformAuthErrorMessage(searchParams.error);
  const nextPath =
    searchParams.next && searchParams.next.startsWith("/") ? searchParams.next : "/";
  const hasDatabase = isDatabaseSourceOfTruthEnabled();

  return (
    <PageShell
      eyebrow="로그인"
      title="로컬 계정으로 로그인"
      subtitle="일반 로그인은 먼저 로컬 파일 저장을 사용하고, `DATABASE_URL` 이 있으면 자동으로 PostgreSQL 런타임으로 전환됩니다."
      actions={
        <div className="inline-actions">
          <Link className="button button--ghost" href="/">
            홈으로
          </Link>
          <Link className="button button--secondary" href="/sign-up">
            회원가입
          </Link>
        </div>
      }
    >
      <HeroCard
        eyebrow="공용 계정 기반"
        title="일반 로그인과 콘솔 접근이 같은 계정 기반을 사용합니다"
        subtitle="일반 사용자는 여기서 로그인하고, 콘솔 접근 여부는 소유자·관리자 멤버십으로 계속 구분됩니다."
        meta={
          <>
            <StatusPill tone={hasDatabase ? "accent" : "warm"}>
              {hasDatabase ? "DB 연결" : "파일 저장"}
            </StatusPill>
            <StatusPill>공용 멤버십</StatusPill>
          </>
        }
      />

      <div className="grid-two">
        <SurfaceCard
          title="계정 로그인"
          description={
            hasDatabase
              ? "이미 만든 이메일과 비밀번호로 로그인합니다."
              : "`/sign-up` 에서 만든 이메일과 비밀번호로 로그인합니다. 콘솔 데모 계정은 `/console/sign-in` 에서 계속 사용할 수 있습니다."
          }
          badge={errorMessage ? <StatusPill tone="danger">로그인 실패</StatusPill> : null}
          tone="accent"
        >
          <form action={submitPlatformSignInAction} className="form-stack">
            <input name="next" type="hidden" value={nextPath} />
            <label className="form-label">
              이메일
              <input
                className="text-input"
                name="email"
                placeholder="name@example.com"
                type="email"
              />
            </label>
            <label className="form-label">
              비밀번호
              <input
                className="text-input"
                name="password"
                placeholder="8자 이상 입력"
                type="password"
              />
            </label>
            {errorMessage ? <p className="helper-text">{errorMessage}</p> : null}
            <div className="inline-actions">
              <button className="button button--primary" type="submit">
                로그인
              </button>
              <Link className="button button--secondary" href="/console/sign-in">
                콘솔 로그인
              </Link>
            </div>
          </form>
        </SurfaceCard>

        <SurfaceCard
          title="로컬 테스트 안내"
          description="일반 사용자 로그인, 가족 입장, 콘솔 로그인의 역할이 서로 다르니 테스트할 때 구분해서 사용하세요."
        >
          <ul className="stack-list">
            <li>`/sign-in` 은 일반 사용자 로그인용입니다.</li>
            <li>`/sign-up` 은 계정을 만들고 바로 세션을 엽니다.</li>
            <li>`/console/sign-in` 은 운영자 테스트용 콘솔 로그인입니다.</li>
          </ul>
        </SurfaceCard>
      </div>
    </PageShell>
  );
}
