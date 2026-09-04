import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ContextualToolList } from './ContextualToolList';
import { TripPlanOverview } from './TripPlanOverview';
import { TripWorkspaceHeader } from './TripWorkspace';
import type { TripPlan } from '../domain/itinerary';
import type { PlanHealth } from '../domain/plan-health';
import type { TripIntent } from '../domain/trip-intent';

const tripIntent: TripIntent = {
  destination: 'Tokyo',
  dates: null,
  mode: 'group',
  tripVibe: 'Slow food and small discoveries',
  mustGo: 'Tsukiji food walk',
  dealBreaker: 'raw shellfish',
  preference: 'quiet café',
  flexible: 'evening timing',
  budget: 500,
};

const plan: TripPlan = {
  destination: 'Tokyo',
  tripPromise: 'Keep the one thing everyone cares about, leave room to wander.',
  totalEstimatedCost: 240,
  walkingKm: 2.4,
  transferMinutes: 30,
  protectedAnchorIds: ['anchor-tsukiji'],
  unresolvedRisks: [],
  items: [{
    id: 'anchor-tsukiji',
    name: 'Tsukiji food walk',
    kind: 'anchor',
    startMinutes: 600,
    endMinutes: 690,
    timeLabel: '10:00',
    estimatedCost: 80,
    transferMinutes: 0,
    walkingKm: 0,
    protected: true,
    evidence: [{ source: 'constraint', inputId: 'must-go', strength: 'required', effect: 'protects', value: 'Tsukiji food walk' }],
  }],
};

const health: PlanHealth = {
  overall: 92,
  metrics: {
    walkingKm: 2.4,
    walkingDeduction: 0,
    availableBufferMinutes: 35,
    timePressureMinutes: 0,
    timeDeduction: 0,
    budgetOverrun: 0,
    budgetDeduction: 0,
    preferenceMisses: 0,
    preferenceDeduction: 0,
    transferMinutes: 30,
    transferDeduction: 0,
    protectedAnchors: 1,
    unprotectedAnchors: 0,
    anchorDeduction: 0,
    unresolvedConflicts: 0,
    conflictDeduction: 0,
    unresolvedRisks: 0,
    riskDeduction: 0,
  },
  deductions: [],
  reasons: ['The generated plan fits the current inputs.'],
};

describe('workspace composition', () => {
  it('keeps contextual tools scoped to the trip and filters unavailable tools', () => {
    const html = renderToStaticMarkup(<ContextualToolList tools={[
      { id: 'intent', label: 'Trip Intent', note: 'This journey only', visible: true, onOpen: () => undefined },
      { id: 'hidden', label: 'Hidden tool', note: 'Should not render', visible: false, onOpen: () => undefined },
    ]} />);

    expect(html).toContain('Trip Intent');
    expect(html).toContain('This journey only');
    expect(html).not.toContain('Hidden tool');
  });

  it('makes the generated plan, protected Must-Go, evidence, and health inspectable', () => {
    const html = renderToStaticMarkup(
      <TripPlanOverview plan={plan} planHealth={health} tripIntent={tripIntent} onOpenWhy={() => undefined} onOpenHealth={() => undefined} />,
    );

    expect(html).toContain('Keep the one thing everyone cares about');
    expect(html).toContain('Must-Go · protected · cannot be AI-replaced');
    expect(html).toContain('constraint: Tsukiji food walk');
    expect(html).toContain('PLAN HEALTH · 92/100');
  });

  it('keeps the workspace identity honest for solo and group trips', () => {
    const soloHtml = renderToStaticMarkup(<TripWorkspaceHeader destination="Tokyo" mode="solo" travellerCount={1} planHealth={92} onBack={() => undefined} />);
    const groupHtml = renderToStaticMarkup(<TripWorkspaceHeader destination="Tokyo" mode="group" travellerCount={4} planHealth={92} onBack={() => undefined} />);

    expect(soloHtml).toContain('TOKYO · SOLO TRIP');
    expect(groupHtml).toContain('TOKYO · GROUP TRIP');
  });
});
