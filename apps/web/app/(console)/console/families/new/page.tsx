import Link from "next/link";
import { redirect } from "next/navigation";

import { getPlatformAccountRoleLabel } from "@ysplan/auth";
import { coreModules } from "@ysplan/modules-core";
import { createDefaultFamilyWorkspace } from "@ysplan/platform";
import { HeroCard, MetricList, PageShell, StatusPill, SurfaceCard } from "@ysplan/ui";

import { FamilyBuilderForm } from "../../../../../src/components/family-builder-form";
import {
  canCreateCustomFamilies,
  countOwnedCustomFamilySites,
  familyThemePresetOptions,
  getCustomFamilyCreationLimit,
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

  const initialDraft = createDefaultFamilyWorkspace("draft", [
    "announcements",
    "calendar",
    "todo",
  ]);
  const errorMessage = searchParams.error
    ? decodeURIComponent(searchParams.error)
    : null;
  const ownedFamilyCount = await countOwnedCustomFamilySites(consoleSession.userId);
  const familyCreationLimit = getCustomFamilyCreationLimit(consoleSession.platformRole);
  const remainingFamilySlots =
    consoleSession.platformRole === "master"
      ? null
      : Math.max(0, familyCreationLimit - ownedFamilyCount);

  return (
    <PageShell
      eyebrow="새 가족홈 만들기"
      title="테스트용 가족홈 생성"
      subtitle="이름, 주소, 공개 범위, 테마, 기본 모듈을 정하고 바로 실제 테스트에 들어갈 수 있습니다."
      actions={
        <div className="inline-actions">
          <Link className="button button--ghost" href="/console">
            콘솔로 돌아가기
          </Link>
        </div>
      }
    >
      <HeroCard
        eyebrow="즉시 테스트 가능"
        title="새 가족홈을 만든 뒤 바로 가입 신청과 승인 흐름까지 확인할 수 있습니다"
        subtitle="가족 입구, 가족 앱, 모바일 미리보기, 관리자 설정 화면이 생성 직후 바로 연결됩니다."
        meta={
          <>
            <StatusPill tone="accent">{getPlatformAccountRoleLabel(consoleSession.platformRole)}</StatusPill>
            <StatusPill tone="warm">
              {consoleSession.platformRole === "master"
                ? "생성 제한 없음"
                : `남은 생성 ${remainingFamilySlots ?? 0}개`}
            </StatusPill>
          </>
        }
      >
        <SurfaceCard
          title="생성 후 테스트 주소"
          description="만드는 즉시 아래 주소들에서 동작을 확인할 수 있습니다."
          tone="accent"
        >
          <MetricList
            items={[
              { label: "가족 입구", value: "/f/{slug}" },
              { label: "가족 앱", value: "/app/{slug}" },
              { label: "모바일", value: "/preview/mobile/{slug}" },
              { label: "관리 화면", value: "/console/families/{slug}" },
            ]}
          />
        </SurfaceCard>

        <SurfaceCard
          title="내 생성 한도"
          description="정회원은 최대 5개, 마스터는 테스트 기간 동안 제한 없이 관리할 수 있습니다."
          tone="warm"
        >
          <MetricList
            items={[
              { label: "내 계정", value: getPlatformAccountRoleLabel(consoleSession.platformRole) },
              { label: "이미 만든 가족홈", value: `${ownedFamilyCount}개` },
              {
                label: "최대 생성 수",
                value:
                  consoleSession.platformRole === "master"
                    ? "제한 없음"
                    : `${familyCreationLimit}개`,
              },
              {
                label: "남은 생성 수",
                value:
                  consoleSession.platformRole === "master"
                    ? "제한 없음"
                    : `${remainingFamilySlots ?? 0}개`,
              },
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
          <SurfaceCard title="기본 정보" description="가족홈의 이름과 소개 문구를 먼저 정합니다." tone="warm">
            <div className="form-stack">
              <label className="form-label">
                가족홈 이름
                <input className="text-input" name="name" placeholder="우리집 보드" required type="text" />
              </label>
              <label className="form-label">
                주소 슬러그
                <input className="text-input" name="slug" placeholder="our-home" required type="text" />
              </label>
              <label className="form-label">
                한 줄 소개
                <input
                  className="text-input"
                  name="tagline"
                  placeholder="일정과 기록을 한눈에 보는 가족홈"
                  required
                  type="text"
                />
              </label>
              <label className="form-label">
                환영 문구
                <input
                  className="text-input"
                  name="welcomeMessage"
                  placeholder="오늘 필요한 카드부터 바로 확인해 보세요."
                  required
                  type="text"
                />
              </label>
              <label className="form-label">
                첫 화면 소개
                <textarea
                  className="text-input text-input--tall"
                  name="heroSummary"
                  placeholder="가족 입구와 홈에서 보여줄 소개 문구를 적어 주세요."
                  required
                />
              </label>
              <label className="form-label">
                가족 분위기
                <input
                  className="text-input"
                  name="householdMood"
                  placeholder="주중 준비가 많은 분주한 가족"
                  required
                  type="text"
                />
              </label>
            </div>
          </SurfaceCard>

          <SurfaceCard title="접속과 공개 범위" description="입장 방식과 공개 여부를 함께 정합니다.">
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
                입장 값
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
              <label className="form-label">
                공개 범위
                <select className="text-input" defaultValue="public" name="visibility">
                  <option value="public">공개 가족홈</option>
                  <option value="private">비공개 가족홈</option>
                </select>
              </label>
              <p className="helper-text">
                비공개 가족홈은 가입된 사람과 관리자만 볼 수 있고, 공개 목록에는 표시되지 않습니다.
              </p>
            </div>
          </SurfaceCard>
        </div>

        <FamilyBuilderForm
          familyName="새 가족홈"
          initialDraft={initialDraft}
          moduleCatalog={coreModules}
          themeOptions={familyThemePresetOptions}
        />

        <div className="builder-save-row">
          <button className="button button--primary" type="submit">
            가족홈 생성
          </button>
          <Link className="button button--secondary" href="/console">
            나중에 만들기
          </Link>
        </div>
      </form>
    </PageShell>
  );
}
