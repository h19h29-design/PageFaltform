import Link from "next/link";
import { notFound } from "next/navigation";

import { HeroCard, MetricList, StatusPill, SurfaceCard } from "@ysplan/ui";

import { deleteAnnouncementAction } from "src/actions/content-actions";
import { ContentMessageCard } from "src/components/content-module-shell";
import { FamilyAppShell } from "src/components/family-app-shell";
import {
  buildFamilyModuleEditHref,
  buildFamilyModuleHref,
  getFamilyModuleRouteSpec,
} from "src/lib/family-app-routes";
import { getContentCrudMessage } from "src/lib/content-modules";
import {
  getAnnouncementRecord,
  getAnnouncementSeverityLabel,
  getContentAudienceLabel,
  getContentRecordUpdatedLabel,
  getContentVisibilityLabel,
} from "src/lib/content-store";
import { requireFamilyAppAccess } from "src/lib/family-app-context";

type AnnouncementDetailPageProps = {
  params: Promise<{ familySlug: string; announcementSlug: string }>;
  searchParams: Promise<{ state?: string }>;
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

export default async function AnnouncementDetailPage(props: AnnouncementDetailPageProps) {
  const { familySlug, announcementSlug } = await props.params;
  const searchParams = await props.searchParams;
  const { workspaceView, viewerRole, canManage } = await requireFamilyAppAccess(familySlug);
  const record = await getAnnouncementRecord(familySlug, announcementSlug);
  const spec = getFamilyModuleRouteSpec("announcements");
  const message = getContentCrudMessage("announcements", searchParams.state);

  if (!record || !spec) {
    notFound();
  }

  return (
    <FamilyAppShell
      actions={
        <div className="inline-actions">
          <Link className="button button--secondary" href={buildFamilyModuleEditHref(familySlug, "announcements", record.slug)}>
            수정
          </Link>
          <Link className="button button--ghost" href={buildFamilyModuleHref(familySlug, "announcements")}>
            목록
          </Link>
        </div>
      }
      canManage={canManage}
      subtitle={spec.summary}
      title="공지 상세"
      viewerRole={viewerRole}
      workspaceView={workspaceView}
    >
      {message ? <ContentMessageCard title="저장 완료" tone="accent">{message}</ContentMessageCard> : null}

      <HeroCard
        eyebrow="공지 상세"
        title={record.title}
        subtitle={record.excerpt}
        meta={
          <>
            <StatusPill tone={getSeverityPillTone(record.severity)}>
              {getAnnouncementSeverityLabel(record.severity)}
            </StatusPill>
            {record.pinned ? <StatusPill tone="warm">상단 고정</StatusPill> : null}
            {record.requiresReadAck ? <StatusPill>읽음 확인</StatusPill> : null}
            <StatusPill>{getContentVisibilityLabel(record.visibilityScope)}</StatusPill>
          </>
        }
      >
        <SurfaceCard title="홈 카드 반영" description="이 상세는 홈 카드가 눌렀을 때 실제로 이어지는 목적지입니다." tone="accent">
          <MetricList
            items={[
              { label: "최근 수정", value: getContentRecordUpdatedLabel(record.updatedAt) },
              { label: "읽음 확인", value: `${record.readAckConfirmed ?? 0}/${record.readAckTarget ?? 0}` },
              { label: "대상", value: getContentAudienceLabel(record.audience) },
              { label: "슬러그", value: record.slug },
            ]}
          />
        </SurfaceCard>
      </HeroCard>

      <div className="grid-two">
        <SurfaceCard title="본문" description="공지 전문">
          <p className="feature-copy">{record.body}</p>
        </SurfaceCard>

        <SurfaceCard title="노출 설정" description="홈과 목록에서 쓰이는 메타 정보">
          <ul className="stack-list">
            <li>심각도: {getAnnouncementSeverityLabel(record.severity)}</li>
            <li>노출 범위: {getContentVisibilityLabel(record.visibilityScope)}</li>
            <li>대상: {getContentAudienceLabel(record.audience)}</li>
            <li>노출 시작: {record.displayStartsAt ?? "-"}</li>
            <li>노출 종료: {record.displayEndsAt ?? "-"}</li>
          </ul>
        </SurfaceCard>
      </div>

      <SurfaceCard
        title="삭제"
        description="삭제 후에는 목록과 홈 카드 흐름에서 더 이상 보이지 않습니다."
        tone="warm"
      >
        <form action={deleteAnnouncementAction} className="inline-actions">
          <input name="familySlug" type="hidden" value={familySlug} />
          <input name="currentSlug" type="hidden" value={record.slug} />
          <button className="button button--ghost" type="submit">
            공지 삭제
          </button>
        </form>
      </SurfaceCard>
    </FamilyAppShell>
  );
}
