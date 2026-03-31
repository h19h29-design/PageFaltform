import Link from "next/link";

import {
  HeroCard,
  PageShell,
  SectionHeader,
  StatusPill,
  SurfaceCard,
} from "@ysplan/ui";

import { listPublicClubPreviews } from "../../../src/lib/club-sites-store";
import { getActivePlatformUserSession } from "../../../src/lib/server-sessions";
import { getSharedThemePreset } from "../../../src/lib/shared-themes";

export default async function ClubsDirectoryPage() {
  const platformSession = await getActivePlatformUserSession();
  const clubs = await listPublicClubPreviews(platformSession);

  return (
    <PageShell
      mode="public"
      eyebrow="클럽 목록"
      title="공개 클럽을 성격별로 바로 둘러보세요."
      subtitle="상세에 들어가면 바로 참여 흐름으로 이어집니다."
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
        eyebrow="공개 탐색"
        title="목록에서는 클럽의 분위기와 운영 방식이 먼저 보이고, 상세에서 바로 참여 흐름으로 이어집니다."
        subtitle="가입 신청형, 승인형, 초대제 여부를 카드에서 먼저 드러내고, 상세 페이지에서 운영 포인트와 공개 범위를 더 자세히 안내합니다."
        meta={
          <>
            <StatusPill tone="accent">{clubs.length}개 공개 클럽</StatusPill>
            <StatusPill tone="warm">가입 신청 / 초대제</StatusPill>
            <StatusPill>테마 10종</StatusPill>
          </>
        }
      />

      <section className="surface-stack">
        <SectionHeader
          kicker="Directory"
          title="클럽 디렉토리"
          action={<StatusPill>{clubs.length}개</StatusPill>}
        />
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
                        상세 보기
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

                  <div className="directory-card__summary">
                    <p className="feature-copy">{club.description}</p>
                    <p className="helper-text">{theme.mood}</p>
                  </div>

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
