import { describe, expect, it } from 'vitest';
import { actualBudget, budgetVariance, remainingBudget, updateBudget } from './budget';
import { attachCourtConcession, withdrawCourtConcession } from './concession';
import { canUseGacha, courtTally, type CourtVote } from './court';
import { discoverPlaces } from './discovery';
import { gatePlanMutation } from './governance';
import { reconcileTripLearning, type TravelProfile } from './preferences';
import { applyActualAdjustment, normalizeBudgetActuals, paceEvidenceSummary, rateDecision, updateBudgetActual } from './retrospective';
import { defaultTingoDimensions, deriveTingoBehavior, scoreTingo } from './tingo';
import { applyResponsibilitySuggestions, defaultMembers, suggestResponsibilities } from './trip';
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

  it('blocks one-person official group writes while allowing ideas and solo confirmation', () => {
    expect(gatePlanMutation('group', 'official-itinerary').allowed).toBe(false);
    expect(gatePlanMutation('group', 'official-itinerary').requiresGroupConfirmation).toBe(true);
    expect(gatePlanMutation('group', 'official-itinerary', true).allowed).toBe(true);
    expect(gatePlanMutation('group', 'idea-save').allowed).toBe(true);
    expect(gatePlanMutation('solo', 'official-itinerary').allowed).toBe(true);
  });

  it('binds a concession to its exact vote snapshot and restores it on withdrawal', () => {
    const votes: CourtVote[] = [
      { member: 'A', pick: 'hotel-a' },
      { member: 'B', pick: 'hotel-b' },
    ];
    const concession = attachCourtConcession(votes, {
      id: 'c1',
      offeredBy: 'A',
      description: 'A gives dinner choice later',
      linkedOptionId: 'hotel-b',
    });
    const mutated = votes.map(vote => ({ ...vote, pick: 'hotel-b' }));
    expect(concession.voteSnapshot).toEqual(votes);
    expect(mutated).not.toEqual(concession.voteSnapshot);

    const withdrawn = withdrawCourtConcession(concession);
    expect(withdrawn.concession.status).toBe('withdrawn');
    expect(withdrawn.restoredVotes).toEqual(votes);
    expect(withdrawn.restoredVotes).not.toBe(concession.voteSnapshot);
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

  it('keeps responsibility suggestions advisory until explicitly applied', () => {
    const members = defaultMembers.map(member => ({ ...member }));
    const beforeRoles = members.map(member => member.role);
    const behavior = deriveTingoBehavior({ ...defaultTingoDimensions, social: 3 });
    const suggestions = suggestResponsibilities(members, behavior, { mei: behavior });

    expect(members.map(member => member.role)).toEqual(beforeRoles);
    expect(suggestions[0].suggestedRole).toBe('Group connector');
    expect(suggestions[0].source).toBe('member-tingo');
    expect(suggestions[1].source).toBe('fallback');

    const applied = applyResponsibilitySuggestions(members, suggestions);
    expect(applied[0].role).toBe('Group connector');
    expect(members.map(member => member.role)).toEqual(beforeRoles);
  });
});

describe('post-trip learning', () => {
  it('combines trip-level and stop-level review signals without changing Must-Go', () => {
    const next = reconcileTripLearning(profile, 'yes', { cafe: 'skip', dinner: 'worth', market: 'worth' });
    expect(next.mustGo).toBe(profile.mustGo);
    expect(next.vibe).toBe('Slower pace + fewer scheduled stops');
    expect(next.preference).toBe('Food-led neighbourhood stops + scenic cafés');
  });
});

describe('budget boundaries', () => {
  it('keeps planned and actual category records separate', () => {
    const plan = { food: 100, transport: 80, stay: 200, activities: 50 };
    const actuals = { food: 130, transport: 70, stay: 200, activities: 40 };
    const changedPlan = updateBudget(plan, 'food', 110);
    const changedActuals = updateBudgetActual(actuals, 'food', 145);

    expect(plan.food).toBe(100);
    expect(actuals.food).toBe(130);
    expect(changedPlan.food).toBe(110);
    expect(changedActuals.food).toBe(145);
    expect(actualBudget(changedActuals)).toBe(455);
    expect(budgetVariance(changedPlan, changedActuals).find(item => item.category === 'food')?.status).toBe('over');
  });

  it('folds real disruption cost into the category actual instead of a detached total', () => {
    const actuals = { food: 100, transport: 80, stay: 200, activities: 40 };
    const adjusted = applyActualAdjustment(actuals, 'activities', 8);
    expect(adjusted.activities).toBe(48);
    expect(actuals.activities).toBe(40);
    expect(actualBudget(adjusted)).toBe(actualBudget(actuals) + 8);
  });

  it('never reports a negative remaining budget', () => {
    expect(remainingBudget(500, 490, 30)).toBe(0);
    expect(remainingBudget(500, 300, 20)).toBe(180);
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

  it('replays completed pace evidence deterministically', () => {
    expect(paceEvidenceSummary({ delayed: true, mood: 'okay', arrivalChecked: true })).toContain('Slower');
    expect(paceEvidenceSummary({ delayed: false, mood: 'tired', arrivalChecked: true })).toContain('Slower');
    expect(paceEvidenceSummary({ delayed: false, mood: 'great', arrivalChecked: true })).toContain('Matched');
    expect(paceEvidenceSummary({ delayed: false, mood: null, arrivalChecked: false })).toContain('No completed');
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
