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
import { getContentRecordUpdatedLabel, listGalleryRecords } from "src/lib/content-store";
import { requireFamilyAppAccess } from "src/lib/family-app-context";

type GalleryPageProps = {
  params: Promise<{ familySlug: string }>;
  searchParams: Promise<{ state?: string; error?: string }>;
};

export default async function GalleryPage(props: GalleryPageProps) {
  const { familySlug } = await props.params;
  const searchParams = await props.searchParams;
  const { workspaceView, viewerRole, canManage } = await requireFamilyAppAccess(familySlug);
  const spec = getFamilyModuleRouteSpec("gallery");
  const records = await listGalleryRecords(familySlug);
  const message = getContentCrudMessage("gallery", searchParams.state);
  const errorMessage = getContentErrorMessage(searchParams.error);

  if (!spec) {
    return null;
  }

  return (
    <FamilyAppShell
      actions={
        <div className="inline-actions">
          <Link className="button button--secondary" href={buildFamilyModuleNewHref(familySlug, "gallery")}>
            새 갤러리
          </Link>
          <Link className="button button--ghost" href={buildFamilyHomeHref(familySlug)}>
            가족 홈
          </Link>
        </div>
      }
      canManage={canManage}
      subtitle={spec.summary}
      title="갤러리 목록"
      viewerRole={viewerRole}
      workspaceView={workspaceView}
    >
      {message ? <ContentMessageCard title="저장 완료" tone="accent">{message}</ContentMessageCard> : null}
      {errorMessage ? <ContentMessageCard title="다시 확인해 주세요" tone="warm">{errorMessage}</ContentMessageCard> : null}

      <div className="grid-two">
        <ContentRecordCard
          badge={<StatusPill tone="accent">{records.length} albums</StatusPill>}
          description="갤러리는 사진 수와 캡션으로 recent 기억 흐름을 만들고, home story preset에서 더 잘 드러납니다."
          title="앨범 현황"
          tone="accent"
        >
          <MetricList
            items={[
              { label: "사진", value: `${records.reduce((sum, record) => sum + record.photoCount, 0)}장` },
              { label: "메모", value: `${records.reduce((sum, record) => sum + (record.noteCount ?? 0), 0)}개` },
              { label: "featured", value: `${records.filter((record) => record.featured).length}건` },
              { label: "앨범", value: `${records.length}개` },
            ]}
          />
        </ContentRecordCard>

        <ContentRecordCard
          badge={<StatusPill tone="warm">photo badge</StatusPill>}
          description="badge는 사진 수를, summary는 캡션과 메모 수를 읽게 만들어 기록형 홈 흐름을 유지합니다."
          title="recent 기록 흐름"
          tone="warm"
        >
          <ul className="stack-list">
            <li>배지는 항상 사진 수를 기준으로 보여 줍니다.</li>
            <li>캡션과 메모 수가 recent 스토리 설명문에 함께 반영됩니다.</li>
            <li>홈 카드를 누르면 실제 앨범 상세로 이동합니다.</li>
          </ul>
        </ContentRecordCard>
      </div>

      <section className="surface-stack">
        <SectionHeader kicker="Gallery" title="전체 앨범" action={<StatusPill>{records.length} entries</StatusPill>} />

        {records.length === 0 ? (
          <ContentRecordCard
            description="첫 앨범을 만들면 recent 카드와 상세 페이지가 함께 열립니다."
            title="아직 등록된 갤러리 항목이 없습니다."
            footer={
              <Link className="button button--secondary" href={buildFamilyModuleNewHref(familySlug, "gallery")}>
                첫 앨범 만들기
              </Link>
            }
          />
        ) : (
          <div className="route-card-grid">
            {records.map((record) => (
              <ContentRecordCard
                key={record.id}
                badge={<StatusPill tone={record.featured ? "accent" : "neutral"}>{record.photoCount}장</StatusPill>}
                description={record.caption}
                eyebrow={record.featured ? "Featured album" : "Album"}
                footer={
                  <div className="inline-actions">
                    <Link className="button button--secondary button--small" href={buildFamilyModuleDetailHref(familySlug, "gallery", record.slug)}>
                      상세
                    </Link>
                    <Link className="button button--ghost button--small" href={buildFamilyModuleEditHref(familySlug, "gallery", record.slug)}>
                      수정
                    </Link>
                  </div>
                }
                title={record.title}
                tone={record.featured ? "accent" : "default"}
              >
                <p className="feature-copy">캡션 {record.noteCount ?? 0}개 · 대표 이미지 {record.imageUrl ?? "-"}</p>
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
