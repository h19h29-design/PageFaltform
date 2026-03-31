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
import { listClubAnnouncementRecords } from "src/lib/club-content-store";
import {
  getClubContentCrudMessage,
  getClubContentErrorMessage,
  getClubContentModuleDefinition,
} from "src/lib/club-content-modules";
import {
  formatClubUpdatedAt,
  getClubSeverityLabel,
  getClubSeverityTone,
  getClubVisibilityCopy,
} from "src/lib/club-content-view";
import { requireClubAppAccess } from "src/lib/club-app-access";

type ClubAnnouncementsPageProps = {
  params: Promise<{ clubSlug: string }>;
  searchParams: Promise<{ state?: string; error?: string }>;
};

export default async function ClubAnnouncementsPage(props: ClubAnnouncementsPageProps) {
  const { clubSlug } = await props.params;
  const searchParams = await props.searchParams;
  const access = await requireClubAppAccess(clubSlug);
  const records = await listClubAnnouncementRecords(clubSlug);
  const message = getClubContentCrudMessage("announcements", searchParams.state);
  const errorMessage = getClubContentErrorMessage(searchParams.error);
  const definition = getClubContentModuleDefinition("announcements");

  return (
    <ClubAppShell access={access}>
      {message ? <ContentMessageCard title="처리 완료" tone="accent">{message}</ContentMessageCard> : null}
      {errorMessage ? <ContentMessageCard title="다시 확인해 주세요" tone="warm">{errorMessage}</ContentMessageCard> : null}

      <section className="surface-stack">
        <SectionHeader
          kicker="게시판"
          title="공지"
          action={
            <div className="inline-actions">
              {access.canManage ? (
                <Link className="button button--secondary" href={buildClubAppModuleNewHref(clubSlug, "announcements")}>
                  새 공지
                </Link>
              ) : null}
              <Link className="button button--ghost" href={buildClubAppHomeHref(clubSlug)}>
                클럽 홈
              </Link>
            </div>
          }
        />

        <div className="grid-two">
          <SurfaceCard title="공지 현황" badge={<StatusPill tone="accent">{records.length}건</StatusPill>}>
            <MetricList
              items={[
                { label: "전체", value: `${records.length}건` },
                { label: "상단 고정", value: `${records.filter((record) => record.pinned).length}건` },
                { label: "중요 이상", value: `${records.filter((record) => record.severity !== "normal").length}건` },
                { label: "홈 노출", value: `${records.filter((record) => record.featured).length}건` },
              ]}
            />
          </SurfaceCard>

          <SurfaceCard title="현재 보드" badge={<StatusPill tone="warm">{definition.label}</StatusPill>}>
            <p className="feature-copy">중요 공지는 위로, 일반 공지는 아래로 정리됩니다.</p>
            <p className="feature-copy">관리자는 상단 고정과 홈 노출을 동시에 설정할 수 있습니다.</p>
          </SurfaceCard>
        </div>
      </section>

      <section className="surface-stack">
        <SectionHeader kicker="공지 보드" title="전체 공지" action={<StatusPill>{records.length}건</StatusPill>} />
        {records.length === 0 ? (
          <SurfaceCard
            title={definition.emptyTitle}
            description={definition.emptyDescription}
            footer={
              access.canManage ? (
                <Link className="button button--secondary" href={buildClubAppModuleNewHref(clubSlug, "announcements")}>
                  첫 공지 만들기
                </Link>
              ) : null
            }
          />
        ) : (
          <div className="notice-stack">
            {records.map((record) => (
              <SurfaceCard
                key={record.id}
                title={record.title}
                description={record.summary}
                badge={<StatusPill tone={getClubSeverityTone(record.severity)}>{getClubSeverityLabel(record.severity)}</StatusPill>}
                className="notice-card"
                footer={
                  <div className="inline-actions">
                    <Link className="button button--secondary button--small" href={buildClubAppModuleDetailHref(clubSlug, "announcements", record.slug)}>
                      상세
                    </Link>
                    {access.canManage ? (
                      <Link className="button button--ghost button--small" href={buildClubAppModuleEditHref(clubSlug, "announcements", record.slug)}>
                        수정
                      </Link>
                    ) : null}
                  </div>
                }
              >
                <div className="pill-row">
                  {record.pinned ? <StatusPill tone="warm">상단 고정</StatusPill> : null}
                  {record.featured ? <StatusPill tone="accent">홈 노출</StatusPill> : null}
                  <StatusPill>{getClubVisibilityCopy(record.visibility)}</StatusPill>
                  <StatusPill>{formatClubUpdatedAt(record.updatedAt)}</StatusPill>
                </div>
              </SurfaceCard>
            ))}
          </div>
        )}
      </section>
    </ClubAppShell>
  );
}
