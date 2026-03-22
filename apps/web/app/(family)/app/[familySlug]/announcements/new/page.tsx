import Link from "next/link";

import { SurfaceCard } from "@ysplan/ui";

import { createAnnouncementAction } from "src/actions/content-actions";
import { AnnouncementFormFields } from "src/components/content-module-forms";
import { ContentMessageCard } from "src/components/content-module-shell";
import { FamilyAppShell } from "src/components/family-app-shell";
import { buildFamilyModuleHref, getFamilyModuleRouteSpec } from "src/lib/family-app-routes";
import { getContentErrorMessage } from "src/lib/content-modules";
import { requireFamilyAppAccess } from "src/lib/family-app-context";

type NewAnnouncementPageProps = {
  params: Promise<{ familySlug: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function NewAnnouncementPage(props: NewAnnouncementPageProps) {
  const { familySlug } = await props.params;
  const searchParams = await props.searchParams;
  const { workspaceView, viewerRole, canManage } = await requireFamilyAppAccess(familySlug);
  const spec = getFamilyModuleRouteSpec("announcements");
  const errorMessage = getContentErrorMessage(searchParams.error);

  if (!spec) {
    return null;
  }

  return (
    <FamilyAppShell
      actions={
        <Link className="button button--ghost" href={buildFamilyModuleHref(familySlug, "announcements")}>
          목록으로
        </Link>
      }
      canManage={canManage}
      subtitle="긴급도와 읽음 확인까지 한 번에 입력하면 홈 hero/focus 흐름에도 바로 반영됩니다."
      title="새 공지 작성"
      viewerRole={viewerRole}
      workspaceView={workspaceView}
    >
      {errorMessage ? <ContentMessageCard title="다시 확인해 주세요" tone="warm">{errorMessage}</ContentMessageCard> : null}

      <SurfaceCard
        description={spec.summary}
        title="공지 작성 폼"
        footer={
          <div className="inline-actions">
            <button className="button button--primary" form="announcement-create-form" type="submit">
              공지 저장
            </button>
            <Link className="button button--secondary" href={buildFamilyModuleHref(familySlug, "announcements")}>
              취소
            </Link>
          </div>
        }
      >
        <form action={createAnnouncementAction} className="form-stack" id="announcement-create-form">
          <input name="familySlug" type="hidden" value={familySlug} />
          <AnnouncementFormFields />
        </form>
      </SurfaceCard>
    </FamilyAppShell>
  );
}
