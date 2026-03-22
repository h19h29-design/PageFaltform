import { notFound } from "next/navigation";

import { SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import { HabitRoutineForm } from "../../../../../../src/components/habit-routine-form";
import { getFamilyAppView } from "../../../../../../src/lib/family-app-view";
import { createHabitRoutineAction } from "../actions";

type NewHabitRoutinePageProps = {
  params: Promise<{ familySlug: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function NewHabitRoutinePage(props: NewHabitRoutinePageProps) {
  const { familySlug } = await props.params;
  const searchParams = await props.searchParams;
  const familyAppView = await getFamilyAppView(familySlug);

  if (!familyAppView) {
    notFound();
  }

  const errorMessage = searchParams.error ? decodeURIComponent(searchParams.error) : null;

  return (
    <div className="surface-stack">
      <SectionHeader
        kicker="Tracker"
        title="Create habit routine"
        action={<StatusPill tone="accent">home-linked</StatusPill>}
      />

      <SurfaceCard
        title="What this writes"
        description="A new routine is saved to the tracker store, then the home progress band rebuilds from the same habit feed."
      >
        <ul className="stack-list">
          <li>Detail route opens immediately after save.</li>
          <li>Badge reflects the streak and metric reflects consistency.</li>
          <li>Summary keeps completion, consistency, and streak in one sentence.</li>
        </ul>
      </SurfaceCard>

      <HabitRoutineForm
        action={createHabitRoutineAction}
        errorMessage={errorMessage}
        familySlug={familySlug}
        mode="new"
      />
    </div>
  );
}
