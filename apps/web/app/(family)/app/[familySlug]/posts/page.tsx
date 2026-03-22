import Link from "next/link";

import { MetricList, SectionHeader, StatusPill } from "@ysplan/ui";

import { ContentMessageCard, ContentRecordCard } from "src/components/content-module-shell";
import { FamilyAppShell } from "src/components/family-app-shell";
import {
  buildFamilyHomeHref,
  buildFamilyModuleDetailHref,
  buildFamilyModuleEditHref,
  buildFamilyModuleNewHref,
  getFamilyModuleRouteSpec,
} from "src/lib/family-app-routes";
import { getContentCrudMessage, getContentErrorMessage } from "src/lib/content-modules";
import {
  getContentRecordUpdatedLabel,
  getPostCategoryLabel,
  listPostRecords,
} from "src/lib/content-store";
import { requireFamilyAppAccess } from "src/lib/family-app-context";

type PostsPageProps = {
  params: Promise<{ familySlug: string }>;
  searchParams: Promise<{ state?: string; error?: string }>;
};

export default async function PostsPage(props: PostsPageProps) {
  const { familySlug } = await props.params;
  const searchParams = await props.searchParams;
  const { workspaceView, viewerRole, canManage } = await requireFamilyAppAccess(familySlug);
  const spec = getFamilyModuleRouteSpec("posts");
  const records = await listPostRecords(familySlug);
  const message = getContentCrudMessage("posts", searchParams.state);
  const errorMessage = getContentErrorMessage(searchParams.error);

  if (!spec) {
    return null;
  }

  return (
    <FamilyAppShell
      actions={
        <div className="inline-actions">
          <Link className="button button--secondary" href={buildFamilyModuleNewHref(familySlug, "posts")}>
            새 글
          </Link>
          <Link className="button button--ghost" href={buildFamilyHomeHref(familySlug)}>
            가족 홈
          </Link>
        </div>
      }
      canManage={canManage}
      subtitle={spec.summary}
      title="글 목록"
      viewerRole={viewerRole}
      workspaceView={workspaceView}
    >
      {message ? <ContentMessageCard title="저장 완료" tone="accent">{message}</ContentMessageCard> : null}
      {errorMessage ? <ContentMessageCard title="다시 확인해 주세요" tone="warm">{errorMessage}</ContentMessageCard> : null}

      <div className="grid-two">
        <ContentRecordCard
          badge={<StatusPill tone="accent">{records.length} posts</StatusPill>}
          description="글은 모두 recent/post 계열로 묶이되, badge와 featured만으로 성격 차이를 드러냅니다."
          title="글 현황"
          tone="accent"
        >
          <MetricList
            items={[
              { label: "업데이트", value: `${records.filter((record) => record.category === "update").length}건` },
              { label: "가이드", value: `${records.filter((record) => record.category === "guide").length}건` },
              { label: "기록", value: `${records.filter((record) => record.category === "note").length}건` },
              { label: "featured", value: `${records.filter((record) => record.featured).length}건` },
            ]}
          />
        </ContentRecordCard>

        <ContentRecordCard
          badge={<StatusPill tone="warm">recent lane</StatusPill>}
          description="공지처럼 긴급도를 올리지 않고 recent 안에서만 순서를 조정하도록 유지합니다."
          title="recent 흐름"
          tone="warm"
        >
          <ul className="stack-list">
            <li>업데이트, 가이드, 기록은 badge로만 구분됩니다.</li>
            <li>featured 글도 recent 구간 안에서만 앞으로 옵니다.</li>
            <li>홈에서 누르면 실제 상세 페이지로 이동해 전문을 바로 읽을 수 있습니다.</li>
          </ul>
        </ContentRecordCard>
      </div>

      <section className="surface-stack">
        <SectionHeader kicker="Posts" title="전체 글" action={<StatusPill>{records.length} entries</StatusPill>} />

        {records.length === 0 ? (
          <ContentRecordCard
            description="첫 글을 작성하면 recent 흐름과 상세 페이지가 함께 열립니다."
            title="아직 등록된 글이 없습니다."
            footer={
              <Link className="button button--secondary" href={buildFamilyModuleNewHref(familySlug, "posts")}>
                첫 글 작성
              </Link>
            }
          />
        ) : (
          <div className="route-card-grid">
            {records.map((record) => (
              <ContentRecordCard
                key={record.id}
                badge={<StatusPill tone={record.featured ? "accent" : "neutral"}>{getPostCategoryLabel(record.category)}</StatusPill>}
                description={record.excerpt}
                eyebrow={record.featured ? "Featured post" : "Post"}
                footer={
                  <div className="inline-actions">
                    <Link className="button button--secondary button--small" href={buildFamilyModuleDetailHref(familySlug, "posts", record.slug)}>
                      상세
                    </Link>
                    <Link className="button button--ghost button--small" href={buildFamilyModuleEditHref(familySlug, "posts", record.slug)}>
                      수정
                    </Link>
                  </div>
                }
                title={record.title}
                tone={record.featured ? "accent" : "default"}
              >
                <p className="feature-copy">{record.body}</p>
                <div className="pill-row">
                  <StatusPill>{record.visibilityScope}</StatusPill>
                  <StatusPill>{record.audience}</StatusPill>
                  <StatusPill>{getContentRecordUpdatedLabel(record.updatedAt)}</StatusPill>
                </div>
              </ContentRecordCard>
            ))}
          </div>
        )}
      </section>
    </FamilyAppShell>
  );
}
