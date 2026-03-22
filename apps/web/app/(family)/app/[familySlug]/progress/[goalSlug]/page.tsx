import Link from "next/link";
import { notFound } from "next/navigation";

import { HeroCard, MetricList, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

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
      return "목표가 만들어졌고 가족 홈의 진행 밴드에도 바로 반영되었습니다.";
    case "updated":
      return "목표가 수정되었고 보드 카드도 함께 갱신되었습니다.";
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

  const stateMessage = getStateMessage(searchParams.state);

  return (
    <div className="surface-stack">
      {stateMessage ? (
        <div className="surface-note">
          <p>{stateMessage}</p>
        </div>
      ) : null}

      <HeroCard
        eyebrow="목표 상세"
        title={goal.title}
        subtitle={card.summary}
        meta={
          <>
            <StatusPill tone="accent">{card.badge}</StatusPill>
            <StatusPill>{formatPercent(card.metricValue)}</StatusPill>
            <StatusPill tone="warm">{goal.streakDays}일 연속</StatusPill>
          </>
        }
        actions={
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
        }
      >
        <SurfaceCard title="보드 카드 요약" description="가족 홈 진행 밴드에 들어가는 핵심 수치입니다." tone="accent">
          <MetricList
            items={[
              { label: "우선순위", value: `${card.priority}` },
              { label: "달성률", value: formatPercent(card.metricValue) },
              { label: "마감", value: formatTrackerDateTime(goal.dueAt, familyAppView.workspaceView.family.timezone) },
              { label: "구역", value: card.sectionHint ?? "progress" },
            ]}
          />
        </SurfaceCard>
      </HeroCard>

      <div className="grid-two">
        <SurfaceCard title="목표 수치" description="달성률 계산에 직접 쓰이는 값입니다.">
          <MetricList
            items={[
              { label: "현재값", value: formatCount(goal.currentValue, goal.metricUnit) },
              { label: "목표값", value: formatCount(goal.targetValue, goal.metricUnit) },
              { label: "단위 이름", value: goal.metricLabel },
              { label: "기간", value: goal.cadenceLabel },
            ]}
          />
        </SurfaceCard>

        <SurfaceCard title="노출 상태" description="가족 공용 여부와 공개 범위를 함께 봅니다.">
          <MetricList
            items={[
              { label: "대상", value: formatAudienceLabel(goal.audience) },
              { label: "공개 범위", value: formatVisibilityLabel(goal.visibilityScope) },
              { label: "강조 여부", value: goal.featured ? "예" : "아니오" },
              { label: "수정 시각", value: formatTrackerDateTime(goal.updatedAt, familyAppView.workspaceView.family.timezone) },
            ]}
          />
        </SurfaceCard>
      </div>

      <SurfaceCard title="목표 설명" description={goal.goalOutcome} />

      <section className="surface-stack">
        <SectionHeader kicker="삭제" title="이 목표 삭제하기" />
        <SurfaceCard
          title="삭제하면 어떻게 되나요?"
          description="목표 보드와 가족 홈 진행 밴드에서 즉시 빠집니다."
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
      </section>
    </div>
  );
}
