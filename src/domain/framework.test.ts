import { describe, expect, it } from 'vitest';
import { scoreTingo } from './tingo';
import { deriveJourneyState } from './journey-state';

describe('Tingo source of truth', () => {
  it('re-derives dimensions from answers instead of trusting a separately edited snapshot', () => {
    const answers = [{ questionId: 'food', optionId: 'hunt' }];
    expect(scoreTingo(answers).food).toBe(3);
  });
});

describe('journey state', () => {
  it('prioritizes an unresolved Group conflict without preventing inspection', () => {
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

  it('prioritizes repair approval during a Group disruption', () => {
    const state = deriveJourneyState({
      phase: 'traveling', tripCreated: true, tingoComplete: true, mode: 'group',
      unresolvedConflictCount: 0, planHealth: 86, planHealthBlockers: [],
      hasPlan: true, readyConfirmed: true, disruption: 'failed-floating-item',
      repairAvailable: true, repairRequiresGroupConfirmation: true,
      currentStopNeedsCheckIn: false, outcomeReviewed: false,
      worthItRecorded: false, learningProposalPending: false, learningConfirmed: false,
    });
    expect(state.nextAction?.id).toBe('approve-repair');
  });
});
