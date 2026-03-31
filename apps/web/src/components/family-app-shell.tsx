import Link from "next/link";
import type { ReactNode } from "react";

import { PageShell, StatusPill } from "@ysplan/ui";

import type { EffectiveFamilyWorkspace } from "../lib/family-workspace";
import {
  buildFamilyBuilderHref,
  buildFamilyEntryHref,
  buildFamilyMobilePreviewHref,
} from "../lib/family-app-routes";
import { createFamilySceneStyle } from "../lib/theme-scene";
import { FamilyAppNav } from "./family-app-nav";

type FamilyAppShellProps = {
  workspaceView: EffectiveFamilyWorkspace;
  viewerRole: string;
  canManage: boolean;
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
};

function formatViewerRole(role: string): string {
  switch (role) {
    case "owner":
      return "운영자";
    case "admin":
      return "관리자";
    case "member":
      return "회원";
    case "guest":
      return "게스트";
    case "child":
      return "아이";
    default:
      return role;
  }
}

function formatVisibility(visibility: string): string {
  return visibility === "private" ? "비공개" : "공개";
}

export function FamilyAppShell({
  workspaceView,
  viewerRole,
  canManage,
  title,
  subtitle,
  actions,
  children,
}: FamilyAppShellProps) {
  const familySlug = workspaceView.family.slug;

  return (
    <div
      className="family-scene"
      style={createFamilySceneStyle(
        workspaceView.family.theme,
        workspaceView.workspace.themePreset,
      )}
    >
      <PageShell
        mode="member"
        eyebrow={`${workspaceView.family.name} 멤버 공간`}
        title={title}
        subtitle={subtitle}
        actions={actions}
      >
        <div className="family-app-layout">
          <FamilyAppNav
            canManage={canManage}
            enabledModules={workspaceView.workspace.enabledModules}
            familySlug={familySlug}
          />

          <div className="family-app-main">
            <div className="member-context-strip">
              <div className="pill-row">
                <StatusPill tone="accent">{formatViewerRole(viewerRole)}</StatusPill>
                <StatusPill>{workspaceView.homePresetLabel}</StatusPill>
                <StatusPill tone="warm">{workspaceView.entryPresetLabel}</StatusPill>
                <StatusPill>{workspaceView.themePresetLabel}</StatusPill>
                <StatusPill>{workspaceView.family.timezone}</StatusPill>
                <StatusPill>{formatVisibility(workspaceView.family.visibility)}</StatusPill>
              </div>

              <div className="member-context-strip__meta">
                <span>{workspaceView.family.memberCount}명</span>
                <span>{workspaceView.workspace.enabledModules.length}개 모듈 사용 중</span>
              </div>
            </div>

            {children}

            <details className="member-backstage-panel">
              <summary>
                <span>백스테이지</span>
                <span className="member-backstage-panel__hint">관리와 미리보기</span>
              </summary>
              <div className="inline-actions">
                <Link className="button button--ghost button--small" href={buildFamilyEntryHref(familySlug)}>
                  가족 입구
                </Link>
                <Link
                  className="button button--ghost button--small"
                  href={buildFamilyMobilePreviewHref(familySlug)}
                >
                  모바일 미리보기
                </Link>
                {canManage ? (
                  <Link
                    className="button button--ghost button--small"
                    href={buildFamilyBuilderHref(familySlug)}
                  >
                    관리
                  </Link>
                ) : null}
              </div>
            </details>
          </div>
        </div>
      </PageShell>
    </div>
  );
}
