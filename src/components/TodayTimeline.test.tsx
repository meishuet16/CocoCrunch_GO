import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { TripPlan } from '../domain/itinerary';
import { TodayTimeline } from './TodayTimeline';

const items: TripPlan['items'] = [
  {
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
    evidence: [],
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
    evidence: [],
  },
  {
    id: 'floating-cafe',
    name: 'Quiet cafe',
    kind: 'floating',
    startMinutes: 750,
    endMinutes: 810,
    timeLabel: '12:30',
    estimatedCost: 20,
    transferMinutes: 15,
    walkingKm: 1,
    protected: false,
    evidence: [],
  },
  {
    id: 'open-flexible-window',
    name: 'Open flexible window',
    kind: 'open',
    startMinutes: 825,
    endMinutes: 885,
    timeLabel: '13:45',
    estimatedCost: 0,
    transferMinutes: 0,
    walkingKm: 0,
    protected: false,
    evidence: [],
  },
];

describe('TodayTimeline presentation', () => {
  it('renders TODAY as a semantic timeline with item states and kinds', () => {
    const html = renderToStaticMarkup(
      <TodayTimeline items={items} delay={false} arrivalChecked={false} appliedRepair={false} />,
    );

    expect(html).toContain('<section');
    expect(html).toContain('TODAY');
    expect(html).toContain('<ol');
    expect(html).toContain('10:00');
    expect(html).toContain('Tsukiji food walk');
    expect(html).toContain('Current');
    expect(html).toContain('Next');
    expect(html).toContain('Later');
    expect(html).toContain('anchor');
    expect(html).toContain('buffer');
    expect(html).toContain('floating');
    expect(html).toContain('open');
  });

  it('shows completed progress and recovery only from the supplied booleans', () => {
    const html = renderToStaticMarkup(
      <TodayTimeline items={items} delay={true} arrivalChecked={true} appliedRepair={true} />,
    );

    expect(html).toContain('Completed');
    expect(html).toContain('Recovery applied');
    expect(html).toContain('Delay noted');
  });
});
