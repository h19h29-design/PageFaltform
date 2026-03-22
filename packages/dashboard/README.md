# `@ysplan/dashboard`

This package is the source of truth for the family-home card contract and the
section ordering rules used by the home screen.

## Canonical contract

- `src/contracts.ts`
  Defines `DashboardCardPayload`, `DashboardModuleFeed`, preset policies, and
  `dashboardModuleContractBaselines`.
- `src/home-model.ts`
  Resolves visibility, score, hero promotion, section placement, slot limits,
  overflow, and tie-breakers.
- `src/sample-home-feeds.ts`
  Provides sample feeds that already follow the canonical contract.

## Rules for other threads

- Threads `02`, `03`, and `06` should treat `DashboardModuleFeed` as the final
  home input contract, even if a module keeps local DTOs elsewhere.
- `dashboardModuleContractBaselines` is the normalization guide for module
  outputs:
  Content modules map to `announcement`, `post`, or `gallery`.
  Diary currently maps to `post`.
  Schedule modules map to `schedule` or `todo`.
  Tracker modules map to `progress` or `habit`.
- `sectionHint` is advisory only. `buildDashboardHomeModel` is the final
  decision-maker for hero, pinned, section assignment, ranking, and overflow.
- `activeModuleKeys` should influence only feed inclusion and the final
  tie-breaker order. Modules should not reimplement preset section ordering.

## Compatibility note

`@ysplan/modules-core` still exports module-facing summary types. Those are
compatibility helpers, not the source of truth for family-home ordering. Any
home-facing output should be adapted to the contract in this package before it
reaches the aggregator.
