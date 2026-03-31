import Link from "next/link";
import { notFound } from "next/navigation";

import { SurfaceCard } from "@ysplan/ui";

import { deleteClubGalleryAction, updateClubGalleryAction } from "src/actions/club-content-actions";
import { ClubGalleryFormFields } from "src/components/club-content-forms";
import { ClubAppShell } from "src/components/club-app-shell";
import { ContentMessageCard } from "src/components/content-module-shell";
import { buildClubAppModuleDetailHref } from "src/lib/club-app-routes";
import { getClubGalleryRecord } from "src/lib/club-content-store";
import { getClubContentErrorMessage } from "src/lib/club-content-modules";
import { requireClubManageAccess } from "src/lib/club-app-access";

type EditClubGalleryPageProps = {
  params: Promise<{ clubSlug: string; gallerySlug: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditClubGalleryPage(props: EditClubGalleryPageProps) {
  const { clubSlug, gallerySlug } = await props.params;
  const searchParams = await props.searchParams;
  const access = await requireClubManageAccess(clubSlug);
  const record = await getClubGalleryRecord(clubSlug, gallerySlug);
  const errorMessage = getClubContentErrorMessage(searchParams.error);

  if (!record) {
    notFound();
  }

  return (
    <ClubAppShell access={access}>
      {errorMessage ? <ContentMessageCard title="다시 확인해 주세요" tone="warm">{errorMessage}</ContentMessageCard> : null}

      <SurfaceCard
        title="앨범 수정"
        footer={
          <div className="inline-actions">
            <button className="button button--primary" form="club-gallery-edit-form" type="submit">
              수정 저장
            </button>
            <Link className="button button--secondary" href={buildClubAppModuleDetailHref(clubSlug, "gallery", record.slug)}>
              취소
            </Link>
          </div>
        }
      >
        <form action={updateClubGalleryAction} className="form-stack" id="club-gallery-edit-form">
          <input name="clubSlug" type="hidden" value={clubSlug} />
          <input name="currentSlug" type="hidden" value={record.slug} />
          <ClubGalleryFormFields initial={record} />
        </form>
      </SurfaceCard>

      <SurfaceCard title="삭제" tone="warm">
        <form action={deleteClubGalleryAction} className="inline-actions">
          <input name="clubSlug" type="hidden" value={clubSlug} />
          <input name="currentSlug" type="hidden" value={record.slug} />
          <button className="button button--ghost" type="submit">
            앨범 삭제
          </button>
        </form>
      </SurfaceCard>
    </ClubAppShell>
  );
}
