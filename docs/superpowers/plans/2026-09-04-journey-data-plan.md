# CocoCrunch Journey Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the source-of-truth data contracts and deterministic journey-state derivation needed to make the framework phase-aware without turning it into a locked wizard.

**Architecture:** Keep Tingo answers as the only editable source for derived Tingo dimensions. Add an explicit trip-owned `TripIntent`, typed recommendation evidence, and a pure `deriveJourneyState()` function. React consumes these outputs; it does not calculate journey priority or convert evidence into domain prose.

**Tech Stack:** TypeScript, React consumers, Vitest, localStorage persistence.

## Global Constraints

- Work only on `feat/p0-foundation` from `c2b74b4da45678c2d6f4f6f9a104234a5f16b375`; do not merge or push to `main`.
- Keep `src/AppRescued.tsx` as the active app and make controlled integration edits only.
- Preserve Group DNA, Must-Go, Deal Breaker, Court, tie-only Gacha, Backup, repair, Plan Health, budget, Decision History, privacy, and retrospective invariants.
- `deriveJourneyState()` recommends and prioritizes; it does not block inspection of relevant information.
- Tingo questionnaire answers are the editable source of truth; dimensions are re-derived with `scoreTingo()`.
- Keep Tingo separate from Trip Vibe and trip-specific constraints.
- Domain evidence is typed and source-linked; presentation components format it into human-readable copy.
- Do not fabricate live routing, location, traffic, weather, pricing, or map-provider data.
- Use tests first and run the focused test before implementation and after every domain task.
- Inspect `git diff -- src/AppRescued.tsx` immediately after every active-app integration edit.

## File map

- Create `src/domain/trip-intent.ts` for trip-owned intent and readiness inputs.
- Create `src/domain/evidence.ts` for structured recommendation evidence.
- Create `src/domain/journey-state.ts` for lifecycle status and prioritized next actions.
- Modify `src/domain/itinerary.ts` to consume structured evidence without presentation-only fields.
- Modify `src/persistence.ts` for compatible trip-intent and Tingo source-state persistence.
- Create `src/domain/framework.test.ts` for source-of-truth, evidence, and journey-state regression tests.
- Create `src/components/RecommendationEvidenceText.tsx` as the presentation formatter for typed evidence.
- Modify `src/AppRescued.tsx` only in the final integration task to re-derive state from answers and trip intent.

## Interfaces produced for later plans

```ts
export type TripIntent = {
  destination: string;
  dates: { start: string; end: string } | null;
  mode: 'solo' | 'group';
  tripVibe: string;
  mustGo: string;
  dealBreaker: string;
  preference: string;
  flexible: string;
  budget: number;
};

export type RecommendationEvidence = {
  source: 'tingo' | 'trip-vibe' | 'constraint' | 'member-preference' | 'group-consensus' | 'budget' | 'candidate' | 'adapter';
  inputId?: string;
  strength: 'required' | 'strong' | 'supporting' | 'context';
  effect: 'supports' | 'protects' | 'excludes' | 'constrains' | 'warns';
  value: string;
};

export type JourneyActionId = 'setup-trip' | 'complete-tingo' | 'open-court' | 'review-health' | 'review-intent' | 'confirm-ready' | 'continue-planning' | 'preview-repair' | 'approve-repair' | 'check-in' | 'continue-traveling' | 'review-outcome' | 'review-learning' | 'open-memories';
```

### Task 1: Add failing framework-domain tests

**Files:**
- Create: `src/domain/framework.test.ts`

**Interfaces:**
- Consumes: existing `scoreTingo()` from `src/domain/tingo.ts`.
- Produces: failing test names that define the contracts for Tasks 2–4.

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest';
import { scoreTingo } from './tingo';
import { deriveJourneyState } from './journey-state';

describe('Tingo source of truth', () => {
  it('re-derives dimensions from answers instead of trusting a separately edited snapshot', () => {
    const answers = [{ questionId: 'food', optionId: 'hunt' }];
    expect(scoreTingo(answers).food).toBe(3);
  });
});

describe('journey state', () => {
  it('prioritizes an unresolved Group conflict without preventing inspection', () => {
    const state = deriveJourneyState({
      phase: 'planning', tripCreated: true, tingoComplete: true, mode: 'group',
      unresolvedConflictCount: 1, planHealth: 86, planHealthBlockers: [],
      hasPlan: true, readyConfirmed: false, disruption: null,
      repairAvailable: false, repairRequiresGroupConfirmation: false,
      currentStopNeedsCheckIn: false, outcomeReviewed: false,
      worthItRecorded: false, learningProposalPending: false, learningConfirmed: false,
    });
    expect(state.nextAction?.id).toBe('open-court');
    expect(state.canInspectOtherSections).toBe(true);
  });

  it('prioritizes repair approval during a Group disruption', () => {
    const state = deriveJourneyState({
      phase: 'traveling', tripCreated: true, tingoComplete: true, mode: 'group',
      unresolvedConflictCount: 0, planHealth: 86, planHealthBlockers: [],
      hasPlan: true, readyConfirmed: true, disruption: 'failed-floating-item',
      repairAvailable: true, repairRequiresGroupConfirmation: true,
      currentStopNeedsCheckIn: false, outcomeReviewed: false,
      worthItRecorded: false, learningProposalPending: false, learningConfirmed: false,
    });
    expect(state.nextAction?.id).toBe('approve-repair');
  });
});
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `npx vitest run src/domain/framework.test.ts`

Expected: FAIL because `src/domain/journey-state.ts` does not yet exist.

- [ ] **Step 3: Commit the failing test**

```bash
git add src/domain/framework.test.ts
git commit -m "test: define journey data contracts"
```

### Task 2: Create the trip-owned intent contract

**Files:**
- Create: `src/domain/trip-intent.ts`
- Modify: `src/domain/trip.ts` only if a shared `TripMode` alias is required by the new type.

**Interfaces:**
- Consumes: current destination, mode, `TravelProfile`, and budget state.
- Produces: `TripIntent`, `emptyTripIntent`, `tripIntentFromLegacyState()`, and `tripIntentIsReviewable()`.

- [ ] **Step 1: Implement the exact contract**

```ts
export type TripIntent = {
  destination: string;
  dates: { start: string; end: string } | null;
  mode: 'solo' | 'group';
  tripVibe: string;
  mustGo: string;
  dealBreaker: string;
  preference: string;
  flexible: string;
  budget: number;
};

export const emptyTripIntent: TripIntent = {
  destination: '', dates: null, mode: 'solo', tripVibe: '', mustGo: '',
  dealBreaker: '', preference: '', flexible: '', budget: 0,
};

export function tripIntentFromLegacyState(input: {
  destination?: string;
  mode?: 'solo' | 'group';
  profile?: { vibe: string; mustGo: string; veto: string; preference: string; flexible: string };
  budget?: number;
}): TripIntent {
  return {
    destination: input.destination ?? '', dates: null, mode: input.mode ?? 'solo',
    tripVibe: input.profile?.vibe ?? '', mustGo: input.profile?.mustGo ?? '',
    dealBreaker: input.profile?.veto ?? '', preference: input.profile?.preference ?? '',
    flexible: input.profile?.flexible ?? '', budget: input.budget ?? 0,
  };
}

export function tripIntentIsReviewable(intent: TripIntent): boolean {
  return Boolean(intent.destination.trim() && intent.mustGo.trim() && intent.budget >= 0);
}
```

- [ ] **Step 2: Run the focused tests**

Run: `npx vitest run src/domain/framework.test.ts`

Expected: the Tingo test passes; journey-state tests still fail because Task 3 is not complete.

- [ ] **Step 3: Commit the contract**

```bash
git add src/domain/trip-intent.ts src/domain/framework.test.ts
git commit -m "feat: separate trip intent from long-term profile"
```

### Task 3: Add typed evidence and migrate itinerary output

**Files:**
- Create: `src/domain/evidence.ts`
- Modify: `src/domain/itinerary.ts`
- Modify: `src/domain/discovery.ts` only where candidate evidence is constructed.
- Create: `src/components/RecommendationEvidenceText.tsx`
- Modify: `src/AppRescued.tsx` only where existing JSX reads `evidence[].label` or `evidence[].detail`.
- Modify: `src/domain/core-logic.test.ts` assertions that currently expect presentation fields.

**Interfaces:**
- Consumes: existing candidate scoring and Group DNA inputs.
- Produces: `RecommendationEvidence` with source, input identity, strength, effect, and raw value for UI formatting.

- [ ] **Step 1: Add the typed evidence definition**

```ts
export type EvidenceSource = 'tingo' | 'trip-vibe' | 'constraint' | 'member-preference' | 'group-consensus' | 'budget' | 'candidate' | 'adapter';
export type EvidenceStrength = 'required' | 'strong' | 'supporting' | 'context';
export type EvidenceEffect = 'supports' | 'protects' | 'excludes' | 'constrains' | 'warns';

export type RecommendationEvidence = {
  source: EvidenceSource;
  inputId?: string;
  strength: EvidenceStrength;
  effect: EvidenceEffect;
  value: string;
};
```

- [ ] **Step 2: Replace itinerary evidence construction**

Use a helper with no display sentence:

```ts
function evidence(source: RecommendationEvidence['source'], value: string, effect: RecommendationEvidence['effect'], strength: RecommendationEvidence['strength'], inputId?: string): RecommendationEvidence {
  return { source, value, effect, strength, ...(inputId ? { inputId } : {}) };
}
```

Map existing evidence as follows: Must-Go is `constraint/protects/required`; candidate provenance is `candidate/supports/context`; Tingo ranking is `tingo/supports/supporting`; Deal Breaker exclusion is `constraint/excludes/required`; budget fit is `budget/constrains/supporting`; member preference is `member-preference/supports/strong`; and Group DNA support is `group-consensus/supports/strong`.

- [ ] **Step 3: Update tests and run the focused suite**

Add the presentation boundary:

```tsx
import type { RecommendationEvidence } from '../domain/evidence';

export function RecommendationEvidenceText({ evidence }: { evidence: RecommendationEvidence[] }) {
  return <span>{evidence.map(entry => `${entry.source.replace('-', ' ')}: ${entry.value}`).join(' ')}</span>;
}
```

Replace the two existing `AppRescued.tsx` reads of `evidence[].label` and `evidence[].detail` with this component. The domain continues to return raw structured evidence; only the component creates display text.

Run the focused suite:

Run: `npx vitest run src/domain/core-logic.test.ts src/domain/framework.test.ts`

Expected: all existing P0 behavior remains green and evidence assertions inspect `source`, `effect`, and `value`, not UI prose fields.

- [ ] **Step 4: Commit the evidence boundary**

```bash
git add src/domain/evidence.ts src/domain/itinerary.ts src/domain/discovery.ts src/domain/core-logic.test.ts src/domain/framework.test.ts
git commit -m "feat: separate recommendation evidence from presentation copy"
```

### Task 4: Implement deterministic journey-state derivation

**Files:**
- Create: `src/domain/journey-state.ts`
- Modify: `src/domain/framework.test.ts`

**Interfaces:**
- Consumes: `TripIntent`-level readiness, Group/Court state, Plan Health, repair state, and retrospective state.
- Produces: `JourneyState` with status, prioritized action, blockers, evidence, and `canInspectOtherSections`.

- [ ] **Step 1: Implement the pure function**

```ts
export type JourneyStateInput = {
  phase: 'planning' | 'traveling' | 'completed';
  tripCreated: boolean;
  tingoComplete: boolean;
  mode: 'solo' | 'group';
  unresolvedConflictCount: number;
  planHealth: number;
  planHealthBlockers: string[];
  hasPlan: boolean;
  readyConfirmed: boolean;
  disruption: 'failed-floating-item' | null;
  repairAvailable: boolean;
  repairRequiresGroupConfirmation: boolean;
  currentStopNeedsCheckIn: boolean;
  outcomeReviewed: boolean;
  worthItRecorded: boolean;
  learningProposalPending: boolean;
  learningConfirmed: boolean;
};

export type JourneyEvidence = { source: string; value: string };
export type JourneyAction = { id: JourneyActionId; label: string; reason: string; priority: number; target: 'trip' | 'me' | 'memories' | 'explore' };
export type JourneyState = { phase: JourneyStateInput['phase']; status: string; nextAction: JourneyAction | null; blockers: string[]; evidence: JourneyEvidence[]; canInspectOtherSections: true };

export function deriveJourneyState(input: JourneyStateInput): JourneyState {
  const base = { phase: input.phase, blockers: [...input.planHealthBlockers], evidence: [] as JourneyEvidence[], canInspectOtherSections: true as const };
  if (!input.tripCreated) return { ...base, status: 'No active trip yet.', nextAction: { id: 'setup-trip', label: 'Set up this trip', reason: 'A destination and trip intent are needed before a plan can be reviewed.', priority: 100, target: 'trip' } };
  if (input.phase === 'planning' && !input.tingoComplete) return { ...base, status: 'Your trip can be shaped now; Tingo is not complete.', nextAction: { id: 'complete-tingo', label: 'Review Tingo Card', reason: 'A complete long-term profile can improve explanations, but it does not block trip inspection.', priority: 80, target: 'me' } };
  if (input.phase === 'planning' && input.mode === 'group' && input.unresolvedConflictCount > 0) return { ...base, status: 'The group has a decision to make.', nextAction: { id: 'open-court', label: 'Open Group Court', reason: 'A strong unresolved disagreement requires an explicit group decision.', priority: 95, target: 'trip' }, evidence: [{ source: 'group-dna', value: `${input.unresolvedConflictCount} unresolved conflict(s)` }] };
  if (input.phase === 'traveling' && input.disruption && input.repairAvailable && input.mode === 'group' && input.repairRequiresGroupConfirmation) return { ...base, status: 'Reality changed; the repair is waiting for group approval.', nextAction: { id: 'approve-repair', label: 'Review repair approval', reason: 'The proposed change affects shared trip truth.', priority: 100, target: 'trip' } };
  if (input.phase === 'traveling' && input.disruption && input.repairAvailable) return { ...base, status: 'Reality changed; a reversible repair is ready.', nextAction: { id: 'preview-repair', label: 'Preview minimum-loss repair', reason: 'Review time, cost, preference, and anchor impact before applying.', priority: 100, target: 'trip' } };
  if (input.phase === 'planning' && input.planHealthBlockers.length > 0) return { ...base, status: 'The plan has a blocker to review.', nextAction: { id: 'review-health', label: 'Review Plan Health', reason: input.planHealthBlockers[0], priority: 90, target: 'trip' } };
  if (input.phase === 'planning' && !input.hasPlan) return { ...base, status: 'Trip intent is ready for a plan.', nextAction: { id: 'review-intent', label: 'Review trip intent', reason: 'Trip Vibe and constraints have not produced a reviewable plan yet.', priority: 70, target: 'trip' } };
  if (input.phase === 'planning' && !input.readyConfirmed) return { ...base, status: 'The plan is reviewable and waiting for a Ready-to-Go confirmation.', nextAction: { id: 'confirm-ready', label: 'Confirm Ready to Go', reason: 'The plan can remain editable until the user explicitly confirms it.', priority: 60, target: 'trip' } };
  if (input.phase === 'traveling' && input.currentStopNeedsCheckIn) return { ...base, status: 'The next useful check-in is available.', nextAction: { id: 'check-in', label: 'Check in at the current stop', reason: 'Manual check-in keeps progress explicit without requiring location permission.', priority: 50, target: 'trip' } };
  if (input.phase === 'completed' && !input.outcomeReviewed) return { ...base, status: 'The trip is ready for an honest recap.', nextAction: { id: 'review-outcome', label: 'Review what actually happened', reason: 'The retrospective begins with actual outcome evidence.', priority: 90, target: 'memories' } };
  if (input.phase === 'completed' && input.outcomeReviewed && !input.worthItRecorded) return { ...base, status: 'The recap is ready for your reflection.', nextAction: { id: 'review-outcome', label: 'Answer Worth It?', reason: 'Reflection precedes any learning proposal.', priority: 80, target: 'memories' } };
  if (input.phase === 'completed' && input.learningProposalPending && !input.learningConfirmed) return { ...base, status: 'Coco has a proposed learning update to review.', nextAction: { id: 'review-learning', label: 'Review proposed learning', reason: 'Long-term profile changes require explicit confirmation.', priority: 70, target: 'me' } };
  if (input.phase === 'completed') return { ...base, status: 'Trip learning is up to date.', nextAction: { id: 'open-memories', label: 'Keep the memory', reason: 'The reflective loop is complete; expressive artifacts remain available.', priority: 40, target: 'memories' } };
  return { ...base, status: 'The trip is ready to continue.', nextAction: { id: input.phase === 'planning' ? 'continue-planning' : 'continue-traveling', label: input.phase === 'planning' ? 'Continue planning' : 'Continue the trip', reason: 'No higher-priority action is currently pending.', priority: 20, target: 'trip' } };
}
```

- [ ] **Step 2: Run the tests**

Run: `npx vitest run src/domain/framework.test.ts`

Expected: PASS, including the non-linear inspection assertion.

- [ ] **Step 3: Commit the journey state**

```bash
git add src/domain/journey-state.ts src/domain/framework.test.ts
git commit -m "feat: derive prioritized journey state"
```

### Task 5: Migrate persistence and active-app source state

**Files:**
- Modify: `src/persistence.ts`
- Modify: `src/AppRescued.tsx`

**Interfaces:**
- Consumes: `TripIntent`, `scoreTingo()`, `deriveJourneyState()`, and structured evidence.
- Produces: persisted answers plus trip intent; re-derived dimensions; no independently editable persisted dimensions.

- [ ] **Step 1: Extend persistence compatibly**

Add `tripIntent?: TripIntent` as an optional field. Keep loading version 1 data valid, but ignore any stored `tingoDimensions` when `tingoAnswers` are present; derive from answers. The retrospective plan owns confirmed learning history and pending proposal persistence.

- [ ] **Step 2: Re-derive Tingo dimensions in `AppRescued.tsx`**

Replace the independently initialized dimension state with:

```ts
const [tingoAnswers, setTingoAnswers] = useState<TingoAnswer[]>(stored.tingoAnswers ?? []);
const tingoDimensions = useMemo(() => scoreTingo(tingoAnswers), [tingoAnswers]);
```

Keep `setTingoAnswers()` as the only questionnaire mutation and remove any setter that independently edits dimensions. Retake uses the same answer path.

- [ ] **Step 3: Integrate `TripIntent` without changing the existing P0 generator contract**

Construct `TripIntent` from the existing source fields and pass its fields into `generateTripPlan()`. The later workspace plan will move the visible fields and handlers into trip-owned components.

- [ ] **Step 4: Inspect the exact active-app diff**

Run: `git diff -- src/AppRescued.tsx`

Expected: only the Tingo derivation and Trip Intent source-state integration are changed; no whole-file replacement and no unrelated UI changes.

- [ ] **Step 5: Run validation and commit**

Run: `npm run check`

Expected: TypeScript, Vitest, and Vite build pass.

```bash
git add src/persistence.ts src/AppRescued.tsx
git commit -m "feat: persist trip intent and derive Tingo from answers"
```
