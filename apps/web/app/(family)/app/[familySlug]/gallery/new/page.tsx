import Link from "next/link";

import { SurfaceCard } from "@ysplan/ui";

import { createGalleryAction } from "src/actions/content-actions";
import { GalleryFormFields } from "src/components/content-module-forms";
import { ContentMessageCard } from "src/components/content-module-shell";
import { FamilyAppShell } from "src/components/family-app-shell";
import { buildFamilyModuleHref, getFamilyModuleRouteSpec } from "src/lib/family-app-routes";
import { getContentErrorMessage } from "src/lib/content-modules";
import { requireFamilyAppAccess } from "src/lib/family-app-context";

type NewGalleryPageProps = {
  params: Promise<{ familySlug: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function NewGalleryPage(props: NewGalleryPageProps) {
  const { familySlug } = await props.params;
  const searchParams = await props.searchParams;
  const { workspaceView, viewerRole, canManage } = await requireFamilyAppAccess(familySlug);
  const spec = getFamilyModuleRouteSpec("gallery");
  const errorMessage = getContentErrorMessage(searchParams.error);

  if (!spec) {
    return null;
  }

  return (
    <FamilyAppShell
      actions={<Link className="button button--ghost" href={buildFamilyModuleHref(familySlug, "gallery")}>목록으로</Link>}
      canManage={canManage}
      subtitle="사진 수와 캡션을 넣으면 recent 스토리 카드와 상세 페이지가 함께 연결됩니다."
      title="새 갤러리 작성"
      viewerRole={viewerRole}
      workspaceView={workspaceView}
    >
      {errorMessage ? <ContentMessageCard title="다시 확인해 주세요" tone="warm">{errorMessage}</ContentMessageCard> : null}

      <SurfaceCard
        description={spec.summary}
        title="갤러리 작성 폼"
        footer={
          <div className="inline-actions">
            <button className="button button--primary" form="gallery-create-form" type="submit">
              갤러리 저장
            </button>
            <Link className="button button--secondary" href={buildFamilyModuleHref(familySlug, "gallery")}>
              취소
            </Link>
          </div>
        }
      >
        <form action={createGalleryAction} className="form-stack" id="gallery-create-form">
          <input name="familySlug" type="hidden" value={familySlug} />
          <GalleryFormFields />
        </form>
      </SurfaceCard>
    </FamilyAppShell>
  );
}
