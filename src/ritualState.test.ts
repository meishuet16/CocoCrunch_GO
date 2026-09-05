import { afterEach, expect, it, vi } from 'vitest';
import { commitRitualState, loadRitualState, memoryEligible, qualifiesForPrayer } from './ritualState';

afterEach(() => vi.unstubAllGlobals());
it('acknowledges storage before success and preserves unrelated ritual records', () => {
  let raw: string | null = null;
  vi.stubGlobal('localStorage', { getItem: () => raw, setItem: (_: string, value: string) => { raw = value; } });
  expect(commitRitualState({ savedIdeas: [{ name: 'Kyoto café', source: 'prototype-catalog' }] })).toBe(true);
  expect(commitRitualState({ releasedWishIds: [7] })).toBe(true);
  expect(loadRitualState().savedIdeas?.[0].name).toBe('Kyoto café');
  expect(loadRitualState().releasedWishIds).toEqual([7]);
});
it('does not celebrate blocked persistence', () => {
  vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => { throw new Error('quota'); } });
  expect(commitRitualState({ releasedWishIds: [7] })).toBe(false);
});
it('keeps expressive memory closed until outcome, reflection and explicit learning decision', () => {
  expect(memoryEligible(true, 'yes', false, 'proposed')).toBe(false);
  expect(memoryEligible(false, 'yes', true)).toBe(false);
  expect(memoryEligible(true, null, true)).toBe(false);
  expect(memoryEligible(true, 'yes', true)).toBe(true);
  expect(memoryEligible(true, 'yes', false, 'dismissed')).toBe(true);
});
it('no direct Backup does not qualify while useful schedule repair remains', () => {
  const input = { important: true, uncontrollable: true, actionsExhausted: true, usefulRepair: true };
  expect(qualifiesForPrayer(input)).toBe(false);
  expect(qualifiesForPrayer({ ...input, usefulRepair: false })).toBe(true);
  expect(qualifiesForPrayer({ ...input, usefulRepair: false, actionsExhausted: false })).toBe(false);
});
