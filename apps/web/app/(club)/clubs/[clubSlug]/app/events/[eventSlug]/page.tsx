import Link from "next/link";
import { notFound } from "next/navigation";

import { MetricList, StatusPill, SurfaceCard } from "@ysplan/ui";

import { deleteClubEventAction } from "src/actions/club-content-actions";
import { ClubAppShell } from "src/components/club-app-shell";
import { ContentMessageCard } from "src/components/content-module-shell";
import { buildClubAppModuleEditHref, buildClubAppModuleHref } from "src/lib/club-app-routes";
import { getClubEventRecord } from "src/lib/club-content-store";
import { getClubContentCrudMessage } from "src/lib/club-content-modules";
import {
  formatClubEventWindow,
  formatClubUpdatedAt,
  getClubVisibilityCopy,
} from "src/lib/club-content-view";
import { requireClubAppAccess } from "src/lib/club-app-access";

type ClubEventDetailPageProps = {
  params: Promise<{ clubSlug: string; eventSlug: string }>;
  searchParams: Promise<{ state?: string }>;
};

export default async function ClubEventDetailPage(props: ClubEventDetailPageProps) {
  const { clubSlug, eventSlug } = await props.params;
  const searchParams = await props.searchParams;
  const access = await requireClubAppAccess(clubSlug);
  const record = await getClubEventRecord(clubSlug, eventSlug);
  const message = getClubContentCrudMessage("events", searchParams.state);

  if (!record) {
    notFound();
  }

  return (
    <ClubAppShell access={access}>
      {message ? <ContentMessageCard title="처리 완료" tone="accent">{message}</ContentMessageCard> : null}

      <section className="surface-stack">
        <div className="inline-actions" style={{ justifyContent: "space-between" }}>
          <div className="pill-row">
            {record.featured ? <StatusPill tone="accent">홈 노출</StatusPill> : null}
            <StatusPill>{getClubVisibilityCopy(record.visibility)}</StatusPill>
            <StatusPill>{formatClubEventWindow(record)}</StatusPill>
          </div>
          <div className="inline-actions">
            {access.canManage ? (
              <Link className="button button--secondary" href={buildClubAppModuleEditHref(clubSlug, "events", record.slug)}>
                수정
              </Link>
            ) : null}
            <Link className="button button--ghost" href={buildClubAppModuleHref(clubSlug, "events")}>
              목록
            </Link>
          </div>
        </div>

        <div className="grid-two">
          <SurfaceCard title={record.title}>
            <p className="feature-copy">{record.summary}</p>
            <div className="pill-row">
              <StatusPill>{record.location}</StatusPill>
              {record.attendanceTarget !== undefined ? <StatusPill>{record.attendanceTarget}명 목표</StatusPill> : null}
            </div>
          </SurfaceCard>

          <SurfaceCard title="상태">
            <MetricList
              items={[
                { label: "일정 시간", value: formatClubEventWindow(record) },
                { label: "장소", value: record.location },
                { label: "공개 범위", value: getClubVisibilityCopy(record.visibility) },
                { label: "최근 수정", value: formatClubUpdatedAt(record.updatedAt) },
              ]}
            />
          </SurfaceCard>
        </div>
      </section>

      {access.canManage ? (
        <SurfaceCard title="삭제" tone="warm">
          <form action={deleteClubEventAction} className="inline-actions">
            <input name="clubSlug" type="hidden" value={clubSlug} />
            <input name="currentSlug" type="hidden" value={record.slug} />
            <button className="button button--ghost" type="submit">
              일정 삭제
            </button>
          </form>
        </SurfaceCard>
      ) : null}
    </ClubAppShell>
  );
}
