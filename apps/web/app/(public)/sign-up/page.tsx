import Link from "next/link";
import { redirect } from "next/navigation";

import { canAccessConsole } from "@ysplan/auth";
import { HeroCard, PageShell, StatusPill, SurfaceCard } from "@ysplan/ui";

import { submitLocalSignUpAction } from "../../../src/actions/platform-auth-actions";
import { listPublicFamilyPreviews } from "../../../src/lib/family-sites-store";
import { getPlatformAuthErrorMessage } from "../../../src/lib/messages";
import {
  getActivePlatformUserSession,
  isDatabaseSourceOfTruthEnabled,
} from "../../../src/lib/server-sessions";

type SignUpPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SignUpPage(props: SignUpPageProps) {
  const searchParams = await props.searchParams;
  const activeSession = await getActivePlatformUserSession();

  if (activeSession) {
    redirect(canAccessConsole(activeSession) ? "/console" : "/");
  }

  const errorMessage = getPlatformAuthErrorMessage(searchParams.error);
  const hasDatabase = isDatabaseSourceOfTruthEnabled();
  const families = await listPublicFamilyPreviews();

  return (
    <PageShell
      eyebrow="Sign Up"
      title="Create a local account"
      subtitle="This creates a local account, opens a session immediately, and lets you attach the account to one test family for manual verification."
      actions={
        <div className="inline-actions">
          <Link className="button button--ghost" href="/">
            Back home
          </Link>
          <Link className="button button--secondary" href="/sign-in">
            Sign in
          </Link>
        </div>
      }
    >
      <HeroCard
        eyebrow="User Seed"
        title="Sign-up now starts a real local user session"
        subtitle="Without DATABASE_URL this uses the local file store. With DATABASE_URL it switches to the DB-backed runtime."
        meta={
          <>
            <StatusPill tone={hasDatabase ? "accent" : "warm"}>
              {hasDatabase ? "database on" : "local file store"}
            </StatusPill>
            <StatusPill>optional family membership</StatusPill>
          </>
        }
      />

      <div className="grid-two">
        <SurfaceCard
          title="Account sign-up"
          description={
            hasDatabase
              ? "Enter a display name, email, and password to create a DB-backed local test account."
              : "Enter a display name, email, and password to create a local file-backed test account right away."
          }
          badge={errorMessage ? <StatusPill tone="danger">sign-up failed</StatusPill> : null}
          tone="accent"
        >
          <form action={submitLocalSignUpAction} className="form-stack">
            <label className="form-label">
              Display name
              <input
                className="text-input"
                name="displayName"
                placeholder="Family viewer"
              />
            </label>
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
            <label className="form-label">
              Join one family now
              <select className="text-input" defaultValue="" name="familySlug">
                <option value="">No family yet</option>
                {families.map((family) => (
                  <option key={family.slug} value={family.slug}>
                    {family.name} ({family.slug})
                  </option>
                ))}
              </select>
            </label>
            <p className="helper-text">
              Pick a family if you want the account to carry a member membership for local testing.
            </p>
            {errorMessage ? <p className="helper-text">{errorMessage}</p> : null}
            <div className="inline-actions">
              <button className="button button--primary" type="submit">
                Sign up and start
              </button>
              <Link className="button button--secondary" href="/console/sign-in">
                Console sign-in
              </Link>
            </div>
          </form>
        </SurfaceCard>

        <SurfaceCard
          title="Suggested local flow"
          description="This keeps the local product test loop short whether you are using the file store or PostgreSQL."
        >
          <ol className="journey-list">
            <li className="journey-list__item">
              <span className="journey-list__number">1</span>
              <div>
                <strong>Create an account</strong>
                <p className="feature-copy">Sign up here and optionally attach the account to one test family.</p>
              </div>
            </li>
            <li className="journey-list__item">
              <span className="journey-list__number">2</span>
              <div>
                <strong>Open family entry</strong>
                <p className="feature-copy">Use `/f/[familySlug]` and the family password or code to enter the live app.</p>
              </div>
            </li>
            <li className="journey-list__item">
              <span className="journey-list__number">3</span>
              <div>
                <strong>Verify CRUD routes</strong>
                <p className="feature-copy">Move into modules and test create, edit, and delete flows for content, schedule, and tracker data.</p>
              </div>
            </li>
          </ol>
        </SurfaceCard>
      </div>
    </PageShell>
  );
}
