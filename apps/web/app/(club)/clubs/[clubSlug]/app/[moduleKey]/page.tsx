import Link from "next/link";
import { notFound } from "next/navigation";

import { MetricList, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import { ClubAppShell } from "src/components/club-app-shell";
import { requireClubAppAccess } from "src/lib/club-app-access";

type ClubAppModulePageProps = {
  params: Promise<{ clubSlug: string; moduleKey: string }>;
};

function getModuleBoard(moduleKey: string, clubName: string, nextEventLabel: string) {
  switch (moduleKey) {
    case "announcements":
      return {
        title: "공지 보드",
        stats: [
          { label: "첫 확인", value: "운영 공지" },
          { label: "다음 일정", value: nextEventLabel },
          { label: "공간 성격", value: "변경과 안내" },
          { label: "클럽", value: clubName },
        ],
        cards: ["운영 공지", "참여 안내", "다음 알림"],
      };
    case "events":
      return {
        title: "일정 보드",
        stats: [
          { label: "핵심 일정", value: nextEventLabel },
          { label: "보는 방식", value: "일정 중심" },
          { label: "준비 흐름", value: "모임 전 체크" },
          { label: "클럽", value: clubName },
        ],
        cards: ["이번 주 일정", "이동과 장소", "준비물"],
      };
    case "gallery":
      return {
        title: "갤러리 보드",
        stats: [
          { label: "최근 업로드", value: "최신 사진 우선" },
          { label: "표시 방식", value: "사진 카드" },
          { label: "공간 성격", value: "기록과 보관" },
          { label: "클럽", value: clubName },
        ],
        cards: ["최근 사진", "오늘의 장면", "지난 기록"],
      };
    case "leaderboard":
      return {
        title: "리더보드",
        stats: [
          { label: "보는 방식", value: "순위와 점수" },
          { label: "강조", value: "참여 흐름" },
          { label: "현재 초점", value: "이번 주 기록" },
          { label: "클럽", value: clubName },
        ],
        cards: ["이번 주 순위", "참여 점수", "멤버 메모"],
      };
    case "faq":
      return {
        title: "자주 묻는 질문",
        stats: [
          { label: "보는 방식", value: "질문과 답" },
          { label: "용도", value: "새 멤버 안내" },
          { label: "공간 성격", value: "빠른 확인" },
          { label: "클럽", value: clubName },
        ],
        cards: ["가입 질문", "이용 질문", "운영 질문"],
      };
    case "resources":
      return {
        title: "자료실",
        stats: [
          { label: "보는 방식", value: "문서와 체크리스트" },
          { label: "용도", value: "운영 자료 보관" },
          { label: "강조", value: "자주 찾는 자료" },
          { label: "클럽", value: clubName },
        ],
        cards: ["운영 문서", "체크리스트", "공유 자료"],
      };
    default:
      return null;
  }
}

export default async function ClubAppModulePage(props: ClubAppModulePageProps) {
  const { clubSlug, moduleKey } = await props.params;
  const access = await requireClubAppAccess(clubSlug);

  const moduleEntry = access.moduleEntries.find((entry) => entry.moduleKey === moduleKey);

  if (!moduleEntry) {
    notFound();
  }

  const board = getModuleBoard(moduleEntry.moduleKey, access.club.name, access.club.nextEventLabel);

  if (!board) {
    notFound();
  }

  return (
    <ClubAppShell access={access}>
      <section className="surface-stack">
        <SectionHeader
          kicker="클럽 모듈"
          title={moduleEntry.label}
          action={<StatusPill tone="accent">멤버 공간</StatusPill>}
        />

        <div className="inline-actions">
          <Link className="button button--secondary" href={`/clubs/${access.club.slug}/app`}>
            클럽 홈
          </Link>
          <Link className="button button--ghost" href={`/clubs/${access.club.slug}`}>
            공개 화면
          </Link>
        </div>

        <div className="grid-two">
          <SurfaceCard title={board.title} badge={<StatusPill tone="accent">{moduleEntry.label}</StatusPill>}>
            <MetricList items={board.stats} />
          </SurfaceCard>

          <SurfaceCard title="현재 상태">
            <MetricList
              items={[
                { label: "클럽", value: access.club.name },
                { label: "권한", value: `${access.viewerRole}` },
                { label: "테마", value: access.themeLabel },
                { label: "위치", value: access.club.location },
              ]}
            />
          </SurfaceCard>
        </div>
      </section>

      <section className="surface-stack">
        <SectionHeader kicker="보드 미리보기" title="지금 보이는 카드" />
        <div className="route-card-grid module-hub-grid">
          {board.cards.map((cardTitle) => (
            <SurfaceCard
              key={cardTitle}
              title={cardTitle}
              badge={<StatusPill>{moduleEntry.label}</StatusPill>}
              className="module-hub-card"
            />
          ))}
        </div>
      </section>
    </ClubAppShell>
  );
}
