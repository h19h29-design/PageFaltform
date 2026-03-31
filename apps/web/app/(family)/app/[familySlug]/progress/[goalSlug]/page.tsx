import Link from "next/link";
import { notFound } from "next/navigation";

import { MetricList, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

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
      return "목표가 저장됐고 홈 보드에도 바로 반영됐습니다.";
    case "updated":
      return "목표를 수정했고 진행 카드도 함께 갱신했습니다.";
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

  const timezone = familyAppView.workspaceView.family.timezone;
  const stateMessage = getStateMessage(searchParams.state);

  return (
    <div className="surface-stack">
      <SectionHeader
        kicker="목표"
        title={goal.title}
        action={
          <div className="pill-row">
            <StatusPill tone="accent">{formatPercent(card.metricValue)}</StatusPill>
            <StatusPill tone="warm">{goal.streakDays}일 연속</StatusPill>
          </div>
        }
      />

      <div className="inline-actions">
        <Link className="button button--secondary" href={buildFamilyModuleEditHref(familySlug, "progress", goal.slug)}>
          수정
        </Link>
        <Link className="button button--ghost" href={buildFamilyModuleHref(familySlug, "progress")}>
          목록
        </Link>
        <Link className="button button--ghost" href={buildFamilyHomeHref(familySlug)}>
          홈
        </Link>
      </div>

      {stateMessage ? (
        <div className="surface-note">
          <p>{stateMessage}</p>
        </div>
      ) : null}

      <div className="grid-two">
        <SurfaceCard title="진행 상황" badge={<StatusPill tone="accent">{card.badge}</StatusPill>}>
          <MetricList
            items={[
              { label: "현재 값", value: formatCount(goal.currentValue, goal.metricUnit) },
              { label: "목표 값", value: formatCount(goal.targetValue, goal.metricUnit) },
              { label: "달성률", value: formatPercent(card.metricValue) },
              { label: "마감", value: formatTrackerDateTime(goal.dueAt, timezone) },
            ]}
          />
        </SurfaceCard>

        <SurfaceCard title="표시 설정">
          <MetricList
            items={[
              { label: "대상", value: formatAudienceLabel(goal.audience) },
              { label: "공개 범위", value: formatVisibilityLabel(goal.visibilityScope) },
              { label: "강조", value: goal.featured ? "예" : "아니오" },
              { label: "수정 시각", value: formatTrackerDateTime(goal.updatedAt, timezone) },
            ]}
          />
        </SurfaceCard>
      </div>

      <SurfaceCard title="목표 한 줄">
        <div className="surface-note">
          <strong>{goal.goalOutcome}</strong>
        </div>
      </SurfaceCard>

      <SurfaceCard title="정리">
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
