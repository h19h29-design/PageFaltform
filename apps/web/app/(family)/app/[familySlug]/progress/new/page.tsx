import { notFound } from "next/navigation";

import { SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import { ProgressGoalForm } from "../../../../../../src/components/progress-goal-form";
import { getFamilyAppView } from "../../../../../../src/lib/family-app-view";
import { createProgressGoalAction } from "../actions";

type NewProgressGoalPageProps = {
  params: Promise<{ familySlug: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function NewProgressGoalPage(props: NewProgressGoalPageProps) {
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
        title="Create progress goal"
        action={<StatusPill tone="accent">home-linked</StatusPill>}
      />

      <SurfaceCard
        title="What this writes"
        description="A new goal record is saved to the tracker store, then the home progress band rebuilds from the same module feed."
      >
        <ul className="stack-list">
          <li>Detail route opens immediately after save.</li>
          <li>Badge shows attainment percent from current and target values.</li>
          <li>Summary stays aligned with cadence, remaining gap, and streak.</li>
        </ul>
      </SurfaceCard>

      <ProgressGoalForm
        action={createProgressGoalAction}
        errorMessage={errorMessage}
        familySlug={familySlug}
        mode="new"
      />
    </div>
  );
}
