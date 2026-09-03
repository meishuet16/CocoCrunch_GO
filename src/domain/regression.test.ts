import { describe, expect, it } from 'vitest';
import { canUseGacha, courtTally, type CourtVote } from './court';
import { discoverPlaces } from './discovery';
import { reconcileTripLearning, type TravelProfile } from './preferences';
import { normalizeBudgetActuals, rateDecision, updateBudgetActual } from './retrospective';
import { defaultTingoDimensions, deriveTingoBehavior, scoreTingo } from './tingo';
import type { DecisionRecord } from '../persistence';

const profile: TravelProfile = {
  vibe: 'Relax + Food',
  mustGo: 'Protected anchor',
  veto: 'No raw-only dinner',
  preference: 'One café',
  flexible: 'Evening can move',
};

describe('Group Court governance', () => {
  it('allows official Gacha only on a true unresolved tie', () => {
    const tied: CourtVote[] = [
      { member: 'A', pick: 'hotel-a' },
      { member: 'B', pick: 'hotel-b' },
      { member: 'C', pick: 'hotel-a' },
      { member: 'D', pick: 'hotel-b' },
    ];
    const majority: CourtVote[] = [...tied.slice(0, 3), { member: 'D', pick: 'hotel-a' }];

    expect(canUseGacha(tied)).toBe(true);
    expect(courtTally(tied).majority).toBeNull();
    expect(canUseGacha(majority)).toBe(false);
    expect(courtTally(majority).majority).toBe('hotel-a');
  });

  it('is proposal-ID agnostic rather than food-demo specific', () => {
    const result = courtTally([
      { member: 'A', pick: 'shinjuku' },
      { member: 'B', pick: 'asakusa' },
      { member: 'C', pick: 'shinjuku' },
    ]);
    expect(result.counts).toEqual({ shinjuku: 2, asakusa: 1 });
    expect(result.majority).toBe('shinjuku');
  });
});

describe('Tingo downstream rules', () => {
  it('turns assessment answers into concrete planning behavior', () => {
    const dimensions = scoreTingo([
      { questionId: 'morning', optionId: 'slow' },
      { questionId: 'tradeoff', optionId: 'save' },
      { questionId: 'food', optionId: 'hunt' },
      { questionId: 'change', optionId: 'adapt' },
      { questionId: 'company', optionId: 'connect' },
      { questionId: 'sleep', optionId: 'value' },
    ]);
    const behavior = deriveTingoBehavior(dimensions);

    expect(behavior.itineraryDensity).toBe('gentle');
    expect(behavior.dailyStops).toBe(3);
    expect(behavior.bufferMinutes).toBe(50);
    expect(behavior.recommendationBias).toBe('food');
    expect(behavior.budgetMode).toBe('value-first');
    expect(behavior.changeStyle).toBe('adapt-fast');
    expect(behavior.groupRole).toBe('connector');
  });

  it('changes discovery explanations when Tingo dimensions are supplied', () => {
    const foodFirst = { ...defaultTingoDimensions, food: 3 };
    const ranked = discoverPlaces('Tokyo', foodFirst);
    expect(ranked[0].why).toContain('Tingo also boosts it');
    expect(ranked[0].match).toBeGreaterThanOrEqual(96);
  });
});

describe('post-trip learning', () => {
  it('combines trip-level and stop-level review signals without changing Must-Go', () => {
    const next = reconcileTripLearning(profile, 'yes', { cafe: 'skip', dinner: 'worth' });
    expect(next.mustGo).toBe(profile.mustGo);
    expect(next.vibe).toBe('Slower pace + fewer scheduled stops');
    expect(next.preference).toBe('Food-led neighbourhood stops + scenic cafés');
  });
});

describe('retrospective persistence helpers', () => {
  it('normalizes and updates category actuals without mutating the source object', () => {
    const fallback = { food: 100, transport: 80, stay: 200, activities: 50 };
    const normalized = normalizeBudgetActuals({ food: -5, transport: 93 }, fallback);
    expect(normalized).toEqual({ food: 0, transport: 93, stay: 200, activities: 50 });

    const updated = updateBudgetActual(normalized, 'food', 121.7);
    expect(updated.food).toBe(122);
    expect(normalized.food).toBe(0);
  });

  it('rates only the requested DecisionRecord and preserves the official verdict', () => {
    const history: DecisionRecord[] = [
      { id: 'd1', kind: 'court', topic: 'Hotel', decision: 'Asakusa', createdAt: '2026-09-03T00:00:00.000Z' },
      { id: 'd2', kind: 'emergency', topic: 'Rain', decision: 'Food hall', createdAt: '2026-09-03T01:00:00.000Z' },
    ];
    const rated = rateDecision(history, 'd2', 'worth');

    expect(rated[0]).toEqual(history[0]);
    expect(rated[1].decision).toBe('Food hall');
    expect(rated[1].satisfaction).toBe('worth');
    expect(history[1].satisfaction).toBeUndefined();
  });
});
