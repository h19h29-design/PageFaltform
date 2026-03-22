import type { ReactNode } from "react";

import { PageShell, SurfaceCard } from "@ysplan/ui";

import type { EffectiveFamilyWorkspace } from "../lib/family-workspace";
import { createFamilySceneStyle } from "../lib/theme-scene";

export function ContentModuleShell(props: {
  workspaceView: EffectiveFamilyWorkspace;
  eyebrow: string;
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className="family-scene"
      style={createFamilySceneStyle(props.workspaceView.family.theme)}
    >
      <PageShell
        eyebrow={props.eyebrow}
        title={props.title}
        subtitle={props.subtitle}
        actions={props.actions}
      >
        {props.children}
      </PageShell>
    </div>
  );
}

export function ContentMessageCard(props: {
  title: string;
  children: ReactNode;
  tone?: "default" | "accent" | "warm";
}) {
  return (
    <SurfaceCard title={props.title} tone={props.tone}>
      <p className="feature-copy">{props.children}</p>
    </SurfaceCard>
  );
}

export function ContentRecordCard(props: {
  eyebrow?: string;
  title: string;
  description: string;
  badge?: ReactNode;
  footer?: ReactNode;
  tone?: "default" | "accent" | "warm";
  children?: ReactNode;
}) {
  return (
    <SurfaceCard
      eyebrow={props.eyebrow}
      title={props.title}
      description={props.description}
      badge={props.badge}
      footer={props.footer}
      tone={props.tone}
    >
      {props.children}
    </SurfaceCard>
  );
}
