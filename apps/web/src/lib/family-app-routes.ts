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
    collectionLabel: "공지 목록",
    itemLabel: "공지",
    createLabel: "새 공지 작성",
    exampleSlug: "weekly-briefing",
    summary: "고정 공지, 긴급 알림, 가족 공용 안내를 확인합니다.",
  },
  posts: {
    moduleKey: "posts",
    collectionLabel: "글 목록",
    itemLabel: "글",
    createLabel: "새 글 작성",
    exampleSlug: "weekend-recap",
    summary: "긴 글, 가이드, 가족 메모를 남깁니다.",
  },
  gallery: {
    moduleKey: "gallery",
    collectionLabel: "사진첩 목록",
    itemLabel: "앨범",
    createLabel: "새 앨범 만들기",
    exampleSlug: "spring-walk",
    summary: "사진 앨범과 추억 중심 기록을 관리합니다.",
  },
  calendar: {
    moduleKey: "calendar",
    collectionLabel: "일정 목록",
    itemLabel: "일정",
    createLabel: "새 일정 추가",
    exampleSlug: "school-run",
    summary: "가족 일정과 시간 흐름을 함께 정리합니다.",
  },
  todo: {
    moduleKey: "todo",
    collectionLabel: "체크리스트 목록",
    itemLabel: "할 일",
    createLabel: "새 할 일 추가",
    exampleSlug: "saturday-reset",
    summary: "할 일, 집안일, 마감 체크를 관리합니다.",
  },
  diary: {
    moduleKey: "diary",
    collectionLabel: "일기 목록",
    itemLabel: "일기",
    createLabel: "새 일기 작성",
    exampleSlug: "today-note",
    summary: "짧은 하루 기록과 가족 일지를 남깁니다.",
  },
  "school-timetable": {
    moduleKey: "school-timetable",
    collectionLabel: "시간표 목록",
    itemLabel: "시간표",
    createLabel: "새 시간표 추가",
    exampleSlug: "monday-pack",
    summary: "학교와 학원 동선, 준비 메모를 관리합니다.",
  },
  "day-planner": {
    moduleKey: "day-planner",
    collectionLabel: "데이 플래너 목록",
    itemLabel: "플래너 블록",
    createLabel: "새 플래너 추가",
    exampleSlug: "morning-flow",
    summary: "하루 블록과 시간 단위 계획을 정리합니다.",
  },
  progress: {
    moduleKey: "progress",
    collectionLabel: "목표 목록",
    itemLabel: "목표",
    createLabel: "새 목표 만들기",
    exampleSlug: "reading-goal",
    summary: "공동 목표와 진행률, 마일스톤을 추적합니다.",
  },
  habits: {
    moduleKey: "habits",
    collectionLabel: "습관 목록",
    itemLabel: "습관",
    createLabel: "새 습관 만들기",
    exampleSlug: "morning-routine",
    summary: "반복 루틴과 연속 체크 흐름을 관리합니다.",
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
