import type { RitualStage } from '../../motion/ritualSequence';

export const sequences: Record<'capture' | 'release' | 'prayer' | 'receipt', readonly RitualStage[]> = {
  capture: [{ name: 'prepare', durationMs: 400 }, { name: 'launch', durationMs: 500 }, { name: 'compress', durationMs: 450 }, { name: 'close', durationMs: 300 }, { name: 'shake', durationMs: 650 }, { name: 'commit' }, { name: 'success' }],
  release: [{ name: 'enter', durationMs: 400 }, { name: 'ignition', durationMs: 500 }, { name: 'curl', durationMs: 650 }, { name: 'flames', durationMs: 750 }, { name: 'ash', durationMs: 600 }, { name: 'commit' }, { name: 'success' }],
  prayer: [{ name: 'hands' }, { name: 'incense' }, { name: 'uncertainty' }, { name: 'talisman' }, { name: 'ember', durationMs: 500 }, { name: 'curl', durationMs: 650 }, { name: 'flames', durationMs: 750 }, { name: 'ash', durationMs: 600 }, { name: 'appeal' }, { name: 'tired' }, { name: 'complete' }],
  receipt: [{ name: 'printer', durationMs: 350 }, { name: 'feed', durationMs: 1100 }, { name: 'tear' }, { name: 'tearing', durationMs: 450 }, { name: 'prepared' }],
};

/** A failed synchronous adapter remains retryable. Never called by a timer. */
export function createCommitGate() {
  let committed = false;
  let running = false;
  return { run(stage: string | null, expected: string, write?: () => boolean) {
    if (stage !== expected || committed || running || !write) return false;
    running = true;
    try { committed = write() === true; return committed; }
    catch { return false; }
    finally { running = false; }
  } };
}

export function equalAllocation(total: number, participants: readonly string[]) {
  const cents = Math.round(total * 100);
  if (!Number.isFinite(total) || total < 0 || !Number.isSafeInteger(cents) || !participants.length || participants.some(name => !name.trim())) return null;
  return participants.map((name, index) => ({ name, cents: Math.floor(cents / participants.length) + (index < cents % participants.length ? 1 : 0) }));
}
