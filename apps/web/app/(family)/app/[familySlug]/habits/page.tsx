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
      return "습관 항목이 삭제되었고, 다음 홈 렌더에서 진행 밴드에서도 빠집니다.";
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
        kicker="습관"
        title="습관 게시판"
        action={
          <div className="inline-actions">
            {!moduleEnabled ? <StatusPill tone="warm">홈에서는 꺼짐</StatusPill> : null}
            <Link className="button button--secondary button--small" href={buildFamilyModuleNewHref(familySlug, "habits")}>
              새 습관
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
          description="이 목록은 가족 홈의 진행 밴드가 쓰는 습관 builder 결과를 그대로 사용합니다."
          badge={<StatusPill tone="accent">{feed.cards.length}장</StatusPill>}
        >
          <MetricList
            items={[
              { label: "평균 완료율", value: formatPercent(feed.meta.averageCompletionRate) },
              { label: "평균 꾸준함", value: formatPercent(feed.meta.averageConsistencyRate) },
              { label: "최장 연속", value: `${feed.meta.longestStreakDays}일` },
              { label: "가족 공용", value: `${feed.meta.sharedHabitCount}` },
            ]}
          />
        </SurfaceCard>

        <SurfaceCard
          title="카드 규칙"
          description="배지는 연속 기록, 메트릭은 꾸준함 비율, 다음 체크인 시각은 같은 점수 안에서 우선순위를 가릅니다."
        >
          <ul className="stack-list">
            <li>홈 카드에서는 `cardType: habit` 과 `sectionHint: progress` 를 유지합니다.</li>
            <li>점수가 비슷하면 가족 공용 루틴이 먼저 올라옵니다.</li>
            <li>여기서 수정하면 상세 페이지와 홈 카드 메타도 바로 바뀝니다.</li>
          </ul>
        </SurfaceCard>
      </div>

      <div className="surface-stack">
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
          >
            <MetricList
              items={[
                { label: "꾸준함", value: formatPercent(card.metricValue) },
                { label: "완료", value: `${habit.completionCount}/${habit.targetCount}` },
                { label: "연속 기록", value: `${habit.streakDays}일` },
                { label: "다음 체크인", value: formatTrackerDateTime(habit.nextCheckInAt, familyAppView.workspaceView.family.timezone) },
              ]}
            />

            <p className="card-meta">
              {formatAudienceLabel(habit.audience)} · {formatVisibilityLabel(habit.visibilityScope)}
            </p>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}
