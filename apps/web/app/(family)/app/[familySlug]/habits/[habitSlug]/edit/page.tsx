import { notFound } from "next/navigation";

import { SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import { HabitRoutineForm } from "../../../../../../../src/components/habit-routine-form";
import { getFamilyAppView } from "../../../../../../../src/lib/family-app-view";
import { formatTrackerDateTime } from "../../../../../../../src/lib/tracker-formatters";
import { getStoredHabitRoutine } from "../../../../../../../src/lib/tracker-store";
import { deleteHabitRoutineAction, updateHabitRoutineAction } from "../../actions";

type EditHabitRoutinePageProps = {
  params: Promise<{ familySlug: string; habitSlug: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditHabitRoutinePage(props: EditHabitRoutinePageProps) {
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

  const errorMessage = searchParams.error ? decodeURIComponent(searchParams.error) : null;

  return (
    <div className="surface-stack">
      <SectionHeader
        kicker="Tracker"
        title={`Edit ${habit.title}`}
        action={<StatusPill tone="accent">live edit</StatusPill>}
      />

      <SurfaceCard
        title="Edit behavior"
        description="Saving keeps the same detail route pattern and immediately refreshes the habit card used on home."
      >
        <p className="card-meta">
          Last updated {formatTrackerDateTime(habit.updatedAt, familyAppView.workspaceView.family.timezone)}
        </p>
      </SurfaceCard>

      <HabitRoutineForm
        action={updateHabitRoutineAction}
        errorMessage={errorMessage}
        familySlug={familySlug}
        habit={habit}
        mode="edit"
      />

      <SurfaceCard
        title="Delete habit"
        description="If this routine is no longer relevant, remove it here and the home progress band will drop the card."
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
    </div>
  );
}
