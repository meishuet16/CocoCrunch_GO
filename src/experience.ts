export type PrivacyLevel = 'status' | 'area' | 'exact';

export type ExperienceEvent =
  | { type: 'capture-place'; place: string; save: () => boolean }
  | { type: 'release-wish'; name: string; reason: string; commit: () => boolean }
  | { type: 'send-family-reassurance'; destination: string; privacy: PrivacyLevel; delayed: boolean }
  | { type: 'print-receipt'; total: number; participants: string[] }
  | { type: 'open-prayer'; source: 'simulated' | 'user-reported' | 'unavailable'; uncertainty: string }
  | { type: 'open-packing'; items?: string[] }
  | { type: 'close-packing' };

type ExperienceListener = (event: ExperienceEvent) => void;

const listeners = new Set<ExperienceListener>();

export function emitExperience(event: ExperienceEvent): void {
  listeners.forEach(listener => listener(event));
}

export function subscribeExperience(listener: ExperienceListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
