import Link from "next/link";
import { notFound } from "next/navigation";

import { getPlatformAccountRoleLabel } from "@ysplan/auth";
import { HeroCard, MetricList, PageShell, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import { buildClubAppHomeHref } from "../../../../src/lib/club-app-routes";
import { getDisplayClub } from "../../../../src/lib/club-copy";
import { getLatestClubJoinRequestForUser } from "../../../../src/lib/club-join-requests";
import {
  buildClubContentSummary,
  listClubAnnouncementRecords,
  listClubEventRecords,
  listClubGalleryRecords,
} from "../../../../src/lib/club-content-store";
import { getClubViewerAccess, resolveClubPreviewFromSlug } from "../../../../src/lib/club-sites-store";
import { getActivePlatformUserSession } from "../../../../src/lib/server-sessions";
import { getSharedThemePreset } from "../../../../src/lib/shared-themes";

type ClubDetailPageProps = {
  params: Promise<{ clubSlug: string }>;
  searchParams: Promise<{ state?: string }>;
};

function getStateMessage(state?: string): string | null {
  switch (state) {
    case "request-sent":
      return "가입 신청을 보냈습니다. 운영진이 승인하면 바로 멤버 공간으로 들어갈 수 있습니다.";
    case "invite-only":
      return "이 클럽은 초대 우선 방식입니다. 운영진 초대가 있어야 참가할 수 있습니다.";
    case "already-pending":
      return "이미 가입 신청을 보냈습니다. 승인 결과를 기다려 주세요.";
    default:
      return null;
  }
}

export default async function ClubDetailPage(props: ClubDetailPageProps) {
  const { clubSlug } = await props.params;
  const searchParams = await props.searchParams;
  const platformSession = await getActivePlatformUserSession();
  const clubRecord = await resolveClubPreviewFromSlug(clubSlug, platformSession);

  if (!clubRecord) {
    notFound();
  }

  const club = getDisplayClub(clubRecord);
  const viewerAccess = await getClubViewerAccess(clubSlug, platformSession);
  const latestJoinRequest = platformSession
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
  const visibleSections = club.sections.filter((section) => section.audience === "public" || hasClubAccess);
  const [summary, announcements, events, gallery] = await Promise.all([
    buildClubContentSummary(club.slug),
    listClubAnnouncementRecords(club.slug),
    listClubEventRecords(club.slug),
    listClubGalleryRecords(club.slug),
  ]);

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
      {stateMessage ? <SurfaceCard title="상태" description={stateMessage} /> : null}
      {hasPendingRequest ? (
        <SurfaceCard title="승인 대기 중" description="운영진이 확인하기 전까지는 공개 소개만 볼 수 있습니다." />
      ) : null}

      <div className="detail-hero-grid">
        <HeroCard
          eyebrow={`${club.category} · ${theme.label}`}
          title={club.description}
          subtitle={club.currentFocus}
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
                  멤버 공간 열기
                </Link>
              ) : canJoin ? (
                <Link className="button button--primary" href={joinHref}>
                  가입 신청
                </Link>
              ) : null}
              <Link className="button button--secondary" href="/club">
                클럽 소개로
              </Link>
            </div>
          }
        >
          <MetricList
            items={[
              { label: "공지", value: `${summary.announcementCount}건` },
              { label: "일정", value: `${summary.eventCount}건` },
              { label: "앨범", value: `${summary.galleryCount}개` },
              { label: "메인 노출", value: `${summary.featuredCount}건` },
            ]}
          />
        </HeroCard>

        <div className="detail-sidebar">
          <SurfaceCard title="운영 요약">
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

          <SurfaceCard title="지금 볼 수 있는 것">
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
            </div>
          </SurfaceCard>
        </div>
      </div>

      <section className="surface-stack">
        <SectionHeader kicker="미리보기" title="최근 흐름" />
        <div className="grid-three">
          <SurfaceCard
            title={announcements[0]?.title ?? "공지 준비 중"}
            description={announcements[0]?.summary ?? "첫 공지를 기다리고 있습니다."}
          >
            {announcements[0] ? <StatusPill tone="accent">최신 공지</StatusPill> : null}
          </SurfaceCard>
          <SurfaceCard
            title={events[0]?.title ?? "일정 준비 중"}
            description={events[0]?.summary ?? "첫 일정을 기다리고 있습니다."}
          >
            {events[0] ? <StatusPill tone="warm">{events[0].location}</StatusPill> : null}
          </SurfaceCard>
          <SurfaceCard
            title={gallery[0]?.title ?? "갤러리 준비 중"}
            description={gallery[0]?.caption ?? "첫 앨범을 기다리고 있습니다."}
          >
            {gallery[0] ? <StatusPill>{gallery[0].photoCount}장</StatusPill> : null}
          </SurfaceCard>
        </div>
      </section>
    </PageShell>
  );
}
