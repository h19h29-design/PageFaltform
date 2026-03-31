import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PageShell, StatusPill, SurfaceCard } from "@ysplan/ui";

import { ThemePresetSelector } from "../../../../../src/components/theme-preset-selector";
import {
  approveClubJoinRequestAction,
  rejectClubJoinRequestAction,
  saveClubWorkspaceAction,
} from "./actions";
import { buildClubDetailHref, buildClubMobilePreviewHref } from "../../../../../src/lib/club-app-routes";
import {
  clubModuleCatalog,
  getConsoleClubBySlug,
} from "../../../../../src/lib/club-sites-store";
import { listClubJoinRequestsForClub } from "../../../../../src/lib/club-join-requests";
import { getActiveConsoleSession } from "../../../../../src/lib/server-sessions";

type ClubManagePageProps = {
  params: Promise<{ clubSlug: string }>;
  searchParams: Promise<{ state?: string; error?: string }>;
};

function getStateMessage(state?: string) {
  switch (state) {
    case "created":
      return "클럽이 만들어졌습니다. 이제 공개 범위, 가입 정책, 테마, 모듈을 바로 조정할 수 있습니다.";
    case "saved":
      return "클럽 설정을 저장했습니다.";
    case "request-approved":
      return "가입 신청을 승인했습니다.";
    case "request-rejected":
      return "가입 신청을 거절했습니다.";
    default:
      return null;
  }
}

export default async function ClubManagePage(props: ClubManagePageProps) {
  const { clubSlug } = await props.params;
  const searchParams = await props.searchParams;
  const consoleSession = await getActiveConsoleSession();

  if (!consoleSession) {
    redirect("/console/sign-in?error=session-required");
  }

  const clubAccess = await getConsoleClubBySlug(consoleSession, clubSlug);

  if (!clubAccess) {
    notFound();
  }

  if (!clubAccess.canManage) {
    redirect("/console");
  }

  const pendingRequests = (await listClubJoinRequestsForClub(clubSlug)).filter(
    (request) => request.status === "pending",
  );
  const stateMessage = getStateMessage(searchParams.state);
  const enabledModuleSet = new Set(clubAccess.club.enabledModules);
  const mobilePreviewHref = buildClubMobilePreviewHref(clubAccess.club.slug);

  return (
    <PageShell
      mode="console"
      eyebrow="클럽 관리자"
      title={`${clubAccess.club.name} 관리`}
      subtitle="공개 설정과 가입 승인을 다룹니다."
      actions={
        <div className="inline-actions">
          <Link className="button button--ghost" href="/console">
            뒤로
          </Link>
          <Link className="button button--secondary" href={buildClubDetailHref(clubAccess.club.slug)}>
            공개 화면
          </Link>
        </div>
      }
    >
      {searchParams.error ? (
        <div className="surface-note">
          <p>{decodeURIComponent(searchParams.error)}</p>
        </div>
      ) : null}

      {stateMessage ? (
        <div className="surface-note">
          <p>{stateMessage}</p>
        </div>
      ) : null}

      <div className="grid-two">
        <SurfaceCard
          title="현재 상태"
          description="운영자가 지금 바로 확인해야 할 핵심 상태를 모았습니다."
          badge={<StatusPill tone="accent">{clubAccess.role}</StatusPill>}
        >
          <dl className="fact-grid">
            <div className="fact-grid__item">
              <dt>공개 범위</dt>
              <dd>{clubAccess.club.visibility === "private" ? "비공개" : "공개"}</dd>
            </div>
            <div className="fact-grid__item">
              <dt>가입 정책</dt>
              <dd>{clubAccess.club.joinPolicy === "invite-first" ? "초대 우선" : "승인 필요"}</dd>
            </div>
            <div className="fact-grid__item">
              <dt>멤버 수</dt>
              <dd>{clubAccess.club.members.length}명</dd>
            </div>
            <div className="fact-grid__item">
              <dt>대기 신청</dt>
              <dd>{pendingRequests.length}건</dd>
            </div>
          </dl>
        </SurfaceCard>

        <SurfaceCard
          title="빠른 링크"
          description="자주 확인하는 페이지를 한 번에 열 수 있습니다."
          badge={<StatusPill tone="warm">바로 가기</StatusPill>}
        >
          <ul className="stack-list">
            <li>
              <Link href={buildClubDetailHref(clubAccess.club.slug)}>공개 페이지</Link>
            </li>
            <li>
              <Link href={`${buildClubDetailHref(clubAccess.club.slug)}/join`}>가입 페이지</Link>
            </li>
            <li>
              <Link href={`/console/clubs/${clubAccess.club.slug}`}>관리자 페이지</Link>
            </li>
            <li>
              <Link href={mobilePreviewHref}>모바일 미리보기</Link>
            </li>
          </ul>
        </SurfaceCard>
      </div>

      <form action={saveClubWorkspaceAction} className="surface-stack">
        <input name="clubSlug" type="hidden" value={clubAccess.club.slug} />

        <div className="grid-two">
          <SurfaceCard title="클럽 소개" description="노출 문구와 첫인상을 여기서 조정합니다.">
            <div className="form-stack">
              <label className="form-label">
                클럽 이름
                <input className="text-input" defaultValue={clubAccess.club.name} name="name" required type="text" />
              </label>
              <label className="form-label">
                한 줄 소개
                <input className="text-input" defaultValue={clubAccess.club.tagline} name="tagline" required type="text" />
              </label>
              <label className="form-label">
                상세 소개
                <textarea
                  className="text-input text-input--tall"
                  defaultValue={clubAccess.club.description}
                  name="description"
                  required
                />
              </label>
              <label className="form-label">
                현재 집중 포인트
                <input
                  className="text-input"
                  defaultValue={clubAccess.club.currentFocus}
                  name="currentFocus"
                  required
                  type="text"
                />
              </label>
              <label className="form-label">
                다음 일정 이름
                <input
                  className="text-input"
                  defaultValue={clubAccess.club.nextEventLabel}
                  name="nextEventLabel"
                  required
                  type="text"
                />
              </label>
            </div>
          </SurfaceCard>

          <SurfaceCard title="운영 설정" description="공개 범위, 가입 방식, 테마를 한 번에 조정합니다.">
            <div className="form-stack">
              <label className="form-label">
                종목
                <input className="text-input" defaultValue={clubAccess.club.sportLabel} name="sportLabel" required type="text" />
              </label>
              <label className="form-label">
                활동 지역
                <input className="text-input" defaultValue={clubAccess.club.location} name="location" required type="text" />
              </label>
              <label className="form-label">
                공개 범위
                <select className="text-input" defaultValue={clubAccess.club.visibility} name="visibility">
                  <option value="public">공개</option>
                  <option value="private">비공개</option>
                </select>
              </label>
              <label className="form-label">
                가입 정책
                <select className="text-input" defaultValue={clubAccess.club.joinPolicy} name="joinPolicy">
                  <option value="approval-required">승인 필요</option>
                  <option value="invite-first">초대 우선</option>
                </select>
              </label>
              <label className="form-label">
                테마
                <ThemePresetSelector
                  compact
                  defaultValue={clubAccess.club.themePreset}
                  name="themePreset"
                />
              </label>
            </div>
          </SurfaceCard>
        </div>

        <SurfaceCard title="노출 모듈" description="공개 페이지에 보여줄 모듈을 직접 고릅니다.">
          <div className="content-checkbox-grid">
            {clubModuleCatalog.map((module) => (
              <label className="content-checkbox" key={module.key}>
                <input
                  defaultChecked={enabledModuleSet.has(module.key)}
                  name={`module-${module.key}`}
                  type="checkbox"
                  value={module.key}
                />
                <span>
                  <strong>{module.label}</strong> {module.description}
                </span>
              </label>
            ))}
          </div>
        </SurfaceCard>

        <div className="builder-save-row">
          <button className="button button--primary" type="submit">
            클럽 설정 저장
          </button>
        </div>
      </form>

      <SurfaceCard
        title="가입 신청 관리"
        description="로그인한 사용자가 보낸 가입 신청을 이 화면에서 승인하거나 거절합니다."
        badge={<StatusPill tone={pendingRequests.length > 0 ? "accent" : "warm"}>{pendingRequests.length}건 대기</StatusPill>}
      >
        {pendingRequests.length > 0 ? (
          <div className="surface-stack">
            {pendingRequests.map((request) => (
              <div className="surface-note" key={request.id}>
                <p>
                  <strong>{request.requesterDisplayName}</strong> - {request.requesterEmail}
                </p>
                <p>{request.introMessage || "소개 메시지가 없습니다."}</p>
                <div className="inline-actions">
                  <form action={approveClubJoinRequestAction}>
                    <input name="clubSlug" type="hidden" value={clubAccess.club.slug} />
                    <input name="requestId" type="hidden" value={request.id} />
                    <button className="button button--primary" type="submit">
                      승인
                    </button>
                  </form>
                  <form action={rejectClubJoinRequestAction}>
                    <input name="clubSlug" type="hidden" value={clubAccess.club.slug} />
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
          <p className="feature-copy">현재 대기 중인 가입 신청이 없습니다.</p>
        )}
      </SurfaceCard>
    </PageShell>
  );
}
