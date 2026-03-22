import Link from "next/link";

import { SurfaceCard } from "@ysplan/ui";

import { createDiaryAction } from "src/actions/content-actions";
import { DiaryFormFields } from "src/components/content-module-forms";
import { ContentMessageCard } from "src/components/content-module-shell";
import { FamilyAppShell } from "src/components/family-app-shell";
import { buildFamilyModuleHref, getFamilyModuleRouteSpec } from "src/lib/family-app-routes";
import { getContentErrorMessage } from "src/lib/content-modules";
import { requireFamilyAppAccess } from "src/lib/family-app-context";

type NewDiaryPageProps = {
  params: Promise<{ familySlug: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function NewDiaryPage(props: NewDiaryPageProps) {
  const { familySlug } = await props.params;
  const searchParams = await props.searchParams;
  const { workspaceView, viewerRole, canManage } = await requireFamilyAppAccess(familySlug);
  const spec = getFamilyModuleRouteSpec("diary");
  const errorMessage = getContentErrorMessage(searchParams.error);

  if (!spec) {
    return null;
  }

  return (
    <FamilyAppShell
      actions={<Link className="button button--ghost" href={buildFamilyModuleHref(familySlug, "diary")}>목록으로</Link>}
      canManage={canManage}
      subtitle="짧은 요약과 본문, 무드 배지를 입력하면 recent 어댑터와 상세 페이지가 함께 연결됩니다."
      title="새 일기 작성"
      viewerRole={viewerRole}
      workspaceView={workspaceView}
    >
      {errorMessage ? <ContentMessageCard title="다시 확인해 주세요" tone="warm">{errorMessage}</ContentMessageCard> : null}

      <SurfaceCard
        description={spec.summary}
        title="일기 작성 폼"
        footer={
          <div className="inline-actions">
            <button className="button button--primary" form="diary-create-form" type="submit">
              일기 저장
            </button>
            <Link className="button button--secondary" href={buildFamilyModuleHref(familySlug, "diary")}>
              취소
            </Link>
          </div>
        }
      >
        <form action={createDiaryAction} className="form-stack" id="diary-create-form">
          <input name="familySlug" type="hidden" value={familySlug} />
          <DiaryFormFields />
        </form>
      </SurfaceCard>
    </FamilyAppShell>
  );
}
