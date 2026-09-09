import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import AppRescued from './AppRescued';
import { cocoAsset } from './components/coco/assets';

const completeTingoAnswers = [
  { questionId: 'morning', optionId: 'slow' },
  { questionId: 'anchor-style', optionId: 'anchor' },
  { questionId: 'transport', optionId: 'save-route' },
  { questionId: 'tradeoff', optionId: 'save' },
  { questionId: 'food', optionId: 'hunt' },
  { questionId: 'change', optionId: 'adapt' },
  { questionId: 'comfort-adventure', optionId: 'relaxed' },
  { questionId: 'company', optionId: 'connect' },
  { questionId: 'sleep', optionId: 'value' },
  { questionId: 'memory', optionId: 'story' },
  { questionId: 'planning-role', optionId: 'organize' },
  { questionId: 'conflict', optionId: 'mediate' },
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

  it('uses canonical Home Coco in the accessible Home brand lockup', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    });

    const html = renderToStaticMarkup(<AppRescued />);

    expect(html).toContain('aria-label="Go to Home"');
    expect(html).toContain(`class="brand-companion"`);
    expect(html).toContain(`src="${cocoAsset('scene-home')}"`);
    expect(html).toContain('alt="Coco, your travel companion"');
  });

  it('renders Community Trip Explore screen when on explore tab without changing active trip', () => {
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => key === 'cococrunch:v1' ? JSON.stringify({
        version: 1,
        mode: 'group',
        tab: 'explore',
        readyConfirmed: false,
        tingoAnswers: completeTingoAnswers,
        tripIntent: {
          destination: 'Tokyo',
          dates: null,
          mode: 'group',
          tripVibe: 'Slow food and side streets',
          mustGo: 'Tsukiji food walk',
          dealBreaker: 'No red-eye return',
          preference: 'One cafe break each day',
          flexible: 'Leave one evening open',
          budget: 2400,
        },
      }) : null,
      setItem: () => undefined,
      removeItem: () => undefined,
    });

    const html = renderToStaticMarkup(<AppRescued />);

    // Top Section (Search & Discovery)
    expect(html).toContain('Search Tokyo, Kyoto, Osaka, cafés, vintage...');
    expect(html).toContain('DESTINATIONS COVERED');
    expect(html).toContain('✦ All Categories');

    // Bottom Section (Community Post Feed)
    expect(html).toContain('COMMUNITY TRIP FEED');
    expect(html).toContain('Tokyo: slow food + vintage streets');
    expect(html).toContain('Explicitly shared');
    expect(html).toContain('View Full Plan');

    // Place Discovery
    expect(html).toContain('PLACES FOR YOUR TRIP');
    expect(html).toContain('Tsukiji Outer Market');
    expect(html).toContain('Daikanyama');
    expect(html).toContain('Suggest to group');

    // Active trip preserved
    expect(html).toContain('Browsing <b>Tokyo</b>');
  });
});
