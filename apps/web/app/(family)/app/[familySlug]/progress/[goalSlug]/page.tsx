import Link from "next/link";
import { notFound } from "next/navigation";

import { HeroCard, MetricList, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import {
  buildFamilyHomeHref,
  buildFamilyModuleEditHref,
  buildFamilyModuleHref,
} from "../../../../../../src/lib/family-app-routes";
import { getFamilyAppView } from "../../../../../../src/lib/family-app-view";
import {
  formatAudienceLabel,
  formatCount,
  formatPercent,
  formatTrackerDateTime,
  formatVisibilityLabel,
} from "../../../../../../src/lib/tracker-formatters";
import { buildStoredProgressDashboardFeed, getStoredProgressGoal } from "../../../../../../src/lib/tracker-store";
import { deleteProgressGoalAction } from "../actions";

type ProgressDetailPageProps = {
  params: Promise<{ familySlug: string; goalSlug: string }>;
  searchParams: Promise<{ state?: string }>;
};

function getStateMessage(state?: string) {
  switch (state) {
    case "created":
      return "The goal was created and is now available on both the tracker page and the home progress band.";
    case "updated":
      return "The goal was updated and the refreshed card metadata is ready on home.";
    default:
      return null;
  }
}

export default async function ProgressDetailPage(props: ProgressDetailPageProps) {
  const { familySlug, goalSlug } = await props.params;
  const searchParams = await props.searchParams;
  const familyAppView = await getFamilyAppView(familySlug);

  if (!familyAppView) {
    notFound();
  }

  const goal = await getStoredProgressGoal(familySlug, goalSlug);

  if (!goal) {
    notFound();
  }

  const feed = await buildStoredProgressDashboardFeed({
    familySlug,
    tenantId: familyAppView.workspaceView.family.id,
    timezone: familyAppView.workspaceView.family.timezone,
    now: new Date().toISOString(),
  });
  const card = feed.cards.find((entry) => entry.id === `progress-${goal.id}`);

  if (!card) {
    notFound();
  }

  const stateMessage = getStateMessage(searchParams.state);

  return (
    <div className="surface-stack">
      {stateMessage ? (
        <div className="surface-note">
          <p>{stateMessage}</p>
        </div>
      ) : null}

      <HeroCard
        eyebrow="Progress detail"
        title={goal.title}
        subtitle={card.summary}
        meta={
          <>
            <StatusPill tone="accent">{card.badge}</StatusPill>
            <StatusPill>{formatPercent(card.metricValue)}</StatusPill>
            <StatusPill tone="warm">{goal.streakDays} day streak</StatusPill>
          </>
        }
        actions={
          <div className="inline-actions">
            <Link className="button button--secondary" href={buildFamilyModuleEditHref(familySlug, "progress", goal.slug)}>
              Edit
            </Link>
            <Link className="button button--ghost" href={buildFamilyModuleHref(familySlug, "progress")}>
              Back to list
            </Link>
            <Link className="button button--ghost" href={buildFamilyHomeHref(familySlug)}>
              Home
            </Link>
          </div>
        }
      >
        <SurfaceCard title="Home card preview" description="This is the same score-bearing card payload that the progress band consumes." tone="accent">
          <MetricList
            items={[
              { label: "Priority", value: `${card.priority}` },
              { label: "Completion", value: formatPercent(card.metricValue) },
              { label: "Due", value: formatTrackerDateTime(goal.dueAt, familyAppView.workspaceView.family.timezone) },
              { label: "Section", value: card.sectionHint ?? "progress" },
            ]}
          />
        </SurfaceCard>
      </HeroCard>

      <div className="grid-two">
        <SurfaceCard title="Goal metrics" description="Numbers here drive the attainment badge and remaining-gap summary.">
          <MetricList
            items={[
              { label: "Current", value: formatCount(goal.currentValue, goal.metricUnit) },
              { label: "Target", value: formatCount(goal.targetValue, goal.metricUnit) },
              { label: "Metric label", value: goal.metricLabel },
              { label: "Cadence", value: goal.cadenceLabel },
            ]}
          />
        </SurfaceCard>

        <SurfaceCard title="Visibility" description="Audience and visibility stay contract-safe for the dashboard feed.">
          <MetricList
            items={[
              { label: "Audience", value: formatAudienceLabel(goal.audience) },
              { label: "Visibility", value: formatVisibilityLabel(goal.visibilityScope) },
              { label: "Featured", value: goal.featured ? "Yes" : "No" },
              { label: "Updated", value: formatTrackerDateTime(goal.updatedAt, familyAppView.workspaceView.family.timezone) },
            ]}
          />
        </SurfaceCard>
      </div>

      <SurfaceCard title="Outcome" description={goal.goalOutcome} />

      <section className="surface-stack">
        <SectionHeader kicker="Danger zone" title="Delete goal" />
        <SurfaceCard
          title="Remove this goal"
          description="Deleting the goal removes it from the list and from the progress band on home."
          badge={<StatusPill tone="danger">destructive</StatusPill>}
        >
          <form action={deleteProgressGoalAction} className="inline-actions">
            <input name="familySlug" type="hidden" value={familySlug} />
            <input name="currentSlug" type="hidden" value={goal.slug} />
            <button className="button button--ghost" type="submit">
              Delete goal
            </button>
          </form>
        </SurfaceCard>
      </section>
    </div>
  );
}
