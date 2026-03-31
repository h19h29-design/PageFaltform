import { coreModules, type ModuleKey } from "@ysplan/modules-core";

export type FamilyModulePageMode = "list" | "detail" | "new" | "edit";

export interface FamilyModuleRouteSpec {
  moduleKey: ModuleKey;
  label: string;
  description: string;
  collectionLabel: string;
  itemLabel: string;
  createLabel: string;
  exampleSlug: string;
  summary: string;
}

type FamilyModuleRouteSeed = Omit<FamilyModuleRouteSpec, "label" | "description">;

const familyModuleRouteSeeds: Record<ModuleKey, FamilyModuleRouteSeed> = {
  announcements: {
    moduleKey: "announcements",
    collectionLabel: "공지 게시판",
    itemLabel: "공지",
    createLabel: "새 공지 작성",
    exampleSlug: "weekly-briefing",
    summary: "긴급 공지, 상단 고정 안내, 읽음 확인 공지를 모읍니다.",
  },
  posts: {
    moduleKey: "posts",
    collectionLabel: "글 게시판",
    itemLabel: "글",
    createLabel: "새 글 작성",
    exampleSlug: "weekend-recap",
    summary: "가이드와 근황, 생활 기록을 쓰기 좋은 일반 글 흐름입니다.",
  },
  gallery: {
    moduleKey: "gallery",
    collectionLabel: "갤러리",
    itemLabel: "앨범",
    createLabel: "새 앨범 만들기",
    exampleSlug: "spring-walk",
    summary: "사진과 짧은 메모를 함께 모아 최근 추억이 먼저 보이게 정리합니다.",
  },
  calendar: {
    moduleKey: "calendar",
    collectionLabel: "가족 일정표",
    itemLabel: "일정",
    createLabel: "새 일정 추가",
    exampleSlug: "school-run",
    summary: "월간 달력과 오늘 일정 목록으로 가족 일정을 빠르게 확인합니다.",
  },
  todo: {
    moduleKey: "todo",
    collectionLabel: "체크리스트",
    itemLabel: "할 일",
    createLabel: "새 할 일 추가",
    exampleSlug: "saturday-reset",
    summary: "지금 할 일, 오늘 할 일, 완료한 일을 체크리스트 형식으로 관리합니다.",
  },
  diary: {
    moduleKey: "diary",
    collectionLabel: "일기장",
    itemLabel: "일기",
    createLabel: "새 일기 작성",
    exampleSlug: "today-note",
    summary: "하루의 감정과 기억을 짧게 남기고 최근 기록과 연결합니다.",
  },
  "school-timetable": {
    moduleKey: "school-timetable",
    collectionLabel: "학교 시간표",
    itemLabel: "시간표",
    createLabel: "시간표 추가",
    exampleSlug: "monday-pack",
    summary: "요일과 교시 중심 표로 시간표와 준비물을 한눈에 봅니다.",
  },
  "day-planner": {
    moduleKey: "day-planner",
    collectionLabel: "하루 플래너",
    itemLabel: "플래너 블록",
    createLabel: "플래너 블록 추가",
    exampleSlug: "morning-flow",
    summary: "오전, 오후, 저녁 흐름을 시간 블록으로 정리하는 계획판입니다.",
  },
  progress: {
    moduleKey: "progress",
    collectionLabel: "목표 보드",
    itemLabel: "목표",
    createLabel: "새 목표 만들기",
    exampleSlug: "reading-goal",
    summary: "진행률과 주간 변화량, 달성률이 크게 보이는 목표 보드입니다.",
  },
  habits: {
    moduleKey: "habits",
    collectionLabel: "루틴 보드",
    itemLabel: "루틴",
    createLabel: "새 루틴 만들기",
    exampleSlug: "morning-routine",
    summary: "반복 습관과 실천 횟수를 루틴 카드로 관리합니다.",
  },
};

function normalizeOrderedModuleKeys(moduleKeys?: readonly ModuleKey[]): ModuleKey[] {
  const orderedKeys = moduleKeys ?? coreModules.map((module) => module.key);
  return Array.from(new Set(orderedKeys));
}

export function getFamilyModuleRouteSpec(moduleKey: string): FamilyModuleRouteSpec | null {
  const moduleDescriptor = coreModules.find((module) => module.key === moduleKey);

  if (!moduleDescriptor) {
    return null;
  }

  const seed = familyModuleRouteSeeds[moduleDescriptor.key];

  return {
    ...seed,
    label: moduleDescriptor.label,
    description: moduleDescriptor.description,
  };
}

export function buildFamilyModuleRouteSpec(moduleKey: string): FamilyModuleRouteSpec | null {
  return getFamilyModuleRouteSpec(moduleKey);
}

export function listFamilyModuleRouteSpecs(moduleKeys?: readonly ModuleKey[]): FamilyModuleRouteSpec[] {
  return normalizeOrderedModuleKeys(moduleKeys)
    .map((moduleKey) => getFamilyModuleRouteSpec(moduleKey))
    .filter((spec): spec is FamilyModuleRouteSpec => Boolean(spec));
}

export function buildFamilyHomeHref(familySlug: string): string {
  return `/app/${familySlug}`;
}

export function buildFamilyEntryHref(familySlug: string): string {
  return `/f/${familySlug}`;
}

export function buildFamilyBuilderHref(familySlug: string): string {
  return `/console/families/${familySlug}`;
}

export function buildFamilyMobilePreviewHref(familySlug: string, screen?: string): string {
  return screen ? `/preview/mobile/${familySlug}?screen=${screen}` : `/preview/mobile/${familySlug}`;
}

export function buildFamilyModuleHref(familySlug: string, moduleKey: ModuleKey): string {
  return `/app/${familySlug}/${moduleKey}`;
}

export function buildFamilyModuleNewHref(familySlug: string, moduleKey: ModuleKey): string {
  return `${buildFamilyModuleHref(familySlug, moduleKey)}/new`;
}

export function buildFamilyModuleDetailHref(
  familySlug: string,
  moduleKey: ModuleKey,
  itemSlug: string,
): string {
  return `${buildFamilyModuleHref(familySlug, moduleKey)}/${itemSlug}`;
}

export function buildFamilyModuleEditHref(
  familySlug: string,
  moduleKey: ModuleKey,
  itemSlug: string,
): string {
  return `${buildFamilyModuleDetailHref(familySlug, moduleKey, itemSlug)}/edit`;
}

export function getFamilyModuleExampleSlug(moduleKey: ModuleKey): string {
  return familyModuleRouteSeeds[moduleKey].exampleSlug;
}

export function formatModuleItemName(itemSlug: string): string {
  return itemSlug
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function getModulePageTitle(
  spec: FamilyModuleRouteSpec,
  mode: FamilyModulePageMode,
  itemSlug?: string,
): string {
  switch (mode) {
    case "list":
      return spec.collectionLabel;
    case "detail":
      return itemSlug ? formatModuleItemName(itemSlug) : `${spec.label} 상세`;
    case "new":
      return spec.createLabel;
    case "edit":
      return itemSlug ? `${formatModuleItemName(itemSlug)} 수정` : `${spec.itemLabel} 수정`;
    default:
      return spec.label;
  }
}
