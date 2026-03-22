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
        title="공통 이동"
        description="가족 입구, 홈, 모바일 미리보기, 운영 화면을 빠르게 오갈 수 있습니다."
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
            <span>오늘 핵심 카드와 게시판 바로가기를 한눈에 봅니다.</span>
          </Link>
          <Link
            className={`family-app-nav__link${
              pathname === buildFamilyEntryHref(familySlug) ? " family-app-nav__link--active" : ""
            }`}
            href={buildFamilyEntryHref(familySlug)}
          >
            <strong>가족 입구</strong>
            <span>비밀번호 확인 전 미리보기와 입장 흐름을 확인합니다.</span>
          </Link>
          <Link className="family-app-nav__link" href={buildFamilyMobilePreviewHref(familySlug)}>
            <strong>모바일 미리보기</strong>
            <span>휴대폰 프레임 안에서 홈과 게시판을 번갈아 점검합니다.</span>
          </Link>
          {canManage ? (
            <Link className="family-app-nav__link" href={buildFamilyBuilderHref(familySlug)}>
              <strong>빌더</strong>
              <span>테마, 모듈 순서, 홈 프리셋을 바로 바꿉니다.</span>
            </Link>
          ) : null}
        </div>
      </SurfaceCard>

      <SurfaceCard
        title="지금 사용하는 게시판"
        description="켜진 모듈이 실제 메뉴가 됩니다. 목록과 새 항목을 바로 열 수 있습니다."
      >
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
                  <span>{spec.summary}</span>
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

      <SurfaceCard
        title="다음에 켤 수 있는 게시판"
        description="지금은 꺼져 있어도 경로는 살아 있습니다. 빌더에서 켜면 바로 반영됩니다."
      >
        <div className="family-app-nav__stack">
          {remainingModuleSpecs.map((spec) => (
            <Link
              className="family-app-nav__link family-app-nav__link--muted"
              href={buildFamilyModuleHref(familySlug, spec.moduleKey)}
              key={spec.moduleKey}
            >
              <strong>{spec.label}</strong>
              <span>{spec.description}</span>
            </Link>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
