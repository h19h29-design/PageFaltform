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
      subtitle={spec.summary}
      title="일기 목록"
      viewerRole={viewerRole}
      workspaceView={workspaceView}
    >
      {message ? <ContentMessageCard title="저장 완료" tone="accent">{message}</ContentMessageCard> : null}
      {errorMessage ? <ContentMessageCard title="다시 확인해 주세요" tone="warm">{errorMessage}</ContentMessageCard> : null}

      <div className="grid-two">
        <ContentRecordCard
          badge={<StatusPill tone="accent">{records.length} entries</StatusPill>}
          description="일기는 별도 cardType 없이 recent/post 계열로 어댑트되지만, moduleKey는 diary로 유지됩니다."
          title="일기 현황"
          tone="accent"
        >
          <MetricList
            items={[
              { label: "개인 기록", value: `${records.filter((record) => record.audience === "personal").length}건` },
              { label: "가족 공유", value: `${records.filter((record) => record.audience === "family-shared").length}건` },
              { label: "highlighted", value: `${records.filter((record) => record.highlighted).length}건` },
              { label: "private", value: `${records.filter((record) => record.visibilityScope === "private").length}건` },
            ]}
          />
        </ContentRecordCard>

        <ContentRecordCard
          badge={<StatusPill tone="warm">quiet recent</StatusPill>}
          description="일기는 글보다 조용한 recent 흐름을 유지하고, mood badge와 visibility를 그대로 보존합니다."
          title="recent 어댑터"
          tone="warm"
        >
          <ul className="stack-list">
            <li>badge는 moodLabel 또는 기록/일기 성격을 그대로 보여 줍니다.</li>
            <li>visibilityScope와 audience는 홈/상세/목록에서 그대로 유지됩니다.</li>
            <li>홈에서 누르면 실제 일기 상세 페이지로 이동합니다.</li>
          </ul>
        </ContentRecordCard>
      </div>

      <section className="surface-stack">
        <SectionHeader kicker="Diary" title="전체 일기" action={<StatusPill>{records.length} entries</StatusPill>} />

        {records.length === 0 ? (
          <ContentRecordCard
            description="첫 일기를 작성하면 recent 카드와 상세 페이지가 함께 열립니다."
            title="아직 등록된 일기가 없습니다."
            footer={
              <Link className="button button--secondary" href={buildFamilyModuleNewHref(familySlug, "diary")}>
                첫 일기 작성
              </Link>
            }
          />
        ) : (
          <div className="route-card-grid">
            {records.map((record) => (
              <ContentRecordCard
                key={record.id}
                badge={<StatusPill tone={record.highlighted ? "accent" : "neutral"}>{getDiaryBadgeLabel(record)}</StatusPill>}
                description={record.excerpt}
                eyebrow={record.highlighted ? "Highlighted diary" : "Diary"}
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
                title={record.title}
                tone={record.highlighted ? "accent" : "default"}
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
