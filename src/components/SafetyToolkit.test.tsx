import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SafetyToolkit } from './SafetyToolkit';

it('keeps safety help status-only and labels local suggestions honestly', () => {
  const html = renderToStaticMarkup(<SafetyToolkit destination="Tokyo"/>);
  expect(html).toContain('status-only check-in');
  expect(html).toContain('local prototype suggestions');
  expect(html).toContain('Hospital');
  expect(html).toContain('Pharmacy');
  expect(html).toContain('Luggage');
});
