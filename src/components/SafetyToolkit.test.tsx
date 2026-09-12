import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SafetyToolkit } from './SafetyToolkit';

describe('SafetyToolkit', () => {
  it('labels nearby help as prototype suggestions', () => {
    const html = renderToStaticMarkup(<SafetyToolkit destination="Tokyo" />);

    expect(html).toContain('local prototype suggestions, not live emergency or availability data');
    expect(html).toContain('Hospital');
    expect(html).toContain('Pharmacy');
    expect(html).toContain('Luggage');
  });
});
