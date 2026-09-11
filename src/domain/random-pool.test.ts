import { describe, expect, it } from 'vitest';
import { deriveEverydayDrawPool } from './random-pool';

describe('deriveEverydayDrawPool', () => {
  it('keeps viable context candidates unique and leaves source data untouched', () => {
    const input = [
      { name: 'Riverside walk', source: 'floating-itinerary' as const },
      { name: 'Riverside walk', source: 'saved-idea' as const },
      { name: 'Rejected museum', source: 'court-skipped' as const },
      { name: 'Blocked dinner', source: 'backup' as const, viable: true, dealBreakerSafe: false },
      { name: 'Optional gallery', source: 'optional' as const },
    ];
    expect(deriveEverydayDrawPool(input)).toEqual(['Riverside walk', 'Rejected museum', 'Optional gallery']);
    expect(input).toHaveLength(5);
  });

  it('returns an honest empty pool when context has no valid candidates', () => {
    expect(deriveEverydayDrawPool([{ name: 'Nope', source: 'backup', viable: false }])).toEqual([]);
  });
});
