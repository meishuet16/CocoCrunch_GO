import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { RealisticRouteMap } from './RealisticRouteMap';
import type { TripPlan } from '../domain/itinerary';

const mockPlan: TripPlan = {
  destination: 'Tokyo',
  tripPromise: 'Urban exploration',
  totalEstimatedCost: 150,
  walkingKm: 3.2,
  transferMinutes: 20,
  protectedAnchorIds: ['anchor-1'],
  unresolvedRisks: [],
  items: [
    {
      id: 'anchor-1',
      name: 'Tsukiji morning walk',
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
      id: 'floating-1',
      name: 'Daikanyama shopping',
      kind: 'floating',
      startMinutes: 730,
      endMinutes: 810,
      timeLabel: '12:10',
      estimatedCost: 50,
      transferMinutes: 20,
      walkingKm: 1.1,
      protected: false,
      evidence: [],
    },
    {
      id: 'after-1',
      name: 'Scenic cafe block',
      kind: 'floating',
      startMinutes: 830,
      endMinutes: 900,
      timeLabel: '14:00',
      estimatedCost: 30,
      transferMinutes: 15,
      walkingKm: 0.8,
      protected: false,
      evidence: [],
    },
  ],
};

describe('RealisticRouteMap', () => {
  it('renders realistic map elements, roads, river, and parks', () => {
    const html = renderToStaticMarkup(
      <RealisticRouteMap
        destination="Tokyo"
        plan={mockPlan}
        currentItem={{ name: 'Tsukiji morning walk', timeLabel: '10:00' }}
        nextItem={{ name: 'Daikanyama shopping', timeLabel: '12:10', transferMinutes: 20 }}
      />
    );

    // Map container & canvas
    expect(html).toContain('realistic-map-container');
    expect(html).toContain('realistic-map-svg');

    // Urban landmarks & streets
    expect(html).toContain('Kyū-Yamate-dōri');
    expect(html).toContain('Komazawa-dōri');
    expect(html).toContain('Meguro River');
    expect(html).toContain('Saigoyama Park 🌲');
    expect(html).toContain('Daikanyama Station');
    expect(html).toContain('Daikanyama T-Site');
  });

  it('renders street-following navigation route and direction chevrons', () => {
    const html = renderToStaticMarkup(
      <RealisticRouteMap
        destination="Tokyo"
        plan={mockPlan}
        currentItem={{ name: 'Tsukiji morning walk', timeLabel: '10:00' }}
        nextItem={{ name: 'Daikanyama shopping', timeLabel: '12:10', transferMinutes: 20 }}
      />
    );

    expect(html).toContain('nav-route-glow');
    expect(html).toContain('nav-route-casing');
    expect(html).toContain('nav-route-active');
    expect(html).toContain('nav-route-traversed');
    expect(html).toContain('nav-route-chevron');
  });

  it('renders live GPS location puck with radar pulse waves and heading beam', () => {
    const html = renderToStaticMarkup(
      <RealisticRouteMap
        destination="Tokyo"
        plan={mockPlan}
        browserLocation={{ latitude: 35.6492, longitude: 139.7028 }}
      />
    );

    expect(html).toContain('gps-puck-group');
    expect(html).toContain('gps-radar-wave');
    expect(html).toContain('gps-accuracy-halo');
    expect(html).toContain('gps-heading-beam');
    expect(html).toContain('gps-dot-core');
    expect(html).toContain('gps-live-pill');
    expect(html).toContain('35.6492° N, 139.7028° E');
    expect(html).toContain('GPS LIVE');
  });

  it('renders turn-by-turn navigation HUD banner and map controls', () => {
    const html = renderToStaticMarkup(
      <RealisticRouteMap
        destination="Tokyo"
        plan={mockPlan}
        nextItem={{ name: 'Daikanyama shopping', timeLabel: '12:10', transferMinutes: 20 }}
      />
    );

    expect(html).toContain('nav-hud-banner');
    expect(html).toContain('In 120m, continue on Kyū-Yamate-dōri');
    expect(html).toContain('12:10');
    expect(html).toContain('~20 min (1.1 km)');
    expect(html).toContain('map-floating-controls');
    expect(html).toContain('recenter');
    expect(html).toContain('map-scale-bar');
    expect(html).toContain('Walking route');
  });

  it('renders waypoint pins with stop numbers and next stop callout', () => {
    const html = renderToStaticMarkup(
      <RealisticRouteMap
        destination="Tokyo"
        plan={mockPlan}
        currentItem={{ name: 'Tsukiji morning walk', timeLabel: '10:00' }}
        nextItem={{ name: 'Daikanyama shopping', timeLabel: '12:10', transferMinutes: 20 }}
      />
    );

    expect(html).toContain('waypoint-pin-anchor');
    expect(html).toContain('waypoint-pin-target');
    expect(html).toContain('target-callout-bubble');
    expect(html).toContain('Daikanyama shopping');
  });

  it('renders photo pin trigger and nearby emergency service points filter', () => {
    const html = renderToStaticMarkup(
      <RealisticRouteMap
        destination="Tokyo"
        plan={mockPlan}
        activeServiceCategory="hospital"
        photoPins={[
          { id: 'p1', title: 'Coffee at Tsutaya', audience: 'personal', x: 200, y: 190 },
        ]}
      />
    );

    // Photo pin button & dropped pin
    expect(html).toContain('photo-pin-trigger');
    expect(html).toContain('map-photo-pin');
    expect(html).toContain('Coffee at Tsutaya');

    // Service points filter & hospital pin
    expect(html).toContain('map-service-filter-bar');
    expect(html).toContain('🏥 Clinic');
    expect(html).toContain('🧳 Luggage');
    expect(html).toContain('🔧 Repair');
    expect(html).toContain('💊 Pharmacy');
    expect(html).toContain('service-point-pin');
    expect(html).toContain('Tokyo Midtown Clinic');
  });
});

