import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { HeroCard, PageShell, StatusPill, SurfaceCard } from "@ysplan/ui";

import { buildClubAppHomeHref } from "../../../../../src/lib/club-app-routes";
import {
  createClubJoinRequest,
  getLatestClubJoinRequestForUser,
} from "../../../../../src/lib/club-join-requests";
import {
  getClubViewerAccess,
  resolveClubPreviewFromSlug,
} from "../../../../../src/lib/club-sites-store";
import { getActivePlatformUserSession } from "../../../../../src/lib/server-sessions";

type ClubJoinPageProps = {
  params: Promise<{ clubSlug: string }>;
};

async function requestClubJoinAction(formData: FormData) {
  "use server";

  const clubSlug = String(formData.get("clubSlug") ?? "").trim().toLowerCase();
  const introMessage = String(formData.get("introMessage") ?? "").trim();
  const session = await getActivePlatformUserSession();

  if (!session) {
    redirect(`/sign-in?next=/clubs/${clubSlug}/join`);
  }

  const access = await getClubViewerAccess(clubSlug, session);

  if (!access) {
    notFound();
  }

  if (access.hasAccess) {
    redirect(buildClubAppHomeHref(access.club.slug));
  }

  if (access.club.joinPolicy === "invite-first") {
    redirect(`/clubs/${access.club.slug}?state=invite-only`);
  }

  const latestRequest = await getLatestClubJoinRequestForUser({
    clubSlug: access.club.slug,
    userId: session.userId,
  });

  if (latestRequest?.status === "pending") {
    redirect(`/clubs/${access.club.slug}?state=already-pending`);
  }

  try {
    await createClubJoinRequest({
      clubSlug: access.club.slug,
      clubName: access.club.name,
      requesterUserId: session.userId,
      requesterDisplayName: session.displayName,
      requesterEmail: session.email,
      requesterPlatformRole: session.platformRole,
      introMessage: introMessage || "활동 흐름과 분위기가 잘 맞을 것 같아 가입을 신청합니다.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "already-member") {
      redirect(buildClubAppHomeHref(access.club.slug));
    }

    throw error;
  }

  redirect(`/clubs/${access.club.slug}?state=request-sent`);
}

export default async function ClubJoinPage(props: ClubJoinPageProps) {
  const { clubSlug } = await props.params;
  const session = await getActivePlatformUserSession();
  const club = await resolveClubPreviewFromSlug(clubSlug, session);
  const access = await getClubViewerAccess(clubSlug, session);

  if (!club || !access) {
    notFound();
  }

  const appHref = buildClubAppHomeHref(club.slug);
  const latestRequest =
    session ? await getLatestClubJoinRequestForUser({ clubSlug: club.slug, userId: session.userId }) : null;
  const hasPendingRequest = latestRequest?.status === "pending";
  const canRequestJoin = club.joinPolicy !== "invite-first";
  const hasSession = Boolean(session);

  if (access.hasAccess) {
    return (
      <PageShell
        mode="public"
        eyebrow="클럽 입장"
        title={`${club.name} 멤버입니다`}
        subtitle="이미 승인된 계정입니다. 바로 클럽 안으로 들어가서 모듈을 사용할 수 있습니다."
        actions={
          <div className="inline-actions">
            <Link className="button button--primary" href={appHref}>
              클럽 들어가기
            </Link>
            <Link className="button button--ghost" href={`/clubs/${club.slug}`}>
              소개 보기
            </Link>
          </div>
        }
      >
        <SurfaceCard
          title="바로 사용할 수 있는 상태"
          description="공지, 이벤트, 갤러리, FAQ 같은 클럽 모듈을 지금 바로 읽고 사용할 수 있습니다."
        />
      </PageShell>
    );
  }

  if (!canRequestJoin) {
    return (
      <PageShell
        mode="public"
        eyebrow="가입 안내"
        title={`${club.name}는 초대 우선 클럽입니다`}
        subtitle="관리자 초대가 있어야 참가할 수 있습니다. 공개 소개 화면에서 운영 방식을 먼저 확인해 주세요."
        actions={
          <div className="inline-actions">
            <Link className="button button--ghost" href={`/clubs/${club.slug}`}>
              상세 보기
            </Link>
            <Link className="button button--secondary" href="/clubs">
              클럽 목록
            </Link>
          </div>
        }
      >
        <SurfaceCard
          title="초대 방식"
          description="이 클럽은 공개 신청 버튼 대신 관리자 초대 또는 별도 승인 절차를 사용합니다."
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      mode="public"
      eyebrow="가입 신청"
      title={`${club.name} 가입 신청`}
      subtitle="로그인한 계정으로 가입 신청을 보내면 운영자가 확인한 뒤 멤버로 승인합니다."
      actions={
        <div className="inline-actions">
          <Link className="button button--ghost" href={`/clubs/${club.slug}`}>
            상세 보기
          </Link>
          <Link className="button button--secondary" href="/clubs">
            클럽 목록
          </Link>
        </div>
      }
    >
      <HeroCard
        eyebrow="신청 방식"
        title="신청 상태가 분명하게 보이고, 승인되면 바로 클럽으로 들어갈 수 있게 연결합니다."
        subtitle="정회원이든 준회원이든 신청은 가능하지만, 실제 이용은 운영자 승인 이후부터 열립니다."
        meta={
          <>
            <StatusPill tone="accent">{club.accessLabel}</StatusPill>
            <StatusPill tone="warm">{club.memberCount}명</StatusPill>
            <StatusPill>{hasSession ? "로그인됨" : "로그인 필요"}</StatusPill>
          </>
        }
      />

      <div className="grid-two">
        <SurfaceCard title="가입 신청" description="간단한 소개만 남겨도 충분합니다.">
          {hasPendingRequest ? (
            <div className="surface-stack">
              <p className="feature-copy">이미 가입 신청을 보냈습니다. 운영자 승인 결과를 기다려 주세요.</p>
              <div className="inline-actions">
                <Link className="button button--secondary" href={`/clubs/${club.slug}`}>
                  상세 보기
                </Link>
              </div>
            </div>
          ) : hasSession ? (
            <form action={requestClubJoinAction} className="form-stack">
              <input name="clubSlug" type="hidden" value={club.slug} />
              <label className="form-label">
                간단한 소개
                <textarea
                  className="text-input text-input--tall"
                  defaultValue="활동 흐름과 분위기가 잘 맞을 것 같아 가입을 신청합니다."
                  name="introMessage"
                />
              </label>
              <div className="inline-actions">
                <button className="button button--primary" type="submit">
                  가입 신청 보내기
                </button>
                <Link className="button button--secondary" href={`/clubs/${club.slug}`}>
                  다시 보기
                </Link>
              </div>
            </form>
          ) : (
            <div className="surface-stack">
              <p className="feature-copy">가입 신청을 하려면 먼저 플랫폼 계정으로 로그인해 주세요.</p>
              <div className="inline-actions">
                <Link className="button button--primary" href={`/sign-in?next=/clubs/${club.slug}/join`}>
                  로그인
                </Link>
                <Link className="button button--secondary" href={`/sign-up?next=/clubs/${club.slug}/join`}>
                  회원가입
                </Link>
              </div>
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard title="진행 순서" description="신청 전후에 지금 어떤 상태인지 쉽게 확인할 수 있습니다.">
          <ol className="journey-list">
            <li className="journey-list__item">
              <span className="journey-list__number">1</span>
              <div>
                <strong>로그인</strong>
                <p className="feature-copy">플랫폼 계정으로 먼저 들어옵니다.</p>
              </div>
            </li>
            <li className="journey-list__item">
              <span className="journey-list__number">2</span>
              <div>
                <strong>가입 신청</strong>
                <p className="feature-copy">간단한 소개를 남기고 신청을 보냅니다.</p>
              </div>
            </li>
            <li className="journey-list__item">
              <span className="journey-list__number">3</span>
              <div>
                <strong>승인 후 입장</strong>
                <p className="feature-copy">승인되면 소개 화면과 이 화면에서 바로 클럽으로 들어갈 수 있습니다.</p>
              </div>
            </li>
          </ol>
        </SurfaceCard>
      </div>
    </PageShell>
  );
}
