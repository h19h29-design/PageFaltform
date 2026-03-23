import Link from "next/link";
import { notFound } from "next/navigation";

import { HeroCard, MetricList, StatusPill, SurfaceCard } from "@ysplan/ui";

import { deleteDiaryAction } from "src/actions/content-actions";
import { ContentMessageCard } from "src/components/content-module-shell";
import { FamilyAppShell } from "src/components/family-app-shell";
import {
  buildFamilyModuleEditHref,
  buildFamilyModuleHref,
  getFamilyModuleRouteSpec,
} from "src/lib/family-app-routes";
import { getContentCrudMessage } from "src/lib/content-modules";
import {
  getContentAudienceLabel,
  getContentRecordUpdatedLabel,
  getContentVisibilityLabel,
  getDiaryBadgeLabel,
  getDiaryRecord,
} from "src/lib/content-store";
import { requireFamilyAppAccess } from "src/lib/family-app-context";

type DiaryDetailPageProps = {
  params: Promise<{ familySlug: string; entrySlug: string }>;
  searchParams: Promise<{ state?: string }>;
};

export default async function DiaryDetailPage(props: DiaryDetailPageProps) {
  const { familySlug, entrySlug } = await props.params;
  const searchParams = await props.searchParams;
  const { workspaceView, viewerRole, canManage } = await requireFamilyAppAccess(familySlug);
  const record = await getDiaryRecord(familySlug, entrySlug);
  const spec = getFamilyModuleRouteSpec("diary");
  const message = getContentCrudMessage("diary", searchParams.state);

  if (!record || !spec) {
    notFound();
  }

  return (
    <FamilyAppShell
      actions={
        <div className="inline-actions">
          <Link className="button button--secondary" href={buildFamilyModuleEditHref(familySlug, "diary", record.slug)}>
            수정
          </Link>
          <Link className="button button--ghost" href={buildFamilyModuleHref(familySlug, "diary")}>
            목록
          </Link>
        </div>
      }
      canManage={canManage}
      subtitle={spec.summary}
      title="일기 상세"
      viewerRole={viewerRole}
      workspaceView={workspaceView}
    >
      {message ? <ContentMessageCard title="저장 완료" tone="accent">{message}</ContentMessageCard> : null}

      <HeroCard
        eyebrow="일기 상세"
        title={record.title}
        subtitle={record.excerpt}
        meta={
          <>
            <StatusPill tone={record.highlighted ? "accent" : "neutral"}>{getDiaryBadgeLabel(record)}</StatusPill>
            {record.highlighted ? <StatusPill tone="warm">강조 기록</StatusPill> : null}
            <StatusPill>{getContentVisibilityLabel(record.visibilityScope)}</StatusPill>
          </>
        }
      >
        <SurfaceCard title="recent 어댑터" description="일기는 recent/post 계열에 연결되지만 diary moduleKey를 유지합니다." tone="accent">
          <MetricList
            items={[
              { label: "최근 수정", value: getContentRecordUpdatedLabel(record.updatedAt) },
              { label: "대상", value: getContentAudienceLabel(record.audience) },
              { label: "배지", value: getDiaryBadgeLabel(record) },
              { label: "슬러그", value: record.slug },
            ]}
          />
        </SurfaceCard>
      </HeroCard>

      <div className="grid-two">
        <SurfaceCard title="본문" description="일기 전문">
          <p className="feature-copy">{record.body}</p>
        </SurfaceCard>

        <SurfaceCard title="메타" description="home recent와 목록에서 사용하는 정보">
          <ul className="stack-list">
            <li>노출 범위: {getContentVisibilityLabel(record.visibilityScope)}</li>
            <li>대상: {getContentAudienceLabel(record.audience)}</li>
            <li>무드 배지: {getDiaryBadgeLabel(record)}</li>
            <li>강조 기록: {record.highlighted ? "예" : "아니오"}</li>
          </ul>
        </SurfaceCard>
      </div>

      <SurfaceCard
        title="삭제"
        description="삭제 후에는 recent 홈 카드와 목록에서 더 이상 보이지 않습니다."
        tone="warm"
      >
        <form action={deleteDiaryAction} className="inline-actions">
          <input name="familySlug" type="hidden" value={familySlug} />
          <input name="currentSlug" type="hidden" value={record.slug} />
          <button className="button button--ghost" type="submit">
            일기 삭제
          </button>
        </form>
      </SurfaceCard>
    </FamilyAppShell>
  );
}
