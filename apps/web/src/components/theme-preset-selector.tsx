"use client";

import type { FamilyThemePreset } from "@ysplan/platform";

import { sharedThemePresets } from "../lib/shared-themes";
import { getThemeSceneTokens } from "../lib/theme-scene";

type ThemePresetSelectorProps = {
  name: string;
  value?: FamilyThemePreset;
  defaultValue?: FamilyThemePreset;
  onChange?: (value: FamilyThemePreset) => void;
  compact?: boolean;
};

export function ThemePresetSelector({
  name,
  value,
  defaultValue,
  onChange,
  compact = false,
}: ThemePresetSelectorProps) {
  const fallbackKey = defaultValue ?? sharedThemePresets[0]!.key;
  const isControlled = value !== undefined;

  return (
    <div className={`theme-selector${compact ? " theme-selector--compact" : ""}`}>
      {sharedThemePresets.map((theme) => {
        const sceneTokens = getThemeSceneTokens(theme);
        const checkedProps = isControlled
          ? { checked: value === theme.key }
          : { defaultChecked: theme.key === fallbackKey };

        return (
          <label className="theme-preset-card" key={theme.key}>
            <input
              {...checkedProps}
              className="theme-preset-card__input"
              name={name}
              onChange={() => onChange?.(theme.key)}
              type="radio"
              value={theme.key}
            />
            <span
              className="theme-preset-card__frame"
              style={{
                borderRadius: sceneTokens.sceneRadius,
                boxShadow: sceneTokens.shadow,
                border: `1px solid ${theme.familyTheme.accentColor}24`,
                background: sceneTokens.heroFill,
              }}
            >
              <span className="theme-preset-card__palette" aria-hidden="true">
                <span
                  className="theme-preset-card__swatch"
                  style={{ backgroundColor: theme.familyTheme.accentColor }}
                />
                <span
                  className="theme-preset-card__swatch"
                  style={{ backgroundColor: theme.familyTheme.warmColor }}
                />
                <span
                  className="theme-preset-card__swatch"
                  style={{ backgroundColor: theme.familyTheme.surfaceColor }}
                />
                <span
                  className="theme-preset-card__swatch"
                  style={{ backgroundColor: theme.familyTheme.highlightColor }}
                />
              </span>
              <span className="theme-preset-card__copy" style={{ fontFamily: theme.fontVar }}>
                <strong
                  className="theme-preset-card__title"
                  style={{ fontFamily: theme.fontVar }}
                >
                  {theme.label}
                </strong>
                <span
                  className="theme-preset-card__mood"
                  style={{ fontFamily: theme.fontVar }}
                >
                  {theme.mood}
                </span>
                <span className="theme-preset-card__description">{theme.description}</span>
                <span className="pill-row">
                  <span className="module-pill">{theme.shapePreset}</span>
                  <span className="module-pill">{theme.surfacePreset}</span>
                </span>
              </span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
