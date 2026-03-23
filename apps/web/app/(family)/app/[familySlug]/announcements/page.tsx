import Link from "next/link";

import { MetricList, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import { ContentMessageCard } from "src/components/content-module-shell";
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
  getContentAudienceLabel,
  getContentRecordUpdatedLabel,
  getContentVisibilityLabel,
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
    return "accent";
  }

  if (severity === "important") {
    return "warm";
  }

  return "neutral";
}

function getSeverityCardTone(severity: "urgent" | "important" | "general") {
  if (severity === "urgent") {
    return { tone: "accent" as const, className: "notice-card notice-card--urgent" };
  }

  if (severity === "important") {
    return { tone: "warm" as const, className: "notice-card notice-card--important" };
  }

  return { className: "notice-card" };
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
      subtitle="꼭 봐야 할 공지는 더 굵게, 설명은 짧게 보여 주는 공지 보드입니다."
      title="공지 보드"
      viewerRole={viewerRole}
      workspaceView={workspaceView}
    >
      {message ? <ContentMessageCard title="저장 완료" tone="accent">{message}</ContentMessageCard> : null}
      {errorMessage ? <ContentMessageCard title="다시 확인해 주세요" tone="warm">{errorMessage}</ContentMessageCard> : null}

      <div className="grid-two">
        <SurfaceCard
          title="공지 현황"
          description="긴급, 읽음 확인, 상단 고정 공지가 몇 건인지 바로 보이게 정리했습니다."
          badge={<StatusPill tone="accent">{records.length}건</StatusPill>}
          tone="accent"
        >
          <MetricList
            items={[
              { label: "긴급", value: `${records.filter((record) => record.severity === "urgent").length}건` },
              { label: "중요", value: `${records.filter((record) => record.severity === "important").length}건` },
              { label: "읽음 확인", value: `${records.filter((record) => record.requiresReadAck).length}건` },
              { label: "상단 고정", value: `${records.filter((record) => record.pinned).length}건` },
            ]}
          />
        </SurfaceCard>

        <SurfaceCard
          title="보드 읽는 법"
          description="공지 보드는 '무엇을 꼭 봐야 하는지'가 먼저 보이게 설계했습니다."
          badge={<StatusPill tone="warm">홈 연동</StatusPill>}
          tone="warm"
        >
          <ul className="stack-list compact-list">
            <li>긴급 공지는 색과 순서에서 가장 먼저 눈에 들어옵니다.</li>
            <li>읽음 확인은 남은 인원을 숫자로 바로 확인합니다.</li>
            <li>상단 고정 공지는 최근 글 흐름과 분리해 따로 유지합니다.</li>
          </ul>
        </SurfaceCard>
      </div>

      <section className="surface-stack">
        <SectionHeader
          kicker="공지 보드"
          title="전체 공지"
          action={<StatusPill>{records.length}건</StatusPill>}
        />

        {records.length === 0 ? (
          <SurfaceCard
            title="아직 등록된 공지가 없습니다."
            description="첫 공지를 작성하면 가족 홈과 상세 화면으로 바로 이어집니다."
            footer={
              <Link className="button button--secondary" href={buildFamilyModuleNewHref(familySlug, "announcements")}>
                첫 공지 작성
              </Link>
            }
          />
        ) : (
          <div className="notice-stack">
            {records.map((record) => {
              const toneProps = getSeverityCardTone(record.severity);

              return (
                <SurfaceCard
                  key={record.id}
                  title={record.title}
                  description={record.excerpt}
                  eyebrow={
                    record.pinned ? "상단 고정 공지" : record.requiresReadAck ? "읽음 확인 공지" : "일반 공지"
                  }
                  badge={<StatusPill tone={getSeverityPillTone(record.severity)}>{getAnnouncementSeverityLabel(record.severity)}</StatusPill>}
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
                  {...toneProps}
                >
                  <p className="feature-copy">{record.body}</p>
                  <div className="pill-row">
                    {record.requiresReadAck ? (
                      <StatusPill>
                        읽음 {record.readAckConfirmed ?? 0}/{record.readAckTarget ?? 0}
                      </StatusPill>
                    ) : null}
                    <StatusPill>{getContentAudienceLabel(record.audience)}</StatusPill>
                    <StatusPill>{getContentVisibilityLabel(record.visibilityScope)}</StatusPill>
                    <StatusPill>{getContentRecordUpdatedLabel(record.updatedAt)}</StatusPill>
                  </div>
                </SurfaceCard>
              );
            })}
          </div>
        )}
      </section>
    </FamilyAppShell>
  );
}
