import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import AppRescued from './AppRescued';

describe('AppRescued journey status integration', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('surfaces the shared journey status on Home for the active trip', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    });

    const html = renderToStaticMarkup(<AppRescued />);

    expect(html).toContain('HOME · ACTIVE TRIP');
    expect(html).toContain('Your trip can be shaped now; Tingo is not complete.');
    expect(html).toContain('Review Tingo Card');
    expect(html).toContain('Plan Health');
    expect(html).not.toContain('Discover places');
  });
});
