import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { authFlowDefinitions } from "@ysplan/auth";
import { HeroCard, MetricList, PageShell, StatusPill, SurfaceCard } from "@ysplan/ui";
import { getFamilyAccessErrorMessage } from "../../../../src/lib/messages";
import { getEffectiveFamilyWorkspace } from "../../../../src/lib/family-workspace";
import { getActiveFamilyAccessSessionForSlug } from "../../../../src/lib/server-sessions";
import { createFamilySceneStyle } from "../../../../src/lib/theme-scene";
import { submitFamilyAccessAction } from "./actions";
export default async function FamilyEntryPage(props) {
    const { familySlug } = await props.params;
    const searchParams = await props.searchParams;
    const workspaceView = await getEffectiveFamilyWorkspace(familySlug);
    if (!workspaceView) {
        notFound();
    }
    const activeSession = await getActiveFamilyAccessSessionForSlug(workspaceView.family.slug);
    if (activeSession) {
        redirect(`/app/${workspaceView.family.slug}`);
    }
    const errorMessage = getFamilyAccessErrorMessage(searchParams.error);
    const showAccessForm = workspaceView.workspace.entryPreset === "direct" || searchParams.step === "access";
    const primaryModule = workspaceView.moduleDescriptors[0];
    const familyAccessFlow = authFlowDefinitions.familyAccess;
    return (<div className="family-scene" style={createFamilySceneStyle(workspaceView.family.theme)}>
      <PageShell eyebrow={`${workspaceView.family.name} Entry`} title={showAccessForm ? `${workspaceView.family.name} 입장 확인` : `${workspaceView.family.name} 입구`} subtitle={workspaceView.family.heroSummary} actions={<div className="inline-actions">
            <Link className="button button--ghost" href="/">
              다른 가족 둘러보기
            </Link>
            <Link className="button button--secondary" href="/console/sign-in">
              관리자 로그인
            </Link>
          </div>}>
        <HeroCard eyebrow={workspaceView.entryPresetLabel} title={workspaceView.family.welcomeMessage} subtitle={`${workspaceView.entryPresetDescription} 현재 홈 첫 모듈은 ${primaryModule?.label ?? "기본 모듈"} 입니다.`} meta={<>
              <StatusPill tone="accent">{workspaceView.family.accessPolicy.label}</StatusPill>
              <StatusPill>{workspaceView.homePresetLabel}</StatusPill>
              <StatusPill tone="warm">{workspaceView.family.memberCount}명 가족</StatusPill>
            </>} actions={showAccessForm ? (<Link className="button button--ghost" href={`/f/${workspaceView.family.slug}`}>
                입구 미리 보기로 돌아가기
              </Link>) : (<div className="inline-actions">
                <Link className="button button--primary" href={`/f/${workspaceView.family.slug}?step=access`}>
                  입장 확인하기
                </Link>
                <Link className="button button--secondary" href={`/app/${workspaceView.family.slug}`}>
                  홈 미리 보기
                </Link>
              </div>)}>
          <SurfaceCard title="현재 가족 설정" description="콘솔에서 정한 입장 흐름과 홈 구성이 여기서 바로 반영됩니다." tone="warm">
            <MetricList items={[
            { label: "활성 모듈", value: `${workspaceView.workspace.enabledModules.length}개` },
            { label: "입장 흐름", value: workspaceView.entryPresetLabel },
            { label: "홈 프리셋", value: workspaceView.homePresetLabel },
            { label: "첫 모듈", value: primaryModule?.label ?? "-" },
        ]}/>
          </SurfaceCard>
        </HeroCard>

        <div className="grid-two">
          <SurfaceCard title={showAccessForm ? "가족 확인" : "입장 전 안내"} description={showAccessForm
            ? workspaceView.family.accessPolicy.helperText
            : "먼저 가족 분위기와 현재 켜진 모듈 구성을 보고, 필요할 때 입장 확인으로 넘어가도록 설계했습니다."} badge={errorMessage ? <StatusPill tone="danger">다시 확인 필요</StatusPill> : null} tone={showAccessForm ? "accent" : undefined}>
            {showAccessForm ? (<form action={submitFamilyAccessAction} className="form-stack">
                <input name="familySlug" type="hidden" value={workspaceView.family.slug}/>
                <label className="form-label">
                  {workspaceView.family.accessPolicy.label}
                  <input autoComplete="off" className="text-input" name="secret" placeholder="입장 비밀번호 또는 코드를 입력해 주세요" type="password"/>
                </label>

                <div className="access-secret">
                  <span className="eyebrow">Demo Hint</span>
                  <strong>{workspaceView.family.accessPolicy.secret}</strong>
                  <span className="helper-text">로컬 테스트를 위한 예시 값입니다.</span>
                </div>

                {errorMessage ? <p className="helper-text">{errorMessage}</p> : null}

                <div className="surface-note">
                  <p>
                    <strong>{familyAccessFlow.title}</strong> · {familyAccessFlow.audienceLabel}
                  </p>
                  <p>세션 유지 시간: {familyAccessFlow.sessionDurationHours}시간</p>
                  <p>{familyAccessFlow.grants[0]}</p>
                  <p>{familyAccessFlow.denies[0]}</p>
                </div>

                <div className="inline-actions">
                  <button className="button button--primary" type="submit">
                    가족 홈으로 이동
                  </button>
                  <Link className="button button--secondary" href="/console/sign-in">
                    관리자 로그인
                  </Link>
                </div>
              </form>) : (<ol className="journey-list">
                {workspaceView.family.entryChecklist.map((step, index) => (<li className="journey-list__item" key={step.title}>
                    <span className="journey-list__number">{index + 1}</span>
                    <div>
                      <strong>{step.title}</strong>
                      <p className="feature-copy">{step.description}</p>
                    </div>
                  </li>))}
              </ol>)}
          </SurfaceCard>

          <SurfaceCard title="들어가면 바로 보이는 모듈" description="가족별로 켜 둔 모듈과 순서가 그대로 홈 화면 흐름을 결정합니다." badge={<StatusPill>{workspaceView.workspace.enabledModules.length} modules</StatusPill>}>
            <div className="pill-row">
              {workspaceView.moduleDescriptors.map((module) => (<span className="module-pill" key={module.key}>
                  {module.label}
                </span>))}
            </div>

            <ol className="builder-preview-list">
              {workspaceView.moduleDescriptors.map((module, index) => (<li className="builder-preview-item" key={module.key}>
                  <strong>
                    {index + 1}. {module.label}
                  </strong>
                  <p className="feature-copy">{module.description}</p>
                </li>))}
            </ol>

            <div className="surface-note">
              <p>
                홈은 <strong>{workspaceView.homePresetLabel}</strong> 으로, 입구는{" "}
                <strong>{workspaceView.entryPresetLabel}</strong> 으로 설정되어 있습니다.
              </p>
            </div>
          </SurfaceCard>
        </div>
      </PageShell>
    </div>);
}
