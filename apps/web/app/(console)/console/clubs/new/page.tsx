import Link from "next/link";
import { redirect } from "next/navigation";

import { getPlatformAccountRoleLabel } from "@ysplan/auth";
import { PageShell, StatusPill, SurfaceCard } from "@ysplan/ui";

import { createClubSiteAction } from "./actions";
import {
  canCreateCustomClubs,
  clubModuleCatalog,
  countOwnedCustomClubSites,
  getCustomClubCreationLimit,
} from "../../../../../src/lib/club-sites-store";
import { familyThemePresetOptions } from "../../../../../src/lib/shared-themes";
import { getActiveConsoleSession } from "../../../../../src/lib/server-sessions";

type NewClubPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewClubPage(props: NewClubPageProps) {
  const searchParams = await props.searchParams;
  const consoleSession = await getActiveConsoleSession();

  if (!consoleSession) {
    redirect("/console/sign-in?error=session-required");
  }

  if (!canCreateCustomClubs(consoleSession)) {
    redirect("/console");
  }

  const ownedClubCount = await countOwnedCustomClubSites(consoleSession.userId);
  const clubCreationLimit = getCustomClubCreationLimit(consoleSession.platformRole);
  const remainingClubSlots =
    consoleSession.platformRole === "master"
      ? null
      : Math.max(0, clubCreationLimit - ownedClubCount);

  return (
    <PageShell
      mode="console"
      eyebrow="새 클럽 만들기"
      title="B-page 클럽 생성"
      subtitle="클럽 하나를 만들고 공개 흐름을 바로 테스트합니다."
      actions={
        <div className="inline-actions">
          <Link className="button button--ghost" href="/console">
            뒤로
          </Link>
        </div>
      }
    >
      {searchParams.error ? (
        <div className="surface-note">
          <p>{decodeURIComponent(searchParams.error)}</p>
        </div>
      ) : null}

      <div className="grid-two">
        <SurfaceCard
          title="생성 권한"
          description="정회원은 클럽을 최대 3개까지, 마스터는 테스트 기간 동안 제한 없이 만들 수 있습니다."
          badge={<StatusPill tone="accent">{getPlatformAccountRoleLabel(consoleSession.platformRole)}</StatusPill>}
        >
          <dl className="fact-grid">
            <div className="fact-grid__item">
              <dt>이미 만든 클럽</dt>
              <dd>{ownedClubCount}개</dd>
            </div>
            <div className="fact-grid__item">
              <dt>남은 생성 수</dt>
              <dd>{remainingClubSlots === null ? "제한 없음" : `${remainingClubSlots}개`}</dd>
            </div>
          </dl>
        </SurfaceCard>

        <SurfaceCard
          title="생성 후 테스트 주소"
          description="클럽을 만들면 아래 주소들에서 바로 공개 흐름을 확인할 수 있습니다."
          badge={<StatusPill tone="warm">즉시 확인</StatusPill>}
        >
          <ul className="stack-list">
            <li>
              <code>/clubs/{`{slug}`}</code> 공개 상세
            </li>
            <li>
              <code>/clubs/{`{slug}`}/join</code> 가입 신청
            </li>
            <li>
              <code>/console/clubs/{`{slug}`}</code> 관리자 화면
            </li>
            <li>
              <code>/preview/mobile/club/{`{slug}`}</code> 모바일 미리보기
            </li>
          </ul>
        </SurfaceCard>
      </div>

      <form action={createClubSiteAction} className="surface-stack">
        <div className="grid-two">
          <SurfaceCard title="클럽 기본 정보" description="클럽 이름과 첫인상 문구를 정합니다.">
            <div className="form-stack">
              <label className="form-label">
                클럽 이름
                <input className="text-input" name="name" placeholder="한강 새벽 러닝" required type="text" />
              </label>
              <label className="form-label">
                주소 슬러그
                <input className="text-input" name="slug" placeholder="hangang-dawn-run" required type="text" />
              </label>
              <label className="form-label">
                한 줄 소개
                <input
                  className="text-input"
                  name="tagline"
                  placeholder="주간 러닝 일정과 활동 기록을 함께 보는 모임"
                  required
                  type="text"
                />
              </label>
              <label className="form-label">
                상세 소개
                <textarea
                  className="text-input text-input--tall"
                  name="description"
                  placeholder="클럽의 분위기와 운영 방식이 한 번에 보이게 적어주세요."
                  required
                />
              </label>
            </div>
          </SurfaceCard>

          <SurfaceCard title="운영 설정" description="공개 범위, 가입 정책, 테마, 활동 정보를 정합니다.">
            <div className="form-stack">
              <label className="form-label">
                종목 이름
                <input className="text-input" name="sportLabel" placeholder="러닝" required type="text" />
              </label>
              <label className="form-label">
                활동 지역
                <input className="text-input" name="location" placeholder="서울 사의동" required type="text" />
              </label>
              <label className="form-label">
                현재 집중 포인트
                <input
                  className="text-input"
                  name="currentFocus"
                  placeholder="4월 5km 기록 개선 챌린지"
                  required
                  type="text"
                />
              </label>
              <label className="form-label">
                다음 일정 라벨
                <input
                  className="text-input"
                  name="nextEventLabel"
                  placeholder="목요일 20:00 사의천 5km"
                  required
                  type="text"
                />
              </label>
              <label className="form-label">
                공개 범위
                <select className="text-input" defaultValue="public" name="visibility">
                  <option value="public">공개 클럽</option>
                  <option value="private">비공개 클럽</option>
                </select>
              </label>
              <label className="form-label">
                가입 정책
                <select className="text-input" defaultValue="approval-required" name="joinPolicy">
                  <option value="approval-required">로그인 후 신청, 운영자 승인</option>
                  <option value="invite-first">초대제 전용</option>
                </select>
              </label>
              <label className="form-label">
                테마
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

        <SurfaceCard
          title="먼저 보여줄 모듈"
          description="초기 클럽 공개 화면에 바로 보일 모듈만 먼저 켭니다. 나중에 관리자 화면에서 바꿀 수 있습니다."
        >
          <div className="content-checkbox-grid">
            {clubModuleCatalog.map((module, index) => (
              <label className="content-checkbox" key={module.key}>
                <input defaultChecked={index < 4} name={`module-${module.key}`} type="checkbox" value={module.key} />
                <span>
                  <strong>{module.label}</strong> {module.description}
                </span>
              </label>
            ))}
          </div>
        </SurfaceCard>

        <div className="builder-save-row">
          <button className="button button--primary" type="submit">
            클럽 만들기
          </button>
          <Link className="button button--secondary" href="/clubs">
            공개 클럽 먼저 보기
          </Link>
        </div>
      </form>
    </PageShell>
  );
}
