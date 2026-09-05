import { afterEach, expect, it, vi } from 'vitest';
import { createRitualSequence } from '../../motion/ritualSequence';
import { sequences, equalAllocation, createCommitGate } from './rituals';

afterEach(() => vi.useRealTimers());
it.each(['capture', 'release'] as const)('%s holds before persistence, retries failure and commits once', kind => {
  vi.useFakeTimers();
  const runner = createRitualSequence(sequences[kind]);
  const gate = createCommitGate();
  const write = vi.fn().mockReturnValueOnce(false).mockReturnValue(true);
  expect(gate.run(runner.getSnapshot().stage, 'commit', write)).toBe(false);
  runner.start();
  expect(runner.start()).toBe(false);
  vi.runAllTimers();
  expect(runner.getSnapshot().stage).toBe('commit');
  expect(write).not.toHaveBeenCalled();
  expect(gate.run('commit', 'commit', write)).toBe(false);
  expect(gate.run('commit', 'commit', write)).toBe(true);
  expect(gate.run('commit', 'commit', write)).toBe(false);
  runner.advance();
  expect(runner.getSnapshot().stage).toBe('success');
  expect(write).toHaveBeenCalledTimes(2);
});
it('handles thrown writes without claiming success', () => {
  const gate = createCommitGate();
  expect(gate.run('commit', 'commit', () => { throw Error('offline'); })).toBe(false);
  expect(gate.run('commit', 'commit', () => true)).toBe(true);
});
it('keeps all prayer interactions meaningful with reduced motion', () => {
  const runner = createRitualSequence(sequences.prayer, { reducedMotion: true });
  runner.start();
  const held = [];
  do { held.push(runner.getSnapshot().stage); } while (runner.advance());
  expect(held).toEqual(['hands', 'incense', 'uncertainty', 'talisman', 'appeal', 'tired', 'complete']);
});
it('receipt holds at tear and only ends prepared', () => {
  vi.useFakeTimers();
  const runner = createRitualSequence(sequences.receipt);
  runner.start(); vi.runAllTimers();
  expect(runner.getSnapshot().stage).toBe('tear');
  runner.advance(); vi.runAllTimers();
  expect(runner.getSnapshot().stage).toBe('prepared');
});
it('closing cancels every automatic stage', () => {
  vi.useFakeTimers();
  const runner = createRitualSequence(sequences.release);
  runner.start(); runner.cancel(); vi.runAllTimers();
  expect(runner.getSnapshot().stage).toBeNull();
});
it('allocates exact cents in participant order without losing the remainder', () => {
  expect(equalAllocation(10.01, ['A', 'B', 'C'])).toEqual([
    { name: 'A', cents: 334 }, { name: 'B', cents: 334 }, { name: 'C', cents: 333 },
  ]);
  expect(equalAllocation(-1, ['A'])).toBeNull();
  expect(equalAllocation(10, [])).toBeNull();
  expect(equalAllocation(NaN, ['A'])).toBeNull();
});
