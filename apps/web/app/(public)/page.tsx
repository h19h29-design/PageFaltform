import Link from "next/link";

import { canAccessConsole, listDemoConsoleUsers } from "@ysplan/auth";
import { coreModules } from "@ysplan/modules-core";
import { HeroCard, MetricList, PageShell, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import { signOutPlatformAction } from "../../src/actions/session-actions";
import { listPublicFamilyPreviews } from "../../src/lib/family-sites-store";
import { getActivePlatformUserSession } from "../../src/lib/server-sessions";

const flowStages = [
  {
    title: "가족 입장",
    description: "모든 가족 홈은 /f/[familySlug] 입구를 거쳐 앱으로 들어갑니다.",
    badge: "입장 먼저",
  },
  {
    title: "가족 앱",
    description: "홈, 게시판, 상세, 작성, 수정 경로가 하나의 앱 셸 아래에서 이어집니다.",
    badge: "앱 연결 완료",
  },
  {
    title: "콘솔",
    description: "운영자는 콘솔에서 가족 홈을 만들고, 프리셋을 바꾸고, 바로 실제 경로로 이동합니다.",
    badge: "운영 도구",
  },
];

export default async function LandingPage() {
  const families = await listPublicFamilyPreviews();
  const demoUsers = listDemoConsoleUsers();
  const consoleSession = await getActivePlatformUserSession();
  const moduleLabelByKey = new Map(coreModules.map((module) => [module.key, module.label]));

  return (
    <PageShell
      eyebrow="YSplan 가족 플랫폼"
      title="로컬에서 바로 시험할 수 있는 미니 가족 홈"
      subtitle="여러 가족 공간을 만들고, 입장부터 앱과 콘솔까지 이어서 테스트할 수 있는 플랫폼입니다."
      actions={
        consoleSession ? (
          <div className="inline-actions">
            {canAccessConsole(consoleSession) ? (
              <Link className="button button--secondary" href="/console">
                콘솔 열기
              </Link>
            ) : null}
            <form action={signOutPlatformAction}>
              <button className="button button--ghost" type="submit">
                로그아웃
              </button>
            </form>
          </div>
        ) : (
          <div className="inline-actions">
            <Link className="button button--secondary" href="/sign-in">
              로그인
            </Link>
            <Link className="button button--ghost" href="/sign-up">
              회원가입
            </Link>
          </div>
        )
      }
    >
      <HeroCard
        eyebrow="내부망 바로 사용 가능"
        title="하나의 플랫폼으로 여러 가족 홈 운영"
        subtitle="가족, 운영자, 게시판 경로가 하나의 네비게이션 모델을 공유해서 로컬 테스트가 실제 제품처럼 이어집니다."
        meta={
          <>
            <StatusPill tone="accent">파일 기반 런타임</StatusPill>
            <StatusPill tone="warm">직접 연결된 모듈 빌더</StatusPill>
            <StatusPill>내부망 미리보기</StatusPill>
          </>
        }
        actions={
          <div className="inline-actions">
            <Link className="button button--primary" href="/console">
              콘솔 열기
            </Link>
            {families[0] ? (
              <Link className="button button--ghost" href={`/f/${families[0].slug}`}>
                첫 가족 입장
              </Link>
            ) : null}
          </div>
        }
      >
        <SurfaceCard
          title="현재 테스트 범위"
          description="로컬 앱에서 제품 수준 테스트에 필요한 핵심 경로가 이미 열려 있습니다."
          tone="accent"
        >
          <MetricList
            items={[
              { label: "가족 홈", value: `${families.length}` },
              { label: "모듈", value: `${coreModules.length}` },
              { label: "핵심 경로", value: "메인 / 입장 / 앱 / 콘솔" },
              { label: "저장 방식", value: "서버 파일 저장소" },
            ]}
          />
        </SurfaceCard>
      </HeroCard>

      <section className="surface-stack">
        <SectionHeader kicker="흐름" title="현재 연결 구조" />
        <div className="grid-three">
          {flowStages.map((stage) => (
            <SurfaceCard
              key={stage.title}
              title={stage.title}
              description={stage.description}
              badge={<StatusPill>{stage.badge}</StatusPill>}
            />
          ))}
        </div>
      </section>

      <section className="surface-stack">
        <SectionHeader kicker="가족 홈" title="바로 들어가 볼 수 있는 가족들" />
        <div className="family-grid">
          {families.map((family) => (
            <SurfaceCard
              key={family.slug}
              title={family.name}
              description={family.tagline}
              eyebrow={family.householdMood}
              badge={<StatusPill tone="accent">{family.accessLabel}</StatusPill>}
              footer={
                <div className="inline-actions">
                  <Link className="button button--primary" href={`/f/${family.slug}`}>
                    입장
                  </Link>
                  <Link className="button button--ghost" href={`/app/${family.slug}`}>
                    앱 홈
                  </Link>
                </div>
              }
            >
              <p className="feature-copy">{family.heroSummary}</p>

              <div className="pill-row">
                {family.enabledModules.slice(0, 5).map((moduleKey) => (
                  <span className="module-pill" key={moduleKey}>
                    {moduleLabelByKey.get(moduleKey) ?? moduleKey}
                  </span>
                ))}
              </div>

              <dl className="fact-grid">
                <div className="fact-grid__item">
                  <dt>구성원</dt>
                  <dd>{family.memberCount}명</dd>
                </div>
                {family.highlights.slice(0, 3).map((highlight) => (
                  <div className="fact-grid__item" key={highlight.label}>
                    <dt>{highlight.label}</dt>
                    <dd>{highlight.value}</dd>
                  </div>
                ))}
              </dl>
            </SurfaceCard>
          ))}
        </div>
      </section>

      <section className="grid-two">
        <SurfaceCard
          title="테스트용 관리자 계정"
          description="계정 저장 구조가 완전히 닫히기 전에도 콘솔과 세션 검증을 이어갈 수 있게 둔 로컬 계정입니다."
        >
          <div className="surface-stack">
            {demoUsers.map((user) => (
              <div className="surface-note" key={user.email}>
                <p>
                  <strong>{user.displayName}</strong> - {user.email}
                </p>
                <p>비밀번호: {user.password}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard
          title="지금 바로 테스트할 것"
          description="빈 화면 없이 콘솔, 입장, 가족 앱, 게시판 상세/작성/수정까지 이어서 눌러볼 수 있습니다."
        >
          <ul className="stack-list">
            <li>`/console/sign-in` 에서 로그인합니다.</li>
            <li>콘솔에서 가족 홈을 만들거나 수정합니다.</li>
            <li>`/f/[familySlug]` 에서 입장 후 `/app/[familySlug]` 로 이동합니다.</li>
            <li>가족 앱에서 게시판 목록, 상세, 작성, 수정으로 이동해봅니다.</li>
          </ul>
        </SurfaceCard>
      </section>
    </PageShell>
  );
}
