import Link from "next/link";

import { MetricList, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import { ClubAppShell } from "src/components/club-app-shell";
import {
  buildClubAppModuleDetailHref,
  buildClubAppModuleHref,
  buildClubAppModuleNewHref,
} from "src/lib/club-app-routes";
import {
  buildClubContentSummary,
  listClubAnnouncementRecords,
  listClubEventRecords,
  listClubGalleryRecords,
} from "src/lib/club-content-store";
import {
  formatClubEventWindow,
  getClubGalleryBadgeCopy,
  getClubSeverityLabel,
  getClubSeverityTone,
  getClubVisibilityCopy,
} from "src/lib/club-content-view";
import { requireClubAppAccess } from "src/lib/club-app-access";

type ClubAppHomePageProps = {
  params: Promise<{ clubSlug: string }>;
};

export default async function ClubAppHomePage({ params }: ClubAppHomePageProps) {
  const { clubSlug } = await params;
  const access = await requireClubAppAccess(clubSlug);
  const summary = await buildClubContentSummary(clubSlug);
  const [announcements, events, gallery] = await Promise.all([
    listClubAnnouncementRecords(clubSlug),
    listClubEventRecords(clubSlug),
    listClubGalleryRecords(clubSlug),
  ]);

  const latestAnnouncement = announcements[0] ?? null;
  const latestEvent = events[0] ?? null;
  const latestGallery = gallery[0] ?? null;

  return (
    <ClubAppShell access={access}>
      <section className="surface-stack">
        <SectionHeader
          kicker="지금 바로 보기"
          title="클럽 홈"
          action={<StatusPill tone="accent">{access.moduleEntries.length}개 모듈</StatusPill>}
        />

        <div className="grid-two">
          <SurfaceCard title="활동 요약" badge={<StatusPill tone="accent">실사용 보드</StatusPill>}>
            <MetricList
              items={[
                { label: "공지", value: `${summary.announcementCount}건` },
                { label: "일정", value: `${summary.eventCount}건` },
                { label: "앨범", value: `${summary.galleryCount}개` },
                { label: "홈 노출", value: `${summary.featuredCount}건` },
              ]}
            />
          </SurfaceCard>

          <SurfaceCard title="바로 쓰기" badge={<StatusPill tone="warm">빠른 이동</StatusPill>}>
            <div className="inline-actions">
              <Link className="button button--secondary" href={buildClubAppModuleHref(clubSlug, "announcements")}>
                공지
              </Link>
              <Link className="button button--secondary" href={buildClubAppModuleHref(clubSlug, "events")}>
                일정
              </Link>
              <Link className="button button--secondary" href={buildClubAppModuleHref(clubSlug, "gallery")}>
                갤러리
              </Link>
            </div>
            {access.canManage ? (
              <div className="inline-actions">
                <Link className="button button--ghost button--small" href={buildClubAppModuleNewHref(clubSlug, "announcements")}>
                  공지 쓰기
                </Link>
                <Link className="button button--ghost button--small" href={buildClubAppModuleNewHref(clubSlug, "events")}>
                  일정 추가
                </Link>
                <Link className="button button--ghost button--small" href={buildClubAppModuleNewHref(clubSlug, "gallery")}>
                  앨범 만들기
                </Link>
              </div>
            ) : null}
          </SurfaceCard>
        </div>
      </section>

      <section className="surface-stack">
        <SectionHeader kicker="최근 흐름" title="바로 이어보기" />
        <div className="grid-three">
          <SurfaceCard
            title={latestAnnouncement?.title ?? "공지 비어 있음"}
            description={latestAnnouncement?.summary ?? "아직 등록된 공지가 없습니다."}
            badge={
              latestAnnouncement ? (
                <StatusPill tone={getClubSeverityTone(latestAnnouncement.severity)}>
                  {getClubSeverityLabel(latestAnnouncement.severity)}
                </StatusPill>
              ) : (
                <StatusPill>공지</StatusPill>
              )
            }
            footer={
              <div className="inline-actions">
                <Link className="button button--secondary button--small" href={buildClubAppModuleHref(clubSlug, "announcements")}>
                  보드 열기
                </Link>
                {latestAnnouncement ? (
                  <Link className="button button--ghost button--small" href={buildClubAppModuleDetailHref(clubSlug, "announcements", latestAnnouncement.slug)}>
                    상세
                  </Link>
                ) : null}
              </div>
            }
          >
            {latestAnnouncement ? (
              <div className="pill-row">
                <StatusPill>{getClubVisibilityCopy(latestAnnouncement.visibility)}</StatusPill>
                {latestAnnouncement.pinned ? <StatusPill tone="warm">상단 고정</StatusPill> : null}
              </div>
            ) : null}
          </SurfaceCard>

          <SurfaceCard
            title={latestEvent?.title ?? "일정 비어 있음"}
            description={latestEvent?.summary ?? "아직 등록된 일정이 없습니다."}
            badge={<StatusPill tone={latestEvent?.featured ? "accent" : "neutral"}>{latestEvent ? "일정" : "대기"}</StatusPill>}
            footer={
              <div className="inline-actions">
                <Link className="button button--secondary button--small" href={buildClubAppModuleHref(clubSlug, "events")}>
                  보드 열기
                </Link>
                {latestEvent ? (
                  <Link className="button button--ghost button--small" href={buildClubAppModuleDetailHref(clubSlug, "events", latestEvent.slug)}>
                    상세
                  </Link>
                ) : null}
              </div>
            }
          >
            {latestEvent ? (
              <div className="pill-row">
                <StatusPill>{formatClubEventWindow(latestEvent)}</StatusPill>
                <StatusPill>{latestEvent.location}</StatusPill>
              </div>
            ) : null}
          </SurfaceCard>

          <SurfaceCard
            title={latestGallery?.title ?? "갤러리 비어 있음"}
            description={latestGallery?.caption ?? "아직 등록된 앨범이 없습니다."}
            badge={<StatusPill tone={latestGallery?.featured ? "accent" : "neutral"}>{latestGallery ? getClubGalleryBadgeCopy(latestGallery) : "대기"}</StatusPill>}
            footer={
              <div className="inline-actions">
                <Link className="button button--secondary button--small" href={buildClubAppModuleHref(clubSlug, "gallery")}>
                  보드 열기
                </Link>
                {latestGallery ? (
                  <Link className="button button--ghost button--small" href={buildClubAppModuleDetailHref(clubSlug, "gallery", latestGallery.slug)}>
                    상세
                  </Link>
                ) : null}
              </div>
            }
          >
            {latestGallery ? (
              <div className="pill-row">
                <StatusPill>{latestGallery.photoCount}장</StatusPill>
                <StatusPill>{getClubVisibilityCopy(latestGallery.visibility)}</StatusPill>
              </div>
            ) : null}
          </SurfaceCard>
        </div>
      </section>
    </ClubAppShell>
  );
}
