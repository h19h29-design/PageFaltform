import Link from "next/link";
import type { ReactNode } from "react";

import { PageShell, StatusPill, SurfaceCard } from "@ysplan/ui";

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
        eyebrow={`${workspaceView.family.name} 가족 앱`}
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
              title="현재 구성 요약"
              description="지금 보고 있는 화면은 같은 테마, 홈 프리셋, 입장 흐름, 모듈 순서를 함께 사용합니다."
              badge={<StatusPill tone="accent">{workspaceView.workspace.enabledModules.length}개 사용 중</StatusPill>}
            >
              <div className="pill-row">
                <StatusPill tone="accent">권한 {viewerRole}</StatusPill>
                <StatusPill>{workspaceView.homePresetLabel}</StatusPill>
                <StatusPill tone="warm">{workspaceView.entryPresetLabel}</StatusPill>
                <StatusPill>{workspaceView.themePresetLabel}</StatusPill>
                <StatusPill>{workspaceView.family.timezone}</StatusPill>
              </div>

              <dl className="fact-grid">
                <div className="fact-grid__item">
                  <dt>기본 앱 주소</dt>
                  <dd>/app/{workspaceView.family.slug}</dd>
                </div>
                <div className="fact-grid__item">
                  <dt>가족 입구</dt>
                  <dd>
                    <Link href={buildFamilyEntryHref(workspaceView.family.slug)}>
                      /f/{workspaceView.family.slug}
                    </Link>
                  </dd>
                </div>
                <div className="fact-grid__item">
                  <dt>첫 모듈</dt>
                  <dd>{workspaceView.moduleDescriptors[0]?.label ?? "공지"}</dd>
                </div>
                <div className="fact-grid__item">
                  <dt>모바일 미리보기</dt>
                  <dd>
                    <Link href={buildFamilyMobilePreviewHref(workspaceView.family.slug)}>
                      /preview/mobile/{workspaceView.family.slug}
                    </Link>
                  </dd>
                </div>
                <div className="fact-grid__item">
                  <dt>빌더 접근</dt>
                  <dd>
                    {canManage ? (
                      <Link href={buildFamilyBuilderHref(workspaceView.family.slug)}>
                        /console/families/{workspaceView.family.slug}
                      </Link>
                    ) : (
                      "운영자 전용"
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
