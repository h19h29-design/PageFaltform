import Link from "next/link";
import { notFound } from "next/navigation";

import { SurfaceCard } from "@ysplan/ui";

import { deleteClubEventAction, updateClubEventAction } from "src/actions/club-content-actions";
import { ClubEventFormFields } from "src/components/club-content-forms";
import { ClubAppShell } from "src/components/club-app-shell";
import { ContentMessageCard } from "src/components/content-module-shell";
import { buildClubAppModuleDetailHref } from "src/lib/club-app-routes";
import { getClubEventRecord } from "src/lib/club-content-store";
import { getClubContentErrorMessage } from "src/lib/club-content-modules";
import { requireClubManageAccess } from "src/lib/club-app-access";

type EditClubEventPageProps = {
  params: Promise<{ clubSlug: string; eventSlug: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditClubEventPage(props: EditClubEventPageProps) {
  const { clubSlug, eventSlug } = await props.params;
  const searchParams = await props.searchParams;
  const access = await requireClubManageAccess(clubSlug);
  const record = await getClubEventRecord(clubSlug, eventSlug);
  const errorMessage = getClubContentErrorMessage(searchParams.error);

  if (!record) {
    notFound();
  }

  return (
    <ClubAppShell access={access}>
      {errorMessage ? <ContentMessageCard title="다시 확인해 주세요" tone="warm">{errorMessage}</ContentMessageCard> : null}

      <SurfaceCard
        title="일정 수정"
        footer={
          <div className="inline-actions">
            <button className="button button--primary" form="club-event-edit-form" type="submit">
              수정 저장
            </button>
            <Link className="button button--secondary" href={buildClubAppModuleDetailHref(clubSlug, "events", record.slug)}>
              취소
            </Link>
          </div>
        }
      >
        <form action={updateClubEventAction} className="form-stack" id="club-event-edit-form">
          <input name="clubSlug" type="hidden" value={clubSlug} />
          <input name="currentSlug" type="hidden" value={record.slug} />
          <ClubEventFormFields initial={record} />
        </form>
      </SurfaceCard>

      <SurfaceCard title="삭제" tone="warm">
        <form action={deleteClubEventAction} className="inline-actions">
          <input name="clubSlug" type="hidden" value={clubSlug} />
          <input name="currentSlug" type="hidden" value={record.slug} />
          <button className="button button--ghost" type="submit">
            일정 삭제
          </button>
        </form>
      </SurfaceCard>
    </ClubAppShell>
  );
}
