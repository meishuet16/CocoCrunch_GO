import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LuckyDrawReveal } from './LuckyDrawReveal';

describe('LuckyDrawReveal', () => {
  it('renders a distinct sealed-note entertainment reveal with its result', () => {
    const html = renderToStaticMarkup(
      <LuckyDrawReveal result="Leave one hour unplanned." onDraw={() => undefined} />,
    );

    expect(html).toContain('lucky-draw-reveal');
    expect(html).toContain('sealed note');
    expect(html).toContain('fortune');
    expect(html).toContain('Draw again');
    expect(html).toContain('Leave one hour unplanned.');
    expect(html).toContain('Entertainment only');
    expect(html).not.toContain('capsule');
    expect(html).not.toMatch(/deal|voucher|provider|itinerary|court|learning/i);
  });
});
