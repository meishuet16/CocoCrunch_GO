import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { TripPlan } from '../domain/itinerary';

async function loadTripSpatialView() {
  try {
    return await import('./TripSpatialView');
  } catch {
    return null;
  }
}

const samplePlan: TripPlan = {
  destination: 'Tokyo',
  tripPromise: 'Slow food + breathing room',
  totalEstimatedCost: 120,
  walkingKm: 2.1,
  transferMinutes: 25,
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
      name: 'Scenic cafe block',
      kind: 'floating',
      startMinutes: 735,
      endMinutes: 810,
      timeLabel: '12:15',
      estimatedCost: 45,
      transferMinutes: 10,
      walkingKm: 1.2,
      protected: false,
      evidence: [],
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
      evidence: [],
    },
  ],
};

describe('TripSpatialView', () => {
  it('renders planning candidates and honest prototype-catalog copy', async () => {
    const mod = await loadTripSpatialView();

    expect(mod).not.toBeNull();

    const { TripSpatialView } = mod!;
    const html = renderToStaticMarkup(
      <TripSpatialView
        mode="planning"
        destination="Tokyo"
        source="prototype-catalog"
        plan={samplePlan}
        candidates={[
          { id: 'candidate-1', name: 'Kiyosumi garden cafe', source: 'prototype-catalog' },
          { id: 'candidate-2', name: 'Vintage street snack lane', source: 'fallback' },
        ]}
      />,
    );

    expect(html).toContain('MAP · TOKYO');
    expect(html).toContain('spatial-secondary');
    expect(html).toContain('Prototype catalog candidates · planning context only');
    expect(html).toContain('Tsukiji food walk');
    expect(html).toContain('Scenic cafe block');
    expect(html).toContain('Kiyosumi garden cafe');
    expect(html).toContain('Vintage street snack lane');
    expect(html).toContain('No live routing, traffic, travel time, weather, or place status is connected.');
  });

  it('renders traveling current and next context without live-location claims', async () => {
    const mod = await loadTripSpatialView();

    expect(mod).not.toBeNull();

    const { TripSpatialView } = mod!;
    const html = renderToStaticMarkup(
      <TripSpatialView
        mode="traveling"
        destination="Tokyo"
        source="local-schematic"
        plan={samplePlan}
        currentItem={{ name: 'Tsukiji food walk', timeLabel: '10:00' }}
        nextItem={{ name: 'Scenic cafe block', timeLabel: '12:15' }}
        reunionLabel="Shibuya crossing · 19:30 · ±15 min"
        privacy="status"
        disruptionLabel="Floating block needs repair review."
        liveRoute={{
          currentLocation: 'Last manual check-in',
          target: 'Scenic cafe block',
          eta: 'ETA needs a check-in',
          timelineLabel: 'Mark arrival to advance the local route',
          weatherLabel: 'Weather refreshes in the panel above · Open-Meteo',
        }}
      />,
    );

    expect(html).toContain('Local schematic · trip context only');
    expect(html).toContain('Current');
    expect(html).toContain('Next');
    expect(html).toContain('Tsukiji food walk');
    expect(html).toContain('Scenic cafe block');
    expect(html).toContain('Shibuya crossing · 19:30 · ±15 min');
    expect(html).toContain('Sharing: status only');
    expect(html).toContain('Current and next stops come from saved trip state and manual check-ins only.');
    expect(html).toContain('Saved current · next · reunion context');
    expect(html).toContain('LIVE ROUTING · PROTOTYPE');
    expect(html).toContain('Last manual check-in → Scenic cafe block');
    expect(html).toContain('Weather refreshes in the panel above · Open-Meteo');
    expect(html).toContain('no device location, traffic, or turn-by-turn navigation connected');
  });

  it('describes only supplied traveling context in the saved-context cue', async () => {
    const mod = await loadTripSpatialView();

    expect(mod).not.toBeNull();

    const { TripSpatialView } = mod!;
    const html = renderToStaticMarkup(
      <TripSpatialView
        mode="traveling"
        destination="Tokyo"
        source="local-schematic"
        plan={samplePlan}
        currentItem={{ name: 'Tsukiji food walk', timeLabel: '10:00' }}
      />,
    );

    expect(html).toContain('Saved current context');
    expect(html).not.toContain('Saved current · next · reunion context');
  });

  it('renders completed travelled stops with imported photo metadata boundaries', async () => {
    const mod = await loadTripSpatialView();

    expect(mod).not.toBeNull();

    const { TripSpatialView } = mod!;
    const html = renderToStaticMarkup(
      <TripSpatialView
        mode="completed"
        destination="Tokyo"
        source="photo-metadata"
        plan={samplePlan}
        photoSummary={{ imported: 18, grouped: 4, note: 'Grouped from imported photo coordinates only.' }}
      />,
    );

    expect(html).toContain('Imported photo metadata · no live location');
    expect(html).toContain('Travelled');
    expect(html).toContain('18 photos indexed');
    expect(html).toContain('4 areas grouped');
    expect(html).toContain('Closure');
    expect(html).toContain('18 imported photos indexed · 4 areas grouped');
    expect(html).not.toContain('18 photos saved · 4 areas grouped');
    expect(html).toContain('Photo Map shows imported metadata only; it does not infer the route between stops.');
  });

  it('renders an unavailable state without inventing spatial data', async () => {
    const mod = await loadTripSpatialView();

    expect(mod).not.toBeNull();

    const { TripSpatialView } = mod!;
    const html = renderToStaticMarkup(
      <TripSpatialView
        mode="planning"
        destination="Jeju"
        source="unavailable"
        plan={samplePlan}
      />,
    );

    expect(html).toContain('Spatial data unavailable');
    expect(html).toContain('No saved schematic or imported metadata is available for this view yet.');
  });
});
