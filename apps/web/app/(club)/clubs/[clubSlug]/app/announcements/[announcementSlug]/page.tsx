import Link from "next/link";
import { notFound } from "next/navigation";

import { MetricList, StatusPill, SurfaceCard } from "@ysplan/ui";

import { deleteClubAnnouncementAction } from "src/actions/club-content-actions";
import { ClubAppShell } from "src/components/club-app-shell";
import { ContentMessageCard } from "src/components/content-module-shell";
import { buildClubAppModuleEditHref, buildClubAppModuleHref } from "src/lib/club-app-routes";
import { getClubAnnouncementRecord } from "src/lib/club-content-store";
import { getClubContentCrudMessage } from "src/lib/club-content-modules";
import {
  formatClubUpdatedAt,
  getClubSeverityLabel,
  getClubSeverityTone,
  getClubVisibilityCopy,
} from "src/lib/club-content-view";
import { requireClubAppAccess } from "src/lib/club-app-access";

type ClubAnnouncementDetailPageProps = {
  params: Promise<{ clubSlug: string; announcementSlug: string }>;
  searchParams: Promise<{ state?: string }>;
};

export default async function ClubAnnouncementDetailPage(props: ClubAnnouncementDetailPageProps) {
  const { clubSlug, announcementSlug } = await props.params;
  const searchParams = await props.searchParams;
  const access = await requireClubAppAccess(clubSlug);
  const record = await getClubAnnouncementRecord(clubSlug, announcementSlug);
  const message = getClubContentCrudMessage("announcements", searchParams.state);

  if (!record) {
    notFound();
  }

  return (
    <ClubAppShell access={access}>
      {message ? <ContentMessageCard title="처리 완료" tone="accent">{message}</ContentMessageCard> : null}

      <section className="surface-stack">
        <div className="inline-actions" style={{ justifyContent: "space-between" }}>
          <div className="pill-row">
            <StatusPill tone={getClubSeverityTone(record.severity)}>{getClubSeverityLabel(record.severity)}</StatusPill>
            {record.pinned ? <StatusPill tone="warm">상단 고정</StatusPill> : null}
            {record.featured ? <StatusPill tone="accent">홈 노출</StatusPill> : null}
            <StatusPill>{getClubVisibilityCopy(record.visibility)}</StatusPill>
          </div>
          <div className="inline-actions">
            {access.canManage ? (
              <Link className="button button--secondary" href={buildClubAppModuleEditHref(clubSlug, "announcements", record.slug)}>
                수정
              </Link>
            ) : null}
            <Link className="button button--ghost" href={buildClubAppModuleHref(clubSlug, "announcements")}>
              목록
            </Link>
          </div>
        </div>

        <div className="grid-two">
          <SurfaceCard title={record.title}>
            <p className="feature-copy">{record.summary}</p>
            <p>{record.body}</p>
          </SurfaceCard>

          <SurfaceCard title="상태">
            <MetricList
              items={[
                { label: "최근 수정", value: formatClubUpdatedAt(record.updatedAt) },
                { label: "공개 범위", value: getClubVisibilityCopy(record.visibility) },
                { label: "상단 고정", value: record.pinned ? "사용" : "꺼짐" },
                { label: "홈 노출", value: record.featured ? "사용" : "꺼짐" },
              ]}
            />
          </SurfaceCard>
        </div>
      </section>

      {access.canManage ? (
        <SurfaceCard title="삭제" tone="warm">
          <form action={deleteClubAnnouncementAction} className="inline-actions">
            <input name="clubSlug" type="hidden" value={clubSlug} />
            <input name="currentSlug" type="hidden" value={record.slug} />
            <button className="button button--ghost" type="submit">
              공지 삭제
            </button>
          </form>
        </SurfaceCard>
      ) : null}
    </ClubAppShell>
  );
}
