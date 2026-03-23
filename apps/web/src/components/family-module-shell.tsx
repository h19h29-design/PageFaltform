import Link from "next/link";

import type { ModuleKey } from "@ysplan/modules-core";
import { HeroCard, MetricList, SectionHeader, StatusPill, SurfaceCard } from "@ysplan/ui";

import type { EffectiveFamilyWorkspace } from "../lib/family-workspace";
import {
  buildFamilyBuilderHref,
  buildFamilyHomeHref,
  buildFamilyModuleDetailHref,
  buildFamilyModuleEditHref,
  buildFamilyModuleHref,
  buildFamilyModuleNewHref,
  formatModuleItemName,
  getFamilyModuleExampleSlug,
  getFamilyModuleRouteSpec,
  getModulePageTitle,
  type FamilyModulePageMode,
} from "../lib/family-app-routes";

type FamilyModuleShellProps = {
  workspaceView: EffectiveFamilyWorkspace;
  moduleKey: ModuleKey;
  mode: FamilyModulePageMode;
  itemSlug?: string;
};

function buildModeSummary(mode: FamilyModulePageMode, label: string, itemLabel: string): string {
  switch (mode) {
    case "list":
      return `${label}은 목록 경로를 기준으로 열리며, 목록·상세·작성·수정 흐름이 같은 구조로 이어집니다.`;
    case "detail":
      return `${itemLabel} 상세 화면은 실제 CRUD 내용이 붙어도 같은 제품 셸 안에서 그대로 이어집니다.`;
    case "new":
      return `작성 경로는 이미 최종 주소와 편집 프레임을 갖추고 있어서 실제 액션만 바로 연결하면 됩니다.`;
    case "edit":
      return `수정 경로는 상세·작성과 같은 셸을 유지해서 폼만 바꿔도 네비게이션이 흔들리지 않습니다.`;
    default:
      return label;
  }
}

export function FamilyModuleShell({
  workspaceView,
  moduleKey,
  mode,
  itemSlug,
}: FamilyModuleShellProps) {
  const spec = getFamilyModuleRouteSpec(moduleKey);

  if (!spec) {
    return null;
  }

  const resolvedItemSlug = itemSlug ?? getFamilyModuleExampleSlug(moduleKey);
  const resolvedItemName = formatModuleItemName(resolvedItemSlug);
  const moduleHref = buildFamilyModuleHref(workspaceView.family.slug, moduleKey);
  const newHref = buildFamilyModuleNewHref(workspaceView.family.slug, moduleKey);
  const detailHref = buildFamilyModuleDetailHref(workspaceView.family.slug, moduleKey, resolvedItemSlug);
  const editHref = buildFamilyModuleEditHref(workspaceView.family.slug, moduleKey, resolvedItemSlug);
  const isEnabled = workspaceView.workspace.enabledModules.includes(moduleKey);
  const pageTitle = getModulePageTitle(spec, mode, resolvedItemSlug);

  return (
    <div className="surface-stack">
      <HeroCard
        eyebrow={`${spec.label} 경로`}
        title={pageTitle}
        subtitle={buildModeSummary(mode, spec.label, spec.itemLabel)}
        meta={
          <>
            <StatusPill tone={isEnabled ? "accent" : "warm"}>{isEnabled ? "사용 중 모듈" : "다음 후보"}</StatusPill>
            <StatusPill>{workspaceView.family.slug}</StatusPill>
            <StatusPill tone="warm">{workspaceView.homePresetLabel}</StatusPill>
          </>
        }
        actions={
          <div className="inline-actions">
            <Link className="button button--secondary" href={moduleHref}>
              목록
            </Link>
            <Link className="button button--secondary" href={newHref}>
              작성
            </Link>
            <Link className="button button--ghost" href={buildFamilyHomeHref(workspaceView.family.slug)}>
              홈
            </Link>
          </div>
        }
      >
        <SurfaceCard
          title="경로 구성"
          description="모듈 내부 구현이 바뀌어도 이 주소 구조는 그대로 유지됩니다."
          tone="accent"
        >
          <MetricList
            items={[
              { label: "목록", value: moduleHref },
              { label: "상세", value: detailHref },
              { label: "작성", value: newHref },
              { label: "수정", value: editHref },
            ]}
          />
        </SurfaceCard>
      </HeroCard>

      {!isEnabled ? (
        <SurfaceCard
          title="모듈 상태"
          description="이 가족은 지금 이 모듈을 꺼둔 상태지만, 경로는 살아 있어서 테스트 링크는 유지됩니다."
          badge={<StatusPill tone="warm">빌더에서 꺼짐</StatusPill>}
          tone="warm"
          footer={
            <div className="inline-actions">
              <Link className="button button--secondary" href={buildFamilyBuilderHref(workspaceView.family.slug)}>
                빌더 열기
              </Link>
              <Link className="button button--ghost" href={buildFamilyHomeHref(workspaceView.family.slug)}>
                홈으로
              </Link>
            </div>
          }
        >
          <p className="feature-copy">
            가족 앱 네비게이션은 경로를 계속 보여주므로, 나중에 실제 CRUD를 붙여도 링크를 다시 바꿀 필요가 없습니다.
          </p>
        </SurfaceCard>
      ) : null}

      <section className="surface-stack">
        <SectionHeader
          kicker="작업 화면"
          title={`${spec.label} ${mode === "list" ? "목록 화면" : "페이지 화면"}`}
          action={<StatusPill>{spec.itemLabel}</StatusPill>}
        />

        <div className="grid-two">
          <SurfaceCard
            title="이 화면에서 하는 일"
            description="이 경로는 이미 제품 구조를 갖추고 있어서, 실제 모듈 페이지가 순차적으로 대체될 수 있습니다."
          >
            <ul className="stack-list">
              <li>{spec.summary}</li>
              <li>가족 슬러그와 모듈 경로는 로컬 테스트 기준으로 이미 고정돼 있습니다.</li>
              <li>아래 카드 영역만 바꿔도 페이지 계약은 그대로 유지됩니다.</li>
            </ul>
          </SurfaceCard>

          <SurfaceCard
            title="빠른 이동"
            description="CRUD 연결 중에도 이 버튼으로 주요 경로를 바로 확인할 수 있습니다."
          >
            <div className="inline-actions">
              <Link className="button button--secondary" href={moduleHref}>
                목록 열기
              </Link>
              <Link className="button button--secondary" href={detailHref}>
                상세 열기
              </Link>
              <Link className="button button--secondary" href={newHref}>
                작성 열기
              </Link>
              <Link className="button button--secondary" href={editHref}>
                수정 열기
              </Link>
            </div>
          </SurfaceCard>
        </div>

        <SurfaceCard
          title={mode === "list" ? "목록 화면" : mode === "detail" ? "상세 화면" : "편집 화면"}
          description={
            mode === "list"
              ? "예시 항목 경로와 작성 진입점을 함께 보여주는 기본 목록 화면입니다."
              : mode === "detail"
                ? "메타 정보와 경로 맥락, 수정 링크를 함께 보여주는 기본 상세 화면입니다."
                : "읽기 전용 샘플 필드와 모듈별 편집 연결 지점을 함께 둔 기본 편집 화면입니다."
          }
          badge={<StatusPill tone="accent">{mode === "list" ? "목록" : mode === "detail" ? "상세" : mode === "new" ? "작성" : "수정"}</StatusPill>}
        >
          {mode === "list" ? (
            <div className="route-card-grid">
              <SurfaceCard
                title={resolvedItemName}
                description={`로컬 이동 테스트용 예시 ${spec.itemLabel} 경로입니다.`}
                badge={<StatusPill>{spec.itemLabel}</StatusPill>}
                footer={
                  <div className="inline-actions">
                    <Link className="button button--secondary button--small" href={detailHref}>
                      상세
                    </Link>
                    <Link className="button button--ghost button--small" href={editHref}>
                      수정
                    </Link>
                  </div>
                }
              >
                <p className="feature-copy">{spec.description}</p>
              </SurfaceCard>

              <SurfaceCard
                title={spec.createLabel}
                description="모듈 전용 작성 폼을 바로 붙일 수 있는 경로입니다."
                badge={<StatusPill tone="warm">작성</StatusPill>}
                footer={
                  <Link className="button button--secondary button--small" href={newHref}>
                    작성 화면 열기
                  </Link>
                }
              >
                <p className="feature-copy">
                  이 페이지는 이미 최종 경로에 있으므로, 작성 흐름만 연결하면 바로 쓸 수 있습니다.
                </p>
              </SurfaceCard>
            </div>
          ) : mode === "detail" ? (
            <div className="route-detail-grid">
              <div className="surface-note">
                <p>
                  <strong>항목</strong>: {resolvedItemName}
                </p>
                <p>
                  <strong>경로</strong>: {detailHref}
                </p>
                <p>
                  <strong>가족</strong>: {workspaceView.family.name}
                </p>
              </div>
              <div className="surface-note">
                <p>
                  <strong>다음 단계</strong>: 이 카드를 실제 모듈 상세 본문으로 바꾸면 됩니다.
                </p>
                <p>
                  <strong>수정 경로</strong>: {editHref}
                </p>
                <p>
                  <strong>목록 경로</strong>: {moduleHref}
                </p>
              </div>
            </div>
          ) : (
            <div className="form-stack">
              <label className="form-label">
                제목
                <input
                  className="text-input"
                  defaultValue={
                    mode === "edit" ? `${resolvedItemName} 초안` : `${spec.label} 초안 제목`
                  }
                  readOnly
                  type="text"
                />
              </label>
              <label className="form-label">
                요약
                <textarea
                  className="text-input text-input--tall"
                  defaultValue={`${spec.summary} 이 편집 화면은 실제 모듈 CRUD 연결을 바로 받을 준비가 되어 있습니다.`}
                  readOnly
                />
              </label>
              <div className="builder-save-row">
                <Link className="button button--secondary" href={mode === "edit" ? detailHref : moduleHref}>
                  {mode === "edit" ? "상세로 돌아가기" : "목록으로 돌아가기"}
                </Link>
                <Link className="button button--ghost" href={mode === "edit" ? editHref : newHref}>
                  이 경로 유지
                </Link>
              </div>
            </div>
          )}
        </SurfaceCard>
      </section>
    </div>
  );
}
