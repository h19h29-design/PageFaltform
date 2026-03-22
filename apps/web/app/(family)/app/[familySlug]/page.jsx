import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { HeroCard, MetricList, PageShell, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";
import { signOutFamilyAction } from "../../../../src/actions/session-actions";
import { buildDashboardViewModel } from "../../../../src/lib/dashboard-fixtures";
import { getConsoleFamilyBySlug } from "../../../../src/lib/family-sites-store";
import { getEffectiveFamilyWorkspace } from "../../../../src/lib/family-workspace";
import { getActiveConsoleSessionForFamily, getActiveFamilyAccessSessionForSlug, } from "../../../../src/lib/server-sessions";
import { createFamilySceneStyle } from "../../../../src/lib/theme-scene";
export default async function FamilyHomePage(props) {
    const { familySlug } = await props.params;
    const workspaceView = await getEffectiveFamilyWorkspace(familySlug);
    if (!workspaceView) {
        notFound();
    }
    const familySession = await getActiveFamilyAccessSessionForSlug(workspaceView.family.slug);
    const consoleSession = await getActiveConsoleSessionForFamily(workspaceView.family.slug);
    const consoleAccess = consoleSession ? await getConsoleFamilyBySlug(consoleSession, workspaceView.family.slug) : null;
    const hasConsoleBypass = Boolean(consoleAccess?.canManage);
    if (!familySession && !hasConsoleBypass) {
        redirect(`/f/${workspaceView.family.slug}?step=access&error=session-expired`);
    }
    const viewerRole = consoleAccess?.role ?? familySession?.viewerRole ?? "guest";
    const dashboard = buildDashboardViewModel({
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
    return (<div className="family-scene" style={createFamilySceneStyle(workspaceView.family.theme)}>
      <PageShell eyebrow={`${workspaceView.family.name} Home`} title={`${workspaceView.family.name} 가족 홈`} subtitle={`${workspaceView.homePresetDescription} 프리셋과 활성 모듈 순서, 실제 모듈 feed 합성이 함께 반영된 가족 홈입니다.`} actions={<div className="inline-actions">
            {consoleAccess?.canManage ? (<Link className="button button--secondary" href={`/console/families/${workspaceView.family.slug}`}>
                구성 빌더
              </Link>) : null}
            <form action={signOutFamilyAction}>
              <input name="familySlug" type="hidden" value={workspaceView.family.slug}/>
              <button className="button button--ghost" type="submit">
                가족 입장 종료
              </button>
            </form>
          </div>}>
        <HeroCard eyebrow={dashboard.heroBadge} title={dashboard.heroTitle} subtitle={dashboard.heroSummary} meta={<>
              <StatusPill tone="accent">viewer role: {viewerRole}</StatusPill>
              <StatusPill>{workspaceView.family.timezone}</StatusPill>
              <StatusPill tone="warm">{workspaceView.entryPresetLabel}</StatusPill>
              {workspaceView.family.source === "custom" ? <StatusPill>mini family</StatusPill> : null}
            </>}>
          <SurfaceCard title="홈 구성 요약" description="현재 저장된 프리셋과 모듈 조합이 메인 카드 흐름을 어떻게 만드는지 요약합니다." tone="accent">
            <MetricList items={dashboard.glance}/>
          </SurfaceCard>
        </HeroCard>

        <div className="grid-two">
          <SurfaceCard title="지금 홈에서 먼저 읽히는 흐름" description="가족이 들어왔을 때 가장 먼저 느끼게 되는 우선순위를 짧게 요약했습니다.">
            <ul className="stack-list">
              {dashboard.highlights.map((highlight) => (<li key={highlight}>{highlight}</li>))}
            </ul>
          </SurfaceCard>

          <SurfaceCard title="활성 모듈" description={`${workspaceView.family.memberCount}명이 함께 쓰는 현재 구성입니다.`} badge={<StatusPill>{workspaceView.workspace.enabledModules.length} modules</StatusPill>}>
            <div className="pill-row">
              {workspaceView.moduleDescriptors.map((module) => (<span className="module-pill" key={module.key}>
                  {module.label}
                </span>))}
            </div>

            <dl className="fact-grid">
              <div className="fact-grid__item">
                <dt>홈 프리셋</dt>
                <dd>{workspaceView.homePresetLabel}</dd>
              </div>
              <div className="fact-grid__item">
                <dt>입장 흐름</dt>
                <dd>{workspaceView.entryPresetLabel}</dd>
              </div>
              <div className="fact-grid__item">
                <dt>첫 노출 모듈</dt>
                <dd>{workspaceView.moduleDescriptors[0]?.label ?? "-"}</dd>
              </div>
              <div className="fact-grid__item">
                <dt>가족 구성</dt>
                <dd>{workspaceView.family.memberCount}명</dd>
              </div>
            </dl>
          </SurfaceCard>
        </div>

        <section className="surface-stack">
          <SectionHeader kicker="Dashboard" title="실제 모듈 피드를 합성한 메인 카드"/>
          <div className="surface-stack">
            {dashboard.sections.map((section) => (<SurfaceCard key={section.title} title={section.title} description={section.description} eyebrow={section.kicker} badge={<StatusPill>{section.cards.length} cards</StatusPill>}>
                <div className="dashboard-section-grid">
                  {section.cards.map((card) => (<SurfaceCard key={`${section.kicker}-${card.title}`} title={card.title} description={card.description} badge={<StatusPill tone={card.tone === "warm"
                        ? "warm"
                        : card.tone === "accent"
                            ? "accent"
                            : "neutral"}>
                          {card.badge}
                        </StatusPill>} tone={card.tone}>
                      <p className="card-meta">{card.meta}</p>
                    </SurfaceCard>))}
                </div>
              </SurfaceCard>))}
          </div>
        </section>
      </PageShell>
    </div>);
}
