import Link from "next/link";

import { StatusPill, SurfaceCard } from "@ysplan/ui";

import { buildFamilyHomeHref, buildFamilyModuleHref } from "../lib/family-app-routes";
import { toDateTimeLocalInputValue } from "../lib/tracker-formatters";
import type { StoredHabitRoutine } from "../lib/tracker-store";

type HabitRoutineFormProps = {
  familySlug: string;
  mode: "new" | "edit";
  action: (formData: FormData) => void | Promise<void>;
  habit?: StoredHabitRoutine;
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

export function HabitRoutineForm({ familySlug, mode, action, habit, errorMessage }: HabitRoutineFormProps) {
  const listHref = buildFamilyModuleHref(familySlug, "habits");
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
        {habit ? <input name="currentSlug" type="hidden" value={habit.slug} /> : null}

        <div className="grid-two">
          <SurfaceCard
            title={mode === "new" ? "새 루틴 만들기" : "루틴 수정"}
            description="루틴 이름과 반복 이유를 먼저 정하면 보드에서 더 구분되게 보입니다."
            badge={<StatusPill tone="accent">{mode === "new" ? "new" : "edit"}</StatusPill>}
          >
            <div className="form-stack">
              <label className="form-label">
                루틴 이름
                <input
                  className="text-input"
                  defaultValue={habit?.title ?? ""}
                  name="title"
                  placeholder="저녁 산책 루틴"
                  required
                  type="text"
                />
              </label>

              <label className="form-label">
                주소 슬러그
                <input
                  className="text-input"
                  defaultValue={habit?.slug ?? ""}
                  name="slug"
                  placeholder="evening-walk-routine"
                  type="text"
                />
              </label>

              <label className="form-label">
                루틴 설명
                <textarea
                  className="text-input text-input--tall"
                  defaultValue={habit?.habitBenefit ?? ""}
                  name="habitBenefit"
                  placeholder="왜 이 루틴을 유지하고 싶은지 적어주세요."
                  required
                />
              </label>

              <label className="form-label">
                기간 라벨
                <input
                  className="text-input"
                  defaultValue={habit?.periodLabel ?? ""}
                  name="periodLabel"
                  placeholder="이번 주"
                  required
                  type="text"
                />
              </label>
            </div>
          </SurfaceCard>

          <SurfaceCard
            title="루틴 수치"
            description="실천 횟수와 유지율, 연속 일수가 루틴 카드의 핵심 수치로 보입니다."
          >
            <div className="form-stack">
              <div className="grid-two">
                <label className="form-label">
                  실천 횟수
                  <input
                    className="text-input"
                    defaultValue={habit?.completionCount ?? 0}
                    min="0"
                    name="completionCount"
                    required
                    type="number"
                  />
                </label>

                <label className="form-label">
                  목표 횟수
                  <input
                    className="text-input"
                    defaultValue={habit?.targetCount ?? 1}
                    min="1"
                    name="targetCount"
                    required
                    type="number"
                  />
                </label>
              </div>

              <div className="grid-two">
                <label className="form-label">
                  유지율
                  <input
                    className="text-input"
                    defaultValue={habit?.consistencyRate ?? 0}
                    max="100"
                    min="0"
                    name="consistencyRate"
                    required
                    type="number"
                  />
                </label>

                <label className="form-label">
                  연속 일수
                  <input
                    className="text-input"
                    defaultValue={habit?.streakDays ?? 0}
                    min="0"
                    name="streakDays"
                    required
                    type="number"
                  />
                </label>
              </div>

              <label className="form-label">
                다음 체크 시각
                <input
                  className="text-input"
                  defaultValue={toDateTimeLocalInputValue(habit?.nextCheckInAt)}
                  name="nextCheckInAt"
                  type="datetime-local"
                />
              </label>
            </div>
          </SurfaceCard>
        </div>

        <SurfaceCard
          title="보드 노출 방식"
          description="가족 공용 여부와 강조 여부에 따라 루틴 보드와 홈 진행 밴드 노출 순서가 달라집니다."
        >
          <div className="grid-two">
            <label className="form-label">
              대상
              <select className="text-input" defaultValue={habit?.audience ?? "family-shared"} name="audience">
                {audienceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-label">
              공개 범위
              <select className="text-input" defaultValue={habit?.visibilityScope ?? "all"} name="visibilityScope">
                {visibilityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="form-label">
            <span>루틴 보드 상단에 강조하기</span>
            <input defaultChecked={habit?.featured ?? false} name="featured" type="checkbox" value="true" />
          </label>
        </SurfaceCard>

        <div className="builder-save-row">
          <button className="button button--primary" type="submit">
            {mode === "new" ? "루틴 저장" : "루틴 수정 저장"}
          </button>
          <Link className="button button--secondary" href={listHref}>
            루틴 보드로
          </Link>
          <Link className="button button--ghost" href={homeHref}>
            가족 홈으로
          </Link>
        </div>
      </form>
    </div>
  );
}
