import { buildDashboardHomeModel } from "../../../../packages/dashboard/src/home-exposure.mjs";
import {
  sampleDashboardCards,
  sampleFamilyContext,
} from "../../../../packages/dashboard/src/sample-home-cards.mjs";

const model = buildDashboardHomeModel(sampleDashboardCards, sampleFamilyContext, {
  now: "2026-03-17T09:00:00+09:00",
  viewport: "desktop",
});

for (const section of model.sections) {
  console.log(`\n[${section.key}]`);

  if (!section.items.length) {
    console.log("- empty");
    continue;
  }

  for (const item of section.items) {
    console.log(`- ${item.card.title} (${item.card.cardType}, score=${item.score})`);
  }
}
