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
  formatTodayKey,
  formatVisibilityScopeLabel,
} from "src/lib/schedule-module-utils";

type CalendarRoutePageProps = {
  params: Promise<{ familySlug: string; segments?: string[] }>;
  searchParams: Promise<{ error?: string; state?: string }>;
};

const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];

function sortSchedules(schedules: readonly CalendarScheduleFixture[]): CalendarScheduleFixture[] {
  return [...schedules].sort((left, right) => left.startsAt.localeCompare(right.startsAt));
}

function getDateKey(value: string, timezone: string): string {
  return formatTodayKey(value, timezone);
}

function buildMonthGrid(
  schedules: readonly CalendarScheduleFixture[],
  timezone: string,
): Array<{
  dateKey: string;
  dayNumber: number;
  isToday: boolean;
  items: CalendarScheduleFixture[];
}> {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const todayKey = getDateKey(today.toISOString(), timezone);
  const itemsByDate = new Map<string, CalendarScheduleFixture[]>();

  for (const schedule of schedules) {
    const key = getDateKey(schedule.startsAt, timezone);
    const bucket = itemsByDate.get(key) ?? [];
    bucket.push(schedule);
    itemsByDate.set(key, bucket);
  }

  const cells: Array<{
    dateKey: string;
    dayNumber: number;
    isToday: boolean;
    items: CalendarScheduleFixture[];
  }> = [];

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(year, month, day);
    const dateKey = formatTodayKey(date, timezone);
    cells.push({
      dateKey,
      dayNumber: day,
      isToday: dateKey === todayKey,
      items: sortSchedules(itemsByDate.get(dateKey) ?? []).slice(0, 3),
    });
  }

  const leadingBlankCount = firstDay.getDay();
  const leadingCells = Array.from({ length: leadingBlankCount }, (_, index) => ({
    dateKey: `leading-${index}`,
    dayNumber: 0,
    isToday: false,
    items: [],
  }));

  return [...leadingCells, ...cells];
}

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
        {schedule.affectsFamilyFlow ? <StatusPill tone="accent">가족 흐름</StatusPill> : null}
        {todaySlugs.has(schedule.slug) ? <StatusPill tone="accent">오늘 카드</StatusPill> : null}
        {isFocus ? <StatusPill tone="warm">보조 카드</StatusPill> : null}
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
  const locationLabel = schedule.location ? ` · ${schedule.location}` : "";
  const ownerLabel = schedule.ownerLabel ? ` · ${schedule.ownerLabel}` : "";

  return (
    <SurfaceCard
      key={schedule.id}
      title={schedule.title}
      description={`${formatFamilyDateTimeRange(schedule.startsAt, schedule.endsAt, timezone)}${locationLabel}${ownerLabel}`}
      badge={<StatusPill>{schedule.audience === "family-shared" ? "공용" : "개인"}</StatusPill>}
      footer={buildCalendarFooter(familySlug, schedule, selection)}
    >
      <p className="feature-copy">
        {schedule.affectsFamilyFlow
          ? "가족 전체 흐름에 영향을 주는 일정입니다."
          : "개인 확인용 일정으로 저장되어 있습니다."}
      </p>
    </SurfaceCard>
  );
}

export default async function CalendarRoutePage(props: CalendarRoutePageProps) {
  const { familySlug, segments } = await props.params;
  const searchParams = await props.searchParams;
  const { workspaceView } = await requireFamilyAppAccessPage(familySlug);
  const timezone = workspaceView.family.timezone;
  const schedules = sortSchedules(await listFamilyCalendarSchedules(workspaceView.family.slug));
  const selection = await getCalendarDashboardSelectionForFamily({
    familySlug: workspaceView.family.slug,
    timezone,
    now: new Date().toISOString(),
  });
  const routeSegments = segments ?? [];

  if (routeSegments.length === 0) {
    const monthGrid = buildMonthGrid(schedules, timezone);

    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} 일정`}
        title="가족 일정표"
        subtitle="월간 달력과 오늘 일정 목록을 함께 보며, 바로 추가하고 수정할 수 있습니다."
        actions={
          <ModuleHeaderActions
            familySlug={workspaceView.family.slug}
            listLabel="일정표"
            moduleSegment="calendar"
            newLabel="일정 추가"
          />
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />

        <div className="grid-two">
          <SurfaceCard
            title="이번 달 한눈에 보기"
            description="날짜 칸을 보며 일정 밀도를 확인하고, 아래 목록에서 세부 내용을 봅니다."
            badge={<StatusPill tone="accent">{timezone}</StatusPill>}
          >
            <div className="calendar-grid">
              {weekdayLabels.map((label) => (
                <div className="calendar-grid__weekday" key={label}>
                  {label}
                </div>
              ))}
              {monthGrid.map((cell) =>
                cell.dayNumber === 0 ? (
                  <div className="calendar-grid__cell calendar-grid__cell--empty" key={cell.dateKey} />
                ) : (
                  <div
                    className={`calendar-grid__cell${cell.isToday ? " calendar-grid__cell--today" : ""}`}
                    key={cell.dateKey}
                  >
                    <div className="calendar-grid__date">{cell.dayNumber}</div>
                    <div className="calendar-grid__items">
                      {cell.items.map((schedule) => (
                        <Link
                          className="calendar-chip"
                          href={`/app/${workspaceView.family.slug}/calendar/${schedule.slug}`}
                          key={schedule.slug}
                        >
                          {schedule.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          </SurfaceCard>

          <ModuleRuleListCard
            description="가족 공용 일정은 오늘 카드에 우선 반영되고, 개인 일정은 필요할 때 보조 카드로 들어갑니다."
            rules={calendarTodayCardRules}
            title="홈 반영 규칙"
          />
        </div>

        <SectionHeader
          kicker="오늘 일정"
          title="지금 확인해야 할 일정"
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
            description="아직 등록된 일정이 없습니다."
            title="일정이 없습니다"
          />
        ) : (
          <div className="agenda-list">
            {schedules.map((schedule) => renderCalendarCard(workspaceView.family.slug, timezone, schedule, selection))}
          </div>
        )}
      </PageShell>
    );
  }

  if (routeSegments.length === 1 && routeSegments[0] === "today") {
    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} 일정`}
        title="오늘 카드 기준 일정"
        subtitle="가족 홈의 오늘 카드와 같은 기준으로 뽑힌 일정 목록입니다."
        actions={
          <ModuleHeaderActions
            familySlug={workspaceView.family.slug}
            listLabel="일정표"
            moduleSegment="calendar"
            newLabel="일정 추가"
          />
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />

        <div className="grid-two">
          <SurfaceCard
            title="오늘 카드 집계"
            description="가족 공용 일정이 우선이며, 필요할 때만 개인 보조 일정이 추가됩니다."
            badge={<StatusPill tone="accent">{selection.todaySchedules.length}건</StatusPill>}
          >
            <p className="feature-copy">
              보조 카드:{" "}
              <strong>{selection.focusSchedule ? selection.focusSchedule.title : "현재 없음"}</strong>
            </p>
          </SurfaceCard>
          <SurfaceCard
            title="확인 포인트"
            description="오늘 카드에 보이는 일정이 실제 일정표 상세와 연결되는지 확인해보세요."
          >
            <ul className="stack-list compact-list">
              <li>공용 일정인지</li>
              <li>가족 흐름 반영이 켜져 있는지</li>
              <li>시간과 장소가 맞는지</li>
            </ul>
          </SurfaceCard>
        </div>

        {selection.todaySchedules.length === 0 ? (
          <ModuleEmptyState
            actionHref={`/app/${workspaceView.family.slug}/calendar/new`}
            actionLabel="오늘 일정 만들기"
            description="오늘 카드에 반영되는 일정이 아직 없습니다."
            title="오늘 카드 일정이 없습니다"
          />
        ) : (
          <div className="agenda-list">
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
        eyebrow={`${workspaceView.family.name} 일정`}
        title="새 일정 만들기"
        subtitle="저장하면 일정표, 가족 홈 카드, 상세 페이지가 함께 갱신됩니다."
        actions={
          <ModuleHeaderActions
            familySlug={workspaceView.family.slug}
            listLabel="일정표"
            moduleSegment="calendar"
            newLabel="일정 추가"
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
            description="가족 공용 여부와 가족 흐름 반영 여부에 따라 홈 카드 노출 방식이 달라집니다."
            rules={calendarTodayCardRules}
            title="입력 전에 볼 규칙"
          />
        </div>
      </PageShell>
    );
  }

  if (routeSegments.length === 1) {
    const itemSlug = routeSegments[0]!;
    const schedule = await getFamilyCalendarScheduleBySlug(workspaceView.family.slug, itemSlug);

    if (!schedule) {
      notFound();
    }

    const todaySlugs = new Set(selection.todaySchedules.map((entry) => entry.slug));
    const isFocus = selection.focusSchedule?.slug === schedule.slug;

    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} 일정`}
        title={schedule.title}
        subtitle="상세에서 시간, 장소, 홈 카드 반영 상태를 함께 확인할 수 있습니다."
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
            title="일정 정보"
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
                <dt>공개 범위</dt>
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
                <dt>가족 흐름 반영</dt>
                <dd>{schedule.affectsFamilyFlow ? "예" : "아니오"}</dd>
              </div>
            </dl>
          </SurfaceCard>

          <SurfaceCard
            title="홈 반영 상태"
            description="가족 홈 카드에서 이 일정이 어떤 위치에 들어가는지 보여줍니다."
            badge={<StatusPill tone={isFocus ? "warm" : "accent"}>{isFocus ? "보조 카드" : "카드 상태"}</StatusPill>}
          >
            <div className="pill-row">
              {todaySlugs.has(schedule.slug) ? <StatusPill tone="accent">오늘 카드</StatusPill> : null}
              {isFocus ? <StatusPill tone="warm">보조 카드</StatusPill> : null}
              {!todaySlugs.has(schedule.slug) && !isFocus ? <StatusPill>홈 미노출</StatusPill> : null}
            </div>
            <p className="feature-copy">
              오늘 카드 목록은{" "}
              <Link href={`/app/${workspaceView.family.slug}/calendar/today`}>오늘 카드 기준 보기</Link>
              에서 다시 확인할 수 있습니다.
            </p>
          </SurfaceCard>
        </div>
      </PageShell>
    );
  }

  if (routeSegments.length === 2 && routeSegments[1] === "edit") {
    const itemSlug = routeSegments[0]!;
    const schedule = await getFamilyCalendarScheduleBySlug(workspaceView.family.slug, itemSlug);

    if (!schedule) {
      notFound();
    }

    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} 일정`}
        title="일정 수정"
        subtitle="수정 후 바로 상세 페이지와 가족 홈 반영 상태를 다시 확인할 수 있습니다."
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
          <SurfaceCard title="일정 수정">
            <CalendarScheduleForm
              action={updateCalendarScheduleAction}
              familySlug={workspaceView.family.slug}
              schedule={schedule}
              submitLabel="일정 수정 저장"
              timezone={timezone}
            />
          </SurfaceCard>
          <SurfaceCard
            title="현재 표시"
            description="저장 전에 현재 상세 카드 구성을 미리 확인합니다."
          >
            {renderCalendarCard(workspaceView.family.slug, timezone, schedule, selection)}
          </SurfaceCard>
        </div>
      </PageShell>
    );
  }

  notFound();
}
