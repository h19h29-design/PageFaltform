import Link from "next/link";
import { redirect } from "next/navigation";

import { coreModules } from "@ysplan/modules-core";
import { createDefaultFamilyWorkspace } from "@ysplan/platform";
import { HeroCard, MetricList, PageShell, StatusPill, SurfaceCard } from "@ysplan/ui";

import { FamilyBuilderForm } from "../../../../../src/components/family-builder-form";
import {
  canCreateCustomFamilies,
  familyThemePresetOptions,
} from "../../../../../src/lib/family-sites-store";
import { getActiveConsoleSession } from "../../../../../src/lib/server-sessions";
import { createFamilySiteAction } from "./actions";

type NewFamilyPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewFamilyPage(props: NewFamilyPageProps) {
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

  return (
    <PageShell
      eyebrow="New Mini Family"
      title="새 미니 가족 홈 만들기"
      subtitle="이름, 주소, 입장 비밀번호, 기본 모듈, 테마까지 한 번에 정한 뒤 바로 테스트할 수 있습니다."
      actions={
        <div className="inline-actions">
          <Link className="button button--ghost" href="/console">
            콘솔로 돌아가기
          </Link>
        </div>
      }
    >
      <HeroCard
        eyebrow="Internal Network Ready"
        title="여러 개의 미니 가족 홈을 직접 만들어볼 수 있습니다"
        subtitle="만들자마자 가족 입구, 가족 앱, 빌더, 모바일 미리보기까지 바로 열 수 있도록 연결됩니다."
        meta={
          <>
            <StatusPill tone="accent">server file store</StatusPill>
            <StatusPill>LAN preview</StatusPill>
          </>
        }
      >
        <SurfaceCard title="생성 직후 열리는 주소" description="운영 화면과 실제 가족 화면이 함께 준비됩니다." tone="accent">
          <MetricList
            items={[
              { label: "가족 입구", value: "/f/{slug}" },
              { label: "가족 앱", value: "/app/{slug}" },
              { label: "모바일 미리보기", value: "/preview/mobile/{slug}" },
              { label: "운영 빌더", value: "/console/families/{slug}" },
            ]}
          />
        </SurfaceCard>
      </HeroCard>

      {errorMessage ? (
        <div className="surface-note">
          <p>{errorMessage}</p>
        </div>
      ) : null}

      <form action={createFamilySiteAction} className="surface-stack">
        <div className="grid-two">
          <SurfaceCard title="기본 정보" description="가족 이름과 첫인상 문구를 먼저 정합니다." tone="warm">
            <div className="form-stack">
              <label className="form-label">
                가족 홈 이름
                <input className="text-input" name="name" placeholder="윤네 거실" required type="text" />
              </label>
              <label className="form-label">
                주소 슬러그
                <input className="text-input" name="slug" placeholder="yoon-living" required type="text" />
              </label>
              <label className="form-label">
                한 줄 소개
                <input
                  className="text-input"
                  name="tagline"
                  placeholder="일정과 기록이 차분하게 모이는 가족 홈"
                  required
                  type="text"
                />
              </label>
              <label className="form-label">
                환영 문구
                <input
                  className="text-input"
                  name="welcomeMessage"
                  placeholder="오늘 챙길 일부터 편하게 확인해보세요."
                  required
                  type="text"
                />
              </label>
              <label className="form-label">
                첫 화면 소개
                <textarea
                  className="text-input text-input--tall"
                  name="heroSummary"
                  placeholder="가족 입구와 홈에서 보일 소개 문구를 적어주세요."
                  required
                />
              </label>
              <label className="form-label">
                가족 분위기
                <input
                  className="text-input"
                  name="householdMood"
                  placeholder="주말 준비가 많고 메모가 자주 오가는 집"
                  required
                  type="text"
                />
              </label>
            </div>
          </SurfaceCard>

          <SurfaceCard title="접속과 테마" description="입장 방식과 테마, 기본 운영값을 정합니다.">
            <div className="form-stack">
              <label className="form-label">
                가족 인원 수
                <input className="text-input" defaultValue="3" max="12" min="1" name="memberCount" required type="number" />
              </label>
              <label className="form-label">
                시간대
                <input className="text-input" defaultValue="Asia/Seoul" name="timezone" required type="text" />
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
                <input className="text-input" name="accessSecret" placeholder="family2026" required type="text" />
              </label>
              <label className="form-label">
                테마 프리셋
                <select className="text-input" defaultValue={familyThemePresetOptions[0]!.key} name="themePreset">
                  {familyThemePresetOptions.map((preset) => (
                    <option key={preset.key} value={preset.key}>
                      {preset.label} - {preset.description}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </SurfaceCard>
        </div>

        <FamilyBuilderForm
          familyName="새 미니 가족"
          initialDraft={initialDraft}
          moduleCatalog={coreModules}
          themeOptions={familyThemePresetOptions}
        />

        <div className="builder-save-row">
          <button className="button button--primary" type="submit">
            미니 가족 홈 생성
          </button>
          <Link className="button button--secondary" href="/console">
            나중에 만들기
          </Link>
        </div>
      </form>
    </PageShell>
  );
}
