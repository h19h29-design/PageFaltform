"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { ModuleKey } from "@ysplan/modules-core";
import { StatusPill, SurfaceCard } from "@ysplan/ui";

import {
  buildFamilyBuilderHref,
  buildFamilyEntryHref,
  buildFamilyHomeHref,
  buildFamilyMobilePreviewHref,
  buildFamilyModuleHref,
  buildFamilyModuleNewHref,
  listFamilyModuleRouteSpecs,
} from "../lib/family-app-routes";

type FamilyAppNavProps = {
  familySlug: string;
  canManage: boolean;
  enabledModules: readonly ModuleKey[];
};

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function FamilyAppNav({ familySlug, canManage, enabledModules }: FamilyAppNavProps) {
  const pathname = usePathname();
  const enabledModuleSpecs = listFamilyModuleRouteSpecs(enabledModules);
  const enabledModuleKeySet = new Set(enabledModules);
  const remainingModuleSpecs = listFamilyModuleRouteSpecs().filter(
    (spec) => !enabledModuleKeySet.has(spec.moduleKey),
  );

  return (
    <div className="family-app-sidebar">
      <SurfaceCard
        title="자주 쓰는 메뉴"
        badge={<StatusPill tone="accent">{enabledModuleSpecs.length}개 사용 중</StatusPill>}
      >
        <div className="family-app-nav__group">
          <Link
            className={`family-app-nav__link${
              isActivePath(pathname, buildFamilyHomeHref(familySlug)) ? " family-app-nav__link--active" : ""
            }`}
            href={buildFamilyHomeHref(familySlug)}
          >
            <strong>가족 홈</strong>
          </Link>
        </div>
      </SurfaceCard>

      <SurfaceCard title="게시판">
        <div className="family-app-nav__stack">
          {enabledModuleSpecs.map((spec, index) => {
            const listHref = buildFamilyModuleHref(familySlug, spec.moduleKey);
            const newHref = buildFamilyModuleNewHref(familySlug, spec.moduleKey);

            return (
              <div className="family-app-nav__module" key={spec.moduleKey}>
                <Link
                  className={`family-app-nav__link${
                    isActivePath(pathname, listHref) ? " family-app-nav__link--active" : ""
                  }`}
                  href={listHref}
                >
                  <strong>
                    {index + 1}. {spec.label}
                  </strong>
                  <span>{spec.collectionLabel}</span>
                </Link>
                <div className="family-app-nav__module-actions">
                  <Link className="button button--secondary button--small" href={listHref}>
                    열기
                  </Link>
                  <Link className="button button--ghost button--small" href={newHref}>
                    새로 만들기
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </SurfaceCard>

      <SurfaceCard title="백스테이지">
        <div className="family-app-nav__group">
          <Link
            className={`family-app-nav__link${
              pathname === buildFamilyEntryHref(familySlug) ? " family-app-nav__link--active" : ""
            }`}
            href={buildFamilyEntryHref(familySlug)}
          >
            <strong>가족 입구</strong>
            <span>입장 확인</span>
          </Link>
          <Link className="family-app-nav__link" href={buildFamilyMobilePreviewHref(familySlug)}>
            <strong>모바일 미리보기</strong>
            <span>화면 확인</span>
          </Link>
          {canManage ? (
            <Link className="family-app-nav__link" href={buildFamilyBuilderHref(familySlug)}>
              <strong>관리</strong>
              <span>테마와 모듈 설정</span>
            </Link>
          ) : null}
        </div>
      </SurfaceCard>

      {canManage ? (
        <SurfaceCard title="추가 가능">
          <div className="family-app-nav__stack">
            {remainingModuleSpecs.map((spec) => (
              <Link
                className="family-app-nav__link family-app-nav__link--muted"
                href={buildFamilyModuleHref(familySlug, spec.moduleKey)}
                key={spec.moduleKey}
              >
                <strong>{spec.label}</strong>
                <span>{spec.collectionLabel}</span>
              </Link>
            ))}
          </div>
        </SurfaceCard>
      ) : null}
    </div>
  );
}
