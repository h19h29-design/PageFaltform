"use client";

import { useState } from "react";

import type { ModuleDescriptor, ModuleKey } from "@ysplan/modules-core";
import {
  familyEntryPresetOptions,
  familyHomePresetOptions,
  type FamilyEntryPreset,
  type FamilyHomePreset,
  type FamilyThemePreset,
  type FamilyWorkspaceDraft,
} from "@ysplan/platform";
import { StatusPill, SurfaceCard } from "@ysplan/ui";

type FamilyBuilderFormProps = {
  familyName: string;
  moduleCatalog: ModuleDescriptor[];
  initialDraft: FamilyWorkspaceDraft;
  themeOptions: Array<{
    key: FamilyThemePreset;
    label: string;
    description: string;
  }>;
};

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
  themeOptions,
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
  const selectedHomePreset = familyHomePresetOptions.find((option) => option.key === homePreset);
  const selectedEntryPreset = familyEntryPresetOptions.find((option) => option.key === entryPreset);
  const selectedThemePreset = themeOptions.find((option) => option.key === themePreset);

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
      const [moved] = nextOrder.splice(currentIndex, 1);
      nextOrder.splice(nextIndex, 0, moved!);
      return nextOrder;
    });
  }

  return (
    <div className="builder-grid">
      <input name="homePreset" type="hidden" value={homePreset} />
      <input name="entryPreset" type="hidden" value={entryPreset} />
      <input name="themePreset" type="hidden" value={themePreset} />
      <input name="enabledModules" type="hidden" value={orderedEnabledModules.join(",")} />

      <SurfaceCard
        title="홈 프리셋"
        description={`${familyName} 첫 화면에서 어떤 정보가 먼저 보일지 정합니다.`}
        badge={<StatusPill tone="accent">{selectedHomePreset?.label ?? homePreset}</StatusPill>}
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
        description="가족 입구에서 안내를 먼저 보여줄지, 바로 비밀번호 확인으로 보낼지 정합니다."
        badge={<StatusPill>{selectedEntryPreset?.label ?? entryPreset}</StatusPill>}
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
        title="테마 프리셋"
        description="배경 톤과 강조색을 한 번에 바꿔 가족마다 다른 분위기를 줄 수 있습니다."
        badge={<StatusPill tone="warm">{selectedThemePreset?.label ?? themePreset}</StatusPill>}
      >
        <div className="builder-option-grid builder-option-grid--compact">
          {themeOptions.map((option) => (
            <button
              key={option.key}
              className={`builder-option theme-option${themePreset === option.key ? " builder-option--active" : ""}`}
              onClick={() => setThemePreset(option.key)}
              type="button"
            >
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </button>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard
        className="builder-stack-card"
        title="모듈 구성"
        description="체크해서 켜고 끄고, 드래그나 위아래 버튼으로 실제 노출 순서를 조정합니다."
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
            최소 한 개 이상의 모듈은 켜두는 편이 좋습니다. 모두 꺼도 저장은 되지만 첫 화면이 많이 비어 보일 수 있습니다.
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
                className={`builder-module${isEnabled ? "" : " builder-module--disabled"}${
                  draggingKey === module.key ? " builder-module--dragging" : ""
                }`}
                draggable
                key={module.key}
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
