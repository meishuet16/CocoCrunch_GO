import { describe, expect, it } from 'vitest';
import { deriveGroupDNA, type GroupMemberInput } from './group-dna';

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
