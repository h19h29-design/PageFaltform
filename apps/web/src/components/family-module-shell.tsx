import Link from "next/link";

import type { ModuleKey } from "@ysplan/modules-core";
import { HeroCard, MetricList, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import type { EffectiveFamilyWorkspace } from "../lib/family-workspace";
import {
  buildFamilyBuilderHref,
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

function buildModeSummary(mode: FamilyModulePageMode, label: string, itemLabel: string): string {
  switch (mode) {
    case "list":
      return `${label} lands on the collection route first so list, detail, new, and edit flows stay predictable.`;
    case "detail":
      return `The detail route is ready for the real ${itemLabel} view once module CRUD lands from the module thread.`;
    case "new":
      return `The create route already exposes the final path and editor frame that module threads can replace with real actions.`;
    case "edit":
      return `The edit route keeps the same product shell as detail and create, so modules can plug in real forms without changing navigation.`;
    default:
      return label;
  }
}

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
      <HeroCard
        eyebrow={`${spec.label} route`}
        title={pageTitle}
        subtitle={buildModeSummary(mode, spec.label, spec.itemLabel)}
        meta={
          <>
            <StatusPill tone={isEnabled ? "accent" : "warm"}>{isEnabled ? "live module" : "available next"}</StatusPill>
            <StatusPill>{workspaceView.family.slug}</StatusPill>
            <StatusPill tone="warm">{workspaceView.homePresetLabel}</StatusPill>
          </>
        }
        actions={
          <div className="inline-actions">
            <Link className="button button--secondary" href={moduleHref}>
              List
            </Link>
            <Link className="button button--secondary" href={newHref}>
              New
            </Link>
            <Link className="button button--ghost" href={buildFamilyHomeHref(workspaceView.family.slug)}>
              Home
            </Link>
          </div>
        }
      >
        <SurfaceCard
          title="Route map"
          description="These links stay stable while module threads replace the inside of each page with real CRUD."
          tone="accent"
        >
          <MetricList
            items={[
              { label: "List", value: moduleHref },
              { label: "Detail", value: detailHref },
              { label: "New", value: newHref },
              { label: "Edit", value: editHref },
            ]}
          />
        </SurfaceCard>
      </HeroCard>

      {!isEnabled ? (
        <SurfaceCard
          title="Module status"
          description="This family currently keeps the module turned off, but the route stays live so product navigation does not break."
          badge={<StatusPill tone="warm">off in builder</StatusPill>}
          tone="warm"
          footer={
            <div className="inline-actions">
              <Link className="button button--secondary" href={buildFamilyBuilderHref(workspaceView.family.slug)}>
                Open builder
              </Link>
              <Link className="button button--ghost" href={buildFamilyHomeHref(workspaceView.family.slug)}>
                Back to home
              </Link>
            </div>
          }
        >
          <p className="feature-copy">
            Family app navigation still exposes the route so other threads can attach real CRUD without remapping paths later.
          </p>
        </SurfaceCard>
      ) : null}

      <section className="surface-stack">
        <SectionHeader
          kicker="Work surface"
          title={`${spec.label} ${mode === "list" ? "module shell" : "page shell"}`}
          action={<StatusPill>{spec.itemLabel}</StatusPill>}
        />

        <div className="grid-two">
          <SurfaceCard
            title="What lands here"
            description="The route is already product-shaped, with links and slots that module-specific pages can replace incrementally."
          >
            <ul className="stack-list">
              <li>{spec.summary}</li>
              <li>Family slug and module path are already fixed for local tests.</li>
              <li>Module teams can replace the cards below without changing the page contract.</li>
            </ul>
          </SurfaceCard>

          <SurfaceCard
            title="Quick links"
            description="Use these for smoke tests while CRUD is still arriving from module threads."
          >
            <div className="inline-actions">
              <Link className="button button--secondary" href={moduleHref}>
                Open list
              </Link>
              <Link className="button button--secondary" href={detailHref}>
                Open detail
              </Link>
              <Link className="button button--secondary" href={newHref}>
                Open create
              </Link>
              <Link className="button button--secondary" href={editHref}>
                Open edit
              </Link>
            </div>
          </SurfaceCard>
        </div>

        <SurfaceCard
          title={mode === "list" ? "Collection surface" : mode === "detail" ? "Detail surface" : "Editor surface"}
          description={
            mode === "list"
              ? "A stable collection page with example item routes and create entry points."
              : mode === "detail"
                ? "A stable detail frame with metadata, route context, and edit links."
                : "A stable editor frame with readonly sample fields and module-specific handoff space."
          }
          badge={<StatusPill tone="accent">{mode}</StatusPill>}
        >
          {mode === "list" ? (
            <div className="route-card-grid">
              <SurfaceCard
                title={resolvedItemName}
                description={`Example ${spec.itemLabel} route for local navigation checks.`}
                badge={<StatusPill>{spec.itemLabel}</StatusPill>}
                footer={
                  <div className="inline-actions">
                    <Link className="button button--secondary button--small" href={detailHref}>
                      Detail
                    </Link>
                    <Link className="button button--ghost button--small" href={editHref}>
                      Edit
                    </Link>
                  </div>
                }
              >
                <p className="feature-copy">{spec.description}</p>
              </SurfaceCard>

              <SurfaceCard
                title={spec.createLabel}
                description="The route is ready for module-specific forms."
                badge={<StatusPill tone="warm">new</StatusPill>}
                footer={
                  <Link className="button button--secondary button--small" href={newHref}>
                    Open create page
                  </Link>
                }
              >
                <p className="feature-copy">
                  This page already lives at the final route, so create flows can attach without changing links.
                </p>
              </SurfaceCard>
            </div>
          ) : mode === "detail" ? (
            <div className="route-detail-grid">
              <div className="surface-note">
                <p>
                  <strong>Item</strong>: {resolvedItemName}
                </p>
                <p>
                  <strong>Route</strong>: {detailHref}
                </p>
                <p>
                  <strong>Family</strong>: {workspaceView.family.name}
                </p>
              </div>
              <div className="surface-note">
                <p>
                  <strong>Next step</strong>: replace this card with the module-specific detail body.
                </p>
                <p>
                  <strong>Edit path</strong>: {editHref}
                </p>
                <p>
                  <strong>List path</strong>: {moduleHref}
                </p>
              </div>
            </div>
          ) : (
            <div className="form-stack">
              <label className="form-label">
                Title
                <input
                  className="text-input"
                  defaultValue={
                    mode === "edit" ? `${resolvedItemName} draft` : `${spec.label} draft title`
                  }
                  readOnly
                  type="text"
                />
              </label>
              <label className="form-label">
                Summary
                <textarea
                  className="text-input text-input--tall"
                  defaultValue={`${spec.summary} This editor frame is ready for real module CRUD wiring.`}
                  readOnly
                />
              </label>
              <div className="builder-save-row">
                <Link className="button button--secondary" href={mode === "edit" ? detailHref : moduleHref}>
                  {mode === "edit" ? "Back to detail" : "Back to list"}
                </Link>
                <Link className="button button--ghost" href={mode === "edit" ? editHref : newHref}>
                  Stay on this route
                </Link>
              </div>
            </div>
          )}
        </SurfaceCard>
      </section>
    </div>
  );
}
