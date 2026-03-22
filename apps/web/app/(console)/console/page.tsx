import Link from "next/link";
import { redirect } from "next/navigation";

import { PageShell, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import { signOutConsoleAction } from "../../../src/actions/session-actions";
import { buildFamilyModuleHref } from "../../../src/lib/family-app-routes";
import { canCreateCustomFamilies } from "../../../src/lib/family-sites-store";
import { listConsoleFamilyWorkspaces } from "../../../src/lib/family-workspace";
import { getActiveConsoleSession } from "../../../src/lib/server-sessions";

export default async function ConsolePage() {
  const consoleSession = await getActiveConsoleSession();

  if (!consoleSession) {
    redirect("/console/sign-in?error=session-required");
  }

  const families = await listConsoleFamilyWorkspaces(consoleSession);
  const allowCreation = canCreateCustomFamilies(consoleSession);

  return (
    <PageShell
      eyebrow="Console"
      title={`${consoleSession.displayName} console`}
      subtitle="Create mini family homes, adjust module order, and jump directly into the live app routes from one console."
      actions={
        <div className="inline-actions">
          {allowCreation ? (
            <Link className="button button--primary" href="/console/families/new">
              Create family
            </Link>
          ) : null}
          <form action={signOutConsoleAction}>
            <button className="button button--ghost" type="submit">
              Sign out
            </button>
          </form>
        </div>
      }
    >
      <div className="grid-two">
        <SurfaceCard
          title="What this console owns"
          description="Console routes now connect directly to entry, home, builder, and the first live module for each family."
          badge={<StatusPill tone="accent">{families.length} homes</StatusPill>}
        >
          <ul className="stack-list">
            <li>Builder routes stay at `/console/families/[familySlug]`.</li>
            <li>Family entry stays at `/f/[familySlug]`.</li>
            <li>Family app and module routes stay under `/app/[familySlug]`.</li>
          </ul>
        </SurfaceCard>

        <SurfaceCard
          title="Current access"
          description="Console membership remains separate from family access and only opens manager routes."
          badge={<StatusPill tone="warm">owner or admin</StatusPill>}
        >
          <p className="feature-copy">{consoleSession.email}</p>
          <p className="feature-copy">
            Families: {consoleSession.memberships.map((membership) => membership.familyName).join(", ")}
          </p>
        </SurfaceCard>
      </div>

      <section className="surface-stack">
        <SectionHeader
          kicker="Families"
          title="Live family workspaces"
          action={<StatusPill>{families.length} routes</StatusPill>}
        />

        <div className="family-grid">
          {families.map(({ family, role, canManage, workspaceView }) => {
            const firstModule = workspaceView.workspace.enabledModules[0];

            return (
              <SurfaceCard
                key={`${family.slug}-${role}`}
                title={family.name}
                description={family.tagline}
                badge={<StatusPill tone={canManage ? "accent" : "warm"}>{role}</StatusPill>}
                footer={
                  <div className="inline-actions">
                    <Link className="button button--primary" href={`/app/${family.slug}`}>
                      Open app
                    </Link>
                    {firstModule ? (
                      <Link
                        className="button button--secondary"
                        href={buildFamilyModuleHref(family.slug, firstModule)}
                      >
                        First module
                      </Link>
                    ) : null}
                    <Link className="button button--ghost" href={`/f/${family.slug}`}>
                      Entry
                    </Link>
                    {canManage ? (
                      <Link className="button button--ghost" href={`/console/families/${family.slug}`}>
                        Builder
                      </Link>
                    ) : null}
                  </div>
                }
              >
                <div className="pill-row">
                  {workspaceView.moduleDescriptors.map((module) => (
                    <span className="module-pill" key={module.key}>
                      {module.label}
                    </span>
                  ))}
                </div>

                <dl className="fact-grid">
                  <div className="fact-grid__item">
                    <dt>Home preset</dt>
                    <dd>{workspaceView.homePresetLabel}</dd>
                  </div>
                  <div className="fact-grid__item">
                    <dt>Entry preset</dt>
                    <dd>{workspaceView.entryPresetLabel}</dd>
                  </div>
                  <div className="fact-grid__item">
                    <dt>First module</dt>
                    <dd>{workspaceView.moduleDescriptors[0]?.label ?? "Announcements"}</dd>
                  </div>
                  <div className="fact-grid__item">
                    <dt>Source</dt>
                    <dd>{family.source}</dd>
                  </div>
                </dl>
              </SurfaceCard>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
