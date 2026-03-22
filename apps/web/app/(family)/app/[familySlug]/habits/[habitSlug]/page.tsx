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
  formatPercent,
  formatTrackerDateTime,
  formatVisibilityLabel,
} from "../../../../../../src/lib/tracker-formatters";
import { buildStoredHabitsDashboardFeed, getStoredHabitRoutine } from "../../../../../../src/lib/tracker-store";
import { deleteHabitRoutineAction } from "../actions";

type HabitDetailPageProps = {
  params: Promise<{ familySlug: string; habitSlug: string }>;
  searchParams: Promise<{ state?: string }>;
};

function getStateMessage(state?: string) {
  switch (state) {
    case "created":
      return "루틴이 만들어졌고 가족 홈 진행 밴드에도 바로 반영되었습니다.";
    case "updated":
      return "루틴이 수정되었고 보드 카드도 함께 갱신되었습니다.";
    default:
      return null;
  }
}

export default async function HabitDetailPage(props: HabitDetailPageProps) {
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

  const feed = await buildStoredHabitsDashboardFeed({
    familySlug,
    tenantId: familyAppView.workspaceView.family.id,
    timezone: familyAppView.workspaceView.family.timezone,
    now: new Date().toISOString(),
  });
  const card = feed.cards.find((entry) => entry.id === `habit-${habit.id}`);

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
        eyebrow="루틴 상세"
        title={habit.title}
        subtitle={card.summary}
        meta={
          <>
            <StatusPill tone="accent">{card.badge}</StatusPill>
            <StatusPill>{formatPercent(card.metricValue)}</StatusPill>
            <StatusPill tone="warm">{habit.streakDays}일 연속</StatusPill>
          </>
        }
        actions={
          <div className="inline-actions">
            <Link className="button button--secondary" href={buildFamilyModuleEditHref(familySlug, "habits", habit.slug)}>
              수정
            </Link>
            <Link className="button button--ghost" href={buildFamilyModuleHref(familySlug, "habits")}>
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
              { label: "유지율", value: formatPercent(card.metricValue) },
              { label: "다음 체크", value: formatTrackerDateTime(habit.nextCheckInAt, familyAppView.workspaceView.family.timezone) },
              { label: "구역", value: card.sectionHint ?? "progress" },
            ]}
          />
        </SurfaceCard>
      </HeroCard>

      <div className="grid-two">
        <SurfaceCard title="루틴 수치" description="실천 횟수와 유지율 계산에 직접 쓰이는 값입니다.">
          <MetricList
            items={[
              { label: "실천 횟수", value: `${habit.completionCount}/${habit.targetCount}` },
              { label: "유지율", value: formatPercent(habit.consistencyRate) },
              { label: "기간", value: habit.periodLabel },
              { label: "연속", value: `${habit.streakDays}일` },
            ]}
          />
        </SurfaceCard>

        <SurfaceCard title="노출 상태" description="가족 공용 여부와 공개 범위를 함께 봅니다.">
          <MetricList
            items={[
              { label: "대상", value: formatAudienceLabel(habit.audience) },
              { label: "공개 범위", value: formatVisibilityLabel(habit.visibilityScope) },
              { label: "강조 여부", value: habit.featured ? "예" : "아니오" },
              { label: "수정 시각", value: formatTrackerDateTime(habit.updatedAt, familyAppView.workspaceView.family.timezone) },
            ]}
          />
        </SurfaceCard>
      </div>

      <SurfaceCard title="루틴 설명" description={habit.habitBenefit} />

      <section className="surface-stack">
        <SectionHeader kicker="삭제" title="이 루틴 삭제하기" />
        <SurfaceCard
          title="삭제하면 어떻게 되나요?"
          description="루틴 보드와 가족 홈 진행 밴드에서 즉시 빠집니다."
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
      </section>
    </div>
  );
}
