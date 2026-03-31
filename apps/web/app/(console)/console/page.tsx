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
  canCreateCustomClubs,
  countOwnedCustomClubSites,
  getCustomClubCreationLimit,
  listConsoleClubs,
} from "../../../src/lib/club-sites-store";
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
      return "준회원을 정회원으로 승인했습니다. 이제 그 계정으로 가족홈과 클럽을 만들 수 있습니다.";
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
  const clubs = await listConsoleClubs(consoleSession);
  const allowClubCreation = canCreateCustomClubs(consoleSession);
  const ownedFamilyCount = await countOwnedCustomFamilySites(consoleSession.userId);
  const familyCreationLimit = getCustomFamilyCreationLimit(consoleSession.platformRole);
  const ownedClubCount = await countOwnedCustomClubSites(consoleSession.userId);
  const clubCreationLimit = getCustomClubCreationLimit(consoleSession.platformRole);
  const associateMembers = isPlatformMaster(consoleSession)
    ? (await listLocalPlatformUsers()).filter((user) => user.platformRole === "associate-member")
    : [];
  const stateMessage = getStateMessage(searchParams.state);

  return (
    <PageShell
      mode="console"
      eyebrow="운영실"
      title={`${consoleSession.displayName} 콘솔`}
      subtitle="승인, 공개 범위, 테마만 빠르게 처리하는 백스테이지입니다."
      actions={
        <div className="inline-actions">
          <Link className="button button--ghost button--small" href="/console/themes">
            테마 스튜디오
          </Link>
          <form action={signOutConsoleAction}>
            <button className="button button--ghost button--small" type="submit">
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
          title="대기 처리"
          description="지금 손봐야 할 항목만 먼저 봅니다."
          badge={<StatusPill tone="accent">{getPlatformAccountRoleLabel(consoleSession.platformRole)}</StatusPill>}
        >
          <dl className="fact-grid">
            <div className="fact-grid__item">
              <dt>계정</dt>
              <dd>{consoleSession.email}</dd>
            </div>
            <div className="fact-grid__item">
              <dt>관리 가족홈</dt>
              <dd>{families.length}개</dd>
            </div>
            <div className="fact-grid__item">
              <dt>관리 클럽</dt>
              <dd>{clubs.length}개</dd>
            </div>
            <div className="fact-grid__item">
              <dt>승인 대기</dt>
              <dd>{isPlatformMaster(consoleSession) ? `${associateMembers.length}명` : "마스터 전용"}</dd>
            </div>
            <div className="fact-grid__item">
              <dt>가족홈 생성</dt>
              <dd>
                {ownedFamilyCount}개
                {canCreateFamilySites(consoleSession) && consoleSession.platformRole !== "master"
                  ? ` / ${familyCreationLimit}개`
                  : ""}
              </dd>
            </div>
            <div className="fact-grid__item">
              <dt>클럽 생성</dt>
              <dd>
                {ownedClubCount}개
                {allowClubCreation && consoleSession.platformRole !== "master"
                  ? ` / ${clubCreationLimit}개`
                  : ""}
              </dd>
            </div>
          </dl>
        </SurfaceCard>

        <SurfaceCard
          title="운영 도구"
          description="생성은 여기서, 나머지는 아래 목록에서 처리합니다."
          badge={<StatusPill tone="warm">빠른 작업</StatusPill>}
        >
          <div className="inline-actions">
            {allowCreation ? (
              <Link className="button button--secondary button--small" href="/console/families/new">
                가족홈 만들기
              </Link>
            ) : null}
            {allowClubCreation ? (
              <Link className="button button--secondary button--small" href="/console/clubs/new">
                클럽 만들기
              </Link>
            ) : null}
            <Link className="button button--ghost button--small" href="/console/themes">
              테마 스튜디오
            </Link>
          </div>
        </SurfaceCard>
      </div>

      {isPlatformMaster(consoleSession) ? (
        <section className="surface-stack">
          <SectionHeader
            kicker="승인 대기"
            title="정회원 대기 계정"
            action={<StatusPill>{associateMembers.length}명</StatusPill>}
          />

          <SurfaceCard
            title="준회원 목록"
            description="마스터가 승인해야 정회원으로 바뀝니다."
            badge={<StatusPill tone="warm">마스터 전용</StatusPill>}
          >
            {associateMembers.length > 0 ? (
              <div className="surface-stack">
                {associateMembers.map((user) => (
                  <div className="surface-note" key={user.id}>
                    <p>
                      <strong>{user.displayName}</strong> - {user.email}
                    </p>
                    <p>가입한 가족홈: {user.memberships.length}개</p>
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
              <p className="feature-copy">승인할 준회원이 없습니다.</p>
            )}
          </SurfaceCard>
        </section>
      ) : null}

      <section className="surface-stack">
        <SectionHeader
          kicker="가족홈"
          title="내가 관리하는 가족홈"
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
                  <span className="module-pill">{family.visibility === "private" ? "비공개" : "공개"}</span>
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

      <section className="surface-stack">
        <SectionHeader
          kicker="클럽"
          title="내가 관리하는 클럽"
          action={<StatusPill>{clubs.length}개</StatusPill>}
        />

        <div className="family-grid">
          {clubs.length > 0 ? (
            clubs.map(({ club, role, canManage }) => (
              <SurfaceCard
                key={`${club.slug}-${role}`}
                title={club.name}
                description={club.tagline}
                badge={<StatusPill tone={canManage ? "accent" : "warm"}>{role}</StatusPill>}
                footer={
                  <div className="inline-actions">
                    <Link className="button button--primary" href={`/clubs/${club.slug}`}>
                      공개 화면
                    </Link>
                    {canManage ? (
                      <Link className="button button--secondary" href={`/console/clubs/${club.slug}`}>
                        설정
                      </Link>
                    ) : null}
                  </div>
                }
              >
                <div className="pill-row">
                  <span className="module-pill">{club.visibility === "private" ? "비공개" : "공개"}</span>
                  <span className="module-pill">
                    {club.joinPolicy === "invite-first" ? "초대제 전용" : "가입 신청 후 승인"}
                  </span>
                  {club.sampleModules.slice(0, 4).map((module) => (
                    <span className="module-pill" key={`${club.slug}-${module}`}>
                      {module}
                    </span>
                  ))}
                </div>
                <dl className="fact-grid">
                  <div className="fact-grid__item">
                    <dt>종목</dt>
                    <dd>{club.sportLabel}</dd>
                  </div>
                  <div className="fact-grid__item">
                    <dt>다음 일정</dt>
                    <dd>{club.nextEventLabel}</dd>
                  </div>
                  <div className="fact-grid__item">
                    <dt>멤버 수</dt>
                    <dd>{club.members.length}명</dd>
                  </div>
                  <div className="fact-grid__item">
                    <dt>출처</dt>
                    <dd>{club.source === "custom" ? "직접 만든 클럽" : "기본 샘플"}</dd>
                  </div>
                </dl>
              </SurfaceCard>
            ))
          ) : (
            <SurfaceCard
              title="아직 관리 중인 클럽이 없습니다."
              description="정회원 이상이면 클럽을 만들고 공개 페이지와 가입 흐름을 바로 테스트할 수 있습니다."
              badge={<StatusPill tone="warm">클럽 0개</StatusPill>}
              footer={
                allowClubCreation ? (
                  <div className="inline-actions">
                    <Link className="button button--primary" href="/console/clubs/new">
                      첫 클럽 만들기
                    </Link>
                  </div>
                ) : undefined
              }
            />
          )}
        </div>
      </section>
    </PageShell>
  );
}
