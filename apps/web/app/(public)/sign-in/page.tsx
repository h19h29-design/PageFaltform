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
  const nextPath =
    searchParams.next && searchParams.next.startsWith("/") ? searchParams.next : "/";
  const activeSession = await getActivePlatformUserSession();

  if (activeSession) {
    redirect(nextPath === "/" ? (canAccessConsole(activeSession) ? "/console" : "/") : nextPath);
  }

  const errorMessage = getPlatformAuthErrorMessage(searchParams.error);
  const hasDatabase = isDatabaseSourceOfTruthEnabled();

  return (
    <PageShell
      mode="public"
      eyebrow="로그인"
      title="플랫폼 계정으로 로그인합니다."
      subtitle="일반 사용자용 로그인입니다."
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
        title="일반 로그인과 콘솔 접근은 같은 계정을 공유하되, 화면과 권한은 따로 다룹니다."
        subtitle="일반 사용자는 여기서 로그인하고 가족 입구나 클럽 가입 흐름으로 이동합니다. 콘솔은 별도 로그인 화면에서 테스트합니다."
        meta={
          <>
            <StatusPill tone={hasDatabase ? "accent" : "warm"}>
              {hasDatabase ? "DB 연결" : "파일 저장"}
            </StatusPill>
            <StatusPill>공용 플랫폼 계정</StatusPill>
          </>
        }
      />

      <div className="grid-two">
        <SurfaceCard
          title="계정 로그인"
          description={
            hasDatabase
              ? "가입해둔 이메일과 비밀번호로 로그인합니다."
              : "`/sign-up`에서 만든 계정으로 로그인합니다. 콘솔 데모 계정은 `/console/sign-in`에서 따로 사용합니다."
          }
          badge={errorMessage ? <StatusPill tone="danger">로그인 실패</StatusPill> : null}
          tone="accent"
        >
          <form action={submitPlatformSignInAction} className="form-stack">
            <input name="next" type="hidden" value={nextPath} />
            <label className="form-label">
              이메일
              <input className="text-input" name="email" placeholder="name@example.com" type="email" />
            </label>
            <label className="form-label">
              비밀번호
              <input className="text-input" name="password" placeholder="8자 이상 입력" type="password" />
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
          title="로그인 테스트 안내"
          description="일반 사용자 로그인, 가족 입장, 콘솔 로그인의 역할을 나눠 테스트하면 혼동이 적습니다."
        >
          <ul className="stack-list">
            <li>`/sign-in`은 일반 사용자 로그인용입니다.</li>
            <li>`/sign-up`은 새 계정을 만들고 바로 가족 또는 클럽 흐름으로 이어집니다.</li>
            <li>`/console/sign-in`은 관리자용 콘솔 로그인입니다.</li>
          </ul>
        </SurfaceCard>
      </div>
    </PageShell>
  );
}
