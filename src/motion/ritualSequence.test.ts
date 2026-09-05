import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRitualSequence } from './ritualSequence';

describe('ritual sequence', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });
  const stages = [
    { name: 'printing', durationMs: 100 },
    { name: 'readyToTear' },
    { name: 'tearing', durationMs: 50 },
    { name: 'complete' },
  ] as const;

  it('runs in order, holds semantic steps, and retains the final stage', () => {
    const runner = createRitualSequence(stages);
    const seen: (string | null)[] = [];
    runner.subscribe(() => seen.push(runner.getSnapshot().stage));
    expect(runner.getSnapshot().stage).toBeNull();
    expect(runner.advance()).toBe(false);
    expect(runner.start()).toBe(true);
    vi.advanceTimersByTime(99);
    expect(runner.getSnapshot().stage).toBe('printing');
    vi.advanceTimersByTime(1);
    vi.advanceTimersByTime(10_000);
    expect(runner.getSnapshot()).toMatchObject({ stage: 'readyToTear', busy: true });
    runner.advance();
    vi.advanceTimersByTime(50);
    expect(runner.getSnapshot()).toMatchObject({ stage: 'complete', busy: false });
    expect(runner.advance()).toBe(false);
    expect(seen).toEqual(['printing', 'readyToTear', 'tearing', 'complete']);
  });

  it('locks duplicate starts including while held, then allows replay after completion', () => {
    const runner = createRitualSequence(stages);
    runner.start();
    vi.advanceTimersByTime(70);
    expect(runner.start()).toBe(false);
    vi.advanceTimersByTime(30);
    expect(runner.start()).toBe(false);
    expect(runner.getSnapshot().stage).toBe('readyToTear');
    runner.advance();
    vi.runAllTimers();
    expect(runner.start()).toBe(true);
    expect(vi.getTimerCount()).toBe(1);
    runner.dispose();
  });

  it('manual advancement invalidates the old timer', () => {
    const runner = createRitualSequence(stages);
    runner.start();
    runner.advance();
    vi.runAllTimers();
    expect(runner.getSnapshot().stage).toBe('readyToTear');
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['cancel', 'reset', 'dispose'] as const)('%s clears timers and invalidates already queued callbacks', (method) => {
    const timer = vi.spyOn(globalThis, 'setTimeout');
    const runner = createRitualSequence(stages);
    runner.start();
    const staleCallback = timer.mock.calls[0][0] as () => void;
    runner[method]();
    expect(vi.getTimerCount()).toBe(0);
    expect(runner.getSnapshot()).toMatchObject({ stage: null, busy: false });
    const notify = vi.fn();
    runner.subscribe(notify);
    if (method !== 'dispose') runner.start();
    const current = runner.getSnapshot();
    notify.mockClear();
    staleCallback();
    expect(runner.getSnapshot()).toBe(current);
    expect(notify).not.toHaveBeenCalled();
    if (method === 'dispose') expect(runner.start()).toBe(false);
    runner.dispose();
  });

  it('offers cached snapshots and removable subscriptions', () => {
    const runner = createRitualSequence(stages);
    const initial = runner.getSnapshot();
    const listener = vi.fn();
    const unsubscribe = runner.subscribe(listener);
    expect(runner.getSnapshot()).toBe(initial);
    runner.start();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(runner.getSnapshot()).not.toBe(initial);
    unsubscribe();
    runner.reset();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('reduced motion preserves every held step, including the first and final', () => {
    const runner = createRitualSequence([
      { name: 'confirm' }, { name: 'burn', durationMs: 100 },
      { name: 'appeal' }, { name: 'settle', durationMs: 100 }, { name: 'complete' },
    ], { reducedMotion: true });
    runner.start();
    expect(runner.getSnapshot().stage).toBe('confirm');
    runner.advance();
    expect(runner.getSnapshot().stage).toBe('appeal');
    runner.advance();
    expect(runner.getSnapshot()).toMatchObject({ stage: 'complete', busy: false });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('reduced motion retains a timed final stage without a timer', () => {
    const runner = createRitualSequence([
      { name: 'turn', durationMs: 100 }, { name: 'revealed', durationMs: 200 },
    ], { reducedMotion: true });
    runner.start();
    expect(runner.getSnapshot()).toMatchObject({ stage: 'revealed', busy: false });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('changing preference mid-animation skips to the next hold and never replays skipped motion', () => {
    const timer = vi.spyOn(globalThis, 'setTimeout');
    const runner = createRitualSequence(stages);
    runner.start();
    const staleCallback = timer.mock.calls[0][0] as () => void;
    vi.advanceTimersByTime(20);
    runner.setReducedMotion(true);
    expect(runner.getSnapshot()).toMatchObject({ stage: 'readyToTear', reducedMotion: true });
    expect(vi.getTimerCount()).toBe(0);
    runner.setReducedMotion(false);
    runner.advance();
    staleCallback();
    expect(runner.getSnapshot().stage).toBe('tearing');
    vi.advanceTimersByTime(49);
    expect(runner.getSnapshot().stage).toBe('tearing');
    runner.setReducedMotion(true);
    expect(runner.getSnapshot()).toMatchObject({ stage: 'complete', busy: false });
  });

  it('handles empty and single-stage sequences', () => {
    expect(createRitualSequence([]).start()).toBe(false);
    const runner = createRitualSequence([{ name: 'complete' }]);
    runner.start();
    expect(runner.getSnapshot()).toMatchObject({ stage: 'complete', busy: false });
  });

  it('rejects invalid durations and accepts zero duration', () => {
    for (const durationMs of [-1, NaN, Infinity]) {
      expect(() => createRitualSequence([{ name: 'bad', durationMs }])).toThrow(RangeError);
    }
    const runner = createRitualSequence([{ name: 'instant', durationMs: 0 }, { name: 'held' }]);
    runner.start();
    vi.runAllTimers();
    expect(runner.getSnapshot().stage).toBe('held');
  });
});
