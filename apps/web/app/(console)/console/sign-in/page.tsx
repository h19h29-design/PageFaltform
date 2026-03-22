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
  const consoleFlow = authFlowDefinitions.consoleSignIn;
  const hasDatabase = isDatabaseSourceOfTruthEnabled();
  const consoleRoles = authRoleMatrix
    .filter((entry) => entry.consoleSignInAllowed)
    .map((entry) => entry.role)
    .join(", ");

  return (
    <PageShell
      eyebrow="Console sign-in"
      title="Manager access stays separate"
      subtitle="Family entry and manager access use different sessions so builder routes stay protected."
      actions={
        <Link className="button button--ghost" href="/">
          Back home
        </Link>
      }
    >
        <HeroCard
        eyebrow="Separated security"
        title="Sign in to the platform console"
        subtitle={
          hasDatabase
            ? "Use a DB-backed operator account for console and builder routes. Family shared secrets do not unlock these pages."
            : "Use the manager account for console and builder routes. Without DATABASE_URL, demo fallback stays available."
        }
        meta={
          <>
            <StatusPill tone={hasDatabase ? "accent" : "warm"}>
              {hasDatabase ? "db source of truth" : "demo fallback"}
            </StatusPill>
            <StatusPill tone="warm">owner / admin</StatusPill>
          </>
        }
      />

      <div className="grid-two">
        <SurfaceCard
          title="Sign-in form"
          description={
            hasDatabase
              ? `${consoleFlow.summary} Run local bootstrap once if you need seeded operator accounts before the first sign-in.`
              : `${consoleFlow.summary} Demo users are still available for local verification.`
          }
          badge={errorMessage ? <StatusPill tone="danger">sign-in failed</StatusPill> : null}
          tone="accent"
        >
          <form action={submitConsoleSignInAction} className="form-stack">
            <input name="consoleOnly" type="hidden" value="1" />
            <input name="next" type="hidden" value="/console" />
            <label className="form-label">
              Email
              <input className="text-input" name="email" placeholder="owner@yoon.local" type="email" />
            </label>

            <label className="form-label">
              Password
              <input className="text-input" name="password" placeholder="demo-owner" type="password" />
            </label>

            {stateMessage ? <p className="helper-text">{stateMessage}</p> : null}
            {errorMessage ? <p className="helper-text">{errorMessage}</p> : null}

            <div className="surface-note">
              <p>
                <strong>Allowed roles</strong>: {consoleRoles}
              </p>
              <p>
                <strong>Session window</strong>: {consoleFlow.sessionDurationHours} hours
              </p>
              {hasDatabase && resolvedSearchParams.state === "bootstrapped" ? (
                <p>
                  <strong>Bootstrap result</strong>: {resolvedSearchParams.users ?? "0"} users,{" "}
                  {resolvedSearchParams.families ?? "0"} families
                </p>
              ) : null}
              <p>{consoleFlow.grants[0]}</p>
              <p>{consoleFlow.denies[2]}</p>
            </div>

            <div className="inline-actions">
              <button className="button button--primary" type="submit">
                Sign in
              </button>
              <Link className="button button--secondary" href="/sign-up">
                Sign up
              </Link>
              <Link className="button button--secondary" href="/f/yoon">
                Open family entry
              </Link>
            </div>
          </form>
        </SurfaceCard>

        <SurfaceCard
          title={hasDatabase ? "Local bootstrap" : "Demo accounts"}
          description={
            hasDatabase
              ? "Seed demo operator accounts, demo families, and imported file-backed families directly from the web runtime."
              : "These users keep local testing unblocked until the DB-backed account flow is fully wired."
          }
        >
          {hasDatabase ? (
            <div className="surface-stack">
              <form action={runLocalBootstrapAction}>
                <button className="button button--primary" type="submit">
                  Run local bootstrap
                </button>
              </form>
              <div className="surface-note">
                <p>Bootstraps demo operator users with password hashes and imports file-backed custom families.</p>
                <p>Use this once after `prisma db push` on a fresh local PostgreSQL database.</p>
              </div>
            </div>
          ) : null}
          <div className="surface-stack">
            {demoUsers.map((user) => (
              <div className="surface-note" key={user.email}>
                <p>
                  <strong>{user.displayName}</strong> - {user.email}
                </p>
                <p>Password: {user.password}</p>
                <p>
                  Memberships:{" "}
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
