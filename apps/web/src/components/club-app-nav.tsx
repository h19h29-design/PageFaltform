"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { StatusPill, SurfaceCard } from "@ysplan/ui";

import {
  buildClubAppHomeHref,
  buildClubAppModuleHref,
  buildClubAppModuleNewHref,
  buildClubConsoleHref,
  buildClubDetailHref,
  buildClubMobilePreviewHref,
} from "../lib/club-app-routes";
import type { ClubAppAccess } from "../lib/club-app-access";

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ClubAppNav({ access }: { access: ClubAppAccess }) {
  const pathname = usePathname();
  const primaryModules = access.moduleEntries.filter((entry) =>
    ["announcements", "events", "gallery"].includes(entry.moduleKey),
  );
  const secondaryModules = access.moduleEntries.filter(
    (entry) => !["announcements", "events", "gallery"].includes(entry.moduleKey),
  );

  return (
    <div className="family-app-sidebar">
      <SurfaceCard
        title="자주 쓰는 메뉴"
        badge={<StatusPill tone="accent">{access.moduleEntries.length}개 사용 중</StatusPill>}
      >
        <div className="family-app-nav__group">
          <Link
            className={`family-app-nav__link${
              isActivePath(pathname, buildClubAppHomeHref(access.club.slug))
                ? " family-app-nav__link--active"
                : ""
            }`}
            href={buildClubAppHomeHref(access.club.slug)}
          >
            <strong>클럽 홈</strong>
            <span>최근 공지와 일정, 갤러리를 한 번에 확인</span>
          </Link>
        </div>
      </SurfaceCard>

      <SurfaceCard title="게시판">
        <div className="family-app-nav__stack">
          {primaryModules.map((module, index) => {
            const listHref = buildClubAppModuleHref(access.club.slug, module.moduleKey);
            const newHref = buildClubAppModuleNewHref(access.club.slug, module.moduleKey);

            return (
              <div className="family-app-nav__module" key={module.moduleKey}>
                <Link
                  className={`family-app-nav__link${
                    isActivePath(pathname, listHref) ? " family-app-nav__link--active" : ""
                  }`}
                  href={listHref}
                >
                  <strong>
                    {index + 1}. {module.label}
                  </strong>
                  <span>{module.description}</span>
                </Link>
                <div className="family-app-nav__module-actions">
                  <Link className="button button--secondary button--small" href={listHref}>
                    열기
                  </Link>
                  {access.canManage ? (
                    <Link className="button button--ghost button--small" href={newHref}>
                      새 글
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </SurfaceCard>

      <SurfaceCard title="백스테이지">
        <div className="family-app-nav__group">
          <Link className="family-app-nav__link" href={buildClubDetailHref(access.club.slug)}>
            <strong>공개 페이지</strong>
            <span>방문자가 보는 소개 화면</span>
          </Link>
          <Link className="family-app-nav__link" href={buildClubMobilePreviewHref(access.club.slug)}>
            <strong>모바일 미리보기</strong>
            <span>모바일 레이아웃 확인</span>
          </Link>
          {access.canManage ? (
            <Link className="family-app-nav__link" href={buildClubConsoleHref(access.club.slug)}>
              <strong>관리</strong>
              <span>승인, 공개 범위, 테마 설정</span>
            </Link>
          ) : null}
        </div>
      </SurfaceCard>

      {secondaryModules.length > 0 ? (
        <SurfaceCard title="추가 공간">
          <div className="family-app-nav__stack">
            {secondaryModules.map((module) => (
              <Link
                className="family-app-nav__link family-app-nav__link--muted"
                href={buildClubAppModuleHref(access.club.slug, module.moduleKey)}
                key={module.moduleKey}
              >
                <strong>{module.label}</strong>
                <span>{module.description}</span>
              </Link>
            ))}
          </div>
        </SurfaceCard>
      ) : null}
    </div>
  );
}
