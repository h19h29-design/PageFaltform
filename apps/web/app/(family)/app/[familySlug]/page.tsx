import Link from "next/link";
import { notFound } from "next/navigation";

import { HeroCard, MetricList, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import { buildDashboardViewModel } from "src/lib/dashboard-fixtures";
import { getFamilyAppView } from "src/lib/family-app-view";
import {
  buildFamilyModuleHref,
  buildFamilyModuleNewHref,
  listFamilyModuleRouteSpecs,
} from "src/lib/family-app-routes";

type FamilyHomePageProps = {
  params: Promise<{ familySlug: string }>;
};

export default async function FamilyHomePage({ params }: FamilyHomePageProps) {
  const { familySlug } = await params;
  const familyAppView = await getFamilyAppView(familySlug);

  if (!familyAppView) {
    notFound();
  }

  const { workspaceView, viewerRole, canManage } = familyAppView;
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
  const availableModuleSpecs = listFamilyModuleRouteSpecs().filter(
    (spec) => !workspaceView.workspace.enabledModules.includes(spec.moduleKey),
  );

  return (
    <div className="surface-stack">
      <HeroCard
        eyebrow={dashboard.heroBadge}
        title={dashboard.heroTitle}
        subtitle={dashboard.heroSummary}
        meta={
          <>
            <StatusPill tone="accent">{workspaceView.homePresetLabel}</StatusPill>
            <StatusPill>{workspaceView.entryPresetLabel}</StatusPill>
            <StatusPill tone="warm">{workspaceView.family.memberCount}명</StatusPill>
          </>
        }
        actions={
          <div className="inline-actions">
            {enabledModuleSpecs[0] ? (
              <Link
                className="button button--primary"
                href={buildFamilyModuleHref(workspaceView.family.slug, enabledModuleSpecs[0].moduleKey)}
              >
                첫 게시판 열기
              </Link>
            ) : null}
            {canManage ? (
              <Link className="button button--secondary" href={`/console/families/${workspaceView.family.slug}`}>
                빌더 설정
              </Link>
            ) : null}
          </div>
        }
      >
        <SurfaceCard
          title="한눈에 보기"
          description="홈 카드, 활성 모듈, 제품 경로가 모두 같은 가족 워크스페이스를 기준으로 읽힙니다."
          tone="accent"
        >
          <MetricList items={dashboard.glance} />
        </SurfaceCard>
      </HeroCard>

      <div className="grid-two">
        <SurfaceCard
          title="현재 홈 반영 상태"
          description="지금 홈 피드와 가족 앱 순서를 결정하는 기준입니다."
        >
          <ul className="stack-list">
            {dashboard.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </SurfaceCard>

        <SurfaceCard
          title="이동 흐름"
          description="콘솔, 입장, 홈, 게시판 페이지가 하나의 경로 구조로 이어집니다."
        >
          <ul className="stack-list">
            <li>
              가족 입장은 <strong>/f/{workspaceView.family.slug}</strong> 입니다.
            </li>
            <li>
              가족 앱 홈은 <strong>/app/{workspaceView.family.slug}</strong> 입니다.
            </li>
            <li>활성 모듈마다 목록, 상세, 작성, 수정 경로가 모두 준비돼 있습니다.</li>
          </ul>
        </SurfaceCard>
      </div>

      <section className="surface-stack">
        <SectionHeader
          kicker="게시판"
          title="바로 테스트할 게시판"
          action={<StatusPill tone="accent">{enabledModuleSpecs.length}개 활성</StatusPill>}
        />
        <div className="route-card-grid">
          {enabledModuleSpecs.map((spec) => (
            <SurfaceCard
              key={spec.moduleKey}
              title={spec.label}
              description={spec.summary}
              badge={<StatusPill tone="accent">사용 중</StatusPill>}
              footer={
                <div className="inline-actions">
                  <Link className="button button--secondary button--small" href={buildFamilyModuleHref(workspaceView.family.slug, spec.moduleKey)}>
                    열기
                  </Link>
                  <Link className="button button--ghost button--small" href={buildFamilyModuleNewHref(workspaceView.family.slug, spec.moduleKey)}>
                    새 글/항목
                  </Link>
                </div>
              }
            >
              <p className="feature-copy">{spec.description}</p>
            </SurfaceCard>
          ))}
        </div>
      </section>

      <section className="surface-stack">
        <SectionHeader
          kicker="추가 게시판"
          title="지금은 꺼져 있지만 열 수 있는 게시판"
          action={<StatusPill>{availableModuleSpecs.length}개</StatusPill>}
        />
        <div className="route-card-grid">
          {availableModuleSpecs.map((spec) => (
            <SurfaceCard
              key={spec.moduleKey}
              title={spec.label}
              description={spec.description}
              badge={<StatusPill tone="warm">빌더에서 꺼짐</StatusPill>}
              footer={
                <Link className="button button--secondary button--small" href={buildFamilyModuleHref(workspaceView.family.slug, spec.moduleKey)}>
                  경로 열기
                </Link>
              }
            >
              <p className="feature-copy">{spec.summary}</p>
            </SurfaceCard>
          ))}
        </div>
      </section>

      <section className="surface-stack">
        <SectionHeader
          kicker="홈 카드"
          title="현재 보이는 홈 섹션"
          action={<StatusPill>{dashboard.sections.length}개 섹션</StatusPill>}
        />
        <div className="surface-stack">
          {dashboard.sections.map((section) => (
            <SurfaceCard
              key={section.title}
              title={section.title}
              description={section.description}
              eyebrow={section.kicker}
              badge={<StatusPill>{section.cards.length}장</StatusPill>}
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
                      >
                        <p className="card-meta">{card.meta}</p>
                      </SurfaceCard>
                    </Link>
                  ))}
                </div>
              </SurfaceCard>
          ))}
        </div>
      </section>
    </div>
  );
}
