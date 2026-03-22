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
            title={mode === "new" ? "New goal" : "Edit goal"}
            description="Goal title, outcome, and progress numbers drive the same tracker card summary shown on home."
            badge={<StatusPill tone="accent">{mode}</StatusPill>}
          >
            <div className="form-stack">
              <label className="form-label">
                Title
                <input
                  className="text-input"
                  defaultValue={goal?.title ?? ""}
                  name="title"
                  placeholder="Family reading challenge"
                  required
                  type="text"
                />
              </label>

              <label className="form-label">
                Slug
                <input
                  className="text-input"
                  defaultValue={goal?.slug ?? ""}
                  name="slug"
                  placeholder="family-reading-challenge"
                  type="text"
                />
              </label>

              <label className="form-label">
                Goal outcome
                <textarea
                  className="text-input text-input--tall"
                  defaultValue={goal?.goalOutcome ?? ""}
                  name="goalOutcome"
                  placeholder="Explain what success looks like when this goal is complete."
                  required
                />
              </label>

              <label className="form-label">
                Cadence label
                <input
                  className="text-input"
                  defaultValue={goal?.cadenceLabel ?? ""}
                  name="cadenceLabel"
                  placeholder="This week"
                  required
                  type="text"
                />
              </label>
            </div>
          </SurfaceCard>

          <SurfaceCard
            title="Progress metrics"
            description="Badge and metric values are derived from current value, target value, and streak."
          >
            <div className="form-stack">
              <div className="grid-two">
                <label className="form-label">
                  Current value
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
                  Target value
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
                  Metric label
                  <input
                    className="text-input"
                    defaultValue={goal?.metricLabel ?? ""}
                    name="metricLabel"
                    placeholder="pages"
                    required
                    type="text"
                  />
                </label>

                <label className="form-label">
                  Metric unit
                  <input
                    className="text-input"
                    defaultValue={goal?.metricUnit ?? ""}
                    name="metricUnit"
                    placeholder="p"
                    type="text"
                  />
                </label>
              </div>

              <div className="grid-two">
                <label className="form-label">
                  Streak days
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
                  Due at
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
          title="Card visibility"
          description="Audience, visibility, and featured state control how the goal appears in the progress band."
        >
          <div className="grid-two">
            <label className="form-label">
              Audience
              <select className="text-input" defaultValue={goal?.audience ?? "family-shared"} name="audience">
                {audienceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-label">
              Visibility
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
            <span>Featured on the progress band</span>
            <input defaultChecked={goal?.featured ?? false} name="featured" type="checkbox" value="true" />
          </label>
        </SurfaceCard>

        <div className="builder-save-row">
          <button className="button button--primary" type="submit">
            {mode === "new" ? "Create goal" : "Save goal"}
          </button>
          <Link className="button button--secondary" href={listHref}>
            Back to goals
          </Link>
          <Link className="button button--ghost" href={homeHref}>
            Back to home
          </Link>
        </div>
      </form>
    </div>
  );
}
