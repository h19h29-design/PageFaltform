import Link from "next/link";
import { notFound } from "next/navigation";

import { type TodoDashboardSelection, type TodoItemFixture } from "@ysplan/modules-todo";
import { PageShell, StatusPill, SurfaceCard } from "@ysplan/ui";

import {
  createTodoItemAction,
  deleteTodoItemAction,
  updateTodoItemAction,
} from "src/actions/schedule-module-actions";
import { requireFamilyAppAccessPage } from "src/lib/family-app-access";
import {
  getFamilyTodoItemBySlug,
  getTodoDashboardSelectionForFamily,
  listFamilyTodoItems,
} from "src/lib/family-schedule-modules";
import { TodoItemForm } from "src/lib/schedule-module-forms";
import {
  ModuleEmptyState,
  ModuleHeaderActions,
  ModuleNoticeCard,
} from "src/lib/schedule-module-page-parts";
import {
  formatAudienceLabel,
  formatFamilyDateTime,
  formatVisibilityScopeLabel,
} from "src/lib/schedule-module-utils";

type TodoRoutePageProps = {
  params: Promise<{ familySlug: string; segments?: string[] }>;
  searchParams: Promise<{ error?: string; state?: string }>;
};

function sortItems(items: readonly TodoItemFixture[]): TodoItemFixture[] {
  return [...items].sort((left, right) => left.dueAt.localeCompare(right.dueAt));
}

function groupTodoItems(items: readonly TodoItemFixture[], selection: TodoDashboardSelection) {
  const overdue = new Set(selection.overdueItems.map((item) => item.slug));
  const today = new Set(selection.todayItems.map((item) => item.slug));

  return {
    overdue: items.filter((item) => overdue.has(item.slug) && !item.completed),
    today: items.filter((item) => !overdue.has(item.slug) && today.has(item.slug) && !item.completed),
    next: items.filter((item) => !overdue.has(item.slug) && !today.has(item.slug) && !item.completed),
    done: items.filter((item) => item.completed),
  };
}

function buildTodoFooter(
  familySlug: string,
  item: TodoItemFixture,
  selection: TodoDashboardSelection,
) {
  const overdueSlugs = new Set(selection.overdueItems.map((entry) => entry.slug));
  const todaySlugs = new Set(selection.todayItems.map((entry) => entry.slug));
  const isFocus = selection.focusItem?.slug === item.slug;

  return (
    <div className="surface-stack">
      <div className="pill-row">
        <StatusPill>{formatAudienceLabel(item.audience)}</StatusPill>
        <StatusPill>{formatVisibilityScopeLabel(item.visibilityScope)}</StatusPill>
        {item.blocksFamilyFlow ? <StatusPill tone="accent">중요 체크</StatusPill> : null}
        {item.completed ? <StatusPill>완료</StatusPill> : null}
        {overdueSlugs.has(item.slug) ? <StatusPill tone="warm">지연</StatusPill> : null}
        {!overdueSlugs.has(item.slug) && todaySlugs.has(item.slug) ? <StatusPill tone="accent">오늘</StatusPill> : null}
        {isFocus ? <StatusPill tone="warm">보조 카드</StatusPill> : null}
      </div>
      <div className="inline-actions">
        <Link className="button button--secondary button--small" href={`/app/${familySlug}/todo/${item.slug}`}>
          상세
        </Link>
        <Link className="button button--ghost button--small" href={`/app/${familySlug}/todo/${item.slug}/edit`}>
          수정
        </Link>
      </div>
    </div>
  );
}

function renderTodoRow(
  familySlug: string,
  timezone: string,
  item: TodoItemFixture,
  selection: TodoDashboardSelection,
) {
  return (
    <SurfaceCard
      key={item.id}
      title={item.title}
      description={`${formatFamilyDateTime(item.dueAt, timezone)}${item.assigneeLabel ? ` · ${item.assigneeLabel}` : ""}`}
      badge={<StatusPill>{item.completed ? "완료" : "진행 중"}</StatusPill>}
      footer={buildTodoFooter(familySlug, item, selection)}
      className="todo-row-card"
    >
      <div className="todo-checklist-row">
        <span className={`todo-checklist-row__check${item.completed ? " todo-checklist-row__check--done" : ""}`} aria-hidden="true">
          {item.completed ? "완료" : "할 일"}
        </span>
        <div className="todo-checklist-row__copy">
          <strong>{item.title}</strong>
          <span>{item.blocksFamilyFlow ? "가족 흐름 우선 체크 항목" : "일반 체크 항목"}</span>
        </div>
      </div>
    </SurfaceCard>
  );
}

export default async function TodoRoutePage(props: TodoRoutePageProps) {
  const { familySlug, segments } = await props.params;
  const searchParams = await props.searchParams;
  const { workspaceView } = await requireFamilyAppAccessPage(familySlug);
  const timezone = workspaceView.family.timezone;
  const items = sortItems(await listFamilyTodoItems(workspaceView.family.slug));
  const selection = await getTodoDashboardSelectionForFamily({
    familySlug: workspaceView.family.slug,
    timezone,
    now: new Date().toISOString(),
  });
  const routeSegments = segments ?? [];

  if (routeSegments.length === 0) {
    const grouped = groupTodoItems(items, selection);

    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} 체크리스트`}
        title="가족 체크리스트"
        actions={
          <ModuleHeaderActions
            familySlug={workspaceView.family.slug}
            listLabel="체크리스트"
            moduleSegment="todo"
            newLabel="할 일 추가"
          />
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />

        <SurfaceCard
          title="오늘 체크 상태"
          badge={<StatusPill tone="accent">{timezone}</StatusPill>}
        >
          <dl className="fact-grid">
            <div className="fact-grid__item">
              <dt>전체 항목</dt>
              <dd>{items.length}건</dd>
            </div>
            <div className="fact-grid__item">
              <dt>지연</dt>
              <dd>{grouped.overdue.length}건</dd>
            </div>
            <div className="fact-grid__item">
              <dt>오늘</dt>
              <dd>{grouped.today.length}건</dd>
            </div>
            <div className="fact-grid__item">
              <dt>완료</dt>
              <dd>{grouped.done.length}건</dd>
            </div>
          </dl>
        </SurfaceCard>

        {items.length === 0 ? (
          <ModuleEmptyState
            actionHref={`/app/${workspaceView.family.slug}/todo/new`}
            actionLabel="첫 할 일 만들기"
            description="아직 등록된 체크리스트가 없습니다."
            title="할 일이 없습니다"
          />
        ) : (
          <div className="surface-stack">
            {[
              { key: "overdue", title: "지연된 항목", items: grouped.overdue, tone: "warm" as const },
              { key: "today", title: "오늘 할 일", items: grouped.today, tone: "accent" as const },
              { key: "next", title: "다음에 할 일", items: grouped.next, tone: undefined },
              { key: "done", title: "완료한 항목", items: grouped.done, tone: undefined },
            ].map((group) => (
              <SurfaceCard
                key={group.key}
                title={group.title}
                description={`${group.items.length}건`}
                badge={
                  group.tone ? (
                    <StatusPill tone={group.tone}>{group.items.length}건</StatusPill>
                  ) : (
                    <StatusPill>{group.items.length}건</StatusPill>
                  )
                }
                {...(group.tone ? { tone: group.tone } : {})}
              >
                {group.items.length === 0 ? (
                  <p className="feature-copy">현재 이 구역에 들어갈 항목이 없습니다.</p>
                ) : (
                  <div className="todo-checklist">
                    {group.items.map((item) => renderTodoRow(workspaceView.family.slug, timezone, item, selection))}
                  </div>
                )}
              </SurfaceCard>
            ))}
          </div>
        )}
      </PageShell>
    );
  }

  if (routeSegments.length === 1 && routeSegments[0] === "overdue") {
    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} 체크리스트`}
        title="지연된 항목"
        actions={
          <ModuleHeaderActions
            familySlug={workspaceView.family.slug}
            listLabel="체크리스트"
            moduleSegment="todo"
            newLabel="할 일 추가"
          />
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />
        {selection.overdueItems.length === 0 ? (
          <ModuleEmptyState
            actionHref={`/app/${workspaceView.family.slug}/todo/new`}
            actionLabel="지연 항목 만들기"
            description="현재 지연된 항목이 없습니다."
            title="지연 항목이 없습니다"
          />
        ) : (
          <div className="todo-checklist">
            {selection.overdueItems.map((item) =>
              renderTodoRow(workspaceView.family.slug, timezone, item, selection),
            )}
          </div>
        )}
      </PageShell>
    );
  }

  if (routeSegments.length === 1 && routeSegments[0] === "today") {
    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} 체크리스트`}
        title="오늘 마감 항목"
        actions={
          <ModuleHeaderActions
            familySlug={workspaceView.family.slug}
            listLabel="체크리스트"
            moduleSegment="todo"
            newLabel="할 일 추가"
          />
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />
        {selection.todayItems.length === 0 ? (
          <ModuleEmptyState
            actionHref={`/app/${workspaceView.family.slug}/todo/new`}
            actionLabel="오늘 할 일 만들기"
            description="오늘 마감으로 묶인 항목이 없습니다."
            title="오늘 할 일이 없습니다"
          />
        ) : (
          <div className="todo-checklist">
            {selection.todayItems.map((item) =>
              renderTodoRow(workspaceView.family.slug, timezone, item, selection),
            )}
          </div>
        )}
      </PageShell>
    );
  }

  if (routeSegments.length === 1 && routeSegments[0] === "new") {
    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} 체크리스트`}
        title="할 일 추가"
        actions={
          <ModuleHeaderActions
            familySlug={workspaceView.family.slug}
            listLabel="체크리스트"
            moduleSegment="todo"
            newLabel="할 일 추가"
          />
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />
        <SurfaceCard title="할 일 입력">
          <TodoItemForm
            action={createTodoItemAction}
            familySlug={workspaceView.family.slug}
            submitLabel="할 일 저장"
            timezone={timezone}
          />
        </SurfaceCard>
      </PageShell>
    );
  }

  if (routeSegments.length === 1) {
    const itemSlug = routeSegments[0]!;
    const item = await getFamilyTodoItemBySlug(workspaceView.family.slug, itemSlug);

    if (!item) {
      notFound();
    }

    const isOverdue = selection.overdueItems.some((entry) => entry.slug === item.slug);
    const isToday = selection.todayItems.some((entry) => entry.slug === item.slug);
    const isFocus = selection.focusItem?.slug === item.slug;

    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} 체크리스트`}
        title={item.title}
        actions={
          <div className="inline-actions">
            <Link className="button button--ghost" href={`/app/${workspaceView.family.slug}/todo`}>
              목록
            </Link>
            <Link className="button button--secondary" href={`/app/${workspaceView.family.slug}/todo/${item.slug}/edit`}>
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
            title="할 일 정보"
            description={formatFamilyDateTime(item.dueAt, timezone)}
            badge={<StatusPill>{formatAudienceLabel(item.audience)}</StatusPill>}
            footer={
              <form action={deleteTodoItemAction}>
                <input name="familySlug" type="hidden" value={workspaceView.family.slug} />
                <input name="itemSlug" type="hidden" value={item.slug} />
                <button className="button button--ghost" type="submit">
                  할 일 삭제
                </button>
              </form>
            }
          >
            <dl className="fact-grid">
              <div className="fact-grid__item">
                <dt>공개 범위</dt>
                <dd>{formatVisibilityScopeLabel(item.visibilityScope)}</dd>
              </div>
              <div className="fact-grid__item">
                <dt>담당자</dt>
                <dd>{item.assigneeLabel ?? "-"}</dd>
              </div>
              <div className="fact-grid__item">
                <dt>완료 여부</dt>
                <dd>{item.completed ? "완료" : "진행 중"}</dd>
              </div>
              <div className="fact-grid__item">
                <dt>중요 체크</dt>
                <dd>{item.blocksFamilyFlow ? "예" : "아니오"}</dd>
              </div>
            </dl>
          </SurfaceCard>

          <SurfaceCard
            title="홈 반영 상태"
            description="가족 홈 카드에서 이 항목이 어느 위치에 반영되는지 확인합니다."
            badge={<StatusPill tone={isFocus ? "warm" : "accent"}>{isFocus ? "보조 카드" : "카드 상태"}</StatusPill>}
          >
            <div className="pill-row">
              {isOverdue ? <StatusPill tone="warm">지연 카드</StatusPill> : null}
              {!isOverdue && isToday ? <StatusPill tone="accent">오늘 카드</StatusPill> : null}
              {isFocus ? <StatusPill tone="warm">보조 카드</StatusPill> : null}
              {!isOverdue && !isToday && !isFocus ? <StatusPill>홈 미노출</StatusPill> : null}
            </div>
            <p className="feature-copy">
              가족 홈에서 우선 보이게 하려면 마감 시간과 중요 체크 여부를 함께 조정해보세요.
            </p>
          </SurfaceCard>
        </div>
      </PageShell>
    );
  }

  if (routeSegments.length === 2 && routeSegments[1] === "edit") {
    const itemSlug = routeSegments[0]!;
    const item = await getFamilyTodoItemBySlug(workspaceView.family.slug, itemSlug);

    if (!item) {
      notFound();
    }

    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} 체크리스트`}
        title="할 일 수정"
        actions={
          <div className="inline-actions">
            <Link className="button button--ghost" href={`/app/${workspaceView.family.slug}/todo/${item.slug}`}>
              상세
            </Link>
            <Link className="button button--secondary" href={`/app/${workspaceView.family.slug}/todo`}>
              목록
            </Link>
            <Link className="button button--primary" href={`/app/${workspaceView.family.slug}`}>
              홈 보기
            </Link>
          </div>
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />
        <SurfaceCard title="할 일 수정">
          <TodoItemForm
            action={updateTodoItemAction}
            familySlug={workspaceView.family.slug}
            submitLabel="할 일 수정 저장"
            timezone={timezone}
            todo={item}
          />
        </SurfaceCard>
      </PageShell>
    );
  }

  notFound();
}

