import Link from "next/link";
import { notFound } from "next/navigation";

import {
  schoolTimetableHomeCardRules,
  type SchoolTimetableDashboardSelection,
  type SchoolTimetableFixture,
} from "@ysplan/modules-school-timetable";
import { PageShell, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import {
  createSchoolTimetableAction,
  deleteSchoolTimetableAction,
  updateSchoolTimetableAction,
} from "src/actions/schedule-module-actions";
import { requireFamilyAppAccessPage } from "src/lib/family-app-access";
import {
  getFamilySchoolTimetableBySlug,
  getSchoolTimetableDashboardSelectionForFamily,
  listFamilySchoolTimetableSchedules,
} from "src/lib/family-schedule-modules";
import { SchoolTimetableForm } from "src/lib/schedule-module-forms";
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

type SchoolTimetableRoutePageProps = {
  params: Promise<{ familySlug: string; segments?: string[] }>;
  searchParams: Promise<{ error?: string; state?: string }>;
};

function buildSchoolFooter(
  familySlug: string,
  schedule: SchoolTimetableFixture,
  selection: SchoolTimetableDashboardSelection,
) {
  const todaySlugs = new Set(selection.todaySchedules.map((entry) => entry.slug));
  const isFocus = selection.focusSchedule?.slug === schedule.slug;

  return (
    <div className="surface-stack">
      <div className="pill-row">
        <StatusPill>{formatAudienceLabel(schedule.audience)}</StatusPill>
        <StatusPill>{formatVisibilityScopeLabel(schedule.visibilityScope)}</StatusPill>
        <StatusPill>{schedule.studentLabel}</StatusPill>
        {schedule.affectsFamilyFlow ? <StatusPill tone="accent">route</StatusPill> : null}
        {todaySlugs.has(schedule.slug) ? <StatusPill tone="accent">today</StatusPill> : null}
        {isFocus ? <StatusPill tone="warm">focus</StatusPill> : null}
      </div>
      <div className="inline-actions">
        <Link className="button button--secondary button--small" href={`/app/${familySlug}/school-timetable/${schedule.slug}`}>
          상세
        </Link>
        <Link className="button button--ghost button--small" href={`/app/${familySlug}/school-timetable/${schedule.slug}/edit`}>
          수정
        </Link>
      </div>
    </div>
  );
}

function renderSchoolCard(
  familySlug: string,
  timezone: string,
  schedule: SchoolTimetableFixture,
  selection: SchoolTimetableDashboardSelection,
) {
  const preparationLabel = schedule.preparationNote ? `쨌 ${schedule.preparationNote}` : "";

  return (
    <SurfaceCard
      key={schedule.id}
      title={`${schedule.studentLabel} 쨌 ${schedule.title}`}
      description={`${formatFamilyDateTimeRange(schedule.startsAt, schedule.endsAt, timezone)} ${preparationLabel}`.trim()}
      badge={<StatusPill>{schedule.audience === "family-shared" ? "공용" : "개인"}</StatusPill>}
      footer={buildSchoolFooter(familySlug, schedule, selection)}
    >
      <p className="feature-copy">
        {schedule.affectsFamilyFlow
          ? "등하교 또는 학원 이동 조율에 반영됩니다."
          : "개인 메모용 시간표로 유지됩니다."}
      </p>
    </SurfaceCard>
  );
}

export default async function SchoolTimetableRoutePage(props: SchoolTimetableRoutePageProps) {
  const { familySlug, segments } = await props.params;
  const searchParams = await props.searchParams;
  const { workspaceView } = await requireFamilyAppAccessPage(familySlug);
  const timezone = workspaceView.family.timezone;
  const schedules = await listFamilySchoolTimetableSchedules(workspaceView.family.slug);
  const selection = await getSchoolTimetableDashboardSelectionForFamily({
    familySlug: workspaceView.family.slug,
    timezone,
    now: new Date().toISOString(),
  });
  const routeSegments = segments ?? [];

  if (routeSegments.length === 0) {
    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} School Timetable`}
        title="학교 시간표 목록"
        subtitle="등하교와 학원 동선이 today 카드로, 준비 메모가 필요한 개인 일정은 focus 카드로 연결됩니다."
        actions={
          <ModuleHeaderActions
            familySlug={workspaceView.family.slug}
            listLabel="시간표 목록"
            moduleSegment="school-timetable"
            newLabel="새 시간표"
          />
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />

        <div className="grid-two">
          <SurfaceCard
            title="오늘 반영 상태"
            description="today와 focus 카드 후보를 바로 확인합니다."
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
                <dd>{selection.focusSchedule?.title ?? "-"}</dd>
              </div>
              <div className="fact-grid__item">
                <dt>home 확인</dt>
                <dd>
                  <Link href={`/app/${workspaceView.family.slug}`}>가족 홈</Link>
                </dd>
              </div>
            </dl>
          </SurfaceCard>

          <ModuleRuleListCard
            description="학교 시간표는 오늘 이동이 먼저이고, 협업이 필요한 준비 메모만 focus 보조 카드가 됩니다."
            rules={schoolTimetableHomeCardRules}
            title="today / focus 규칙"
          />
        </div>

        <SectionHeader
          kicker="School Timetable"
          title="저장된 시간표"
          action={
            <Link className="button button--secondary" href={`/app/${workspaceView.family.slug}/school-timetable/today`}>
              오늘 기준 보기
            </Link>
          }
        />

        {schedules.length === 0 ? (
          <ModuleEmptyState
            actionHref={`/app/${workspaceView.family.slug}/school-timetable/new`}
            actionLabel="첫 시간표 만들기"
            description="아직 저장된 학교 시간표가 없습니다."
            title="시간표가 없습니다."
          />
        ) : (
          <div className="route-card-grid">
            {schedules.map((schedule) =>
              renderSchoolCard(workspaceView.family.slug, timezone, schedule, selection),
            )}
          </div>
        )}
      </PageShell>
    );
  }

  if (routeSegments.length === 1 && routeSegments[0] === "today") {
    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} School Timetable`}
        title="today 카드 기준 동선"
        subtitle="가족 공용 동선 + family flow 일정만 today 카드 기준으로 남습니다."
        actions={
          <ModuleHeaderActions
            familySlug={workspaceView.family.slug}
            listLabel="시간표 목록"
            moduleSegment="school-timetable"
            newLabel="새 시간표"
          />
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />
        {selection.todaySchedules.length === 0 ? (
          <ModuleEmptyState
            actionHref={`/app/${workspaceView.family.slug}/school-timetable/new`}
            actionLabel="today 시간표 만들기"
            description="오늘 카드에 반영되는 가족 공용 동선이 없습니다."
            title="today 후보가 없습니다."
          />
        ) : (
          <div className="route-card-grid">
            {selection.todaySchedules.map((schedule) =>
              renderSchoolCard(workspaceView.family.slug, timezone, schedule, selection),
            )}
          </div>
        )}
      </PageShell>
    );
  }

  if (routeSegments.length === 1 && routeSegments[0] === "new") {
    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} School Timetable`}
        title="새 시간표 만들기"
        subtitle="저장 후 홈 today/focus 카드와 동선 목록이 바로 다시 계산됩니다."
        actions={
          <ModuleHeaderActions
            familySlug={workspaceView.family.slug}
            listLabel="시간표 목록"
            moduleSegment="school-timetable"
            newLabel="새 시간표"
          />
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />
        <div className="grid-two">
          <SurfaceCard title="시간표 입력">
            <SchoolTimetableForm
              action={createSchoolTimetableAction}
              familySlug={workspaceView.family.slug}
              submitLabel="시간표 저장"
              timezone={timezone}
            />
          </SurfaceCard>
          <ModuleRuleListCard
            description="today와 focus 기준이 입력 즉시 다시 계산되므로 동선 테스트에 바로 쓸 수 있습니다."
            rules={schoolTimetableHomeCardRules}
            title="입력 전에 볼 규칙"
          />
        </div>
      </PageShell>
    );
  }

  if (routeSegments.length === 1) {
    const itemSlug = routeSegments[0]!;
    const schedule = await getFamilySchoolTimetableBySlug(
      workspaceView.family.slug,
      itemSlug,
    );

    if (!schedule) {
      notFound();
    }

    const isToday = selection.todaySchedules.some((entry) => entry.slug === schedule.slug);
    const isFocus = selection.focusSchedule?.slug === schedule.slug;

    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} School Timetable`}
        title={`${schedule.studentLabel} 쨌 ${schedule.title}`}
        subtitle="상세에서 수정, 삭제, home 동선 반영 상태를 함께 테스트할 수 있습니다."
        actions={
          <div className="inline-actions">
            <Link className="button button--ghost" href={`/app/${workspaceView.family.slug}/school-timetable`}>
              목록
            </Link>
            <Link
              className="button button--secondary"
              href={`/app/${workspaceView.family.slug}/school-timetable/${schedule.slug}/edit`}
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
            title="시간표 상세"
            description={formatFamilyDateTimeRange(schedule.startsAt, schedule.endsAt, timezone)}
            badge={<StatusPill>{formatAudienceLabel(schedule.audience)}</StatusPill>}
            footer={
              <form action={deleteSchoolTimetableAction}>
                <input name="familySlug" type="hidden" value={workspaceView.family.slug} />
                <input name="itemSlug" type="hidden" value={schedule.slug} />
                <button className="button button--ghost" type="submit">
                  시간표 삭제
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
                <dt>준비 메모</dt>
                <dd>{schedule.preparationNote ?? "-"}</dd>
              </div>
              <div className="fact-grid__item">
                <dt>가족 흐름</dt>
                <dd>{schedule.affectsFamilyFlow ? "동선 반영" : "개인 메모"}</dd>
              </div>
              <div className="fact-grid__item">
                <dt>학생</dt>
                <dd>{schedule.studentLabel}</dd>
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
              홈 today 카드는 <Link href={`/app/${workspaceView.family.slug}/school-timetable/today`}>오늘 기준 동선</Link>으로,
              개인 협업 카드는 상세 페이지로 이어집니다.
            </p>
          </SurfaceCard>
        </div>
      </PageShell>
    );
  }

  if (routeSegments.length === 2 && routeSegments[1] === "edit") {
    const itemSlug = routeSegments[0]!;
    const schedule = await getFamilySchoolTimetableBySlug(
      workspaceView.family.slug,
      itemSlug,
    );

    if (!schedule) {
      notFound();
    }

    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} School Timetable`}
        title="시간표 수정"
        subtitle="같은 폼으로 수정 후 상세와 home 반영을 다시 확인할 수 있습니다."
        actions={
          <div className="inline-actions">
            <Link
              className="button button--ghost"
              href={`/app/${workspaceView.family.slug}/school-timetable/${schedule.slug}`}
            >
              상세
            </Link>
            <Link className="button button--secondary" href={`/app/${workspaceView.family.slug}/school-timetable`}>
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
          <SurfaceCard title="시간표 수정 폼">
            <SchoolTimetableForm
              action={updateSchoolTimetableAction}
              familySlug={workspaceView.family.slug}
              schedule={schedule}
              submitLabel="시간표 수정 저장"
              timezone={timezone}
            />
          </SurfaceCard>
          <SurfaceCard
            title="현재 home 상태"
            description="수정 전에 계산된 today / focus 상태를 미리 보여 줍니다."
          >
            {renderSchoolCard(workspaceView.family.slug, timezone, schedule, selection)}
          </SurfaceCard>
        </div>
      </PageShell>
    );
  }

  notFound();
}
