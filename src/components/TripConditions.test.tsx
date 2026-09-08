import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TripConditions } from './TripConditions';

describe('TripConditions presentation', () => {
  it('states that Today is clear without implying a live provider', () => {
    const html = renderToStaticMarkup(
      <TripConditions delay={false} repairAvailable={false} onSimulateDisruption={() => undefined} />,
    );

    expect(html).toContain('TRIP CONDITIONS');
    expect(html).toContain('Today’s conditions are clear.');
    expect(html).toContain('No reported changes to Today’s plan.');
    expect(html).toContain('No live weather or traffic provider is connected.');
    expect(html).toContain('Manual check-in remains available.');
    expect(html).toContain('Simulate rain');
    expect(html).toContain('Simulate late transit');
    expect(html).toContain('Simulate low-energy check-in');
  });

  it('names the affected item and points to the next action for a reported condition', () => {
    const html = renderToStaticMarkup(
      <TripConditions delay repairAvailable failedItemName="Harbor walk" repairStrategy="backup-replacement" onSimulateDisruption={() => undefined} />,
    );

    expect(html).toContain('Something changed today.');
    expect(html).toContain('Demo condition · not live weather');
    expect(html).toContain('Harbor walk');
    expect(html).toContain('Review the safest adjustment below.');
    expect(html).not.toContain('Simulate rain');
  });

  it('keeps a repair-available condition actionable', () => {
    const html = renderToStaticMarkup(
      <TripConditions delay repairAvailable failedItemName="Harbor walk" repairStrategy="backup-replacement" onSimulateDisruption={() => undefined} />,
    );

    expect(html).toContain('A safer adjustment is ready to review.');
    expect(html).toContain('Review the safest adjustment below.');
  });

  it('distinguishes recovery from the absence of a direct Backup candidate', () => {
    const html = renderToStaticMarkup(
      <TripConditions delay repairAvailable failedItemName="Harbor walk" repairStrategy="open-recovery" onSimulateDisruption={() => undefined} />,
    );

    expect(html).toContain('No direct Backup candidate is available.');
    expect(html).toContain('Recovery / schedule adjustment remains available below.');
    expect(html).not.toContain('No safe repair is available.');
  });

  it('explains when no safe repair is available', () => {
    const html = renderToStaticMarkup(
      <TripConditions delay={true} repairAvailable={false} failedItemName="Harbor walk" repairStrategy="none" onSimulateDisruption={() => undefined} />,
    );

    expect(html).toContain('No safe repair is available.');
    expect(html).toContain('Choose another manual adjustment.');
    expect(html).not.toContain('Review the safest adjustment below.');
  });
});
