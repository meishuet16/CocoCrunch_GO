import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SafetyToolkit } from './SafetyToolkit';

describe('SafetyToolkit', () => {
  it('labels nearby help clearly', () => {
    const html = renderToStaticMarkup(<SafetyToolkit destination="Tokyo" />);

    expect(html).toContain('Nearby help');
    expect(html).toContain('Hospital');
    expect(html).toContain('Pharmacy');
    expect(html).toContain('Luggage');
    expect(html).toContain('Police');
    expect(html).toContain('ATM / Cash');
    expect(html).toContain('Help Desk');
  });

  it('renders destination-aware emergency hotlines and verified facilities', () => {
    const html = renderToStaticMarkup(<SafetyToolkit destination="Tokyo" />);

    expect(html).toContain('Emergency Hotlines');
    expect(html).toContain('119');
    expect(html).toContain('110');
    expect(html).toContain('St. Luke');
    expect(html).toContain('Open in Maps');
  });

  it('provides English emergency flashcards with zero Chinese characters', () => {
    const html = renderToStaticMarkup(<SafetyToolkit destination="Tokyo" />);

    expect(html).toContain('English Emergency Flashcards');
    expect(html).toContain('Medical Emergency');
    expect(html).toContain('I need urgent medical care');

    // Ensure zero Chinese characters exist in the output
    const hasChinese = /[\u4e00-\u9fa5]/.test(html);
    expect(hasChinese).toBe(false);
  });
});
