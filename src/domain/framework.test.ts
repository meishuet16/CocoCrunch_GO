import { afterEach, describe, expect, it, vi } from 'vitest';
import { derivePersistedTripState, loadPersisted } from '../persistence';
import { defaultTingoDimensions, scoreTingo } from './tingo';
import { emptyTripIntent, tripIntentFromLegacyState, tripIntentIsReviewable } from './trip-intent';

describe('Tingo source of truth', () => {
  it('re-derives dimensions from answers instead of trusting a separately edited snapshot', () => {
    const answers = [
      { questionId: 'morning', optionId: 'slow' },
      { questionId: 'food', optionId: 'hunt' },
    ];

    expect(scoreTingo(answers)).toMatchObject({ pace: -2, food: 5, flexibility: 1 });
    expect(scoreTingo([
      { questionId: 'morning', optionId: 'map' },
      { questionId: 'food', optionId: 'hunt' },
    ])).toMatchObject({ pace: 2, food: 3, flexibility: 0 });
  });
});

describe('persistence compatibility', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('re-derives persisted dimensions from questionnaire answers and keeps stored trip intent', () => {
    const answers = [
      { questionId: 'morning', optionId: 'slow' },
      { questionId: 'food', optionId: 'hunt' },
    ];
    const persisted = {
      version: 1,
      destination: 'Kyoto',
      mode: 'group',
      profile: {
        vibe: 'slow and scenic',
        mustGo: 'Fushimi Inari',
        veto: 'red-eye flight',
        preference: 'food markets',
        flexible: 'museum day',
      },
      plannerTurn: 'Mei',
      courtVotes: [],
      courtConfirmed: false,
      courtDecision: null,
      groupBudgetTotal: 1200,
      soloBudgetTotal: 800,
      groupBudgetPlan: { stay: 0, food: 0, transport: 0, activities: 0 },
      soloBudgetPlan: { stay: 0, food: 0, transport: 0, activities: 0 },
      privacy: 'status',
      continuousLocation: false,
      recommendations: [],
      worthIt: null,
      profileLearned: false,
      tingoAnswers: answers,
      tingoDimensions: { ...defaultTingoDimensions, pace: 99, food: -99 },
      tripIntent: {
        destination: 'Kyoto',
        dates: null,
        mode: 'group',
        tripVibe: 'slow and scenic',
        mustGo: 'Fushimi Inari',
        dealBreaker: 'red-eye flight',
        preference: 'food markets',
        flexible: 'museum day',
        budget: 1200,
      },
    };
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => key === 'cococrunch:v1' ? JSON.stringify(persisted) : null,
      setItem: () => undefined,
      removeItem: () => undefined,
    });

    const loaded = loadPersisted();

    expect(loaded.tripIntent).toEqual(persisted.tripIntent);
    expect(loaded.tingoDimensions).toEqual(scoreTingo(answers));
  });

  it('preserves stored blank trip-intent fields instead of reviving legacy profile or destination values', () => {
    const persisted = {
      version: 1,
      destination: 'Kyoto',
      mode: 'group',
      profile: {
        vibe: 'Slow temple mornings',
        mustGo: 'Nishiki Market habit',
        veto: 'overnight buses',
        preference: 'quiet tea breaks',
        flexible: 'leave dinners open',
      },
      plannerTurn: 'Mei',
      courtVotes: [],
      courtConfirmed: false,
      courtDecision: null,
      groupBudgetTotal: 1200,
      soloBudgetTotal: 800,
      groupBudgetPlan: { stay: 0, food: 0, transport: 0, activities: 0 },
      soloBudgetPlan: { stay: 0, food: 0, transport: 0, activities: 0 },
      privacy: 'status',
      continuousLocation: false,
      recommendations: [],
      worthIt: null,
      profileLearned: false,
      tripIntent: {
        destination: '',
        dates: null,
        mode: 'solo',
        tripVibe: '',
        mustGo: '',
        dealBreaker: '',
        preference: 'arcade stop',
        flexible: '',
        budget: 650,
      },
    };
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => key === 'cococrunch:v1' ? JSON.stringify(persisted) : null,
      setItem: () => undefined,
      removeItem: () => undefined,
    });

    const loaded = derivePersistedTripState(loadPersisted());
    expect(loaded.profile).toEqual(persisted.profile);
    expect(loaded.tripIntent).toEqual(persisted.tripIntent);
    expect(loaded.profile).toBeDefined();
    if (!loaded.profile) {
      throw new Error('expected stored profile to hydrate');
    }
    expect(loaded.profile.mustGo).toBe('Nishiki Market habit');
    expect(loaded.tripIntent.mustGo).toBe('');
    expect(loaded.tripIntent.preference).toBe('arcade stop');
  });
});

describe('journey state', () => {
  it('prioritizes an unresolved Group conflict without preventing inspection', async () => {
    const { deriveJourneyState } = await import('./journey-state');
    const state = deriveJourneyState({
      phase: 'planning', tripCreated: true, tingoComplete: true, mode: 'group',
      unresolvedConflictCount: 1, planHealth: 86, planHealthBlockers: [],
      hasPlan: true, readyConfirmed: false, disruption: null,
      repairAvailable: false, repairRequiresGroupConfirmation: false,
      currentStopNeedsCheckIn: false, outcomeReviewed: false,
      worthItRecorded: false, learningProposalPending: false, learningConfirmed: false,
    });
    expect(state.nextAction?.id).toBe('open-court');
    expect(state.canInspectOtherSections).toBe(true);
  });

  it('prioritizes repair approval during a Group disruption', async () => {
    const { deriveJourneyState } = await import('./journey-state');
    const state = deriveJourneyState({
      phase: 'traveling', tripCreated: true, tingoComplete: true, mode: 'group',
      unresolvedConflictCount: 0, planHealth: 86, planHealthBlockers: [],
      hasPlan: true, readyConfirmed: true, disruption: 'failed-floating-item',
      repairAvailable: true, repairRequiresGroupConfirmation: true,
      currentStopNeedsCheckIn: false, outcomeReviewed: false,
      worthItRecorded: false, learningProposalPending: false, learningConfirmed: false,
    });
    expect(state.nextAction?.id).toBe('approve-repair');
    expect(state.canInspectOtherSections).toBe(true);
  });
});

describe('trip intent', () => {
  it('maps legacy state into the trip-owned intent contract', () => {
    expect(tripIntentFromLegacyState({
      destination: 'Kyoto',
      mode: 'group',
      profile: {
        vibe: 'slow and scenic',
        mustGo: 'Fushimi Inari',
        veto: 'red-eye flight',
        preference: 'food markets',
        flexible: 'museum day',
      },
      budget: 1200,
    })).toEqual({
      destination: 'Kyoto',
      dates: null,
      mode: 'group',
      tripVibe: 'slow and scenic',
      mustGo: 'Fushimi Inari',
      dealBreaker: 'red-eye flight',
      preference: 'food markets',
      flexible: 'museum day',
      budget: 1200,
    });

    expect(emptyTripIntent).toEqual({
      destination: '',
      dates: null,
      mode: 'solo',
      tripVibe: '',
      mustGo: '',
      dealBreaker: '',
      preference: '',
      flexible: '',
      budget: 0,
    });
  });

  it('only treats destination, must-go, and non-negative budget as reviewable', () => {
    expect(tripIntentIsReviewable({
      ...emptyTripIntent,
      destination: 'Kyoto',
      mustGo: 'Fushimi Inari',
      budget: 0,
    })).toBe(true);

    expect(tripIntentIsReviewable({
      ...emptyTripIntent,
      destination: '   ',
      mustGo: 'Fushimi Inari',
      budget: 0,
    })).toBe(false);

    expect(tripIntentIsReviewable({
      ...emptyTripIntent,
      destination: 'Kyoto',
      mustGo: 'Fushimi Inari',
      budget: -1,
    })).toBe(false);
  });
});
