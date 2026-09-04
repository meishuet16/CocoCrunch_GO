import { describe, expect, it } from 'vitest';
import { deriveGroupDNA, type GroupMemberInput } from './group-dna';
import { defaultTingoDimensions, deriveTingoBehavior } from './tingo';
import { generateTripPlan, type DestinationCandidate } from './itinerary';
import type { GroupDNA } from './group-dna';
import { calculatePlanHealth } from './plan-health';
import { applyRepairToPlan, buildMinimumLossRepair, promoteCourtLosers, type BackupCandidate } from './backup-repair';
import type { TripPlan } from './itinerary';

const tingoBehavior = deriveTingoBehavior(defaultTingoDimensions);
const emptyDNA: GroupDNA = { sharedPriorities: [], optionalPreferences: [], budgetRange: { min: 0, max: 0 }, budgetSensitivity: 'low', conflicts: [], evidence: [] };
const candidates: DestinationCandidate[] = [
  { id: 'anchor', name: 'Harbour walk', type: 'Food · market', tags: ['food', 'outdoor'], estimatedCost: 40, durationMinutes: 90, transferMinutes: 15, walkingKm: 1.2, indoor: false, why: 'Explicit candidate', source: 'prototype-catalog' },
  { id: 'cafe', name: 'Scenic café', type: 'Cafés', tags: ['cafe', 'scenic', 'indoor'], estimatedCost: 30, durationMinutes: 90, transferMinutes: 10, walkingKm: 0.6, indoor: true, why: 'Candidate detail', source: 'prototype-catalog' },
  { id: 'market', name: 'Night market', type: 'Market', tags: ['market', 'outdoor'], estimatedCost: 25, durationMinutes: 90, transferMinutes: 20, walkingKm: 1.5, indoor: false, why: 'Candidate detail', source: 'prototype-catalog' },
];
const itineraryInput = { destination: 'Test', tingoBehavior, tripVibe: 'Food', mustGo: 'Harbour walk', dealBreaker: 'No raw-only dinner', preference: 'Scenic café', flexible: 'Night market can move', budget: 300, members: [], groupDNA: emptyDNA, candidates };
const plan = generateTripPlan(itineraryInput);

describe('Group Travel DNA', () => {
  it('surfaces a strong Must-Go versus Strongly Avoid conflict instead of averaging it', () => {
    const dna = deriveGroupDNA([
      { id: 'a', name: 'A', tingoAssessed: false, preferences: [{ id: 'a1', label: 'Night market', kind: 'must-go', strength: 'strong', source: 'member' }] },
      { id: 'b', name: 'B', tingoAssessed: false, preferences: [{ id: 'b1', label: 'Night market', kind: 'strongly-avoid', strength: 'strong', source: 'member' }] },
    ]);

    expect(dna.conflicts).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'must-go-vs-strongly-avoid', label: 'Night market' }),
    ]));
    expect(dna.sharedPriorities).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ label: 'Night market', support: 2 }),
    ]));
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
    const members: GroupMemberInput[] = [
      { id: 'a', name: 'A', tingoAssessed: false, budget: { min: 500, max: 800, sensitivity: 'high' }, preferences: [{ id: 'a1', label: 'Scenic café', kind: 'preference', strength: 'optional', source: 'member' }] },
      { id: 'b', name: 'B', tingoAssessed: false, budget: { min: 700, max: 1000, sensitivity: 'medium' }, preferences: [{ id: 'b1', label: 'Scenic café', kind: 'preference', strength: 'optional', source: 'member' }] },
    ];
    const dna = deriveGroupDNA(members);

    expect(dna.optionalPreferences[0]).toMatchObject({ label: 'Scenic café', support: 2 });
    expect(dna.budgetRange).toEqual({ min: 500, max: 1000 });
    expect(dna.budgetSensitivity).toBe('high');
  });
});

describe('deterministic itinerary generation', () => {
  it('keeps Must-Go as a protected anchor and never replaces it', () => {
    const plan = generateTripPlan(itineraryInput);

    expect(plan.items.find(item => item.name === 'Harbour walk')).toMatchObject({ kind: 'anchor', protected: true });
    expect(plan.protectedAnchorIds).toContain('anchor');
  });

  it('returns stable time blocks, a buffer, and evidence tied to real inputs', () => {
    const first = generateTripPlan(itineraryInput);
    const second = generateTripPlan(itineraryInput);

    expect(first).toEqual(second);
    expect(first.items.map(item => item.kind)).toEqual(expect.arrayContaining(['anchor', 'floating', 'buffer', 'open']));
    expect(first.items.flatMap(item => item.evidence).map(item => item.source)).toEqual(expect.arrayContaining(['tingo', 'trip-vibe', 'constraint', 'candidate']));
  });

  it('includes evidence for explicit member preferences without using them as Tingo data', () => {
    const memberPreferencePlan = generateTripPlan({
      ...itineraryInput,
      members: [{
        id: 'jh',
        name: 'JH',
        role: 'Food scout',
        inviteStatus: 'joined',
        pace: 'steady',
        preferenceProfile: {
          tingoAssessed: false,
          preferences: [{ id: 'member-cafe', label: 'Scenic café', kind: 'preference', strength: 'strong', source: 'member' }],
        },
      }],
    });

    const floating = memberPreferencePlan.items.find(item => item.kind === 'floating');
    expect(floating?.evidence.some(entry => entry.source === 'member-preference')).toBe(true);
    expect(floating?.evidence.some(entry => entry.source === 'tingo')).toBe(true);
    expect(floating?.evidence.some(entry => entry.source === 'budget')).toBe(true);
  });

  it('removes a Court-resolved conflict from generated operational risks', () => {
    const conflictDNA = {
      ...emptyDNA,
      conflicts: [{ kind: 'strong-disagreement' as const, label: 'Dinner', members: ['A', 'B'], reason: 'Strong preferences disagree.' }],
    };
    const unresolved = generateTripPlan({ ...itineraryInput, groupDNA: conflictDNA });
    const resolved = generateTripPlan({ ...itineraryInput, groupDNA: conflictDNA, resolvedConflictLabels: ['Dinner'] });

    expect(unresolved.unresolvedRisks).toContain('Preference conflict: Dinner. Group Court is required before a substantive change.');
    expect(resolved.unresolvedRisks).not.toContain('Preference conflict: Dinner. Group Court is required before a substantive change.');
  });
});

describe('Plan Health', () => {
  it('changes when walking load changes and exposes the deduction reason', () => {
    const healthy = calculatePlanHealth({ plan: { ...plan, walkingKm: 2 }, budget: 300, groupDNA: emptyDNA, tingoBehavior, dealBreaker: '' });
    const tiring = calculatePlanHealth({ plan: { ...plan, walkingKm: 12 }, budget: 300, groupDNA: emptyDNA, tingoBehavior, dealBreaker: '' });

    expect(tiring.overall).toBeLessThan(healthy.overall);
    expect(tiring.metrics.walkingDeduction).toBeGreaterThan(healthy.metrics.walkingDeduction);
    expect(tiring.reasons.join(' ').toLocaleLowerCase()).toContain('walking');
  });

  it('derives budget and unresolved-conflict deductions instead of using a fixed score', () => {
    const result = calculatePlanHealth({
      plan: { ...plan, totalEstimatedCost: 450 },
      budget: 300,
      groupDNA: { ...emptyDNA, conflicts: [{ kind: 'strong-disagreement', label: 'Dinner', members: ['A', 'B'], reason: 'Strong preferences disagree.' }] },
      tingoBehavior,
      dealBreaker: '',
    });

    expect(result.metrics.budgetOverrun).toBe(150);
    expect(result.metrics.unresolvedConflicts).toBe(1);
    expect(result.deductions.map(item => item.component)).toEqual(expect.arrayContaining(['budget', 'conflicts']));
  });

  it('deducts unresolved operational risks and explains the deduction', () => {
    const healthy = calculatePlanHealth({ plan, budget: 300, groupDNA: emptyDNA, tingoBehavior, dealBreaker: '' });
    const disrupted = calculatePlanHealth({
      plan: { ...plan, unresolvedRisks: ['Rain may close the outdoor floating item.'] },
      budget: 300,
      groupDNA: emptyDNA,
      tingoBehavior,
      dealBreaker: '',
    });

    expect(disrupted.overall).toBeLessThan(healthy.overall);
    expect(disrupted.metrics.unresolvedRisks).toBe(1);
    expect(disrupted.deductions.some(reason => reason.component === 'risks')).toBe(true);
  });

  it('stops penalizing a Group DNA conflict after its matching Court resolution', () => {
    const conflictDNA = { ...emptyDNA, conflicts: [{ kind: 'strong-disagreement' as const, label: 'Dinner', members: ['A', 'B'], reason: 'Strong preferences disagree.' }] };
    const unresolved = calculatePlanHealth({ plan, budget: 300, groupDNA: conflictDNA, tingoBehavior, dealBreaker: '' });
    const resolved = calculatePlanHealth({ plan, budget: 300, groupDNA: conflictDNA, tingoBehavior, dealBreaker: '', resolvedConflictLabels: ['Dinner'] });

    expect(resolved.metrics.unresolvedConflicts).toBe(0);
    expect(resolved.overall).toBeGreaterThan(unresolved.overall);
  });
});

describe('Backup Plan and minimum-loss repair', () => {
  const repairPlan: TripPlan = {
    destination: 'Test',
    items: [
      { id: 'anchor', name: 'Harbour walk', kind: 'anchor', startMinutes: 600, endMinutes: 690, timeLabel: '10:00', estimatedCost: 40, transferMinutes: 15, walkingKm: 1.2, protected: true, evidence: [] },
      { id: 'outdoor', name: 'Outdoor block', kind: 'floating', startMinutes: 780, endMinutes: 870, timeLabel: '13:00', estimatedCost: 30, transferMinutes: 10, walkingKm: 1, protected: false, evidence: [] },
      { id: 'open', name: 'Open pocket', kind: 'open', startMinutes: 1020, endMinutes: 1080, timeLabel: '17:00', estimatedCost: 0, transferMinutes: 0, walkingKm: 0, protected: false, evidence: [] },
    ],
    tripPromise: 'Food with room to breathe',
    totalEstimatedCost: 70,
    walkingKm: 2.2,
    transferMinutes: 25,
    protectedAnchorIds: ['anchor'],
    unresolvedRisks: [],
  };

  it('keeps only useful viable Court losers and rejects Deal-Breaker-invalid options', () => {
    const backups = promoteCourtLosers([
      { id: 'winner', label: 'Indoor hall', support: 3 },
      { id: 'good', label: 'Kissaten', support: 2, viable: true, dealBreakerSafe: true, costDelta: 6, timeDeltaMinutes: 8, lossReason: 'Lost narrowly after the group protected the anchor.' },
      { id: 'bad', label: 'Raw-only dinner', support: 1, viable: true, dealBreakerSafe: false },
      { id: 'blocked', label: 'Closed market', support: 1, viable: false },
    ], 'winner', 'No raw-only dinner');

    expect(backups).toHaveLength(1);
    expect(backups[0]).toMatchObject({ id: 'good', support: 2, lossReason: 'Lost narrowly after the group protected the anchor.' });
  });

  it('protects anchors and prefers the highest-support viable backup', () => {
    const lowSupportBackup: BackupCandidate = { id: 'low-support', name: 'Lower support', support: 1, costDelta: 2, timeDeltaMinutes: 4, viable: true, dealBreakerSafe: true, lossReason: 'Lost the Court vote.', source: 'court-loss', evidence: [] };
    const highSupportBackup: BackupCandidate = { id: 'high-support', name: 'Higher support', support: 3, costDelta: 4, timeDeltaMinutes: 6, viable: true, dealBreakerSafe: true, lossReason: 'Lost the Court vote.', source: 'court-loss', evidence: [] };
    const repair = buildMinimumLossRepair({ plan: repairPlan, failedItemId: 'outdoor', backups: [lowSupportBackup, highSupportBackup], budgetRemaining: 100, mode: 'solo' });

    expect(repair.replacement?.id).toBe('high-support');
    expect(repair.protectedAnchorIds).toContain('anchor');
    expect(repair.preview.join(' ')).toContain('KEEP');
    expect(buildMinimumLossRepair({ plan: repairPlan, failedItemId: 'anchor', backups: [highSupportBackup], budgetRemaining: 100, mode: 'solo' }).applicable).toBe(false);
  });

  it('reports exact cost/time impacts and blocks unconfirmed Group apply', () => {
    const highSupportBackup: BackupCandidate = { id: 'high-support', name: 'Higher support', support: 3, costDelta: 8, timeDeltaMinutes: 12, viable: true, dealBreakerSafe: true, lossReason: 'Lost the Court vote.', source: 'court-loss', evidence: [] };
    const repair = buildMinimumLossRepair({ plan: repairPlan, failedItemId: 'outdoor', backups: [highSupportBackup], budgetRemaining: 100, mode: 'group' });

    expect(repair.impact).toMatchObject({ costDelta: 8, timeDeltaMinutes: 12 });
    expect(repair.requiresGroupConfirmation).toBe(true);
    expect(applyRepairToPlan(repairPlan, repair, false).applied).toBe(false);
    expect(applyRepairToPlan(repairPlan, repair, true).applied).toBe(true);
  });
});
