import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isConsoleManagerRole } from "@ysplan/auth";
import { normalizeModuleKeys, resolveFamilyWorkspace, } from "@ysplan/platform";
import { cloneFamilyTenantRecord, getModuleDescriptors, listFamilyRecords, toFamilyPublicPreview, } from "@ysplan/tenant";
export const familyThemePresetOptions = [
    {
        key: "garden",
        label: "가든 톤",
        description: "차분한 그린과 온화한 오렌지 조합입니다.",
        theme: {
            accentColor: "#2f5e4e",
            warmColor: "#c26d4e",
            surfaceColor: "#fff9f1",
            highlightColor: "#ead7bd",
        },
    },
    {
        key: "sunset",
        label: "선셋 톤",
        description: "살짝 따뜻한 보드 계열로 홈을 밝게 보여 줍니다.",
        theme: {
            accentColor: "#8b4f39",
            warmColor: "#d47a51",
            surfaceColor: "#fff6ef",
            highlightColor: "#f1d3bc",
        },
    },
    {
        key: "sky",
        label: "스카이 톤",
        description: "청량한 블루 계열로 깔끔한 가족 보드를 만듭니다.",
        theme: {
            accentColor: "#2c5d79",
            warmColor: "#c86d47",
            surfaceColor: "#f5fbff",
            highlightColor: "#cfe4f1",
        },
    },
];
const familySiteStorePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../data/family-sites.json");
function createFamilySiteStoreMetadata(lastWriteAt = null) {
    return {
        backend: "file",
        migrationTarget: "postgres",
        lastWriteAt,
    };
}
function createEmptyFamilySiteStore() {
    return {
        version: 2,
        metadata: createFamilySiteStoreMetadata(),
        customFamilies: [],
        workspaceDrafts: {},
    };
}
async function ensureFamilySiteStore() {
    await mkdir(path.dirname(familySiteStorePath), { recursive: true });
    try {
        await readFile(familySiteStorePath, "utf8");
    }
    catch {
        await writeFile(familySiteStorePath, `${JSON.stringify(createEmptyFamilySiteStore(), null, 2)}\n`, "utf8");
    }
}
function sanitizeStoredCustomFamily(family) {
    return {
        ...cloneFamilyTenantRecord(family),
        ownerUserId: family.ownerUserId,
        createdAt: family.createdAt,
        updatedAt: family.updatedAt,
    };
}
function cloneWorkspaceDraft(draft) {
    return {
        familySlug: draft.familySlug,
        enabledModules: [...draft.enabledModules],
        homePreset: draft.homePreset,
        entryPreset: draft.entryPreset,
        updatedAt: draft.updatedAt,
    };
}
function createStoredWorkspaceDraftEntry(draft, savedFrom, savedAt = draft.updatedAt) {
    return {
        draft: cloneWorkspaceDraft(draft),
        savedAt,
        savedFrom,
    };
}
function isRecord(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function sanitizeWorkspaceDraft(value, fallbackFamilySlug) {
    if (!isRecord(value)) {
        return null;
    }
    const familySlugCandidate = typeof value.familySlug === "string" && value.familySlug.trim().length > 0
        ? value.familySlug.trim().toLowerCase()
        : fallbackFamilySlug;
    return {
        familySlug: familySlugCandidate,
        enabledModules: normalizeModuleKeys(Array.isArray(value.enabledModules)
            ? value.enabledModules.filter((moduleKey) => typeof moduleKey === "string")
            : []),
        homePreset: value.homePreset === "planner" || value.homePreset === "story" ? value.homePreset : "balanced",
        entryPreset: value.entryPreset === "direct" ? "direct" : "guided",
        updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date(0).toISOString(),
    };
}
function sanitizeStoredWorkspaceDraftEntry(value, familySlug) {
    if (isRecord(value) && "draft" in value) {
        const draft = sanitizeWorkspaceDraft(value.draft, familySlug);
        if (!draft) {
            return null;
        }
        return {
            draft,
            savedAt: typeof value.savedAt === "string" ? value.savedAt : draft.updatedAt,
            savedFrom: value.savedFrom === "create-family" || value.savedFrom === "builder-save"
                ? value.savedFrom
                : "legacy-file",
        };
    }
    const legacyDraft = sanitizeWorkspaceDraft(value, familySlug);
    return legacyDraft ? createStoredWorkspaceDraftEntry(legacyDraft, "legacy-file", legacyDraft.updatedAt) : null;
}
function sanitizeWorkspaceDraftMap(workspaceDrafts) {
    return Object.fromEntries(Object.entries(workspaceDrafts)
        .map(([familySlug, draft]) => {
        const sanitizedDraft = sanitizeStoredWorkspaceDraftEntry(draft, familySlug);
        return sanitizedDraft ? [familySlug, sanitizedDraft] : null;
    })
        .filter((entry) => Boolean(entry)));
}
function sanitizeFamilySiteStoreMetadata(metadata) {
    if (!isRecord(metadata)) {
        return createFamilySiteStoreMetadata();
    }
    return {
        backend: "file",
        migrationTarget: "postgres",
        lastWriteAt: typeof metadata.lastWriteAt === "string" ? metadata.lastWriteAt : null,
    };
}
async function writeFamilySiteStore(store) {
    await ensureFamilySiteStore();
    const writtenAt = new Date().toISOString();
    const normalizedStore = {
        version: 2,
        metadata: {
            ...sanitizeFamilySiteStoreMetadata(store.metadata),
            lastWriteAt: writtenAt,
        },
        customFamilies: store.customFamilies.map(sanitizeStoredCustomFamily),
        workspaceDrafts: sanitizeWorkspaceDraftMap(store.workspaceDrafts),
    };
    await writeFile(familySiteStorePath, `${JSON.stringify(normalizedStore, null, 2)}\n`, "utf8");
}
export async function readFamilySiteStore() {
    await ensureFamilySiteStore();
    const raw = await readFile(familySiteStorePath, "utf8");
    try {
        const parsed = JSON.parse(raw);
        if (!parsed ||
            !("version" in parsed) ||
            !Array.isArray(parsed.customFamilies) ||
            !parsed.workspaceDrafts ||
            !isRecord(parsed.workspaceDrafts)) {
            return createEmptyFamilySiteStore();
        }
        if (parsed.version === 1) {
            return {
                version: 2,
                metadata: createFamilySiteStoreMetadata(),
                customFamilies: parsed.customFamilies.map(sanitizeStoredCustomFamily),
                workspaceDrafts: sanitizeWorkspaceDraftMap(parsed.workspaceDrafts),
            };
        }
        if (parsed.version !== 2) {
            return createEmptyFamilySiteStore();
        }
        return {
            version: 2,
            metadata: sanitizeFamilySiteStoreMetadata(parsed.metadata),
            customFamilies: parsed.customFamilies.map(sanitizeStoredCustomFamily),
            workspaceDrafts: sanitizeWorkspaceDraftMap(parsed.workspaceDrafts),
        };
    }
    catch {
        return createEmptyFamilySiteStore();
    }
}
function toRuntimeFamily(family) {
    return {
        ...cloneFamilyTenantRecord(family),
        source: "demo",
    };
}
function toRuntimeCustomFamily(family) {
    return {
        ...sanitizeStoredCustomFamily(family),
        source: "custom",
    };
}
function normalizeSlug(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/-{2,}/g, "-")
        .replace(/^-|-$/g, "");
}
function createAccessPolicy(mode, secret) {
    return {
        mode,
        label: mode === "code" ? "입장 코드" : "가족 비밀번호",
        helperText: mode === "code"
            ? "초대받은 가족만 알고 있는 코드를 입력하고 들어오세요."
            : "가족이 함께 쓰는 비밀번호를 입력하고 들어오세요.",
        secret,
    };
}
function createHighlights(input) {
    return [
        {
            label: "이번 달 분위기",
            value: input.householdMood,
        },
        {
            label: "홈 우선순위",
            value: input.enabledModuleLabels.slice(0, 3).join(", ") || "Announcements",
        },
        {
            label: "화면 성격",
            value: input.homePreset === "planner"
                ? "실행형 보드"
                : input.homePreset === "story"
                    ? "기록형 보드"
                    : "균형형 보드",
        },
    ];
}
function createEntryChecklist(mode) {
    return [
        {
            title: mode === "code" ? "입장 코드 확인" : "가족 비밀번호 확인",
            description: "가볍게 입장하되, 가족 밖에서는 바로 들어오기 어렵게 최소한의 보호를 둡니다.",
        },
        {
            title: "지금 켜진 모듈 미리 보기",
            description: "들어가기 전에 어떤 카드와 모듈이 먼저 보일지 감을 잡을 수 있도록 안내합니다.",
        },
        {
            title: "운영 화면과 분리",
            description: "설정 변경과 권한 관리는 콘솔에서만 가능하게 분리해 보안 흐름을 지킵니다.",
        },
    ];
}
function getThemePreset(key) {
    return familyThemePresetOptions.find((preset) => preset.key === key)?.theme ?? familyThemePresetOptions[0].theme;
}
export async function listRuntimeFamilies() {
    const baseFamilies = listFamilyRecords().map(toRuntimeFamily);
    const store = await readFamilySiteStore();
    return [...baseFamilies, ...store.customFamilies.map(toRuntimeCustomFamily)];
}
export async function listPublicFamilyPreviews() {
    const families = await listRuntimeFamilies();
    return families.map(toFamilyPublicPreview);
}
export async function resolveRuntimeFamilyFromSlug(familySlug) {
    const normalizedSlug = familySlug.trim().toLowerCase();
    const families = await listRuntimeFamilies();
    return families.find((family) => family.slug === normalizedSlug) ?? null;
}
export async function resolveRuntimeFamilyFromDomain(domain) {
    const normalizedDomain = domain.trim().toLowerCase();
    const families = await listRuntimeFamilies();
    return (families.find((family) => family.customDomains.some((customDomain) => customDomain.toLowerCase() === normalizedDomain)) ?? null);
}
export async function listConsoleFamilies(session) {
    const baseFamilies = new Map(listFamilyRecords().map((family) => [family.slug, family]));
    const store = await readFamilySiteStore();
    const demoFamilies = [];
    for (const membership of session.memberships) {
        if (!isConsoleManagerRole(membership.role)) {
            continue;
        }
        const family = baseFamilies.get(membership.familySlug);
        if (!family) {
            continue;
        }
        demoFamilies.push({
            family: toRuntimeFamily(family),
            role: membership.role,
            canManage: true,
        });
    }
    const customFamilies = store.customFamilies
        .filter((family) => family.ownerUserId === session.userId)
        .map((family) => ({
        family: toRuntimeCustomFamily(family),
        role: "owner",
        canManage: true,
    }));
    return [...demoFamilies, ...customFamilies];
}
export async function getConsoleFamilyBySlug(session, familySlug) {
    const families = await listConsoleFamilies(session);
    const normalizedSlug = familySlug.trim().toLowerCase();
    return families.find((family) => family.family.slug === normalizedSlug) ?? null;
}
export function canCreateCustomFamilies(session) {
    return session.memberships.some((membership) => isConsoleManagerRole(membership.role));
}
export async function getStoredWorkspaceDraft(familySlug) {
    const store = await readFamilySiteStore();
    return store.workspaceDrafts[familySlug]?.draft ?? null;
}
export async function saveRuntimeFamilyWorkspace(input) {
    const store = await readFamilySiteStore();
    const draft = resolveFamilyWorkspace({
        familySlug: input.family.slug,
        defaultModules: input.family.enabledModules,
        override: {
            familySlug: input.family.slug,
            enabledModules: input.enabledModules,
            homePreset: input.homePreset,
            entryPreset: input.entryPreset,
            updatedAt: new Date().toISOString(),
        },
    });
    store.workspaceDrafts[input.family.slug] = createStoredWorkspaceDraftEntry(draft, "builder-save");
    await writeFamilySiteStore(store);
    return draft;
}
export async function resetRuntimeFamilyWorkspace(familySlug) {
    const store = await readFamilySiteStore();
    delete store.workspaceDrafts[familySlug];
    await writeFamilySiteStore(store);
}
export async function createCustomFamilySite(input) {
    const store = await readFamilySiteStore();
    const normalizedSlug = normalizeSlug(input.slug);
    if (!/^[a-z0-9-]{2,32}$/.test(normalizedSlug)) {
        throw new Error("가족 홈 주소는 영문 소문자, 숫자, 하이픈만 사용해 2~32자로 만들어 주세요.");
    }
    const duplicatedFamily = [...listFamilyRecords(), ...store.customFamilies].find((family) => family.slug === normalizedSlug);
    if (duplicatedFamily) {
        throw new Error("이미 사용 중인 가족 홈 주소입니다.");
    }
    const now = new Date().toISOString();
    const draft = resolveFamilyWorkspace({
        familySlug: normalizedSlug,
        defaultModules: ["announcements", "calendar", "todo"],
        override: {
            familySlug: normalizedSlug,
            enabledModules: input.enabledModules,
            homePreset: input.homePreset,
            entryPreset: input.entryPreset,
            updatedAt: now,
        },
    });
    const name = input.name.trim();
    const tagline = input.tagline.trim();
    const welcomeMessage = input.welcomeMessage.trim();
    const heroSummary = input.heroSummary.trim();
    const householdMood = input.householdMood.trim();
    const accessSecret = input.accessSecret.trim();
    const memberCount = Number.isFinite(input.memberCount) ? input.memberCount : 3;
    if (!name || !tagline || !welcomeMessage || !heroSummary || !householdMood || !accessSecret) {
        throw new Error("이름, 설명, 환영 문구, 홈 소개, 가족 무드, 입장 비밀값은 모두 입력해 주세요.");
    }
    const moduleLabels = getModuleDescriptors(draft.enabledModules)
        .slice(0, 4)
        .map((module) => module.label);
    const customFamily = {
        id: `custom-${randomUUID()}`,
        slug: normalizedSlug,
        name,
        tagline,
        welcomeMessage,
        heroSummary,
        householdMood,
        timezone: input.timezone.trim() || "Asia/Seoul",
        customDomains: [],
        memberCount: Math.max(1, Math.min(12, Math.round(memberCount))),
        enabledModules: draft.enabledModules,
        highlights: createHighlights({
            householdMood,
            homePreset: draft.homePreset,
            enabledModuleLabels: moduleLabels,
        }),
        entryChecklist: createEntryChecklist(input.accessMode),
        theme: getThemePreset(input.themePreset),
        accessPolicy: createAccessPolicy(input.accessMode, accessSecret),
        ownerUserId: input.ownerUserId,
        createdAt: now,
        updatedAt: now,
    };
    store.customFamilies.push(customFamily);
    store.workspaceDrafts[customFamily.slug] = createStoredWorkspaceDraftEntry(draft, "create-family", now);
    await writeFamilySiteStore(store);
    return toRuntimeCustomFamily(customFamily);
}
