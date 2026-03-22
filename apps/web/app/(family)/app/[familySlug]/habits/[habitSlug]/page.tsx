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
  formatPercent,
  formatTrackerDateTime,
  formatVisibilityLabel,
} from "../../../../../../src/lib/tracker-formatters";
import { buildStoredHabitsDashboardFeed, getStoredHabitRoutine } from "../../../../../../src/lib/tracker-store";
import { deleteHabitRoutineAction } from "../actions";

type HabitDetailPageProps = {
  params: Promise<{ familySlug: string; habitSlug: string }>;
  searchParams: Promise<{ state?: string }>;
};

function getStateMessage(state?: string) {
  switch (state) {
    case "created":
      return "The habit was created and is now available on both the tracker page and the home progress band.";
    case "updated":
      return "The habit was updated and the refreshed card metadata is ready on home.";
    default:
      return null;
  }
}

export default async function HabitDetailPage(props: HabitDetailPageProps) {
  const { familySlug, habitSlug } = await props.params;
  const searchParams = await props.searchParams;
  const familyAppView = await getFamilyAppView(familySlug);

  if (!familyAppView) {
    notFound();
  }

  const habit = await getStoredHabitRoutine(familySlug, habitSlug);

  if (!habit) {
    notFound();
  }

  const feed = await buildStoredHabitsDashboardFeed({
    familySlug,
    tenantId: familyAppView.workspaceView.family.id,
    timezone: familyAppView.workspaceView.family.timezone,
    now: new Date().toISOString(),
  });
  const card = feed.cards.find((entry) => entry.id === `habit-${habit.id}`);

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
        eyebrow="Habit detail"
        title={habit.title}
        subtitle={card.summary}
        meta={
          <>
            <StatusPill tone="accent">{card.badge}</StatusPill>
            <StatusPill>{formatPercent(card.metricValue)}</StatusPill>
            <StatusPill tone="warm">{habit.streakDays} day streak</StatusPill>
          </>
        }
        actions={
          <div className="inline-actions">
            <Link className="button button--secondary" href={buildFamilyModuleEditHref(familySlug, "habits", habit.slug)}>
              Edit
            </Link>
            <Link className="button button--ghost" href={buildFamilyModuleHref(familySlug, "habits")}>
              Back to list
            </Link>
            <Link className="button button--ghost" href={buildFamilyHomeHref(familySlug)}>
              Home
            </Link>
          </div>
        }
      >
        <SurfaceCard title="Home card preview" description="This mirrors the same ranked habit card payload that the progress band consumes." tone="accent">
          <MetricList
            items={[
              { label: "Priority", value: `${card.priority}` },
              { label: "Consistency", value: formatPercent(card.metricValue) },
              { label: "Check-in", value: formatTrackerDateTime(habit.nextCheckInAt, familyAppView.workspaceView.family.timezone) },
              { label: "Section", value: card.sectionHint ?? "progress" },
            ]}
          />
        </SurfaceCard>
      </HeroCard>

      <div className="grid-two">
        <SurfaceCard title="Habit metrics" description="These values drive streak, consistency, and tie-breaking in the progress band.">
          <MetricList
            items={[
              { label: "Completion", value: `${habit.completionCount}/${habit.targetCount}` },
              { label: "Consistency", value: formatPercent(habit.consistencyRate) },
              { label: "Period", value: habit.periodLabel },
              { label: "Streak", value: `${habit.streakDays} days` },
            ]}
          />
        </SurfaceCard>

        <SurfaceCard title="Visibility" description="Audience and visibility stay contract-safe for the dashboard feed.">
          <MetricList
            items={[
              { label: "Audience", value: formatAudienceLabel(habit.audience) },
              { label: "Visibility", value: formatVisibilityLabel(habit.visibilityScope) },
              { label: "Featured", value: habit.featured ? "Yes" : "No" },
              { label: "Updated", value: formatTrackerDateTime(habit.updatedAt, familyAppView.workspaceView.family.timezone) },
            ]}
          />
        </SurfaceCard>
      </div>

      <SurfaceCard title="Benefit" description={habit.habitBenefit} />

      <section className="surface-stack">
        <SectionHeader kicker="Danger zone" title="Delete habit" />
        <SurfaceCard
          title="Remove this habit"
          description="Deleting the habit removes it from the list and from the progress band on home."
          badge={<StatusPill tone="danger">destructive</StatusPill>}
        >
          <form action={deleteHabitRoutineAction} className="inline-actions">
            <input name="familySlug" type="hidden" value={familySlug} />
            <input name="currentSlug" type="hidden" value={habit.slug} />
            <button className="button button--ghost" type="submit">
              Delete habit
            </button>
          </form>
        </SurfaceCard>
      </section>
    </div>
  );
}
