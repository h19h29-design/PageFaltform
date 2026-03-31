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
      return "루틴이 저장됐고 홈 보드에도 바로 반영됐습니다.";
    case "updated":
      return "루틴을 수정했고 진행 카드도 함께 갱신했습니다.";
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

  const timezone = familyAppView.workspaceView.family.timezone;
  const stateMessage = getStateMessage(searchParams.state);

  return (
    <div className="surface-stack">
      <SectionHeader
        kicker="루틴"
        title={habit.title}
        action={
          <div className="pill-row">
            <StatusPill tone="accent">{formatPercent(card.metricValue)}</StatusPill>
            <StatusPill tone="warm">{habit.streakDays}일 연속</StatusPill>
          </div>
        }
      />

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

      {stateMessage ? (
        <div className="surface-note">
          <p>{stateMessage}</p>
        </div>
      ) : null}

      <div className="grid-two">
        <SurfaceCard title="실행 상태" badge={<StatusPill tone="accent">{card.badge}</StatusPill>}>
          <MetricList
            items={[
              { label: "완료 횟수", value: `${habit.completionCount}/${habit.targetCount}` },
              { label: "유지율", value: formatPercent(habit.consistencyRate) },
              { label: "다음 체크", value: formatTrackerDateTime(habit.nextCheckInAt, timezone) },
              { label: "주기", value: habit.periodLabel },
            ]}
          />
        </SurfaceCard>

        <SurfaceCard title="표시 설정">
          <MetricList
            items={[
              { label: "대상", value: formatAudienceLabel(habit.audience) },
              { label: "공개 범위", value: formatVisibilityLabel(habit.visibilityScope) },
              { label: "강조", value: habit.featured ? "예" : "아니오" },
              { label: "수정 시각", value: formatTrackerDateTime(habit.updatedAt, timezone) },
            ]}
          />
        </SurfaceCard>
      </div>

      <SurfaceCard title="루틴 한 줄">
        <div className="surface-note">
          <strong>{habit.habitBenefit}</strong>
        </div>
      </SurfaceCard>

      <SurfaceCard title="정리">
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
