import Link from "next/link";

import type { ModuleKey } from "@ysplan/modules-core";
import { SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import type { EffectiveFamilyWorkspace } from "../lib/family-workspace";
import {
  buildFamilyHomeHref,
  buildFamilyModuleDetailHref,
  buildFamilyModuleEditHref,
  buildFamilyModuleHref,
  buildFamilyModuleNewHref,
  formatModuleItemName,
  getFamilyModuleExampleSlug,
  getFamilyModuleRouteSpec,
  getModulePageTitle,
  type FamilyModulePageMode,
} from "../lib/family-app-routes";

type FamilyModuleShellProps = {
  workspaceView: EffectiveFamilyWorkspace;
  moduleKey: ModuleKey;
  mode: FamilyModulePageMode;
  itemSlug?: string;
};

export function FamilyModuleShell({
  workspaceView,
  moduleKey,
  mode,
  itemSlug,
}: FamilyModuleShellProps) {
  const spec = getFamilyModuleRouteSpec(moduleKey);

  if (!spec) {
    return null;
  }

  const resolvedItemSlug = itemSlug ?? getFamilyModuleExampleSlug(moduleKey);
  const resolvedItemName = formatModuleItemName(resolvedItemSlug);
  const moduleHref = buildFamilyModuleHref(workspaceView.family.slug, moduleKey);
  const newHref = buildFamilyModuleNewHref(workspaceView.family.slug, moduleKey);
  const detailHref = buildFamilyModuleDetailHref(workspaceView.family.slug, moduleKey, resolvedItemSlug);
  const editHref = buildFamilyModuleEditHref(workspaceView.family.slug, moduleKey, resolvedItemSlug);
  const isEnabled = workspaceView.workspace.enabledModules.includes(moduleKey);
  const pageTitle = getModulePageTitle(spec, mode, resolvedItemSlug);

  return (
    <div className="surface-stack">
      <SectionHeader
        kicker="게시판"
        title={pageTitle}
        action={
          <div className="pill-row">
            <StatusPill tone={isEnabled ? "accent" : "warm"}>
              {isEnabled ? "사용 중" : "추가 가능"}
            </StatusPill>
            <StatusPill>{workspaceView.family.name}</StatusPill>
          </div>
        }
      />

      <div className="inline-actions">
        <Link className="button button--secondary" href={moduleHref}>
          목록
        </Link>
        <Link className="button button--secondary" href={newHref}>
          새로 만들기
        </Link>
        <Link className="button button--ghost" href={buildFamilyHomeHref(workspaceView.family.slug)}>
          홈
        </Link>
      </div>

      {!isEnabled ? (
        <SurfaceCard
          title="아직 켜지지 않은 모듈"
          badge={<StatusPill tone="warm">비활성</StatusPill>}
        >
          <div className="inline-actions">
            <Link className="button button--ghost button--small" href={buildFamilyHomeHref(workspaceView.family.slug)}>
              홈으로
            </Link>
          </div>
        </SurfaceCard>
      ) : null}

      <div className="route-card-grid">
        <SurfaceCard
          title={mode === "list" ? "목록 보기" : mode === "detail" ? "상세 보기" : "편집 화면"}
          badge={<StatusPill>{spec.label}</StatusPill>}
        >
          <div className="surface-stack">
            <div className="surface-note">
              <strong>{resolvedItemName}</strong>
            </div>
            <div className="inline-actions">
              <Link className="button button--secondary button--small" href={detailHref}>
                상세
              </Link>
              <Link className="button button--ghost button--small" href={editHref}>
                수정
              </Link>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard title="빠른 이동" badge={<StatusPill tone="accent">바로가기</StatusPill>}>
          <div className="inline-actions">
            <Link className="button button--secondary button--small" href={moduleHref}>
              목록 열기
            </Link>
            <Link className="button button--secondary button--small" href={newHref}>
              새 글 만들기
            </Link>
            <Link className="button button--ghost button--small" href={detailHref}>
              예시 보기
            </Link>
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
