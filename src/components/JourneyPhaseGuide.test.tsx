import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  CompletedLearningGuide,
  ExplorePlanningGuide,
  MemoryArchiveGuide,
  TingoOwnershipGuide,
} from './JourneyPhaseGuide';

describe('journey phase guides', () => {
  it('keeps the Completed learning loop in the approved order', () => {
    const html = renderToStaticMarkup(<CompletedLearningGuide />);

    expect(html.indexOf('Actual outcome')).toBeLessThan(html.indexOf('Worth It / reflection'));
    expect(html.indexOf('Worth It / reflection')).toBeLessThan(html.indexOf('Proposed learning'));
    expect(html).toContain('do not replace it');
  });

  it('keeps Memories as a doorway back to retrospective', () => {
    const html = renderToStaticMarkup(<MemoryArchiveGuide onOpenTrip={() => undefined} />);

    expect(html).toContain('RETROSPECTIVE FIRST');
    expect(html).toContain('Review active trip');
    expect(html).toContain('explicit confirmation');
  });

  it('keeps Explore governed by the active trip', () => {
    const html = renderToStaticMarkup(<ExplorePlanningGuide onOpenTrip={() => undefined} />);

    expect(html).toContain('FEED THE ACTIVE TRIP');
    expect(html).toContain('Save an idea');
    expect(html).toContain('never edits the official itinerary');
  });

  it('keeps Tingo ownership distinct from trip constraints', () => {
    const html = renderToStaticMarkup(<TingoOwnershipGuide />);

    expect(html).toContain('LONG-TERM IDENTITY');
    expect(html).toContain('separate from this trip’s Vibe and constraints');
    expect(html).toContain('never silently overwrites it');
  });
});
