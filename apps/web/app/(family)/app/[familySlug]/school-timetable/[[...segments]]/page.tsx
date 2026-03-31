import Link from "next/link";
import { notFound } from "next/navigation";

import { type SchoolTimetableDashboardSelection, type SchoolTimetableFixture } from "@ysplan/modules-school-timetable";
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

const weekdayOrder = [
  { key: 1, label: "월" },
  { key: 2, label: "화" },
  { key: 3, label: "수" },
  { key: 4, label: "목" },
  { key: 5, label: "금" },
] as const;

function sortSchedules(schedules: readonly SchoolTimetableFixture[]): SchoolTimetableFixture[] {
  return [...schedules].sort((left, right) => left.startsAt.localeCompare(right.startsAt));
}

function getWeekdayIndex(value: string, timezone: string): number {
  const label = new Intl.DateTimeFormat("ko-KR", {
    timeZone: timezone,
    weekday: "short",
  }).format(new Date(value));

  switch (label[0]) {
    case "월":
      return 1;
    case "화":
      return 2;
    case "수":
      return 3;
    case "목":
      return 4;
    case "금":
      return 5;
    default:
      return 1;
  }
}

function getTimeLabel(value: string, timezone: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function buildTimetableMatrix(schedules: readonly SchoolTimetableFixture[], timezone: string) {
  const periodLabels = Array.from(
    new Set(schedules.map((schedule) => getTimeLabel(schedule.startsAt, timezone))),
  ).sort();

  const matrix = new Map<string, SchoolTimetableFixture>();

  for (const schedule of schedules) {
    const weekday = getWeekdayIndex(schedule.startsAt, timezone);
    const time = getTimeLabel(schedule.startsAt, timezone);
    matrix.set(`${weekday}-${time}`, schedule);
  }

  return { periodLabels, matrix };
}

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
        {schedule.affectsFamilyFlow ? <StatusPill tone="accent">준비 흐름</StatusPill> : null}
        {todaySlugs.has(schedule.slug) ? <StatusPill tone="accent">오늘 카드</StatusPill> : null}
        {isFocus ? <StatusPill tone="warm">보조 카드</StatusPill> : null}
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
  return (
    <SurfaceCard
      key={schedule.id}
      title={`${schedule.studentLabel} · ${schedule.title}`}
      description={`${formatFamilyDateTimeRange(schedule.startsAt, schedule.endsAt, timezone)}${
        schedule.preparationNote ? ` · ${schedule.preparationNote}` : ""
      }`}
      badge={<StatusPill>{schedule.audience === "family-shared" ? "공용" : "개인"}</StatusPill>}
      footer={buildSchoolFooter(familySlug, schedule, selection)}
    >
      <p className="feature-copy">
        {schedule.affectsFamilyFlow
          ? "등하교 준비 흐름에 반영되는 시간표 항목입니다."
          : "개인 기록 중심으로 저장된 시간표 항목입니다."}
      </p>
    </SurfaceCard>
  );
}

export default async function SchoolTimetableRoutePage(props: SchoolTimetableRoutePageProps) {
  const { familySlug, segments } = await props.params;
  const searchParams = await props.searchParams;
  const { workspaceView } = await requireFamilyAppAccessPage(familySlug);
  const timezone = workspaceView.family.timezone;
  const schedules = sortSchedules(await listFamilySchoolTimetableSchedules(workspaceView.family.slug));
  const selection = await getSchoolTimetableDashboardSelectionForFamily({
    familySlug: workspaceView.family.slug,
    timezone,
    now: new Date().toISOString(),
  });
  const routeSegments = segments ?? [];

  if (routeSegments.length === 0) {
    const { periodLabels, matrix } = buildTimetableMatrix(schedules, timezone);

    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} 시간표`}
        title="학교 시간표"
        actions={
          <ModuleHeaderActions
            familySlug={workspaceView.family.slug}
            listLabel="시간표"
            moduleSegment="school-timetable"
            newLabel="시간표 추가"
          />
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />

        <SurfaceCard
          title="주간 표 보기"
          badge={<StatusPill tone="accent">{schedules.length}건</StatusPill>}
        >
          {schedules.length === 0 ? (
            <p className="feature-copy">등록된 시간표가 아직 없습니다.</p>
          ) : (
            <div className="timetable-sheet">
              <div className="timetable-sheet__head timetable-sheet__cell">교시</div>
              {weekdayOrder.map((weekday) => (
                <div className="timetable-sheet__head timetable-sheet__cell" key={weekday.key}>
                  {weekday.label}
                </div>
              ))}

              {periodLabels.map((periodLabel) => (
                <div className="timetable-sheet__row" key={periodLabel}>
                  <div className="timetable-sheet__cell timetable-sheet__cell--time">{periodLabel}</div>
                  {weekdayOrder.map((weekday) => {
                    const schedule = matrix.get(`${weekday.key}-${periodLabel}`);

                    return (
                      <div className="timetable-sheet__cell" key={`${weekday.key}-${periodLabel}`}>
                        {schedule ? (
                          <Link
                            className="timetable-sheet__entry"
                            href={`/app/${workspaceView.family.slug}/school-timetable/${schedule.slug}`}
                          >
                            <strong>{schedule.title}</strong>
                            <span>{schedule.studentLabel}</span>
                            {schedule.preparationNote ? <small>{schedule.preparationNote}</small> : null}
                          </Link>
                        ) : (
                          <span className="timetable-sheet__empty">-</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </SurfaceCard>

        <SectionHeader
          kicker="오늘 준비"
          title="오늘 챙길 시간표"
          action={
            <Link className="button button--secondary" href={`/app/${workspaceView.family.slug}/school-timetable/today`}>
              오늘 카드 기준 보기
            </Link>
          }
        />

        {schedules.length === 0 ? (
          <ModuleEmptyState
            actionHref={`/app/${workspaceView.family.slug}/school-timetable/new`}
            actionLabel="첫 시간표 만들기"
            description="아직 등록된 시간표가 없습니다."
            title="시간표가 없습니다"
          />
        ) : (
          <div className="agenda-list">
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
        eyebrow={`${workspaceView.family.name} 시간표`}
        title="오늘 준비 시간표"
        actions={
          <ModuleHeaderActions
            familySlug={workspaceView.family.slug}
            listLabel="시간표"
            moduleSegment="school-timetable"
            newLabel="시간표 추가"
          />
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />
        {selection.todaySchedules.length === 0 ? (
          <ModuleEmptyState
            actionHref={`/app/${workspaceView.family.slug}/school-timetable/new`}
            actionLabel="오늘 시간표 만들기"
            description="오늘 카드에 반영되는 시간표가 없습니다."
            title="오늘 시간표가 없습니다"
          />
        ) : (
          <div className="agenda-list">
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
        eyebrow={`${workspaceView.family.name} 시간표`}
        title="시간표 추가"
        actions={
          <ModuleHeaderActions
            familySlug={workspaceView.family.slug}
            listLabel="시간표"
            moduleSegment="school-timetable"
            newLabel="시간표 추가"
          />
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />
        <SurfaceCard title="시간표 입력">
          <SchoolTimetableForm
            action={createSchoolTimetableAction}
            familySlug={workspaceView.family.slug}
            submitLabel="시간표 저장"
            timezone={timezone}
          />
        </SurfaceCard>
      </PageShell>
    );
  }

  if (routeSegments.length === 1) {
    const itemSlug = routeSegments[0]!;
    const schedule = await getFamilySchoolTimetableBySlug(workspaceView.family.slug, itemSlug);

    if (!schedule) {
      notFound();
    }

    const isToday = selection.todaySchedules.some((entry) => entry.slug === schedule.slug);
    const isFocus = selection.focusSchedule?.slug === schedule.slug;

    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} 시간표`}
        title={`${schedule.studentLabel} · ${schedule.title}`}
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
            title="시간표 정보"
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
                <dt>공개 범위</dt>
                <dd>{formatVisibilityScopeLabel(schedule.visibilityScope)}</dd>
              </div>
              <div className="fact-grid__item">
                <dt>학생</dt>
                <dd>{schedule.studentLabel}</dd>
              </div>
              <div className="fact-grid__item">
                <dt>준비물 메모</dt>
                <dd>{schedule.preparationNote ?? "-"}</dd>
              </div>
              <div className="fact-grid__item">
                <dt>준비 흐름 반영</dt>
                <dd>{schedule.affectsFamilyFlow ? "예" : "아니오"}</dd>
              </div>
            </dl>
          </SurfaceCard>

          <SurfaceCard
            title="홈 반영 상태"
            description="가족 홈 카드에서 이 시간표가 어떻게 보이는지 확인합니다."
            badge={<StatusPill tone={isFocus ? "warm" : "accent"}>{isFocus ? "보조 카드" : "카드 상태"}</StatusPill>}
          >
            <div className="pill-row">
              {isToday ? <StatusPill tone="accent">오늘 카드</StatusPill> : null}
              {isFocus ? <StatusPill tone="warm">보조 카드</StatusPill> : null}
              {!isToday && !isFocus ? <StatusPill>홈 미노출</StatusPill> : null}
            </div>
            <p className="feature-copy">
              준비물 메모가 중요한 날은 준비 흐름 반영을 켜두면 홈에서 더 잘 보입니다.
            </p>
          </SurfaceCard>
        </div>
      </PageShell>
    );
  }

  if (routeSegments.length === 2 && routeSegments[1] === "edit") {
    const itemSlug = routeSegments[0]!;
    const schedule = await getFamilySchoolTimetableBySlug(workspaceView.family.slug, itemSlug);

    if (!schedule) {
      notFound();
    }

    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} 시간표`}
        title="시간표 수정"
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
        <SurfaceCard title="시간표 수정">
          <SchoolTimetableForm
            action={updateSchoolTimetableAction}
            familySlug={workspaceView.family.slug}
            schedule={schedule}
            submitLabel="시간표 수정 저장"
            timezone={timezone}
          />
        </SurfaceCard>
      </PageShell>
    );
  }

  notFound();
}

