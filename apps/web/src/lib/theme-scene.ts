import type { CSSProperties } from "react";

import type { FamilyThemePreset } from "@ysplan/platform";
import type { FamilyTheme } from "@ysplan/tenant";

import {
  getSharedThemePreset,
  type SharedThemePreset,
  type SharedThemeShapePreset,
  type SharedThemeSurfacePreset,
  type SharedThemeTexture,
} from "./shared-themes";

type ThemeSceneStyle = CSSProperties & Record<`--${string}`, string>;

function withAlpha(hex: string, alpha: string): string {
  return hex.startsWith("#") && hex.length === 7 ? `${hex}${alpha}` : hex;
}

function createTextureBackground(texture: SharedThemeTexture): string {
  switch (texture) {
    case "sunrise":
      return "radial-gradient(circle at top left, rgba(255,255,255,0.9), transparent 30%), linear-gradient(140deg, rgba(255,215,182,0.45), transparent 55%)";
    case "grove":
      return "radial-gradient(circle at right 18% top 16%, rgba(217,235,203,0.75), transparent 26%), linear-gradient(160deg, rgba(53,105,79,0.10), transparent 60%)";
    case "paper":
      return "linear-gradient(180deg, rgba(255,255,255,0.65), rgba(255,255,255,0.12)), repeating-linear-gradient(90deg, rgba(43,49,57,0.04) 0, rgba(43,49,57,0.04) 1px, transparent 1px, transparent 22px)";
    case "amber":
      return "radial-gradient(circle at top right, rgba(247,223,182,0.78), transparent 30%), linear-gradient(145deg, rgba(213,140,49,0.18), transparent 56%)";
    case "frost":
      return "radial-gradient(circle at top right, rgba(214,237,245,0.88), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.6), transparent 60%)";
    case "petal":
      return "radial-gradient(circle at left 12% top 18%, rgba(239,215,216,0.92), transparent 28%), linear-gradient(150deg, rgba(203,122,103,0.12), transparent 60%)";
    case "grid":
      return "linear-gradient(180deg, rgba(214,229,255,0.32), transparent 60%), repeating-linear-gradient(0deg, rgba(23,48,79,0.05) 0, rgba(23,48,79,0.05) 1px, transparent 1px, transparent 26px), repeating-linear-gradient(90deg, rgba(23,48,79,0.05) 0, rgba(23,48,79,0.05) 1px, transparent 1px, transparent 26px)";
    case "leaf":
      return "radial-gradient(circle at top left, rgba(217,235,203,0.82), transparent 30%), linear-gradient(135deg, rgba(53,105,79,0.1), transparent 58%)";
    case "galaxy":
      return "radial-gradient(circle at 82% 14%, rgba(219,216,247,0.95), transparent 22%), radial-gradient(circle at 18% 28%, rgba(143,114,217,0.16), transparent 18%), linear-gradient(180deg, rgba(255,255,255,0.35), transparent 70%)";
    case "mist":
    default:
      return "radial-gradient(circle at top right, rgba(215,237,247,0.78), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.55), transparent 60%)";
  }
}

function getShapeTokens(shapePreset: SharedThemeShapePreset) {
  switch (shapePreset) {
    case "editorial-paper":
      return {
        sceneRadius: "18px",
        radiusXl: "14px",
        radiusLg: "10px",
        radiusPill: "12px",
        radiusInput: "10px",
        strokeWeight: "1px",
      };
    case "minimal-panel":
      return {
        sceneRadius: "16px",
        radiusXl: "12px",
        radiusLg: "10px",
        radiusPill: "10px",
        radiusInput: "10px",
        strokeWeight: "1px",
      };
    case "sharp-grid":
      return {
        sceneRadius: "12px",
        radiusXl: "10px",
        radiusLg: "8px",
        radiusPill: "8px",
        radiusInput: "8px",
        strokeWeight: "1.5px",
      };
    case "playful-organic":
      return {
        sceneRadius: "38px",
        radiusXl: "30px",
        radiusLg: "24px",
        radiusPill: "999px",
        radiusInput: "24px",
        strokeWeight: "1px",
      };
    case "frosted-panel":
      return {
        sceneRadius: "26px",
        radiusXl: "22px",
        radiusLg: "18px",
        radiusPill: "16px",
        radiusInput: "18px",
        strokeWeight: "1px",
      };
    case "editorial-soft":
      return {
        sceneRadius: "24px",
        radiusXl: "20px",
        radiusLg: "16px",
        radiusPill: "14px",
        radiusInput: "16px",
        strokeWeight: "1px",
      };
    case "matte-botanical":
      return {
        sceneRadius: "30px",
        radiusXl: "24px",
        radiusLg: "18px",
        radiusPill: "14px",
        radiusInput: "18px",
        strokeWeight: "1px",
      };
    case "neon-panel":
      return {
        sceneRadius: "20px",
        radiusXl: "16px",
        radiusLg: "12px",
        radiusPill: "10px",
        radiusInput: "12px",
        strokeWeight: "1.5px",
      };
    case "soft-glass":
    default:
      return {
        sceneRadius: "34px",
        radiusXl: "28px",
        radiusLg: "22px",
        radiusPill: "999px",
        radiusInput: "16px",
        strokeWeight: "1px",
      };
  }
}

function getSurfaceTokens(surfacePreset: SharedThemeSurfacePreset) {
  switch (surfacePreset) {
    case "paper":
      return {
        surfaceFill: "rgba(255, 252, 247, 0.96)",
        surfaceBorder: "rgba(77, 61, 44, 0.16)",
        surfaceShadow: "0 12px 28px rgba(43, 32, 22, 0.08)",
        heroFill: "linear-gradient(180deg, rgba(255, 251, 247, 0.98), rgba(247, 238, 229, 0.96))",
        panelBlur: "0px",
      };
    case "matte":
      return {
        surfaceFill: "rgba(249, 252, 246, 0.96)",
        surfaceBorder: "rgba(43, 72, 49, 0.14)",
        surfaceShadow: "0 14px 30px rgba(37, 63, 42, 0.08)",
        heroFill: "linear-gradient(180deg, rgba(248, 252, 244, 0.98), rgba(237, 246, 232, 0.94))",
        panelBlur: "0px",
      };
    case "solid":
      return {
        surfaceFill: "rgba(255, 255, 255, 0.98)",
        surfaceBorder: "rgba(30, 40, 51, 0.12)",
        surfaceShadow: "0 18px 42px rgba(17, 24, 39, 0.08)",
        heroFill: "linear-gradient(180deg, rgba(255,255,255,0.99), rgba(244, 247, 251, 0.98))",
        panelBlur: "0px",
      };
    case "frosted":
      return {
        surfaceFill: "rgba(245, 251, 255, 0.78)",
        surfaceBorder: "rgba(74, 112, 126, 0.16)",
        surfaceShadow: "0 22px 48px rgba(58, 103, 119, 0.12)",
        heroFill: "linear-gradient(180deg, rgba(250, 253, 255, 0.86), rgba(236, 246, 252, 0.78))",
        panelBlur: "18px",
      };
    case "neon":
      return {
        surfaceFill: "rgba(248, 246, 255, 0.92)",
        surfaceBorder: "rgba(66, 56, 117, 0.26)",
        surfaceShadow: "0 18px 48px rgba(35, 43, 92, 0.18)",
        heroFill: "linear-gradient(180deg, rgba(249, 247, 255, 0.95), rgba(234, 229, 255, 0.9))",
        panelBlur: "10px",
      };
    case "airy":
    default:
      return {
        surfaceFill: "rgba(255, 250, 243, 0.84)",
        surfaceBorder: "rgba(82, 64, 44, 0.14)",
        surfaceShadow: "0 22px 60px rgba(66, 51, 36, 0.12)",
        heroFill: "linear-gradient(135deg, rgba(255, 249, 241, 0.94), rgba(238, 228, 211, 0.86))",
        panelBlur: "14px",
      };
  }
}

export function getThemeSceneTokens(themePreset: SharedThemePreset) {
  const shape = getShapeTokens(themePreset.shapePreset);
  const surface = getSurfaceTokens(themePreset.surfacePreset);

  return {
    ...shape,
    ...surface,
    shadow: surface.surfaceShadow,
    sceneShadow: surface.surfaceShadow,
  };
}

export function createFamilySceneStyle(
  theme: FamilyTheme,
  themePresetKey: FamilyThemePreset = "ocean-depths",
): ThemeSceneStyle {
  const themePreset = getSharedThemePreset(themePresetKey);
  const tokens = getThemeSceneTokens(themePreset);

  return {
    "--bg": withAlpha(theme.surfaceColor, "F2"),
    "--bg-strong": withAlpha(theme.highlightColor, "F0"),
    "--surface": tokens.surfaceFill,
    "--surface-solid": theme.surfaceColor,
    "--surface-fill": tokens.surfaceFill,
    "--surface-border": tokens.surfaceBorder,
    "--surface-shadow": tokens.surfaceShadow,
    "--hero-fill": tokens.heroFill,
    "--panel-blur": tokens.panelBlur,
    "--border": withAlpha(theme.accentColor, "26"),
    "--accent": theme.accentColor,
    "--accent-strong": theme.accentColor,
    "--warm": theme.warmColor,
    "--font-display": themePreset.fontVar,
    "--font-body": themePreset.fontVar,
    "--radius-xl": tokens.radiusXl,
    "--radius-lg": tokens.radiusLg,
    "--radius-pill": tokens.radiusPill,
    "--radius-input": tokens.radiusInput,
    "--shadow": tokens.shadow,
    "--scene-radius": tokens.sceneRadius,
    "--scene-shadow": tokens.sceneShadow,
    "--stroke-weight": tokens.strokeWeight,
    backgroundImage: `${createTextureBackground(themePreset.texture)}, radial-gradient(circle at left 10% bottom 18%, ${withAlpha(theme.accentColor, "20")}, transparent 28%), linear-gradient(180deg, ${withAlpha(theme.surfaceColor, "F4")} 0%, #fffaf5 100%)`,
  };
}
