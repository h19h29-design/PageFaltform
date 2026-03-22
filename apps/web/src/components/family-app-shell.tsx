import Link from "next/link";
import type { ReactNode } from "react";

import { PageShell, StatusPill, SurfaceCard } from "@ysplan/ui";

import type { EffectiveFamilyWorkspace } from "../lib/family-workspace";
import { buildFamilyBuilderHref, buildFamilyEntryHref } from "../lib/family-app-routes";
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

export function FamilyAppShell({
  workspaceView,
  viewerRole,
  canManage,
  title,
  subtitle,
  actions,
  children,
}: FamilyAppShellProps) {
  return (
    <div className="family-scene" style={createFamilySceneStyle(workspaceView.family.theme)}>
      <PageShell
        eyebrow={`${workspaceView.family.name} app`}
        title={title}
        subtitle={subtitle}
        actions={actions}
      >
        <div className="family-app-layout">
          <FamilyAppNav
            canManage={canManage}
            enabledModules={workspaceView.workspace.enabledModules}
            familySlug={workspaceView.family.slug}
          />

          <div className="family-app-main">
            <SurfaceCard
              title="Workspace summary"
              description="The family app, entry route, and builder all point to the same module order and preset contract."
              badge={<StatusPill tone="accent">{workspaceView.workspace.enabledModules.length} modules</StatusPill>}
            >
              <div className="pill-row">
                <StatusPill tone="accent">viewer {viewerRole}</StatusPill>
                <StatusPill>{workspaceView.homePresetLabel}</StatusPill>
                <StatusPill tone="warm">{workspaceView.entryPresetLabel}</StatusPill>
                <StatusPill>{workspaceView.family.timezone}</StatusPill>
              </div>

              <dl className="fact-grid">
                <div className="fact-grid__item">
                  <dt>Primary route</dt>
                  <dd>/app/{workspaceView.family.slug}</dd>
                </div>
                <div className="fact-grid__item">
                  <dt>Entry route</dt>
                  <dd>
                    <Link href={buildFamilyEntryHref(workspaceView.family.slug)}>
                      /f/{workspaceView.family.slug}
                    </Link>
                  </dd>
                </div>
                <div className="fact-grid__item">
                  <dt>Top module</dt>
                  <dd>{workspaceView.moduleDescriptors[0]?.label ?? "Announcements"}</dd>
                </div>
                <div className="fact-grid__item">
                  <dt>Builder access</dt>
                  <dd>
                    {canManage ? (
                      <Link href={buildFamilyBuilderHref(workspaceView.family.slug)}>
                        /console/families/{workspaceView.family.slug}
                      </Link>
                    ) : (
                      "Console manager only"
                    )}
                  </dd>
                </div>
              </dl>
            </SurfaceCard>

            {children}
          </div>
        </div>
      </PageShell>
    </div>
  );
}
