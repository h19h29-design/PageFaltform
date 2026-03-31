import Link from "next/link";
import { notFound } from "next/navigation";

import { MetricList, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import { ClubAppShell } from "src/components/club-app-shell";
import {
  buildClubAppHomeHref,
  buildClubAppModuleHref,
  getClubModuleRouteSpec,
} from "src/lib/club-app-routes";
import { requireClubAppAccess } from "src/lib/club-app-access";

type ClubAppModulePageProps = {
  params: Promise<{ clubSlug: string; moduleKey: string }>;
};

export default async function ClubAppModulePage(props: ClubAppModulePageProps) {
  const { clubSlug, moduleKey } = await props.params;
  const access = await requireClubAppAccess(clubSlug);
  const routeSpec = getClubModuleRouteSpec(moduleKey);
  const moduleEntry = access.moduleEntries.find((entry) => entry.moduleKey === moduleKey);

  if (!routeSpec || !moduleEntry) {
    notFound();
  }

  return (
    <ClubAppShell access={access}>
      <section className="surface-stack">
        <SectionHeader
          kicker="추가 공간"
          title={routeSpec.label}
          action={
            <div className="inline-actions">
              <Link className="button button--secondary" href={buildClubAppHomeHref(clubSlug)}>
                클럽 홈
              </Link>
              <Link className="button button--ghost" href={buildClubAppModuleHref(clubSlug, moduleKey)}>
                현재 위치
              </Link>
            </div>
          }
        />

        <div className="grid-two">
          <SurfaceCard title={routeSpec.label} badge={<StatusPill tone="accent">추가 보드</StatusPill>}>
            <MetricList
              items={[
                { label: "공간 성격", value: routeSpec.summary },
                { label: "클럽", value: access.club.name },
                { label: "권한", value: access.viewerRole },
                { label: "위치", value: access.club.location },
              ]}
            />
          </SurfaceCard>

          <SurfaceCard title="현재 상태" badge={<StatusPill tone="warm">확장 준비</StatusPill>}>
            <p className="feature-copy">이 공간은 보조 자료나 운영 정보를 정리하는 용도로 남겨두었습니다.</p>
            <p className="feature-copy">공지, 일정, 갤러리는 이미 실제 작성과 수정 흐름이 연결되어 있습니다.</p>
          </SurfaceCard>
        </div>
      </section>
    </ClubAppShell>
  );
}
