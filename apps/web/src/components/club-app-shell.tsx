import Link from "next/link";
import type { ReactNode } from "react";

import { PageShell, StatusPill, SurfaceCard } from "@ysplan/ui";

import {
  buildClubAppConsoleHref,
  buildClubAppMobilePreviewHref,
  createClubAppSceneStyle,
  getClubMemberRoleBadge,
  type ClubAppAccess,
} from "../lib/club-app-access";

type ClubAppShellProps = {
  access: ClubAppAccess;
  children: ReactNode;
};

function formatVisibility(value: string): string {
  return value === "private" ? "비공개" : "공개";
}

export function ClubAppShell({ access, children }: ClubAppShellProps) {
  return (
    <div className="club-scene" style={createClubAppSceneStyle(access.club)}>
      <PageShell
        mode="member"
        eyebrow={`${access.club.category} 멤버 공간`}
        title={access.club.name}
        subtitle={access.club.tagline}
        actions={
          <div className="pill-row">
            <StatusPill tone="accent">{getClubMemberRoleBadge(access.viewerRole)}</StatusPill>
            <StatusPill tone="warm">{access.themeLabel}</StatusPill>
          </div>
        }
      >
        <div className="family-app-layout">
          <div className="family-app-sidebar">
            <SurfaceCard title="클럽 메뉴">
              <div className="pill-row">
                <StatusPill tone="accent">{getClubMemberRoleBadge(access.viewerRole)}</StatusPill>
                <StatusPill tone="warm">{formatVisibility(access.club.visibility)}</StatusPill>
                <StatusPill>{access.memberCount}명</StatusPill>
              </div>
              <div className="route-card-grid module-hub-grid">
                {access.moduleEntries.map((module) => (
                  <SurfaceCard
                    key={module.moduleKey}
                    title={module.label}
                    className="module-hub-card"
                    footer={
                      <div className="inline-actions">
                        <Link className="button button--secondary button--small" href={module.href}>
                          열기
                        </Link>
                      </div>
                    }
                  />
                ))}
              </div>
            </SurfaceCard>
          </div>

          <div className="family-app-main">
            <div className="member-context-strip">
              <div className="pill-row">
                <StatusPill tone="accent">{getClubMemberRoleBadge(access.viewerRole)}</StatusPill>
                <StatusPill>{access.club.sportLabel}</StatusPill>
                <StatusPill tone="warm">
                  {access.club.joinPolicy === "invite-first" ? "초대 우선" : "승인 필요"}
                </StatusPill>
                <StatusPill>{access.club.location}</StatusPill>
                <StatusPill>{formatVisibility(access.club.visibility)}</StatusPill>
              </div>
              <div className="member-context-strip__meta">
                <span>{access.memberCount}명 참여</span>
                <span>{access.club.nextEventLabel}</span>
              </div>
            </div>

            {children}

            <details className="member-backstage-panel">
              <summary>
                <span>백스테이지</span>
                <span className="member-backstage-panel__hint">공개 보기와 관리</span>
              </summary>
              <div className="inline-actions">
                <Link className="button button--ghost button--small" href={`/clubs/${access.club.slug}`}>
                  공개 화면
                </Link>
                <Link className="button button--ghost button--small" href={buildClubAppMobilePreviewHref(access.club.slug)}>
                  모바일 미리보기
                </Link>
                {access.canManage ? (
                  <Link className="button button--ghost button--small" href={buildClubAppConsoleHref(access.club.slug)}>
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
