import { notFound } from "next/navigation";

import { SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import { ProgressGoalForm } from "../../../../../../../src/components/progress-goal-form";
import { getFamilyAppView } from "../../../../../../../src/lib/family-app-view";
import { formatTrackerDateTime } from "../../../../../../../src/lib/tracker-formatters";
import { getStoredProgressGoal } from "../../../../../../../src/lib/tracker-store";
import { deleteProgressGoalAction, updateProgressGoalAction } from "../../actions";

type EditProgressGoalPageProps = {
  params: Promise<{ familySlug: string; goalSlug: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditProgressGoalPage(props: EditProgressGoalPageProps) {
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

  const errorMessage = searchParams.error ? decodeURIComponent(searchParams.error) : null;

  return (
    <div className="surface-stack">
      <SectionHeader
        kicker="Tracker"
        title={`Edit ${goal.title}`}
        action={<StatusPill tone="accent">live edit</StatusPill>}
      />

      <SurfaceCard
        title="Edit behavior"
        description="Saving keeps the same detail route pattern and immediately refreshes the tracker card used on home."
      >
        <p className="card-meta">
          Last updated {formatTrackerDateTime(goal.updatedAt, familyAppView.workspaceView.family.timezone)}
        </p>
      </SurfaceCard>

      <ProgressGoalForm
        action={updateProgressGoalAction}
        errorMessage={errorMessage}
        familySlug={familySlug}
        goal={goal}
        mode="edit"
      />

      <SurfaceCard
        title="Delete goal"
        description="If this goal is no longer relevant, remove it here and the home progress band will drop the card."
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
    </div>
  );
}
