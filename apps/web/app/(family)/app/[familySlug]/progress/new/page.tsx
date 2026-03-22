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
        kicker="목표"
        title="새 목표 만들기"
        action={<StatusPill tone="accent">홈 연결</StatusPill>}
      />

      <SurfaceCard
        title="저장 후 반영"
        description="목표를 저장하면 목표 보드와 가족 홈의 진행 밴드가 함께 갱신됩니다."
      >
        <ul className="stack-list compact-list">
          <li>저장 직후 상세 페이지가 열립니다.</li>
          <li>달성률이 자동 계산되어 큰 숫자로 보입니다.</li>
          <li>연속 일수와 마감일도 함께 반영됩니다.</li>
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
