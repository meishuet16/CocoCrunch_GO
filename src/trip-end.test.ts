import { describe, expect, it } from 'vitest';
import { shouldPromptToEndTrip } from './trip-end';

describe('shouldPromptToEndTrip', () => {
  it('detects a passed return date or a fully completed daily itinerary', () => {
    expect(shouldPromptToEndTrip({ now: new Date(2026, 8, 12), returnDate: '2026-09-11', allTodayItemsComplete: false })).toBe(true);
    expect(shouldPromptToEndTrip({ now: new Date(2026, 8, 12), returnDate: '2026-09-12', allTodayItemsComplete: false })).toBe(false);
    expect(shouldPromptToEndTrip({ now: new Date(2026, 8, 12), returnDate: undefined, allTodayItemsComplete: true })).toBe(true);
  });
});
