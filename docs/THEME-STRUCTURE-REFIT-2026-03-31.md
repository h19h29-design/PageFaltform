# B-page Theme Structure Refit

Date: 2026-03-31

## What changed

- Unified each theme to a single font source while keeping the legacy `displayFontVar` and `bodyFontVar` aliases for compatibility.
- Added explicit theme structure tokens:
  - `shapePreset`
  - `surfacePreset`
- Expanded theme-scene mapping so family pages can vary by:
  - corner radius
  - surface fill
  - border weight
  - shadow depth
  - scene radius
- Updated the theme picker preview so the cards show more than just color.
- Cleaned the app metadata copy.

## Verified

- `npm run typecheck --workspace @ysplan/web`
- `npm run build`

## Files touched for this refit

- `apps/web/src/lib/shared-themes.ts`
- `apps/web/src/lib/theme-scene.ts`
- `apps/web/src/components/theme-preset-selector.tsx`
- `apps/web/app/layout.tsx`
