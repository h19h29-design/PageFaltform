import Link from "next/link";

import { SurfaceCard } from "@ysplan/ui";

import { createClubEventAction } from "src/actions/club-content-actions";
import { ClubEventFormFields } from "src/components/club-content-forms";
import { ClubAppShell } from "src/components/club-app-shell";
import { ContentMessageCard } from "src/components/content-module-shell";
import { buildClubAppModuleHref } from "src/lib/club-app-routes";
import { getClubContentErrorMessage } from "src/lib/club-content-modules";
import { requireClubManageAccess } from "src/lib/club-app-access";

type NewClubEventPageProps = {
  params: Promise<{ clubSlug: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function NewClubEventPage(props: NewClubEventPageProps) {
  const { clubSlug } = await props.params;
  const searchParams = await props.searchParams;
  const access = await requireClubManageAccess(clubSlug);
  const errorMessage = getClubContentErrorMessage(searchParams.error);

  return (
    <ClubAppShell access={access}>
      {errorMessage ? <ContentMessageCard title="다시 확인해 주세요" tone="warm">{errorMessage}</ContentMessageCard> : null}

      <SurfaceCard
        title="새 일정"
        footer={
          <div className="inline-actions">
            <button className="button button--primary" form="club-event-create-form" type="submit">
              일정 저장
            </button>
            <Link className="button button--secondary" href={buildClubAppModuleHref(clubSlug, "events")}>
              취소
            </Link>
          </div>
        }
      >
        <form action={createClubEventAction} className="form-stack" id="club-event-create-form">
          <input name="clubSlug" type="hidden" value={clubSlug} />
          <ClubEventFormFields />
        </form>
      </SurfaceCard>
    </ClubAppShell>
  );
}
