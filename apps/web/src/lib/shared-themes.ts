import type { FamilyThemePreset } from "@ysplan/platform";
import type { FamilyTheme } from "@ysplan/tenant";

export type SharedThemeTexture =
  | "mist"
  | "sunrise"
  | "grove"
  | "paper"
  | "amber"
  | "frost"
  | "petal"
  | "grid"
  | "leaf"
  | "galaxy";

export type SharedThemeShapePreset =
  | "soft-glass"
  | "editorial-paper"
  | "matte-botanical"
  | "minimal-panel"
  | "playful-organic"
  | "frosted-panel"
  | "editorial-soft"
  | "sharp-grid"
  | "neon-panel";

export type SharedThemeSurfacePreset =
  | "airy"
  | "paper"
  | "matte"
  | "frosted"
  | "solid"
  | "neon";

export interface SharedThemePreset {
  key: FamilyThemePreset;
  label: string;
  description: string;
  mood: string;
  familyTheme: FamilyTheme;
  fontVar: string;
  displayFontVar: string;
  bodyFontVar: string;
  texture: SharedThemeTexture;
  shapePreset: SharedThemeShapePreset;
  surfacePreset: SharedThemeSurfacePreset;
}

const sharedThemePresetSeed: Array<Omit<SharedThemePreset, "displayFontVar" | "bodyFontVar">> = [
  {
    key: "ocean-depths",
    label: "오션 뎁스",
    description: "잔잔한 물빛과 유리 질감이 어울리는 차분한 홈.",
    mood: "시원하고 정돈된 메인 보드",
    familyTheme: {
      accentColor: "#215a6d",
      warmColor: "#d67e49",
      surfaceColor: "#f3fbff",
      highlightColor: "#d7edf7",
    },
    fontVar: "var(--font-ibm-plex-sans-kr)",
    texture: "mist",
    shapePreset: "soft-glass",
    surfacePreset: "airy",
  },
  {
    key: "sunset-boulevard",
    label: "선셋 불르바르",
    description: "따뜻한 종이 톤으로 기록과 공지를 부드럽게 보여주는 홈.",
    mood: "편안한 가족 기록 보드",
    familyTheme: {
      accentColor: "#8c4c3d",
      warmColor: "#d96f48",
      surfaceColor: "#fff6ef",
      highlightColor: "#f4cfb8",
    },
    fontVar: "var(--font-noto-serif-kr)",
    texture: "sunrise",
    shapePreset: "editorial-paper",
    surfacePreset: "paper",
  },
  {
    key: "forest-canopy",
    label: "포레스트 캐노피",
    description: "자연스러운 녹색과 무광 질감으로 생활 기록을 편하게 묶는 홈.",
    mood: "잔잔하고 초록빛 도는 생활 공간",
    familyTheme: {
      accentColor: "#315b3f",
      warmColor: "#b96d41",
      surfaceColor: "#f6fbf4",
      highlightColor: "#dcebd7",
    },
    fontVar: "var(--font-gowun-batang)",
    texture: "grove",
    shapePreset: "matte-botanical",
    surfacePreset: "matte",
  },
  {
    key: "modern-minimalist",
    label: "모던 미니멀",
    description: "정보 밀도가 높은 운영 화면에 잘 맞는 절제된 패널형 테마.",
    mood: "차갑고 깔끔한 운영 보드",
    familyTheme: {
      accentColor: "#2b3139",
      warmColor: "#7b8691",
      surfaceColor: "#fbfbfb",
      highlightColor: "#e8eaee",
    },
    fontVar: "var(--font-ibm-plex-sans-kr)",
    texture: "paper",
    shapePreset: "minimal-panel",
    surfacePreset: "solid",
  },
  {
    key: "golden-hour",
    label: "골든 아워",
    description: "가볍고 둥근 카드보다 손맛 있는 노트 분위기를 살리는 테마.",
    mood: "밝고 다정한 일상 보드",
    familyTheme: {
      accentColor: "#7f5a2b",
      warmColor: "#d58c31",
      surfaceColor: "#fff8ee",
      highlightColor: "#f7dfb6",
    },
    fontVar: "var(--font-jua)",
    texture: "amber",
    shapePreset: "playful-organic",
    surfacePreset: "airy",
  },
  {
    key: "arctic-frost",
    label: "아틱 프로스트",
    description: "차갑고 맑은 반투명 패널로 일정과 체크 흐름을 또렷하게 보여주는 테마.",
    mood: "투명하고 시원한 실사용 보드",
    familyTheme: {
      accentColor: "#3a6777",
      warmColor: "#7cb9d0",
      surfaceColor: "#f4fbff",
      highlightColor: "#d6edf5",
    },
    fontVar: "var(--font-ibm-plex-sans-kr)",
    texture: "frost",
    shapePreset: "frosted-panel",
    surfacePreset: "frosted",
  },
  {
    key: "desert-rose",
    label: "데저트 로즈",
    description: "글과 사진, 일기 화면에 감성을 주는 부드러운 에디토리얼 테마.",
    mood: "잔향이 남는 기록 공간",
    familyTheme: {
      accentColor: "#8d5460",
      warmColor: "#cb7a67",
      surfaceColor: "#fff7f5",
      highlightColor: "#efd7d8",
    },
    fontVar: "var(--font-gowun-batang)",
    texture: "petal",
    shapePreset: "editorial-soft",
    surfacePreset: "paper",
  },
  {
    key: "tech-innovation",
    label: "테크 이노베이션",
    description: "직선형 패널과 강한 대비가 살아 있는 대시보드용 테마.",
    mood: "선명하고 속도감 있는 운영 화면",
    familyTheme: {
      accentColor: "#17304f",
      warmColor: "#2fbad8",
      surfaceColor: "#f5f9ff",
      highlightColor: "#d6e5ff",
    },
    fontVar: "var(--font-do-hyeon)",
    texture: "grid",
    shapePreset: "sharp-grid",
    surfacePreset: "solid",
  },
  {
    key: "botanical-garden",
    label: "보태니컬 가든",
    description: "건강, 루틴, 생활 기록을 느긋한 표면감으로 묶는 유기적 테마.",
    mood: "자연스럽고 숨쉬는 일상 홈",
    familyTheme: {
      accentColor: "#35694f",
      warmColor: "#bf6d48",
      surfaceColor: "#f8fbf4",
      highlightColor: "#d9ebcb",
    },
    fontVar: "var(--font-noto-serif-kr)",
    texture: "leaf",
    shapePreset: "matte-botanical",
    surfacePreset: "matte",
  },
  {
    key: "midnight-galaxy",
    label: "미드나잇 갤럭시",
    description: "야간 이벤트나 클럽 공간에 어울리는 선명한 네온 패널 테마.",
    mood: "강한 대비와 인상적인 밤색 화면",
    familyTheme: {
      accentColor: "#232b5c",
      warmColor: "#8f72d9",
      surfaceColor: "#f5f4ff",
      highlightColor: "#dbd8f7",
    },
    fontVar: "var(--font-do-hyeon)",
    texture: "galaxy",
    shapePreset: "neon-panel",
    surfacePreset: "neon",
  },
];

export const sharedThemePresets: SharedThemePreset[] = sharedThemePresetSeed.map((theme) => ({
  ...theme,
  displayFontVar: theme.fontVar,
  bodyFontVar: theme.fontVar,
}));

export const familyThemePresetOptions = sharedThemePresets.map((theme) => ({
  key: theme.key,
  label: theme.label,
  description: theme.description,
  theme: theme.familyTheme,
}));

export function getSharedThemePreset(key: FamilyThemePreset): SharedThemePreset {
  return sharedThemePresets.find((theme) => theme.key === key) ?? sharedThemePresets[0]!;
}
