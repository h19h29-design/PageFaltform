import Link from "next/link";
import { notFound } from "next/navigation";

import { HeroCard, MetricList, StatusPill, SurfaceCard } from "@ysplan/ui";

import { deleteGalleryAction } from "src/actions/content-actions";
import { ContentMessageCard } from "src/components/content-module-shell";
import { FamilyAppShell } from "src/components/family-app-shell";
import {
  buildFamilyModuleEditHref,
  buildFamilyModuleHref,
  getFamilyModuleRouteSpec,
} from "src/lib/family-app-routes";
import { getContentCrudMessage } from "src/lib/content-modules";
import { getContentRecordUpdatedLabel, getGalleryRecord } from "src/lib/content-store";
import { requireFamilyAppAccess } from "src/lib/family-app-context";

type GalleryDetailPageProps = {
  params: Promise<{ familySlug: string; gallerySlug: string }>;
  searchParams: Promise<{ state?: string }>;
};

export default async function GalleryDetailPage(props: GalleryDetailPageProps) {
  const { familySlug, gallerySlug } = await props.params;
  const searchParams = await props.searchParams;
  const { workspaceView, viewerRole, canManage } = await requireFamilyAppAccess(familySlug);
  const record = await getGalleryRecord(familySlug, gallerySlug);
  const spec = getFamilyModuleRouteSpec("gallery");
  const message = getContentCrudMessage("gallery", searchParams.state);

  if (!record || !spec) {
    notFound();
  }

  return (
    <FamilyAppShell
      actions={
        <div className="inline-actions">
          <Link className="button button--secondary" href={buildFamilyModuleEditHref(familySlug, "gallery", record.slug)}>
            수정
          </Link>
          <Link className="button button--ghost" href={buildFamilyModuleHref(familySlug, "gallery")}>
            목록
          </Link>
        </div>
      }
      canManage={canManage}
      subtitle={spec.summary}
      title="갤러리 상세"
      viewerRole={viewerRole}
      workspaceView={workspaceView}
    >
      {message ? <ContentMessageCard title="저장 완료" tone="accent">{message}</ContentMessageCard> : null}

      <HeroCard
        eyebrow="Gallery detail"
        title={record.title}
        subtitle={record.caption}
        meta={
          <>
            <StatusPill tone={record.featured ? "accent" : "neutral"}>{record.photoCount}장</StatusPill>
            {record.featured ? <StatusPill tone="warm">featured</StatusPill> : null}
            <StatusPill>{record.visibilityScope}</StatusPill>
          </>
        }
      >
        <SurfaceCard title="recent 반영" description="사진 앨범은 recent/gallery 카드로 바로 이어집니다." tone="accent">
          <MetricList
            items={[
              { label: "사진 수", value: `${record.photoCount}장` },
              { label: "메모 수", value: `${record.noteCount ?? 0}개` },
              { label: "최근 수정", value: getContentRecordUpdatedLabel(record.updatedAt) },
              { label: "슬러그", value: record.slug },
            ]}
          />
        </SurfaceCard>
      </HeroCard>

      <div className="grid-two">
        <SurfaceCard title="기록 설명" description="앨범 상세 설명">
          <p className="feature-copy">{record.caption}</p>
        </SurfaceCard>

        <SurfaceCard title="메타" description="recent 카드와 목록에서 사용하는 정보">
          <ul className="stack-list">
            <li>노출 범위: {record.visibilityScope}</li>
            <li>대상: {record.audience}</li>
            <li>대표 이미지: {record.imageUrl ?? "-"}</li>
            <li>메모 수: {record.noteCount ?? 0}개</li>
          </ul>
        </SurfaceCard>
      </div>

      <SurfaceCard
        title="삭제"
        description="삭제 후에는 recent 홈 카드와 목록에서 더 이상 보이지 않습니다."
        tone="warm"
      >
        <form action={deleteGalleryAction} className="inline-actions">
          <input name="familySlug" type="hidden" value={familySlug} />
          <input name="currentSlug" type="hidden" value={record.slug} />
          <button className="button button--ghost" type="submit">
            갤러리 삭제
          </button>
        </form>
      </SurfaceCard>
    </FamilyAppShell>
  );
}
