import Link from "next/link";

import { SurfaceCard } from "@ysplan/ui";

import { createClubGalleryAction } from "src/actions/club-content-actions";
import { ClubGalleryFormFields } from "src/components/club-content-forms";
import { ClubAppShell } from "src/components/club-app-shell";
import { ContentMessageCard } from "src/components/content-module-shell";
import { buildClubAppModuleHref } from "src/lib/club-app-routes";
import { getClubContentErrorMessage } from "src/lib/club-content-modules";
import { requireClubManageAccess } from "src/lib/club-app-access";

type NewClubGalleryPageProps = {
  params: Promise<{ clubSlug: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function NewClubGalleryPage(props: NewClubGalleryPageProps) {
  const { clubSlug } = await props.params;
  const searchParams = await props.searchParams;
  const access = await requireClubManageAccess(clubSlug);
  const errorMessage = getClubContentErrorMessage(searchParams.error);

  return (
    <ClubAppShell access={access}>
      {errorMessage ? <ContentMessageCard title="다시 확인해 주세요" tone="warm">{errorMessage}</ContentMessageCard> : null}

      <SurfaceCard
        title="새 앨범"
        footer={
          <div className="inline-actions">
            <button className="button button--primary" form="club-gallery-create-form" type="submit">
              앨범 저장
            </button>
            <Link className="button button--secondary" href={buildClubAppModuleHref(clubSlug, "gallery")}>
              취소
            </Link>
          </div>
        }
      >
        <form action={createClubGalleryAction} className="form-stack" id="club-gallery-create-form">
          <input name="clubSlug" type="hidden" value={clubSlug} />
          <ClubGalleryFormFields />
        </form>
      </SurfaceCard>
    </ClubAppShell>
  );
}
