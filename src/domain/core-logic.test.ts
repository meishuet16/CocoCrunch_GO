import { describe, expect, it } from 'vitest';
import { deriveGroupDNA, type GroupMemberInput } from './group-dna';
import { defaultTingoDimensions, deriveTingoBehavior } from './tingo';
import { generateTripPlan, type DestinationCandidate } from './itinerary';
import type { GroupDNA } from './group-dna';

const tingoBehavior = deriveTingoBehavior(defaultTingoDimensions);
const emptyDNA: GroupDNA = { sharedPriorities: [], optionalPreferences: [], budgetRange: { min: 0, max: 0 }, budgetSensitivity: 'low', conflicts: [], evidence: [] };
const candidates: DestinationCandidate[] = [
  { id: 'anchor', name: 'Harbour walk', type: 'Food · market', tags: ['food', 'outdoor'], estimatedCost: 40, durationMinutes: 90, transferMinutes: 15, walkingKm: 1.2, indoor: false, why: 'Explicit candidate', source: 'prototype-catalog' },
  { id: 'cafe', name: 'Scenic café', type: 'Cafés', tags: ['cafe', 'scenic', 'indoor'], estimatedCost: 30, durationMinutes: 90, transferMinutes: 10, walkingKm: 0.6, indoor: true, why: 'Candidate detail', source: 'prototype-catalog' },
  { id: 'market', name: 'Night market', type: 'Market', tags: ['market', 'outdoor'], estimatedCost: 25, durationMinutes: 90, transferMinutes: 20, walkingKm: 1.5, indoor: false, why: 'Candidate detail', source: 'prototype-catalog' },
];
const itineraryInput = { destination: 'Test', tingoBehavior, tripVibe: 'Food', mustGo: 'Harbour walk', dealBreaker: 'No raw-only dinner', preference: 'Scenic café', flexible: 'Night market can move', budget: 300, members: [], groupDNA: emptyDNA, candidates };

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
});
