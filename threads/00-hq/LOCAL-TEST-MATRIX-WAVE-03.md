# Local Test Matrix Wave 03

Date: `2026-03-21`

Use this matrix after wave 03 pages land in code.
If list / detail / new / edit routes are still missing, run only the prep items in
`Home Contract QA Gate` and treat thread `01-home-contract` as `awaiting-wave-03-deltas`.

## Authentication

1. Create a local account.
2. Sign in with the new account.
3. Sign out.
4. Sign back in with the same account.
5. Confirm console access and family entry still work after re-auth.

## Family Entry

1. Create a family in `/console`.
2. Open the family URL.
3. Enter with the family password or code.
4. Confirm the user reaches `/app/[familySlug]`.

## Content CRUD

1. `announcements`: list, detail, new, edit, delete.
2. `posts`: list, detail, new, edit, delete.
3. `gallery`: list, detail, new, edit, delete.
4. `diary`: list, detail, new, edit, delete.

## Schedule CRUD

1. `calendar`: list, detail, new, edit, delete.
2. `todo`: list, detail, new, edit, delete.
3. `school-timetable`: list, detail, new, edit, delete.
4. `day-planner`: list, detail, new, edit, delete.

## Tracker CRUD

1. `progress`: list, detail, new, edit, delete.
2. `habits`: list, detail, new, edit, delete.

## Home Reflection

1. After each representative create, edit, and delete flow, return to `/app/[familySlug]`.
2. Confirm the expected card appears, changes, or disappears from home.
3. Confirm title, summary, badge, href, and recency feel consistent with the edited item.
4. Change the home preset and confirm only dashboard ordering changes.
5. Change enabled modules and confirm home inclusion changes accordingly.

## Console Operations

1. Change family name, tagline, and theme.
2. Change enabled modules and their order.
3. Change home preset and entry preset.
4. Re-open the family home and confirm the changes are reflected.

## Final Sweep

1. No empty placeholder pages remain on the tested flow.
2. No route should dead-end into an unexpected `404`.
3. Create, edit, and delete should be observable from the list and detail pages.
4. Navigation between console, entry, family home, and module pages should stay coherent.

## Home Contract QA Gate

1. Confirm `/app/[familySlug]` still composes cards through `buildFamilyDashboardFeeds` and `buildDashboardHomeModel`.
2. Confirm `sourceByModule` stays `module-builder` for enabled modules.
3. Confirm `today` contains only `schedule` or `todo` cards.
4. Confirm `focus` contains only `announcement`, `schedule`, or `todo` cards.
5. Confirm `progress` contains only `progress` or `habit` cards, even when items are due soon or heavily featured.
6. Confirm `recent` contains only `post` or `gallery` cards.
7. Confirm `diary` pages still normalize to `moduleKey: diary`, `cardType: post`, and `sectionHint: recent`.
8. Confirm CRUD does not drift card payload vocabulary: `moduleKey`, `cardType`, `visibilityScope`, `sectionHint`, `href`, and metric fields must remain contract-safe.
9. Confirm list / detail / new / edit flows do not introduce a module-specific route pattern that breaks shared navigation expectations.
