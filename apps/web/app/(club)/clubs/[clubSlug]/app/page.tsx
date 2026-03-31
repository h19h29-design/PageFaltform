import Link from "next/link";

import { MetricList, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import { ClubAppShell } from "src/components/club-app-shell";
import { requireClubAppAccess } from "src/lib/club-app-access";

type ClubAppHomePageProps = {
  params: Promise<{ clubSlug: string }>;
};

export default async function ClubAppHomePage({ params }: ClubAppHomePageProps) {
  const { clubSlug } = await params;
  const access = await requireClubAppAccess(clubSlug);

  const memberSections = access.club.sections.filter((section) => section.audience === "member");
  const publicSections = access.club.sections.filter((section) => section.audience === "public");

  return (
    <ClubAppShell access={access}>
      <section className="surface-stack">
        <SectionHeader
          kicker="클럽 홈"
          title="지금 바로 보기"
          action={<StatusPill tone="accent">{access.moduleEntries.length}개 모듈</StatusPill>}
        />

        <div className="grid-two">
          <SurfaceCard title="다음 일정" badge={<StatusPill tone="accent">멤버용</StatusPill>}>
            <MetricList
              items={[
                { label: "다음 모임", value: access.club.nextEventLabel },
                { label: "현재 초점", value: access.club.currentFocus },
                { label: "참여 인원", value: `${access.memberCount}명` },
                { label: "내 권한", value: `${access.viewerRole}` },
              ]}
            />
          </SurfaceCard>

          <SurfaceCard title="클럽 상태">
            <MetricList
              items={[
                { label: "종목", value: access.club.sportLabel },
                { label: "장소", value: access.club.location },
                { label: "공개 범위", value: access.club.visibility === "private" ? "비공개" : "공개" },
                {
                  label: "가입 방식",
                  value: access.club.joinPolicy === "invite-first" ? "초대 우선" : "승인 필요",
                },
              ]}
            />
          </SurfaceCard>
        </div>
      </section>

      <section className="surface-stack">
        <SectionHeader
          kicker="게시판"
          title="열린 공간"
          action={<StatusPill>{access.moduleEntries.length}개</StatusPill>}
        />
        <div className="route-card-grid module-hub-grid">
          {access.moduleEntries.map((module) => (
            <SurfaceCard
              key={module.moduleKey}
              title={module.label}
              badge={<StatusPill tone="accent">열기</StatusPill>}
              className="module-hub-card"
              footer={
                <div className="inline-actions">
                  <Link className="button button--secondary button--small" href={module.href}>
                    열기
                  </Link>
                </div>
              }
            />
          ))}
        </div>
      </section>

      <section className="surface-stack">
        <SectionHeader kicker="구역" title="공개와 멤버 공간" />
        <div className="grid-two">
          <SurfaceCard title="멤버 전용">
            <div className="surface-stack">
              {memberSections.length > 0 ? (
                memberSections.map((section) => (
                  <div className="surface-note" key={section.key}>
                    <div className="inline-actions" style={{ justifyContent: "space-between" }}>
                      <strong>{section.title}</strong>
                      <StatusPill tone="warm">멤버</StatusPill>
                    </div>
                  </div>
                ))
              ) : (
                <div className="surface-note">
                  <strong>멤버 전용 구역이 아직 없습니다.</strong>
                </div>
              )}
            </div>
          </SurfaceCard>

          <SurfaceCard title="공개 구역">
            <div className="surface-stack">
              {publicSections.length > 0 ? (
                publicSections.map((section) => (
                  <div className="surface-note" key={section.key}>
                    <div className="inline-actions" style={{ justifyContent: "space-between" }}>
                      <strong>{section.title}</strong>
                      <StatusPill tone="accent">공개</StatusPill>
                    </div>
                  </div>
                ))
              ) : (
                <div className="surface-note">
                  <strong>공개 구역이 아직 없습니다.</strong>
                </div>
              )}
            </div>
          </SurfaceCard>
        </div>
      </section>
    </ClubAppShell>
  );
}
