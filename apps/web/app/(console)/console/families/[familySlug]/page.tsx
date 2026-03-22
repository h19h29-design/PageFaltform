import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { coreModules } from "@ysplan/modules-core";
import { HeroCard, MetricList, PageShell, StatusPill, SurfaceCard } from "@ysplan/ui";

import { FamilyBuilderForm } from "../../../../../src/components/family-builder-form";
import {
  familyThemePresetOptions,
  getConsoleFamilyBySlug,
} from "../../../../../src/lib/family-sites-store";
import {
  getEffectiveFamilyWorkspace,
  getFamilyWorkspaceSummary,
} from "../../../../../src/lib/family-workspace";
import { buildFamilyMobilePreviewHref } from "../../../../../src/lib/family-app-routes";
import { getActiveConsoleSession } from "../../../../../src/lib/server-sessions";
import { resetFamilyWorkspaceAction, saveFamilyWorkspaceAction } from "./actions";

type FamilyBuilderPageProps = {
  params: Promise<{ familySlug: string }>;
  searchParams: Promise<{ state?: string }>;
};

function getStateMessage(state?: string): string | null {
  switch (state) {
    case "saved":
      return "가족 홈 구성이 저장되었습니다. 홈과 모바일 미리보기에서 바로 확인할 수 있습니다.";
    case "reset":
      return "기본 구성으로 되돌렸습니다.";
    case "created":
      return "새 미니 가족 홈이 만들어졌습니다. 이제 테마와 모듈 구성을 다듬어보세요.";
    default:
      return null;
  }
}

export default async function FamilyBuilderPage(props: FamilyBuilderPageProps) {
  const { familySlug } = await props.params;
  const searchParams = await props.searchParams;
  const consoleSession = await getActiveConsoleSession();

  if (!consoleSession) {
    redirect("/console/sign-in?error=session-required");
  }

  const familyAccess = await getConsoleFamilyBySlug(consoleSession, familySlug);

  if (!familyAccess?.canManage) {
    redirect("/console");
  }

  const workspaceView = await getEffectiveFamilyWorkspace(familySlug);

  if (!workspaceView) {
    notFound();
  }

  const enabledModuleKeys = new Set(workspaceView.workspace.enabledModules);
  const orderedCatalog = [
    ...workspaceView.workspace.enabledModules
      .map((moduleKey) => coreModules.find((module) => module.key === moduleKey))
      .filter((module): module is (typeof coreModules)[number] => Boolean(module)),
    ...coreModules.filter((module) => !enabledModuleKeys.has(module.key)),
  ];
  const stateMessage = getStateMessage(searchParams.state);

  return (
    <PageShell
      eyebrow="Family Builder"
      title={`${workspaceView.family.name} 구성 빌더`}
      subtitle="테마, 홈 프리셋, 입장 흐름, 모듈 순서를 한 화면에서 조정합니다."
      actions={
        <div className="inline-actions">
          <Link className="button button--ghost" href="/console">
            콘솔로 돌아가기
          </Link>
          <Link className="button button--secondary" href={`/f/${workspaceView.family.slug}`}>
            가족 입구
          </Link>
          <Link className="button button--secondary" href={buildFamilyMobilePreviewHref(workspaceView.family.slug)}>
            모바일 미리보기
          </Link>
          <Link className="button button--primary" href={`/app/${workspaceView.family.slug}`}>
            가족 앱 보기
          </Link>
        </div>
      }
    >
      <HeroCard
        eyebrow={workspaceView.family.source === "custom" ? "Mini Family" : "Demo Family"}
        title={`${workspaceView.family.name} 홈 구성 조정`}
        subtitle={`${getFamilyWorkspaceSummary(workspaceView)} 기준으로 현재 화면이 연결되어 있습니다.`}
        meta={
          <>
            <StatusPill tone="accent">{familyAccess.role}</StatusPill>
            <StatusPill>{workspaceView.homePresetLabel}</StatusPill>
            <StatusPill tone="warm">{workspaceView.entryPresetLabel}</StatusPill>
            <StatusPill>{workspaceView.themePresetLabel}</StatusPill>
          </>
        }
      >
        <SurfaceCard title="현재 구성 요약" description="먼저 열리는 모듈과 테마 상태를 빠르게 확인합니다.">
          <MetricList
            items={[
              { label: "사용 중 모듈", value: `${workspaceView.workspace.enabledModules.length}개` },
              { label: "첫 노출 모듈", value: workspaceView.moduleDescriptors[0]?.label ?? "-" },
              { label: "홈 프리셋", value: workspaceView.homePresetLabel },
              { label: "테마", value: workspaceView.themePresetLabel },
            ]}
          />
        </SurfaceCard>
      </HeroCard>

      {stateMessage ? (
        <div className="surface-note">
          <p>{stateMessage}</p>
        </div>
      ) : null}

      <div className="grid-two builder-summary-grid">
        <SurfaceCard
          title="현재 켜진 모듈"
          description="이 순서가 가족 홈의 모듈 버튼과 일부 카드 배치 우선순위에 반영됩니다."
          badge={<StatusPill>{workspaceView.workspace.enabledModules.length}개</StatusPill>}
        >
          <div className="pill-row">
            {workspaceView.moduleDescriptors.map((module) => (
              <span className="module-pill" key={module.key}>
                {module.label}
              </span>
            ))}
          </div>
          <p className="feature-copy">{workspaceView.homePresetDescription}</p>
        </SurfaceCard>

        <SurfaceCard
          title="테스트 주소"
          description="저장 직후 이 주소들에서 바로 확인할 수 있습니다."
          badge={<StatusPill tone="warm">{workspaceView.family.source === "custom" ? "custom" : "demo"}</StatusPill>}
        >
          <p className="feature-copy">
            가족 입구: <strong>/f/{workspaceView.family.slug}</strong>
          </p>
          <p className="feature-copy">
            가족 앱: <strong>/app/{workspaceView.family.slug}</strong>
          </p>
          <p className="feature-copy">
            모바일 미리보기: <strong>/preview/mobile/{workspaceView.family.slug}</strong>
          </p>
        </SurfaceCard>
      </div>

      <form action={saveFamilyWorkspaceAction} className="surface-stack">
        <input name="familySlug" type="hidden" value={workspaceView.family.slug} />
        <FamilyBuilderForm
          familyName={workspaceView.family.name}
          initialDraft={workspaceView.workspace}
          moduleCatalog={orderedCatalog}
          themeOptions={familyThemePresetOptions}
        />

        <div className="builder-save-row">
          <button className="button button--primary" type="submit">
            가족 홈 구성 저장
          </button>
          <Link className="button button--secondary" href={`/app/${workspaceView.family.slug}`}>
            적용 결과 보기
          </Link>
        </div>
      </form>

      <form action={resetFamilyWorkspaceAction} className="inline-actions">
        <input name="familySlug" type="hidden" value={workspaceView.family.slug} />
        <button className="button button--ghost" type="submit">
          기본값으로 되돌리기
        </button>
      </form>
    </PageShell>
  );
}
