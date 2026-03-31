import Link from "next/link";

import { canAccessConsole } from "@ysplan/auth";
import {
  HeroCard,
  MetricList,
  PageShell,
  SectionHeader,
  StatusPill,
  SurfaceCard,
} from "@ysplan/ui";

import { listPublicClubPreviews } from "../../../src/lib/club-sites-store";
import { getActivePlatformUserSession } from "../../../src/lib/server-sessions";
import { getSharedThemePreset } from "../../../src/lib/shared-themes";

export default async function ClubPage() {
  const platformSession = await getActivePlatformUserSession();
  const clubs = await listPublicClubPreviews(platformSession);
  const canManageConsole = platformSession ? canAccessConsole(platformSession) : false;
  const highlightedClub = clubs[0] ?? null;
  const clubTheme = highlightedClub ? getSharedThemePreset(highlightedClub.themePreset) : null;

  return (
    <PageShell
      mode="public"
      eyebrow="Club"
      title="클럽을 고르고, 들어간 뒤에는 활동 흐름에 집중합니다."
      subtitle="공개 소개와 멤버 공간을 나눠 씁니다."
      actions={
        <div className="inline-actions">
          <Link className="button button--ghost" href="/">
            메인 홈
          </Link>
          <Link className="button button--secondary" href="/family">
            가족홈 보기
          </Link>
        </div>
      }
    >
      <HeroCard
        eyebrow="커뮤니티 중심 보드"
        title="소개, 가입, 활동 기록을 한 흐름으로 이어 둡니다."
        subtitle="정회원은 클럽을 3개까지 만들고, 비공개 클럽은 멤버와 관리자만 찾을 수 있습니다."
        meta={
          <>
            <StatusPill tone="accent">클럽 3개</StatusPill>
            <StatusPill tone="warm">가입 신청 / 초대제</StatusPill>
            <StatusPill>{clubs.length}개 공개 클럽</StatusPill>
          </>
        }
        actions={
          <div className="inline-actions">
            <Link className="button button--primary" href="/clubs">
              클럽 목록
            </Link>
            <Link className="button button--secondary" href="/sign-in?next=/console/clubs/new">
              클럽 만들기
            </Link>
            {canManageConsole ? (
              <Link className="button button--ghost" href="/console">
                콘솔
              </Link>
            ) : null}
          </div>
        }
      >
        <MetricList
          items={[
            { label: "공개 클럽", value: `${clubs.length}개` },
            { label: "클럽 생성 제한", value: "정회원 3개" },
            { label: "가입 방식", value: "신청 / 승인 / 초대제" },
            { label: "공용 테마", value: "10종" },
          ]}
        />
      </HeroCard>

      <section className="surface-stack">
        <SectionHeader kicker="Featured" title="추천 클럽" />
        {highlightedClub && clubTheme ? (
          <div
            style={{
              borderRadius: 28,
              padding: 1,
              background: `linear-gradient(135deg, ${clubTheme.familyTheme.accentColor}20, ${clubTheme.familyTheme.highlightColor}50 56%, rgba(255, 255, 255, 0.9))`,
            }}
          >
            <SurfaceCard
              eyebrow={`${highlightedClub.category} · ${clubTheme.label}`}
              title={highlightedClub.name}
              description={highlightedClub.tagline}
              badge={<StatusPill tone="accent">{highlightedClub.accessLabel}</StatusPill>}
              footer={
                <div className="inline-actions">
                  <Link className="button button--primary" href={`/clubs/${highlightedClub.slug}`}>
                    상세 보기
                  </Link>
                  <Link className="button button--secondary" href={`/clubs/${highlightedClub.slug}/join`}>
                    가입 신청
                  </Link>
                </div>
              }
            >
              <p className="feature-copy">{highlightedClub.description}</p>
              <p className="helper-text">{clubTheme.mood}</p>
              <div className="pill-row">
                <StatusPill tone="warm">{highlightedClub.memberCount}명</StatusPill>
                <StatusPill>{highlightedClub.nextEventLabel}</StatusPill>
                <StatusPill>{highlightedClub.ownerName}</StatusPill>
              </div>
            </SurfaceCard>
          </div>
        ) : null}
      </section>

      <section className="surface-stack">
        <SectionHeader kicker="Preview" title="지금 열려 있는 공개 클럽" />
        <div style={{ display: "grid", gap: 16 }}>
          {clubs.slice(0, 3).map((club) => {
            const theme = getSharedThemePreset(club.themePreset);

            return (
              <div
                key={club.slug}
                style={{
                  borderRadius: 28,
                  padding: 1,
                  background: `linear-gradient(135deg, ${theme.familyTheme.accentColor}20, ${theme.familyTheme.surfaceColor})`,
                }}
              >
                <SurfaceCard
                  eyebrow={`${club.category} · ${theme.label}`}
                  title={club.name}
                  description={club.tagline}
                  badge={<StatusPill tone="warm">{club.accessLabel}</StatusPill>}
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
                  <p className="feature-copy">{club.description}</p>
                  <p className="helper-text">{theme.mood}</p>
                  <div className="pill-row">
                    <StatusPill tone="accent">{club.memberCount}명</StatusPill>
                    <StatusPill>{club.nextEventLabel}</StatusPill>
                    {club.sampleModules.slice(0, 4).map((module) => (
                      <span className="module-pill" key={module}>
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
