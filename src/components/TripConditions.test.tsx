import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TripConditions } from './TripConditions';

describe('TripConditions presentation', () => {
  it('keeps a calm, provenance-honest state when no disruption is reported', () => {
    const html = renderToStaticMarkup(
      <TripConditions delay={false} repairAvailable={false} onSimulateDisruption={() => undefined} />,
    );

    expect(html).toContain('TRIP CONDITIONS');
    expect(html).toContain('Today looks clear.');
    expect(html).toContain('No live weather or traffic provider connected');
    expect(html).toContain('Simulate a rain change');
  });

  it('makes a reported condition and its repair path understandable in traveller language', () => {
    const html = renderToStaticMarkup(
      <TripConditions delay repairAvailable failedItemName="Harbor walk" onSimulateDisruption={() => undefined} />,
    );

    expect(html).toContain('Something changed today.');
    expect(html).toContain('Demo condition · not live weather');
    expect(html).toContain('Harbor walk');
    expect(html).toContain('A gentler adjustment is ready to review.');
    expect(html).not.toContain('Simulate a rain change');
  });
});
