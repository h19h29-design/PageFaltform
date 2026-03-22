import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { authFlowDefinitions } from "@ysplan/auth";
import { HeroCard, MetricList, PageShell, StatusPill, SurfaceCard } from "@ysplan/ui";

import { getFamilyAccessErrorMessage } from "../../../../src/lib/messages";
import { getEffectiveFamilyWorkspace } from "../../../../src/lib/family-workspace";
import { buildFamilyModuleHref } from "../../../../src/lib/family-app-routes";
import { getActiveFamilyAccessSessionForSlug } from "../../../../src/lib/server-sessions";
import { createFamilySceneStyle } from "../../../../src/lib/theme-scene";
import { submitFamilyAccessAction } from "./actions";

type FamilyEntryPageProps = {
  params: Promise<{ familySlug: string }>;
  searchParams: Promise<{ step?: string; error?: string }>;
};

export default async function FamilyEntryPage({ params, searchParams }: FamilyEntryPageProps) {
  const { familySlug } = await params;
  const resolvedSearchParams = await searchParams;
  const workspaceView = await getEffectiveFamilyWorkspace(familySlug);

  if (!workspaceView) {
    notFound();
  }

  const activeSession = await getActiveFamilyAccessSessionForSlug(workspaceView.family.slug);

  if (activeSession) {
    redirect(`/app/${workspaceView.family.slug}`);
  }

  const errorMessage = getFamilyAccessErrorMessage(resolvedSearchParams.error);
  const showAccessForm =
    workspaceView.workspace.entryPreset === "direct" || resolvedSearchParams.step === "access";
  const primaryModule = workspaceView.moduleDescriptors[0];
  const familyAccessFlow = authFlowDefinitions.familyAccess;

  return (
    <div className="family-scene" style={createFamilySceneStyle(workspaceView.family.theme)}>
      <PageShell
        eyebrow={`${workspaceView.family.name} 입장`}
        title={showAccessForm ? `${workspaceView.family.name} 입장 확인` : `${workspaceView.family.name} 가족 입구`}
        subtitle={workspaceView.family.heroSummary}
        actions={
          <div className="inline-actions">
            <Link className="button button--ghost" href="/">
              가족 목록
            </Link>
            <Link className="button button--secondary" href="/console/sign-in">
              콘솔 로그인
            </Link>
          </div>
        }
      >
        <HeroCard
          eyebrow={workspaceView.entryPresetLabel}
          title={workspaceView.family.welcomeMessage}
          subtitle={`${workspaceView.entryPresetDescription} 첫 게시판은 ${primaryModule?.label ?? "공지"} 입니다.`}
          meta={
            <>
              <StatusPill tone="accent">{workspaceView.family.accessPolicy.label}</StatusPill>
              <StatusPill>{workspaceView.homePresetLabel}</StatusPill>
              <StatusPill tone="warm">{workspaceView.family.memberCount}명</StatusPill>
            </>
          }
          actions={
            showAccessForm ? (
              <Link className="button button--ghost" href={`/f/${workspaceView.family.slug}`}>
                미리보기로 돌아가기
              </Link>
            ) : (
              <div className="inline-actions">
                <Link className="button button--primary" href={`/f/${workspaceView.family.slug}?step=access`}>
                  가족 앱 입장
                </Link>
                <Link className="button button--secondary" href={`/app/${workspaceView.family.slug}`}>
                  앱 경로 열기
                </Link>
              </div>
            )
          }
        >
          <SurfaceCard
            title="현재 설정"
            description="빌더에서 바꾼 프리셋과 모듈 순서가 이 입장 화면에도 바로 반영됩니다."
            tone="warm"
          >
            <MetricList
              items={[
                { label: "활성 모듈", value: `${workspaceView.workspace.enabledModules.length}개` },
                { label: "입장 프리셋", value: workspaceView.entryPresetLabel },
                { label: "홈 프리셋", value: workspaceView.homePresetLabel },
                { label: "첫 게시판", value: primaryModule?.label ?? "공지" },
              ]}
            />
          </SurfaceCard>
        </HeroCard>

        <div className="grid-two">
          <SurfaceCard
            title={showAccessForm ? "가족 입장" : "입장 흐름"}
            description={
              showAccessForm
                ? workspaceView.family.accessPolicy.helperText
                : "현재 모듈 순서를 먼저 보고, 실제 가족 앱으로 들어갑니다."
            }
            badge={errorMessage ? <StatusPill tone="danger">확인 필요</StatusPill> : null}
            tone={showAccessForm ? "accent" : undefined}
          >
            {showAccessForm ? (
              <form action={submitFamilyAccessAction} className="form-stack">
                <input name="familySlug" type="hidden" value={workspaceView.family.slug} />
                <label className="form-label">
                  {workspaceView.family.accessPolicy.label}
                  <input
                    autoComplete="off"
                    className="text-input"
                    name="secret"
                    placeholder="가족 비밀번호 또는 코드를 입력하세요"
                    type="password"
                  />
                </label>

                {workspaceView.family.accessPolicy.secret ? (
                  <div className="access-secret">
                    <span className="eyebrow">테스트 힌트</span>
                    <strong>{workspaceView.family.accessPolicy.secret}</strong>
                    <span className="helper-text">로컬 테스트 중에만 보이는 안내입니다.</span>
                  </div>
                ) : (
                  <div className="surface-note">
                    <p>DB 기반 가족 홈은 공유 비밀번호 힌트를 화면에 보여주지 않습니다.</p>
                    <p>콘솔에서 설정한 값이나 부트스트랩 메모를 사용해 주세요.</p>
                  </div>
                )}

                {errorMessage ? <p className="helper-text">{errorMessage}</p> : null}

                <div className="surface-note">
                  <p>
                    <strong>{familyAccessFlow.title}</strong> - {familyAccessFlow.audienceLabel}
                  </p>
                  <p>세션 시간: {familyAccessFlow.sessionDurationHours}시간</p>
                  <p>{familyAccessFlow.grants[0]}</p>
                  <p>{familyAccessFlow.denies[0]}</p>
                </div>

                <div className="inline-actions">
                  <button className="button button--primary" type="submit">
                    가족 앱으로 가기
                  </button>
                  <Link className="button button--secondary" href="/console/sign-in">
                    관리자 콘솔
                  </Link>
                </div>
              </form>
            ) : (
              <ol className="journey-list">
                {workspaceView.family.entryChecklist.map((step, index) => (
                  <li className="journey-list__item" key={step.title}>
                    <span className="journey-list__number">{index + 1}</span>
                    <div>
                      <strong>{step.title}</strong>
                      <p className="feature-copy">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </SurfaceCard>

          <SurfaceCard
            title="게시판 순서"
            description="같은 순서가 가족 앱 메뉴와 게시판 런처에도 그대로 반영됩니다."
            badge={<StatusPill>{workspaceView.workspace.enabledModules.length}개 모듈</StatusPill>}
          >
            <div className="pill-row">
              {workspaceView.moduleDescriptors.map((module) => (
                <span className="module-pill" key={module.key}>
                  {module.label}
                </span>
              ))}
            </div>

            <ol className="builder-preview-list">
              {workspaceView.moduleDescriptors.map((module, index) => (
                <li className="builder-preview-item" key={module.key}>
                  <strong>
                    {index + 1}. {module.label}
                  </strong>
                  <p className="feature-copy">{module.description}</p>
                </li>
              ))}
            </ol>

            {primaryModule ? (
              <div className="surface-note">
                <p>
                  첫 게시판 경로:{" "}
                  <Link href={buildFamilyModuleHref(workspaceView.family.slug, primaryModule.key)}>
                    /app/{workspaceView.family.slug}/{primaryModule.key}
                  </Link>
                </p>
              </div>
            ) : null}
          </SurfaceCard>
        </div>
      </PageShell>
    </div>
  );
}
