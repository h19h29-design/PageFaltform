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
        kicker="루틴"
        title="새 루틴 만들기"
        action={<StatusPill tone="accent">홈 연결</StatusPill>}
      />

      <SurfaceCard
        title="저장 후 반영"
        description="루틴을 저장하면 루틴 보드와 가족 홈 진행 밴드가 함께 갱신됩니다."
      >
        <ul className="stack-list compact-list">
          <li>저장 직후 상세 페이지가 열립니다.</li>
          <li>유지율과 연속 일수가 카드에 바로 반영됩니다.</li>
          <li>다음 체크 시각도 함께 기록됩니다.</li>
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
