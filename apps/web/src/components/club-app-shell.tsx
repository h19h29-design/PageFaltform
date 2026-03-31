import Link from "next/link";
import type { ReactNode } from "react";

import { PageShell, StatusPill } from "@ysplan/ui";

import {
  buildClubAppConsoleHref,
  buildClubAppMobilePreviewHref,
  createClubAppSceneStyle,
  type ClubAppAccess,
} from "../lib/club-app-access";
import { ClubAppNav } from "./club-app-nav";

type ClubAppShellProps = {
  access: ClubAppAccess;
  children: ReactNode;
};

function getRoleLabel(role: string): string {
  switch (role) {
    case "owner":
      return "개설자";
    case "manager":
      return "운영진";
    case "member":
      return "멤버";
    default:
      return role;
  }
}

function formatVisibility(value: string): string {
  return value === "private" ? "비공개" : "공개";
}

function formatJoinPolicy(value: string): string {
  return value === "invite-first" ? "초대 우선" : "신청 후 승인";
}

export function ClubAppShell({ access, children }: ClubAppShellProps) {
  return (
    <div className="club-scene" style={createClubAppSceneStyle(access.club)}>
      <PageShell
        mode="member"
        eyebrow={`${access.club.category} 멤버 공간`}
        title={access.club.name}
        subtitle={access.club.currentFocus}
        actions={
          <div className="pill-row">
            <StatusPill tone="accent">{getRoleLabel(access.viewerRole)}</StatusPill>
            <StatusPill tone="warm">{access.themeLabel}</StatusPill>
          </div>
        }
      >
        <div className="family-app-layout">
          <ClubAppNav access={access} />

          <div className="family-app-main">
            <div className="member-context-strip">
              <div className="pill-row">
                <StatusPill tone="accent">{getRoleLabel(access.viewerRole)}</StatusPill>
                <StatusPill>{access.club.sportLabel}</StatusPill>
                <StatusPill tone="warm">{formatJoinPolicy(access.club.joinPolicy)}</StatusPill>
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
                <span>관리</span>
                <span className="member-backstage-panel__hint">공개 보기와 설정</span>
              </summary>
              <div className="inline-actions">
                <Link className="button button--ghost button--small" href={`/clubs/${access.club.slug}`}>
                  공개 페이지
                </Link>
                <Link
                  className="button button--ghost button--small"
                  href={buildClubAppMobilePreviewHref(access.club.slug)}
                >
                  모바일 미리보기
                </Link>
                {access.canManage ? (
                  <Link
                    className="button button--ghost button--small"
                    href={buildClubAppConsoleHref(access.club.slug)}
                  >
                    관리자 화면
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
