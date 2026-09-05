import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PrayerScenario } from './PrayerScenario';
it('does not expose Pray before explicitly qualifying the isolated demo', () => {
  const html = renderToStaticMarkup(<PrayerScenario/>);
  expect(html).toContain('Isolated uncertainty demo');
  expect(html).not.toContain('Begin Pray');
  expect(html).toContain('does not change your trip');
});
