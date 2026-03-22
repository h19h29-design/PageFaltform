import Link from "next/link";

import { MetricList, SectionHeader, StatusPill } from "@ysplan/ui";

import { ContentMessageCard, ContentRecordCard } from "src/components/content-module-shell";
import { FamilyAppShell } from "src/components/family-app-shell";
import {
  buildFamilyHomeHref,
  buildFamilyModuleDetailHref,
  buildFamilyModuleEditHref,
  buildFamilyModuleNewHref,
  getFamilyModuleRouteSpec,
} from "src/lib/family-app-routes";
import { getContentCrudMessage, getContentErrorMessage } from "src/lib/content-modules";
import {
  getAnnouncementSeverityLabel,
  getContentRecordUpdatedLabel,
  listAnnouncementRecords,
} from "src/lib/content-store";
import { requireFamilyAppAccess } from "src/lib/family-app-context";

type AnnouncementsPageProps = {
  params: Promise<{ familySlug: string }>;
  searchParams: Promise<{ state?: string; error?: string }>;
};

function getSeverityPillTone(
  severity: "urgent" | "important" | "general",
): "accent" | "warm" | "neutral" {
  if (severity === "urgent") {
    return "accent" as const;
  }

  if (severity === "important") {
    return "warm" as const;
  }

  return "neutral" as const;
}

function getSeverityCardTone(severity: "urgent" | "important" | "general"): "accent" | "warm" | "default" {
  if (severity === "urgent") {
    return "accent";
  }

  if (severity === "important") {
    return "warm";
  }

  return "default";
}

export default async function AnnouncementsPage(props: AnnouncementsPageProps) {
  const { familySlug } = await props.params;
  const searchParams = await props.searchParams;
  const { workspaceView, viewerRole, canManage } = await requireFamilyAppAccess(familySlug);
  const spec = getFamilyModuleRouteSpec("announcements");
  const records = await listAnnouncementRecords(familySlug);
  const message = getContentCrudMessage("announcements", searchParams.state);
  const errorMessage = getContentErrorMessage(searchParams.error);

  if (!spec) {
    return null;
  }

  return (
    <FamilyAppShell
      actions={
        <div className="inline-actions">
          <Link className="button button--secondary" href={buildFamilyModuleNewHref(familySlug, "announcements")}>
            새 공지
          </Link>
          <Link className="button button--ghost" href={buildFamilyHomeHref(familySlug)}>
            가족 홈
          </Link>
        </div>
      }
      canManage={canManage}
      subtitle={spec.summary}
      title="공지 목록"
      viewerRole={viewerRole}
      workspaceView={workspaceView}
    >
      {message ? <ContentMessageCard title="저장 완료" tone="accent">{message}</ContentMessageCard> : null}
      {errorMessage ? <ContentMessageCard title="다시 확인해 주세요" tone="warm">{errorMessage}</ContentMessageCard> : null}

      <div className="grid-two">
        <ContentRecordCard
          badge={<StatusPill tone="accent">{records.length} items</StatusPill>}
          description="긴급도, 읽음 확인, 고정 여부가 그대로 홈 카드 규칙과 연결됩니다."
          title="공지 현황"
          tone="accent"
        >
          <MetricList
            items={[
              { label: "긴급", value: `${records.filter((record) => record.severity === "urgent").length}건` },
              { label: "중요", value: `${records.filter((record) => record.severity === "important").length}건` },
              { label: "고정", value: `${records.filter((record) => record.pinned).length}건` },
              { label: "읽음 확인", value: `${records.filter((record) => record.requiresReadAck).length}건` },
            ]}
          />
        </ContentRecordCard>

        <ContentRecordCard
          badge={<StatusPill tone="warm">home-aware</StatusPill>}
          description="중요 이상 공지는 hero/focus 후보가 되고, pinned는 상단 고정 흐름으로 유지됩니다."
          title="홈 반영 규칙"
          tone="warm"
        >
          <ul className="stack-list">
            <li>긴급 공지는 hero 우선 후보로 노출됩니다.</li>
            <li>읽음 확인이 필요한 항목은 summary에 잔여 인원이 함께 반영됩니다.</li>
            <li>상단 고정 공지는 recent 흐름과 분리되어 pinned band에 머뭅니다.</li>
          </ul>
        </ContentRecordCard>
      </div>

      <section className="surface-stack">
        <SectionHeader
          kicker="Announcements"
          title="전체 공지"
          action={<StatusPill>{records.length} cards</StatusPill>}
        />

        {records.length === 0 ? (
          <ContentRecordCard
            description="첫 공지를 작성하면 가족 홈과 상세 화면으로 바로 이어집니다."
            title="아직 등록된 공지가 없습니다."
            footer={
              <Link className="button button--secondary" href={buildFamilyModuleNewHref(familySlug, "announcements")}>
                첫 공지 작성
              </Link>
            }
          />
        ) : (
          <div className="route-card-grid">
            {records.map((record) => (
              <ContentRecordCard
                key={record.id}
                badge={
                  <StatusPill tone={getSeverityPillTone(record.severity)}>
                    {getAnnouncementSeverityLabel(record.severity)}
                  </StatusPill>
                }
                description={record.excerpt}
                eyebrow={record.pinned ? "Pinned notice" : record.requiresReadAck ? "Read ack" : "Announcement"}
                footer={
                  <div className="inline-actions">
                    <Link className="button button--secondary button--small" href={buildFamilyModuleDetailHref(familySlug, "announcements", record.slug)}>
                      상세
                    </Link>
                    <Link className="button button--ghost button--small" href={buildFamilyModuleEditHref(familySlug, "announcements", record.slug)}>
                      수정
                    </Link>
                  </div>
                }
                title={record.title}
                tone={getSeverityCardTone(record.severity)}
              >
                <p className="feature-copy">{record.body}</p>
                <div className="pill-row">
                  {record.pinned ? <StatusPill tone="warm">상단 고정</StatusPill> : null}
                  {record.requiresReadAck ? <StatusPill>읽음 {record.readAckConfirmed ?? 0}/{record.readAckTarget ?? 0}</StatusPill> : null}
                  <StatusPill>{record.visibilityScope}</StatusPill>
                  <StatusPill>{getContentRecordUpdatedLabel(record.updatedAt)}</StatusPill>
                </div>
              </ContentRecordCard>
            ))}
          </div>
        )}
      </section>
    </FamilyAppShell>
  );
}
