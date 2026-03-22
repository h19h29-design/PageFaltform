import type { ReactNode } from "react";

import type { CalendarScheduleFixture } from "@ysplan/modules-calendar";
import type { DayPlannerBlockFixture } from "@ysplan/modules-day-planner";
import type { SchoolTimetableFixture } from "@ysplan/modules-school-timetable";
import type { TodoItemFixture } from "@ysplan/modules-todo";

import {
  audienceOptions,
  createFallbackDateTimeInputValue,
  formatDateTimeInputValue,
  visibilityScopeOptions,
} from "./schedule-module-utils";

type ModuleFormAction = (formData: FormData) => void | Promise<void>;

function FieldShell(props: {
  label: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <label className="form-label">
      {props.label}
      {props.children}
      {props.helper ? <span className="helper-text">{props.helper}</span> : null}
    </label>
  );
}

function ToggleField(props: {
  name: string;
  label: string;
  helper: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="builder-option">
      <span className="builder-check">
        <input defaultChecked={props.defaultChecked} name={props.name} type="checkbox" />
        <span>
          <strong>{props.label}</strong>
          <span>{props.helper}</span>
        </span>
      </span>
    </label>
  );
}

function SharedMetaFields(props: {
  slug?: string | undefined;
  audience?: string | undefined;
  visibilityScope?: string | undefined;
}) {
  return (
    <div className="builder-grid">
      <FieldShell
        label="슬러그"
        helper="비워 두면 제목으로 자동 생성합니다."
      >
        <input
          className="text-input"
          defaultValue={props.slug ?? ""}
          name="slug"
          placeholder="after-school-run"
          type="text"
        />
      </FieldShell>

      <FieldShell label="카드 범위">
        <select
          className="text-input"
          defaultValue={props.audience ?? "family-shared"}
          name="audience"
        >
          {audienceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FieldShell>

      <FieldShell label="노출 범위">
        <select
          className="text-input"
          defaultValue={props.visibilityScope ?? "all"}
          name="visibilityScope"
        >
          {visibilityScopeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FieldShell>
    </div>
  );
}

function FormFrame(props: {
  action: ModuleFormAction;
  familySlug: string;
  originalSlug?: string | undefined;
  submitLabel: string;
  children: ReactNode;
}) {
  return (
    <form action={props.action} className="form-stack">
      <input name="familySlug" type="hidden" value={props.familySlug} />
      {props.originalSlug ? (
        <input name="originalSlug" type="hidden" value={props.originalSlug} />
      ) : null}
      {props.children}
      <div className="inline-actions">
        <button className="button button--primary" type="submit">
          {props.submitLabel}
        </button>
      </div>
    </form>
  );
}

export function CalendarScheduleForm(props: {
  action: ModuleFormAction;
  familySlug: string;
  timezone: string;
  schedule?: CalendarScheduleFixture;
  submitLabel: string;
}) {
  return (
    <FormFrame
      action={props.action}
      familySlug={props.familySlug}
      originalSlug={props.schedule?.slug}
      submitLabel={props.submitLabel}
    >
      <FieldShell label="제목">
        <input
          className="text-input"
          defaultValue={props.schedule?.title ?? ""}
          name="title"
          placeholder="민서 치과 예약"
          type="text"
        />
      </FieldShell>

      <div className="builder-grid">
        <FieldShell label="시작 시각">
          <input
            className="text-input"
            defaultValue={
              props.schedule
                ? formatDateTimeInputValue(props.schedule.startsAt, props.timezone)
                : createFallbackDateTimeInputValue()
            }
            name="startsAt"
            type="datetime-local"
          />
        </FieldShell>

        <FieldShell label="종료 시각">
          <input
            className="text-input"
            defaultValue={
              props.schedule?.endsAt
                ? formatDateTimeInputValue(props.schedule.endsAt, props.timezone)
                : ""
            }
            name="endsAt"
            type="datetime-local"
          />
        </FieldShell>
      </div>

      <div className="builder-grid">
        <FieldShell label="장소">
          <input
            className="text-input"
            defaultValue={props.schedule?.location ?? ""}
            name="location"
            placeholder="도곡 치과"
            type="text"
          />
        </FieldShell>

        <FieldShell label="담당자">
          <input
            className="text-input"
            defaultValue={props.schedule?.ownerLabel ?? ""}
            name="ownerLabel"
            placeholder="엄마"
            type="text"
          />
        </FieldShell>
      </div>

      <SharedMetaFields
        slug={props.schedule?.slug}
        audience={props.schedule?.audience}
        visibilityScope={props.schedule?.visibilityScope}
      />

      <ToggleField
        defaultChecked={props.schedule?.affectsFamilyFlow ?? true}
        helper="today 또는 focus 카드 후보에 반영됩니다."
        label="가족 흐름에 영향"
        name="affectsFamilyFlow"
      />
    </FormFrame>
  );
}

export function TodoItemForm(props: {
  action: ModuleFormAction;
  familySlug: string;
  timezone: string;
  todo?: TodoItemFixture;
  submitLabel: string;
}) {
  return (
    <FormFrame
      action={props.action}
      familySlug={props.familySlug}
      originalSlug={props.todo?.slug}
      submitLabel={props.submitLabel}
    >
      <FieldShell label="제목">
        <input
          className="text-input"
          defaultValue={props.todo?.title ?? ""}
          name="title"
          placeholder="실내화 챙기기"
          type="text"
        />
      </FieldShell>

      <div className="builder-grid">
        <FieldShell label="마감 시각">
          <input
            className="text-input"
            defaultValue={
              props.todo
                ? formatDateTimeInputValue(props.todo.dueAt, props.timezone)
                : createFallbackDateTimeInputValue()
            }
            name="dueAt"
            type="datetime-local"
          />
        </FieldShell>

        <FieldShell label="담당자">
          <input
            className="text-input"
            defaultValue={props.todo?.assigneeLabel ?? ""}
            name="assigneeLabel"
            placeholder="아빠"
            type="text"
          />
        </FieldShell>
      </div>

      <SharedMetaFields
        slug={props.todo?.slug}
        audience={props.todo?.audience}
        visibilityScope={props.todo?.visibilityScope}
      />

      <div className="builder-option-grid">
        <ToggleField
          defaultChecked={props.todo?.blocksFamilyFlow ?? true}
          helper="홈 today/focus 우선순위 계산에 반영됩니다."
          label="가족 흐름 blocker"
          name="blocksFamilyFlow"
        />
        <ToggleField
          defaultChecked={props.todo?.completed ?? false}
          helper="완료된 항목은 홈 카드 후보에서 빠집니다."
          label="완료됨"
          name="completed"
        />
        <ToggleField
          defaultChecked={props.todo?.overdue ?? false}
          helper="마감일보다 우선해서 지연 상태로 취급합니다."
          label="강제 지연"
          name="overdue"
        />
      </div>
    </FormFrame>
  );
}

export function SchoolTimetableForm(props: {
  action: ModuleFormAction;
  familySlug: string;
  timezone: string;
  schedule?: SchoolTimetableFixture;
  submitLabel: string;
}) {
  return (
    <FormFrame
      action={props.action}
      familySlug={props.familySlug}
      originalSlug={props.schedule?.slug}
      submitLabel={props.submitLabel}
    >
      <div className="builder-grid">
        <FieldShell label="학생 이름">
          <input
            className="text-input"
            defaultValue={props.schedule?.studentLabel ?? ""}
            name="studentLabel"
            placeholder="민서"
            type="text"
          />
        </FieldShell>

        <FieldShell label="제목">
          <input
            className="text-input"
            defaultValue={props.schedule?.title ?? ""}
            name="title"
            placeholder="영어 학원"
            type="text"
          />
        </FieldShell>
      </div>

      <div className="builder-grid">
        <FieldShell label="시작 시각">
          <input
            className="text-input"
            defaultValue={
              props.schedule
                ? formatDateTimeInputValue(props.schedule.startsAt, props.timezone)
                : createFallbackDateTimeInputValue()
            }
            name="startsAt"
            type="datetime-local"
          />
        </FieldShell>

        <FieldShell label="종료 시각">
          <input
            className="text-input"
            defaultValue={
              props.schedule?.endsAt
                ? formatDateTimeInputValue(props.schedule.endsAt, props.timezone)
                : ""
            }
            name="endsAt"
            type="datetime-local"
          />
        </FieldShell>
      </div>

      <FieldShell label="준비 메모">
        <textarea
          className="text-input text-input--tall"
          defaultValue={props.schedule?.preparationNote ?? ""}
          name="preparationNote"
          placeholder="체육복, 준비물 확인"
        />
      </FieldShell>

      <SharedMetaFields
        slug={props.schedule?.slug}
        audience={props.schedule?.audience}
        visibilityScope={props.schedule?.visibilityScope}
      />

      <ToggleField
        defaultChecked={props.schedule?.affectsFamilyFlow ?? true}
        helper="등하교 또는 학원 동선에 영향을 주는 경우 켜 둡니다."
        label="가족 동선에 영향"
        name="affectsFamilyFlow"
      />
    </FormFrame>
  );
}

export function DayPlannerBlockForm(props: {
  action: ModuleFormAction;
  familySlug: string;
  timezone: string;
  block?: DayPlannerBlockFixture;
  submitLabel: string;
}) {
  return (
    <FormFrame
      action={props.action}
      familySlug={props.familySlug}
      originalSlug={props.block?.slug}
      submitLabel={props.submitLabel}
    >
      <FieldShell label="제목">
        <input
          className="text-input"
          defaultValue={props.block?.title ?? ""}
          name="title"
          placeholder="저녁 준비와 픽업"
          type="text"
        />
      </FieldShell>

      <div className="builder-grid">
        <FieldShell label="시작 시각">
          <input
            className="text-input"
            defaultValue={
              props.block
                ? formatDateTimeInputValue(props.block.startsAt, props.timezone)
                : createFallbackDateTimeInputValue()
            }
            name="startsAt"
            type="datetime-local"
          />
        </FieldShell>

        <FieldShell label="종료 시각">
          <input
            className="text-input"
            defaultValue={
              props.block
                ? formatDateTimeInputValue(props.block.endsAt, props.timezone)
                : createFallbackDateTimeInputValue()
            }
            name="endsAt"
            type="datetime-local"
          />
        </FieldShell>
      </div>

      <FieldShell label="담당자">
        <input
          className="text-input"
          defaultValue={props.block?.ownerLabel ?? ""}
          name="ownerLabel"
          placeholder="아빠"
          type="text"
        />
      </FieldShell>

      <SharedMetaFields
        slug={props.block?.slug}
        audience={props.block?.audience}
        visibilityScope={props.block?.visibilityScope}
      />

      <ToggleField
        defaultChecked={props.block?.affectsFamilyFlow ?? true}
        helper="today/focus 카드와 공동 시간 블록 계산에 반영됩니다."
        label="핸드오프 영향"
        name="affectsFamilyFlow"
      />
    </FormFrame>
  );
}
