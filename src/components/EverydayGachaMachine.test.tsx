import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { EverydayGachaMachine } from './EverydayGachaMachine';

describe('EverydayGachaMachine', () => {
  it('renders a capsule-machine everyday choice with its result and boundary copy', () => {
    const html = renderToStaticMarkup(
      <EverydayGachaMachine result="Take the café route" onTurn={() => undefined} />,
    );

    expect(html).toContain('everyday-gacha-machine');
    expect(html).toContain('capsule');
    expect(html).toContain('Turn again');
    expect(html).toContain('Take the café route');
    expect(html).toContain('not a Court decision');
    expect(html).toContain('official itinerary');
    expect(html).toContain('learning');
    expect(html).not.toContain('sealed note');
  });
});
