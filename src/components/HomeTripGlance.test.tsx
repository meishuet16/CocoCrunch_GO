import { expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { HomeTripGlance } from './HomeTripGlance';

it('renders trip context, lifecycle phase, and weather as separate readable units', () => {
  vi.stubGlobal('fetch', vi.fn(() => new Promise(() => undefined)));
  const html = renderToStaticMarkup(<HomeTripGlance destination="Tokyo" dates={null} phase="planning"/>);
  expect(html).toContain('home-trip-context');
  expect(html).toContain('home-trip-phase');
  expect(html).toContain('weather-glance');
  expect(html).toContain('Tokyo');
  expect(html).toContain('Dates to be confirmed');
  expect(html).toContain('Before · shaping the trip');
});
