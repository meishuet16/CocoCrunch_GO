import { createUISFX } from 'uisfx';

export type CocoSound =
  | 'tap'
  | 'save'
  | 'decision'
  | 'gacha'
  | 'repair'
  | 'capture'
  | 'courier'
  | 'receipt'
  | 'prayer-step'
  | 'memory-open'
  | 'memory-seal';

const ui = createUISFX({ pack: 'zen', preferences: {} });
let unlocked = false;

const cue: Record<CocoSound, string> = {
  tap: 'select',
  save: 'success',
  decision: 'complete',
  gacha: 'reveal',
  repair: 'success',
  capture: 'drop',
  courier: 'send',
  receipt: 'complete',
  'prayer-step': 'step',
  'memory-open': 'open',
  'memory-seal': 'success',
};

export async function unlockSound() {
  if (unlocked) return;
  try {
    await ui.unlock();
    unlocked = true;
  } catch {
    // Audio is progressive enhancement; the visible interaction remains complete.
  }
}

export function playSound(sound: CocoSound) {
  if (!unlocked) return;
  try {
    ui.play(cue[sound] as Parameters<typeof ui.play>[0]);
  } catch {
    // Never let audio failure block product logic.
  }
}

export function setSoundEnabled(enabled: boolean) {
  ui.setEnabled(enabled);
}
