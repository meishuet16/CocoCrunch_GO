import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LuckyDrawReveal } from './LuckyDrawReveal';

describe('LuckyDrawReveal', () => {
  it('renders distinct fortune-stick entertainment without revealing the supplied result before drawing', () => {
    const html = renderToStaticMarkup(
      <LuckyDrawReveal result="Leave one hour unplanned." onDraw={() => undefined} />,
    );

    expect(html).toContain('lucky-draw-reveal');
    expect(html).toContain('sealed note');
    expect(html).toContain('fortune');
    expect(html).toContain('Draw a fortune');
    expect(html).not.toContain('Leave one hour unplanned.');
    expect(html).toContain('Entertainment only');
    expect(html).not.toContain('capsule');
    expect(html).not.toMatch(/deal|voucher|provider|itinerary|court|learning/i);
  });
});
