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
import { getClubModuleCopy } from "../../../../../src/lib/club-copy";
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
      eyebrow="클럽 만들기"
      title="B-page 클럽 생성"
      subtitle="클럽 이름, 공개 범위, 입장 방식, 사용할 게시판을 한 번에 정합니다."
      actions={
        <div className="inline-actions">
          <Link className="button button--ghost" href="/console">
            돌아가기
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
          badge={<StatusPill tone="accent">{getPlatformAccountRoleLabel(consoleSession.platformRole)}</StatusPill>}
        >
          <dl className="fact-grid">
            <div className="fact-grid__item">
              <dt>내가 만든 클럽</dt>
              <dd>{ownedClubCount}개</dd>
            </div>
            <div className="fact-grid__item">
              <dt>남은 생성 수</dt>
              <dd>{remainingClubSlots === null ? "제한 없음" : `${remainingClubSlots}개`}</dd>
            </div>
          </dl>
        </SurfaceCard>

        <SurfaceCard title="테스트 주소">
          <ul className="stack-list">
            <li>
              <code>/clubs/{`{slug}`}</code> 공개 페이지
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
          <SurfaceCard title="클럽 기본 정보">
            <div className="form-stack">
              <label className="form-label">
                클럽 이름
                <input className="text-input" name="name" placeholder="한강 나이트런" required type="text" />
              </label>
              <label className="form-label">
                주소 슬러그
                <input className="text-input" name="slug" placeholder="hangang-night-run" required type="text" />
              </label>
              <label className="form-label">
                짧은 소개
                <input
                  className="text-input"
                  name="tagline"
                  placeholder="매주 모여서 달리는 동네 러닝 클럽"
                  required
                  type="text"
                />
              </label>
              <label className="form-label">
                상세 소개
                <textarea
                  className="text-input text-input--tall"
                  name="description"
                  placeholder="클럽 분위기와 활동 방식을 간단히 적어주세요."
                  required
                />
              </label>
            </div>
          </SurfaceCard>

          <SurfaceCard title="운영 설정">
            <div className="form-stack">
              <label className="form-label">
                종목 이름
                <input className="text-input" name="sportLabel" placeholder="러닝" required type="text" />
              </label>
              <label className="form-label">
                활동 지역
                <input className="text-input" name="location" placeholder="서울 한강" required type="text" />
              </label>
              <label className="form-label">
                현재 집중 주제
                <input
                  className="text-input"
                  name="currentFocus"
                  placeholder="4주간 5km 꾸준히 뛰기"
                  required
                  type="text"
                />
              </label>
              <label className="form-label">
                다음 일정 문구
                <input
                  className="text-input"
                  name="nextEventLabel"
                  placeholder="목요일 20:00 한강 집결"
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
                가입 방식
                <select className="text-input" defaultValue="approval-required" name="joinPolicy">
                  <option value="approval-required">가입 신청 후 승인</option>
                  <option value="invite-first">초대 우선</option>
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

        <SurfaceCard title="처음 노출할 게시판">
          <div className="content-checkbox-grid">
            {clubModuleCatalog.map((module, index) => {
              const moduleCopy = getClubModuleCopy(module.key);

              return (
                <label className="content-checkbox" key={module.key}>
                  <input defaultChecked={index < 4} name={`module-${module.key}`} type="checkbox" value={module.key} />
                  <span>
                    <strong>{moduleCopy.label}</strong> {moduleCopy.description}
                  </span>
                </label>
              );
            })}
          </div>
        </SurfaceCard>

        <div className="builder-save-row">
          <button className="button button--primary" type="submit">
            클럽 만들기
          </button>
          <Link className="button button--secondary" href="/clubs">
            공개 클럽 목록
          </Link>
        </div>
      </form>
    </PageShell>
  );
}
