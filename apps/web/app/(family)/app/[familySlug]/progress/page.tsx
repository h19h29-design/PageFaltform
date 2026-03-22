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
      return "목표가 삭제되었고, 홈의 진행 상황 밴드에도 바로 반영됩니다.";
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
        title="목표 게시판"
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
          title="반영 상태"
          description="이 목록은 가족 홈의 진행 상황 밴드와 같은 목표 builder 결과를 그대로 사용합니다."
          badge={<StatusPill tone="accent">{feed.cards.length}장</StatusPill>}
        >
          <MetricList
            items={[
              { label: "평균 달성률", value: formatPercent(feed.meta.averageCompletionRate) },
              { label: "최장 연속", value: `${feed.meta.longestStreakDays}일` },
              { label: "마감 임박", value: `${feed.meta.dueSoonCount}` },
              { label: "가족 공용", value: `${feed.meta.sharedGoalCount}` },
            ]}
          />
        </SurfaceCard>

        <SurfaceCard
          title="카드 규칙"
          description="배지는 달성률, 요약은 진행 흐름과 연속 기록을 담고, 마감 임박 목표가 진행 밴드 위로 올라옵니다."
        >
          <ul className="stack-list">
            <li>홈 카드에서는 `cardType: progress` 와 `sectionHint: progress` 를 유지합니다.</li>
            <li>점수가 비슷하면 가족 공용 목표가 개인 목표보다 먼저 올라옵니다.</li>
            <li>여기서 수정하면 상세 페이지와 홈 진행 밴드가 바로 바뀝니다.</li>
          </ul>
        </SurfaceCard>
      </div>

      <div className="surface-stack">
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
          >
            <MetricList
              items={[
                { label: "달성률", value: formatPercent(card.metricValue) },
                { label: "현재값", value: formatCount(goal.currentValue, goal.metricUnit) },
                { label: "목표값", value: formatCount(goal.targetValue, goal.metricUnit) },
                { label: "연속 기록", value: `${goal.streakDays}일` },
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
