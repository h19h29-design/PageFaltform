import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  canAccessConsole,
  getMembershipForFamily,
  getPlatformAccountRoleLabel,
} from "@ysplan/auth";
import { HeroCard, MetricList, PageShell, StatusPill, SurfaceCard } from "@ysplan/ui";

import { getLatestFamilyJoinRequestForUser } from "../../../../src/lib/family-join-requests";
import { buildFamilyModuleHref } from "../../../../src/lib/family-app-routes";
import { getEffectiveFamilyWorkspace } from "../../../../src/lib/family-workspace";
import {
  getActiveFamilyAccessSessionForSlug,
  getActivePlatformUserSession,
} from "../../../../src/lib/server-sessions";
import { createFamilySceneStyle } from "../../../../src/lib/theme-scene";
import {
  submitApprovedFamilyEntryAction,
  submitFamilyJoinRequestAction,
} from "./actions";

type FamilyEntryPageProps = {
  params: Promise<{ familySlug: string }>;
  searchParams: Promise<{ state?: string; error?: string }>;
};

function getEntryStateMessage(state?: string): string | null {
  switch (state) {
    case "requested":
      return "가입 신청을 보냈습니다. 이 가족홈의 정회원이 승인하면 바로 이용할 수 있습니다.";
    case "already-member":
      return "이미 이 가족홈에 가입된 계정입니다. 바로 입장할 수 있습니다.";
    default:
      return null;
  }
}

function getEntryErrorMessage(error?: string): string | null {
  switch (error) {
    case "approval-required":
      return "가족홈 정회원의 승인이 끝난 뒤에 입장할 수 있습니다.";
    case "family-not-found":
      return "가족홈을 찾지 못했습니다. 주소를 다시 확인해 주세요.";
    case "session-expired":
      return "입장 세션이 만료되었습니다. 다시 입장해 주세요.";
    default:
      return null;
  }
}

export default async function FamilyEntryPage({
  params,
  searchParams,
}: FamilyEntryPageProps) {
  const { familySlug } = await params;
  const resolvedSearchParams = await searchParams;
  const workspaceView = await getEffectiveFamilyWorkspace(familySlug);

  if (!workspaceView) {
    notFound();
  }

  const activeFamilySession = await getActiveFamilyAccessSessionForSlug(
    workspaceView.family.slug,
  );
  const platformSession = await getActivePlatformUserSession();
  const membership = platformSession
    ? getMembershipForFamily(platformSession, workspaceView.family.slug)
    : null;
  const hasConsoleBypass = Boolean(
    platformSession &&
      (canAccessConsole(platformSession, workspaceView.family.slug) ||
        workspaceView.family.ownerUserId === platformSession.userId),
  );
  const canDiscoverPrivateFamily =
    workspaceView.family.visibility === "public" ||
    Boolean(activeFamilySession) ||
    Boolean(membership) ||
    hasConsoleBypass;

  if (!canDiscoverPrivateFamily) {
    notFound();
  }

  if (activeFamilySession) {
    redirect(`/app/${workspaceView.family.slug}`);
  }

  const joinRequest =
    platformSession && !membership
      ? await getLatestFamilyJoinRequestForUser({
          familySlug: workspaceView.family.slug,
          userId: platformSession.userId,
        })
      : null;
  const primaryModule = workspaceView.moduleDescriptors[0];
  const stateMessage = getEntryStateMessage(resolvedSearchParams.state);
  const errorMessage = getEntryErrorMessage(resolvedSearchParams.error);
  const familySignUpHref = `/sign-up?familySlug=${workspaceView.family.slug}`;
  const familySignInHref = `/sign-in?next=${encodeURIComponent(`/f/${workspaceView.family.slug}`)}`;
  const canEnterFamily = Boolean(membership) || hasConsoleBypass;

  return (
    <div
      className="family-scene"
      style={createFamilySceneStyle(workspaceView.family.theme)}
    >
      <PageShell
        eyebrow={`${workspaceView.family.name} 입구`}
        title={`${workspaceView.family.name} 가족홈`}
        subtitle={workspaceView.family.heroSummary}
        actions={
          <div className="inline-actions">
            <Link className="button button--ghost" href="/">
              가족홈 목록
            </Link>
            {platformSession && canAccessConsole(platformSession) ? (
              <Link className="button button--secondary" href="/console">
                콘솔
              </Link>
            ) : (
              <Link className="button button--secondary" href="/console/sign-in">
                관리자 로그인
              </Link>
            )}
          </div>
        }
      >
        <HeroCard
          eyebrow={workspaceView.family.visibility === "private" ? "비공개 가족홈" : "공개 가족홈"}
          title={workspaceView.family.welcomeMessage}
          subtitle={
            canEnterFamily
              ? "승인된 계정입니다. 바로 입장해서 실제 사용을 계속할 수 있습니다."
              : "이 가족홈은 가입 신청 후 정회원 승인까지 끝나야 실제 사용이 가능합니다."
          }
          meta={
            <>
              <StatusPill tone="accent">{workspaceView.homePresetLabel}</StatusPill>
              <StatusPill>{workspaceView.entryPresetLabel}</StatusPill>
              <StatusPill tone="warm">
                {workspaceView.family.visibility === "private" ? "비공개" : "공개"}
              </StatusPill>
              <StatusPill>{workspaceView.family.memberCount}명</StatusPill>
            </>
          }
          actions={
            canEnterFamily ? (
              <form action={submitApprovedFamilyEntryAction}>
                <input
                  name="familySlug"
                  type="hidden"
                  value={workspaceView.family.slug}
                />
                <button className="button button--primary" type="submit">
                  승인된 계정으로 입장
                </button>
              </form>
            ) : platformSession ? (
              <form action={submitFamilyJoinRequestAction}>
                <input
                  name="familySlug"
                  type="hidden"
                  value={workspaceView.family.slug}
                />
                <button
                  className="button button--primary"
                  disabled={joinRequest?.status === "pending"}
                  type="submit"
                >
                  {joinRequest?.status === "pending"
                    ? "승인 대기 중"
                    : "가족홈 가입 신청"}
                </button>
              </form>
            ) : (
              <div className="inline-actions">
                <Link className="button button--primary" href={familySignUpHref}>
                  회원가입 후 신청
                </Link>
                <Link className="button button--secondary" href={familySignInHref}>
                  로그인 후 신청
                </Link>
              </div>
            )
          }
        >
          <SurfaceCard
            title="현재 상태"
            description="가입 승인과 입장 상태를 먼저 확인하세요."
            tone="warm"
          >
            <MetricList
              items={[
                {
                  label: "내 계정 상태",
                  value: platformSession
                    ? getPlatformAccountRoleLabel(platformSession.platformRole)
                    : "비회원",
                },
                {
                  label: "이 가족홈 가입",
                  value: membership
                    ? "승인됨"
                    : joinRequest?.status === "pending"
                      ? "승인 대기"
                      : "미가입",
                },
                {
                  label: "첫 모듈",
                  value: primaryModule?.label ?? "공지",
                },
                {
                  label: "입장 방식",
                  value:
                    workspaceView.family.visibility === "private"
                      ? "가입자만 접근"
                      : "공개 미리보기 + 승인 입장",
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

        {errorMessage ? (
          <div className="surface-note">
            <p>{errorMessage}</p>
          </div>
        ) : null}

        <div className="grid-two">
          <SurfaceCard
            title="가입 및 승인 흐름"
            description="이 가족홈을 실제로 쓰기 위한 최소 단계입니다."
            badge={
              membership ? (
                <StatusPill tone="accent">이용 가능</StatusPill>
              ) : joinRequest?.status === "pending" ? (
                <StatusPill tone="warm">승인 대기</StatusPill>
              ) : (
                <StatusPill>신청 전</StatusPill>
              )
            }
          >
            <ol className="journey-list">
              <li className="journey-list__item">
                <span className="journey-list__number">1</span>
                <div>
                  <strong>계정 준비</strong>
                  <p className="feature-copy">
                    정회원과 준회원 모두 가입할 수 있지만, 기본 가입은 준회원으로 시작합니다.
                  </p>
                </div>
              </li>
              <li className="journey-list__item">
                <span className="journey-list__number">2</span>
                <div>
                  <strong>가족홈 가입 신청</strong>
                  <p className="feature-copy">
                    로그인 상태에서 신청만 보내면 되고, 이 가족홈 정회원이 승인합니다.
                  </p>
                </div>
              </li>
              <li className="journey-list__item">
                <span className="journey-list__number">3</span>
                <div>
                  <strong>승인 후 입장</strong>
                  <p className="feature-copy">
                    승인된 계정으로 입장하면 공지, 일정, 체크리스트 같은 실제 게시판을 바로 쓸 수 있습니다.
                  </p>
                </div>
              </li>
            </ol>
          </SurfaceCard>

          <SurfaceCard
            title="켜진 모듈"
            description="승인 뒤 들어가면 아래 모듈부터 순서대로 테스트할 수 있습니다."
            badge={<StatusPill>{workspaceView.workspace.enabledModules.length}개</StatusPill>}
          >
            <div className="pill-row">
              {workspaceView.moduleDescriptors.map((module) => (
                <span className="module-pill" key={module.key}>
                  {module.label}
                </span>
              ))}
            </div>

            {primaryModule ? (
              <div className="surface-note">
                <p>
                  첫 진입 모듈:{" "}
                  <Link
                    href={buildFamilyModuleHref(
                      workspaceView.family.slug,
                      primaryModule.key,
                    )}
                  >
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
