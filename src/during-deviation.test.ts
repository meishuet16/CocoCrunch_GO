import { describe, expect, it } from 'vitest';
import { isPastPlannedCheckIn } from './during-deviation';

describe('isPastPlannedCheckIn', () => {
  it('flags an overdue saved stop only after its grace period', () => {
    expect(isPastPlannedCheckIn(new Date(2026, 0, 1, 10, 19), 10 * 60)).toBe(false);
    expect(isPastPlannedCheckIn(new Date(2026, 0, 1, 10, 20), 10 * 60)).toBe(true);
  });
});
