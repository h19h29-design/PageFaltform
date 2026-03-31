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
import { listClubEventRecords } from "src/lib/club-content-store";
import {
  getClubContentCrudMessage,
  getClubContentErrorMessage,
  getClubContentModuleDefinition,
} from "src/lib/club-content-modules";
import {
  formatClubEventWindow,
  formatClubUpdatedAt,
  getClubVisibilityCopy,
} from "src/lib/club-content-view";
import { requireClubAppAccess } from "src/lib/club-app-access";

type ClubEventsPageProps = {
  params: Promise<{ clubSlug: string }>;
  searchParams: Promise<{ state?: string; error?: string }>;
};

export default async function ClubEventsPage(props: ClubEventsPageProps) {
  const { clubSlug } = await props.params;
  const searchParams = await props.searchParams;
  const access = await requireClubAppAccess(clubSlug);
  const records = await listClubEventRecords(clubSlug);
  const message = getClubContentCrudMessage("events", searchParams.state);
  const errorMessage = getClubContentErrorMessage(searchParams.error);
  const definition = getClubContentModuleDefinition("events");

  return (
    <ClubAppShell access={access}>
      {message ? <ContentMessageCard title="처리 완료" tone="accent">{message}</ContentMessageCard> : null}
      {errorMessage ? <ContentMessageCard title="다시 확인해 주세요" tone="warm">{errorMessage}</ContentMessageCard> : null}

      <section className="surface-stack">
        <SectionHeader
          kicker="게시판"
          title="일정"
          action={
            <div className="inline-actions">
              {access.canManage ? (
                <Link className="button button--secondary" href={buildClubAppModuleNewHref(clubSlug, "events")}>
                  새 일정
                </Link>
              ) : null}
              <Link className="button button--ghost" href={buildClubAppHomeHref(clubSlug)}>
                클럽 홈
              </Link>
            </div>
          }
        />

        <div className="grid-two">
          <SurfaceCard title="일정 현황" badge={<StatusPill tone="accent">{records.length}건</StatusPill>}>
            <MetricList
              items={[
                { label: "전체", value: `${records.length}건` },
                { label: "홈 노출", value: `${records.filter((record) => record.featured).length}건` },
                { label: "공개 일정", value: `${records.filter((record) => record.visibility === "public").length}건` },
                { label: "예상 인원", value: `${records.reduce((sum, record) => sum + (record.attendanceTarget ?? 0), 0)}명` },
              ]}
            />
          </SurfaceCard>

          <SurfaceCard title="현재 보드" badge={<StatusPill tone="warm">{definition.label}</StatusPill>}>
            <p className="feature-copy">가장 가까운 일정과 준비 장소를 먼저 보여줍니다.</p>
            <p className="feature-copy">공개 일정은 로그인 전 공개 화면에서도 확인할 수 있습니다.</p>
          </SurfaceCard>
        </div>
      </section>

      <section className="surface-stack">
        <SectionHeader kicker="일정 보드" title="전체 일정" action={<StatusPill>{records.length}건</StatusPill>} />
        {records.length === 0 ? (
          <SurfaceCard
            title={definition.emptyTitle}
            description={definition.emptyDescription}
            footer={
              access.canManage ? (
                <Link className="button button--secondary" href={buildClubAppModuleNewHref(clubSlug, "events")}>
                  첫 일정 만들기
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
                description={record.summary}
                badge={<StatusPill tone={record.featured ? "accent" : "neutral"}>{record.featured ? "홈 노출" : "일정"}</StatusPill>}
                className="module-hub-card"
                footer={
                  <div className="inline-actions">
                    <Link className="button button--secondary button--small" href={buildClubAppModuleDetailHref(clubSlug, "events", record.slug)}>
                      상세
                    </Link>
                    {access.canManage ? (
                      <Link className="button button--ghost button--small" href={buildClubAppModuleEditHref(clubSlug, "events", record.slug)}>
                        수정
                      </Link>
                    ) : null}
                  </div>
                }
              >
                <div className="pill-row">
                  <StatusPill>{formatClubEventWindow(record)}</StatusPill>
                  <StatusPill>{record.location}</StatusPill>
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
