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
  listGalleryRecords,
} from "src/lib/content-store";
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
            새 앨범
          </Link>
          <Link className="button button--ghost" href={buildFamilyHomeHref(familySlug)}>
            가족 홈
          </Link>
        </div>
      }
      canManage={canManage}
      subtitle="대표 이미지와 사진 수가 먼저 보이도록, 앨범을 갤러리 보드처럼 정리했습니다."
      title="갤러리 보드"
      viewerRole={viewerRole}
      workspaceView={workspaceView}
    >
      {message ? <ContentMessageCard title="저장 완료" tone="accent">{message}</ContentMessageCard> : null}
      {errorMessage ? <ContentMessageCard title="다시 확인해 주세요" tone="warm">{errorMessage}</ContentMessageCard> : null}

      <div className="grid-two">
        <SurfaceCard
          title="앨범 현황"
          description="사진 수와 메모 수를 크게 보여 줘서 기록량을 한눈에 파악할 수 있게 했습니다."
          badge={<StatusPill tone="accent">{records.length}개</StatusPill>}
          tone="accent"
        >
          <MetricList
            items={[
              { label: "앨범", value: `${records.length}개` },
              { label: "사진", value: `${records.reduce((sum, record) => sum + record.photoCount, 0)}장` },
              { label: "메모", value: `${records.reduce((sum, record) => sum + (record.noteCount ?? 0), 0)}개` },
              { label: "대표 앨범", value: `${records.filter((record) => record.featured).length}개` },
            ]}
          />
        </SurfaceCard>

        <SurfaceCard
          title="보드 읽는 법"
          description="이미지는 크게, 설명은 짧게, 메타는 아래에 모아 앨범 흐름을 빠르게 읽게 합니다."
          badge={<StatusPill tone="warm">기록 흐름</StatusPill>}
          tone="warm"
        >
          <ul className="stack-list compact-list">
            <li>큰 숫자는 사진 수이고, 메모 수는 그 아래에서 보조로 읽습니다.</li>
            <li>대표 앨범은 강조색으로 먼저 보이게 합니다.</li>
            <li>앨범을 누르면 실제 상세 화면으로 이동해 사진 기록을 이어 봅니다.</li>
          </ul>
        </SurfaceCard>
      </div>

      <section className="surface-stack">
        <SectionHeader
          kicker="갤러리 보드"
          title="전체 앨범"
          action={<StatusPill>{records.length}개</StatusPill>}
        />

        {records.length === 0 ? (
          <SurfaceCard
            title="아직 등록된 앨범이 없습니다."
            description="첫 앨범을 만들면 가족 홈 recent 흐름과 상세 페이지가 함께 열립니다."
            footer={
              <Link className="button button--secondary" href={buildFamilyModuleNewHref(familySlug, "gallery")}>
                첫 앨범 만들기
              </Link>
            }
          />
        ) : (
          <div className="album-grid">
            {records.map((record) => (
              <SurfaceCard
                key={record.id}
                title={record.title}
                description={record.caption}
                eyebrow={record.featured ? "대표 앨범" : "앨범"}
                badge={<StatusPill tone={record.featured ? "accent" : "neutral"}>{record.photoCount}장</StatusPill>}
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
                {...(record.featured ? { tone: "accent" as const } : {})}
              >
                <div className="album-card__cover" />
                <div className="pill-row">
                  <StatusPill>{record.noteCount ?? 0}개 메모</StatusPill>
                  <StatusPill>{getContentAudienceLabel(record.audience)}</StatusPill>
                  <StatusPill>{getContentVisibilityLabel(record.visibilityScope)}</StatusPill>
                </div>
                <p className="feature-copy">최근 수정 {getContentRecordUpdatedLabel(record.updatedAt)}</p>
              </SurfaceCard>
            ))}
          </div>
        )}
      </section>
    </FamilyAppShell>
  );
}
