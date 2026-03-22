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
  formatPercent,
  formatTrackerDateTime,
  formatVisibilityLabel,
} from "../../../../../src/lib/tracker-formatters";
import { buildStoredHabitsDashboardFeed, listStoredHabitRoutines } from "../../../../../src/lib/tracker-store";

type HabitsListPageProps = {
  params: Promise<{ familySlug: string }>;
  searchParams: Promise<{ state?: string; error?: string }>;
};

function getStateMessage(state?: string) {
  switch (state) {
    case "deleted":
      return "루틴이 삭제되었고, 가족 홈 진행 밴드에서도 바로 빠졌습니다.";
    default:
      return null;
  }
}

export default async function HabitsListPage(props: HabitsListPageProps) {
  const { familySlug } = await props.params;
  const searchParams = await props.searchParams;
  const familyAppView = await getFamilyAppView(familySlug);

  if (!familyAppView) {
    notFound();
  }

  const habits = await listStoredHabitRoutines(familySlug);
  const feed = await buildStoredHabitsDashboardFeed({
    familySlug,
    tenantId: familyAppView.workspaceView.family.id,
    timezone: familyAppView.workspaceView.family.timezone,
    now: new Date().toISOString(),
  });
  const habitByCardId = new Map(habits.map((habit) => [`habit-${habit.id}`, habit]));
  const orderedCards = feed.cards
    .map((card) => {
      const habit = habitByCardId.get(card.id);
      return habit ? { habit, card } : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  const stateMessage = getStateMessage(searchParams.state);
  const errorMessage = searchParams.error ? decodeURIComponent(searchParams.error) : null;
  const moduleEnabled = familyAppView.workspaceView.workspace.enabledModules.includes("habits");

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
        kicker="루틴"
        title="루틴 보드"
        action={
          <div className="inline-actions">
            {!moduleEnabled ? <StatusPill tone="warm">홈에서는 꺼짐</StatusPill> : null}
            <Link className="button button--secondary button--small" href={buildFamilyModuleNewHref(familySlug, "habits")}>
              새 루틴
            </Link>
            <Link className="button button--ghost button--small" href={buildFamilyHomeHref(familySlug)}>
              홈으로
            </Link>
          </div>
        }
      />

      <div className="grid-two">
        <SurfaceCard
          title="루틴 현황"
          description="반복 실천과 유지율, 연속 일수를 크게 보여주는 루틴형 보드입니다."
          badge={<StatusPill tone="accent">{feed.cards.length}개</StatusPill>}
          tone="accent"
        >
          <MetricList
            items={[
              { label: "평균 완료율", value: formatPercent(feed.meta.averageCompletionRate) },
              { label: "평균 유지율", value: formatPercent(feed.meta.averageConsistencyRate) },
              { label: "최장 연속", value: `${feed.meta.longestStreakDays}일` },
              { label: "가족 공용", value: `${feed.meta.sharedHabitCount}개` },
            ]}
          />
        </SurfaceCard>

        <SurfaceCard
          title="보드 읽는 법"
          description="가장 큰 숫자는 유지율, 그 아래는 실제 실천 횟수와 다음 체크 시각입니다."
        >
          <ul className="stack-list compact-list">
            <li>유지율이 높을수록 위쪽에 보입니다.</li>
            <li>실천 횟수와 목표 횟수를 같이 비교합니다.</li>
            <li>다음 체크 시각으로 오늘 챙길 루틴을 빠르게 봅니다.</li>
          </ul>
        </SurfaceCard>
      </div>

      <div className="surface-stack tracker-board">
        {orderedCards.map(({ habit, card }) => (
          <SurfaceCard
            key={habit.id}
            title={card.title}
            description={card.summary}
            badge={<StatusPill tone="accent">{card.badge}</StatusPill>}
            footer={
              <div className="inline-actions">
                <Link className="button button--secondary button--small" href={buildFamilyModuleDetailHref(familySlug, "habits", habit.slug)}>
                  상세
                </Link>
                <Link className="button button--ghost button--small" href={buildFamilyModuleEditHref(familySlug, "habits", habit.slug)}>
                  수정
                </Link>
              </div>
            }
            className="tracker-card tracker-card--habit"
          >
            <div className="tracker-card__hero">
              <strong>{formatPercent(card.metricValue)}</strong>
              <span>{habit.habitBenefit}</span>
            </div>

            <MetricList
              items={[
                { label: "실천", value: `${habit.completionCount}/${habit.targetCount}` },
                { label: "유지율", value: formatPercent(habit.consistencyRate) },
                { label: "기간", value: habit.periodLabel },
                { label: "연속", value: `${habit.streakDays}일` },
              ]}
            />

            <p className="card-meta">
              {formatAudienceLabel(habit.audience)} · {formatVisibilityLabel(habit.visibilityScope)} · 다음 체크{" "}
              {formatTrackerDateTime(habit.nextCheckInAt, familyAppView.workspaceView.family.timezone)}
            </p>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}
