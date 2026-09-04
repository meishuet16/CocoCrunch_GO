import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { JourneyProgress } from './JourneyProgress';

describe('JourneyProgress presentation', () => {
  it('renders the three journey phases with the current phase and next action visible', () => {
    const html = renderToStaticMarkup(
      <JourneyProgress
        destination="Tokyo"
        currentPhase="traveling"
        nextActionLabel="Check in at the current stop"
      />,
    );

    expect(html).toContain('Before');
    expect(html).toContain('During');
    expect(html).toContain('After');
    expect(html).toContain('Tokyo');
    expect(html).toContain('Check in at the current stop');
    expect(html).toContain('aria-current="step"');
    expect(html).toContain('data-phase-state="completed"');
    expect(html).toContain('data-phase-state="future"');
  });

  it('marks After as current when the journey is completed', () => {
    const html = renderToStaticMarkup(
      <JourneyProgress destination="Jeju" currentPhase="completed" />,
    );

    expect(html).toContain('Jeju');
    expect(html).toContain('data-phase="after"');
    expect(html).toContain('data-phase-state="current"');
    expect(html).not.toContain('data-phase-state="future"');
  });
});
