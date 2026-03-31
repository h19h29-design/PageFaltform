import Link from "next/link";
import { redirect } from "next/navigation";

import { PageShell, StatusPill, SurfaceCard } from "@ysplan/ui";

import { getActiveConsoleSession } from "../../../../src/lib/server-sessions";
import { sharedThemePresets } from "../../../../src/lib/shared-themes";
import { getThemeSceneTokens } from "../../../../src/lib/theme-scene";

export default async function ConsoleThemesPage() {
  const consoleSession = await getActiveConsoleSession();

  if (!consoleSession) {
    redirect("/console/sign-in?error=session-required");
  }

  return (
    <PageShell
      mode="console"
      eyebrow="테마 스튜디오"
      title="B-page 공통 테마 10종"
      subtitle="가족홈과 클럽에서 함께 쓰는 테마 모음입니다."
      actions={
        <div className="inline-actions">
          <Link className="button button--ghost" href="/console">
            콘솔
          </Link>
          <Link className="button button--secondary" href="/console/families/new">
            가족홈 만들기
          </Link>
          <Link className="button button--secondary" href="/console/clubs/new">
            클럽 만들기
          </Link>
        </div>
      }
    >
      <div className="grid-two">
        <SurfaceCard
          title="사용 기준"
          badge={<StatusPill tone="accent">공통 자산</StatusPill>}
        >
          <ul className="stack-list">
            <li>한 테마는 한 폰트로 통일됩니다.</li>
            <li>색만 바뀌지 않고 모서리, 패널, 질감도 함께 달라집니다.</li>
            <li>가족홈과 클럽 모두 같은 테마 세트를 공유합니다.</li>
          </ul>
        </SurfaceCard>

        <SurfaceCard
          title="빠른 확인"
          badge={<StatusPill tone="warm">미리보기</StatusPill>}
        >
          <ul className="stack-list">
            <li>
              가족홈: <code>/console/families/{"{slug}"}</code> → <code>/app/{"{slug}"}</code>
            </li>
            <li>
              가족 모바일: <code>/preview/mobile/{"{slug}"}</code>
            </li>
            <li>
              클럽: <code>/console/clubs/{"{clubSlug}"}</code> → <code>/clubs/{"{clubSlug}"}</code>
            </li>
            <li>
              클럽 모바일: <code>/preview/mobile/club/{"{clubSlug}"}</code>
            </li>
          </ul>
        </SurfaceCard>
      </div>

      <section className="surface-stack">
        <div className="theme-showcase-grid">
          {sharedThemePresets.map((theme) => {
            const tokens = getThemeSceneTokens(theme);

            return (
              <div
                key={theme.key}
                className="theme-showcase-card"
                style={{
                  background: `linear-gradient(135deg, ${theme.familyTheme.accentColor}28, ${theme.familyTheme.highlightColor}70 58%, rgba(255,255,255,0.95))`,
                  borderRadius: tokens.sceneRadius,
                }}
              >
                <div
                  className="theme-showcase-card__inner"
                  style={{
                    borderRadius: `calc(${tokens.sceneRadius} - 1px)`,
                    fontFamily: theme.fontVar,
                  }}
                >
                  <div className="builder-theme-card__top">
                    <strong style={{ fontFamily: theme.fontVar }}>{theme.label}</strong>
                    <StatusPill tone="accent">{theme.shapePreset}</StatusPill>
                  </div>
                  <div className="theme-showcase-card__swatches" aria-hidden="true">
                    <span className="theme-showcase-card__swatch" style={{ background: theme.familyTheme.accentColor }} />
                    <span className="theme-showcase-card__swatch" style={{ background: theme.familyTheme.warmColor }} />
                    <span className="theme-showcase-card__swatch" style={{ background: theme.familyTheme.surfaceColor }} />
                    <span className="theme-showcase-card__swatch" style={{ background: theme.familyTheme.highlightColor }} />
                  </div>
                  <div className="theme-showcase-card__fonts">
                    <strong style={{ fontFamily: theme.fontVar }}>{theme.mood}</strong>
                    <span>{theme.description}</span>
                  </div>
                  <div className="pill-row">
                    <span className="module-pill">{theme.surfacePreset}</span>
                    <span className="module-pill">{theme.texture}</span>
                    <span className="module-pill">{theme.key}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
