import Link from "next/link";
import { notFound } from "next/navigation";

import { MetricList, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import {
  buildFamilyHomeHref,
  buildFamilyModuleDetailHref,
  buildFamilyModuleEditHref,
  buildFamilyModuleNewHref,
} from "../../../../../src/lib/family-app-routes";
import { getFamilyAppView } from "../../../../../src/lib/family-app-view";
import {
  formatAudienceLabel,
  formatCount,
  formatPercent,
  formatTrackerDateTime,
  formatVisibilityLabel,
} from "../../../../../src/lib/tracker-formatters";
import { buildStoredProgressDashboardFeed, listStoredProgressGoals } from "../../../../../src/lib/tracker-store";

type ProgressListPageProps = {
  params: Promise<{ familySlug: string }>;
  searchParams: Promise<{ state?: string; error?: string }>;
};

function getStateMessage(state?: string) {
  switch (state) {
    case "deleted":
      return "목표가 삭제되었고, 가족 홈의 진행 밴드에서도 바로 빠졌습니다.";
    default:
      return null;
  }
}

export default async function ProgressListPage(props: ProgressListPageProps) {
  const { familySlug } = await props.params;
  const searchParams = await props.searchParams;
  const familyAppView = await getFamilyAppView(familySlug);

  if (!familyAppView) {
    notFound();
  }

  const goals = await listStoredProgressGoals(familySlug);
  const feed = await buildStoredProgressDashboardFeed({
    familySlug,
    tenantId: familyAppView.workspaceView.family.id,
    timezone: familyAppView.workspaceView.family.timezone,
    now: new Date().toISOString(),
  });
  const goalByCardId = new Map(goals.map((goal) => [`progress-${goal.id}`, goal]));
  const orderedCards = feed.cards
    .map((card) => {
      const goal = goalByCardId.get(card.id);
      return goal ? { goal, card } : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  const stateMessage = getStateMessage(searchParams.state);
  const errorMessage = searchParams.error ? decodeURIComponent(searchParams.error) : null;
  const moduleEnabled = familyAppView.workspaceView.workspace.enabledModules.includes("progress");

  return (
    <div className="surface-stack">
      {stateMessage ? (
        <div className="surface-note">
          <p>{stateMessage}</p>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="surface-note">
          <p>{errorMessage}</p>
        </div>
      ) : null}

      <SectionHeader
        kicker="목표"
        title="목표 보드"
        action={
          <div className="inline-actions">
            {!moduleEnabled ? <StatusPill tone="warm">홈에서는 꺼짐</StatusPill> : null}
            <Link className="button button--secondary button--small" href={buildFamilyModuleNewHref(familySlug, "progress")}>
              새 목표
            </Link>
            <Link className="button button--ghost button--small" href={buildFamilyHomeHref(familySlug)}>
              홈으로
            </Link>
          </div>
        }
      />

      <div className="grid-two">
        <SurfaceCard
          title="진행 현황"
          description="목표 달성률과 연속 기록이 크게 보이도록 정리했습니다."
          badge={<StatusPill tone="accent">{feed.cards.length}개</StatusPill>}
          tone="accent"
        >
          <MetricList
            items={[
              { label: "평균 달성률", value: formatPercent(feed.meta.averageCompletionRate) },
              { label: "최장 연속", value: `${feed.meta.longestStreakDays}일` },
              { label: "마감 임박", value: `${feed.meta.dueSoonCount}개` },
              { label: "가족 공용", value: `${feed.meta.sharedGoalCount}개` },
            ]}
          />
        </SurfaceCard>

        <SurfaceCard
          title="보드 읽는 법"
          description="설명은 줄이고, 사용자에게 필요한 수치와 상태를 더 크게 보여줍니다."
        >
          <ul className="stack-list compact-list">
            <li>제일 큰 숫자는 달성률입니다.</li>
            <li>현재값과 목표값을 바로 비교할 수 있습니다.</li>
            <li>연속 기록과 마감일은 우측 하단 메타로 정리합니다.</li>
          </ul>
        </SurfaceCard>
      </div>

      <div className="surface-stack tracker-board">
        {orderedCards.map(({ goal, card }) => (
          <SurfaceCard
            key={goal.id}
            title={card.title}
            description={card.summary}
            badge={<StatusPill tone="accent">{card.badge}</StatusPill>}
            footer={
              <div className="inline-actions">
                <Link className="button button--secondary button--small" href={buildFamilyModuleDetailHref(familySlug, "progress", goal.slug)}>
                  상세
                </Link>
                <Link className="button button--ghost button--small" href={buildFamilyModuleEditHref(familySlug, "progress", goal.slug)}>
                  수정
                </Link>
              </div>
            }
            className="tracker-card tracker-card--goal"
          >
            <div className="tracker-card__hero">
              <strong>{formatPercent(card.metricValue)}</strong>
              <span>{goal.goalOutcome}</span>
            </div>

            <MetricList
              items={[
                { label: "현재값", value: formatCount(goal.currentValue, goal.metricUnit) },
                { label: "목표값", value: formatCount(goal.targetValue, goal.metricUnit) },
                { label: "주기", value: goal.cadenceLabel },
                { label: "연속", value: `${goal.streakDays}일` },
              ]}
            />

            <p className="card-meta">
              {formatAudienceLabel(goal.audience)} · {formatVisibilityLabel(goal.visibilityScope)} · 마감{" "}
              {formatTrackerDateTime(goal.dueAt, familyAppView.workspaceView.family.timezone)}
            </p>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}
