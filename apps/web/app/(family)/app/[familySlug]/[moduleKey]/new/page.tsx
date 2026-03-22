import { notFound } from "next/navigation";

import type { ModuleKey } from "@ysplan/modules-core";

import { FamilyAppShell } from "src/components/family-app-shell";
import { FamilyModuleShell } from "src/components/family-module-shell";
import { getFamilyAppView } from "src/lib/family-app-view";
import { getFamilyModuleRouteSpec } from "src/lib/family-app-routes";

type FamilyModuleNewPageProps = {
  params: Promise<{ familySlug: string; moduleKey: string }>;
};

export default async function FamilyModuleNewPage({ params }: FamilyModuleNewPageProps) {
  const { familySlug, moduleKey } = await params;
  const familyAppView = await getFamilyAppView(familySlug);

  const spec = getFamilyModuleRouteSpec(moduleKey);

  if (!familyAppView || !spec) {
    notFound();
  }

  return (
    <FamilyAppShell
      canManage={familyAppView.canManage}
      subtitle={spec.summary}
      title={`${spec.label} create`}
      viewerRole={familyAppView.viewerRole}
      workspaceView={familyAppView.workspaceView}
    >
      <FamilyModuleShell
        mode="new"
        moduleKey={moduleKey as ModuleKey}
        workspaceView={familyAppView.workspaceView}
      />
    </FamilyAppShell>
  );
}
