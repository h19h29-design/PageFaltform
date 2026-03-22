import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { coreModules } from "@ysplan/modules-core";
import { HeroCard, MetricList, PageShell, StatusPill, SurfaceCard } from "@ysplan/ui";
import { FamilyBuilderForm } from "../../../../../src/components/family-builder-form";
import { getConsoleFamilyBySlug } from "../../../../../src/lib/family-sites-store";
import { getEffectiveFamilyWorkspace, getFamilyWorkspaceSummary, } from "../../../../../src/lib/family-workspace";
import { getActiveConsoleSession } from "../../../../../src/lib/server-sessions";
import { resetFamilyWorkspaceAction, saveFamilyWorkspaceAction } from "./actions";
export default async function FamilyBuilderPage(props) {
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
            .filter((module) => Boolean(module)),
        ...coreModules.filter((module) => !enabledModuleKeys.has(module.key)),
    ];
    const stateMessage = searchParams.state === "saved"
        ? "가족 홈 구성이 저장되었습니다. 다른 기기에서 접속해도 같은 화면을 볼 수 있습니다."
        : searchParams.state === "reset"
            ? "기본 구성으로 되돌렸습니다."
            : searchParams.state === "created"
                ? "새 미니 가족 홈이 만들어졌습니다. 이어서 모듈과 순서를 더 다듬어 보세요."
                : null;
    return (<PageShell eyebrow="Family Builder" title={`${workspaceView.family.name} 구성 빌더`} subtitle="가족별 모듈 조합과 순서, 홈 프리셋, 입장 흐름을 서버에 저장하는 편집 화면입니다." actions={<div className="inline-actions">
          <Link className="button button--ghost" href="/console">
            콘솔로 돌아가기
          </Link>
          <Link className="button button--secondary" href={`/f/${workspaceView.family.slug}`}>
            입구 보기
          </Link>
          <Link className="button button--primary" href={`/app/${workspaceView.family.slug}`}>
            홈 보기
          </Link>
        </div>}>
      <HeroCard eyebrow={workspaceView.family.source === "custom" ? "Custom Mini Home" : "Demo Base"} title={`${workspaceView.family.name} 홈과 입장을 조립하는 화면`} subtitle={`${getFamilyWorkspaceSummary(workspaceView)} 순서로 구성되어 있습니다. 저장하면 서버 파일에 기록되어 내부망에서 그대로 공유됩니다.`} meta={<>
            <StatusPill tone="accent">{familyAccess.role}</StatusPill>
            <StatusPill>{workspaceView.homePresetLabel}</StatusPill>
            <StatusPill tone="warm">{workspaceView.entryPresetLabel}</StatusPill>
          </>}>
        <SurfaceCard title="현재 구성 요약" description="가족 홈이 어떤 성격으로 보일지 한눈에 확인합니다.">
          <MetricList items={[
            { label: "활성 모듈", value: `${workspaceView.workspace.enabledModules.length}개` },
            { label: "첫 노출 모듈", value: workspaceView.moduleDescriptors[0]?.label ?? "-" },
            { label: "홈 프리셋", value: workspaceView.homePresetLabel },
            { label: "입장 흐름", value: workspaceView.entryPresetLabel },
        ]}/>
        </SurfaceCard>
      </HeroCard>

      {stateMessage ? (<div className="surface-note">
          <p>{stateMessage}</p>
        </div>) : null}

      <div className="grid-two builder-summary-grid">
        <SurfaceCard title="지금 켜진 모듈" description="이 순서대로 가족 홈 카드와 입구 안내가 정렬됩니다." badge={<StatusPill>{workspaceView.workspace.enabledModules.length} modules</StatusPill>}>
          <div className="pill-row">
            {workspaceView.moduleDescriptors.map((module) => (<span className="module-pill" key={module.key}>
                {module.label}
              </span>))}
          </div>
          <p className="feature-copy">{workspaceView.homePresetDescription}</p>
        </SurfaceCard>

        <SurfaceCard title="접속 정보" description="이 가족 홈은 내부망에서 아래 주소로 바로 열 수 있습니다." badge={<StatusPill tone="warm">{workspaceView.family.source === "custom" ? "custom" : "demo"}</StatusPill>}>
          <p className="feature-copy">
            입구: <strong>/f/{workspaceView.family.slug}</strong>
          </p>
          <p className="feature-copy">
            가족 홈: <strong>/app/{workspaceView.family.slug}</strong>
          </p>
          <p className="feature-copy">{workspaceView.entryPresetDescription}</p>
        </SurfaceCard>
      </div>

      <form action={saveFamilyWorkspaceAction} className="surface-stack">
        <input name="familySlug" type="hidden" value={workspaceView.family.slug}/>
        <FamilyBuilderForm familyName={workspaceView.family.name} initialDraft={workspaceView.workspace} moduleCatalog={orderedCatalog}/>

        <div className="builder-save-row">
          <button className="button button--primary" type="submit">
            가족 구성 저장
          </button>
          <Link className="button button--secondary" href={`/app/${workspaceView.family.slug}`}>
            저장 후 홈 확인
          </Link>
        </div>
      </form>

      <form action={resetFamilyWorkspaceAction} className="inline-actions">
        <input name="familySlug" type="hidden" value={workspaceView.family.slug}/>
        <button className="button button--ghost" type="submit">
          기본값으로 되돌리기
        </button>
      </form>
    </PageShell>);
}
