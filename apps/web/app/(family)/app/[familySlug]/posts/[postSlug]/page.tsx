import Link from "next/link";
import { notFound } from "next/navigation";

import { HeroCard, MetricList, StatusPill, SurfaceCard } from "@ysplan/ui";

import { deletePostAction } from "src/actions/content-actions";
import { ContentMessageCard } from "src/components/content-module-shell";
import { FamilyAppShell } from "src/components/family-app-shell";
import {
  buildFamilyModuleEditHref,
  buildFamilyModuleHref,
  getFamilyModuleRouteSpec,
} from "src/lib/family-app-routes";
import { getContentCrudMessage } from "src/lib/content-modules";
import {
  getContentAudienceLabel,
  getContentRecordUpdatedLabel,
  getContentVisibilityLabel,
  getPostCategoryLabel,
  getPostRecord,
} from "src/lib/content-store";
import { requireFamilyAppAccess } from "src/lib/family-app-context";

type PostDetailPageProps = {
  params: Promise<{ familySlug: string; postSlug: string }>;
  searchParams: Promise<{ state?: string }>;
};

export default async function PostDetailPage(props: PostDetailPageProps) {
  const { familySlug, postSlug } = await props.params;
  const searchParams = await props.searchParams;
  const { workspaceView, viewerRole, canManage } = await requireFamilyAppAccess(familySlug);
  const record = await getPostRecord(familySlug, postSlug);
  const spec = getFamilyModuleRouteSpec("posts");
  const message = getContentCrudMessage("posts", searchParams.state);

  if (!record || !spec) {
    notFound();
  }

  return (
    <FamilyAppShell
      actions={
        <div className="inline-actions">
          <Link className="button button--secondary" href={buildFamilyModuleEditHref(familySlug, "posts", record.slug)}>
            수정
          </Link>
          <Link className="button button--ghost" href={buildFamilyModuleHref(familySlug, "posts")}>
            목록
          </Link>
        </div>
      }
      canManage={canManage}
      subtitle={spec.summary}
      title="글 상세"
      viewerRole={viewerRole}
      workspaceView={workspaceView}
    >
      {message ? <ContentMessageCard title="저장 완료" tone="accent">{message}</ContentMessageCard> : null}

      <HeroCard
        eyebrow="글 상세"
        title={record.title}
        subtitle={record.excerpt}
        meta={
          <>
            <StatusPill tone={record.featured ? "accent" : "neutral"}>{getPostCategoryLabel(record.category)}</StatusPill>
            {record.featured ? <StatusPill tone="warm">대표 글</StatusPill> : null}
            <StatusPill>{getContentVisibilityLabel(record.visibilityScope)}</StatusPill>
          </>
        }
      >
        <SurfaceCard title="recent 반영" description="글 카드는 recent band 안에서만 경쟁합니다." tone="accent">
          <MetricList
            items={[
              { label: "최근 수정", value: getContentRecordUpdatedLabel(record.updatedAt) },
              { label: "대상", value: getContentAudienceLabel(record.audience) },
              { label: "카테고리", value: getPostCategoryLabel(record.category) },
              { label: "슬러그", value: record.slug },
            ]}
          />
        </SurfaceCard>
      </HeroCard>

      <div className="grid-two">
        <SurfaceCard title="본문" description="글 전문">
          <p className="feature-copy">{record.body}</p>
        </SurfaceCard>

        <SurfaceCard title="메타" description="recent 카드와 목록에서 사용하는 정보">
          <ul className="stack-list">
            <li>카테고리: {getPostCategoryLabel(record.category)}</li>
            <li>노출 범위: {getContentVisibilityLabel(record.visibilityScope)}</li>
            <li>대상: {getContentAudienceLabel(record.audience)}</li>
            <li>대표 이미지: {record.imageUrl ?? "-"}</li>
          </ul>
        </SurfaceCard>
      </div>

      <SurfaceCard
        title="삭제"
        description="삭제 후에는 recent 목록과 홈 카드 흐름에서 더 이상 보이지 않습니다."
        tone="warm"
      >
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
