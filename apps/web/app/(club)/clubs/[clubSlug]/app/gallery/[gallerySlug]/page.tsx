import Link from "next/link";
import { notFound } from "next/navigation";

import { MetricList, StatusPill, SurfaceCard } from "@ysplan/ui";

import { deleteClubGalleryAction } from "src/actions/club-content-actions";
import { ClubAppShell } from "src/components/club-app-shell";
import { ContentMessageCard } from "src/components/content-module-shell";
import { buildClubAppModuleEditHref, buildClubAppModuleHref } from "src/lib/club-app-routes";
import { getClubGalleryRecord } from "src/lib/club-content-store";
import { getClubContentCrudMessage } from "src/lib/club-content-modules";
import {
  formatClubUpdatedAt,
  getClubVisibilityCopy,
} from "src/lib/club-content-view";
import { requireClubAppAccess } from "src/lib/club-app-access";

type ClubGalleryDetailPageProps = {
  params: Promise<{ clubSlug: string; gallerySlug: string }>;
  searchParams: Promise<{ state?: string }>;
};

export default async function ClubGalleryDetailPage(props: ClubGalleryDetailPageProps) {
  const { clubSlug, gallerySlug } = await props.params;
  const searchParams = await props.searchParams;
  const access = await requireClubAppAccess(clubSlug);
  const record = await getClubGalleryRecord(clubSlug, gallerySlug);
  const message = getClubContentCrudMessage("gallery", searchParams.state);

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
            <StatusPill>{record.photoCount}장</StatusPill>
          </div>
          <div className="inline-actions">
            {access.canManage ? (
              <Link className="button button--secondary" href={buildClubAppModuleEditHref(clubSlug, "gallery", record.slug)}>
                수정
              </Link>
            ) : null}
            <Link className="button button--ghost" href={buildClubAppModuleHref(clubSlug, "gallery")}>
              목록
            </Link>
          </div>
        </div>

        <div className="grid-two">
          <SurfaceCard title={record.title}>
            <p className="feature-copy">{record.caption}</p>
            {record.imageUrl ? <p>{record.imageUrl}</p> : null}
          </SurfaceCard>

          <SurfaceCard title="상태">
            <MetricList
              items={[
                { label: "사진 수", value: `${record.photoCount}장` },
                { label: "메모 수", value: `${record.noteCount ?? 0}개` },
                { label: "공개 범위", value: getClubVisibilityCopy(record.visibility) },
                { label: "최근 수정", value: formatClubUpdatedAt(record.updatedAt) },
              ]}
            />
          </SurfaceCard>
        </div>
      </section>

      {access.canManage ? (
        <SurfaceCard title="삭제" tone="warm">
          <form action={deleteClubGalleryAction} className="inline-actions">
            <input name="clubSlug" type="hidden" value={clubSlug} />
            <input name="currentSlug" type="hidden" value={record.slug} />
            <button className="button button--ghost" type="submit">
              앨범 삭제
            </button>
          </form>
        </SurfaceCard>
      ) : null}
    </ClubAppShell>
  );
}
