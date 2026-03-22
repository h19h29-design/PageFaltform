import Link from "next/link";
import { listDemoConsoleUsers } from "@ysplan/auth";
import { coreModules } from "@ysplan/modules-core";
import { getModuleDescriptors } from "@ysplan/tenant";
import { HeroCard, MetricList, PageShell, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";
import { listPublicFamilyPreviews } from "../../src/lib/family-sites-store";
import { getActivePlatformUserSession } from "../../src/lib/server-sessions";
const flowStages = [
    {
        title: "가족 입구",
        description: "가볍게 분위기를 보여 준 뒤 비밀번호나 코드로 들어가는 진입 화면입니다.",
        badge: "Warm splash",
    },
    {
        title: "가족 홈",
        description: "공지, 일정, 기록, 체크리스트가 모듈 순서에 맞춰 하나의 홈으로 이어집니다.",
        badge: "Dashboard first",
    },
    {
        title: "관리자 콘솔",
        description: "미니 가족 홈 생성과 모듈 편집은 관리자 경로에서만 수행합니다.",
        badge: "Separated auth",
    },
];
export default async function LandingPage() {
    const families = await listPublicFamilyPreviews();
    const demoUsers = listDemoConsoleUsers();
    const consoleSession = await getActivePlatformUserSession();
    return (<PageShell eyebrow="YSplan · Family Platform" title="내부망에서 여러 개의 미니 가족 홈을 직접 만들고 바로 열어볼 수 있습니다" subtitle="가족마다 다른 분위기와 모듈 조합을 조립해 두고, 입구와 홈 흐름까지 하나의 플랫폼으로 이어지는 로컬 베이스입니다." actions={consoleSession ? (<Link className="button button--secondary" href="/console">
            콘솔로 이동
          </Link>) : (<Link className="button button--secondary" href="/console/sign-in">
            관리자 로그인
          </Link>)}>
      <HeroCard eyebrow="Internal Network Ready" title="작은 가족 홈을 여러 개 만들어도 같은 플랫폼 흐름으로 관리됩니다" subtitle="공개 랜딩, 가족 입구, 가족 홈, 관리자 콘솔이 같은 규칙으로 이어져서 내부망에서 여러 가족 홈을 빠르게 실험하기 좋습니다." meta={<>
            <StatusPill tone="accent">server file store</StatusPill>
            <StatusPill tone="warm">module builder</StatusPill>
            <StatusPill>LAN preview</StatusPill>
          </>} actions={<div className="inline-actions">
            <Link className="button button--primary" href="/console">
              콘솔 열기
            </Link>
            {families[0] ? (<Link className="button button--ghost" href={`/f/${families[0].slug}`}>
                첫 가족 입구 보기
              </Link>) : null}
          </div>}>
        <SurfaceCard title="지금 바로 확인 가능한 범위" description="내부망 테스트를 위해 필요한 핵심 흐름을 먼저 고정해 두었습니다." tone="accent">
          <MetricList items={[
            { label: "등록된 가족 홈", value: `${families.length}개` },
            { label: "준비된 모듈", value: `${coreModules.length}종` },
            { label: "접속 흐름", value: "랜딩 · 입구 · 가족 홈" },
            { label: "저장 방식", value: "서버 파일 저장" },
        ]}/>
        </SurfaceCard>
      </HeroCard>

      <section className="surface-stack">
        <SectionHeader kicker="Flow" title="이 플랫폼에서 이어지는 화면"/>
        <div className="grid-three">
          {flowStages.map((stage) => (<SurfaceCard key={stage.title} title={stage.title} description={stage.description} badge={<StatusPill>{stage.badge}</StatusPill>}/>))}
        </div>
      </section>

      <section className="surface-stack">
        <SectionHeader kicker="Families" title="지금 열 수 있는 가족 홈"/>
        <div className="family-grid">
          {families.map((family) => {
            const moduleDescriptors = getModuleDescriptors(family.enabledModules).slice(0, 5);
            return (<SurfaceCard key={family.slug} title={family.name} description={family.tagline} eyebrow={family.householdMood} badge={<StatusPill tone="accent">{family.accessLabel}</StatusPill>} footer={<div className="inline-actions">
                    <Link className="button button--primary" href={`/f/${family.slug}`}>
                      입구 보기
                    </Link>
                    <Link className="button button--ghost" href={`/app/${family.slug}`}>
                      홈 보기
                    </Link>
                  </div>}>
                <p className="feature-copy">{family.heroSummary}</p>

                <div className="pill-row">
                  {moduleDescriptors.map((module) => (<span className="module-pill" key={module.key}>
                      {module.label}
                    </span>))}
                </div>

                <dl className="fact-grid">
                  <div className="fact-grid__item">
                    <dt>가족 구성</dt>
                    <dd>{family.memberCount}명</dd>
                  </div>
                  {family.highlights.map((highlight) => (<div className="fact-grid__item" key={highlight.label}>
                      <dt>{highlight.label}</dt>
                      <dd>{highlight.value}</dd>
                    </div>))}
                </dl>
              </SurfaceCard>);
        })}
        </div>
      </section>

      <section className="grid-two">
        <SurfaceCard title="관리자 데모 계정" description="지금은 DB 없이 로컬 테스트를 위해 고정된 관리자 계정으로 세션 흐름을 확인합니다.">
          <div className="surface-stack">
            {demoUsers.map((user) => (<div className="surface-note" key={user.email}>
                <p>
                  <strong>{user.displayName}</strong> · {user.email}
                </p>
                <p>비밀번호: {user.password}</p>
                <p>
                  권한:{" "}
                  {user.memberships
                .map((membership) => `${membership.familyName}(${membership.role})`)
                .join(", ")}
                </p>
              </div>))}
          </div>
        </SurfaceCard>

        <SurfaceCard title="지금 바로 할 수 있는 것" description="콘솔에서 새 미니 가족 홈을 만들고, 모듈과 순서를 바꿔 내부망에서 바로 열어볼 수 있습니다.">
          <ul className="stack-list">
            <li>새 가족 홈을 만들면 `/f/[familySlug]` 와 `/app/[familySlug]` 주소가 즉시 생깁니다.</li>
            <li>모듈 on/off, 순서, 홈 프리셋, 입장 흐름은 관리자 빌더에서 바로 조절됩니다.</li>
            <li>저장은 서버 파일에 남아 같은 네트워크의 다른 기기에서도 동일하게 보입니다.</li>
            <li>가족별 입구 비밀번호를 따로 정해 여러 개의 미니 홈을 병렬로 실험할 수 있습니다.</li>
          </ul>
        </SurfaceCard>
      </section>
    </PageShell>);
}
