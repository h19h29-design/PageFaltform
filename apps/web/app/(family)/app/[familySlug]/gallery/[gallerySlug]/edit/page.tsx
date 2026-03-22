import Link from "next/link";
import { notFound } from "next/navigation";

import { SurfaceCard } from "@ysplan/ui";

import { deleteGalleryAction, updateGalleryAction } from "src/actions/content-actions";
import { GalleryFormFields } from "src/components/content-module-forms";
import { ContentMessageCard } from "src/components/content-module-shell";
import { FamilyAppShell } from "src/components/family-app-shell";
import {
  buildFamilyModuleDetailHref,
  buildFamilyModuleHref,
  getFamilyModuleRouteSpec,
} from "src/lib/family-app-routes";
import { getContentErrorMessage } from "src/lib/content-modules";
import { getGalleryRecord } from "src/lib/content-store";
import { requireFamilyAppAccess } from "src/lib/family-app-context";

type EditGalleryPageProps = {
  params: Promise<{ familySlug: string; gallerySlug: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditGalleryPage(props: EditGalleryPageProps) {
  const { familySlug, gallerySlug } = await props.params;
  const searchParams = await props.searchParams;
  const { workspaceView, viewerRole, canManage } = await requireFamilyAppAccess(familySlug);
  const record = await getGalleryRecord(familySlug, gallerySlug);
  const spec = getFamilyModuleRouteSpec("gallery");
  const errorMessage = getContentErrorMessage(searchParams.error);

  if (!record || !spec) {
    notFound();
  }

  return (
    <FamilyAppShell
      actions={
        <div className="inline-actions">
          <Link className="button button--secondary" href={buildFamilyModuleDetailHref(familySlug, "gallery", record.slug)}>
            상세로
          </Link>
          <Link className="button button--ghost" href={buildFamilyModuleHref(familySlug, "gallery")}>
            목록
          </Link>
        </div>
      }
      canManage={canManage}
      subtitle="수정 후 저장하면 앨범 상세와 recent 흐름이 함께 갱신됩니다."
      title="갤러리 수정"
      viewerRole={viewerRole}
      workspaceView={workspaceView}
    >
      {errorMessage ? <ContentMessageCard title="다시 확인해 주세요" tone="warm">{errorMessage}</ContentMessageCard> : null}

      <SurfaceCard
        description={spec.summary}
        title="갤러리 편집 폼"
        footer={
          <div className="inline-actions">
            <button className="button button--primary" form="gallery-edit-form" type="submit">
              수정 저장
            </button>
            <Link className="button button--secondary" href={buildFamilyModuleDetailHref(familySlug, "gallery", record.slug)}>
              취소
            </Link>
          </div>
        }
      >
        <form action={updateGalleryAction} className="form-stack" id="gallery-edit-form">
          <input name="familySlug" type="hidden" value={familySlug} />
          <input name="currentSlug" type="hidden" value={record.slug} />
          <GalleryFormFields initial={record} />
        </form>
      </SurfaceCard>

      <SurfaceCard title="삭제" description="현재 앨범을 제거하고 목록으로 돌아갑니다." tone="warm">
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
