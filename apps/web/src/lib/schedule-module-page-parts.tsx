import Link from "next/link";
import type { ReactNode } from "react";

import { StatusPill, SurfaceCard } from "@ysplan/ui";
import type { ModuleHomeCardRule } from "@ysplan/modules-core";

export function readQueryMessage(value?: string): string | null {
  if (!value) {
    return null;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function ModuleNoticeCard(props: {
  error?: string | undefined;
  state?: string | undefined;
}) {
  const errorMessage = readQueryMessage(props.error);
  const stateMessage = readQueryMessage(props.state);

  if (!errorMessage && !stateMessage) {
    return null;
  }

  return (
    <SurfaceCard
      title={errorMessage ? "입력 내용을 다시 확인해주세요" : "변경 내용이 반영되었습니다"}
      badge={
        <StatusPill tone={errorMessage ? "danger" : "accent"}>
          {errorMessage ? "오류" : "완료"}
        </StatusPill>
      }
      tone={errorMessage ? "warm" : "accent"}
    >
      <p className="feature-copy">{errorMessage ?? stateMessage}</p>
    </SurfaceCard>
  );
}

export function ModuleRuleListCard(props: {
  title: string;
  description: string;
  rules: readonly ModuleHomeCardRule[];
  extra?: ReactNode;
}) {
  return (
    <details className="module-help-card">
      <summary>
        <span>{props.title}</span>
        <span className="module-help-card__hint">설명 보기</span>
      </summary>
      <div className="module-help-card__body">
        <p className="helper-text">{props.description}</p>
        <ol className="journey-list">
          {props.rules.map((rule, index) => (
            <li className="journey-list__item" key={rule.id}>
              <span className="journey-list__number">{index + 1}</span>
              <div>
                <strong>{rule.title}</strong>
                <p className="feature-copy">{rule.description}</p>
              </div>
            </li>
          ))}
        </ol>
        {props.extra}
      </div>
    </details>
  );
}

export function ModuleEmptyState(props: {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <SurfaceCard title={props.title} description={props.description}>
      <div className="builder-empty">
        <p className="feature-copy">{props.description}</p>
        <div className="inline-actions">
          <Link className="button button--primary" href={props.actionHref}>
            {props.actionLabel}
          </Link>
        </div>
      </div>
    </SurfaceCard>
  );
}

export function ModuleHeaderActions(props: {
  familySlug: string;
  moduleSegment: string;
  listLabel: string;
  newLabel: string;
}) {
  const baseHref = `/app/${props.familySlug}/${props.moduleSegment}`;

  return (
    <div className="inline-actions">
      <Link className="button button--ghost" href={`/app/${props.familySlug}`}>
        홈으로
      </Link>
      <Link className="button button--secondary" href={baseHref}>
        {props.listLabel}
      </Link>
      <Link className="button button--primary" href={`${baseHref}/new`}>
        {props.newLabel}
      </Link>
    </div>
  );
}
