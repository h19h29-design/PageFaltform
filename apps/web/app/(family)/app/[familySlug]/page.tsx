import Link from "next/link";
import { notFound } from "next/navigation";

import { MetricList, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import { FamilyAppShell } from "src/components/family-app-shell";
import { buildDashboardViewModel } from "src/lib/dashboard-fixtures";
import { requireFamilyAppAccess } from "src/lib/family-app-context";
import {
  buildFamilyBuilderHref,
  buildFamilyMobilePreviewHref,
  buildFamilyModuleHref,
  buildFamilyModuleNewHref,
  listFamilyModuleRouteSpecs,
} from "src/lib/family-app-routes";

type FamilyHomePageProps = {
  params: Promise<{ familySlug: string }>;
};

const moduleGroupOrder = [
  {
    key: "content",
    title: "소식과 기록",
    description: "공지, 글, 갤러리, 일기를 중심으로 가족 기록을 쌓는 영역입니다.",
    modules: ["announcements", "posts", "gallery", "diary"],
  },
  {
    key: "planning",
    title: "일정과 준비",
    description: "일정, 체크리스트, 시간표, 하루 플래너처럼 당장 움직여야 할 정보를 모아둡니다.",
    modules: ["calendar", "todo", "school-timetable", "day-planner"],
  },
  {
    key: "growth",
    title: "목표와 루틴",
    description: "목표와 습관처럼 장기 흐름을 보는 영역입니다.",
    modules: ["progress", "habits"],
  },
] as const;

export default async function FamilyHomePage({ params }: FamilyHomePageProps) {
  const { familySlug } = await params;
  const { workspaceView, viewerRole, canManage } = await requireFamilyAppAccess(familySlug);

  if (!workspaceView) {
    notFound();
  }

  const dashboard = await buildDashboardViewModel({
    familySlug: workspaceView.family.slug,
    tenantId: workspaceView.family.id,
    familyName: workspaceView.family.name,
    heroSummary: workspaceView.family.heroSummary,
    householdMood: workspaceView.family.householdMood,
    memberCount: workspaceView.family.memberCount,
    enabledModules: workspaceView.workspace.enabledModules,
    homePreset: workspaceView.workspace.homePreset,
    timezone: workspaceView.family.timezone,
    viewerRole,
  });
  const enabledModuleSpecs = listFamilyModuleRouteSpecs(workspaceView.workspace.enabledModules);
  const enabledByKey = new Map(enabledModuleSpecs.map((spec) => [spec.moduleKey, spec]));

  return (
    <FamilyAppShell
      actions={
        <div className="inline-actions">
          <Link className="button button--secondary" href={buildFamilyMobilePreviewHref(workspaceView.family.slug)}>
            모바일 미리보기
          </Link>
          {canManage ? (
            <Link className="button button--ghost" href={buildFamilyBuilderHref(workspaceView.family.slug)}>
              빌더 열기
            </Link>
          ) : null}
        </div>
      }
      canManage={canManage}
      subtitle="지금 필요한 정보는 크게, 설명은 가볍게 보이도록 가족 홈을 정리했습니다."
      title={`${workspaceView.family.name} 가족 홈`}
      viewerRole={viewerRole}
      workspaceView={workspaceView}
    >
      <div className="grid-two">
        <SurfaceCard
          title="오늘 바로 볼 것"
          description="가장 먼저 챙겨야 할 정보만 짧게 보여줍니다."
          badge={<StatusPill tone="accent">{dashboard.heroBadge}</StatusPill>}
          tone="accent"
        >
          <div className="family-home-priority">
            <strong>{dashboard.heroTitle}</strong>
            <p>{dashboard.heroSummary}</p>
          </div>
          <MetricList items={dashboard.glance.slice(0, 4)} />
        </SurfaceCard>

        <SurfaceCard
          title="지금 홈 상태"
          description="테마와 홈 프리셋, 주요 분위기를 함께 확인합니다."
          badge={<StatusPill tone="warm">{workspaceView.themePresetLabel}</StatusPill>}
        >
          <div className="pill-row">
            <StatusPill>{workspaceView.homePresetLabel}</StatusPill>
            <StatusPill tone="warm">{workspaceView.entryPresetLabel}</StatusPill>
            <StatusPill>{workspaceView.family.memberCount}명</StatusPill>
          </div>
          <ul className="stack-list compact-list">
            {dashboard.highlights.slice(0, 3).map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </SurfaceCard>
      </div>

      {moduleGroupOrder.map((group) => {
        const specs = group.modules
          .map((moduleKey) => enabledByKey.get(moduleKey))
          .filter((spec): spec is NonNullable<typeof spec> => Boolean(spec));

        if (specs.length === 0) {
          return null;
        }

        return (
          <section className="surface-stack" key={group.key}>
            <SectionHeader
              kicker="게시판"
              title={group.title}
              action={<StatusPill tone="accent">{specs.length}개 사용 중</StatusPill>}
            />
            <p className="section-support">{group.description}</p>
            <div className="route-card-grid module-hub-grid">
              {specs.map((spec) => (
                <SurfaceCard
                  key={spec.moduleKey}
                  title={spec.label}
                  description={spec.summary}
                  badge={<StatusPill tone="accent">사용 중</StatusPill>}
                  className="module-hub-card"
                  footer={
                    <div className="inline-actions">
                      <Link className="button button--secondary button--small" href={buildFamilyModuleHref(workspaceView.family.slug, spec.moduleKey)}>
                        목록 보기
                      </Link>
                      <Link className="button button--ghost button--small" href={buildFamilyModuleNewHref(workspaceView.family.slug, spec.moduleKey)}>
                        새로 만들기
                      </Link>
                    </div>
                  }
                >
                  <p className="module-hub-card__copy">{spec.description}</p>
                </SurfaceCard>
              ))}
            </div>
          </section>
        );
      })}

      <section className="surface-stack">
        <SectionHeader
          kicker="홈 카드"
          title="실제 홈에 걸리는 카드"
          action={<StatusPill>{dashboard.sections.length}개 구역</StatusPill>}
        />
        <div className="surface-stack">
          {dashboard.sections.map((section) => (
            <SurfaceCard
              key={section.title}
              title={section.title}
              description={section.description}
              eyebrow={section.kicker}
              badge={<StatusPill>{section.cards.length}개</StatusPill>}
            >
              <div className="dashboard-section-grid">
                {section.cards.map((card) => (
                  <Link className="dashboard-card-link" href={card.href} key={`${section.kicker}-${card.href}`}>
                    <SurfaceCard
                      title={card.title}
                      description={card.description}
                      badge={
                        <StatusPill
                          tone={
                            card.tone === "warm" ? "warm" : card.tone === "accent" ? "accent" : "neutral"
                          }
                        >
                          {card.badge}
                        </StatusPill>
                      }
                      tone={card.tone}
                      className="home-focus-card"
                    >
                      <p className="card-meta card-meta--strong">{card.meta}</p>
                    </SurfaceCard>
                  </Link>
                ))}
              </div>
            </SurfaceCard>
          ))}
        </div>
      </section>
    </FamilyAppShell>
  );
}
