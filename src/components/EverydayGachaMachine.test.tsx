import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { EverydayGachaMachine } from './EverydayGachaMachine';

describe('EverydayGachaMachine', () => {
  it('renders the machine and boundary copy without revealing a supplied result before a turn', () => {
    const html = renderToStaticMarkup(
      <EverydayGachaMachine result="Take the café route" onTurn={() => undefined} />,
    );

    expect(html).toContain('everyday-gacha-machine');
    expect(html).toContain('capsule');
    expect(html).toContain('Turn the Gacha');
    expect(html).not.toContain('Take the café route');
    expect(html).toContain('not a Court decision');
    expect(html).toContain('official itinerary');
    expect(html).toContain('learning');
    expect(html).not.toContain('sealed note');
  });

  it('shows supplied candidates without inventing default options', () => {
    const empty = renderToStaticMarkup(<EverydayGachaMachine onTurn={() => undefined} />);
    expect(empty).not.toContain('Café route');
    const supplied = renderToStaticMarkup(<EverydayGachaMachine candidates={['Museum', 'Garden']} onTurn={() => undefined} />);
    expect(supplied).toContain('Museum');
    expect(supplied).toContain('Garden');
  });
});
