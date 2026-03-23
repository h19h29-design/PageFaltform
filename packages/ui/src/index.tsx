import type { PropsWithChildren, ReactNode } from "react";

import { ExplanationToggle } from "./explanation-toggle";

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export function PageShell(props: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="page-shell">
      <header className="page-shell__header">
        {props.eyebrow ? <p className="eyebrow">{props.eyebrow}</p> : null}
        <div className="page-shell__title-row">
          <div>
            <h1 className="page-title">{props.title}</h1>
            {props.subtitle ? <p className="page-subtitle">{props.subtitle}</p> : null}
          </div>
          <div className="page-actions">
            <ExplanationToggle />
            {props.actions}
          </div>
        </div>
      </header>
      <div className="page-shell__content">{props.children}</div>
    </main>
  );
}

export function HeroCard(props: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  meta?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="hero-card">
      <div className="hero-card__content">
        {props.eyebrow ? <p className="eyebrow">{props.eyebrow}</p> : null}
        <h2 className="hero-card__title">{props.title}</h2>
        <p className="hero-card__subtitle">{props.subtitle}</p>
        {props.meta ? <div className="hero-card__meta">{props.meta}</div> : null}
        {props.actions ? <div className="hero-card__actions">{props.actions}</div> : null}
      </div>
      {props.children ? <div className="hero-card__aside">{props.children}</div> : null}
    </section>
  );
}

export function SurfaceCard(props: {
  title: string;
  description?: string | undefined;
  eyebrow?: string | undefined;
  badge?: ReactNode | undefined;
  tone?: "default" | "accent" | "warm" | undefined;
  footer?: ReactNode | undefined;
  className?: string | undefined;
  children?: ReactNode | undefined;
}) {
  return (
    <section className={joinClassNames("surface-card", props.tone ? `surface-card--${props.tone}` : "", props.className)}>
      <header className="surface-card__header">
        <div>
          {props.eyebrow ? <p className="eyebrow">{props.eyebrow}</p> : null}
          <h3 className="surface-card__title">{props.title}</h3>
          {props.description ? <p className="surface-card__description">{props.description}</p> : null}
        </div>
        {props.badge ? <div className="surface-card__badge">{props.badge}</div> : null}
      </header>
      {props.children ? <div className="surface-card__content">{props.children}</div> : null}
      {props.footer ? <footer className="surface-card__footer">{props.footer}</footer> : null}
    </section>
  );
}

export function SectionHeader(props: {
  kicker?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-header">
      <div>
        {props.kicker ? <p className="section-header__kicker">{props.kicker}</p> : null}
        <h2 className="section-header__title">{props.title}</h2>
      </div>
      {props.action ? <div className="section-header__action">{props.action}</div> : null}
    </div>
  );
}

export function StatusPill(props: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "warm" | "danger";
}) {
  return <span className={joinClassNames("status-pill", props.tone ? `status-pill--${props.tone}` : "")}>{props.children}</span>;
}

export function MetricList(props: {
  items: Array<{
    label: string;
    value: string;
  }>;
}) {
  return (
    <dl className="metric-list">
      {props.items.map((item) => (
        <div className="metric-list__item" key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

type PanelProps = PropsWithChildren<{
  eyebrow?: string | undefined;
  title: string;
  description?: string | undefined;
  action?: ReactNode | undefined;
  className?: string | undefined;
}>;

export function Panel({
  eyebrow,
  title,
  description,
  action,
  className,
  children
}: PanelProps) {
  return (
    <section className={joinClassNames("ys-panel", className)}>
      <header className="ys-panel-header">
        <div className="ys-panel-copy">
          {eyebrow ? <p className="ys-eyebrow">{eyebrow}</p> : null}
          <h2 className="ys-panel-title">{title}</h2>
          {description ? <p className="ys-panel-description">{description}</p> : null}
        </div>
        {action ? <div className="ys-panel-action">{action}</div> : null}
      </header>
      {children ? <div className="ys-panel-body">{children}</div> : null}
    </section>
  );
}

export function Badge({
  children,
  tone = "neutral"
}: PropsWithChildren<{ tone?: "neutral" | "accent" }>) {
  return (
    <span
      className={joinClassNames(
        "ys-badge",
        tone === "accent" && "ys-badge-accent"
      )}
    >
      {children}
    </span>
  );
}

export function Metric({
  label,
  value,
  detail
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="ys-metric">
      <span className="ys-metric-label">{label}</span>
      <strong className="ys-metric-value">{value}</strong>
      {detail ? <span className="ys-metric-detail">{detail}</span> : null}
    </div>
  );
}
