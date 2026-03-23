import Link from "next/link";

import { HeroCard, MetricList, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import { ContentMessageCard } from "src/components/content-module-shell";
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
  getContentAudienceLabel,
  getContentRecordUpdatedLabel,
  getContentVisibilityLabel,
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

  const featuredRecord = records.find((record) => record.featured) ?? records[0] ?? null;
  const secondaryRecords = featuredRecord
    ? records.filter((record) => record.id !== featuredRecord.id)
    : [];

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
      subtitle="대표 글은 크게, 나머지 글은 기사 목록처럼 빠르게 훑을 수 있게 정리한 글 보드입니다."
      title="글 보드"
      viewerRole={viewerRole}
      workspaceView={workspaceView}
    >
      {message ? <ContentMessageCard title="저장 완료" tone="accent">{message}</ContentMessageCard> : null}
      {errorMessage ? <ContentMessageCard title="다시 확인해 주세요" tone="warm">{errorMessage}</ContentMessageCard> : null}

      <div className="grid-two">
        <SurfaceCard
          title="글 현황"
          description="업데이트, 가이드, 기록 글을 구분해 최근 흐름을 읽기 쉽게 정리했습니다."
          badge={<StatusPill tone="accent">{records.length}건</StatusPill>}
          tone="accent"
        >
          <MetricList
            items={[
              { label: "업데이트", value: `${records.filter((record) => record.category === "update").length}건` },
              { label: "가이드", value: `${records.filter((record) => record.category === "guide").length}건` },
              { label: "기록", value: `${records.filter((record) => record.category === "note").length}건` },
              { label: "대표 글", value: `${records.filter((record) => record.featured).length}건` },
            ]}
          />
        </SurfaceCard>

        <SurfaceCard
          title="보드 읽는 법"
          description="대표 글은 크게, 나머지 글은 짧은 요약과 배지 중심으로 빠르게 읽도록 구성했습니다."
          badge={<StatusPill tone="warm">recent 흐름</StatusPill>}
          tone="warm"
        >
          <ul className="stack-list compact-list">
            <li>대표 글은 상단에서 먼저 읽고 바로 상세로 들어갑니다.</li>
            <li>나머지 글은 글감과 성격만 빠르게 훑을 수 있게 요약합니다.</li>
            <li>글 카테고리는 배지로만 구분해 화면이 과하게 복잡해지지 않게 유지합니다.</li>
          </ul>
        </SurfaceCard>
      </div>

      {featuredRecord ? (
        <HeroCard
          eyebrow="대표 글"
          title={featuredRecord.title}
          subtitle={featuredRecord.excerpt}
          meta={
            <>
              <StatusPill tone="accent">{getPostCategoryLabel(featuredRecord.category)}</StatusPill>
              <StatusPill>{getContentAudienceLabel(featuredRecord.audience)}</StatusPill>
              <StatusPill>{getContentRecordUpdatedLabel(featuredRecord.updatedAt)}</StatusPill>
            </>
          }
          actions={
            <div className="inline-actions">
              <Link className="button button--secondary" href={buildFamilyModuleDetailHref(familySlug, "posts", featuredRecord.slug)}>
                전문 보기
              </Link>
              <Link className="button button--ghost" href={buildFamilyModuleEditHref(familySlug, "posts", featuredRecord.slug)}>
                수정
              </Link>
            </div>
          }
        >
          <SurfaceCard
            title="대표 글 메모"
            description="대표 글은 최근 카드 중에서도 먼저 읽히는 위치에 놓입니다."
            tone="accent"
          >
            <p className="feature-copy">{featuredRecord.body}</p>
          </SurfaceCard>
        </HeroCard>
      ) : null}

      <section className="surface-stack">
        <SectionHeader
          kicker="글 모아보기"
          title="최근 글"
          action={<StatusPill>{records.length}건</StatusPill>}
        />

        {records.length === 0 ? (
          <SurfaceCard
            title="아직 등록된 글이 없습니다."
            description="첫 글을 작성하면 가족 홈 recent 흐름과 상세 페이지가 함께 열립니다."
            footer={
              <Link className="button button--secondary" href={buildFamilyModuleNewHref(familySlug, "posts")}>
                첫 글 작성
              </Link>
            }
          />
        ) : (
          <div className="editorial-list">
            {(secondaryRecords.length > 0 ? secondaryRecords : records).map((record) => (
              <SurfaceCard
                key={record.id}
                title={record.title}
                description={record.excerpt}
                eyebrow={record.featured ? "대표 글" : "일반 글"}
                badge={<StatusPill tone={record.featured ? "accent" : "neutral"}>{getPostCategoryLabel(record.category)}</StatusPill>}
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
                className="editorial-card"
                {...(record.featured ? { tone: "accent" as const } : {})}
              >
                <p className="editorial-card__excerpt">{record.body}</p>
                <div className="pill-row">
                  <StatusPill>{getContentAudienceLabel(record.audience)}</StatusPill>
                  <StatusPill>{getContentVisibilityLabel(record.visibilityScope)}</StatusPill>
                  <StatusPill>{getContentRecordUpdatedLabel(record.updatedAt)}</StatusPill>
                </div>
              </SurfaceCard>
            ))}
          </div>
        )}
      </section>
    </FamilyAppShell>
  );
}
