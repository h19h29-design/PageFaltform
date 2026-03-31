"use client";

import { useState } from "react";

import type { ModuleDescriptor, ModuleKey } from "@ysplan/modules-core";
import type {
  FamilyEntryPreset,
  FamilyHomePreset,
  FamilyThemePreset,
  FamilyWorkspaceDraft,
} from "@ysplan/platform";
import { StatusPill, SurfaceCard } from "@ysplan/ui";

import { getSharedThemePreset } from "../lib/shared-themes";
import { ThemePresetSelector } from "./theme-preset-selector";

type FamilyBuilderFormProps = {
  familyName: string;
  moduleCatalog: ModuleDescriptor[];
  initialDraft: FamilyWorkspaceDraft;
};

const familyHomePresetOptions: Array<{
  key: FamilyHomePreset;
  label: string;
  description: string;
}> = [
  {
    key: "balanced",
    label: "균형형 홈",
    description: "공지, 일정, 기록을 고르게 보여줍니다.",
  },
  {
    key: "planner",
    label: "플래너형 홈",
    description: "오늘 할 일과 일정이 먼저 보입니다.",
  },
  {
    key: "story",
    label: "기록형 홈",
    description: "사진과 글을 중심으로 보여줍니다.",
  },
];

const familyEntryPresetOptions: Array<{
  key: FamilyEntryPreset;
  label: string;
  description: string;
}> = [
  {
    key: "guided",
    label: "안내형 입장",
    description: "처음 들어오는 사람에게 필요한 안내를 먼저 보여줍니다.",
  },
  {
    key: "direct",
    label: "바로 입장",
    description: "비밀번호만 확인하고 바로 들어갑니다.",
  },
];

function moveItem(moduleKeys: ModuleKey[], fromKey: ModuleKey, toKey: ModuleKey): ModuleKey[] {
  if (fromKey === toKey) {
    return moduleKeys;
  }

  const nextKeys = [...moduleKeys];
  const fromIndex = nextKeys.indexOf(fromKey);
  const toIndex = nextKeys.indexOf(toKey);

  if (fromIndex === -1 || toIndex === -1) {
    return moduleKeys;
  }

  const [movedKey] = nextKeys.splice(fromIndex, 1);
  nextKeys.splice(toIndex, 0, movedKey!);
  return nextKeys;
}

export function FamilyBuilderForm({
  familyName,
  moduleCatalog,
  initialDraft,
}: FamilyBuilderFormProps) {
  const [homePreset, setHomePreset] = useState<FamilyHomePreset>(initialDraft.homePreset);
  const [entryPreset, setEntryPreset] = useState<FamilyEntryPreset>(initialDraft.entryPreset);
  const [themePreset, setThemePreset] = useState<FamilyThemePreset>(initialDraft.themePreset);
  const [draggingKey, setDraggingKey] = useState<ModuleKey | null>(null);
  const [moduleOrder, setModuleOrder] = useState<ModuleKey[]>(
    moduleCatalog.map((module) => module.key),
  );
  const [enabledModules, setEnabledModules] = useState<Set<ModuleKey>>(
    () => new Set(initialDraft.enabledModules),
  );

  const orderedEnabledModules = moduleOrder.filter((moduleKey) => enabledModules.has(moduleKey));
  const selectedHomePreset =
    familyHomePresetOptions.find((option) => option.key === homePreset) ??
    familyHomePresetOptions[0]!;
  const selectedEntryPreset =
    familyEntryPresetOptions.find((option) => option.key === entryPreset) ??
    familyEntryPresetOptions[0]!;
  const selectedThemePreset = getSharedThemePreset(themePreset);

  function handleToggleModule(moduleKey: ModuleKey) {
    setEnabledModules((current) => {
      const next = new Set(current);

      if (next.has(moduleKey)) {
        next.delete(moduleKey);
      } else {
        next.add(moduleKey);
      }

      return next;
    });
  }

  function handleMoveModule(moduleKey: ModuleKey, direction: -1 | 1) {
    setModuleOrder((current) => {
      const currentIndex = current.indexOf(moduleKey);
      const nextIndex = currentIndex + direction;

      if (currentIndex === -1 || nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const nextOrder = [...current];
      const [movedKey] = nextOrder.splice(currentIndex, 1);
      nextOrder.splice(nextIndex, 0, movedKey!);
      return nextOrder;
    });
  }

  return (
    <div className="builder-grid">
      <input name="homePreset" type="hidden" value={homePreset} />
      <input name="entryPreset" type="hidden" value={entryPreset} />
      <input name="enabledModules" type="hidden" value={orderedEnabledModules.join(",")} />

      <SurfaceCard
        title="홈 구성"
        description={`${familyName} 첫 화면에 어떤 정보가 먼저 보일지 정합니다.`}
        badge={<StatusPill tone="accent">{selectedHomePreset.label}</StatusPill>}
      >
        <div className="builder-option-grid">
          {familyHomePresetOptions.map((option) => (
            <button
              key={option.key}
              className={`builder-option${homePreset === option.key ? " builder-option--active" : ""}`}
              onClick={() => setHomePreset(option.key)}
              type="button"
            >
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </button>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard
        title="입장 방식"
        description="가족홈 입구에서 보이는 흐름을 정합니다."
        badge={<StatusPill>{selectedEntryPreset.label}</StatusPill>}
      >
        <div className="builder-option-grid builder-option-grid--compact">
          {familyEntryPresetOptions.map((option) => (
            <button
              key={option.key}
              className={`builder-option${entryPreset === option.key ? " builder-option--active" : ""}`}
              onClick={() => setEntryPreset(option.key)}
              type="button"
            >
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </button>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard
        title="공통 테마"
        description="가족홈과 클럽에서 함께 쓸 수 있는 테마를 고릅니다."
        badge={<StatusPill tone="warm">{selectedThemePreset.label}</StatusPill>}
      >
        <p className="helper-text">{selectedThemePreset.mood}</p>
        <ThemePresetSelector compact name="themePreset" onChange={setThemePreset} value={themePreset} />
      </SurfaceCard>

      <SurfaceCard
        className="builder-stack-card"
        title="모듈 구성"
        description="체크로 켜고 끄고, 순서 버튼이나 드래그로 정리합니다."
        badge={<StatusPill tone="warm">{orderedEnabledModules.length}개 사용 중</StatusPill>}
      >
        {orderedEnabledModules.length > 0 ? (
          <div className="pill-row">
            {orderedEnabledModules.map((moduleKey) => {
              const module = moduleCatalog.find((candidate) => candidate.key === moduleKey);
              return (
                <span className="module-pill" key={moduleKey}>
                  {module?.label ?? moduleKey}
                </span>
              );
            })}
          </div>
        ) : (
          <div className="builder-empty">
            사용 중인 모듈이 없습니다. 하나 이상 켜면 첫 화면에 보여집니다.
          </div>
        )}

        <ul className="builder-module-list">
          {moduleOrder.map((moduleKey, index) => {
            const module = moduleCatalog.find((candidate) => candidate.key === moduleKey);

            if (!module) {
              return null;
            }

            const isEnabled = enabledModules.has(module.key);

            return (
              <li
                key={module.key}
                className={`builder-module${isEnabled ? "" : " builder-module--disabled"}${
                  draggingKey === module.key ? " builder-module--dragging" : ""
                }`}
                draggable
                onDragEnd={() => setDraggingKey(null)}
                onDragOver={(event) => event.preventDefault()}
                onDragStart={() => setDraggingKey(module.key)}
                onDrop={() => {
                  if (draggingKey) {
                    setModuleOrder((current) => moveItem(current, draggingKey, module.key));
                  }
                  setDraggingKey(null);
                }}
              >
                <div className="builder-module__top">
                  <label className="builder-check">
                    <input
                      checked={isEnabled}
                      onChange={() => handleToggleModule(module.key)}
                      type="checkbox"
                    />
                    <div className="builder-module__copy">
                      <strong>{module.label}</strong>
                      <span>{module.description}</span>
                    </div>
                  </label>

                  <div className="builder-module__actions">
                    <StatusPill>{module.kind}</StatusPill>
                    <button
                      className="button button--ghost button--small"
                      disabled={index === 0}
                      onClick={() => handleMoveModule(module.key, -1)}
                      type="button"
                    >
                      위로
                    </button>
                    <button
                      className="button button--ghost button--small"
                      disabled={index === moduleOrder.length - 1}
                      onClick={() => handleMoveModule(module.key, 1)}
                      type="button"
                    >
                      아래로
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </SurfaceCard>
    </div>
  );
}
