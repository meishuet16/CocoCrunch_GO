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

const SOUND_KEY = 'cococrunch:sound-enabled';
const ui = createUISFX({ pack: 'zen' });
let ready = false;

const cue = {
  tap: 'select',
  save: 'success',
  decision: 'complete',
  gacha: 'reveal',
  repair: 'success',
  capture: 'drop',
  courier: 'send',
  receipt: 'complete',
  'prayer-step': 'progress-step',
  'memory-open': 'open',
  'memory-seal': 'checkpoint',
} as const;

function readEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(SOUND_KEY) !== 'false';
  } catch {
    return true;
  }
}

export function unlockSound() {
  if (ready) return;
  ready = true;
  ui.setEnabled(readEnabled());
  // The published uisfx player lazily creates/resumes Web Audio from play().
  // This function is intentionally called only from a trusted user gesture.
}

export function playSound(sound: CocoSound) {
  if (!ready) return;
  try {
    ui.play(cue[sound]);
  } catch {
    // Audio is progressive enhancement; never block product logic.
  }
}

export function setSoundEnabled(enabled: boolean) {
  ui.setEnabled(enabled);
  try {
    window.localStorage.setItem(SOUND_KEY, String(enabled));
  } catch {
    // Storage can be unavailable in constrained/private contexts.
  }
}
