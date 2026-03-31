import Link from "next/link";
import { notFound } from "next/navigation";

import {
  type DayPlannerBlockFixture,
  type DayPlannerDashboardSelection,
} from "@ysplan/modules-day-planner";
import { PageShell, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import {
  createDayPlannerBlockAction,
  deleteDayPlannerBlockAction,
  updateDayPlannerBlockAction,
} from "src/actions/schedule-module-actions";
import { requireFamilyAppAccessPage } from "src/lib/family-app-access";
import {
  getDayPlannerDashboardSelectionForFamily,
  getFamilyDayPlannerBlockBySlug,
  listFamilyDayPlannerBlocks,
} from "src/lib/family-schedule-modules";
import { DayPlannerBlockForm } from "src/lib/schedule-module-forms";
import {
  ModuleEmptyState,
  ModuleHeaderActions,
  ModuleNoticeCard,
} from "src/lib/schedule-module-page-parts";
import {
  formatAudienceLabel,
  formatFamilyDateTimeRange,
  formatVisibilityScopeLabel,
} from "src/lib/schedule-module-utils";

type DayPlannerRoutePageProps = {
  params: Promise<{ familySlug: string; segments?: string[] }>;
  searchParams: Promise<{ error?: string; state?: string }>;
};

function buildDayPlannerFooter(
  familySlug: string,
  block: DayPlannerBlockFixture,
  selection: DayPlannerDashboardSelection,
) {
  const todaySlugs = new Set(selection.todayBlocks.map((entry) => entry.slug));
  const isFocus = selection.focusBlock?.slug === block.slug;

  return (
    <div className="surface-stack">
      <div className="pill-row">
        <StatusPill>{formatAudienceLabel(block.audience)}</StatusPill>
        <StatusPill>{formatVisibilityScopeLabel(block.visibilityScope)}</StatusPill>
        {block.ownerLabel ? <StatusPill>{block.ownerLabel}</StatusPill> : null}
        {block.affectsFamilyFlow ? <StatusPill tone="accent">인계</StatusPill> : null}
        {todaySlugs.has(block.slug) ? <StatusPill tone="accent">오늘</StatusPill> : null}
        {isFocus ? <StatusPill tone="warm">집중</StatusPill> : null}
      </div>
      <div className="inline-actions">
        <Link className="button button--secondary button--small" href={`/app/${familySlug}/day-planner/${block.slug}`}>
          상세
        </Link>
        <Link className="button button--ghost button--small" href={`/app/${familySlug}/day-planner/${block.slug}/edit`}>
          수정
        </Link>
      </div>
    </div>
  );
}

function renderDayPlannerCard(
  familySlug: string,
  timezone: string,
  block: DayPlannerBlockFixture,
  selection: DayPlannerDashboardSelection,
) {
  return (
    <SurfaceCard
      key={block.id}
      title={block.title}
      description={formatFamilyDateTimeRange(block.startsAt, block.endsAt, timezone)}
      badge={<StatusPill>{block.audience === "family-shared" ? "공용" : "개인"}</StatusPill>}
      footer={buildDayPlannerFooter(familySlug, block, selection)}
    >
      <p className="feature-copy">
        {block.affectsFamilyFlow
          ? "공동 시간 블록 또는 개인 handoff 후보입니다."
          : "개인 메모성 시간 블록입니다."}
      </p>
    </SurfaceCard>
  );
}

export default async function DayPlannerRoutePage(props: DayPlannerRoutePageProps) {
  const { familySlug, segments } = await props.params;
  const searchParams = await props.searchParams;
  const { workspaceView } = await requireFamilyAppAccessPage(familySlug);
  const timezone = workspaceView.family.timezone;
  const blocks = await listFamilyDayPlannerBlocks(workspaceView.family.slug);
  const selection = await getDayPlannerDashboardSelectionForFamily({
    familySlug: workspaceView.family.slug,
    timezone,
    now: new Date().toISOString(),
  });
  const routeSegments = segments ?? [];

  if (routeSegments.length === 0) {
    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} Day Planner`}
        title="데이 플래너 목록"
        actions={
          <ModuleHeaderActions
            familySlug={workspaceView.family.slug}
            listLabel="플래너 목록"
            moduleSegment="day-planner"
            newLabel="새 블록"
          />
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />

        <SurfaceCard
          title="오늘 반영 상태"
          badge={<StatusPill tone="accent">{timezone}</StatusPill>}
        >
          <dl className="fact-grid">
            <div className="fact-grid__item">
              <dt>전체 블록</dt>
              <dd>{blocks.length}건</dd>
            </div>
            <div className="fact-grid__item">
              <dt>today 후보</dt>
              <dd>{selection.todayBlocks.length}건</dd>
            </div>
            <div className="fact-grid__item">
              <dt>focus 후보</dt>
              <dd>{selection.focusBlock?.title ?? "-"}</dd>
            </div>
            <div className="fact-grid__item">
              <dt>home 확인</dt>
              <dd>
                <Link href={`/app/${workspaceView.family.slug}`}>가족 홈</Link>
              </dd>
            </div>
          </dl>
        </SurfaceCard>

        <SectionHeader
          kicker="Day Planner"
          title="저장된 시간 블록"
          action={
            <Link className="button button--secondary" href={`/app/${workspaceView.family.slug}/day-planner/today`}>
              오늘 기준 보기
            </Link>
          }
        />

        {blocks.length === 0 ? (
          <ModuleEmptyState
            actionHref={`/app/${workspaceView.family.slug}/day-planner/new`}
            actionLabel="첫 블록 만들기"
            description="아직 저장된 시간 블록이 없습니다."
            title="블록이 없습니다."
          />
        ) : (
          <div className="route-card-grid">
            {blocks.map((block) =>
              renderDayPlannerCard(workspaceView.family.slug, timezone, block, selection),
            )}
          </div>
        )}
      </PageShell>
    );
  }

  if (routeSegments.length === 1 && routeSegments[0] === "today") {
    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} Day Planner`}
        title="today 카드 기준 블록"
        actions={
          <ModuleHeaderActions
            familySlug={workspaceView.family.slug}
            listLabel="플래너 목록"
            moduleSegment="day-planner"
            newLabel="새 블록"
          />
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />
        {selection.todayBlocks.length === 0 ? (
          <ModuleEmptyState
            actionHref={`/app/${workspaceView.family.slug}/day-planner/new`}
            actionLabel="today 블록 만들기"
            description="오늘 기준으로 반영되는 공동 시간 블록이 없습니다."
            title="today 후보가 없습니다."
          />
        ) : (
          <div className="route-card-grid">
            {selection.todayBlocks.map((block) =>
              renderDayPlannerCard(workspaceView.family.slug, timezone, block, selection),
            )}
          </div>
        )}
      </PageShell>
    );
  }

  if (routeSegments.length === 1 && routeSegments[0] === "new") {
    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} Day Planner`}
        title="새 시간 블록 만들기"
        actions={
          <ModuleHeaderActions
            familySlug={workspaceView.family.slug}
            listLabel="플래너 목록"
            moduleSegment="day-planner"
            newLabel="새 블록"
          />
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />
        <SurfaceCard title="시간 블록 입력">
          <DayPlannerBlockForm
            action={createDayPlannerBlockAction}
            familySlug={workspaceView.family.slug}
            submitLabel="블록 저장"
            timezone={timezone}
          />
        </SurfaceCard>
      </PageShell>
    );
  }

  if (routeSegments.length === 1) {
    const itemSlug = routeSegments[0]!;
    const block = await getFamilyDayPlannerBlockBySlug(
      workspaceView.family.slug,
      itemSlug,
    );

    if (!block) {
      notFound();
    }

    const isToday = selection.todayBlocks.some((entry) => entry.slug === block.slug);
    const isFocus = selection.focusBlock?.slug === block.slug;

    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} Day Planner`}
        title={block.title}
        actions={
          <div className="inline-actions">
            <Link className="button button--ghost" href={`/app/${workspaceView.family.slug}/day-planner`}>
              목록
            </Link>
            <Link className="button button--secondary" href={`/app/${workspaceView.family.slug}/day-planner/${block.slug}/edit`}>
              수정
            </Link>
            <Link className="button button--primary" href={`/app/${workspaceView.family.slug}`}>
              홈 보기
            </Link>
          </div>
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />

        <div className="route-detail-grid">
          <SurfaceCard
            title="시간 블록 상세"
            description={formatFamilyDateTimeRange(block.startsAt, block.endsAt, timezone)}
            badge={<StatusPill>{formatAudienceLabel(block.audience)}</StatusPill>}
            footer={
              <form action={deleteDayPlannerBlockAction}>
                <input name="familySlug" type="hidden" value={workspaceView.family.slug} />
                <input name="itemSlug" type="hidden" value={block.slug} />
                <button className="button button--ghost" type="submit">
                  블록 삭제
                </button>
              </form>
            }
          >
            <dl className="fact-grid">
              <div className="fact-grid__item">
                <dt>노출 범위</dt>
                <dd>{formatVisibilityScopeLabel(block.visibilityScope)}</dd>
              </div>
              <div className="fact-grid__item">
                <dt>담당자</dt>
                <dd>{block.ownerLabel ?? "-"}</dd>
              </div>
              <div className="fact-grid__item">
                <dt>handoff 영향</dt>
                <dd>{block.affectsFamilyFlow ? "영향 있음" : "일반 블록"}</dd>
              </div>
              <div className="fact-grid__item">
                <dt>연결 상태</dt>
                <dd>{block.audience === "family-shared" ? "공동 블록" : "개인 블록"}</dd>
              </div>
            </dl>
          </SurfaceCard>

          <SurfaceCard
            title="home 연결 상태"
            description="today와 focus 카드 분기 결과입니다."
            badge={<StatusPill tone={isFocus ? "warm" : "accent"}>{isFocus ? "focus" : "status"}</StatusPill>}
          >
            <div className="pill-row">
              {isToday ? <StatusPill tone="accent">today 후보</StatusPill> : null}
              {isFocus ? <StatusPill tone="warm">focus 후보</StatusPill> : null}
              {!isToday && !isFocus ? <StatusPill>home 미노출</StatusPill> : null}
            </div>
            <p className="feature-copy">
              홈 today 카드는 <Link href={`/app/${workspaceView.family.slug}/day-planner/today`}>오늘 기준 블록</Link>으로,
              개인 handoff 카드는 상세 페이지로 이어집니다.
            </p>
          </SurfaceCard>
        </div>
      </PageShell>
    );
  }

  if (routeSegments.length === 2 && routeSegments[1] === "edit") {
    const itemSlug = routeSegments[0]!;
    const block = await getFamilyDayPlannerBlockBySlug(
      workspaceView.family.slug,
      itemSlug,
    );

    if (!block) {
      notFound();
    }

    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} Day Planner`}
        title="시간 블록 수정"
        actions={
          <div className="inline-actions">
            <Link className="button button--ghost" href={`/app/${workspaceView.family.slug}/day-planner/${block.slug}`}>
              상세
            </Link>
            <Link className="button button--secondary" href={`/app/${workspaceView.family.slug}/day-planner`}>
              목록
            </Link>
            <Link className="button button--primary" href={`/app/${workspaceView.family.slug}`}>
              홈 보기
            </Link>
          </div>
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />
        <SurfaceCard title="시간 블록 수정 폼">
          <DayPlannerBlockForm
            action={updateDayPlannerBlockAction}
            block={block}
            familySlug={workspaceView.family.slug}
            submitLabel="블록 수정 저장"
            timezone={timezone}
          />
        </SurfaceCard>
      </PageShell>
    );
  }

  notFound();
}

