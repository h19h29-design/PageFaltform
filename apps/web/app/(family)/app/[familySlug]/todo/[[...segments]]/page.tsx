import Link from "next/link";
import { notFound } from "next/navigation";

import { todoHomeCardRules, type TodoDashboardSelection, type TodoItemFixture } from "@ysplan/modules-todo";
import { PageShell, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

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
  ModuleRuleListCard,
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
        {item.blocksFamilyFlow ? <StatusPill tone="accent">blocker</StatusPill> : null}
        {item.completed ? <StatusPill>done</StatusPill> : null}
        {overdueSlugs.has(item.slug) ? <StatusPill tone="warm">overdue</StatusPill> : null}
        {!overdueSlugs.has(item.slug) && todaySlugs.has(item.slug) ? <StatusPill tone="accent">today</StatusPill> : null}
        {isFocus ? <StatusPill tone="warm">focus</StatusPill> : null}
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

function renderTodoCard(
  familySlug: string,
  timezone: string,
  item: TodoItemFixture,
  selection: TodoDashboardSelection,
) {
  const assigneeLabel = item.assigneeLabel ? `쨌 ${item.assigneeLabel}` : "";

  return (
    <SurfaceCard
      key={item.id}
      title={item.title}
      description={`${formatFamilyDateTime(item.dueAt, timezone)} ${assigneeLabel}`.trim()}
      badge={<StatusPill>{item.audience === "family-shared" ? "공용" : "개인"}</StatusPill>}
      footer={buildTodoFooter(familySlug, item, selection)}
    >
      <p className="feature-copy">
        {item.completed
          ? "완료된 항목입니다. 홈 카드 후보에서는 빠집니다."
          : item.blocksFamilyFlow
            ? "가족 흐름을 막는 blocker 후보입니다."
            : "개별 관리용 일반 체크입니다."}
      </p>
    </SurfaceCard>
  );
}

export default async function TodoRoutePage(props: TodoRoutePageProps) {
  const { familySlug, segments } = await props.params;
  const searchParams = await props.searchParams;
  const { workspaceView } = await requireFamilyAppAccessPage(familySlug);
  const timezone = workspaceView.family.timezone;
  const items = await listFamilyTodoItems(workspaceView.family.slug);
  const selection = await getTodoDashboardSelectionForFamily({
    familySlug: workspaceView.family.slug,
    timezone,
    now: new Date().toISOString(),
  });
  const routeSegments = segments ?? [];

  if (routeSegments.length === 0) {
    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} Todo`}
        title="가족 할 일 목록"
        subtitle="지연 > 오늘 마감 > 개인 blocker 우선순위가 실제 CRUD 데이터로 바로 계산됩니다."
        actions={
          <ModuleHeaderActions
            familySlug={workspaceView.family.slug}
            listLabel="할 일 목록"
            moduleSegment="todo"
            newLabel="새 할 일"
          />
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />

        <div className="grid-two">
          <SurfaceCard
            title="today 반영 상태"
            description="지연과 오늘 마감이 각각 today 카드 묶음으로 계산됩니다."
            badge={<StatusPill tone="accent">{timezone}</StatusPill>}
          >
            <dl className="fact-grid">
              <div className="fact-grid__item">
                <dt>전체 항목</dt>
                <dd>{items.length}건</dd>
              </div>
              <div className="fact-grid__item">
                <dt>지연 묶음</dt>
                <dd>{selection.overdueItems.length}건</dd>
              </div>
              <div className="fact-grid__item">
                <dt>오늘 마감 묶음</dt>
                <dd>{selection.todayItems.length}건</dd>
              </div>
              <div className="fact-grid__item">
                <dt>focus 후보</dt>
                <dd>{selection.focusItem?.title ?? "-"}</dd>
              </div>
            </dl>
          </SurfaceCard>

          <ModuleRuleListCard
            description="할 일 모듈은 가족 공용 지연/오늘 마감 묶음을 먼저 보여 주고, 개인 blocker는 보조 카드 1건만 허용합니다."
            rules={todoHomeCardRules}
            title="today / focus 규칙"
          />
        </div>

        <SectionHeader
          kicker="Todo"
          title="저장된 할 일"
          action={
            <div className="inline-actions">
              <Link className="button button--secondary" href={`/app/${workspaceView.family.slug}/todo/overdue`}>
                지연 보기
              </Link>
              <Link className="button button--secondary" href={`/app/${workspaceView.family.slug}/todo/today`}>
                오늘 보기
              </Link>
            </div>
          }
        />

        {items.length === 0 ? (
          <ModuleEmptyState
            actionHref={`/app/${workspaceView.family.slug}/todo/new`}
            actionLabel="첫 할 일 만들기"
            description="아직 저장된 할 일이 없습니다."
            title="할 일이 없습니다."
          />
        ) : (
          <div className="route-card-grid">
            {items.map((item) => renderTodoCard(workspaceView.family.slug, timezone, item, selection))}
          </div>
        )}
      </PageShell>
    );
  }

  if (routeSegments.length === 1 && routeSegments[0] === "overdue") {
    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} Todo`}
        title="지연 today 카드 기준"
        subtitle="가족 공용 + blocker + overdue 조건을 만족하는 항목만 모아 봅니다."
        actions={
          <ModuleHeaderActions
            familySlug={workspaceView.family.slug}
            listLabel="할 일 목록"
            moduleSegment="todo"
            newLabel="새 할 일"
          />
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />
        {selection.overdueItems.length === 0 ? (
          <ModuleEmptyState
            actionHref={`/app/${workspaceView.family.slug}/todo/new`}
            actionLabel="지연 항목 만들기"
            description="현재 지연으로 잡히는 가족 공용 할 일이 없습니다."
            title="지연 묶음이 없습니다."
          />
        ) : (
          <div className="route-card-grid">
            {selection.overdueItems.map((item) =>
              renderTodoCard(workspaceView.family.slug, timezone, item, selection),
            )}
          </div>
        )}
      </PageShell>
    );
  }

  if (routeSegments.length === 1 && routeSegments[0] === "today") {
    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} Todo`}
        title="오늘 마감 today 카드 기준"
        subtitle="지연이 아닌 가족 공용 오늘 마감만 today 카드 묶음으로 남습니다."
        actions={
          <ModuleHeaderActions
            familySlug={workspaceView.family.slug}
            listLabel="할 일 목록"
            moduleSegment="todo"
            newLabel="새 할 일"
          />
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />
        {selection.todayItems.length === 0 ? (
          <ModuleEmptyState
            actionHref={`/app/${workspaceView.family.slug}/todo/new`}
            actionLabel="오늘 할 일 만들기"
            description="오늘 마감 today 묶음에 들어갈 항목이 없습니다."
            title="오늘 마감 묶음이 없습니다."
          />
        ) : (
          <div className="route-card-grid">
            {selection.todayItems.map((item) =>
              renderTodoCard(workspaceView.family.slug, timezone, item, selection),
            )}
          </div>
        )}
      </PageShell>
    );
  }

  if (routeSegments.length === 1 && routeSegments[0] === "new") {
    return (
      <PageShell
        eyebrow={`${workspaceView.family.name} Todo`}
        title="새 할 일 만들기"
        subtitle="입력 후 목록, today 묶음, home 카드가 같은 규칙으로 다시 계산됩니다."
        actions={
          <ModuleHeaderActions
            familySlug={workspaceView.family.slug}
            listLabel="할 일 목록"
            moduleSegment="todo"
            newLabel="새 할 일"
          />
        }
      >
        <ModuleNoticeCard error={searchParams.error} state={searchParams.state} />
        <div className="grid-two">
          <SurfaceCard title="할 일 입력">
            <TodoItemForm
              action={createTodoItemAction}
              familySlug={workspaceView.family.slug}
              submitLabel="할 일 저장"
              timezone={timezone}
            />
          </SurfaceCard>
          <ModuleRuleListCard
            description="가족 공용과 개인 blocker가 어떤 식으로 today / focus 카드로 나뉘는지 함께 확인합니다."
            rules={todoHomeCardRules}
            title="입력 전에 볼 규칙"
          />
        </div>
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
        eyebrow={`${workspaceView.family.name} Todo`}
        title={item.title}
        subtitle="상세에서 수정, 삭제, home 반영 상태를 함께 확인할 수 있습니다."
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
            title="할 일 상세"
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
                <dt>노출 범위</dt>
                <dd>{formatVisibilityScopeLabel(item.visibilityScope)}</dd>
              </div>
              <div className="fact-grid__item">
                <dt>담당자</dt>
                <dd>{item.assigneeLabel ?? "-"}</dd>
              </div>
              <div className="fact-grid__item">
                <dt>완료</dt>
                <dd>{item.completed ? "완료" : "진행 중"}</dd>
              </div>
              <div className="fact-grid__item">
                <dt>blocker</dt>
                <dd>{item.blocksFamilyFlow ? "가족 흐름 영향" : "개별 관리"}</dd>
              </div>
            </dl>
          </SurfaceCard>

          <SurfaceCard
            title="home 연결 상태"
            description="today와 focus 카드 분기 결과입니다."
            badge={<StatusPill tone={isFocus ? "warm" : "accent"}>{isFocus ? "focus" : "status"}</StatusPill>}
          >
            <div className="pill-row">
              {isOverdue ? <StatusPill tone="warm">지연 today 묶음</StatusPill> : null}
              {!isOverdue && isToday ? <StatusPill tone="accent">오늘 마감 묶음</StatusPill> : null}
              {isFocus ? <StatusPill tone="warm">focus 후보</StatusPill> : null}
              {!isOverdue && !isToday && !isFocus ? <StatusPill>home 미노출</StatusPill> : null}
            </div>
            <p className="feature-copy">
              홈에서는 <Link href={`/app/${workspaceView.family.slug}/todo/overdue`}>지연 묶음</Link>과{" "}
              <Link href={`/app/${workspaceView.family.slug}/todo/today`}>오늘 묶음</Link>, 개인 focus 상세로 각각 이어집니다.
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
        eyebrow={`${workspaceView.family.name} Todo`}
        title="할 일 수정"
        subtitle="같은 폼으로 수정 후 상세와 home 묶음 반영을 다시 확인할 수 있습니다."
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
        <div className="grid-two">
          <SurfaceCard title="할 일 수정 폼">
            <TodoItemForm
              action={updateTodoItemAction}
              familySlug={workspaceView.family.slug}
              submitLabel="할 일 수정 저장"
              timezone={timezone}
              todo={item}
            />
          </SurfaceCard>
          <SurfaceCard
            title="현재 home 상태"
            description="수정 전에 계산된 today / focus 상태를 미리 보여 줍니다."
          >
            {renderTodoCard(workspaceView.family.slug, timezone, item, selection)}
          </SurfaceCard>
        </div>
      </PageShell>
    );
  }

  notFound();
}
