import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { PlanHealth } from '../domain/plan-health';
import type { TripPlan } from '../domain/itinerary';
import type { TripIntent } from '../domain/trip-intent';
import { TripPlanOverview } from './TripPlanOverview';

const samplePlan: TripPlan = {
  destination: 'Tokyo',
  tripPromise: 'Slow food + breathing room',
  totalEstimatedCost: 45,
  walkingKm: 2.1,
  transferMinutes: 10,
  protectedAnchorIds: ['anchor-tsukiji'],
  unresolvedRisks: [],
  items: [
    {
      id: 'anchor-tsukiji',
      name: 'Tsukiji food walk',
      kind: 'anchor',
      startMinutes: 600,
      endMinutes: 690,
      timeLabel: '10:00',
      estimatedCost: 0,
      transferMinutes: 0,
      walkingKm: 0,
      protected: true,
      evidence: [{ source: 'constraint', value: 'Tsukiji food walk', effect: 'protects', strength: 'required' }],
    },
    {
      id: 'buffer-after-anchor',
      name: 'Breathing room',
      kind: 'buffer',
      startMinutes: 690,
      endMinutes: 735,
      timeLabel: '11:30',
      estimatedCost: 0,
      transferMinutes: 0,
      walkingKm: 0,
      protected: false,
      evidence: [{ source: 'tingo', value: '45 min buffer', effect: 'supports', strength: 'supporting' }],
    },
    {
      id: 'floating-cafe',
      name: 'Scenic cafe block',
      kind: 'floating',
      startMinutes: 735,
      endMinutes: 810,
      timeLabel: '12:15',
      estimatedCost: 45,
      transferMinutes: 10,
      walkingKm: 1.2,
      protected: false,
      evidence: [{ source: 'candidate', value: 'Fits a slower food day', effect: 'supports', strength: 'context' }],
    },
    {
      id: 'open-evening',
      name: 'Open evening pocket',
      kind: 'open',
      startMinutes: 840,
      endMinutes: 900,
      timeLabel: '14:00',
      estimatedCost: 0,
      transferMinutes: 0,
      walkingKm: 0,
      protected: false,
      evidence: [{ source: 'constraint', value: 'Leave one evening open', effect: 'supports', strength: 'context' }],
    },
  ],
};

const planHealth = {
  overall: 92,
  metrics: {
    walkingKm: 2.1,
    walkingDeduction: 0,
    availableBufferMinutes: 45,
    timePressureMinutes: 0,
    timeDeduction: 0,
    budgetOverrun: 0,
    budgetDeduction: 0,
    preferenceMisses: 0,
    preferenceDeduction: 0,
    transferMinutes: 10,
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
  reasons: [],
} as PlanHealth;

const tripIntent: TripIntent = {
  destination: 'Tokyo',
  dates: null,
  mode: 'solo',
  tripVibe: 'Slow food',
  mustGo: 'Tsukiji food walk',
  dealBreaker: 'No red-eye return',
  preference: 'One cafe break',
  flexible: 'Leave one evening open',
  budget: 120,
};

describe('TripPlanOverview', () => {
  it('labels the travel timeline while keeping evidence and Why this? available', () => {
    const html = renderToStaticMarkup(
      <TripPlanOverview
        plan={samplePlan}
        planHealth={planHealth}
        tripIntent={tripIntent}
        onOpenWhy={() => undefined}
        onOpenHealth={() => undefined}
      />,
    );

    expect(html).toContain('Must-Go anchor');
    expect(html).toContain('Floating time');
    expect(html).toContain('Buffer / breathing room');
    expect(html).toContain('Open time');
    expect(html).toContain('10:00');
    expect(html).toContain('Why this?');
    expect(html).toContain('constraint: Tsukiji food walk');
    expect(html).toContain('candidate: Fits a slower food day');
  });
});
