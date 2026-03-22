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
        kicker="루틴"
        title={`${habit.title} 수정`}
        action={<StatusPill tone="accent">실시간 반영</StatusPill>}
      />

      <SurfaceCard
        title="수정 시 반영"
        description="저장하면 같은 상세 경로를 유지한 채 카드 수치가 즉시 갱신됩니다."
      >
        <p className="card-meta">
          마지막 수정 {formatTrackerDateTime(habit.updatedAt, familyAppView.workspaceView.family.timezone)}
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
        title="루틴 삭제"
        description="더 이상 쓰지 않는 루틴이라면 여기서 바로 정리할 수 있습니다."
        badge={<StatusPill tone="danger">주의</StatusPill>}
      >
        <form action={deleteHabitRoutineAction} className="inline-actions">
          <input name="familySlug" type="hidden" value={familySlug} />
          <input name="currentSlug" type="hidden" value={habit.slug} />
          <button className="button button--ghost" type="submit">
            루틴 삭제
          </button>
        </form>
      </SurfaceCard>
    </div>
  );
}
