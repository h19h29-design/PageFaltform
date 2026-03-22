"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { ModuleKey } from "@ysplan/modules-core";
import { StatusPill, SurfaceCard } from "@ysplan/ui";

import {
  buildFamilyBuilderHref,
  buildFamilyEntryHref,
  buildFamilyHomeHref,
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
        title="App routes"
        description="Use the same route structure across home, entry, console, and every module page."
        badge={<StatusPill tone="accent">{enabledModuleSpecs.length} live</StatusPill>}
      >
        <div className="family-app-nav__group">
          <Link
            className={`family-app-nav__link${
              isActivePath(pathname, buildFamilyHomeHref(familySlug)) ? " family-app-nav__link--active" : ""
            }`}
            href={buildFamilyHomeHref(familySlug)}
          >
            <strong>Family home</strong>
            <span>Dashboard, module launcher, and runtime summary.</span>
          </Link>
          <Link
            className={`family-app-nav__link${
              pathname === buildFamilyEntryHref(familySlug) ? " family-app-nav__link--active" : ""
            }`}
            href={buildFamilyEntryHref(familySlug)}
          >
            <strong>Entry page</strong>
            <span>Family access flow and launch pad.</span>
          </Link>
          {canManage ? (
            <Link className="family-app-nav__link" href={buildFamilyBuilderHref(familySlug)}>
              <strong>Builder</strong>
              <span>Change presets, order, and enabled modules.</span>
            </Link>
          ) : null}
        </div>
      </SurfaceCard>

      <SurfaceCard
        title="Live modules"
        description="Enabled modules keep family order and become the primary app navigation."
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
                    Open
                  </Link>
                  <Link className="button button--ghost button--small" href={newHref}>
                    New
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </SurfaceCard>

      <SurfaceCard
        title="Available next"
        description="Disabled modules still have routes, so other threads can attach real CRUD later without remapping links."
      >
        <div className="family-app-nav__stack">
          {remainingModuleSpecs.map((spec) => (
            <Link className="family-app-nav__link family-app-nav__link--muted" href={buildFamilyModuleHref(familySlug, spec.moduleKey)} key={spec.moduleKey}>
              <strong>{spec.label}</strong>
              <span>{spec.description}</span>
            </Link>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
