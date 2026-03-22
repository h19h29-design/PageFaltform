import type { CSSProperties } from "react";

import type { FamilyTheme } from "@ysplan/tenant";

type ThemeSceneStyle = CSSProperties & Record<`--${string}`, string>;

function withAlpha(hex: string, alpha: string): string {
  return hex.startsWith("#") && hex.length === 7 ? `${hex}${alpha}` : hex;
}

export function createFamilySceneStyle(theme: FamilyTheme): ThemeSceneStyle {
  return {
    "--bg": withAlpha(theme.surfaceColor, "F2"),
    "--bg-strong": withAlpha(theme.highlightColor, "F0"),
    "--surface": withAlpha(theme.surfaceColor, "D8"),
    "--surface-solid": theme.surfaceColor,
    "--border": withAlpha(theme.accentColor, "26"),
    "--accent": theme.accentColor,
    "--accent-strong": theme.accentColor,
    "--warm": theme.warmColor,
    backgroundImage: `radial-gradient(circle at top right, ${withAlpha(theme.highlightColor, "CC")}, transparent 24%), radial-gradient(circle at left 10% bottom 18%, ${withAlpha(theme.accentColor, "20")}, transparent 28%), linear-gradient(180deg, ${withAlpha(theme.surfaceColor, "F4")} 0%, #fffaf5 100%)`,
  };
}
