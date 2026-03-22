import { notFound } from "next/navigation";

import type { ModuleKey } from "@ysplan/modules-core";

import { FamilyAppShell } from "src/components/family-app-shell";
import { FamilyModuleShell } from "src/components/family-module-shell";
import { getFamilyAppView } from "src/lib/family-app-view";
import { getFamilyModuleRouteSpec } from "src/lib/family-app-routes";

type FamilyModuleEditPageProps = {
  params: Promise<{ familySlug: string; moduleKey: string; itemSlug: string }>;
};

export default async function FamilyModuleEditPage({ params }: FamilyModuleEditPageProps) {
  const { familySlug, moduleKey, itemSlug } = await params;
  const familyAppView = await getFamilyAppView(familySlug);

  const spec = getFamilyModuleRouteSpec(moduleKey);

  if (!familyAppView || !spec) {
    notFound();
  }

  return (
    <FamilyAppShell
      canManage={familyAppView.canManage}
      subtitle={spec.summary}
      title={`${spec.label} edit`}
      viewerRole={familyAppView.viewerRole}
      workspaceView={familyAppView.workspaceView}
    >
      <FamilyModuleShell
        itemSlug={itemSlug}
        mode="edit"
        moduleKey={moduleKey as ModuleKey}
        workspaceView={familyAppView.workspaceView}
      />
    </FamilyAppShell>
  );
}
