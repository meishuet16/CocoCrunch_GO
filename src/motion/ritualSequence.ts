export interface RitualStage<Name extends string = string> {
  readonly name: Name;
  /** Omit for a semantic step that requires advance(). */
  readonly durationMs?: number;
}

export interface RitualSnapshot<Name extends string = string> {
  readonly stage: Name | null;
  readonly busy: boolean;
  readonly reducedMotion: boolean;
}

/** Presentation only. The last stage is a retained terminal state, never a timer. */
export function createRitualSequence<Name extends string>(
  stages: readonly RitualStage<Name>[],
  options: { reducedMotion?: boolean } = {},
) {
  const sequence = stages.map(stage => {
    if (stage.durationMs !== undefined && (!Number.isFinite(stage.durationMs) || stage.durationMs < 0)) {
      throw new RangeError('Stage durationMs must be finite and non-negative');
    }
    return { ...stage };
  });
  let snapshot: RitualSnapshot<Name> = Object.freeze({
    stage: null, busy: false, reducedMotion: options.reducedMotion ?? false,
  });
  let index = -1;
  let generation = 0;
  let disposed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const listeners = new Set<() => void>();

  function clear() {
    generation++;
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  }

  function publish(stage: Name | null, busy: boolean, reducedMotion = snapshot.reducedMotion) {
    if (stage === snapshot.stage && busy === snapshot.busy && reducedMotion === snapshot.reducedMotion) return;
    snapshot = Object.freeze({ stage, busy, reducedMotion });
    listeners.forEach(listener => listener());
  }

  function enter(next: number, reducedMotion = snapshot.reducedMotion) {
    clear();
    while (reducedMotion && next < sequence.length - 1 && sequence[next].durationMs !== undefined) next++;
    index = next;
    const stage = sequence[index];
    const busy = index < sequence.length - 1;
    if (busy && stage.durationMs !== undefined) {
      const token = generation;
      timer = setTimeout(() => {
        if (!disposed && token === generation) enter(index + 1);
      }, stage.durationMs);
    }
    // Schedule before notifying: a subscriber may synchronously cancel or advance.
    publish(stage.name, busy, reducedMotion);
  }

  function cancel() {
    if (disposed) return;
    clear();
    index = -1;
    publish(null, false);
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      if (!disposed) listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    start() {
      if (disposed || snapshot.busy || sequence.length === 0) return false;
      enter(0);
      return true;
    },
    advance() {
      if (disposed || !snapshot.busy) return false;
      enter(index + 1);
      return true;
    },
    cancel,
    reset: cancel,
    dispose() {
      if (disposed) return;
      clear();
      disposed = true;
      index = -1;
      listeners.clear();
      snapshot = Object.freeze({ stage: null, busy: false, reducedMotion: snapshot.reducedMotion });
    },
    setReducedMotion(reducedMotion: boolean) {
      if (disposed || reducedMotion === snapshot.reducedMotion) return;
      if (reducedMotion && snapshot.busy && sequence[index].durationMs !== undefined) {
        enter(index, reducedMotion);
      } else {
        publish(snapshot.stage, snapshot.busy, reducedMotion);
      }
    },
  };
}
