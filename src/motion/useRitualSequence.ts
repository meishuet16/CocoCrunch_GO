import { useMemo, useSyncExternalStore } from 'react';
import { createRitualSequence, type RitualSnapshot, type RitualStage } from './ritualSequence';
import { reducedMotionStore } from './useReducedMotion';

/** Subscription-owned lifecycle: cleanup cancels; resubscription remains safe in StrictMode. */
export function createRitualSequenceStore<Name extends string>(stages: readonly RitualStage<Name>[]) {
  const runner = createRitualSequence(stages, { reducedMotion: reducedMotionStore.getSnapshot() });
  const serverSnapshot: RitualSnapshot<Name> = Object.freeze({ stage: null, busy: false, reducedMotion: false });
  let subscribers = 0;
  let unsubscribePreference: (() => void) | undefined;
  const syncPreference = () => runner.setReducedMotion(reducedMotionStore.getSnapshot());

  return {
    getSnapshot: runner.getSnapshot,
    getServerSnapshot: () => serverSnapshot,
    subscribe(listener: () => void) {
      subscribers++;
      if (subscribers === 1) {
        unsubscribePreference = reducedMotionStore.subscribe(syncPreference);
        syncPreference();
      }
      const unsubscribe = runner.subscribe(listener);
      let active = true;
      return () => {
        if (!active) return;
        active = false;
        unsubscribe();
        if (--subscribers === 0) {
          unsubscribePreference?.();
          unsubscribePreference = undefined;
          runner.cancel();
        }
      };
    },
    start: () => subscribers > 0 && runner.start(),
    advance: () => subscribers > 0 && runner.advance(),
    reset: runner.reset,
  };
}

/**
 * Idle is null. start enters the first stage; advance moves one semantic step.
 * The final stage is retained with busy=false. Use reset when a dialog closes.
 * Equal inline stage arrays preserve progress; changed definitions reset it.
 * Persistence must be performed separately, never inferred from stage completion.
 */
export function useRitualSequence<Name extends string>(stages: readonly RitualStage<Name>[]) {
  const key = JSON.stringify(stages.map(({ name, durationMs }) => [name, durationMs]));
  const store = useMemo(() => createRitualSequenceStore(stages), [key]);
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return { ...snapshot, start: store.start, advance: store.advance, reset: store.reset };
}
