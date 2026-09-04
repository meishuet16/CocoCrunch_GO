import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import AppRescued from './AppRescued';
import cocoIdle from './assets/coco/coco-idle.png';

const completeTingoAnswers = [
  { questionId: 'morning', optionId: 'mix' },
  { questionId: 'tradeoff', optionId: 'save' },
  { questionId: 'food', optionId: 'pause' },
  { questionId: 'change', optionId: 'explain' },
  { questionId: 'company', optionId: 'quiet' },
  { questionId: 'sleep', optionId: 'value' },
];

function stubPersistedTrip(readyConfirmed: boolean) {
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => key === 'cococrunch:v1' ? JSON.stringify({
      version: 1,
      mode: 'solo',
      readyConfirmed,
      tingoAnswers: completeTingoAnswers,
      tripIntent: {
        destination: 'Tokyo',
        dates: null,
        mode: 'solo',
        tripVibe: 'Slow food and side streets',
        mustGo: 'Tsukiji food walk',
        dealBreaker: 'No red-eye return',
        preference: 'One cafe break each day',
        flexible: 'Leave one evening open',
        budget: 1200,
      },
    }) : null,
    setItem: () => undefined,
    removeItem: () => undefined,
  });
}

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
    expect(html).toMatch(/Current Phase/i);
    expect(html).toMatch(/Group Status/i);
    expect(html).toContain('home-orientation');
    expect(html).not.toContain('Discover places');
  });

  it('keeps confirm-ready pending until planning is explicitly confirmed', () => {
    stubPersistedTrip(false);

    const html = renderToStaticMarkup(<AppRescued />);

    expect(html).toContain('The plan is reviewable and waiting for a Ready-to-Go confirmation.');
    expect(html).toContain('Confirm Ready to Go');
  });

  it('does not require confirm-ready after a stored planning confirmation', () => {
    stubPersistedTrip(true);

    const html = renderToStaticMarkup(<AppRescued />);

    expect(html).toContain('The trip is ready to continue.');
    expect(html).toContain('Continue planning');
    expect(html).not.toContain('Confirm Ready to Go');
  });

  it('uses the idle Coco asset in the accessible Home brand lockup', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    });

    const html = renderToStaticMarkup(<AppRescued />);

    expect(html).toContain('aria-label="Go to Home"');
    expect(html).toContain(`class="brand-companion"`);
    expect(html).toContain(`src="${cocoIdle}"`);
    expect(html).toContain('alt="Coco, your travel companion"');
  });
});
