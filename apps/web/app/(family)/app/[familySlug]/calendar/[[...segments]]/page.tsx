import Link from "next/link";
import { notFound } from "next/navigation";

import {
  calendarTodayCardRules,
  type CalendarDashboardSelection,
  type CalendarScheduleFixture,
} from "@ysplan/modules-calendar";
import { PageShell, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import {
  createCalendarScheduleAction,
  deleteCalendarScheduleAction,
  updateCalendarScheduleAction,
} from "src/actions/schedule-module-actions";
import { requireFamilyAppAccessPage } from "src/lib/family-app-access";
import {
  getCalendarDashboardSelectionForFamily,
  getFamilyCalendarScheduleBySlug,
  listFamilyCalendarSchedules,
} from "src/lib/family-schedule-modules";
import { CalendarScheduleForm } from "src/lib/schedule-module-forms";
import {
  ModuleEmptyState,
  ModuleHeaderActions,
  ModuleNoticeCard,
  ModuleRuleListCard,
} from "src/lib/schedule-module-page-parts";
import {
  formatAudienceLabel,
  formatFamilyDateTimeRange,
  formatVisibilityScopeLabel,
} from "src/lib/schedule-module-utils";

type CalendarRoutePageProps = {
  params: Promise<{ familySlug: string; segments?: string[] }>;
  searchParams: Promise<{ error?: string; state?: string }>;
};

function buildCalendarFooter(
  familySlug: string,
  schedule: CalendarScheduleFixture,
  selection: CalendarDashboardSelection,
) {
  const todaySlugs = new Set(selection.todaySchedules.map((entry) => entry.slug));
  const isFocus = selection.focusSchedule?.slug === schedule.slug;

  return (
    <div className="surface-stack">
      <div className="pill-row">
        <StatusPill>{formatAudienceLabel(schedule.audience)}</StatusPill>
        <StatusPill>{formatVisibilityScopeLabel(schedule.visibilityScope)}</StatusPill>
        {schedule.affectsFamilyFlow ? <StatusPill tone="accent">family flow</StatusPill> : null}
        {todaySlugs.has(schedule.slug) ? <StatusPill tone="accent">today</StatusPill> : null}
        {isFocus ? <StatusPill tone="warm">focus</StatusPill> : null}
      </div>
      <div className="inline-actions">
        <Link className="button button--secondary button--small" href={`/app/${familySlug}/calendar/${schedule.slug}`}>
          상세
        </Link>
        <Link className="button button--ghost button--small" href={`/app/${familySlug}/calendar/${schedule.slug}/edit`}>
          수정
        </Link>
      </div>
    </div>
  );
}

function renderCalendarCard(
  familySlug: string,
  timezone: string,
  schedule: CalendarScheduleFixture,
  selection: CalendarDashboardSelection,
) {
  const locationLabel = schedule.location ? `쨌 ${schedule.location}` : "";
  const ownerLabel = schedule.ownerLabel ? `쨌 ${schedule.ownerLabel}` : "";

  return (
    <SurfaceCard
      key={schedule.id}
      title={schedule.title}
      description={`${formatFamilyDateTimeRange(schedule.startsAt, schedule.endsAt, timezone)} ${locationLabel} ${ownerLabel}`.trim()}
      badge={<StatusPill>{schedule.audience === "family-shared" ? "공용" : "개인"}</StatusPill>}
      footer={buildCalendarFooter(familySlug, schedule, selection)}
    >
      <p className="feature-copy">
        {schedule.affectsFamilyFlow
          ? "가족 흐름에 영향을 주는 일정입니다."
          : "홈 카드에는 직접 올라오지 않는 일반 일정입니다."}
      </p>
    </SurfaceCard>
  );
}

export default async function CalendarRoutePage(props: CalendarRoutePageProps) {
  const { familySlug, segments } = await props.params;
  const searchParams = await props.searchParams;
  const { workspaceView } = await requireFamilyAppAccessPage(familySlug);
  const timezone = workspaceView.family.timezone;
  const schedules = await listFamilyCalendarSchedules(workspaceView.family.slug);
  const selection = await getCalendarDashboardSelectionForFamily({
    familySlug: workspaceView.family.slug,
    timezone,
    now: new Date().toISOString(),
  });
  const routeSegments = segments ?? [];

  if (routeSegments.length === 0) {
    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} Calendar`}
        title="가족 일정 목록"
        subtitle="today 카드와 focus 보조 카드가 어떤 규칙으로 만들어지는지 보면서 일정 CRUD를 바로 테스트할 수 있습니다."
        actions={
          <ModuleHeaderActions
            familySlug={workspaceView.family.slug}
            listLabel="일정 목록"
            moduleSegment="calendar"
            newLabel="새 일정"
          />
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />

        <div className="grid-two">
          <SurfaceCard
            title="오늘 반영 상태"
            description="저장 직후 홈 카드가 다시 계산될 때 참고하는 today/focus 기준입니다."
            badge={<StatusPill tone="accent">{timezone}</StatusPill>}
          >
            <dl className="fact-grid">
              <div className="fact-grid__item">
                <dt>전체 일정</dt>
                <dd>{schedules.length}건</dd>
              </div>
              <div className="fact-grid__item">
                <dt>today 후보</dt>
                <dd>{selection.todaySchedules.length}건</dd>
              </div>
              <div className="fact-grid__item">
                <dt>focus 후보</dt>
                <dd>{selection.focusSchedule ? selection.focusSchedule.title : "-"}</dd>
              </div>
              <div className="fact-grid__item">
                <dt>홈 이동</dt>
                <dd>
                  <Link href={`/app/${workspaceView.family.slug}`}>가족 홈</Link>
                </dd>
              </div>
            </dl>
          </SurfaceCard>

          <ModuleRuleListCard
            description="캘린더 모듈은 가족 공용 일정 우선, 개인 일정은 보조 카드 1장만 허용합니다."
            rules={calendarTodayCardRules}
            title="today / focus 규칙"
          />
        </div>

        <SectionHeader
          kicker="Calendar"
          title="저장된 일정"
          action={
            <Link className="button button--secondary" href={`/app/${workspaceView.family.slug}/calendar/today`}>
              오늘 카드 기준 보기
            </Link>
          }
        />

        {schedules.length === 0 ? (
          <ModuleEmptyState
            actionHref={`/app/${workspaceView.family.slug}/calendar/new`}
            actionLabel="첫 일정 만들기"
            description="아직 저장된 일정이 없습니다."
            title="일정이 없습니다."
          />
        ) : (
          <div className="route-card-grid">
            {schedules.map((schedule) =>
              renderCalendarCard(workspaceView.family.slug, timezone, schedule, selection),
            )}
          </div>
        )}
      </PageShell>
    );
  }

  if (routeSegments.length === 1 && routeSegments[0] === "today") {
    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} Calendar`}
        title="today 카드 기준 일정"
        subtitle="가족 공용 + family flow 일정만 today 카드로 묶입니다."
        actions={
          <ModuleHeaderActions
            familySlug={workspaceView.family.slug}
            listLabel="일정 목록"
            moduleSegment="calendar"
            newLabel="새 일정"
          />
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />

        <div className="grid-two">
          <SurfaceCard
            title="today 큐"
            description="home today 카드와 같은 필터 결과입니다."
            badge={<StatusPill tone="accent">{selection.todaySchedules.length}건</StatusPill>}
          >
            <p className="feature-copy">
              개인 일정은 여기 들어오지 않고, 가족 흐름에 영향을 주는 공용 일정만 남습니다.
            </p>
          </SurfaceCard>
          <SurfaceCard
            title="focus 보조 카드"
            description="개인 일정 중 가족 조율이 필요한 1건만 focus 후보가 됩니다."
            badge={<StatusPill tone="warm">focus</StatusPill>}
          >
            <p className="feature-copy">
              {selection.focusSchedule
                ? `${selection.focusSchedule.title} 쨌 ${formatFamilyDateTimeRange(selection.focusSchedule.startsAt, selection.focusSchedule.endsAt, timezone)}`
                : "현재 조건에 맞는 개인 보조 일정이 없습니다."}
            </p>
          </SurfaceCard>
        </div>

        {selection.todaySchedules.length === 0 ? (
          <ModuleEmptyState
            actionHref={`/app/${workspaceView.family.slug}/calendar/new`}
            actionLabel="today 일정 만들기"
            description="오늘 반영되는 가족 공용 일정이 없습니다."
            title="today 카드 후보가 없습니다."
          />
        ) : (
          <div className="route-card-grid">
            {selection.todaySchedules.map((schedule) =>
              renderCalendarCard(workspaceView.family.slug, timezone, schedule, selection),
            )}
          </div>
        )}
      </PageShell>
    );
  }

  if (routeSegments.length === 1 && routeSegments[0] === "new") {
    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} Calendar`}
        title="새 일정 만들기"
        subtitle="저장하면 목록과 home 카드가 같은 builder 규칙으로 바로 다시 계산됩니다."
        actions={
          <ModuleHeaderActions
            familySlug={workspaceView.family.slug}
            listLabel="일정 목록"
            moduleSegment="calendar"
            newLabel="새 일정"
          />
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />
        <div className="grid-two">
          <SurfaceCard title="일정 입력">
            <CalendarScheduleForm
              action={createCalendarScheduleAction}
              familySlug={workspaceView.family.slug}
              submitLabel="일정 저장"
              timezone={timezone}
            />
          </SurfaceCard>
          <ModuleRuleListCard
            description="가족 공용과 개인 일정의 home 반영 기준을 같이 확인하면서 입력할 수 있습니다."
            rules={calendarTodayCardRules}
            title="입력 전에 볼 규칙"
          />
        </div>
      </PageShell>
    );
  }

  if (routeSegments.length === 1) {
    const itemSlug = routeSegments[0]!;
    const schedule = await getFamilyCalendarScheduleBySlug(
      workspaceView.family.slug,
      itemSlug,
    );

    if (!schedule) {
      notFound();
    }

    const todaySlugs = new Set(selection.todaySchedules.map((entry) => entry.slug));
    const isFocus = selection.focusSchedule?.slug === schedule.slug;

    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} Calendar`}
        title={schedule.title}
        subtitle="상세에서 수정과 삭제를 바로 테스트할 수 있고, 오늘 홈 반영 상태도 함께 확인할 수 있습니다."
        actions={
          <div className="inline-actions">
            <Link className="button button--ghost" href={`/app/${workspaceView.family.slug}/calendar`}>
              목록
            </Link>
            <Link
              className="button button--secondary"
              href={`/app/${workspaceView.family.slug}/calendar/${schedule.slug}/edit`}
            >
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
            title="일정 상세"
            description={formatFamilyDateTimeRange(schedule.startsAt, schedule.endsAt, timezone)}
            badge={<StatusPill>{formatAudienceLabel(schedule.audience)}</StatusPill>}
            footer={
              <form action={deleteCalendarScheduleAction}>
                <input name="familySlug" type="hidden" value={workspaceView.family.slug} />
                <input name="itemSlug" type="hidden" value={schedule.slug} />
                <button className="button button--ghost" type="submit">
                  일정 삭제
                </button>
              </form>
            }
          >
            <dl className="fact-grid">
              <div className="fact-grid__item">
                <dt>노출 범위</dt>
                <dd>{formatVisibilityScopeLabel(schedule.visibilityScope)}</dd>
              </div>
              <div className="fact-grid__item">
                <dt>장소</dt>
                <dd>{schedule.location ?? "-"}</dd>
              </div>
              <div className="fact-grid__item">
                <dt>담당자</dt>
                <dd>{schedule.ownerLabel ?? "-"}</dd>
              </div>
              <div className="fact-grid__item">
                <dt>가족 흐름</dt>
                <dd>{schedule.affectsFamilyFlow ? "영향 있음" : "일반 일정"}</dd>
              </div>
            </dl>
          </SurfaceCard>

          <SurfaceCard
            title="home 연결 상태"
            description="이 일정이 today/focus 카드에 반영되는지 바로 확인할 수 있습니다."
            badge={<StatusPill tone={isFocus ? "warm" : "accent"}>{isFocus ? "focus" : "status"}</StatusPill>}
          >
            <div className="pill-row">
              {todaySlugs.has(schedule.slug) ? <StatusPill tone="accent">today 후보</StatusPill> : null}
              {isFocus ? <StatusPill tone="warm">focus 후보</StatusPill> : null}
              {!todaySlugs.has(schedule.slug) && !isFocus ? <StatusPill>home 미노출</StatusPill> : null}
            </div>
            <p className="feature-copy">
              가족 홈에서 today 카드는 <Link href={`/app/${workspaceView.family.slug}/calendar/today`}>오늘 일정 기준</Link>으로,
              focus 카드는 개인 일정 상세로 이어집니다.
            </p>
          </SurfaceCard>
        </div>
      </PageShell>
    );
  }

  if (routeSegments.length === 2 && routeSegments[1] === "edit") {
    const itemSlug = routeSegments[0]!;
    const schedule = await getFamilyCalendarScheduleBySlug(
      workspaceView.family.slug,
      itemSlug,
    );

    if (!schedule) {
      notFound();
    }

    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} Calendar`}
        title="일정 수정"
        subtitle="같은 폼으로 수정 후 상세와 홈 카드 흐름을 바로 다시 확인할 수 있습니다."
        actions={
          <div className="inline-actions">
            <Link className="button button--ghost" href={`/app/${workspaceView.family.slug}/calendar/${schedule.slug}`}>
              상세
            </Link>
            <Link className="button button--secondary" href={`/app/${workspaceView.family.slug}/calendar`}>
              목록
            </Link>
            <Link className="button button--primary" href={`/app/${workspaceView.family.slug}`}>
              홈 보기
            </Link>
          </div>
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />
        <div className="grid-two">
          <SurfaceCard title="일정 수정 폼">
            <CalendarScheduleForm
              action={updateCalendarScheduleAction}
              familySlug={workspaceView.family.slug}
              schedule={schedule}
              submitLabel="일정 수정 저장"
              timezone={timezone}
            />
          </SurfaceCard>
          <SurfaceCard
            title="현재 홈 상태"
            description="수정 전 기준으로 이 일정이 어떤 카드로 반영되는지 보여 줍니다."
          >
            {renderCalendarCard(workspaceView.family.slug, timezone, schedule, selection)}
          </SurfaceCard>
        </div>
      </PageShell>
    );
  }

  notFound();
}
