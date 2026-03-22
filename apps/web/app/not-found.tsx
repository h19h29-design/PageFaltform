import Link from "next/link";

import { PageShell, SurfaceCard } from "@ysplan/ui";

export default function NotFound() {
  return (
    <PageShell
      eyebrow="Not Found"
      title="찾으시는 가족 공간이 없어요"
      subtitle="주소가 바뀌었거나 아직 준비되지 않은 가족 공간일 수 있어요."
    >
      <SurfaceCard
        title="다시 시작하기"
        description="루트 화면에서 데모 가족 공간을 다시 선택하거나 관리자 콘솔로 이동할 수 있어요."
        footer={
          <div className="inline-actions">
            <Link className="button button--primary" href="/">
              홈으로 가기
            </Link>
            <Link className="button button--secondary" href="/console/sign-in">
              관리자 로그인
            </Link>
          </div>
        }
      />
    </PageShell>
  );
}
