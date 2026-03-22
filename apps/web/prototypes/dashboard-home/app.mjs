import { buildDashboardHomeModel } from "../../../../packages/dashboard/src/home-exposure.mjs";
import {
  sampleDashboardCards,
  sampleFamilyContext,
} from "../../../../packages/dashboard/src/sample-home-cards.mjs";

const now = "2026-03-17T09:00:00+09:00";
const sectionCopy = {
  hero: {
    title: "Hero",
    summary: "가족 공간의 첫 인상과 최우선 메시지",
  },
  today: {
    title: "Today",
    summary: "오늘 안에 움직여야 하는 일정과 할 일",
  },
  focus: {
    title: "Focus",
    summary: "바로 확인이 필요한 중요 항목",
  },
  progress: {
    title: "Progress",
    summary: "가족 목표와 루틴의 흐름",
  },
  recent: {
    title: "Recent",
    summary: "최근 글과 사진 기록",
  },
  pinned: {
    title: "Pinned",
    summary: "계속 눈에 남겨둘 장기 카드",
  },
};

const assumptionItems = [
  "우선순위: 중요 공지 -> 오늘 일정 -> 오늘 할 일",
  "모바일 최대 8카드, 데스크톱 최대 10카드",
  "가족 홈 톤: 따뜻한 사진 중심 + 빠른 정보 확인",
];

function formatMoment(value) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function buildMetaChips(card) {
  const chips = [];

  if (card.startsAt) {
    chips.push(`시작 ${formatMoment(card.startsAt)}`);
  }

  if (card.dueAt) {
    chips.push(`마감 ${formatMoment(card.dueAt)}`);
  }

  if (card.metricValue !== null && card.metricValue !== undefined) {
    chips.push(
      `${card.metricValue}${card.metricUnit ?? ""}${
        card.metricTarget ? ` / ${card.metricTarget}${card.metricUnit ?? ""}` : ""
      }`,
    );
  }

  chips.push(`모듈 ${card.moduleKey}`);

  return chips;
}

function renderAssumptions() {
  const target = document.querySelector("#assumptions");
  target.innerHTML = assumptionItems
    .map((item) => `<span class="assumption-pill">${item}</span>`)
    .join("");
}

function renderHero(section) {
  const heroSlot = document.querySelector("#hero-slot");
  const heroItem = section.items[0];

  if (!heroItem) {
    heroSlot.innerHTML = "";
    return;
  }

  heroSlot.innerHTML = `
    <article class="hero-card">
      <div class="hero-grid">
        <div class="hero-family">
          <p>${sampleFamilyContext.familySlug.replace("-", " ").toUpperCase()}</p>
          <h2>윤 가족의 오늘</h2>
          <div class="hero-message">
            중요한 전달은 가장 위에서 바로 확인하고, 오늘 해야 할 일정과 할 일은 아래에서
            이어서 처리할 수 있는 허브형 홈입니다.
          </div>
        </div>
        <aside class="hero-note">
          <strong>가장 먼저 볼 카드</strong>
          <span>${heroItem.card.title}</span>
        </aside>
      </div>
      ${renderCardMarkup(heroItem, true)}
    </article>
  `;
}

function renderCardMarkup(entry, compact = false) {
  const { card, score } = entry;
  const chips = buildMetaChips(card)
    .map((chip) => `<span class="meta-chip">${chip}</span>`)
    .join("");

  return `
    <article class="dashboard-card" data-type="${card.cardType}">
      <header class="dashboard-card-header">
        <div>
          <h4 class="dashboard-card-title">${card.title}</h4>
        </div>
        ${card.badge ? `<span class="badge">${card.badge}</span>` : ""}
      </header>
      <p class="summary">${card.summary}</p>
      <div class="meta-row">
        ${chips}
        ${!compact ? `<span class="meta-chip">점수 ${score}</span>` : ""}
      </div>
      <a class="card-link" href="${card.href}">모듈로 이동</a>
    </article>
  `;
}

function renderSection(section) {
  if (section.key === "hero") {
    return "";
  }

  const copy = sectionCopy[section.key];
  const itemsMarkup = section.items.length
    ? section.items.map((entry) => renderCardMarkup(entry)).join("")
    : `<div class="empty-state">이 섹션에 아직 노출할 카드가 없습니다.</div>`;

  return `
    <article class="section-card" data-section="${section.key}">
      <header class="section-heading">
        <h3>${copy.title}</h3>
        <span>${copy.summary}</span>
      </header>
      ${itemsMarkup}
    </article>
  `;
}

function renderDashboard() {
  const viewport = window.matchMedia("(max-width: 920px)").matches ? "mobile" : "desktop";
  const model = buildDashboardHomeModel(sampleDashboardCards, sampleFamilyContext, {
    now,
    viewport,
  });

  const heroSection = model.sections.find((section) => section.key === "hero");
  const bodySections = model.sections.filter((section) => section.key !== "hero");

  renderAssumptions();
  renderHero(heroSection);

  document.querySelector("#section-grid").innerHTML = bodySections
    .map((section) => renderSection(section))
    .join("");
}

window.addEventListener("resize", renderDashboard);
renderDashboard();
