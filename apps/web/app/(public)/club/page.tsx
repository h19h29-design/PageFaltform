import Link from "next/link";

import { canAccessConsole } from "@ysplan/auth";
import { HeroCard, MetricList, PageShell, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import { getDisplayClub } from "../../../src/lib/club-copy";
import { listPublicClubPreviews } from "../../../src/lib/club-sites-store";
import { getActivePlatformUserSession } from "../../../src/lib/server-sessions";
import { getSharedThemePreset } from "../../../src/lib/shared-themes";

export default async function ClubPage() {
  const platformSession = await getActivePlatformUserSession();
  const clubs = (await listPublicClubPreviews(platformSession)).map(getDisplayClub);
  const canManageConsole = platformSession ? canAccessConsole(platformSession) : false;
  const highlightedClub = clubs[0] ?? null;
  const clubTheme = highlightedClub ? getSharedThemePreset(highlightedClub.themePreset) : null;

  return (
    <PageShell
      mode="public"
      eyebrow="클럽"
      title="클럽과 동호회 공간을 고르고 바로 들어가세요"
      subtitle="설명보다 선택이 먼저 보이도록 정리했습니다. 공개 소개를 보고, 마음에 드는 곳에 바로 신청하면 됩니다."
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
        eyebrow="커뮤니티 보드"
        title="공지, 일정, 사진 기록을 실제 사용하는 흐름으로 모읍니다"
        subtitle="정회원은 클럽을 최대 3개까지 만들 수 있고, 가입 신청과 승인 흐름까지 한 번에 관리할 수 있습니다."
        meta={
          <>
            <StatusPill tone="accent">클럽 3개 생성</StatusPill>
            <StatusPill tone="warm">가입 신청 후 승인</StatusPill>
            <StatusPill>{clubs.length}개 공개 클럽</StatusPill>
          </>
        }
        actions={
          <div className="inline-actions">
            <Link className="button button--primary" href="/clubs">
              클럽 목록 보기
            </Link>
            <Link className="button button--secondary" href="/sign-in?next=/console/clubs/new">
              클럽 만들기
            </Link>
            {canManageConsole ? (
              <Link className="button button--ghost" href="/console">
                관리 콘솔
              </Link>
            ) : null}
          </div>
        }
      >
        <MetricList
          items={[
            { label: "공개 클럽", value: `${clubs.length}개` },
            { label: "생성 가능", value: "정회원 3개" },
            { label: "가입 흐름", value: "신청 → 승인" },
            { label: "공용 테마", value: "10종" },
          ]}
        />
      </HeroCard>

      {highlightedClub && clubTheme ? (
        <section className="surface-stack">
          <SectionHeader kicker="추천 클럽" title="바로 보기" />
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
                    자세히 보기
                  </Link>
                  <Link className="button button--secondary" href={`/clubs/${highlightedClub.slug}/join`}>
                    가입 신청
                  </Link>
                </div>
              }
            >
              <p className="feature-copy">{highlightedClub.description}</p>
              <div className="pill-row">
                <StatusPill tone="warm">{highlightedClub.memberCount}명</StatusPill>
                <StatusPill>{highlightedClub.nextEventLabel}</StatusPill>
                <StatusPill>{highlightedClub.ownerName}</StatusPill>
              </div>
            </SurfaceCard>
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
