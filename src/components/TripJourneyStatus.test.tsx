import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { JourneyState } from '../domain/journey-state';
import { deriveJourneyState } from '../domain/journey-state';

async function loadTripJourneyStatus() {
  try {
    return await import('./TripJourneyStatus');
  } catch {
    return null;
  }
}

describe('TripJourneyStatus', () => {
  it('renders the prioritized next action derived from journey state', async () => {
    const mod = await loadTripJourneyStatus();

    expect(mod).not.toBeNull();

    const state = deriveJourneyState({
      phase: 'planning',
      tripCreated: true,
      tingoComplete: true,
      mode: 'group',
      unresolvedConflictCount: 1,
      planHealth: 86,
      planHealthBlockers: [],
      hasPlan: true,
      readyConfirmed: false,
      disruption: null,
      repairAvailable: false,
      repairRequiresGroupConfirmation: false,
      currentStopNeedsCheckIn: false,
      outcomeReviewed: false,
      worthItRecorded: false,
      learningProposalPending: false,
      learningConfirmed: false,
    });

    const { TripJourneyStatus } = mod!;
    const html = renderToStaticMarkup(
      <TripJourneyStatus state={state} destination="Tokyo" onAction={() => undefined} />,
    );

    expect(html).toContain('TOKYO');
    expect(html).toContain('PLANNING');
    expect(html).toContain('The group has a decision to make.');
    expect(html).toContain('A strong unresolved disagreement requires an explicit group decision.');
    expect(html).toContain('Open Group Court');
  });

  it('stays presentation-safe when there is no next action', async () => {
    const mod = await loadTripJourneyStatus();

    expect(mod).not.toBeNull();

    const state: JourneyState = {
      phase: 'completed',
      status: 'Trip learning is up to date.',
      nextAction: null,
      blockers: [],
      evidence: [],
      canInspectOtherSections: true,
    };

    const { TripJourneyStatus } = mod!;
    const html = renderToStaticMarkup(
      <TripJourneyStatus state={state} destination="Jeju" onAction={() => undefined} />,
    );

    expect(html).toContain('JEJU');
    expect(html).toContain('COMPLETED');
    expect(html).toContain('Trip learning is up to date.');
    expect(html).not.toContain('<button');
  });
});
