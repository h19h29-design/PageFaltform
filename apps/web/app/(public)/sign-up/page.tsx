import Link from "next/link";
import { redirect } from "next/navigation";

import { canAccessConsole } from "@ysplan/auth";
import { HeroCard, PageShell, StatusPill, SurfaceCard } from "@ysplan/ui";

import { submitLocalSignUpAction } from "../../../src/actions/platform-auth-actions";
import { listPublicFamilyPreviews } from "../../../src/lib/family-sites-store";
import { getPlatformAuthErrorMessage } from "../../../src/lib/messages";
import {
  getActivePlatformUserSession,
  isDatabaseSourceOfTruthEnabled,
} from "../../../src/lib/server-sessions";

type SignUpPageProps = {
  searchParams: Promise<{ error?: string; familySlug?: string }>;
};

export default async function SignUpPage(props: SignUpPageProps) {
  const searchParams = await props.searchParams;
  const activeSession = await getActivePlatformUserSession();

  if (activeSession) {
    redirect(canAccessConsole(activeSession) ? "/console" : "/");
  }

  const errorMessage = getPlatformAuthErrorMessage(searchParams.error);
  const hasDatabase = isDatabaseSourceOfTruthEnabled();
  const families = await listPublicFamilyPreviews();
  const requestedFamilySlug = String(searchParams.familySlug ?? "")
    .trim()
    .toLowerCase();
  const selectedFamily =
    families.find((family) => family.slug === requestedFamilySlug) ?? null;

  return (
    <PageShell
      eyebrow="회원가입"
      title="플랫폼 계정 만들기"
      subtitle="기본 가입은 준회원으로 시작합니다. 필요한 경우 마스터가 정회원으로 승격하고, 가족홈 가입은 각 가족홈 정회원이 승인합니다."
      actions={
        <div className="inline-actions">
          <Link className="button button--ghost" href="/">
            홈으로
          </Link>
          <Link className="button button--secondary" href="/sign-in">
            로그인
          </Link>
        </div>
      }
    >
      <HeroCard
        eyebrow="준회원 기본 가입"
        title={
          selectedFamily
            ? `${selectedFamily.name} 가입 신청까지 한 번에 이어지는 계정을 만듭니다`
            : "먼저 계정을 만들고 필요한 가족홈에 가입 신청을 보낼 수 있습니다"
        }
        subtitle={
          selectedFamily
            ? "가입이 끝나면 이 가족홈으로 자동 연결되고, 가입 신청이 함께 만들어집니다."
            : "정회원 승격은 마스터 승인이 필요하고, 가족홈 이용은 각 가족홈의 승인 뒤에 가능합니다."
        }
        meta={
          <>
            <StatusPill tone={hasDatabase ? "accent" : "warm"}>
              {hasDatabase ? "DB 연결" : "파일 저장"}
            </StatusPill>
            <StatusPill>기본 등급: 준회원</StatusPill>
            {selectedFamily ? (
              <StatusPill tone="accent">{selectedFamily.name}</StatusPill>
            ) : null}
          </>
        }
      />

      <div className="grid-two">
        <SurfaceCard
          title="계정 만들기"
          description="이름, 이메일, 비밀번호를 입력하면 기본 준회원 계정이 생성됩니다."
          badge={errorMessage ? <StatusPill tone="danger">가입 실패</StatusPill> : null}
          tone="accent"
        >
          <form action={submitLocalSignUpAction} className="form-stack">
            <label className="form-label">
              이름
              <input
                className="text-input"
                name="displayName"
                placeholder="사용할 이름"
                type="text"
              />
            </label>
            <label className="form-label">
              이메일
              <input
                className="text-input"
                name="email"
                placeholder="name@example.com"
                type="email"
              />
            </label>
            <label className="form-label">
              비밀번호
              <input
                className="text-input"
                name="password"
                placeholder="8자 이상 입력"
                type="password"
              />
            </label>
            <label className="form-label">
              지금 신청할 가족홈
              <select
                className="text-input"
                defaultValue={selectedFamily?.slug ?? ""}
                name="familySlug"
              >
                <option value="">아직 선택 안 함</option>
                {families.map((family) => (
                  <option key={family.slug} value={family.slug}>
                    {family.name} ({family.slug})
                  </option>
                ))}
              </select>
            </label>
            <p className="helper-text">
              {selectedFamily
                ? `${selectedFamily.name} 이 미리 선택되어 있습니다. 가입을 마치면 이 가족홈 가입 신청까지 바로 이어집니다.`
                : "가족홈을 선택하면 회원가입 직후 그 가족홈 가입 신청이 자동으로 만들어집니다."}
            </p>
            {errorMessage ? <p className="helper-text">{errorMessage}</p> : null}
            <div className="inline-actions">
              <button className="button button--primary" type="submit">
                가입하고 시작하기
              </button>
              <Link className="button button--secondary" href="/console/sign-in">
                콘솔 로그인
              </Link>
            </div>
          </form>
        </SurfaceCard>

        <SurfaceCard
          title="가입 뒤 흐름"
          description="이번 정책 기준으로 실제 사용까지 이어지는 순서입니다."
        >
          <ol className="journey-list">
            <li className="journey-list__item">
              <span className="journey-list__number">1</span>
              <div>
                <strong>준회원 계정 생성</strong>
                <p className="feature-copy">
                  회원가입 직후에는 준회원으로 시작합니다.
                </p>
              </div>
            </li>
            <li className="journey-list__item">
              <span className="journey-list__number">2</span>
              <div>
                <strong>가족홈 가입 신청</strong>
                <p className="feature-copy">
                  선택한 가족홈이 있으면 자동으로 신청까지 이어집니다.
                </p>
              </div>
            </li>
            <li className="journey-list__item">
              <span className="journey-list__number">3</span>
              <div>
                <strong>정회원 승인 또는 가족 승인</strong>
                <p className="feature-copy">
                  정회원 승격은 마스터가, 가족홈 이용 승인은 각 가족홈 정회원이 처리합니다.
                </p>
              </div>
            </li>
          </ol>
        </SurfaceCard>
      </div>
    </PageShell>
  );
}
