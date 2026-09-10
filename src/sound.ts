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
  | 'gavel'
  | 'prayer-step'
  | 'memory-open'
  | 'memory-seal';

const SOUND_KEY = 'cococrunch:sound-enabled';
const ui = createUISFX({ pack: 'zen' });
let ready = false;

const cue: Record<CocoSound, CueName> = {
  tap: 'select',
  save: 'success',
  decision: 'complete',
  gacha: 'bonus',
  repair: 'success',
  capture: 'drop',
  courier: 'send',
  receipt: 'complete',
  gavel: 'drop',
  'prayer-step': 'progress-step',
  'memory-open': 'open',
  'memory-seal': 'checkpoint',
};

function readEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(SOUND_KEY) !== 'false';
  } catch {
    return true;
  }
}

export function unlockSound(): void {
  if (ready) return;
  ready = true;
  ui.setEnabled(readEnabled());
}

export function playSound(sound: CocoSound): void {
  if (!ready) return;
  try {
    ui.play(cue[sound]);
    if (sound === 'gavel') playGavelKnock();
  } catch {
    // Audio is progressive enhancement; never block product logic.
  }
}

function playGavelKnock(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;
    const audio = new AudioContextCtor();
    const now = audio.currentTime;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(118, now);
    oscillator.frequency.exponentialRampToValueAtTime(54, now + 0.08);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.34, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.17);
    window.setTimeout(() => { void audio.close(); }, 240);
  } catch {
    // The packaged cue above is enough when custom synthesis is unavailable.
  }
}

export function setSoundEnabled(enabled: boolean): void {
  ui.setEnabled(enabled);
  try {
    window.localStorage.setItem(SOUND_KEY, String(enabled));
  } catch {
    // Storage can be unavailable in constrained/private contexts.
  }
}
