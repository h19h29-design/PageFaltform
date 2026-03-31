import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PageShell, StatusPill, SurfaceCard } from "@ysplan/ui";

import { ThemePresetSelector } from "../../../../../src/components/theme-preset-selector";
import { getDisplayClub, getClubModuleCopy } from "../../../../../src/lib/club-copy";
import {
  approveClubJoinRequestAction,
  rejectClubJoinRequestAction,
  saveClubWorkspaceAction,
} from "./actions";
import { buildClubDetailHref, buildClubMobilePreviewHref } from "../../../../../src/lib/club-app-routes";
import { clubModuleCatalog, getConsoleClubBySlug } from "../../../../../src/lib/club-sites-store";
import { listClubJoinRequestsForClub } from "../../../../../src/lib/club-join-requests";
import { getActiveConsoleSession } from "../../../../../src/lib/server-sessions";

type ClubManagePageProps = {
  params: Promise<{ clubSlug: string }>;
  searchParams: Promise<{ state?: string; error?: string }>;
};

function getStateMessage(state?: string) {
  switch (state) {
    case "created":
      return "클럽이 만들어졌습니다. 공개 범위, 가입 방식, 테마, 게시판을 다시 확인해 주세요.";
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

  const club = getDisplayClub(clubAccess.club);
  const pendingRequests = (await listClubJoinRequestsForClub(clubSlug)).filter(
    (request) => request.status === "pending",
  );
  const stateMessage = getStateMessage(searchParams.state);
  const enabledModuleSet = new Set(club.enabledModules);
  const mobilePreviewHref = buildClubMobilePreviewHref(club.slug);

  return (
    <PageShell
      mode="console"
      eyebrow="클럽 관리자"
      title={`${club.name} 설정 화면`}
      subtitle="공개 범위, 가입 방식, 테마와 게시판 노출을 조용하게 관리합니다."
      actions={
        <div className="inline-actions">
          <Link className="button button--ghost" href="/console">
            돌아가기
          </Link>
          <Link className="button button--secondary" href={buildClubDetailHref(club.slug)}>
            공개 페이지
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
        <SurfaceCard title="현재 상태" badge={<StatusPill tone="accent">{clubAccess.role}</StatusPill>}>
          <dl className="fact-grid">
            <div className="fact-grid__item">
              <dt>공개 범위</dt>
              <dd>{club.visibility === "private" ? "비공개" : "공개"}</dd>
            </div>
            <div className="fact-grid__item">
              <dt>가입 방식</dt>
              <dd>{club.joinPolicy === "invite-first" ? "초대 우선" : "가입 신청 후 승인"}</dd>
            </div>
            <div className="fact-grid__item">
              <dt>멤버 수</dt>
              <dd>{club.members.length}명</dd>
            </div>
            <div className="fact-grid__item">
              <dt>대기 신청</dt>
              <dd>{pendingRequests.length}건</dd>
            </div>
          </dl>
        </SurfaceCard>

        <SurfaceCard title="빠른 이동" badge={<StatusPill tone="warm">자주 쓰는 화면</StatusPill>}>
          <ul className="stack-list">
            <li>
              <Link href={buildClubDetailHref(club.slug)}>공개 페이지</Link>
            </li>
            <li>
              <Link href={`${buildClubDetailHref(club.slug)}/join`}>가입 신청 페이지</Link>
            </li>
            <li>
              <Link href={`/clubs/${club.slug}/app`}>멤버 공간</Link>
            </li>
            <li>
              <Link href={mobilePreviewHref}>모바일 미리보기</Link>
            </li>
          </ul>
        </SurfaceCard>
      </div>

      <form action={saveClubWorkspaceAction} className="surface-stack">
        <input name="clubSlug" type="hidden" value={club.slug} />

        <div className="grid-two">
          <SurfaceCard title="클럽 소개">
            <div className="form-stack">
              <label className="form-label">
                클럽 이름
                <input className="text-input" defaultValue={club.name} name="name" required type="text" />
              </label>
              <label className="form-label">
                짧은 소개
                <input className="text-input" defaultValue={club.tagline} name="tagline" required type="text" />
              </label>
              <label className="form-label">
                상세 소개
                <textarea
                  className="text-input text-input--tall"
                  defaultValue={club.description}
                  name="description"
                  required
                />
              </label>
              <label className="form-label">
                현재 집중
                <input
                  className="text-input"
                  defaultValue={club.currentFocus}
                  name="currentFocus"
                  required
                  type="text"
                />
              </label>
              <label className="form-label">
                다음 일정 문구
                <input
                  className="text-input"
                  defaultValue={club.nextEventLabel}
                  name="nextEventLabel"
                  required
                  type="text"
                />
              </label>
            </div>
          </SurfaceCard>

          <SurfaceCard title="운영 설정">
            <div className="form-stack">
              <label className="form-label">
                종목
                <input className="text-input" defaultValue={club.sportLabel} name="sportLabel" required type="text" />
              </label>
              <label className="form-label">
                활동 지역
                <input className="text-input" defaultValue={club.location} name="location" required type="text" />
              </label>
              <label className="form-label">
                공개 범위
                <select className="text-input" defaultValue={club.visibility} name="visibility">
                  <option value="public">공개</option>
                  <option value="private">비공개</option>
                </select>
              </label>
              <label className="form-label">
                가입 방식
                <select className="text-input" defaultValue={club.joinPolicy} name="joinPolicy">
                  <option value="approval-required">가입 신청 후 승인</option>
                  <option value="invite-first">초대 우선</option>
                </select>
              </label>
              <label className="form-label">
                테마
                <ThemePresetSelector compact defaultValue={club.themePreset} name="themePreset" />
              </label>
            </div>
          </SurfaceCard>
        </div>

        <SurfaceCard title="노출할 게시판">
          <div className="content-checkbox-grid">
            {clubModuleCatalog.map((module) => {
              const moduleCopy = getClubModuleCopy(module.key);

              return (
                <label className="content-checkbox" key={module.key}>
                  <input
                    defaultChecked={enabledModuleSet.has(module.key)}
                    name={`module-${module.key}`}
                    type="checkbox"
                    value={module.key}
                  />
                  <span>
                    <strong>{moduleCopy.label}</strong> {moduleCopy.description}
                  </span>
                </label>
              );
            })}
          </div>
        </SurfaceCard>

        <div className="builder-save-row">
          <button className="button button--primary" type="submit">
            설정 저장
          </button>
        </div>
      </form>

      <SurfaceCard
        title="가입 신청"
        badge={<StatusPill tone={pendingRequests.length > 0 ? "accent" : "warm"}>{pendingRequests.length}건</StatusPill>}
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
                    <input name="clubSlug" type="hidden" value={club.slug} />
                    <input name="requestId" type="hidden" value={request.id} />
                    <button className="button button--primary" type="submit">
                      승인
                    </button>
                  </form>
                  <form action={rejectClubJoinRequestAction}>
                    <input name="clubSlug" type="hidden" value={club.slug} />
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
          <p className="feature-copy">지금은 대기 중인 가입 신청이 없습니다.</p>
        )}
      </SurfaceCard>
    </PageShell>
  );
}
