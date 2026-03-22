import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";
import { signOutConsoleAction } from "../../../src/actions/session-actions";
import { canCreateCustomFamilies } from "../../../src/lib/family-sites-store";
import { getFamilyWorkspaceSummary, listConsoleFamilyWorkspaces, } from "../../../src/lib/family-workspace";
import { getActiveConsoleSession } from "../../../src/lib/server-sessions";
export default async function ConsolePage() {
    const consoleSession = await getActiveConsoleSession();
    if (!consoleSession) {
        redirect("/console/sign-in?error=session-required");
    }
    const families = await listConsoleFamilyWorkspaces(consoleSession);
    const allowCreation = canCreateCustomFamilies(consoleSession);
    return (<PageShell eyebrow="Console" title={`${consoleSession.displayName}님의 플랫폼 콘솔`} subtitle="내부망에서 직접 여러 개의 미니 가족 홈을 만들고, 가족별 모듈과 입장 흐름을 조립하는 관리자 영역입니다." actions={<div className="inline-actions">
          {allowCreation ? (<Link className="button button--primary" href="/console/families/new">
              새 미니 홈 만들기
            </Link>) : null}
          <form action={signOutConsoleAction}>
            <button className="button button--ghost" type="submit">
              관리자 로그아웃
            </button>
          </form>
        </div>}>
      <SectionHeader kicker="Families" title="접근 가능한 가족 홈" action={<StatusPill>{families.length} homes</StatusPill>}/>

      <div className="family-grid">
        {families.map(({ family, role, canManage, workspaceView }) => (<SurfaceCard key={`${family.slug}-${role}`} title={family.name} description={getFamilyWorkspaceSummary(workspaceView)} badge={<StatusPill tone={canManage ? "accent" : "warm"}>{role}</StatusPill>} footer={<div className="inline-actions">
                {canManage ? (<Link className="button button--primary" href={`/console/families/${family.slug}`}>
                    구성 빌더 열기
                  </Link>) : null}
                <Link className="button button--secondary" href={`/app/${family.slug}`}>
                  가족 홈 보기
                </Link>
                <Link className="button button--ghost" href={`/f/${family.slug}`}>
                  입구 보기
                </Link>
              </div>}>
            <ul className="stack-list">
              <li>
                활성 모듈 {workspaceView.workspace.enabledModules.length}개 · 첫 모듈{" "}
                {workspaceView.moduleDescriptors[0]?.label ?? "-"}
              </li>
              <li>
                홈 프리셋 {workspaceView.homePresetLabel} · 입장 흐름 {workspaceView.entryPresetLabel}
              </li>
              <li>
                {family.source === "custom"
                ? `내가 만든 미니 가족 홈 · 주소 /f/${family.slug}`
                : "기본 데모 가족 홈"}
              </li>
            </ul>
          </SurfaceCard>))}
      </div>
    </PageShell>);
}
