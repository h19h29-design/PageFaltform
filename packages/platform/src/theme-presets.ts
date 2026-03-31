export type BPageThemePreset =
  | "ocean-depths"
  | "sunset-boulevard"
  | "forest-canopy"
  | "modern-minimalist"
  | "golden-hour"
  | "arctic-frost"
  | "desert-rose"
  | "tech-innovation"
  | "botanical-garden"
  | "midnight-galaxy";

export interface SharedThemeColorSet {
  accentColor: string;
  warmColor: string;
  surfaceColor: string;
  highlightColor: string;
}

export interface BPageThemePresetDefinition {
  key: BPageThemePreset;
  label: string;
  description: string;
  mood: string;
  headingFontVar: string;
  bodyFontVar: string;
  colors: SharedThemeColorSet;
}

export const bPageThemePresets: BPageThemePresetDefinition[] = [
  {
    key: "ocean-depths",
    label: "오션 뎁스",
    description: "차분한 바다빛과 정제된 백색 톤으로 메인 허브를 안정감 있게 정리합니다.",
    mood: "정돈되고 시원한 메인 허브",
    headingFontVar: "var(--font-gowun-batang)",
    bodyFontVar: "var(--font-noto-sans-kr)",
    colors: {
      accentColor: "#275d7a",
      warmColor: "#5fa3c4",
      surfaceColor: "#f6fbff",
      highlightColor: "#d7ecf6",
    },
  },
  {
    key: "sunset-boulevard",
    label: "선셋 블러바드",
    description: "오렌지와 코럴을 중심으로 첫 화면을 밝고 활기 있게 엽니다.",
    mood: "환하고 따뜻한 첫인상",
    headingFontVar: "var(--font-do-hyeon)",
    bodyFontVar: "var(--font-noto-sans-kr)",
    colors: {
      accentColor: "#8b4f39",
      warmColor: "#d47a51",
      surfaceColor: "#fff6ef",
      highlightColor: "#f1d3bc",
    },
  },
  {
    key: "forest-canopy",
    label: "포레스트 캐노피",
    description: "짙은 숲빛과 우드 톤으로 일상형 가족 보드와 커뮤니티 허브를 부드럽게 엮습니다.",
    mood: "생활감 있고 편안한 분위기",
    headingFontVar: "var(--font-gowun-batang)",
    bodyFontVar: "var(--font-ibm-plex-sans-kr)",
    colors: {
      accentColor: "#2f5e4e",
      warmColor: "#b67b49",
      surfaceColor: "#fbfaf4",
      highlightColor: "#dfe8d4",
    },
  },
  {
    key: "modern-minimalist",
    label: "모던 미니멀리스트",
    description: "절제된 회백색과 차분한 포인트로 콘솔과 운영 보드를 담백하게 정리합니다.",
    mood: "제품 같은 운영 화면",
    headingFontVar: "var(--font-ibm-plex-sans-kr)",
    bodyFontVar: "var(--font-noto-sans-kr)",
    colors: {
      accentColor: "#454c56",
      warmColor: "#8fa0b5",
      surfaceColor: "#fbfbfb",
      highlightColor: "#eceff3",
    },
  },
  {
    key: "golden-hour",
    label: "골든 아워",
    description: "골드와 허니 톤을 섞어 가족 초대, 환영 화면, 기록형 홈에 온기를 줍니다.",
    mood: "다정하고 따뜻한 거실",
    headingFontVar: "var(--font-jua)",
    bodyFontVar: "var(--font-noto-sans-kr)",
    colors: {
      accentColor: "#8c6635",
      warmColor: "#d88c4a",
      surfaceColor: "#fff9f0",
      highlightColor: "#f3dfb8",
    },
  },
  {
    key: "arctic-frost",
    label: "아틱 프로스트",
    description: "서늘한 청회색과 밝은 하이라이트로 일정판과 데이터 중심 화면의 집중도를 올립니다.",
    mood: "선명하고 깨끗한 데이터 UI",
    headingFontVar: "var(--font-noto-serif-kr)",
    bodyFontVar: "var(--font-noto-sans-kr)",
    colors: {
      accentColor: "#3d6075",
      warmColor: "#7ea8bd",
      surfaceColor: "#f7fbfd",
      highlightColor: "#d9e8ef",
    },
  },
  {
    key: "desert-rose",
    label: "데저트 로즈",
    description: "로즈와 샌드 조합으로 이야기형 보드와 감성형 아카이브에 잘 어울립니다.",
    mood: "서정적이고 부드러운 기록 화면",
    headingFontVar: "var(--font-gowun-batang)",
    bodyFontVar: "var(--font-noto-sans-kr)",
    colors: {
      accentColor: "#6a3152",
      warmColor: "#c56a7f",
      surfaceColor: "#fff7fb",
      highlightColor: "#f0d9e7",
    },
  },
  {
    key: "tech-innovation",
    label: "테크 이노베이션",
    description: "강한 블루와 시안 포인트로 플랫폼 대시보드와 역동적인 커뮤니티 보드에 맞춥니다.",
    mood: "속도감 있는 플랫폼 화면",
    headingFontVar: "var(--font-do-hyeon)",
    bodyFontVar: "var(--font-ibm-plex-sans-kr)",
    colors: {
      accentColor: "#214aa8",
      warmColor: "#2bc6c4",
      surfaceColor: "#f4f8ff",
      highlightColor: "#d6e1ff",
    },
  },
  {
    key: "botanical-garden",
    label: "보태니컬 가든",
    description: "싱그러운 잎색과 연두 포인트로 루틴, 건강, 자연 활동형 화면에 생기를 줍니다.",
    mood: "산뜻하고 여유 있는 보드",
    headingFontVar: "var(--font-noto-serif-kr)",
    bodyFontVar: "var(--font-noto-sans-kr)",
    colors: {
      accentColor: "#2d7768",
      warmColor: "#7ebc6b",
      surfaceColor: "#f4fffb",
      highlightColor: "#d6f1e8",
    },
  },
  {
    key: "midnight-galaxy",
    label: "미드나잇 갤럭시",
    description: "깊은 남색과 보랏빛 글로우로 브랜드 첫 화면과 클럽 브랜치에 강한 인상을 만듭니다.",
    mood: "밤하늘 같은 강한 브랜드 화면",
    headingFontVar: "var(--font-do-hyeon)",
    bodyFontVar: "var(--font-noto-sans-kr)",
    colors: {
      accentColor: "#28335f",
      warmColor: "#7a88e6",
      surfaceColor: "#f6f7ff",
      highlightColor: "#dfe3ff",
    },
  },
];

export function isBPageThemePreset(value: unknown): value is BPageThemePreset {
  return bPageThemePresets.some((preset) => preset.key === value);
}

export function getBPageThemePreset(key: BPageThemePreset): BPageThemePresetDefinition {
  return bPageThemePresets.find((preset) => preset.key === key) ?? bPageThemePresets[0]!;
}

export function getBPageThemeColors(key: BPageThemePreset): SharedThemeColorSet {
  return { ...getBPageThemePreset(key).colors };
}

export function resolveBPageThemePresetKey(colors: SharedThemeColorSet): BPageThemePreset {
  const normalizedAccent = colors.accentColor.toLowerCase();
  const normalizedWarm = colors.warmColor.toLowerCase();
  const normalizedSurface = colors.surfaceColor.toLowerCase();
  const normalizedHighlight = colors.highlightColor.toLowerCase();

  return (
    bPageThemePresets.find((preset) => {
      const presetColors = preset.colors;
      return (
        presetColors.accentColor.toLowerCase() === normalizedAccent &&
        presetColors.warmColor.toLowerCase() === normalizedWarm &&
        presetColors.surfaceColor.toLowerCase() === normalizedSurface &&
        presetColors.highlightColor.toLowerCase() === normalizedHighlight
      );
    })?.key ?? "ocean-depths"
  );
}
