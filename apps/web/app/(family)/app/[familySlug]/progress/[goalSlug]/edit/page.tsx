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
        kicker="목표"
        title={`${goal.title} 수정`}
        action={<StatusPill tone="accent">실시간 반영</StatusPill>}
      />

      <SurfaceCard
        title="수정 시 반영"
        description="저장하면 같은 상세 경로를 유지한 채 카드 수치가 즉시 갱신됩니다."
      >
        <p className="card-meta">
          마지막 수정 {formatTrackerDateTime(goal.updatedAt, familyAppView.workspaceView.family.timezone)}
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
        title="목표 삭제"
        description="더 이상 쓰지 않는 목표라면 여기서 바로 정리할 수 있습니다."
        badge={<StatusPill tone="danger">주의</StatusPill>}
      >
        <form action={deleteProgressGoalAction} className="inline-actions">
          <input name="familySlug" type="hidden" value={familySlug} />
          <input name="currentSlug" type="hidden" value={goal.slug} />
          <button className="button button--ghost" type="submit">
            목표 삭제
          </button>
        </form>
      </SurfaceCard>
    </div>
  );
}
