# P0 Core Logic Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the remaining P0 prototype logic with deterministic, explainable domain models wired into the active `AppRescued` flow.

**Architecture:** Keep `AppRescued.tsx` as the orchestration and presentation layer, while adding focused domain modules for Group DNA, itinerary generation, Plan Health, and Backup/repair. Persist only member preference evidence, Court/Backup source data, and durable decisions; re-derive plans and health from those inputs.

**Tech Stack:** TypeScript, React, Vitest, Vite, existing localStorage persistence.

## Global Constraints

- `feat/p0-foundation` remains the working branch at the checked-out rescue state.
- `D:/dunno/codenection26/FINAL_PRODUCT_SPEC.md` v6 is the authoritative product source of truth.
- `src/AppRescued.tsx` is the active app implementation; preserve its existing UI and architecture.
- Tingo is a long-term per-member profile; Trip Vibe and trip-specific constraints remain separate inputs.
- Must-Go cannot be removed or replaced by generation or repair.
- Deal-Breaker-invalid options cannot enter the Backup pool.
- Strong conflicts are surfaced; they are never silently averaged or selected for Group mode.
- Gacha is tie-only and remains separate from Lucky Draw and everyday Gacha.
- No free-form AI generation or fabricated live-data evidence for P0 logic.
- Do not merge PR #1 or push to main.

---

### Task 1: Add Group Travel DNA domain model

**Files:**
- Create: `src/domain/group-dna.ts`
- Modify: `src/domain/trip.ts`
- Modify: `src/domain/index.ts`
- Test: `src/domain/core-logic.test.ts`

**Interfaces:**
- `MemberPreference = { id: string; label: string; kind: 'must-go' | 'strongly-avoid' | 'preference' | 'flexible'; strength: 'strong' | 'optional'; source: 'member' | 'tingo' | 'trip' }`
- `MemberBudgetProfile = { min: number; max: number; sensitivity: 'low' | 'medium' | 'high' }`
- `MemberPreferenceProfile = { tingoAssessed: boolean; preferences: MemberPreference[]; budget?: MemberBudgetProfile }`
- `GroupMemberInput = { id: string; name: string; preferences: MemberPreference[]; budget?: MemberBudgetProfile; tingoAssessed: boolean }`
- `GroupSignal = { label: string; support: number; members: string[]; strength: 'strong' | 'optional' }`
- `GroupConflict = { kind: 'strong-disagreement' | 'must-go-vs-strongly-avoid'; label: string; members: string[]; reason: string }`
- `GroupDNA = { sharedPriorities: GroupSignal[]; optionalPreferences: GroupSignal[]; budgetRange: { min: number; max: number }; budgetSensitivity: 'low' | 'medium' | 'high'; conflicts: GroupConflict[]; evidence: string[] }`
- `deriveGroupDNA(members: GroupMemberInput[]): GroupDNA`

- [ ] **Step 1: Write failing tests for explicit aggregation and conflicts**

```ts
import { deriveGroupDNA, type GroupMemberInput } from './group-dna';

it('surfaces a strong Must-Go versus Strongly Avoid conflict instead of averaging it', () => {
  const dna = deriveGroupDNA([
    { id: 'a', name: 'A', tingoAssessed: false, preferences: [{ id: 'a1', label: 'Night market', kind: 'must-go', strength: 'strong', source: 'member' }] },
    { id: 'b', name: 'B', tingoAssessed: false, preferences: [{ id: 'b1', label: 'Night market', kind: 'strongly-avoid', strength: 'strong', source: 'member' }] },
  ]);

  expect(dna.conflicts).toEqual(expect.arrayContaining([
    expect.objectContaining({ kind: 'must-go-vs-strongly-avoid', label: 'Night market' }),
  ]));
  expect(dna.sharedPriorities).not.toEqual(expect.arrayContaining([expect.objectContaining({ label: 'Night market', support: 2 })]));
});

it('does not project Mei Tingo assessment onto unassessed members', () => {
  const dna = deriveGroupDNA([
    { id: 'mei', name: 'Mei', tingoAssessed: true, preferences: [{ id: 'm', label: 'Food', kind: 'preference', strength: 'strong', source: 'tingo' }] },
    { id: 'jh', name: 'JH', tingoAssessed: false, preferences: [] },
  ]);

  expect(dna.sharedPriorities).toHaveLength(0);
  expect(dna.evidence.join(' ')).toContain('JH');
  expect(dna.evidence.join(' ')).toContain('not assessed');
});

it('retains optional support and the observed budget range', () => {
  const dna = deriveGroupDNA([
    { id: 'a', name: 'A', tingoAssessed: false, budget: { min: 500, max: 800, sensitivity: 'high' }, preferences: [{ id: 'a1', label: 'Scenic café', kind: 'preference', strength: 'optional', source: 'member' }] },
    { id: 'b', name: 'B', tingoAssessed: false, budget: { min: 700, max: 1000, sensitivity: 'medium' }, preferences: [{ id: 'b1', label: 'Scenic café', kind: 'preference', strength: 'optional', source: 'member' }] },
  ]);

  expect(dna.optionalPreferences[0]).toMatchObject({ label: 'Scenic café', support: 2 });
  expect(dna.budgetRange).toEqual({ min: 500, max: 1000 });
  expect(dna.budgetSensitivity).toBe('high');
});
```

- [ ] **Step 2: Run only the new tests to verify the expected missing-module failure**

Run: `npm test -- src/domain/core-logic.test.ts`

Expected: FAIL because `src/domain/group-dna.ts` and `deriveGroupDNA` do not exist.

- [ ] **Step 3: Implement the smallest deterministic model**

Normalize labels case-insensitively for grouping, count member support once per label, keep strong Must-Go/Strongly Avoid pairs in `conflicts`, compute min/max across supplied budgets, and choose the maximum sensitivity using `high > medium > low`. Record each member’s assessment status in `evidence`; never synthesize preferences for a member without explicit data.

- [ ] **Step 4: Add optional preference profile fields to `TripMember` and export the domain module**

Add `preferenceProfile?: { tingoAssessed: boolean; preferences: MemberPreference[]; budget?: MemberBudgetProfile }` to `TripMember`, keep existing defaults backward-compatible, and add `export * from './group-dna';` to `src/domain/index.ts`.

- [ ] **Step 5: Run the focused tests and commit**

Run: `npm test -- src/domain/core-logic.test.ts`

Expected: the Group DNA tests pass.

Commit: `git add src/domain/group-dna.ts src/domain/trip.ts src/domain/index.ts src/domain/core-logic.test.ts && git commit -m "feat: derive group travel DNA from member inputs"`

### Task 2: Add deterministic itinerary generation with evidence

**Files:**
- Create: `src/domain/itinerary.ts`
- Modify: `src/domain/discovery.ts`
- Modify: `src/domain/index.ts`
- Test: `src/domain/core-logic.test.ts`

**Interfaces:**
- `DestinationCandidate = { id: string; name: string; type: string; tags: string[]; estimatedCost: number; durationMinutes: number; transferMinutes: number; walkingKm: number; indoor: boolean; why: string; source: 'prototype-catalog' | 'fallback' }`
- `RecommendationEvidence = { source: 'tingo' | 'trip-vibe' | 'constraint' | 'member-preference' | 'group-consensus' | 'budget' | 'candidate'; label: string; detail: string }`
- `ItineraryItem = { id: string; name: string; kind: 'anchor' | 'floating' | 'buffer' | 'open'; startMinutes: number; endMinutes: number; timeLabel: string; estimatedCost: number; transferMinutes: number; walkingKm: number; protected: boolean; candidateId?: string; evidence: RecommendationEvidence[] }`
- `TripPlan = { destination: string; items: ItineraryItem[]; tripPromise: string; totalEstimatedCost: number; walkingKm: number; transferMinutes: number; protectedAnchorIds: string[]; unresolvedRisks: string[] }`
- `generateTripPlan(input: { destination: string; tingoBehavior: TingoBehavior; tripVibe: string; mustGo: string; dealBreaker: string; preference: string; flexible: string; budget: number; members: TripMember[]; groupDNA: GroupDNA; candidates: DestinationCandidate[] }): TripPlan`

- [ ] **Step 1: Write failing tests for protected anchors, buffers, evidence, and deterministic output**

```ts
import { generateTripPlan, type DestinationCandidate } from './itinerary';
import { defaultTingoDimensions, deriveTingoBehavior } from './tingo';
import type { GroupDNA } from './group-dna';

const candidates: DestinationCandidate[] = [
  { id: 'anchor', name: 'Harbour walk', type: 'Food · market', tags: ['food', 'outdoor'], estimatedCost: 40, durationMinutes: 90, transferMinutes: 15, walkingKm: 1.2, indoor: false, why: 'Explicit candidate', source: 'prototype-catalog' },
  { id: 'cafe', name: 'Scenic café', type: 'Cafés', tags: ['cafe', 'scenic', 'indoor'], estimatedCost: 30, durationMinutes: 90, transferMinutes: 10, walkingKm: 0.6, indoor: true, why: 'Candidate detail', source: 'prototype-catalog' },
  { id: 'market', name: 'Night market', type: 'Market', tags: ['market', 'outdoor'], estimatedCost: 25, durationMinutes: 90, transferMinutes: 20, walkingKm: 1.5, indoor: false, why: 'Candidate detail', source: 'prototype-catalog' },
];

const tingoBehavior = deriveTingoBehavior(defaultTingoDimensions);
const emptyDNA: GroupDNA = { sharedPriorities: [], optionalPreferences: [], budgetRange: { min: 0, max: 0 }, budgetSensitivity: 'low', conflicts: [], evidence: [] };
const input = { destination: 'Test', tingoBehavior, tripVibe: 'Food', mustGo: 'Harbour walk', dealBreaker: 'No raw-only dinner', preference: 'Scenic café', flexible: 'Night market can move', budget: 300, members: [], groupDNA: emptyDNA, candidates };
const plan = generateTripPlan(input);

it('keeps Must-Go as a protected anchor and never replaces it', () => {
  const plan = generateTripPlan({ destination: 'Test', tingoBehavior, tripVibe: 'Food', mustGo: 'Harbour walk', dealBreaker: 'No raw-only dinner', preference: 'Scenic café', flexible: 'Night market can move', budget: 300, members: [], groupDNA: emptyDNA, candidates });

  expect(plan.items.find(item => item.name === 'Harbour walk')).toMatchObject({ kind: 'anchor', protected: true });
  expect(plan.protectedAnchorIds).toContain('anchor');
});

it('returns stable time blocks, a buffer, and evidence tied to real inputs', () => {
  const first = generateTripPlan(input);
  const second = generateTripPlan(input);

  expect(first).toEqual(second);
  expect(first.items.map(item => item.kind)).toEqual(expect.arrayContaining(['anchor', 'floating', 'buffer', 'open']));
  expect(first.items.flatMap(item => item.evidence).map(item => item.source)).toEqual(expect.arrayContaining(['tingo', 'trip-vibe', 'constraint', 'candidate']));
});
```

- [ ] **Step 2: Run the focused tests and verify they fail for the missing generator**

Run: `npm test -- src/domain/core-logic.test.ts`

Expected: FAIL because `src/domain/itinerary.ts` and `generateTripPlan` do not exist.

- [ ] **Step 3: Add structured candidate attributes to the local discovery catalog**

Retain existing display fields and add deterministic numeric/boolean/tag attributes for catalog entries. Preserve explicit `source` labels and fallback warnings. Do not add claims of live weather, maps, prices, or availability.

- [ ] **Step 4: Implement `generateTripPlan`**

Select an exact or normalized-name Must-Go candidate first; otherwise create a constraint-only anchor with no fabricated candidate evidence. Filter candidates using the Deal Breaker matcher. Rank remaining candidates using explicit Trip Vibe, preference, group support, Tingo behavior, budget fit, and candidate tags. Lay out the anchor, the behavior-derived buffer, the best floating candidate, and an open/flexible block with deterministic clock arithmetic. Attach evidence for every selected input and record unresolved risks instead of silently choosing around a conflict.

- [ ] **Step 5: Run the focused tests, then commit**

Run: `npm test -- src/domain/core-logic.test.ts`

Expected: itinerary tests pass.

Commit: `git add src/domain/itinerary.ts src/domain/discovery.ts src/domain/index.ts src/domain/core-logic.test.ts && git commit -m "feat: generate deterministic evidence-backed trip plans"`

### Task 3: Add documented Plan Health calculation

**Files:**
- Create: `src/domain/plan-health.ts`
- Modify: `src/domain/index.ts`
- Test: `src/domain/core-logic.test.ts`

**Interfaces:**
- `PlanHealthMetrics = { walkingKm: number; walkingDeduction: number; timePressureMinutes: number; timeDeduction: number; budgetOverrun: number; budgetDeduction: number; preferenceMisses: number; preferenceDeduction: number; transferMinutes: number; transferDeduction: number; protectedAnchors: number; unprotectedAnchors: number; anchorDeduction: number; unresolvedConflicts: number; conflictDeduction: number }`
- `PlanHealthMetrics = { walkingKm: number; walkingDeduction: number; availableBufferMinutes: number; timePressureMinutes: number; timeDeduction: number; budgetOverrun: number; budgetDeduction: number; preferenceMisses: number; preferenceDeduction: number; transferMinutes: number; transferDeduction: number; protectedAnchors: number; unprotectedAnchors: number; anchorDeduction: number; unresolvedConflicts: number; conflictDeduction: number }`
- `PlanHealth = { overall: number; metrics: PlanHealthMetrics; deductions: { component: string; points: number; reason: string }[]; reasons: string[] }`
- `calculatePlanHealth(input: { plan: TripPlan; budget: number; groupDNA: GroupDNA; tingoBehavior: TingoBehavior; dealBreaker: string }): PlanHealth`

- [ ] **Step 1: Write failing formula tests**

```ts
import { calculatePlanHealth } from './plan-health';

it('changes when walking load changes and exposes the deduction reason', () => {
  const healthy = calculatePlanHealth({ plan: { ...plan, walkingKm: 2 }, budget: 300, groupDNA: emptyDNA, tingoBehavior, dealBreaker: '' });
  const tiring = calculatePlanHealth({ plan: { ...plan, walkingKm: 12 }, budget: 300, groupDNA: emptyDNA, tingoBehavior, dealBreaker: '' });

  expect(tiring.overall).toBeLessThan(healthy.overall);
  expect(tiring.metrics.walkingDeduction).toBeGreaterThan(healthy.metrics.walkingDeduction);
  expect(tiring.reasons.join(' ')).toContain('walking');
});

it('derives budget and unresolved-conflict deductions instead of using a fixed score', () => {
  const result = calculatePlanHealth({ plan: { ...plan, totalEstimatedCost: 450 }, budget: 300, groupDNA: { ...emptyDNA, conflicts: [{ kind: 'strong-disagreement', label: 'Dinner', members: ['A', 'B'], reason: 'Strong preferences disagree.' }] }, tingoBehavior, dealBreaker: '' });

  expect(result.metrics.budgetOverrun).toBe(150);
  expect(result.metrics.unresolvedConflicts).toBe(1);
  expect(result.deductions.map(item => item.component)).toEqual(expect.arrayContaining(['budget', 'conflicts']));
});
```

- [ ] **Step 2: Run the focused tests and verify the missing-module failure**

Run: `npm test -- src/domain/core-logic.test.ts`

Expected: FAIL because `calculatePlanHealth` does not exist.

- [ ] **Step 3: Implement the documented formula**

Use `overall = max(0, 100 - sum(deductions))` with these independently capped deductions. Define `availableBufferMinutes` as the sum of `buffer` item durations and `timePressureMinutes` as `max(0, tingoBehavior.bufferMinutes - availableBufferMinutes)`:

```ts
walkingDeduction = clamp(round(max(0, walkingKm - 5) * 2), 0, 18)
timeDeduction = clamp(round(timePressureMinutes / 5), 0, 18)
budgetDeduction = clamp(round((budgetOverrun / max(1, budget)) * 40), 0, 24)
preferenceDeduction = clamp(preferenceMisses * 8, 0, 16)
transferDeduction = clamp(round(max(0, transferMinutes - 45) / 5), 0, 12)
anchorDeduction = clamp(unprotectedAnchors * 25, 0, 25)
conflictDeduction = clamp(unresolvedConflicts * 10, 0, 20)
```

Compute `preferenceMisses` from actual evidence/constraint matches, never from a hardcoded score. Add one reason per positive deduction and return every input metric needed to audit the score.

- [ ] **Step 4: Run focused tests and commit**

Run: `npm test -- src/domain/core-logic.test.ts`

Expected: Plan Health tests pass.

Commit: `git add src/domain/plan-health.ts src/domain/index.ts src/domain/core-logic.test.ts && git commit -m "feat: calculate explainable plan health"`

### Task 4: Promote viable Court losers and build minimum-loss repair

**Files:**
- Create: `src/domain/backup-repair.ts`
- Modify: `src/persistence.ts`
- Modify: `src/domain/index.ts`
- Test: `src/domain/core-logic.test.ts`

**Interfaces:**
- `BackupCandidate = { id: string; name: string; support: number; costDelta: number; timeDeltaMinutes: number; viable: boolean; dealBreakerSafe: boolean; lossReason: string; source: 'court-loss' | 'destination-candidate' | 'ghost'; evidence: RecommendationEvidence[] }`
- `promoteCourtLosers(options: { id: string; label: string; support: number; viable?: boolean; dealBreakerSafe?: boolean; costDelta?: number; timeDeltaMinutes?: number }[], winnerId: string, dealBreaker: string): BackupCandidate[]`
- `RepairResult = { applicable: boolean; requiresGroupConfirmation: boolean; failedItemId: string | null; replacement: BackupCandidate | null; movedItems: { itemId: string; fromMinutes: number; toMinutes: number }[]; impact: { costDelta: number; timeDeltaMinutes: number; preferenceLoss: number }; protectedAnchorIds: string[]; reasons: string[]; preview: string[] }`
- `buildMinimumLossRepair(input: { plan: TripPlan; failedItemId: string; backups: BackupCandidate[]; budgetRemaining: number; mode: 'group' | 'solo' }): RepairResult`
- `applyRepairToPlan(plan: TripPlan, repair: RepairResult, groupConfirmed: boolean): { applied: boolean; plan: TripPlan; reason?: string }`

- [ ] **Step 1: Write failing Court-loser and repair tests**

```ts
import { applyRepairToPlan, buildMinimumLossRepair, promoteCourtLosers } from './backup-repair';
import type { BackupCandidate } from './backup-repair';
import type { TripPlan } from './itinerary';

it('keeps only useful viable Court losers and rejects Deal-Breaker-invalid options', () => {
  const backups = promoteCourtLosers([
    { id: 'winner', label: 'Indoor hall', support: 3 },
    { id: 'good', label: 'Kissaten', support: 2, viable: true, dealBreakerSafe: true, costDelta: 6, timeDeltaMinutes: 8 },
    { id: 'bad', label: 'Raw-only dinner', support: 1, viable: true, dealBreakerSafe: false },
    { id: 'blocked', label: 'Closed market', support: 1, viable: false },
  ], 'winner', 'No raw-only dinner');

  expect(backups).toHaveLength(1);
  expect(backups[0]).toMatchObject({ id: 'good', support: 2, lossReason: 'Lost the Court vote.' });
});

it('protects anchors and prefers the highest-support viable backup', () => {
  const repairPlan: TripPlan = { destination: 'Test', items: [
    { id: 'anchor', name: 'Harbour walk', kind: 'anchor', startMinutes: 600, endMinutes: 690, timeLabel: '10:00', estimatedCost: 40, transferMinutes: 15, walkingKm: 1.2, protected: true, evidence: [] },
    { id: 'outdoor', name: 'Outdoor block', kind: 'floating', startMinutes: 780, endMinutes: 870, timeLabel: '13:00', estimatedCost: 30, transferMinutes: 10, walkingKm: 1, protected: false, evidence: [] },
    { id: 'open', name: 'Open pocket', kind: 'open', startMinutes: 1020, endMinutes: 1080, timeLabel: '17:00', estimatedCost: 0, transferMinutes: 0, walkingKm: 0, protected: false, evidence: [] },
  ], tripPromise: 'Food with room to breathe', totalEstimatedCost: 70, walkingKm: 2.2, transferMinutes: 25, protectedAnchorIds: ['anchor'], unresolvedRisks: [] };
  const lowSupportBackup: BackupCandidate = { id: 'low-support', name: 'Lower support', support: 1, costDelta: 2, timeDeltaMinutes: 4, viable: true, dealBreakerSafe: true, lossReason: 'Lost the Court vote.', source: 'court-loss', evidence: [] };
  const highSupportBackup: BackupCandidate = { id: 'high-support', name: 'Higher support', support: 3, costDelta: 4, timeDeltaMinutes: 6, viable: true, dealBreakerSafe: true, lossReason: 'Lost the Court vote.', source: 'court-loss', evidence: [] };
  const repair = buildMinimumLossRepair({ plan: repairPlan, failedItemId: 'outdoor', backups: [lowSupportBackup, highSupportBackup], budgetRemaining: 100, mode: 'solo' });

  expect(repair.replacement?.id).toBe('high-support');
  expect(repair.protectedAnchorIds).toContain('anchor');
  expect(repair.preview.join(' ')).toContain('KEEP');
});

it('reports exact cost/time impacts and blocks unconfirmed Group apply', () => {
  const repairPlan: TripPlan = { destination: 'Test', items: [
    { id: 'anchor', name: 'Harbour walk', kind: 'anchor', startMinutes: 600, endMinutes: 690, timeLabel: '10:00', estimatedCost: 40, transferMinutes: 15, walkingKm: 1.2, protected: true, evidence: [] },
    { id: 'outdoor', name: 'Outdoor block', kind: 'floating', startMinutes: 780, endMinutes: 870, timeLabel: '13:00', estimatedCost: 30, transferMinutes: 10, walkingKm: 1, protected: false, evidence: [] },
    { id: 'open', name: 'Open pocket', kind: 'open', startMinutes: 1020, endMinutes: 1080, timeLabel: '17:00', estimatedCost: 0, transferMinutes: 0, walkingKm: 0, protected: false, evidence: [] },
  ], tripPromise: 'Food with room to breathe', totalEstimatedCost: 70, walkingKm: 2.2, transferMinutes: 25, protectedAnchorIds: ['anchor'], unresolvedRisks: [] };
  const highSupportBackup: BackupCandidate = { id: 'high-support', name: 'Higher support', support: 3, costDelta: 8, timeDeltaMinutes: 12, viable: true, dealBreakerSafe: true, lossReason: 'Lost the Court vote.', source: 'court-loss', evidence: [] };
  const repair = buildMinimumLossRepair({ plan: repairPlan, failedItemId: 'outdoor', backups: [highSupportBackup], budgetRemaining: 100, mode: 'group' });

  expect(repair.impact).toMatchObject({ costDelta: 8, timeDeltaMinutes: 12 });
  expect(repair.requiresGroupConfirmation).toBe(true);
  expect(applyRepairToPlan(repairPlan, repair, false).applied).toBe(false);
  expect(applyRepairToPlan(repairPlan, repair, true).applied).toBe(true);
});
```

- [ ] **Step 2: Run focused tests and verify missing-module failure**

Run: `npm test -- src/domain/core-logic.test.ts`

Expected: FAIL because the backup/repair functions do not exist.

- [ ] **Step 3: Implement Court-loser promotion**

Exclude the winning option, options with zero support, `viable === false`, explicit `dealBreakerSafe === false`, and labels matching a Deal Breaker token set. Preserve support, source, and a loss reason. Copy evidence fields instead of inventing live claims.

- [ ] **Step 4: Implement minimum-loss repair and guarded application**

Reject failed anchors. Filter viable, Deal-Breaker-safe backups within the supplied remaining budget, sort by support descending, then preference loss, cost delta, time delta, and id. Replace only the failed floating/open item, move the next open/flexible item to the first generated slot after the replacement, protect all anchors, and compute impacts from plan/candidate fields. Mark Group repairs requiring confirmation whenever a replacement or substantive move occurs. `applyRepairToPlan` must refuse an unconfirmed Group repair and otherwise return a copied plan.

- [ ] **Step 5: Extend persistence types with optional source fields and run focused tests**

Add optional `memberPreferenceProfiles?: Record<string, MemberPreferenceProfile>` and `backupCandidates?: BackupCandidate[]` to `PersistedState`; keep `version: 1` compatibility and do not persist Plan Health.

Run: `npm test -- src/domain/core-logic.test.ts`

Expected: all new domain tests pass.

Commit: `git add src/domain/backup-repair.ts src/persistence.ts src/domain/index.ts src/domain/core-logic.test.ts && git commit -m "feat: promote court backups and repair plans by minimum loss"`

### Task 5: Wire domain outputs into `AppRescued.tsx` incrementally

**Files:**
- Modify: `src/AppRescued.tsx`
- Modify: `src/persistence.ts`

**Interfaces consumed:** `deriveGroupDNA`, `generateTripPlan`, `calculatePlanHealth`, `promoteCourtLosers`, `buildMinimumLossRepair`, `applyRepairToPlan`.

- [ ] **Step 1: Add source state and derived values without changing JSX**

Add persisted `backupCandidates` state and member profile source state. Derive `groupDNA`, structured recommendations, `baseTripPlan`, `visibleTripPlan`, `planHealth`, and `repairPreview` with `useMemo`. Keep Plan Health derived from current plan/budget/conflicts and keep Tingo behavior separate from Trip Vibe/constraints.

- [ ] **Step 2: Inspect the exact App diff before continuing**

Run: `git diff -- src/AppRescued.tsx`

Expected: only imports, source state, and derived values are changed; no whole-file replacement and no unrelated UI rewrite.

- [ ] **Step 3: Replace static itinerary and health display**

Render `visibleTripPlan.items` using the existing itinerary-row classes, show `timeLabel`, item kind, protected state, and item evidence. Render `planHealth.overall`, metric values, and explicit reasons. Replace static toolbox counts with `backupCandidates` viability counts. Render Group DNA shared/optional/conflict/budget data in the existing drawer.

- [ ] **Step 4: Inspect the exact App diff immediately**

Run: `git diff -- src/AppRescued.tsx`

Expected: only the intended itinerary, Plan Health, Group DNA, and Backup drawer sections differ.

- [ ] **Step 5: Wire Court confirmation to Backup promotion**

When a decision is confirmed, call `promoteCourtLosers` with the losing option ids and tally support, then merge by candidate id into `backupCandidates` before writing the existing decision record. Persist the resulting source/evidence state. Do not add Deal-Breaker-invalid options.

- [ ] **Step 6: Wire disruption preview/apply/undo to the repair result**

Build the preview from `repairPreview`. The UI must use its returned replacement name, moved times, cost delta, time delta, and reasons. Group Apply remains disabled until emergency approval. On Apply, use `applyRepairToPlan`, adjust the affected actual budget category by `repairPreview.impact.costDelta`, and save an emergency Decision Record from the returned preview. On Undo, restore the previous visible plan and reverse exactly the recorded actual adjustment.

- [ ] **Step 7: Inspect the exact App diff again and run the focused domain tests**

Run: `git diff -- src/AppRescued.tsx` then `npm test -- src/domain/core-logic.test.ts`

Expected: App diff remains focused and all domain regression tests pass.

- [ ] **Step 8: Commit the controlled integration**

Run: `git add src/AppRescued.tsx src/persistence.ts && git commit -m "feat: wire deterministic P0 logic into rescued app"`

### Task 6: Full verification and rescue-log handoff

**Files:**
- Modify: `docs/COCOCRUNCH_RESCUE_LOG.md`
- Test: all existing and new `src/domain/*.test.ts`

- [ ] **Step 1: Run the complete required check**

Run: `npm run check`

Expected: TypeScript emits no errors, all Vitest tests pass, and Vite production build succeeds.

- [ ] **Step 2: Inspect the exact aggregate diff and branch state**

Run: `git diff origin/feat/p0-foundation...HEAD --stat`; `git diff origin/feat/p0-foundation...HEAD -- src/AppRescued.tsx`; `git status --short --branch`

Expected: only the design/plan docs, focused domain modules, persistence, tests, active App integration, and rescue log are tracked changes; existing untracked `dist/`, `node_modules/`, and `package-lock.json` remain untouched.

- [ ] **Step 3: Update the rescue log with honest validation categories**

Record the exact implementation commit SHA and distinguish: implemented in code, wired into active app, regression tested, exact-head CI green (only if verified), browser/runtime verified (only if run), and visually verified (only if run). State remaining browser/mobile QA limitations if no runtime or visual session was performed.

- [ ] **Step 4: Run final local verification and commit the log**

Run: `npm run check`.

Commit: `git add docs/COCOCRUNCH_RESCUE_LOG.md && git commit -m "docs: record P0 core logic completion"`

Expected: final local check remains green, PR #1 stays open, and no main push or merge occurs.
