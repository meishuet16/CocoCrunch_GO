# Task 3 Report: Typed Recommendation-Evidence Boundary

Date: 2026-09-04
Branch: `feat/p0-foundation`

## Requirement Restatement

Implement Task 3 of the Journey Data plan by moving itinerary recommendation evidence from presentation-shaped fields into a typed structured evidence contract, adding the presentation formatter boundary, and updating only the active-app evidence reads needed for compilation and display. Do not rewrite `AppRescued.tsx` or alter unrelated UI/domain behavior.

## Scope Applied

- Added the shared structured evidence type in `src/domain/evidence.ts`.
- Migrated itinerary evidence creation in `src/domain/itinerary.ts` from `label/detail` to `source/inputId/strength/effect/value`.
- Updated `src/domain/backup-repair.ts` and `src/domain/plan-health.ts` because they still depended on the old evidence shape and would otherwise fail compile/runtime checks.
- Added `src/components/RecommendationEvidenceText.tsx` as the presentation boundary specified by the brief.
- Updated only the two `AppRescued.tsx` evidence presentation reads that used `evidence[].label` and `evidence[].detail`.
- Left `src/domain/discovery.ts` unchanged because evidence objects are not constructed there in the current branch; discovery still only supplies candidate metadata consumed by itinerary generation.

## TDD Record

### Red

- Updated `src/domain/core-logic.test.ts` to assert structured evidence fields (`source`, `effect`, `strength`, `value`) instead of presentation copy.
- Added `src/components/RecommendationEvidenceText.test.tsx` for the formatter boundary.
- Ran:
  - `npx vitest run src/domain/core-logic.test.ts`
  - `npx vitest run src/components/RecommendationEvidenceText.test.tsx`
- Observed expected failures:
  - itinerary tests still received `label/detail`
  - formatter component file did not yet exist

### Green

- Implemented `src/domain/evidence.ts`.
- Replaced itinerary evidence construction with a typed helper in `src/domain/itinerary.ts`.
- Added the presentation formatter component.
- Updated backup-repair evidence creation and plan-health evidence reads to the structured shape.
- Replaced the two active-app evidence reads in `src/AppRescued.tsx` with `RecommendationEvidenceText`.
- Ran `git diff -- src/AppRescued.tsx` immediately after the app change to verify the edit stayed limited to the required boundary.

### Refactor / Tightening

- Kept the structured values intentionally terse so the new formatter remains the only presentation layer.
- Preserved all unrelated UI and product logic behavior.

## Files Changed

- Added `src/domain/evidence.ts`
- Added `src/components/RecommendationEvidenceText.tsx`
- Added `src/components/RecommendationEvidenceText.test.tsx`
- Modified `src/domain/itinerary.ts`
- Modified `src/domain/backup-repair.ts`
- Modified `src/domain/plan-health.ts`
- Modified `src/domain/core-logic.test.ts`
- Modified `src/AppRescued.tsx`

## Verification

### Passing

- `npx vitest run src/domain/core-logic.test.ts src/components/RecommendationEvidenceText.test.tsx`
- `npx vitest run src/domain/regression.test.ts`

Results:

- `src/domain/core-logic.test.ts` passed
- `src/components/RecommendationEvidenceText.test.tsx` passed
- `src/domain/regression.test.ts` passed

### Requested Focused Suite Status

Ran `npx vitest run src/domain/core-logic.test.ts src/domain/framework.test.ts`

Result:

- `src/domain/core-logic.test.ts` passed
- `src/domain/framework.test.ts` still fails because `src/domain/journey-state.ts` does not exist yet in this branch

This matches the next planned task in `docs/superpowers/plans/2026-09-04-journey-data-plan.md`, where Task 4 is to implement deterministic journey-state derivation. I did not pull that work into Task 3.

## Self-Review

- Confirmed the shared evidence type is domain-owned and presentation-agnostic.
- Confirmed `AppRescued.tsx` only changed at the evidence display boundary plus one import.
- Confirmed no remaining itinerary/repair/plan-health reads of evidence `label` or `detail`.
- Confirmed untracked/generated artifacts (`dist/`, `node_modules/`, `package-lock.json`) were preserved and not included in task edits.

## Concerns

- The requested focused suite is not fully green because `framework.test.ts` already depends on the not-yet-implemented Task 4 file `src/domain/journey-state.ts`.
- The new formatter intentionally renders raw evidence values, so itinerary copy is plainer by design after this boundary change.

## Review Fix Addendum

### Findings Addressed

- Preserved candidate provenance separately from candidate explanation by adding structured `provenance` to `RecommendationEvidence` and populating it from `anchorCandidate.source` / `selected.source` in `src/domain/itinerary.ts`, while leaving `candidate.why` in `value`.
- Added focused domain assertions in `src/domain/core-logic.test.ts` for:
  - the migrated Plan Health preference-evidence path
  - `applyRepairToPlan` appending correctly typed repair evidence

### TDD Follow-Up

- Red:
  - tightened itinerary evidence assertions to require candidate `provenance: 'prototype-catalog'`
  - ran `npx vitest run src/domain/core-logic.test.ts`
  - observed the expected failure because candidate evidence still lacked structured provenance
- Green:
  - added optional `provenance` to `src/domain/evidence.ts`
  - updated itinerary evidence construction to carry provenance separately from explanation
  - reran `npx vitest run src/domain/core-logic.test.ts` and confirmed all 16 tests passed

### Verification Evidence

- `npx vitest run src/domain/core-logic.test.ts src/components/RecommendationEvidenceText.test.tsx src/domain/regression.test.ts`
  - passed: 3 files, 31 tests
- `npx vitest run src/domain/framework.test.ts`
  - expected failure remains: 2 tests fail on missing import `./journey-state` from `src/domain/framework.test.ts`

### Scope Check

- No additional `src/AppRescued.tsx` edits were made in this follow-up fix pass.
