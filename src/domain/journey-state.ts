export type JourneyPhase = 'planning' | 'traveling' | 'completed';

export type JourneyActionId =
  | 'setup-trip'
  | 'complete-tingo'
  | 'open-court'
  | 'approve-repair'
  | 'preview-repair'
  | 'review-health'
  | 'review-intent'
  | 'confirm-ready'
  | 'check-in'
  | 'review-outcome'
  | 'review-learning'
  | 'open-memories'
  | 'continue-planning'
  | 'continue-traveling';

export type JourneyActionTarget = 'trip' | 'me' | 'memories' | 'explore';

export type JourneyStateInput = {
  phase: JourneyPhase;
  tripCreated: boolean;
  tingoComplete: boolean;
  mode: 'solo' | 'group';
  unresolvedConflictCount: number;
  planHealth: number;
  planHealthBlockers: string[];
  hasPlan: boolean;
  readyConfirmed: boolean;
  disruption: 'failed-floating-item' | null;
  repairAvailable: boolean;
  repairRequiresGroupConfirmation: boolean;
  currentStopNeedsCheckIn: boolean;
  outcomeReviewed: boolean;
  worthItRecorded: boolean;
  learningProposalPending: boolean;
  learningConfirmed: boolean;
};

export type JourneyEvidence = {
  source: string;
  value: string;
};

export type JourneyAction = {
  id: JourneyActionId;
  label: string;
  reason: string;
  priority: number;
  target: JourneyActionTarget;
};

export type JourneyState = {
  phase: JourneyPhase;
  status: string;
  nextAction: JourneyAction | null;
  blockers: string[];
  evidence: JourneyEvidence[];
  canInspectOtherSections: true;
};

export function deriveJourneyState(input: JourneyStateInput): JourneyState {
  const base = {
    phase: input.phase,
    blockers: [...input.planHealthBlockers],
    evidence: [] as JourneyEvidence[],
    canInspectOtherSections: true as const,
  };

  if (!input.tripCreated) {
    return {
      ...base,
      status: 'No active trip yet.',
      nextAction: {
        id: 'setup-trip',
        label: 'Set up this trip',
        reason: 'A destination and trip intent are needed before a plan can be reviewed.',
        priority: 100,
        target: 'trip',
      },
    };
  }

  if (input.phase === 'planning' && !input.tingoComplete) {
    return {
      ...base,
      status: 'Your trip can be shaped now; Tingo is not complete.',
      nextAction: {
        id: 'complete-tingo',
        label: 'Review Tingo Card',
        reason: 'A complete long-term profile can improve explanations, but it does not block trip inspection.',
        priority: 80,
        target: 'me',
      },
    };
  }

  if (input.phase === 'planning' && input.mode === 'group' && input.unresolvedConflictCount > 0) {
    return {
      ...base,
      status: 'The group has a decision to make.',
      nextAction: {
        id: 'open-court',
        label: 'Open Group Court',
        reason: 'A strong unresolved disagreement requires an explicit group decision.',
        priority: 95,
        target: 'trip',
      },
      evidence: [{ source: 'group-dna', value: `${input.unresolvedConflictCount} unresolved conflict(s)` }],
    };
  }

  if (input.phase === 'traveling' && input.disruption && input.repairAvailable && input.mode === 'group' && input.repairRequiresGroupConfirmation) {
    return {
      ...base,
      status: 'Reality changed; the repair is waiting for group approval.',
      nextAction: {
        id: 'approve-repair',
        label: 'Review repair approval',
        reason: 'The proposed change affects shared trip truth.',
        priority: 100,
        target: 'trip',
      },
    };
  }

  if (input.phase === 'traveling' && input.disruption && input.repairAvailable) {
    return {
      ...base,
      status: 'Reality changed; a reversible repair is ready.',
      nextAction: {
        id: 'preview-repair',
        label: 'Preview minimum-loss repair',
        reason: 'Review time, cost, preference, and anchor impact before applying.',
        priority: 100,
        target: 'trip',
      },
    };
  }

  if (input.phase === 'planning' && input.planHealthBlockers.length > 0) {
    return {
      ...base,
      status: 'The plan has a blocker to review.',
      nextAction: {
        id: 'review-health',
        label: 'Review Plan Health',
        reason: input.planHealthBlockers[0],
        priority: 90,
        target: 'trip',
      },
    };
  }

  if (input.phase === 'planning' && !input.hasPlan) {
    return {
      ...base,
      status: 'Trip intent is ready for a plan.',
      nextAction: {
        id: 'review-intent',
        label: 'Review trip intent',
        reason: 'Trip Vibe and constraints have not produced a reviewable plan yet.',
        priority: 70,
        target: 'trip',
      },
    };
  }

  if (input.phase === 'planning' && !input.readyConfirmed) {
    return {
      ...base,
      status: 'The plan is reviewable and waiting for a Ready-to-Go confirmation.',
      nextAction: {
        id: 'confirm-ready',
        label: 'Confirm Ready to Go',
        reason: 'The plan can remain editable until the user explicitly confirms it.',
        priority: 60,
        target: 'trip',
      },
    };
  }

  if (input.phase === 'traveling' && input.currentStopNeedsCheckIn) {
    return {
      ...base,
      status: 'The next useful check-in is available.',
      nextAction: {
        id: 'check-in',
        label: 'Check in at the current stop',
        reason: 'Manual check-in keeps progress explicit without requiring location permission.',
        priority: 50,
        target: 'trip',
      },
    };
  }

  if (input.phase === 'completed' && !input.outcomeReviewed) {
    return {
      ...base,
      status: 'The trip is ready for an honest recap.',
      nextAction: {
        id: 'review-outcome',
        label: 'Review what actually happened',
        reason: 'The retrospective begins with actual outcome evidence.',
        priority: 90,
        target: 'memories',
      },
    };
  }

  if (input.phase === 'completed' && input.outcomeReviewed && !input.worthItRecorded) {
    return {
      ...base,
      status: 'The recap is ready for your reflection.',
      nextAction: {
        id: 'review-outcome',
        label: 'Answer Worth It?',
        reason: 'Reflection precedes any learning proposal.',
        priority: 80,
        target: 'memories',
      },
    };
  }

  if (input.phase === 'completed' && input.learningProposalPending && !input.learningConfirmed) {
    return {
      ...base,
      status: 'Coco has a proposed learning update to review.',
      nextAction: {
        id: 'review-learning',
        label: 'Review proposed learning',
        reason: 'Long-term profile changes require explicit confirmation.',
        priority: 70,
        target: 'me',
      },
    };
  }

  if (input.phase === 'completed') {
    return {
      ...base,
      status: 'Trip learning is up to date.',
      nextAction: {
        id: 'open-memories',
        label: 'Keep the memory',
        reason: 'The reflective loop is complete; expressive artifacts remain available.',
        priority: 40,
        target: 'memories',
      },
    };
  }

  return {
    ...base,
    status: 'The trip is ready to continue.',
    nextAction: {
      id: input.phase === 'planning' ? 'continue-planning' : 'continue-traveling',
      label: input.phase === 'planning' ? 'Continue planning' : 'Continue the trip',
      reason: 'No higher-priority action is currently pending.',
      priority: 20,
      target: 'trip',
    },
  };
}
