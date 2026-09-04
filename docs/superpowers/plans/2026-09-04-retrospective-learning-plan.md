# CocoCrunch Retrospective and Learning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Completed journey an unmistakable actual-outcome → reflection → proposed-learning → explicit-confirmation loop while keeping expressive memory features around it.

**Architecture:** Retrospective inputs remain trip evidence. A pure domain function derives a reviewable learning proposal. The proposal is persisted as source/history only when needed, and long-term Tingo is updated only from an explicit confirmation action. Memory Trunk, Photo Map, Future Postcard, Ghost Wish, Memory Cards, and Community remain optional outcomes.

**Tech Stack:** TypeScript, React, Vitest, existing local persistence and signature components.

## Global Constraints

- Work only on `feat/p0-foundation`; no branch changes, merge, or push to `main`.
- Keep Trip Vibe and trip constraints trip-owned; do not write them through Me's Tingo controls.
- Never silently overwrite Tingo from retrospective inference.
- Dimensions are always re-derived from questionnaire answers.
- Preserve budget, Decision History, pace evidence, privacy, Ghost Wish, Memory Trunk, and sharing behavior.
- Memory and sharing are not substitutes for the retrospective loop.
- Keep media and photo adapters honest; do not claim image generation or live photo location.
- Inspect `git diff -- src/AppRescued.tsx` immediately after each active-app change.

## File map

- Modify `src/domain/preferences.ts` to return a typed proposal instead of mutating the long-term profile implicitly.
- Create `src/domain/learning.ts` for explicit proposal/confirmation state.
- Modify `src/domain/framework.test.ts` and `src/domain/regression.test.ts` for learning invariants.
- Modify `src/persistence.ts` for proposal/history fields.
- Create `src/components/TripRetrospective.tsx` for the visible loop.
- Modify `src/AppRescued.tsx` for Completed and Me integration.
- Modify `src/styles.css` incrementally.
- Modify `docs/COCOCRUNCH_RESCUE_LOG.md` after validation.

### Task 1: Write failing retrospective tests

**Files:**
- Create or modify: `src/domain/learning.test.ts`

**Interfaces:**
- Consumes: existing `TingoAnswer`, `TripReview`, `ItemReview`, and retrospective evidence.
- Produces: failing tests for proposal visibility and explicit answer-based confirmation.

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest';
import { buildLearningProposal, confirmLearningProposal } from './learning';
import { scoreTingo } from './tingo';

describe('explicit retrospective learning', () => {
  it('returns a proposal without mutating the source Tingo answers', () => {
    const before = [{ questionId: 'morning', optionId: 'mix' }];
    const proposal = buildLearningProposal({
      answers: before,
      tripReview: 'mixed',
      itemReviews: { cafe: 'skip' },
      actualPace: 'tired',
    });
    expect(proposal.changes.length).toBeGreaterThan(0);
    expect(before).toEqual([{ questionId: 'morning', optionId: 'mix' }]);
    expect(proposal.status).toBe('proposed');
  });

  it('changes the Tingo answer source only after explicit confirmation', () => {
    const answers = [{ questionId: 'morning', optionId: 'mix' }];
    const proposal = buildLearningProposal({ answers, tripReview: 'no', itemReviews: {}, actualPace: 'tired' });
    const confirmed = confirmLearningProposal(answers, proposal);
    expect(confirmed).toEqual([{ questionId: 'morning', optionId: 'slow' }]);
    expect(scoreTingo(confirmed).pace).toBe(-2);
    expect(answers).toEqual([{ questionId: 'morning', optionId: 'mix' }]);
  });
});
```

- [ ] **Step 2: Run the focused suite and verify failure**

Run: `npx vitest run src/domain/learning.test.ts`

Expected: FAIL because `src/domain/learning.ts` does not yet exist.

- [ ] **Step 3: Commit the failing tests**

```bash
git add src/domain/learning.test.ts
git commit -m "test: define explicit learning loop"
```

### Task 2: Implement typed proposal and confirmation domain functions

**Files:**
- Create: `src/domain/learning.ts`
- Modify: `src/domain/preferences.ts`

**Interfaces:**
- Consumes: review inputs and Tingo answer source state.
- Produces: `LearningProposal`, `buildLearningProposal()`, and `confirmLearningProposal()` that returns new questionnaire answers.

- [ ] **Step 1: Add the exact proposal types**

```ts
import type { TingoAnswer, TingoDimensions } from './tingo';
import type { ItemReview, TripReview } from './preferences';

export type LearningProposal = {
  id: string;
  status: 'proposed' | 'confirmed' | 'dismissed';
  changes: { questionId: string; beforeOptionId: string | null; afterOptionId: string; beforeDimensions: TingoDimensions; afterDimensions: TingoDimensions; reason: string }[];
  source: { tripReview: TripReview; itemReviews: Record<string, ItemReview>; actualPace: string };
  answerUpdates: { questionId: string; optionId: string; reason: string }[];
};

export function buildLearningProposal(input: { answers: TingoAnswer[]; tripReview: TripReview; itemReviews: Record<string, ItemReview>; actualPace: string }): LearningProposal;
export function confirmLearningProposal(answers: TingoAnswer[], proposal: LearningProposal): TingoAnswer[];
```

- [ ] **Step 2: Implement deterministic proposal rules**

Use the existing review semantics: `no` or `tired` proposes replacing the `morning` answer with `slow` when that question has a current answer; a Worth It food/café review may propose replacing the `food` answer with `hunt`; flexible/open-item reviews may propose replacing the `change` answer with `adapt`. Each answer update includes before/after dimensions and a reason tied to the actual review input. No function mutates the input answers or dimensions.

- [ ] **Step 3: Keep compatibility helpers explicit**

If `reconcileTripLearning()` remains for older callers, make it a pure proposal-producing compatibility wrapper or remove its call sites before deleting it. It must not be used as an implicit profile mutation path.

- [ ] **Step 4: Run the focused tests**

Run: `npx vitest run src/domain/learning.test.ts src/domain/regression.test.ts`

Expected: PASS with existing retrospective behavior preserved where it is explicitly confirmed.

- [ ] **Step 5: Commit**

```bash
git add src/domain/learning.ts src/domain/preferences.ts src/domain/learning.test.ts src/domain/regression.test.ts
git commit -m "feat: make retrospective learning explicit"
```

### Task 3: Persist proposals and confirmed history without duplicating Tingo source state

**Files:**
- Modify: `src/persistence.ts`

**Interfaces:**
- Consumes: `LearningProposal`, answer-based Tingo source state, and explicit confirmation metadata.
- Produces: reloadable proposal state and versioned confirmed history.

- [ ] **Step 1: Add persistence fields**

```ts
type ConfirmedLearningRecord = {
  id: string;
  proposalId: string;
  confirmedAt: string;
  sourceTripReview: TripReview;
  changes: LearningProposal['changes'];
};

// PersistedState additions
learningProposal?: LearningProposal;
confirmedLearningHistory?: ConfirmedLearningRecord[];
```

- [ ] **Step 2: Preserve answer-only Tingo derivation**

Do not add a second mutable `tingoDimensions` write path. A confirmed history record may store the before/after explanation for product history, but current dimensions still come from current answers.

- [ ] **Step 3: Add persistence tests**

Extend `src/domain/learning.test.ts` with a pure serialization-shape assertion if persistence helpers are extracted. If persistence remains browser-only, validate through the app integration and `npm run check`.

- [ ] **Step 4: Commit**

```bash
git add src/persistence.ts src/domain/learning.test.ts
git commit -m "feat: persist confirmed learning history"
```

### Task 4: Build the Completed retrospective component

**Files:**
- Create: `src/components/TripRetrospective.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: actual pace evidence, budget variance, Decision History, item reviews, `LearningProposal`, and callbacks.
- Produces: visually sequential retrospective content.

- [ ] **Step 1: Implement the visible sequence**

```tsx
import type { LearningProposal } from '../domain/learning';
import type { TripReview } from '../domain/preferences';

export function TripRetrospective({ actualSummary, worthIt, proposal, onRecordReflection, onBuildProposal, onConfirmLearning, onOpenMemory }: { actualSummary: { pace: string; spent: number; decisions: number }; worthIt: TripReview | null; proposal: LearningProposal | null; onRecordReflection: (value: TripReview) => void; onBuildProposal: () => void; onConfirmLearning: () => void; onOpenMemory: () => void }) {
  return <section className="trip-retrospective"><div className="retrospective-step"><span>1 · ACTUAL OUTCOME</span><b>{actualSummary.pace} · RM {actualSummary.spent} spent · {actualSummary.decisions} decisions</b></div><div className="retrospective-step"><span>2 · WORTH IT?</span><div>{(['yes', 'mixed', 'no'] as const).map(value => <button key={value} className={worthIt === value ? 'active' : ''} onClick={() => onRecordReflection(value)}>{value}</button>)}</div></div><div className="retrospective-step"><span>3 · PROPOSED LEARNING</span>{proposal ? proposal.changes.map(change => <p key={change.questionId}>{change.questionId}: {change.beforeOptionId ?? 'none'} → {change.afterOptionId} · {change.reason}</p>) : <button className="secondary" onClick={onBuildProposal}>Show what Coco learned</button>}</div>{proposal && proposal.status === 'proposed' && <button className="primary" onClick={onConfirmLearning}>Confirm this learning</button>}<button className="secondary" onClick={onOpenMemory}>Keep the memory</button></section>;
}
```

- [ ] **Step 2: Keep expressive features around the loop**

Render Memory Trunk, Photo Map, Future Postcard, Ghost Wish, Memory Card, and sharing after or beside the retrospective sequence. Do not place them above the actual-outcome/reflection/learning sequence.

- [ ] **Step 3: Commit**

```bash
git add src/components/TripRetrospective.tsx src/styles.css
git commit -m "feat: make Completed a visible retrospective loop"
```

### Task 5: Integrate Completed and Me flows in the active app

**Files:**
- Modify: `src/AppRescued.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `TripRetrospective`, `buildLearningProposal()`, `confirmLearningProposal()`, persistence fields, and the journey-state action target.
- Produces: explicit Completed → Me learning handoff and intentional Tingo update/retake.

- [ ] **Step 1: Replace implicit `confirmLearning()` mutation**

The first action creates and displays `learningProposal`. The second action calls `confirmLearningProposal()`, updates answer-based Tingo state or the explicit confirmed profile history according to the proposal, records the confirmation, and clears the pending proposal. No reflection click alone may mutate Me.

- [ ] **Step 2: Update `renderMe()`**

Keep Tingo Card review, retake/update, base packing preferences, privacy, and confirmed history. Remove trip-specific fields and show any pending learning proposal with `Review`, `Confirm`, and `Dismiss` semantics.

- [ ] **Step 3: Update `renderMemories()`**

Render `TripRetrospective` before expressive artifacts. Preserve existing Memory Trunk, Photo Map, Future Postcard, Ghost Wish, Memory Card, budget-vs-actual, pace-vs-actual, Decision History, and consent-gated Community content.

- [ ] **Step 4: Inspect the exact diff**

Run: `git diff -- src/AppRescued.tsx`

Expected: only the learning state/Completed/Me integration is present in this slice.

- [ ] **Step 5: Run validation and commit**

Run: `npm run check`

```bash
git add src/AppRescued.tsx src/styles.css
git commit -m "feat: wire explicit Completed-to-Me learning flow"
```

### Task 6: Update rescue log and final validation

**Files:**
- Modify: `docs/COCOCRUNCH_RESCUE_LOG.md`

- [ ] **Step 1: Run `npm run check` at the exact branch head**
- [ ] **Step 2: Test persistence reload and explicit Tingo retake/update**
- [ ] **Step 3: Test Completed sequence in Solo and Group modes**
- [ ] **Step 4: Test privacy and Community consent states**
- [ ] **Step 5: Record implemented, wired, regression-tested, CI, browser/runtime, and visual/mobile statuses separately**
- [ ] **Step 6: Commit the rescue-log update**

```bash
git add docs/COCOCRUNCH_RESCUE_LOG.md
git commit -m "docs: record full framework validation state"
```
