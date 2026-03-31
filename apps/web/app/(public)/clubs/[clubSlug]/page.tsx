import Link from "next/link";
import { notFound } from "next/navigation";

import { getPlatformAccountRoleLabel } from "@ysplan/auth";
import { HeroCard, PageShell, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import { buildClubAppHomeHref } from "../../../../src/lib/club-app-routes";
import { getLatestClubJoinRequestForUser } from "../../../../src/lib/club-join-requests";
import {
  getClubViewerAccess,
  resolveClubPreviewFromSlug,
} from "../../../../src/lib/club-sites-store";
import { getActivePlatformUserSession } from "../../../../src/lib/server-sessions";
import { getSharedThemePreset } from "../../../../src/lib/shared-themes";

type ClubDetailPageProps = {
  params: Promise<{ clubSlug: string }>;
  searchParams: Promise<{ state?: string }>;
};

function getStateMessage(state?: string): string | null {
  switch (state) {
    case "request-sent":
      return "가입 신청을 보냈습니다. 운영자가 승인하면 바로 클럽 안으로 들어갈 수 있습니다.";
    case "invite-only":
      return "이 클럽은 초대 우선 방식입니다. 관리자 초대가 있어야 참가할 수 있습니다.";
    case "already-pending":
      return "이미 가입 신청이 접수되어 있습니다. 승인 결과를 기다려 주세요.";
    default:
      return null;
  }
}

export default async function ClubDetailPage(props: ClubDetailPageProps) {
  const { clubSlug } = await props.params;
  const searchParams = await props.searchParams;
  const platformSession = await getActivePlatformUserSession();
  const club = await resolveClubPreviewFromSlug(clubSlug, platformSession);

  if (!club) {
    notFound();
  }

  const viewerAccess = await getClubViewerAccess(clubSlug, platformSession);
  const latestJoinRequest =
    platformSession
      ? await getLatestClubJoinRequestForUser({
          clubSlug: club.slug,
          userId: platformSession.userId,
        })
      : null;
  const hasPendingRequest = latestJoinRequest?.status === "pending";
  const hasClubAccess = viewerAccess?.hasAccess ?? false;
  const canJoin = club.joinPolicy !== "invite-first";
  const joinHref = `/clubs/${club.slug}/join`;
  const appHref = buildClubAppHomeHref(club.slug);
  const theme = getSharedThemePreset(club.themePreset);
  const stateMessage = getStateMessage(searchParams.state);
  const visibleSections = club.sections.filter(
    (section) => section.audience === "public" || hasClubAccess,
  );

  return (
    <PageShell
      mode="public"
      eyebrow="클럽 소개"
      title={club.name}
      subtitle={club.tagline}
      actions={
        <div className="inline-actions">
          <Link className="button button--ghost" href="/clubs">
            목록
          </Link>
          {hasClubAccess ? (
            <Link className="button button--primary" href={appHref}>
              클럽 들어가기
            </Link>
          ) : canJoin ? (
            <Link className="button button--secondary" href={joinHref}>
              가입 신청
            </Link>
          ) : (
            <StatusPill tone="warm">초대 우선</StatusPill>
          )}
        </div>
      }
    >
      {stateMessage ? <SurfaceCard title="상태 안내" description={stateMessage} /> : null}
      {hasPendingRequest ? (
        <SurfaceCard
          title="승인 대기 중"
          description="운영자 승인 전까지는 공개 소개만 볼 수 있습니다. 승인되면 이 화면에서 바로 클럽 안으로 들어갈 수 있습니다."
        />
      ) : null}

      <div className="detail-hero-grid">
        <HeroCard
          eyebrow={`${club.category} · ${theme.label}`}
          title={club.description}
          subtitle={theme.mood}
          meta={
            <>
              <StatusPill tone={club.visibility === "private" ? "danger" : "accent"}>
                {club.visibility === "private" ? "비공개" : "공개"}
              </StatusPill>
              <StatusPill tone="warm">{club.accessLabel}</StatusPill>
              <StatusPill>{club.memberCount}명</StatusPill>
              <StatusPill>
                {getPlatformAccountRoleLabel(platformSession?.platformRole ?? "associate-member")}
              </StatusPill>
              {viewerAccess?.roleLabel ? <StatusPill tone="accent">{viewerAccess.roleLabel}</StatusPill> : null}
            </>
          }
          actions={
            <div className="inline-actions">
              {hasClubAccess ? (
                <Link className="button button--primary" href={appHref}>
                  클럽 들어가기
                </Link>
              ) : canJoin ? (
                <Link className="button button--primary" href={joinHref}>
                  가입 화면 보기
                </Link>
              ) : null}
              <Link className="button button--secondary" href="/club">
                클럽 홈
              </Link>
            </div>
          }
        />

        <div className="detail-sidebar">
          <SurfaceCard title="운영 요약" description="가입 전에 알아두면 좋은 핵심만 먼저 모았습니다.">
            <div className="pill-row">
              <StatusPill tone="accent">{club.nextEventLabel}</StatusPill>
              <StatusPill tone="warm">{club.ownerName}</StatusPill>
            </div>
            <ul className="stack-list compact-list">
              {club.highlights.map((highlight) => (
                <li key={`${club.slug}-${highlight.label}`}>
                  <strong>{highlight.label}</strong> {highlight.value}
                </li>
              ))}
            </ul>
          </SurfaceCard>

          <SurfaceCard
            title="지금 볼 수 있는 정보"
            description="멤버 전용 내용은 승인 후 클럽 안에서 이어집니다."
          >
            <div className="surface-stack">
              {visibleSections.map((section) => (
                <div className="surface-note" key={`${club.slug}-${section.key}`}>
                  <div className="inline-actions" style={{ justifyContent: "space-between" }}>
                    <strong>{section.title}</strong>
                    <StatusPill tone={section.audience === "member" ? "warm" : "accent"}>
                      {section.audience === "member" ? "멤버 전용" : "공개"}
                    </StatusPill>
                  </div>
                  <p className="feature-copy">{section.description}</p>
                </div>
              ))}
              {!hasClubAccess && club.sections.some((section) => section.audience === "member") ? (
                <div className="surface-note">
                  <p className="feature-copy">멤버 전용 섹션은 가입 승인 후 클럽 안에서 확인할 수 있습니다.</p>
                </div>
              ) : null}
            </div>
          </SurfaceCard>
        </div>
      </div>

      <section className="surface-stack">
        <SectionHeader kicker="Modules" title="이 클럽에서 사용하는 핵심 모듈" />
        <SurfaceCard
          title="활성 모듈"
          description="가입 후 들어가면 아래 모듈 구성을 기준으로 읽고 따라갈 수 있습니다."
        >
          <div className="pill-row">
            {club.sampleModules.map((module) => (
              <span className="module-pill" key={`${club.slug}-${module}`}>
                {module}
              </span>
            ))}
          </div>
        </SurfaceCard>
      </section>
    </PageShell>
  );
}
