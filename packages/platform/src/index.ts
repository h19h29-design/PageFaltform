import { coreModules, type ModuleKey } from "@ysplan/modules-core";

export type PlatformPlan = "starter" | "family-plus" | "custom";

export interface PlatformFeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
}

export type PlatformOperatorSettingArea =
  | "identity"
  | "access"
  | "builder"
  | "domain"
  | "storage"
  | "operations"
  | "deployment";

export type PlatformOperatorSettingScope = "family" | "platform" | "secret" | "infrastructure";

export type PlatformOperatorSettingStatus = "active" | "next";

export interface PlatformOperatorSettingDescriptor {
  key: string;
  area: PlatformOperatorSettingArea;
  scope: PlatformOperatorSettingScope;
  status: PlatformOperatorSettingStatus;
  label: string;
  description: string;
  currentSource: "tenant-record" | "workspace-draft" | "file-store" | "env" | "infra";
  nextSource?: "database" | "domain-service" | "secret-store" | "deploy-config";
}

export type PlatformChecklistArea = "db-migration" | "lan-ops" | "deploy";

export interface PlatformChecklistItem {
  key: string;
  area: PlatformChecklistArea;
  label: string;
  description: string;
  owner: "platform" | "tenant" | "infra" | "tests";
}

export interface CustomDomainRequest {
  hostname: string;
  verified: boolean;
  familySlug?: string;
}

export type FamilyHomePreset = "balanced" | "planner" | "story";

export type FamilyEntryPreset = "guided" | "direct";

export interface FamilyPresetOption<TPreset extends string> {
  key: TPreset;
  label: string;
  description: string;
}

export interface FamilyWorkspaceDraft {
  familySlug: string;
  enabledModules: ModuleKey[];
  homePreset: FamilyHomePreset;
  entryPreset: FamilyEntryPreset;
  updatedAt: string;
}

export interface FamilyWorkspaceStore {
  version: 1;
  families: Record<string, FamilyWorkspaceDraft>;
}

export const defaultPlatformFlags: PlatformFeatureFlag[] = [
  {
    key: "custom-domain",
    enabled: false,
    description: "Enable per-tenant custom domain connection."
  },
  {
    key: "module-marketplace",
    enabled: false,
    description: "Allow future tenants to self-enable optional modules."
  },
  {
    key: "platform-analytics",
    enabled: false,
    description: "Expose cross-tenant operational dashboards."
  }
];

export const platformOperatorSettingCatalog: PlatformOperatorSettingDescriptor[] = [
  {
    key: "family-name",
    area: "identity",
    scope: "family",
    status: "active",
    label: "가족 홈 이름",
    description: "콘솔과 가족 홈 전체에서 보이는 대표 이름입니다.",
    currentSource: "tenant-record",
    nextSource: "database"
  },
  {
    key: "family-slug",
    area: "identity",
    scope: "family",
    status: "active",
    label: "가족 홈 주소 슬러그",
    description: "내부망 주소와 향후 커스텀 도메인 연결의 기준이 되는 식별자입니다.",
    currentSource: "tenant-record",
    nextSource: "database"
  },
  {
    key: "tagline",
    area: "identity",
    scope: "family",
    status: "active",
    label: "한 줄 설명",
    description: "공개 랜딩과 홈 상단에서 보이는 요약 설명입니다.",
    currentSource: "tenant-record",
    nextSource: "database"
  },
  {
    key: "welcome-message",
    area: "identity",
    scope: "family",
    status: "active",
    label: "환영 문구",
    description: "입구와 홈에서 보이는 첫 인사 문구입니다.",
    currentSource: "tenant-record",
    nextSource: "database"
  },
  {
    key: "hero-summary",
    area: "identity",
    scope: "family",
    status: "active",
    label: "홈 소개 문구",
    description: "가족 홈의 성격과 사용 장면을 설명하는 본문입니다.",
    currentSource: "tenant-record",
    nextSource: "database"
  },
  {
    key: "household-mood",
    area: "identity",
    scope: "family",
    status: "active",
    label: "가족 무드",
    description: "홈 하이라이트와 프리셋 설명에 반영되는 분위기 값입니다.",
    currentSource: "tenant-record",
    nextSource: "database"
  },
  {
    key: "member-count",
    area: "operations",
    scope: "family",
    status: "active",
    label: "가족 인원 수",
    description: "가족 규모와 기본 운영 감각을 표현하는 운영 값입니다.",
    currentSource: "tenant-record",
    nextSource: "database"
  },
  {
    key: "timezone",
    area: "operations",
    scope: "family",
    status: "active",
    label: "타임존",
    description: "일정과 날짜 관련 모듈의 기준 시간대입니다.",
    currentSource: "tenant-record",
    nextSource: "database"
  },
  {
    key: "access-mode",
    area: "access",
    scope: "family",
    status: "active",
    label: "입장 방식",
    description: "가족 비밀번호 또는 입장 코드 흐름을 결정합니다.",
    currentSource: "tenant-record",
    nextSource: "database"
  },
  {
    key: "access-secret",
    area: "access",
    scope: "secret",
    status: "active",
    label: "입장 비밀값",
    description: "현재는 파일 저장에 포함되지만, 다음 단계에서는 별도 비밀 저장소가 더 적합합니다.",
    currentSource: "file-store",
    nextSource: "secret-store"
  },
  {
    key: "entry-preset",
    area: "builder",
    scope: "family",
    status: "active",
    label: "입장 프리셋",
    description: "입구에서 안내형과 바로 입장 흐름 중 무엇을 쓸지 정합니다.",
    currentSource: "workspace-draft",
    nextSource: "database"
  },
  {
    key: "home-preset",
    area: "builder",
    scope: "family",
    status: "active",
    label: "홈 프리셋",
    description: "가족 홈 첫 화면을 균형형, 플래너형, 기록형 중 무엇으로 보여 줄지 정합니다.",
    currentSource: "workspace-draft",
    nextSource: "database"
  },
  {
    key: "enabled-modules",
    area: "builder",
    scope: "family",
    status: "active",
    label: "활성 모듈",
    description: "홈과 입구에서 쓸 모듈 조합을 결정합니다.",
    currentSource: "workspace-draft",
    nextSource: "database"
  },
  {
    key: "module-order",
    area: "builder",
    scope: "family",
    status: "active",
    label: "모듈 순서",
    description: "홈 노출 우선순위와 안내 문구 정렬에 쓰이는 순서입니다.",
    currentSource: "workspace-draft",
    nextSource: "database"
  },
  {
    key: "theme-preset",
    area: "builder",
    scope: "family",
    status: "active",
    label: "테마 프리셋",
    description: "현재는 선택형 프리셋으로 테마를 적용하고, 이후 상세 색상 편집으로 확장할 수 있습니다.",
    currentSource: "tenant-record",
    nextSource: "database"
  },
  {
    key: "custom-domains",
    area: "domain",
    scope: "family",
    status: "next",
    label: "커스텀 도메인",
    description: "향후 각 가족 홈마다 별도 도메인을 연결할 때 관리할 값입니다.",
    currentSource: "tenant-record",
    nextSource: "domain-service"
  },
  {
    key: "storage-backend",
    area: "storage",
    scope: "platform",
    status: "active",
    label: "저장 백엔드",
    description: "현재 파일 저장인지, 이후 DB 저장인지 운영자가 확인해야 할 플랫폼 상태입니다.",
    currentSource: "file-store",
    nextSource: "deploy-config"
  },
  {
    key: "database-url",
    area: "storage",
    scope: "secret",
    status: "next",
    label: "데이터베이스 연결",
    description: "DB 전환 이후에는 애플리케이션과 마이그레이션이 함께 참조할 연결 값입니다.",
    currentSource: "env",
    nextSource: "secret-store"
  },
  {
    key: "lan-base-url",
    area: "operations",
    scope: "infrastructure",
    status: "active",
    label: "내부망 기본 주소",
    description: "같은 네트워크 기기들이 접속할 대표 주소와 포트입니다.",
    currentSource: "infra",
    nextSource: "deploy-config"
  },
  {
    key: "health-endpoint",
    area: "deployment",
    scope: "platform",
    status: "active",
    label: "헬스체크 엔드포인트",
    description: "운영 중 앱 기동 여부를 확인하는 `/api/health` 기준입니다.",
    currentSource: "infra",
    nextSource: "deploy-config"
  }
];

export const dbMigrationChecklist: PlatformChecklistItem[] = [
  {
    key: "map-file-records-to-db",
    area: "db-migration",
    label: "파일 저장 필드와 DB 스키마 매핑 표 만들기",
    description: "현재 `FamilyTenantRecord`, `workspaceDraft`, 액세스 정책, 테마 프리셋이 어느 테이블에 들어갈지 먼저 고정합니다.",
    owner: "platform"
  },
  {
    key: "separate-secret-storage",
    area: "db-migration",
    label: "입장 비밀값 저장 위치 분리",
    description: "현재 평문 파일 저장인 `accessSecret`은 해시 저장 또는 별도 비밀 저장소로 분리해야 합니다.",
    owner: "platform"
  },
  {
    key: "dual-read-strategy",
    area: "db-migration",
    label: "파일/DB 이중 읽기 전략 결정",
    description: "전환 기간 동안 demo fixture, 파일 저장, DB 저장을 어떤 우선순위로 읽을지 정해야 합니다.",
    owner: "platform"
  },
  {
    key: "seed-and-backfill",
    area: "db-migration",
    label: "기존 파일 데이터 백필 스크립트 준비",
    description: "기존 `family-sites.json` 데이터를 DB에 적재할 시드 또는 마이그레이션 스크립트가 필요합니다.",
    owner: "platform"
  },
  {
    key: "transaction-boundaries",
    area: "db-migration",
    label: "가족 생성과 빌더 저장의 트랜잭션 경계 정의",
    description: "가족 기본 정보, 액세스 정책, 모듈 순서 저장을 어떤 단위로 묶을지 먼저 정해야 합니다.",
    owner: "tenant"
  },
  {
    key: "readiness-tests",
    area: "db-migration",
    label: "저장 전환 회귀 테스트 추가",
    description: "생성, 수정, 초기화, 내부망 조회 시나리오가 파일 저장과 같은 결과를 내는지 자동화해야 합니다.",
    owner: "tests"
  }
];

export const lanOperationsChecklist: PlatformChecklistItem[] = [
  {
    key: "fixed-lan-host",
    area: "lan-ops",
    label: "고정 내부망 주소 또는 접근 경로 합의",
    description: "운영자가 북마크할 대표 LAN 주소와 포트를 문서화하고, 네트워크가 바뀌면 갱신 절차를 둡니다.",
    owner: "infra"
  },
  {
    key: "owner-session-flow",
    area: "lan-ops",
    label: "운영자 로그인과 가족 입구 경로 분리 유지",
    description: "가족 입구 `/f/*`와 콘솔 `/console` 흐름을 서로 분리된 운영 기준으로 유지합니다.",
    owner: "platform"
  },
  {
    key: "shared-data-path",
    area: "lan-ops",
    label: "공유 저장 경로와 백업 절차 정의",
    description: "파일 저장을 유지하는 동안에는 데이터 파일 경로와 백업 주기를 명확히 둬야 합니다.",
    owner: "infra"
  },
  {
    key: "health-check-routine",
    area: "lan-ops",
    label: "헬스체크와 기본 접속 점검 루틴",
    description: "앱 시작 후 `/api/health`, `/`, `/console`, 샘플 가족 홈 경로를 묶어 점검합니다.",
    owner: "tests"
  }
];

export const deploymentReadinessChecklist: PlatformChecklistItem[] = [
  {
    key: "env-contract",
    area: "deploy",
    label: "환경변수 계약 확정",
    description: "내부망 전용 실행과 외부 배포 준비에서 필요한 환경변수 이름과 기본값을 정리합니다.",
    owner: "infra"
  },
  {
    key: "storage-switch",
    area: "deploy",
    label: "저장 백엔드 전환 기준 준비",
    description: "파일 저장과 DB 저장 중 무엇을 쓰는지 배포 환경에서 명시적으로 구분해야 합니다.",
    owner: "platform"
  },
  {
    key: "domain-routing",
    area: "deploy",
    label: "기본 도메인과 향후 커스텀 도메인 라우팅 분리",
    description: "배포 환경에서 기본 호스트와 가족별 호스트 매핑 방식을 분리해 두는 것이 좋습니다.",
    owner: "infra"
  },
  {
    key: "smoke-suite",
    area: "deploy",
    label: "배포 후 스모크 테스트 묶음 준비",
    description: "공개 홈, 가족 입구, 콘솔 로그인, 가족 생성, 빌더 저장, 헬스체크를 배포 후 바로 확인할 수 있어야 합니다.",
    owner: "tests"
  }
];

export const familyHomePresetOptions: Array<FamilyPresetOption<FamilyHomePreset>> = [
  {
    key: "balanced",
    label: "균형형 홈",
    description: "중요 공지와 오늘 일정, 최근 기록을 고르게 배치합니다."
  },
  {
    key: "planner",
    label: "플래너형 홈",
    description: "오늘 해야 할 일과 일정 카드를 먼저 보여 주는 실행 중심 구성입니다."
  },
  {
    key: "story",
    label: "기록형 홈",
    description: "사진, 글, 추억 카드를 더 자연스럽게 이어 붙이는 구성입니다."
  }
];

export const familyEntryPresetOptions: Array<FamilyPresetOption<FamilyEntryPreset>> = [
  {
    key: "guided",
    label: "안내형 입장",
    description: "가족 분위기와 모듈 구성을 먼저 보여 준 뒤 입장 확인을 받습니다."
  },
  {
    key: "direct",
    label: "바로 입장",
    description: "입장 페이지에서 곧바로 비밀번호나 코드를 확인하는 빠른 흐름입니다."
  }
];

const knownModuleKeys = new Set<ModuleKey>(coreModules.map((module) => module.key));

export function isKnownModuleKey(value: string): value is ModuleKey {
  return knownModuleKeys.has(value as ModuleKey);
}

export function normalizeModuleKeys(moduleKeys: readonly string[]): ModuleKey[] {
  const orderedKeys: ModuleKey[] = [];
  const seenKeys = new Set<ModuleKey>();

  for (const moduleKey of moduleKeys) {
    if (!isKnownModuleKey(moduleKey) || seenKeys.has(moduleKey)) {
      continue;
    }

    seenKeys.add(moduleKey);
    orderedKeys.push(moduleKey);
  }

  return orderedKeys;
}

export function createDefaultFamilyWorkspace(
  familySlug: string,
  enabledModules: readonly ModuleKey[],
  now = new Date(),
): FamilyWorkspaceDraft {
  return {
    familySlug,
    enabledModules: normalizeModuleKeys(enabledModules),
    homePreset: "balanced",
    entryPreset: "guided",
    updatedAt: now.toISOString()
  };
}

export function resolveFamilyWorkspace(input: {
  familySlug: string;
  defaultModules: readonly ModuleKey[];
  override?: (Omit<Partial<FamilyWorkspaceDraft>, "enabledModules"> & { enabledModules?: readonly string[] }) | null;
  now?: Date;
}): FamilyWorkspaceDraft {
  const baseDraft = createDefaultFamilyWorkspace(input.familySlug, input.defaultModules, input.now);
  const override = input.override;

  if (!override || override.familySlug !== input.familySlug) {
    return baseDraft;
  }

  const enabledModules = normalizeModuleKeys(override.enabledModules ?? baseDraft.enabledModules);

  return {
    familySlug: input.familySlug,
    enabledModules: enabledModules.length > 0 ? enabledModules : baseDraft.enabledModules,
    homePreset:
      override.homePreset === "planner" || override.homePreset === "story"
        ? override.homePreset
        : baseDraft.homePreset,
    entryPreset: override.entryPreset === "direct" ? "direct" : baseDraft.entryPreset,
    updatedAt: override.updatedAt ?? baseDraft.updatedAt
  };
}

export function getFamilyHomePresetOption(preset: FamilyHomePreset): FamilyPresetOption<FamilyHomePreset> {
  return familyHomePresetOptions.find((option) => option.key === preset) ?? familyHomePresetOptions[0]!;
}

export function getFamilyEntryPresetOption(
  preset: FamilyEntryPreset,
): FamilyPresetOption<FamilyEntryPreset> {
  return familyEntryPresetOptions.find((option) => option.key === preset) ?? familyEntryPresetOptions[0]!;
}

export function listPlatformOperatorSettingsByArea(
  area: PlatformOperatorSettingArea,
): PlatformOperatorSettingDescriptor[] {
  return platformOperatorSettingCatalog.filter((setting) => setting.area === area);
}
