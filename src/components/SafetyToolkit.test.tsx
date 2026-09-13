import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SafetyToolkit } from './SafetyToolkit';

describe('SafetyToolkit', () => {
  it('labels nearby help clearly', () => {
    const html = renderToStaticMarkup(<SafetyToolkit destination="Tokyo" />);

    expect(html).toContain('Find useful services near your trip.');
    expect(html).toContain('Hospital');
    expect(html).toContain('Pharmacy');
    expect(html).toContain('Luggage');
  });
});
