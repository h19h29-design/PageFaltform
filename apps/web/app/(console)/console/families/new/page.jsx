import Link from "next/link";
import { redirect } from "next/navigation";
import { coreModules } from "@ysplan/modules-core";
import { createDefaultFamilyWorkspace } from "@ysplan/platform";
import { HeroCard, MetricList, PageShell, StatusPill, SurfaceCard } from "@ysplan/ui";
import { FamilyBuilderForm } from "../../../../../src/components/family-builder-form";
import { canCreateCustomFamilies, familyThemePresetOptions, } from "../../../../../src/lib/family-sites-store";
import { getActiveConsoleSession } from "../../../../../src/lib/server-sessions";
import { createFamilySiteAction } from "./actions";
export default async function NewFamilyPage(props) {
    const searchParams = await props.searchParams;
    const consoleSession = await getActiveConsoleSession();
    if (!consoleSession) {
        redirect("/console/sign-in?error=session-required");
    }
    if (!canCreateCustomFamilies(consoleSession)) {
        redirect("/console");
    }
    const initialDraft = createDefaultFamilyWorkspace("draft", ["announcements", "calendar", "todo"]);
    const errorMessage = searchParams.error ? decodeURIComponent(searchParams.error) : null;
    return (<PageShell eyebrow="New Mini Family" title="새 미니 가족 홈 만들기" subtitle="내부망에서 바로 열어 볼 수 있는 가족 홈을 하나 더 만들고, 모듈 조합까지 한 번에 정합니다." actions={<div className="inline-actions">
          <Link className="button button--ghost" href="/console">
            콘솔로 돌아가기
          </Link>
        </div>}>
      <HeroCard eyebrow="Internal Network Ready" title="직접 만든 여러 개의 미니 가족 홈을 쌓아갈 수 있습니다" subtitle="가족 이름, 주소 슬러그, 입장 비밀번호, 테마와 모듈 구성을 정하면 서버 파일에 저장되어 내부망의 다른 기기에서도 같은 홈을 볼 수 있습니다." meta={<>
            <StatusPill tone="accent">server file store</StatusPill>
            <StatusPill>LAN preview</StatusPill>
          </>}>
        <SurfaceCard title="생성 후 바로 되는 것" description="기본 주소와 관리자 빌더 동선이 즉시 연결됩니다." tone="accent">
          <MetricList items={[
            { label: "입구 주소", value: "/f/{slug}" },
            { label: "가족 홈", value: "/app/{slug}" },
            { label: "관리자 빌더", value: "/console/families/{slug}" },
            { label: "저장 위치", value: "apps/web/data" },
        ]}/>
        </SurfaceCard>
      </HeroCard>

      {errorMessage ? (<div className="surface-note">
          <p>{errorMessage}</p>
        </div>) : null}

      <form action={createFamilySiteAction} className="surface-stack">
        <div className="grid-two">
          <SurfaceCard title="기본 정보" description="가족 홈의 이름과 주소, 첫 인상을 정합니다." tone="warm">
            <div className="form-stack">
              <label className="form-label">
                가족 홈 이름
                <input className="text-input" name="name" placeholder="예: 우리집 라운지" required type="text"/>
              </label>
              <label className="form-label">
                주소 슬러그
                <input className="text-input" name="slug" placeholder="예: our-home" required type="text"/>
              </label>
              <label className="form-label">
                한 줄 설명
                <input className="text-input" name="tagline" placeholder="예: 일정과 기록이 차분히 모이는 가족 홈" required type="text"/>
              </label>
              <label className="form-label">
                환영 문구
                <input className="text-input" name="welcomeMessage" placeholder="예: 오늘 필요한 카드부터 편하게 확인해요." required type="text"/>
              </label>
              <label className="form-label">
                홈 소개 문구
                <textarea className="text-input text-input--tall" name="heroSummary" placeholder="입구와 홈에서 보여줄 짧은 소개를 적어 주세요." required/>
              </label>
              <label className="form-label">
                가족 무드
                <input className="text-input" name="householdMood" placeholder="예: 주말 준비가 많은 분주한 집" required type="text"/>
              </label>
            </div>
          </SurfaceCard>

          <SurfaceCard title="접근과 테마" description="입장 방식과 테마를 고르고 기본 운영 값을 넣습니다.">
            <div className="form-stack">
              <label className="form-label">
                가족 인원 수
                <input className="text-input" defaultValue="3" max="12" min="1" name="memberCount" required type="number"/>
              </label>
              <label className="form-label">
                타임존
                <input className="text-input" defaultValue="Asia/Seoul" name="timezone" required type="text"/>
              </label>
              <label className="form-label">
                입장 방식
                <select className="text-input" defaultValue="password" name="accessMode">
                  <option value="password">가족 비밀번호</option>
                  <option value="code">입장 코드</option>
                </select>
              </label>
              <label className="form-label">
                입장 비밀값
                <input className="text-input" name="accessSecret" placeholder="예: family2026" required type="text"/>
              </label>
              <label className="form-label">
                테마 프리셋
                <select className="text-input" defaultValue={familyThemePresetOptions[0].key} name="themePreset">
                  {familyThemePresetOptions.map((preset) => (<option key={preset.key} value={preset.key}>
                      {preset.label} - {preset.description}
                    </option>))}
                </select>
              </label>
            </div>
          </SurfaceCard>
        </div>

        <FamilyBuilderForm familyName="새 미니 가족 홈" initialDraft={initialDraft} moduleCatalog={coreModules}/>

        <div className="builder-save-row">
          <button className="button button--primary" type="submit">
            미니 가족 홈 생성
          </button>
          <Link className="button button--secondary" href="/console">
            나중에 만들기
          </Link>
        </div>
      </form>
    </PageShell>);
}
