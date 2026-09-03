import { createUISFX, type CueName } from 'uisfx';

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

const cue: Record<CocoSound, CueName> = {
  tap: 'select',
  save: 'checkpoint',
  decision: 'complete',
  gacha: 'bonus',
  repair: 'success',
  capture: 'drop',
  courier: 'send',
  receipt: 'complete',
  'prayer-step': 'progress-step',
  'memory-open': 'open',
  'memory-seal': 'checkpoint',
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
    ui.play(cue[sound]);
  } catch {
    // Never let audio failure block product logic.
  }
}

export function setSoundEnabled(enabled: boolean) {
  ui.setEnabled(enabled);
}
