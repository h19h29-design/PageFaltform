import Link from "next/link";
import type { CSSProperties } from "react";

import { canAccessConsole } from "@ysplan/auth";
import { StatusPill } from "@ysplan/ui";

import { listPublicClubPreviews } from "../../src/lib/club-sites-store";
import { listPublicFamilyPreviews } from "../../src/lib/family-sites-store";
import { getActivePlatformUserSession } from "../../src/lib/server-sessions";
import { getSharedThemePreset } from "../../src/lib/shared-themes";

const branchCards = [
  {
    key: "family",
    eyebrow: "Family",
    title: "가족홈",
    summary:
      "공지, 일정, 체크리스트, 시간표, 목표까지 생활 중심 모듈을 모아 한 집의 리듬으로 정리하는 공간입니다.",
    href: "/family",
    primaryAction: "가족홈 보기",
    tone: "warm" as const,
    modules: ["공지", "일정", "체크리스트", "시간표", "목표", "루틴"],
  },
  {
    key: "club",
    eyebrow: "Club",
    title: "클럽과 모임",
    summary:
      "클럽 공개 소개, 가입 신청, 운영 보드, 갤러리와 리더보드까지 커뮤니티 흐름을 한곳에 담습니다.",
    href: "/club",
    primaryAction: "클럽 보기",
    tone: "accent" as const,
    modules: ["공지", "이벤트", "갤러리", "자료실", "리더보드", "FAQ"],
  },
];

export default async function LandingPage() {
  const platformSession = await getActivePlatformUserSession();
  const familyPreviews = await listPublicFamilyPreviews(platformSession);
  const clubPreviews = await listPublicClubPreviews(platformSession);
  const heroTheme = getSharedThemePreset("midnight-galaxy");

  return (
    <main
      className="bpage-landing"
      style={
        {
          "--landing-accent": heroTheme.familyTheme.accentColor,
          "--landing-warm": heroTheme.familyTheme.warmColor,
          "--landing-surface": heroTheme.familyTheme.surfaceColor,
          "--landing-highlight": heroTheme.familyTheme.highlightColor,
        } as CSSProperties
      }
    >
      <section className="bpage-landing__hero">
        <div className="bpage-landing__backdrop" aria-hidden="true" />

        <header className="bpage-landing__nav">
          <Link className="bpage-landing__brand" href="/">
            B-page
          </Link>
          <nav className="bpage-landing__nav-links">
            <Link href="/family">가족홈</Link>
            <Link href="/club">클럽</Link>
            {platformSession ? (
              canAccessConsole(platformSession) ? (
                <Link href="/console">관리</Link>
              ) : (
                <Link href="/sign-in">내 계정</Link>
              )
            ) : (
              <>
                <Link href="/sign-in">로그인</Link>
                <Link href="/sign-up">회원가입</Link>
              </>
            )}
          </nav>
        </header>

        <div className="bpage-landing__hero-inner">
          <div className="bpage-landing__copy">
            <p className="bpage-landing__eyebrow">B-page Integrated Platform</p>
            <h1>하나의 메인에서 들어갈 공간을 고르고, 안에서는 각자의 홈을 바로 씁니다.</h1>
            <p className="bpage-landing__lead">
              메인에서는 선택만 하고, 실제 사용은 각 홈 안에서 이어집니다.
            </p>

            <div className="bpage-landing__hero-actions">
              <Link className="button button--primary" href="/family">
                가족홈 보기
              </Link>
              <Link className="button button--secondary" href="/club">
                클럽 보기
              </Link>
              {platformSession && canAccessConsole(platformSession) ? (
                <Link className="button button--ghost" href="/console">
                  백스테이지
                </Link>
              ) : null}
            </div>
          </div>

          <div className="bpage-landing__summary">
            <div className="bpage-stat">
              <span>공개 가족홈</span>
              <strong>{familyPreviews.length}</strong>
            </div>
            <div className="bpage-stat">
              <span>공개 클럽</span>
              <strong>{clubPreviews.length}</strong>
            </div>
            <div className="bpage-stat">
              <span>공용 테마</span>
              <strong>10</strong>
            </div>
            <div className="bpage-stat">
              <span>생성 제한</span>
              <strong>가족 1 / 클럽 3</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="bpage-landing__paths">
        {branchCards.map((branch) => (
          <article className={`bpage-branch-card bpage-branch-card--${branch.key}`} key={branch.key}>
            <div className="bpage-branch-card__top">
              <p className="eyebrow">{branch.eyebrow}</p>
              <StatusPill tone={branch.tone}>
                {branch.key === "family" ? "생활 중심" : "커뮤니티 중심"}
              </StatusPill>
            </div>
            <h2>{branch.title}</h2>
            <p>{branch.summary}</p>
            <div className="pill-row">
              {branch.modules.map((module) => (
                <span className="module-pill" key={module}>
                  {module}
                </span>
              ))}
            </div>
            <Link className="button button--primary" href={branch.href}>
              {branch.primaryAction}
            </Link>
          </article>
        ))}
      </section>

      <section className="bpage-landing__preview-grid">
        <article className="surface-card surface-card--warm">
          <header className="surface-card__header">
            <div>
              <p className="eyebrow">Family Preview</p>
              <h2 className="surface-card__title">지금 바로 들어갈 가족홈</h2>
            </div>
            <StatusPill tone="warm">{familyPreviews.length}개</StatusPill>
          </header>
          <div className="bpage-mini-list">
            {familyPreviews.slice(0, 3).map((family) => (
              <Link className="bpage-mini-link" href={`/f/${family.slug}`} key={family.slug}>
                <strong>{family.name}</strong>
                <span>{family.tagline}</span>
              </Link>
            ))}
          </div>
        </article>

        <article className="surface-card surface-card--accent">
          <header className="surface-card__header">
            <div>
              <p className="eyebrow">Club Preview</p>
              <h2 className="surface-card__title">지금 둘러볼 클럽</h2>
            </div>
            <StatusPill tone="accent">{clubPreviews.length}개</StatusPill>
          </header>
          <div className="bpage-mini-list">
            {clubPreviews.slice(0, 3).map((club) => (
              <Link className="bpage-mini-link" href={`/clubs/${club.slug}`} key={club.slug}>
                <strong>{club.name}</strong>
                <span>{club.tagline}</span>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
