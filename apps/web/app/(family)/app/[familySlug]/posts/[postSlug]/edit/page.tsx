import Link from "next/link";
import { notFound } from "next/navigation";

import { SurfaceCard } from "@ysplan/ui";

import { deletePostAction, updatePostAction } from "src/actions/content-actions";
import { PostFormFields } from "src/components/content-module-forms";
import { ContentMessageCard } from "src/components/content-module-shell";
import { FamilyAppShell } from "src/components/family-app-shell";
import {
  buildFamilyModuleDetailHref,
  buildFamilyModuleHref,
  getFamilyModuleRouteSpec,
} from "src/lib/family-app-routes";
import { getContentErrorMessage } from "src/lib/content-modules";
import { getPostRecord } from "src/lib/content-store";
import { requireFamilyAppAccess } from "src/lib/family-app-context";

type EditPostPageProps = {
  params: Promise<{ familySlug: string; postSlug: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditPostPage(props: EditPostPageProps) {
  const { familySlug, postSlug } = await props.params;
  const searchParams = await props.searchParams;
  const { workspaceView, viewerRole, canManage } = await requireFamilyAppAccess(familySlug);
  const record = await getPostRecord(familySlug, postSlug);
  const spec = getFamilyModuleRouteSpec("posts");
  const errorMessage = getContentErrorMessage(searchParams.error);

  if (!record || !spec) {
    notFound();
  }

  return (
    <FamilyAppShell
      actions={
        <div className="inline-actions">
          <Link className="button button--secondary" href={buildFamilyModuleDetailHref(familySlug, "posts", record.slug)}>
            상세로
          </Link>
          <Link className="button button--ghost" href={buildFamilyModuleHref(familySlug, "posts")}>
            목록
          </Link>
        </div>
      }
      canManage={canManage}
      subtitle="수정 후 저장하면 상세와 recent 흐름이 함께 갱신됩니다."
      title="글 수정"
      viewerRole={viewerRole}
      workspaceView={workspaceView}
    >
      {errorMessage ? <ContentMessageCard title="다시 확인해 주세요" tone="warm">{errorMessage}</ContentMessageCard> : null}

      <SurfaceCard
        description={spec.summary}
        title="글 편집 폼"
        footer={
          <div className="inline-actions">
            <button className="button button--primary" form="post-edit-form" type="submit">
              수정 저장
            </button>
            <Link className="button button--secondary" href={buildFamilyModuleDetailHref(familySlug, "posts", record.slug)}>
              취소
            </Link>
          </div>
        }
      >
        <form action={updatePostAction} className="form-stack" id="post-edit-form">
          <input name="familySlug" type="hidden" value={familySlug} />
          <input name="currentSlug" type="hidden" value={record.slug} />
          <PostFormFields initial={record} />
        </form>
      </SurfaceCard>

      <SurfaceCard title="삭제" description="현재 글을 제거하고 목록으로 돌아갑니다." tone="warm">
        <form action={deletePostAction} className="inline-actions">
          <input name="familySlug" type="hidden" value={familySlug} />
          <input name="currentSlug" type="hidden" value={record.slug} />
          <button className="button button--ghost" type="submit">
            글 삭제
          </button>
        </form>
      </SurfaceCard>
    </FamilyAppShell>
  );
}
