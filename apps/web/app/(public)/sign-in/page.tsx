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
      eyebrow="Sign In"
      title="Sign in with a local account"
      subtitle="General sign-in now works with the local file store first and switches to PostgreSQL when DATABASE_URL is available."
      actions={
        <div className="inline-actions">
          <Link className="button button--ghost" href="/">
            Back home
          </Link>
          <Link className="button button--secondary" href="/sign-up">
            Sign up
          </Link>
        </div>
      }
    >
      <HeroCard
        eyebrow="Shared account base"
        title="General sign-in and console access now share one account base"
        subtitle="General sign-in works for local product testing. Console access is still decided by owner/admin memberships."
        meta={
          <>
            <StatusPill tone={hasDatabase ? "accent" : "warm"}>
              {hasDatabase ? "database on" : "local file store"}
            </StatusPill>
            <StatusPill>shared membership</StatusPill>
          </>
        }
      />

      <div className="grid-two">
        <SurfaceCard
          title="Account sign-in"
          description={
            hasDatabase
              ? "Use the email and password you created locally."
              : "Use the email and password you created on `/sign-up`. Console demo fallback still works at `/console/sign-in`."
          }
          badge={errorMessage ? <StatusPill tone="danger">sign-in failed</StatusPill> : null}
          tone="accent"
        >
          <form action={submitPlatformSignInAction} className="form-stack">
            <input name="next" type="hidden" value={nextPath} />
            <label className="form-label">
              Email
              <input
                className="text-input"
                name="email"
                placeholder="you@example.com"
                type="email"
              />
            </label>
            <label className="form-label">
              Password
              <input
                className="text-input"
                name="password"
                placeholder="at least 8 characters"
                type="password"
              />
            </label>
            {errorMessage ? <p className="helper-text">{errorMessage}</p> : null}
            <div className="inline-actions">
              <button className="button button--primary" type="submit">
                Sign in
              </button>
              <Link className="button button--secondary" href="/console/sign-in">
                Console sign-in
              </Link>
            </div>
          </form>
        </SurfaceCard>

        <SurfaceCard
          title="Local notes"
          description="This page is for user account sign-in. Family entry stays on the family route, and console access stays membership-gated."
        >
          <ul className="stack-list">
            <li>`/sign-in` is for general user login.</li>
            <li>`/sign-up` creates a local account and signs that user in immediately.</li>
            <li>`/console/sign-in` remains available for seeded owner/admin testing.</li>
          </ul>
        </SurfaceCard>
      </div>
    </PageShell>
  );
}
