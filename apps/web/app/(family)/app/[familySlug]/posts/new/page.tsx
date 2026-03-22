import Link from "next/link";

import { SurfaceCard } from "@ysplan/ui";

import { createPostAction } from "src/actions/content-actions";
import { PostFormFields } from "src/components/content-module-forms";
import { ContentMessageCard } from "src/components/content-module-shell";
import { FamilyAppShell } from "src/components/family-app-shell";
import { buildFamilyModuleHref, getFamilyModuleRouteSpec } from "src/lib/family-app-routes";
import { getContentErrorMessage } from "src/lib/content-modules";
import { requireFamilyAppAccess } from "src/lib/family-app-context";

type NewPostPageProps = {
  params: Promise<{ familySlug: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function NewPostPage(props: NewPostPageProps) {
  const { familySlug } = await props.params;
  const searchParams = await props.searchParams;
  const { workspaceView, viewerRole, canManage } = await requireFamilyAppAccess(familySlug);
  const spec = getFamilyModuleRouteSpec("posts");
  const errorMessage = getContentErrorMessage(searchParams.error);

  if (!spec) {
    return null;
  }

  return (
    <FamilyAppShell
      actions={<Link className="button button--ghost" href={buildFamilyModuleHref(familySlug, "posts")}>목록으로</Link>}
      canManage={canManage}
      subtitle="글은 recent 흐름에 들어가므로 제목, 요약, 카테고리 배지가 홈 카드와 상세에 함께 반영됩니다."
      title="새 글 작성"
      viewerRole={viewerRole}
      workspaceView={workspaceView}
    >
      {errorMessage ? <ContentMessageCard title="다시 확인해 주세요" tone="warm">{errorMessage}</ContentMessageCard> : null}

      <SurfaceCard
        description={spec.summary}
        title="글 작성 폼"
        footer={
          <div className="inline-actions">
            <button className="button button--primary" form="post-create-form" type="submit">
              글 저장
            </button>
            <Link className="button button--secondary" href={buildFamilyModuleHref(familySlug, "posts")}>
              취소
            </Link>
          </div>
        }
      >
        <form action={createPostAction} className="form-stack" id="post-create-form">
          <input name="familySlug" type="hidden" value={familySlug} />
          <PostFormFields />
        </form>
      </SurfaceCard>
    </FamilyAppShell>
  );
}
