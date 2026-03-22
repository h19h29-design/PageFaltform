"use client";

import { useState } from "react";

import type { ModuleDescriptor, ModuleKey } from "@ysplan/modules-core";
import {
  familyEntryPresetOptions,
  familyHomePresetOptions,
  type FamilyEntryPreset,
  type FamilyHomePreset,
  type FamilyWorkspaceDraft,
} from "@ysplan/platform";
import { StatusPill, SurfaceCard } from "@ysplan/ui";

type FamilyBuilderFormProps = {
  familyName: string;
  moduleCatalog: ModuleDescriptor[];
  initialDraft: FamilyWorkspaceDraft;
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
}: FamilyBuilderFormProps) {
  const [homePreset, setHomePreset] = useState<FamilyHomePreset>(initialDraft.homePreset);
  const [entryPreset, setEntryPreset] = useState<FamilyEntryPreset>(initialDraft.entryPreset);
  const [draggingKey, setDraggingKey] = useState<ModuleKey | null>(null);
  const [moduleOrder, setModuleOrder] = useState<ModuleKey[]>(
    moduleCatalog.map((module) => module.key),
  );
  const [enabledModules, setEnabledModules] = useState<Set<ModuleKey>>(
    () => new Set(initialDraft.enabledModules),
  );

  const orderedEnabledModules = moduleOrder.filter((moduleKey) => enabledModules.has(moduleKey));

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
      <input name="enabledModules" type="hidden" value={orderedEnabledModules.join(",")} />

      <SurfaceCard
        title="홈 프리셋"
        description={`${familyName} 홈 첫 화면을 어떤 성격으로 보여 줄지 선택합니다.`}
        badge={<StatusPill tone="accent">{homePreset}</StatusPill>}
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
        description="입구 페이지에서 가족 분위기를 먼저 보여 줄지, 바로 비밀번호 확인으로 들어갈지 정합니다."
        badge={<StatusPill>{entryPreset}</StatusPill>}
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
        className="builder-stack-card"
        title="모듈 스택"
        description="체크박스로 켜고 끄고, 드래그나 위·아래 버튼으로 홈 노출 순서를 바꿀 수 있습니다."
        badge={<StatusPill tone="warm">{orderedEnabledModules.length} enabled</StatusPill>}
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
            최소 한 개 모듈은 켜 두는 편이 좋습니다. 모두 끄더라도 저장 시 기본 모듈이 다시 들어옵니다.
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
                    <span className="builder-module__handle" aria-hidden="true">
                      drag
                    </span>
                  </div>
                </div>

                <div className="builder-module__meta">
                  <span>홈 순서 {index + 1}</span>
                  <span>{isEnabled ? "활성화됨" : "비활성화됨"}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </SurfaceCard>
    </div>
  );
}
