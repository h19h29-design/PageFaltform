import { notFound } from "next/navigation";

import type { ModuleKey } from "@ysplan/modules-core";

import { FamilyAppShell } from "src/components/family-app-shell";
import { FamilyModuleShell } from "src/components/family-module-shell";
import { getFamilyAppView } from "src/lib/family-app-view";
import { getFamilyModuleRouteSpec } from "src/lib/family-app-routes";

type FamilyModuleDetailPageProps = {
  params: Promise<{ familySlug: string; moduleKey: string; itemSlug: string }>;
};

export default async function FamilyModuleDetailPage({ params }: FamilyModuleDetailPageProps) {
  const { familySlug, moduleKey, itemSlug } = await params;
  const familyAppView = await getFamilyAppView(familySlug);

  const spec = getFamilyModuleRouteSpec(moduleKey);

  if (!familyAppView || !spec) {
    notFound();
  }

  return (
    <FamilyAppShell
      canManage={familyAppView.canManage}
      subtitle=""
      title={`${spec.label} 상세`}
      viewerRole={familyAppView.viewerRole}
      workspaceView={familyAppView.workspaceView}
    >
      <FamilyModuleShell
        itemSlug={itemSlug}
        mode="detail"
        moduleKey={moduleKey as ModuleKey}
        workspaceView={familyAppView.workspaceView}
      />
    </FamilyAppShell>
  );
}
