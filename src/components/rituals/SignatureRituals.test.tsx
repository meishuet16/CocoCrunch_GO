import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import SignatureRituals from '../../SignatureRituals';

const base = { destination: 'Ipoh', privacy: 'status' as const, delayed: false, onClose: () => {} };
describe('signature overlays SSR', () => {
  it('does not announce or perform a save before the explicit action', () => {
    const save = vi.fn(() => true);
    const html = renderToStaticMarkup(<SignatureRituals {...base} ritual="capture" capture={{ place: 'River walk', save }} />);
    expect(html).toContain('River walk');
    expect(html).toContain('Prepare capture');
    expect(html).not.toContain('captured.');
    expect(save).not.toHaveBeenCalled();
  });
  it('reviews the real wish and reason without releasing it', () => {
    const commit = vi.fn(() => true);
    const html = renderToStaticMarkup(<SignatureRituals {...base} ritual="release" release={{ name: 'Old mountain trip', reason: 'Road closed', commit }} />);
    expect(html).toContain('Old mountain trip');
    expect(html).toContain('Road closed');
    expect(html).toContain('Begin release');
    expect(commit).not.toHaveBeenCalled();
  });
  it('requires an allocation choice and shows actual bill data', () => {
    const html = renderToStaticMarkup(<SignatureRituals {...base} ritual="receipt" receipt={{ total: 10.01, participants: ['Lina', 'Bo'] }} />);
    expect(html).toContain('10.01');
    expect(html).toContain('Lina');
    expect(html).toContain('Split equally');
    expect(html).not.toMatch(/PAID|SETTLED|RM47|Priya/);
  });
  it('renders the simplified prayer picker without inventing weather data', () => {
    const html = renderToStaticMarkup(<SignatureRituals {...base} ritual="prayer" prayer={{ source: 'user-reported', uncertainty: 'Clouds above the trail' }} />);
    expect(html).toContain('A little luck');
    expect(html).toContain('Prayer intention');
    expect(html).not.toContain('90%');
  });
  it('has an accessible dialog and a truthful missing-data state', () => {
    const html = renderToStaticMarkup(<SignatureRituals {...base} ritual="receipt" />);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('role="status"');
    expect(html).toContain('Bill data unavailable');
  });
});
