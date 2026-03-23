import Link from "next/link";
import { redirect } from "next/navigation";

import {
  canCreateFamilySites,
  getPlatformAccountRoleLabel,
  isPlatformMaster,
} from "@ysplan/auth";
import { PageShell, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import { approveFullMemberAction } from "./actions";
import { signOutConsoleAction } from "../../../src/actions/session-actions";
import { buildFamilyModuleHref } from "../../../src/lib/family-app-routes";
import {
  canCreateCustomFamilies,
  countOwnedCustomFamilySites,
  getCustomFamilyCreationLimit,
} from "../../../src/lib/family-sites-store";
import { listConsoleFamilyWorkspaces } from "../../../src/lib/family-workspace";
import { listLocalPlatformUsers } from "../../../src/lib/local-platform-auth";
import { getActiveConsoleSession } from "../../../src/lib/server-sessions";

type ConsolePageProps = {
  searchParams: Promise<{ state?: string }>;
};

function getStateMessage(state?: string): string | null {
  switch (state) {
    case "full-member-approved":
      return "준회원을 정회원으로 승인했습니다. 이제 그 계정으로 가족홈을 만들 수 있습니다.";
    default:
      return null;
  }
}

function getFamilySourceLabel(source: string): string {
  switch (source) {
    case "custom":
      return "직접 만든 가족홈";
    case "demo":
      return "기본 샘플";
    default:
      return source;
  }
}

export default async function ConsolePage(props: ConsolePageProps) {
  const searchParams = await props.searchParams;
  const consoleSession = await getActiveConsoleSession();

  if (!consoleSession) {
    redirect("/console/sign-in?error=session-required");
  }

  const families = await listConsoleFamilyWorkspaces(consoleSession);
  const allowCreation = canCreateCustomFamilies(consoleSession);
  const ownedFamilyCount = await countOwnedCustomFamilySites(consoleSession.userId);
  const familyCreationLimit = getCustomFamilyCreationLimit(consoleSession.platformRole);
  const associateMembers = isPlatformMaster(consoleSession)
    ? (await listLocalPlatformUsers()).filter(
        (user) => user.platformRole === "associate-member",
      )
    : [];
  const stateMessage = getStateMessage(searchParams.state);

  return (
    <PageShell
      eyebrow="관리자 콘솔"
      title={`${consoleSession.displayName} 콘솔`}
      subtitle="가족홈 생성, 공개 범위 조정, 가입 승인, 모듈 구성을 한 곳에서 관리합니다."
      actions={
        <div className="inline-actions">
          {allowCreation ? (
            <Link className="button button--primary" href="/console/families/new">
              가족홈 만들기
            </Link>
          ) : null}
          <form action={signOutConsoleAction}>
            <button className="button button--ghost" type="submit">
              로그아웃
            </button>
          </form>
        </div>
      }
    >
      {stateMessage ? (
        <div className="surface-note">
          <p>{stateMessage}</p>
        </div>
      ) : null}

      <div className="grid-two">
        <SurfaceCard
          title="내 계정 상태"
          description="플랫폼 등급과 가족홈 생성 가능 수를 먼저 확인하세요."
          badge={<StatusPill tone="accent">{getPlatformAccountRoleLabel(consoleSession.platformRole)}</StatusPill>}
        >
          <p className="feature-copy">{consoleSession.email}</p>
          <p className="feature-copy">
            현재 관리 중인 가족홈: <strong>{families.length}개</strong>
          </p>
          <p className="feature-copy">
            내가 만든 가족홈:{" "}
            <strong>
              {ownedFamilyCount}개
              {canCreateFamilySites(consoleSession) && consoleSession.platformRole !== "master"
                ? ` / ${familyCreationLimit}개`
                : ""}
            </strong>
          </p>
        </SurfaceCard>

        <SurfaceCard
          title="이번 테스트에서 할 수 있는 일"
          description="지금 정책 기준으로 바로 시험할 수 있는 흐름입니다."
          badge={<StatusPill tone="warm">테스트 시나리오</StatusPill>}
        >
          <ul className="stack-list">
            <li>정회원은 가족홈을 최대 5개까지 만들 수 있습니다.</li>
            <li>준회원은 가족홈 생성은 못 하고, 다른 가족홈 가입 신청만 할 수 있습니다.</li>
            <li>가족홈 가입은 각 가족홈 정회원 또는 관리자의 승인이 있어야 완료됩니다.</li>
            <li>비공개 가족홈은 가입자 외에는 목록에도 보이지 않습니다.</li>
          </ul>
        </SurfaceCard>
      </div>

      <section className="surface-stack">
        <SectionHeader
          kicker="가족홈"
          title="내가 관리 중인 가족홈"
          action={<StatusPill>{families.length}개</StatusPill>}
        />

        <div className="family-grid">
          {families.map(({ family, role, canManage, workspaceView }) => {
            const firstModule = workspaceView.workspace.enabledModules[0];

            return (
              <SurfaceCard
                key={`${family.slug}-${role}`}
                title={family.name}
                description={family.tagline}
                badge={<StatusPill tone={canManage ? "accent" : "warm"}>{role}</StatusPill>}
                footer={
                  <div className="inline-actions">
                    <Link className="button button--primary" href={`/app/${family.slug}`}>
                      앱 열기
                    </Link>
                    {firstModule ? (
                      <Link
                        className="button button--secondary"
                        href={buildFamilyModuleHref(family.slug, firstModule)}
                      >
                        첫 모듈
                      </Link>
                    ) : null}
                    <Link className="button button--ghost" href={`/f/${family.slug}`}>
                      입구
                    </Link>
                    {canManage ? (
                      <Link className="button button--ghost" href={`/console/families/${family.slug}`}>
                        설정
                      </Link>
                    ) : null}
                  </div>
                }
              >
                <div className="pill-row">
                  <span className="module-pill">
                    {family.visibility === "private" ? "비공개" : "공개"}
                  </span>
                  <span className="module-pill">{getFamilySourceLabel(family.source)}</span>
                  {workspaceView.moduleDescriptors.slice(0, 4).map((module) => (
                    <span className="module-pill" key={module.key}>
                      {module.label}
                    </span>
                  ))}
                </div>
                <dl className="fact-grid">
                  <div className="fact-grid__item">
                    <dt>홈 프리셋</dt>
                    <dd>{workspaceView.homePresetLabel}</dd>
                  </div>
                  <div className="fact-grid__item">
                    <dt>입장 프리셋</dt>
                    <dd>{workspaceView.entryPresetLabel}</dd>
                  </div>
                  <div className="fact-grid__item">
                    <dt>첫 모듈</dt>
                    <dd>{workspaceView.moduleDescriptors[0]?.label ?? "공지"}</dd>
                  </div>
                  <div className="fact-grid__item">
                    <dt>출처</dt>
                    <dd>{getFamilySourceLabel(family.source)}</dd>
                  </div>
                </dl>
              </SurfaceCard>
            );
          })}
        </div>
      </section>

      {isPlatformMaster(consoleSession) ? (
        <section className="surface-stack">
          <SectionHeader
            kicker="마스터 승인"
            title="정회원 승격 대기 계정"
            action={<StatusPill>{associateMembers.length}명</StatusPill>}
          />

          <SurfaceCard
            title="준회원 목록"
            description="테스트 기간에는 마스터가 승인한 계정만 정회원으로 승격할 수 있습니다."
            badge={<StatusPill tone="warm">마스터 전용</StatusPill>}
          >
            {associateMembers.length > 0 ? (
              <div className="surface-stack">
                {associateMembers.map((user) => (
                  <div className="surface-note" key={user.id}>
                    <p>
                      <strong>{user.displayName}</strong> - {user.email}
                    </p>
                    <p>현재 등급: 준회원 / 가입된 가족홈: {user.memberships.length}개</p>
                    <form action={approveFullMemberAction}>
                      <input name="userId" type="hidden" value={user.id} />
                      <button className="button button--primary" type="submit">
                        정회원 승인
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <p className="feature-copy">지금은 정회원 승격 대기 중인 준회원이 없습니다.</p>
            )}
          </SurfaceCard>
        </section>
      ) : null}
    </PageShell>
  );
}
