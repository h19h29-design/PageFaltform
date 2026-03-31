import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { PageShell, StatusPill, SurfaceCard } from "@ysplan/ui";

import {
  buildClubDetailHref,
  buildClubDirectoryHref,
  buildClubJoinHref,
  buildClubMobilePreviewHref,
} from "../../../../../../src/lib/club-app-routes";
import { resolveClubPreviewFromSlug } from "../../../../../../src/lib/club-sites-store";
import { getActivePlatformUserSession } from "../../../../../../src/lib/server-sessions";
import { getSharedThemePreset } from "../../../../../../src/lib/shared-themes";

type ClubMobilePreviewPageProps = {
  params: Promise<{ clubSlug: string }>;
  searchParams: Promise<{ screen?: string }>;
};

const mobileScreens = [
  {
    key: "detail",
    label: "클럽 소개",
    resolveHref: (clubSlug: string) => buildClubDetailHref(clubSlug),
  },
  {
    key: "join",
    label: "가입 신청",
    resolveHref: (clubSlug: string) => buildClubJoinHref(clubSlug),
  },
  {
    key: "directory",
    label: "클럽 목록",
    resolveHref: () => buildClubDirectoryHref(),
  },
] as const;

export default async function ClubMobilePreviewPage(props: ClubMobilePreviewPageProps) {
  const { clubSlug } = await props.params;
  const searchParams = await props.searchParams;
  const platformSession = await getActivePlatformUserSession();
  const club = await resolveClubPreviewFromSlug(clubSlug, platformSession);

  if (!club) {
    notFound();
  }

  const activeScreen =
    mobileScreens.find((screen) => screen.key === searchParams.screen) ?? mobileScreens[0]!;
  const previewHref = activeScreen.resolveHref(club.slug);
  const theme = getSharedThemePreset(club.themePreset);

  return (
    <main
      className="bpage-landing"
      style={{
        "--landing-accent": theme.familyTheme.accentColor,
        "--landing-warm": theme.familyTheme.warmColor,
        "--landing-surface": theme.familyTheme.surfaceColor,
        "--landing-highlight": theme.familyTheme.highlightColor,
      } as CSSProperties}
    >
      <PageShell
        eyebrow="모바일 미리보기"
        title={`${club.name} 모바일 화면`}
        subtitle="데스크톱에서 클럽 공개 화면과 가입 흐름이 모바일 폭에서 어떻게 보이는지 바로 확인할 수 있습니다."
        actions={
          <div className="inline-actions">
            <Link className="button button--secondary" href={buildClubDetailHref(club.slug)}>
              클럽 상세
            </Link>
            <Link className="button button--ghost" href={buildClubDirectoryHref()}>
              클럽 목록
            </Link>
          </div>
        }
      >
        <div className="grid-two mobile-preview-layout">
          <SurfaceCard
            title="미리보기 화면"
            description="아래 버튼을 누르면 클럽 소개, 가입 신청, 목록 흐름을 모바일 프레임에서 바로 바꿔볼 수 있습니다."
            badge={<StatusPill tone="accent">{theme.label}</StatusPill>}
          >
            <div className="mobile-preview-tabs">
              {mobileScreens.map((screen) => (
                <Link
                  key={screen.key}
                  className={`mobile-preview-tab${
                    activeScreen.key === screen.key ? " mobile-preview-tab--active" : ""
                  }`}
                  href={buildClubMobilePreviewHref(club.slug, screen.key)}
                >
                  {screen.label}
                </Link>
              ))}
            </div>

            <div className="surface-note">
              <p>
                현재 화면: <strong>{activeScreen.label}</strong>
              </p>
              <p>
                실제 주소: <strong>{previewHref}</strong>
              </p>
            </div>
          </SurfaceCard>

          <div className="mobile-preview-stage">
            <div className="mobile-preview-frame">
              <div className="mobile-preview-frame__notch" />
              <iframe
                className="mobile-preview-frame__viewport"
                src={previewHref}
                title={`${club.name} ${activeScreen.label} 모바일 미리보기`}
              />
            </div>
          </div>
        </div>
      </PageShell>
    </main>
  );
}
