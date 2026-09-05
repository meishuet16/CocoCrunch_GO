import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { reducedMotionStore, useReducedMotion } from './useReducedMotion';
import { createRitualSequenceStore, useRitualSequence } from './useRitualSequence';

function mediaPreference(initial = false) {
  let matches = initial;
  const listeners = new Set<() => void>();
  const media = {
    get matches() { return matches; },
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  };
  vi.stubGlobal('window', { matchMedia: vi.fn(() => media) });
  return {
    listeners,
    change(value: boolean) { matches = value; listeners.forEach(listener => listener()); },
  };
}

describe('shared motion hooks and external-store lifecycle', () => {
  const stages = [{ name: 'printing', durationMs: 100 }, { name: 'tear' },
    { name: 'tearing', durationMs: 50 }, { name: 'complete' }] as const;
  const cleanups: (() => void)[] = [];
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanups.splice(0).forEach(cleanup => cleanup());
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('shares one live media listener and detaches after the last subscriber', () => {
    const media = mediaPreference();
    const first = vi.fn();
    const second = vi.fn();
    const removeFirst = reducedMotionStore.subscribe(first);
    const removeSecond = reducedMotionStore.subscribe(second);
    cleanups.push(removeFirst, removeSecond);
    expect(media.listeners.size).toBe(1);
    media.change(true);
    expect(reducedMotionStore.getSnapshot()).toBe(true);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    removeFirst();
    expect(media.listeners.size).toBe(1);
    removeSecond();
    expect(media.listeners.size).toBe(0);
    // Read a preference that changed while nothing was mounted.
    media.change(false);
    expect(reducedMotionStore.getSnapshot()).toBe(false);
  });

  it('reacts to live preference changes during a running ritual and preserves the hold', () => {
    const media = mediaPreference();
    const store = createRitualSequenceStore(stages);
    cleanups.push(store.subscribe(() => {}));
    store.start();
    vi.advanceTimersByTime(20);
    media.change(true);
    expect(store.getSnapshot()).toMatchObject({ stage: 'tear', busy: true, reducedMotion: true });
    expect(vi.getTimerCount()).toBe(0);
    store.advance();
    expect(store.getSnapshot()).toMatchObject({ stage: 'complete', busy: false });
  });

  it('supports StrictMode subscribe/cleanup/subscribe replay without resurrecting old timers', () => {
    const media = mediaPreference();
    const store = createRitualSequenceStore(stages);
    const removeFirst = store.subscribe(() => {});
    store.start();
    removeFirst();
    expect(vi.getTimerCount()).toBe(0);
    expect(media.listeners.size).toBe(0);
    expect(store.start()).toBe(false);
    const notify = vi.fn();
    const removeSecond = store.subscribe(notify);
    cleanups.push(removeSecond);
    expect(store.start()).toBe(true);
    expect(store.start()).toBe(false);
    vi.advanceTimersByTime(100);
    expect(store.getSnapshot().stage).toBe('tear');
    removeSecond();
    notify.mockClear();
    media.change(true);
    vi.runAllTimers();
    expect(notify).not.toHaveBeenCalled();
    expect(store.getSnapshot()).toMatchObject({ stage: null, busy: false });
  });

  it('reset closes a mounted ritual, clears its timer, and allows a fresh start', () => {
    mediaPreference();
    const store = createRitualSequenceStore(stages);
    cleanups.push(store.subscribe(() => {}));
    store.start();
    store.reset();
    vi.runAllTimers();
    expect(store.getSnapshot().stage).toBeNull();
    expect(store.start()).toBe(true);
  });

  it('starts with reduced motion already enabled and catches changes before subscribing', () => {
    const media = mediaPreference();
    const store = createRitualSequenceStore(stages);
    media.change(true);
    cleanups.push(store.subscribe(() => {}));
    store.start();
    expect(store.getSnapshot()).toMatchObject({ stage: 'tear', reducedMotion: true });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('renders both real React hooks on the server without browser globals or timers', () => {
    vi.stubGlobal('window', undefined);
    function Probe() {
      const ritual = useRitualSequence(stages);
      const reduced = useReducedMotion();
      return <span>{JSON.stringify({ ...ritual, shared: reduced })}</span>;
    }
    const html = renderToString(<Probe />);
    expect(html).toContain('&quot;stage&quot;:null');
    expect(html).toContain('&quot;busy&quot;:false');
    expect(html).toContain('&quot;shared&quot;:false');
    expect(vi.getTimerCount()).toBe(0);
  });
});
