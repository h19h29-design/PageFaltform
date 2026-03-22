import Link from "next/link";

import { StatusPill, SurfaceCard } from "@ysplan/ui";

import { buildFamilyHomeHref, buildFamilyModuleHref } from "../lib/family-app-routes";
import { toDateTimeLocalInputValue } from "../lib/tracker-formatters";
import type { StoredProgressGoal } from "../lib/tracker-store";

type ProgressGoalFormProps = {
  familySlug: string;
  mode: "new" | "edit";
  action: (formData: FormData) => void | Promise<void>;
  goal?: StoredProgressGoal;
  errorMessage?: string | null;
};

const audienceOptions = [
  { value: "family-shared", label: "가족 공용" },
  { value: "personal", label: "개인" },
] as const;

const visibilityOptions = [
  { value: "all", label: "전체" },
  { value: "children-safe", label: "아이도 보기" },
  { value: "adults", label: "성인만" },
  { value: "admins", label: "관리자만" },
  { value: "private", label: "비공개" },
] as const;

export function ProgressGoalForm({ familySlug, mode, action, goal, errorMessage }: ProgressGoalFormProps) {
  const listHref = buildFamilyModuleHref(familySlug, "progress");
  const homeHref = buildFamilyHomeHref(familySlug);

  return (
    <div className="surface-stack">
      {errorMessage ? (
        <div className="surface-note">
          <p>{errorMessage}</p>
        </div>
      ) : null}

      <form action={action} className="surface-stack">
        <input name="familySlug" type="hidden" value={familySlug} />
        {goal ? <input name="currentSlug" type="hidden" value={goal.slug} /> : null}

        <div className="grid-two">
          <SurfaceCard
            title={mode === "new" ? "새 목표 만들기" : "목표 수정"}
            description="목표 이름과 달성 기준을 먼저 정하면 보드에서 바로 크게 보입니다."
            badge={<StatusPill tone="accent">{mode === "new" ? "new" : "edit"}</StatusPill>}
          >
            <div className="form-stack">
              <label className="form-label">
                목표 이름
                <input
                  className="text-input"
                  defaultValue={goal?.title ?? ""}
                  name="title"
                  placeholder="가족 독서 챌린지"
                  required
                  type="text"
                />
              </label>

              <label className="form-label">
                주소 슬러그
                <input
                  className="text-input"
                  defaultValue={goal?.slug ?? ""}
                  name="slug"
                  placeholder="family-reading-challenge"
                  type="text"
                />
              </label>

              <label className="form-label">
                목표 설명
                <textarea
                  className="text-input text-input--tall"
                  defaultValue={goal?.goalOutcome ?? ""}
                  name="goalOutcome"
                  placeholder="이 목표를 달성하면 어떤 상태가 되는지 적어주세요."
                  required
                />
              </label>

              <label className="form-label">
                기간 라벨
                <input
                  className="text-input"
                  defaultValue={goal?.cadenceLabel ?? ""}
                  name="cadenceLabel"
                  placeholder="이번 달"
                  required
                  type="text"
                />
              </label>
            </div>
          </SurfaceCard>

          <SurfaceCard
            title="진행 수치"
            description="현재 값과 목표 값을 크게 비교해 진행률이 바로 계산됩니다."
          >
            <div className="form-stack">
              <div className="grid-two">
                <label className="form-label">
                  현재 값
                  <input
                    className="text-input"
                    defaultValue={goal?.currentValue ?? 0}
                    min="0"
                    name="currentValue"
                    required
                    type="number"
                  />
                </label>

                <label className="form-label">
                  목표 값
                  <input
                    className="text-input"
                    defaultValue={goal?.targetValue ?? 1}
                    min="1"
                    name="targetValue"
                    required
                    type="number"
                  />
                </label>
              </div>

              <div className="grid-two">
                <label className="form-label">
                  단위 이름
                  <input
                    className="text-input"
                    defaultValue={goal?.metricLabel ?? ""}
                    name="metricLabel"
                    placeholder="읽은 페이지"
                    required
                    type="text"
                  />
                </label>

                <label className="form-label">
                  단위 표기
                  <input
                    className="text-input"
                    defaultValue={goal?.metricUnit ?? ""}
                    name="metricUnit"
                    placeholder="쪽"
                    type="text"
                  />
                </label>
              </div>

              <div className="grid-two">
                <label className="form-label">
                  연속 일수
                  <input
                    className="text-input"
                    defaultValue={goal?.streakDays ?? 0}
                    min="0"
                    name="streakDays"
                    required
                    type="number"
                  />
                </label>

                <label className="form-label">
                  마감 시각
                  <input
                    className="text-input"
                    defaultValue={toDateTimeLocalInputValue(goal?.dueAt)}
                    name="dueAt"
                    type="datetime-local"
                  />
                </label>
              </div>
            </div>
          </SurfaceCard>
        </div>

        <SurfaceCard
          title="보드 노출 방식"
          description="공용 여부와 강조 여부에 따라 목표 보드와 홈의 진행 밴드 노출 순서가 달라집니다."
        >
          <div className="grid-two">
            <label className="form-label">
              대상
              <select className="text-input" defaultValue={goal?.audience ?? "family-shared"} name="audience">
                {audienceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-label">
              공개 범위
              <select className="text-input" defaultValue={goal?.visibilityScope ?? "all"} name="visibilityScope">
                {visibilityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="form-label">
            <span>목표 보드 상단에 강조하기</span>
            <input defaultChecked={goal?.featured ?? false} name="featured" type="checkbox" value="true" />
          </label>
        </SurfaceCard>

        <div className="builder-save-row">
          <button className="button button--primary" type="submit">
            {mode === "new" ? "목표 저장" : "목표 수정 저장"}
          </button>
          <Link className="button button--secondary" href={listHref}>
            목표 보드로
          </Link>
          <Link className="button button--ghost" href={homeHref}>
            가족 홈으로
          </Link>
        </div>
      </form>
    </div>
  );
}
