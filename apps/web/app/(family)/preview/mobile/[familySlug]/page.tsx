import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell, StatusPill, SurfaceCard } from "@ysplan/ui";

import { requireFamilyAppAccessPage } from "src/lib/family-app-access";
import {
  buildFamilyHomeHref,
  buildFamilyModuleHref,
  buildFamilyMobilePreviewHref,
} from "src/lib/family-app-routes";
import { createFamilySceneStyle } from "src/lib/theme-scene";

type MobilePreviewPageProps = {
  params: Promise<{ familySlug: string }>;
  searchParams: Promise<{ screen?: string }>;
};

const mobileScreens = [
  { key: "home", label: "가족 홈", resolveHref: (familySlug: string) => buildFamilyHomeHref(familySlug) },
  { key: "announcements", label: "공지", resolveHref: (familySlug: string) => buildFamilyModuleHref(familySlug, "announcements") },
  { key: "calendar", label: "일정", resolveHref: (familySlug: string) => buildFamilyModuleHref(familySlug, "calendar") },
  { key: "todo", label: "체크리스트", resolveHref: (familySlug: string) => buildFamilyModuleHref(familySlug, "todo") },
  { key: "school-timetable", label: "시간표", resolveHref: (familySlug: string) => buildFamilyModuleHref(familySlug, "school-timetable") },
  { key: "progress", label: "목표", resolveHref: (familySlug: string) => buildFamilyModuleHref(familySlug, "progress") },
] as const;

export default async function MobilePreviewPage(props: MobilePreviewPageProps) {
  const { familySlug } = await props.params;
  const searchParams = await props.searchParams;
  const { workspaceView } = await requireFamilyAppAccessPage(familySlug);

  if (!workspaceView) {
    notFound();
  }

  const activeScreen =
    mobileScreens.find((screen) => screen.key === searchParams.screen) ?? mobileScreens[0]!;
  const previewHref = activeScreen.resolveHref(workspaceView.family.slug);

  return (
    <div
      className="family-scene"
      style={createFamilySceneStyle(
        workspaceView.family.theme,
        workspaceView.workspace.themePreset,
      )}
    >
      <PageShell
        eyebrow="모바일 미리보기"
        title={`${workspaceView.family.name} 모바일 미리보기`}
        subtitle="데스크톱에서 모바일 화면 비율로 홈과 주요 게시판을 빠르게 확인하는 전용 주소입니다."
        actions={
          <div className="inline-actions">
            <Link className="button button--secondary" href={buildFamilyHomeHref(workspaceView.family.slug)}>
              가족 홈
            </Link>
            <Link className="button button--ghost" href={`/console/families/${workspaceView.family.slug}`}>
              빌더
            </Link>
          </div>
        }
      >
        <div className="grid-two mobile-preview-layout">
          <SurfaceCard
            title="화면 선택"
            description="아래 버튼으로 모바일에서 어떻게 보이는지 즉시 바꿔볼 수 있습니다."
            badge={<StatusPill tone="accent">{workspaceView.themePresetLabel}</StatusPill>}
          >
            <div className="mobile-preview-tabs">
              {mobileScreens.map((screen) => (
                <Link
                  className={`mobile-preview-tab${
                    activeScreen.key === screen.key ? " mobile-preview-tab--active" : ""
                  }`}
                  href={buildFamilyMobilePreviewHref(workspaceView.family.slug, screen.key)}
                  key={screen.key}
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
                title={`${workspaceView.family.name} ${activeScreen.label} 미리보기`}
              />
            </div>
          </div>
        </div>
      </PageShell>
    </div>
  );
}
