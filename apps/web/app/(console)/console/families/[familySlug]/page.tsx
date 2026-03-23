import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { coreModules } from "@ysplan/modules-core";
import { HeroCard, MetricList, PageShell, StatusPill, SurfaceCard } from "@ysplan/ui";

import {
  approveFamilyJoinRequestAction,
  rejectFamilyJoinRequestAction,
  resetFamilyWorkspaceAction,
  saveFamilyWorkspaceAction,
} from "./actions";
import { FamilyBuilderForm } from "../../../../../src/components/family-builder-form";
import { listFamilyJoinRequestsForFamily } from "../../../../../src/lib/family-join-requests";
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

type FamilyBuilderPageProps = {
  params: Promise<{ familySlug: string }>;
  searchParams: Promise<{ state?: string }>;
};

function getStateMessage(state?: string): string | null {
  switch (state) {
    case "saved":
      return "가족홈 설정이 저장되었습니다. 공개 범위와 모듈 순서, 테마가 바로 반영됩니다.";
    case "reset":
      return "가족홈 설정을 기본값으로 되돌렸습니다.";
    case "created":
      return "새 가족홈이 만들어졌습니다. 이제 공개 여부와 모듈 구성을 조절해 보세요.";
    case "request-approved":
      return "가입 신청을 승인했습니다. 해당 사용자는 바로 이 가족홈에 입장할 수 있습니다.";
    case "request-rejected":
      return "가입 신청을 거절했습니다.";
    default:
      return null;
  }
}

export default async function FamilyBuilderPage(
  props: FamilyBuilderPageProps,
) {
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

  const joinRequests = (await listFamilyJoinRequestsForFamily(familySlug)).filter(
    (request) => request.status === "pending",
  );
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
      eyebrow="가족홈 설정"
      title={`${workspaceView.family.name} 관리`}
      subtitle="공개 범위, 홈 구성, 테마, 모듈 순서를 한 번에 조절하고 가입 신청도 바로 승인할 수 있습니다."
      actions={
        <div className="inline-actions">
          <Link className="button button--ghost" href="/console">
            콘솔로 돌아가기
          </Link>
          <Link
            className="button button--secondary"
            href={buildFamilyMobilePreviewHref(workspaceView.family.slug)}
          >
            모바일 미리보기
          </Link>
          <Link
            className="button button--primary"
            href={`/app/${workspaceView.family.slug}`}
          >
            가족홈 보기
          </Link>
        </div>
      }
    >
      <HeroCard
        eyebrow={workspaceView.family.source === "custom" ? "사용자 가족홈" : "기본 데모 가족홈"}
        title={`${workspaceView.family.name} 설정 보드`}
        subtitle={getFamilyWorkspaceSummary(workspaceView)}
        meta={
          <>
            <StatusPill tone="accent">{familyAccess.role}</StatusPill>
            <StatusPill>
              {workspaceView.family.visibility === "private" ? "비공개" : "공개"}
            </StatusPill>
            <StatusPill tone="warm">{workspaceView.themePresetLabel}</StatusPill>
            <StatusPill>{joinRequests.length}개 신청 대기</StatusPill>
          </>
        }
      >
        <SurfaceCard title="현재 운영 요약" description="지금 테스트할 때 가장 중요한 상태만 먼저 보여줍니다.">
          <MetricList
            items={[
              {
                label: "활성 모듈",
                value: `${workspaceView.workspace.enabledModules.length}개`,
              },
              {
                label: "공개 범위",
                value:
                  workspaceView.family.visibility === "private"
                    ? "가입자만"
                    : "공개 미리보기",
              },
              {
                label: "첫 모듈",
                value: workspaceView.moduleDescriptors[0]?.label ?? "공지",
              },
              {
                label: "가입 신청",
                value: `${joinRequests.length}건`,
              },
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
          title="운영 옵션"
          description="비공개로 바꾸면 가입된 사람 외에는 목록에서도 보이지 않고 직접 접근도 막습니다."
          badge={
            <StatusPill tone={workspaceView.family.visibility === "private" ? "danger" : "accent"}>
              {workspaceView.family.visibility === "private" ? "비공개" : "공개"}
            </StatusPill>
          }
        >
          <p className="feature-copy">
            현재 홈 프리셋은 <strong>{workspaceView.homePresetLabel}</strong>, 입장 프리셋은{" "}
            <strong>{workspaceView.entryPresetLabel}</strong> 입니다.
          </p>
          <p className="feature-copy">
            테마는 <strong>{workspaceView.themePresetLabel}</strong> 입니다.
          </p>
        </SurfaceCard>

        <SurfaceCard
          title="테스트 주소"
          description="저장 후 바로 아래 주소들에서 실제로 확인할 수 있습니다."
          badge={<StatusPill tone="warm">즉시 반영</StatusPill>}
        >
          <p className="feature-copy">
            가족 입구: <strong>/f/{workspaceView.family.slug}</strong>
          </p>
          <p className="feature-copy">
            가족 앱: <strong>/app/{workspaceView.family.slug}</strong>
          </p>
          <p className="feature-copy">
            모바일: <strong>/preview/mobile/{workspaceView.family.slug}</strong>
          </p>
        </SurfaceCard>
      </div>

      <form action={saveFamilyWorkspaceAction} className="surface-stack">
        <input name="familySlug" type="hidden" value={workspaceView.family.slug} />

        {workspaceView.family.source === "custom" ? (
          <SurfaceCard
            title="공개 범위"
            description="가족홈 공개 여부를 먼저 정하세요."
            tone="warm"
          >
            <label className="form-label">
              공개 설정
              <select
                className="text-input"
                defaultValue={workspaceView.family.visibility}
                name="visibility"
              >
                <option value="public">공개 가족홈</option>
                <option value="private">비공개 가족홈</option>
              </select>
            </label>
            <p className="helper-text">
              비공개 가족홈은 승인된 구성원과 관리자만 볼 수 있고, 공개 목록에도 나오지 않습니다.
            </p>
          </SurfaceCard>
        ) : (
          <input name="visibility" type="hidden" value={workspaceView.family.visibility} />
        )}

        <FamilyBuilderForm
          familyName={workspaceView.family.name}
          initialDraft={workspaceView.workspace}
          moduleCatalog={orderedCatalog}
          themeOptions={familyThemePresetOptions}
        />

        <div className="builder-save-row">
          <button className="button button--primary" type="submit">
            가족홈 설정 저장
          </button>
          <Link
            className="button button--secondary"
            href={`/app/${workspaceView.family.slug}`}
          >
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

      <section className="surface-stack">
        <SurfaceCard
          title="가입 신청 관리"
          description="가족홈 가입 신청은 정회원 또는 관리자만 승인할 수 있습니다."
          badge={
            <StatusPill tone={joinRequests.length > 0 ? "accent" : "warm"}>
              {joinRequests.length}건 대기
            </StatusPill>
          }
        >
          {joinRequests.length > 0 ? (
            <div className="surface-stack">
              {joinRequests.map((request) => (
                <div className="surface-note" key={request.id}>
                  <p>
                    <strong>{request.requesterDisplayName}</strong> - {request.requesterEmail}
                  </p>
                  <p>
                    계정 등급: {request.requesterPlatformRole === "full-member" ? "정회원" : "준회원"} / 신청 시각:{" "}
                    {request.requestedAt}
                  </p>
                  <div className="inline-actions">
                    <form action={approveFamilyJoinRequestAction}>
                      <input name="familySlug" type="hidden" value={workspaceView.family.slug} />
                      <input name="requestId" type="hidden" value={request.id} />
                      <button className="button button--primary" type="submit">
                        승인
                      </button>
                    </form>
                    <form action={rejectFamilyJoinRequestAction}>
                      <input name="familySlug" type="hidden" value={workspaceView.family.slug} />
                      <input name="requestId" type="hidden" value={request.id} />
                      <button className="button button--ghost" type="submit">
                        거절
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="feature-copy">
              지금은 대기 중인 가입 신청이 없습니다.
            </p>
          )}
        </SurfaceCard>
      </section>
    </PageShell>
  );
}
