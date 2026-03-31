import Link from "next/link";

import { HeroCard, PageShell, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import { getDisplayClub } from "../../../src/lib/club-copy";
import { listPublicClubPreviews } from "../../../src/lib/club-sites-store";
import { getActivePlatformUserSession } from "../../../src/lib/server-sessions";
import { getSharedThemePreset } from "../../../src/lib/shared-themes";

export default async function ClubsDirectoryPage() {
  const platformSession = await getActivePlatformUserSession();
  const clubs = (await listPublicClubPreviews(platformSession)).map(getDisplayClub);

  return (
    <PageShell
      mode="public"
      eyebrow="클럽 목록"
      title="공개 클럽을 골라 바로 둘러보세요"
      subtitle="상세 페이지에서 분위기와 가입 방식을 확인하고, 마음에 드는 곳에 바로 신청할 수 있습니다."
      actions={
        <div className="inline-actions">
          <Link className="button button--ghost" href="/club">
            클럽 소개
          </Link>
          <Link className="button button--secondary" href="/family">
            가족홈 보기
          </Link>
        </div>
      }
    >
      <HeroCard
        eyebrow="디렉터리"
        title="분위기, 가입 방식, 다음 일정만 보고 빠르게 고르세요"
        subtitle="비공개 클럽은 승인된 멤버만 찾을 수 있고, 공개 클럽은 상세 페이지에서 바로 신청 흐름으로 이어집니다."
        meta={
          <>
            <StatusPill tone="accent">{clubs.length}개 공개 클럽</StatusPill>
            <StatusPill tone="warm">가입 신청 / 승인 / 초대</StatusPill>
            <StatusPill>테마 10종</StatusPill>
          </>
        }
      />

      <section className="surface-stack">
        <SectionHeader kicker="Directory" title="클럽 디렉터리" action={<StatusPill>{clubs.length}개</StatusPill>} />
        <div className="directory-grid">
          {clubs.map((club) => {
            const theme = getSharedThemePreset(club.themePreset);

            return (
              <div
                key={club.slug}
                style={{
                  borderRadius: 28,
                  padding: 1,
                  background: `linear-gradient(135deg, ${theme.familyTheme.accentColor}20, ${theme.familyTheme.highlightColor}45 60%, rgba(255,255,255,0.92))`,
                }}
              >
                <SurfaceCard
                  className="directory-card"
                  eyebrow={`${club.category} · ${theme.label}`}
                  title={club.name}
                  description={club.tagline}
                  badge={
                    <StatusPill tone={club.visibility === "private" ? "danger" : "accent"}>
                      {club.accessLabel}
                    </StatusPill>
                  }
                  footer={
                    <div className="inline-actions">
                      <Link className="button button--primary" href={`/clubs/${club.slug}`}>
                        자세히 보기
                      </Link>
                      <Link className="button button--secondary" href={`/clubs/${club.slug}/join`}>
                        가입 신청
                      </Link>
                    </div>
                  }
                >
                  <div className="directory-card__meta">
                    <StatusPill tone="accent">{club.memberCount}명</StatusPill>
                    <StatusPill>{club.nextEventLabel}</StatusPill>
                    <StatusPill tone="warm">{club.ownerName}</StatusPill>
                  </div>

                  <p className="feature-copy">{club.description}</p>

                  <div className="directory-card__highlights">
                    {club.highlights.slice(0, 3).map((highlight) => (
                      <div className="directory-card__highlight" key={`${club.slug}-${highlight.label}`}>
                        <strong>{highlight.label}</strong>
                        <span>{highlight.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pill-row">
                    {club.sampleModules.slice(0, 4).map((module) => (
                      <span className="module-pill" key={`${club.slug}-${module}`}>
                        {module}
                      </span>
                    ))}
                  </div>
                </SurfaceCard>
              </div>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
