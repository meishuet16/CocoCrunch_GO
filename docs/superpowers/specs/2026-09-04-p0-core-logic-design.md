# P0 Core Logic Completion Design

**Date:** 2026-09-04
**Branch:** `feat/p0-foundation`
**Product source of truth:** `D:/dunno/codenection26/FINAL_PRODUCT_SPEC.md` (v6)
**Implementation history:** `docs/COCOCRUNCH_RESCUE_LOG.md`

## Goal

Close the remaining P0 product-logic gaps in the active `src/AppRescued.tsx` flow without restarting the app architecture or changing the existing CocoCrunch UI language. The implementation will make Group Travel DNA, itinerary generation, Plan Health, Court-to-Backup flow, disruption repair, and recommendation evidence deterministic, testable, and persistence-aware.

## Product boundaries

- Tingo is a long-term per-traveller profile. Trip Vibe and the four trip-specific constraint types remain separate inputs and are never silently folded into Tingo.
- Per-member preference data is supported directly. Only explicitly assessed member Tingo data is used; unassessed members never inherit Mei’s profile.
- Must-Go items are protected anchors and cannot be removed or AI-replaced.
- Deal Breakers are hard filters. Court losing options that violate a Deal Breaker do not enter the Backup pool.
- Group disagreement remains visible. Strong conflicts, including Must-Go versus Strongly Avoid, are surfaced rather than averaged and require Group Court for substantive official changes.
- Critical P0 logic is deterministic and rule-based. External/live evidence is never fabricated; prototype catalog sources remain labeled.
- Computed outputs such as Plan Health are re-derived from source inputs. Persist only source/evidence state and durable user decisions needed for replay.
- Existing Court, Gacha, persistence, budget, experience-event, Trip Workspace, and visual behavior remain intact unless a focused integration change is required.

## Architecture

### `src/domain/group-dna.ts`

Define per-member preference and budget evidence, assessment status, conflict records, and `GroupDNA`. Implement `deriveGroupDNA(...)` by counting explicit member signals. Shared priorities are those supported by multiple members; optional preferences retain their support counts; budget output preserves the observed range and sensitivity distribution; strong disagreements are returned as explicit conflicts. The function does not use a default member’s Tingo dimensions for other members.

### `src/domain/itinerary.ts`

Define structured destination candidates, evidence entries, itinerary items, time blocks, buffers, and `TripPlan`. Implement `generateTripPlan(...)` as a stable rule-based planner. It selects a protected Must-Go anchor, ranks explicit candidates against Trip Vibe, Group DNA, Tingo behavior, preferences, budget, and Deal Breakers, then lays out floating items, a protected buffer, and an open/flexible block. Each important item includes evidence describing the exact input source.

### `src/domain/plan-health.ts`

Implement `calculatePlanHealth(...)` with documented component metrics and explicit deductions rather than an opaque weighted average. The score begins at 100 and subtracts independently capped risk deductions for walking load, time pressure, budget overrun, preference/dietary misses, transfer burden, unprotected anchors, and unresolved conflicts. The result returns the score, component values, deductions, and human-readable reasons. All inputs are visible in the returned metrics.

### `src/domain/backup-repair.ts`

Implement Court-loser conversion and deterministic repair. A losing Court option enters Backup only when it is viable and passes Deal Breaker validation. The candidate keeps support count, source, and loss reason. `buildMinimumLossRepair(...)` protects anchors first, chooses the highest-support viable backup with deterministic tie-breakers, moves floating/open items only as needed, and reports exact cost, time, preference-loss, promise, and confirmation impacts. A pure apply helper produces the resulting plan; App state keeps the pre-repair source needed for Undo.

## Active-app data flow

`AppRescued` will derive `groupDNA`, `baseTripPlan`, `visibleTripPlan`, `planHealth`, and `repairPreview` with `useMemo` from current source state. Court confirmation calls the backup conversion helper before writing the decision record. The disruption UI renders the returned repair preview and applies/undoes the returned plan and actual-budget adjustment. The Backup drawer displays persisted candidates and their evidence. The itinerary and Why this? surfaces render generated item fields instead of fixed demo values.

Persistence gains optional backward-compatible fields for per-member preference evidence, Backup candidates, and durable repair/source evidence. Plan Health and other derived values are not persisted.

## Verification

Add Vitest regression tests for Must-Go preservation, explicit strong conflicts, no Tingo projection, Plan Health sensitivity, viable Deal Breaker-filtered Court losers, tie-only Gacha, anchor protection, support-prioritized repair, exact cost/time impacts, and Group confirmation gating. Run the red-green-refactor loop for each domain unit, then run `npm run check` (TypeScript, Vitest, and Vite build). Update the rescue log with separate statuses for code implementation, active-app wiring, regression tests, exact-head CI, browser/runtime verification, and visual verification.
