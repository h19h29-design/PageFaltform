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
    description: "공지, 일정, 최근 기록을 고르게 섞어 보여주는 기본 홈입니다.",
  },
  {
    key: "planner",
    label: "플래너형 홈",
    description: "오늘 해야 할 일과 일정 카드를 먼저 보여주는 실행형 홈입니다.",
  },
  {
    key: "story",
    label: "기록형 홈",
    description: "사진, 글, 최근 기록 흐름이 더 잘 보이는 스토리형 홈입니다.",
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
    description: "가족홈 분위기와 주요 모듈을 먼저 보여주고 입장 확인으로 이어집니다.",
  },
  {
    key: "direct",
    label: "바로 입장",
    description: "입구에서 바로 비밀번호나 코드를 확인하는 빠른 흐름입니다.",
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
        title="홈 프리셋"
        description={`${familyName} 첫 화면에서 어떤 정보가 먼저 눈에 들어올지 정합니다.`}
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
        title="입장 흐름"
        description="가족 입구에서 안내를 먼저 보여줄지, 바로 입장 확인으로 보낼지 정합니다."
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
        title="공통 테마 10종"
        description="가족홈과 클럽이 같은 테마 자산을 공유합니다. 색, 폰트, 분위기를 카드에서 바로 비교하고 고를 수 있습니다."
        badge={<StatusPill tone="warm">{selectedThemePreset.label}</StatusPill>}
      >
        <p className="helper-text">{selectedThemePreset.mood}</p>
        <ThemePresetSelector
          compact
          name="themePreset"
          onChange={setThemePreset}
          value={themePreset}
        />
      </SurfaceCard>

      <SurfaceCard
        className="builder-stack-card"
        title="모듈 구성"
        description="체크해서 켜고 끄고, 위아래 버튼이나 드래그로 실제 노출 순서를 조절합니다."
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
            최소 한 개 이상은 켜 두는 편이 좋습니다. 모두 끄면 첫 화면이 너무 비어 보일 수 있습니다.
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
                      className="button button--secondary button--small"
                      onClick={() => handleMoveModule(module.key, -1)}
                      type="button"
                    >
                      위로
                    </button>
                    <button
                      className="button button--secondary button--small"
                      onClick={() => handleMoveModule(module.key, 1)}
                      type="button"
                    >
                      아래로
                    </button>
                    <span aria-hidden="true" className="builder-module__handle">
                      드래그
                    </span>
                  </div>
                </div>

                <div className="builder-module__meta">
                  <span>노출 순서 {index + 1}</span>
                  <span>{isEnabled ? "사용 중" : "꺼짐"}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </SurfaceCard>
    </div>
  );
}
