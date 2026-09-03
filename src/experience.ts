export type PrivacyLevel = 'status' | 'area' | 'exact';

export type ExperienceEvent =
  | { type: 'capture-place'; place: string }
  | { type: 'send-family-reassurance'; destination: string; privacy: PrivacyLevel; delayed: boolean }
  | { type: 'print-receipt' }
  | { type: 'open-prayer' };

type ExperienceListener = (event: ExperienceEvent) => void;

const listeners = new Set<ExperienceListener>();

export function emitExperience(event: ExperienceEvent) {
  listeners.forEach(listener => listener(event));
}

export function subscribeExperience(listener: ExperienceListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
