import Link from "next/link";

import { SurfaceCard } from "@ysplan/ui";

import { createClubAnnouncementAction } from "src/actions/club-content-actions";
import { ClubAnnouncementFormFields } from "src/components/club-content-forms";
import { ClubAppShell } from "src/components/club-app-shell";
import { ContentMessageCard } from "src/components/content-module-shell";
import { buildClubAppModuleHref } from "src/lib/club-app-routes";
import { getClubContentErrorMessage } from "src/lib/club-content-modules";
import { requireClubManageAccess } from "src/lib/club-app-access";

type NewClubAnnouncementPageProps = {
  params: Promise<{ clubSlug: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function NewClubAnnouncementPage(props: NewClubAnnouncementPageProps) {
  const { clubSlug } = await props.params;
  const searchParams = await props.searchParams;
  const access = await requireClubManageAccess(clubSlug);
  const errorMessage = getClubContentErrorMessage(searchParams.error);

  return (
    <ClubAppShell access={access}>
      {errorMessage ? <ContentMessageCard title="다시 확인해 주세요" tone="warm">{errorMessage}</ContentMessageCard> : null}

      <SurfaceCard
        title="새 공지"
        footer={
          <div className="inline-actions">
            <button className="button button--primary" form="club-announcement-create-form" type="submit">
              공지 저장
            </button>
            <Link className="button button--secondary" href={buildClubAppModuleHref(clubSlug, "announcements")}>
              취소
            </Link>
          </div>
        }
      >
        <form action={createClubAnnouncementAction} className="form-stack" id="club-announcement-create-form">
          <input name="clubSlug" type="hidden" value={clubSlug} />
          <ClubAnnouncementFormFields />
        </form>
      </SurfaceCard>
    </ClubAppShell>
  );
}
