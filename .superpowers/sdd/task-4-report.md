# Task 4 Report: Deterministic Journey-State Derivation

Date: 2026-09-04
Branch: `feat/p0-foundation`

## Requirement Restatement

Implement Task 4 of the Journey Data plan by adding the pure `deriveJourneyState()` contract in `src/domain/journey-state.ts`, preserving the specified priority ordering, typed outputs, and the non-linear inspection rule that `canInspectOtherSections` is always `true`. Do not touch UI, generated artifacts, or unrelated domain logic.

## Scope Applied

- Added `src/domain/journey-state.ts` with:
  - typed `JourneyPhase`, `JourneyActionId`, `JourneyActionTarget`
  - typed `JourneyStateInput`, `JourneyEvidence`, `JourneyAction`, and `JourneyState`
  - pure `deriveJourneyState(input)` with the exact branch ordering from the brief
- Preserved the non-linear rule by returning `canInspectOtherSections: true` in every branch.
- Preserved mutation gating boundaries by only recommending or prioritizing the next action; the function does not block inspection and does not introduce any mutation gate logic.
- Left `src/domain/framework.test.ts` unchanged because it already contained the intended red-step assertions for this task and went green once the new module existed.
- Did not change UI files, generated artifacts, or unrelated domain logic.

## TDD Record

### Red

- Used the existing `journey state` cases in `src/domain/framework.test.ts` as the failing test-first contract:
  - unresolved Group conflict should prioritize `open-court`
  - Group disruption repair approval should prioritize `approve-repair`
  - both must keep `canInspectOtherSections === true`
- Ran:
  - `npx vitest run src/domain/framework.test.ts`
- Observed expected failure:
  - the suite failed because `./journey-state` did not exist yet

### Green

- Implemented `src/domain/journey-state.ts` exactly to the task brief contract.
- Kept the rule order intact:
  - no trip
  - planning + incomplete Tingo
  - planning + unresolved group conflict
  - traveling + group repair approval
  - traveling + repair preview
  - planning + Plan Health blocker
  - planning + no plan
  - planning + ready confirmation
  - traveling + check-in
  - completed + outcome review
  - completed + Worth It reflection
  - completed + learning review
  - completed + memories
  - fallback continue state
- Re-ran:
  - `npx vitest run src/domain/framework.test.ts`
- Result:
  - framework suite passed

### Refactor / Tightening

- Kept the implementation as a single pure function with a shared immutable base object.
- Did not add helpers or extra abstractions because the branch list is the contract and directness makes the priority ordering easiest to audit.

## Files Changed

- Added `src/domain/journey-state.ts`
- Added `.superpowers/sdd/task-4-report.md`

## Verification

### Focused Journey-State Suite

- Ran `npx vitest run src/domain/framework.test.ts`
- Result: 1 file passed, 5 tests passed

### Existing P0 / Domain Suites

- Ran `npx vitest run src/domain/core-logic.test.ts`
- Result: 1 file passed, 16 tests passed

- Ran `npx vitest run src/domain/regression.test.ts`
- Result: 1 file passed, 14 tests passed

### Fresh Combined Verification Before Commit

- Ran `npx vitest run src/domain/framework.test.ts src/domain/core-logic.test.ts src/domain/regression.test.ts`
- Result: 3 files passed, 35 tests passed

### TypeScript Check

- Ran `npx tsc --noEmit`
- Result: failed in existing unrelated test code at `src/domain/core-logic.test.ts(277,35)`
- Error:
  - `Property 'at' does not exist on type 'RecommendationEvidence[]'.`
- Assessment:
  - this failure is not caused by `src/domain/journey-state.ts`
  - it reflects a pre-existing mismatch between the repository's `ES2020` lib target and an existing `.at()` usage in a test file
  - I did not change that unrelated file in this task

## Self-Review

- Confirmed every returned state includes `canInspectOtherSections: true`.
- Confirmed plan-health blockers are copied through without mutating the input.
- Confirmed the Group conflict branch stays ahead of plan-generation and Ready-to-Go branches.
- Confirmed group repair approval stays ahead of generic repair preview.
- Confirmed the return types are explicit unions instead of loose strings for action IDs and targets.
- Confirmed no UI files or generated artifacts were modified.
- Confirmed untracked workspace artifacts (`dist/`, `node_modules/`, `package-lock.json`) were preserved and not included in the task change.

## Concerns

- `npx tsc --noEmit` is not clean on this branch because of the unrelated existing `.at()` usage in `src/domain/core-logic.test.ts` under the current `ES2020` lib target.
- `JourneyActionTarget` includes `'explore'` because the task brief required that typed union, although the current contract branches do not emit an action with that target yet.
