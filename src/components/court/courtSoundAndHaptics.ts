/**
 * Travel Court Sound & Haptic Vibration Engine
 * Generates wooden gavel strikes, Duolingo-style victory fanfares, voting chimes, and haptic feedback.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextCtor) {
      audioCtx = new AudioContextCtor();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Realistic wooden gavel strike sound synthesis.
 * Simulates a hard wooden mallet hitting a sound block:
 * 1. High transient click / knock (fast envelope)
 * 2. Deep acoustic wooden body resonance (filtered low-mid decay)
 * 3. Subtle delayed second tap (rebound)
 */
export function playGavelStrike(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Primary strike
  createGavelImpulse(ctx, now, 1.0, 150);
  // Gentle rebound bounce 65ms later
  createGavelImpulse(ctx, now + 0.065, 0.45, 130);
}

function createGavelImpulse(ctx: AudioContext, time: number, volume: number, baseFreq: number): void {
  // 1. Initial click / impact transient
  const clickOsc = ctx.createOscillator();
  const clickGain = ctx.createGain();
  clickOsc.type = 'triangle';
  clickOsc.frequency.setValueAtTime(820, time);
  clickOsc.frequency.exponentialRampToValueAtTime(120, time + 0.03);
  clickGain.gain.setValueAtTime(volume * 0.7, time);
  clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
  clickOsc.connect(clickGain);
  clickGain.connect(ctx.destination);
  clickOsc.start(time);
  clickOsc.stop(time + 0.045);

  // 2. Resonant wooden block body (low-frequency resonance)
  const bodyOsc = ctx.createOscillator();
  const bodyGain = ctx.createGain();
  const bodyFilter = ctx.createBiquadFilter();

  bodyOsc.type = 'sine';
  bodyOsc.frequency.setValueAtTime(baseFreq, time);
  bodyOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, time + 0.18);

  bodyFilter.type = 'bandpass';
  bodyFilter.frequency.setValueAtTime(baseFreq * 1.5, time);
  bodyFilter.Q.setValueAtTime(4.0, time);

  bodyGain.gain.setValueAtTime(volume * 0.85, time);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

  bodyOsc.connect(bodyFilter);
  bodyFilter.connect(bodyGain);
  bodyGain.connect(ctx.destination);

  bodyOsc.start(time);
  bodyOsc.stop(time + 0.23);
}

/**
 * Duolingo-style vote chime (positive major triad or gentle cartoon boop)
 */
export function playVoteChime(positive: boolean): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (positive) {
    // Cheerful ascending major chime (E5 -> G#5 -> B5 -> E6)
    const notes = [659.25, 830.61, 987.77, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.28, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  } else {
    // Soft descending boop (G4 -> E4)
    const notes = [392.0, 329.63];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.24);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.26);
    });
  }
}

/**
 * Victory fanfare when case is approved / Jeju is added
 */
export function playVictoryFanfare(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Fanfare fanfare arpeggio: C5, G5, C6 with sparkling sparkle
  const notes = [
    { f: 523.25, t: 0.0, d: 0.14 },
    { f: 659.25, t: 0.12, d: 0.14 },
    { f: 783.99, t: 0.24, d: 0.16 },
    { f: 1046.5, t: 0.40, d: 0.45 },
  ];

  notes.forEach(({ f, t, d }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = now + t;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(f, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + d);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + d + 0.02);
  });
}

/**
 * Crisp organic bubble/wood pop for juror vote badge reveals & likes
 */
export function playPop(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(420, now);
  osc.frequency.exponentialRampToValueAtTime(1100, now + 0.04);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.08);
}

/**
 * Soft swoosh for transitions
 */
export function playWhoosh(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(480, now + 0.09);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.22);
}

/**
 * Physical vibration & Haptics
 */
export type HapticType = 'gavel' | 'vote' | 'victory' | 'pop' | 'tap';

export function triggerHaptic(type: HapticType): void {
  if (typeof window === 'undefined' || !navigator.vibrate) return;

  try {
    switch (type) {
      case 'gavel':
        // Heavy double impact
        navigator.vibrate([45, 55, 75]);
        break;
      case 'victory':
        // Celebration rhythm
        navigator.vibrate([35, 45, 40, 50, 70]);
        break;
      case 'vote':
        // Crisp punchy tick
        navigator.vibrate([30]);
        break;
      case 'pop':
        navigator.vibrate([18]);
        break;
      case 'tap':
      default:
        navigator.vibrate([12]);
        break;
    }
  } catch {
    // Ignore environments where vibrate is restricted
  }
}

/**
 * Physical screen camera shake helper
 * Triggers a dynamic jolt on the specified container
 */
export function triggerScreenShake(containerClass = 'court-shake-target'): void {
  const elements = document.querySelectorAll(`.${containerClass}`);
  elements.forEach(el => {
    el.classList.remove('court-gavel-shake');
    // Force reflow
    void (el as HTMLElement).offsetWidth;
    el.classList.add('court-gavel-shake');
    window.setTimeout(() => {
      el.classList.remove('court-gavel-shake');
    }, 450);
  });
}
