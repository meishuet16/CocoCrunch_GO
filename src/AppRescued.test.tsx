import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import AppRescued, { deriveTripLifecycleStatus } from './AppRescued';
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
      onboardingComplete: true,
      mode: 'solo',
      readyConfirmed,
      tingoAnswers: completeTingoAnswers,
      tripIntent: {
        destination: 'Tokyo',
        dates: { start: '2099-10-12', end: '2099-10-21' },
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

  it('requires onboarding before rendering the existing app for a first-time visitor', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    });

    const html = renderToStaticMarkup(<AppRescued />);

    expect(html).toContain('Welcome');
    expect(html).toContain('CocoCrunch');
    expect(html).toContain('Login');
    expect(html).toContain('Sign up');
    expect(html).not.toContain('HOME · ACTIVE TRIP');
  });

  it('keeps an unconfirmed planning trip out of Home', () => {
    stubPersistedTrip(false);

    const html = renderToStaticMarkup(<AppRescued />);

    expect(html).toContain('No active trip');
    expect(html).toContain('Explore ideas');
    expect(html).not.toContain('HOME · ACTIVE TRIP');
  });

  it('does not require confirm-ready after a stored planning confirmation', () => {
    stubPersistedTrip(true);

    const html = renderToStaticMarkup(<AppRescued />);

    expect(html).toContain('Active trip');
    expect(html).toContain('Current trip');
    expect(html).toContain('Departure ahead');
  });

  it('derives active and ongoing status from confirmation and departure date', () => {
    const base = { tripCreated: true, readyConfirmed: true, phase: 'planning' as const };
    expect(deriveTripLifecycleStatus({ ...base, dates: { start: '2099-10-12', end: '2099-10-21' }, now: new Date('2099-10-11T12:00:00') })).toBe('active');
    expect(deriveTripLifecycleStatus({ ...base, dates: { start: '2099-10-12', end: '2099-10-21' }, now: new Date('2099-10-12T00:00:00') })).toBe('ongoing');
    expect(deriveTripLifecycleStatus({ ...base, readyConfirmed: false, dates: { start: '2099-10-12', end: '2099-10-21' } })).toBe('planning');
  });

  it('uses the shared CocoCrunch brand and canonical Coco companion on Home', () => {
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => key === 'cococrunch:v1' ? JSON.stringify({ version: 1, onboardingComplete: true }) : null,
      setItem: () => undefined,
      removeItem: () => undefined,
    });

    const html = renderToStaticMarkup(<AppRescued />);

    expect(html).toContain('COCOCRUNCH');
    expect(html).toContain('aria-label="Notifications"');
    expect(html).toContain('aria-label="Open Coco menu"');
    expect(html).toContain(`src="${cocoAsset('scene-home')}"`);
    expect(html).toContain('data-context="home"');
  });

  it('renders Logout at the end of the Me screen', () => {
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => key === 'cococrunch:v1' ? JSON.stringify({ version: 1, onboardingComplete: true, tab: 'me' }) : null,
      setItem: () => undefined,
      removeItem: () => undefined,
    });

    const html = renderToStaticMarkup(<AppRescued />);

    expect(html).toContain('aria-label="Account actions"');
    expect(html).toContain('Log out');
  });

  it('renders Community Trip Explore screen when on explore tab without changing active trip', () => {
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => key === 'cococrunch:v1' ? JSON.stringify({
        version: 1,
        onboardingComplete: true,
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
    expect(html).toContain('Search places');
    expect(html).toContain('DESTINATIONS COVERED');
    expect(html).toContain('>All</button>');

    // Bottom Section (Community Post Feed)
    expect(html).toContain('COMMUNITY TRIPS');
    expect(html).toContain('Tokyo: slow food + vintage streets');
    expect(html).toContain('Explicitly shared');
    expect(html).toContain('View Full Plan');

    // Place Discovery
    expect(html).toContain('TRIP PLACES');
    expect(html).toContain('Tsukiji Outer Market');
    expect(html).toContain('Daikanyama');
    expect(html).toContain('Suggest to group');

    // Active trip preserved
    expect(html).toContain('Browsing <b>Tokyo</b>');
  });
});
