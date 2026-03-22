import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getFamilyAppView } from "src/lib/family-app-view";

type FamilyAppLayoutProps = {
  children: ReactNode;
  params: Promise<{ familySlug: string }>;
};

export default async function FamilyAppLayout({ children, params }: FamilyAppLayoutProps) {
  const { familySlug } = await params;
  const familyAppView = await getFamilyAppView(familySlug);

  if (!familyAppView) {
    notFound();
  }

  if (!familyAppView.hasAccess) {
    redirect(`/f/${familyAppView.workspaceView.family.slug}?step=access&error=session-expired`);
  }

  return children;
}
