import Link from "next/link";

import { MetricList, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import { ClubAppShell } from "src/components/club-app-shell";
import { ContentMessageCard } from "src/components/content-module-shell";
import {
  buildClubAppHomeHref,
  buildClubAppModuleDetailHref,
  buildClubAppModuleEditHref,
  buildClubAppModuleNewHref,
} from "src/lib/club-app-routes";
import { listClubGalleryRecords } from "src/lib/club-content-store";
import {
  getClubContentCrudMessage,
  getClubContentErrorMessage,
  getClubContentModuleDefinition,
} from "src/lib/club-content-modules";
import {
  formatClubUpdatedAt,
  getClubGalleryBadgeCopy,
  getClubVisibilityCopy,
} from "src/lib/club-content-view";
import { requireClubAppAccess } from "src/lib/club-app-access";

type ClubGalleryPageProps = {
  params: Promise<{ clubSlug: string }>;
  searchParams: Promise<{ state?: string; error?: string }>;
};

export default async function ClubGalleryPage(props: ClubGalleryPageProps) {
  const { clubSlug } = await props.params;
  const searchParams = await props.searchParams;
  const access = await requireClubAppAccess(clubSlug);
  const records = await listClubGalleryRecords(clubSlug);
  const message = getClubContentCrudMessage("gallery", searchParams.state);
  const errorMessage = getClubContentErrorMessage(searchParams.error);
  const definition = getClubContentModuleDefinition("gallery");

  return (
    <ClubAppShell access={access}>
      {message ? <ContentMessageCard title="처리 완료" tone="accent">{message}</ContentMessageCard> : null}
      {errorMessage ? <ContentMessageCard title="다시 확인해 주세요" tone="warm">{errorMessage}</ContentMessageCard> : null}

      <section className="surface-stack">
        <SectionHeader
          kicker="게시판"
          title="갤러리"
          action={
            <div className="inline-actions">
              {access.canManage ? (
                <Link className="button button--secondary" href={buildClubAppModuleNewHref(clubSlug, "gallery")}>
                  새 앨범
                </Link>
              ) : null}
              <Link className="button button--ghost" href={buildClubAppHomeHref(clubSlug)}>
                클럽 홈
              </Link>
            </div>
          }
        />

        <div className="grid-two">
          <SurfaceCard title="갤러리 현황" badge={<StatusPill tone="accent">{records.length}건</StatusPill>}>
            <MetricList
              items={[
                { label: "전체", value: `${records.length}건` },
                { label: "사진 수", value: `${records.reduce((sum, record) => sum + record.photoCount, 0)}장` },
                { label: "메모 수", value: `${records.reduce((sum, record) => sum + (record.noteCount ?? 0), 0)}개` },
                { label: "홈 노출", value: `${records.filter((record) => record.featured).length}건` },
              ]}
            />
          </SurfaceCard>

          <SurfaceCard title="현재 보드" badge={<StatusPill tone="warm">{definition.label}</StatusPill>}>
            <p className="feature-copy">대표 앨범만 먼저 보이고, 나머지는 순서대로 이어집니다.</p>
            <p className="feature-copy">공개 앨범은 외부 방문자도 볼 수 있습니다.</p>
          </SurfaceCard>
        </div>
      </section>

      <section className="surface-stack">
        <SectionHeader kicker="갤러리 보드" title="전체 앨범" action={<StatusPill>{records.length}건</StatusPill>} />
        {records.length === 0 ? (
          <SurfaceCard
            title={definition.emptyTitle}
            description={definition.emptyDescription}
            footer={
              access.canManage ? (
                <Link className="button button--secondary" href={buildClubAppModuleNewHref(clubSlug, "gallery")}>
                  첫 앨범 만들기
                </Link>
              ) : null
            }
          />
        ) : (
          <div className="route-card-grid module-hub-grid">
            {records.map((record) => (
              <SurfaceCard
                key={record.id}
                title={record.title}
                description={record.caption}
                badge={<StatusPill tone={record.featured ? "accent" : "neutral"}>{getClubGalleryBadgeCopy(record)}</StatusPill>}
                className="module-hub-card"
                footer={
                  <div className="inline-actions">
                    <Link className="button button--secondary button--small" href={buildClubAppModuleDetailHref(clubSlug, "gallery", record.slug)}>
                      상세
                    </Link>
                    {access.canManage ? (
                      <Link className="button button--ghost button--small" href={buildClubAppModuleEditHref(clubSlug, "gallery", record.slug)}>
                        수정
                      </Link>
                    ) : null}
                  </div>
                }
              >
                <div className="pill-row">
                  <StatusPill>{record.photoCount}장</StatusPill>
                  <StatusPill>{record.noteCount ?? 0}개 메모</StatusPill>
                  <StatusPill>{getClubVisibilityCopy(record.visibility)}</StatusPill>
                </div>
                <p className="feature-copy">최근 수정 {formatClubUpdatedAt(record.updatedAt)}</p>
              </SurfaceCard>
            ))}
          </div>
        )}
      </section>
    </ClubAppShell>
  );
}
