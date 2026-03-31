import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import { FamilyAppShell } from "src/components/family-app-shell";
import { buildDashboardViewModel } from "src/lib/dashboard-fixtures";
import { requireFamilyAppAccess } from "src/lib/family-app-context";
import {
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
    title: "공지와 기록",
    modules: ["announcements", "posts", "gallery", "diary"],
  },
  {
    key: "planning",
    title: "일정과 준비",
    modules: ["calendar", "todo", "school-timetable", "day-planner"],
  },
  {
    key: "growth",
    title: "목표와 루틴",
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
  const leadSection = dashboard.sections[0];

  return (
    <FamilyAppShell
      actions={
        <div className="inline-actions">
          <Link
            className="button button--secondary"
            href={buildFamilyMobilePreviewHref(workspaceView.family.slug)}
          >
            모바일 미리보기
          </Link>
        </div>
      }
      canManage={canManage}
      subtitle="지금 필요한 보드와 게시판만 바로 엽니다."
      title={`${workspaceView.family.name} 가족 홈`}
      viewerRole={viewerRole}
      workspaceView={workspaceView}
    >
      {leadSection ? (
        <section className="surface-stack">
          <SectionHeader
            kicker="메인 카드"
            title={leadSection.title}
            action={<StatusPill tone="accent">{leadSection.cards.length}개</StatusPill>}
          />
          <div className="dashboard-section-grid">
            {leadSection.cards.map((card) => (
              <Link className="dashboard-card-link" href={card.href} key={`${leadSection.kicker}-${card.href}`}>
                <SurfaceCard
                  title={card.title}
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
        </section>
      ) : null}

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
            <div className="route-card-grid module-hub-grid">
              {specs.map((spec) => (
                <SurfaceCard
                  key={spec.moduleKey}
                  title={spec.label}
                  badge={<StatusPill tone="accent">사용 중</StatusPill>}
                  className="module-hub-card"
                  footer={
                    <div className="inline-actions">
                      <Link
                        className="button button--secondary button--small"
                        href={buildFamilyModuleHref(workspaceView.family.slug, spec.moduleKey)}
                      >
                        열기
                      </Link>
                      <Link
                        className="button button--ghost button--small"
                        href={buildFamilyModuleNewHref(workspaceView.family.slug, spec.moduleKey)}
                      >
                        새로 만들기
                      </Link>
                    </div>
                  }
                />
              ))}
            </div>
          </section>
        );
      })}

      {dashboard.sections.length > 1 ? (
        <section className="surface-stack">
          <SectionHeader
            kicker="추가 카드"
            title="지금 뜨는 카드"
            action={<StatusPill>{dashboard.sections.length - 1}개 구역</StatusPill>}
          />
          <div className="surface-stack">
            {dashboard.sections.slice(1).map((section) => (
              <SurfaceCard
                key={section.title}
                title={section.title}
                eyebrow={section.kicker}
                badge={<StatusPill>{section.cards.length}개</StatusPill>}
              >
                <div className="dashboard-section-grid">
                  {section.cards.map((card) => (
                    <Link className="dashboard-card-link" href={card.href} key={`${section.kicker}-${card.href}`}>
                      <SurfaceCard
                        title={card.title}
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
      ) : null}
    </FamilyAppShell>
  );
}
