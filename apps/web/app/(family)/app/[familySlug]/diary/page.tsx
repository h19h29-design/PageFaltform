import Link from "next/link";

import { MetricList, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

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
  getDiaryBadgeLabel,
  listDiaryRecords,
} from "src/lib/content-store";
import { requireFamilyAppAccess } from "src/lib/family-app-context";

type DiaryPageProps = {
  params: Promise<{ familySlug: string }>;
  searchParams: Promise<{ state?: string; error?: string }>;
};

export default async function DiaryPage(props: DiaryPageProps) {
  const { familySlug } = await props.params;
  const searchParams = await props.searchParams;
  const { workspaceView, viewerRole, canManage } = await requireFamilyAppAccess(familySlug);
  const spec = getFamilyModuleRouteSpec("diary");
  const records = await listDiaryRecords(familySlug);
  const message = getContentCrudMessage("diary", searchParams.state);
  const errorMessage = getContentErrorMessage(searchParams.error);

  if (!spec) {
    return null;
  }

  const highlightedRecord = records.find((record) => record.highlighted) ?? records[0] ?? null;

  return (
    <FamilyAppShell
      actions={
        <div className="inline-actions">
          <Link className="button button--secondary" href={buildFamilyModuleNewHref(familySlug, "diary")}>
            새 일기
          </Link>
          <Link className="button button--ghost" href={buildFamilyHomeHref(familySlug)}>
            가족 홈
          </Link>
        </div>
      }
      canManage={canManage}
      subtitle="짧은 기록도 부담 없이 쌓이도록, 일기장을 타임라인처럼 읽게 만든 조용한 기록 보드입니다."
      title="일기장"
      viewerRole={viewerRole}
      workspaceView={workspaceView}
    >
      {message ? <ContentMessageCard title="저장 완료" tone="accent">{message}</ContentMessageCard> : null}
      {errorMessage ? <ContentMessageCard title="다시 확인해 주세요" tone="warm">{errorMessage}</ContentMessageCard> : null}

      <div className="grid-two">
        <SurfaceCard
          title="일기 현황"
          description="개인 기록과 가족 공유 기록을 나눠서 보되, 전체 흐름은 타임라인으로 읽을 수 있게 구성했습니다."
          badge={<StatusPill tone="accent">{records.length}건</StatusPill>}
          tone="accent"
        >
          <MetricList
            items={[
              { label: "가족 공유", value: `${records.filter((record) => record.audience === "family-shared").length}건` },
              { label: "개인 기록", value: `${records.filter((record) => record.audience === "personal").length}건` },
              { label: "강조 기록", value: `${records.filter((record) => record.highlighted).length}건` },
              { label: "비공개", value: `${records.filter((record) => record.visibilityScope === "private").length}건` },
            ]}
          />
        </SurfaceCard>

        <SurfaceCard
          title="보드 읽는 법"
          description="일기장은 빠르게 넘겨보되, 남겨둘 감정과 분위기가 흐르도록 여백을 조금 더 줬습니다."
          badge={<StatusPill tone="warm">조용한 흐름</StatusPill>}
          tone="warm"
        >
          <ul className="stack-list compact-list">
            <li>강조 기록은 상단에서 먼저 읽고, 이후 기록은 시간 흐름대로 이어집니다.</li>
            <li>배지는 기록의 분위기만 짧게 알려 주고 본문은 간결하게 보여 줍니다.</li>
            <li>공개 범위와 대상은 하단 메타로 정리해 시선이 분산되지 않게 했습니다.</li>
          </ul>
        </SurfaceCard>
      </div>

      {highlightedRecord ? (
        <SurfaceCard
          title={highlightedRecord.title}
          description={highlightedRecord.excerpt}
          eyebrow="오늘의 기록"
          badge={<StatusPill tone="accent">{getDiaryBadgeLabel(highlightedRecord)}</StatusPill>}
          tone="accent"
          footer={
            <div className="inline-actions">
              <Link className="button button--secondary button--small" href={buildFamilyModuleDetailHref(familySlug, "diary", highlightedRecord.slug)}>
                상세
              </Link>
              <Link className="button button--ghost button--small" href={buildFamilyModuleEditHref(familySlug, "diary", highlightedRecord.slug)}>
                수정
              </Link>
            </div>
          }
        >
          <p className="feature-copy">{highlightedRecord.body}</p>
        </SurfaceCard>
      ) : null}

      <section className="surface-stack">
        <SectionHeader
          kicker="일기장"
          title="기록 타임라인"
          action={<StatusPill>{records.length}건</StatusPill>}
        />

        {records.length === 0 ? (
          <SurfaceCard
            title="아직 등록된 일기가 없습니다."
            description="첫 일기를 작성하면 가족 홈 recent 흐름과 상세 페이지가 함께 열립니다."
            footer={
              <Link className="button button--secondary" href={buildFamilyModuleNewHref(familySlug, "diary")}>
                첫 일기 작성
              </Link>
            }
          />
        ) : (
          <div className="journal-timeline">
            {records.map((record) => (
              <SurfaceCard
                key={record.id}
                title={record.title}
                description={record.excerpt}
                eyebrow={record.highlighted ? "강조 기록" : "기록"}
                badge={<StatusPill tone={record.highlighted ? "accent" : "neutral"}>{getDiaryBadgeLabel(record)}</StatusPill>}
                footer={
                  <div className="inline-actions">
                    <Link className="button button--secondary button--small" href={buildFamilyModuleDetailHref(familySlug, "diary", record.slug)}>
                      상세
                    </Link>
                    <Link className="button button--ghost button--small" href={buildFamilyModuleEditHref(familySlug, "diary", record.slug)}>
                      수정
                    </Link>
                  </div>
                }
                className="journal-entry"
                {...(record.highlighted ? { tone: "accent" as const } : {})}
              >
                <p className="journal-entry__excerpt">{record.body}</p>
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
