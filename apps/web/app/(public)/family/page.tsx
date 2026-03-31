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

import { listPublicFamilyPreviews } from "../../../src/lib/family-sites-store";
import { getActivePlatformUserSession } from "../../../src/lib/server-sessions";

export default async function FamilyPage() {
  const platformSession = await getActivePlatformUserSession();
  const families = await listPublicFamilyPreviews(platformSession);
  const canManageConsole = platformSession ? canAccessConsole(platformSession) : false;
  const featuredFamily = families[0] ?? null;

  return (
    <PageShell
      mode="public"
      eyebrow="Family"
      title="가족홈을 고르고 바로 들어갑니다."
      subtitle="생활 게시판은 홈 안에서 씁니다."
      actions={
        <div className="inline-actions">
          <Link className="button button--ghost" href="/">
            메인 홈
          </Link>
          <Link className="button button--secondary" href="/club">
            클럽 보기
          </Link>
        </div>
      }
    >
      <HeroCard
        eyebrow="생활 중심 보드"
        title="일정, 공지, 체크리스트를 한 집의 흐름으로 묶습니다."
        subtitle="정회원은 가족홈을 1개까지 만들고, 다른 가족홈은 승인받아 참여할 수 있습니다."
        meta={
          <>
            <StatusPill tone="accent">가족홈 1개</StatusPill>
            <StatusPill tone="warm">클럽 3개</StatusPill>
            <StatusPill>{families.length}개 공개 가족</StatusPill>
          </>
        }
        actions={
          <div className="inline-actions">
            <Link className="button button--primary" href="/console/sign-in?next=/console/families/new">
              가족홈 만들기
            </Link>
            <Link className="button button--secondary" href="/sign-up">
              회원가입
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
            { label: "공개 가족홈", value: `${families.length}개` },
            { label: "가족 생성 제한", value: "정회원 1개" },
            { label: "공용 테마", value: "10종" },
            { label: "비공개 가족홈", value: "가입자만 노출" },
          ]}
        />
      </HeroCard>

      <section className="surface-stack">
        <SectionHeader
          kicker="Directory"
          title="지금 둘러볼 수 있는 가족홈"
          action={<StatusPill tone="accent">{families.length}개</StatusPill>}
        />

        <div style={{ display: "grid", gap: 16 }}>
          {families.map((family) => (
            <div
              key={family.slug}
              style={{
                borderRadius: 28,
                padding: 1,
                background: `linear-gradient(135deg, ${family.theme.accentColor}25, ${family.theme.highlightColor}50 56%, rgba(255, 255, 255, 0.9))`,
              }}
            >
              <SurfaceCard
                eyebrow={family.householdMood}
                title={family.name}
                description={family.tagline}
                badge={
                  <StatusPill tone={family.visibility === "private" ? "danger" : "accent"}>
                    {family.visibility === "private" ? "비공개" : "공개"}
                  </StatusPill>
                }
                footer={
                  <div className="inline-actions">
                    <Link className="button button--primary" href={`/f/${family.slug}`}>
                      입구 보기
                    </Link>
                  </div>
                }
              >
                <p className="feature-copy">{family.heroSummary}</p>
                <div className="pill-row">
                  <StatusPill tone="accent">{family.accessLabel}</StatusPill>
                  <StatusPill>{family.timezone}</StatusPill>
                  <StatusPill>{family.memberCount}명</StatusPill>
                </div>
              </SurfaceCard>
            </div>
          ))}
        </div>
      </section>

      {featuredFamily ? (
        <section className="surface-stack">
          <SectionHeader kicker="Focus" title="추천 가족홈" />
          <SurfaceCard
            title={featuredFamily.name}
            description={featuredFamily.tagline}
            badge={<StatusPill tone="warm">{featuredFamily.accessLabel}</StatusPill>}
            footer={
              <div className="inline-actions">
                <Link className="button button--primary" href={`/f/${featuredFamily.slug}`}>
                  바로 입장
                </Link>
              </div>
            }
          >
            <p className="feature-copy">{featuredFamily.welcomeMessage}</p>
          </SurfaceCard>
        </section>
      ) : null}
    </PageShell>
  );
}
