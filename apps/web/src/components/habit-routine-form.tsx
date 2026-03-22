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
  { value: "family-shared", label: "Family shared" },
  { value: "personal", label: "Personal" },
] as const;

const visibilityOptions = [
  { value: "all", label: "All members" },
  { value: "children-safe", label: "Children safe" },
  { value: "adults", label: "Adults" },
  { value: "admins", label: "Admins" },
  { value: "private", label: "Private" },
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
            title={mode === "new" ? "New habit" : "Edit habit"}
            description="Routine copy and check-in timing feed the same streak and consistency card used on home."
            badge={<StatusPill tone="accent">{mode}</StatusPill>}
          >
            <div className="form-stack">
              <label className="form-label">
                Title
                <input
                  className="text-input"
                  defaultValue={habit?.title ?? ""}
                  name="title"
                  placeholder="Evening walk routine"
                  required
                  type="text"
                />
              </label>

              <label className="form-label">
                Slug
                <input
                  className="text-input"
                  defaultValue={habit?.slug ?? ""}
                  name="slug"
                  placeholder="evening-walk-routine"
                  type="text"
                />
              </label>

              <label className="form-label">
                Benefit summary
                <textarea
                  className="text-input text-input--tall"
                  defaultValue={habit?.habitBenefit ?? ""}
                  name="habitBenefit"
                  placeholder="Explain why keeping this routine matters."
                  required
                />
              </label>

              <label className="form-label">
                Period label
                <input
                  className="text-input"
                  defaultValue={habit?.periodLabel ?? ""}
                  name="periodLabel"
                  placeholder="This week"
                  required
                  type="text"
                />
              </label>
            </div>
          </SurfaceCard>

          <SurfaceCard
            title="Habit metrics"
            description="Completion, consistency, and streak stay aligned across list, detail, and home card views."
          >
            <div className="form-stack">
              <div className="grid-two">
                <label className="form-label">
                  Completion count
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
                  Target count
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
                  Consistency rate
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
                  Streak days
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
                Next check-in
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
          title="Card visibility"
          description="Audience, visibility, and featured state decide how the habit surfaces in the progress band."
        >
          <div className="grid-two">
            <label className="form-label">
              Audience
              <select className="text-input" defaultValue={habit?.audience ?? "family-shared"} name="audience">
                {audienceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-label">
              Visibility
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
            <span>Featured on the progress band</span>
            <input defaultChecked={habit?.featured ?? false} name="featured" type="checkbox" value="true" />
          </label>
        </SurfaceCard>

        <div className="builder-save-row">
          <button className="button button--primary" type="submit">
            {mode === "new" ? "Create habit" : "Save habit"}
          </button>
          <Link className="button button--secondary" href={listHref}>
            Back to habits
          </Link>
          <Link className="button button--ghost" href={homeHref}>
            Back to home
          </Link>
        </div>
      </form>
    </div>
  );
}
