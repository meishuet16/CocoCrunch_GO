import { useSyncExternalStore } from 'react';

const query = '(prefers-reduced-motion: reduce)';
let media: MediaQueryList | undefined;
const listeners = new Set<() => void>();

function readMedia() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(query) : undefined;
}

function notify() {
  listeners.forEach(listener => listener());
}

/** One browser preference listener shared by all mounted motion consumers. */
export const reducedMotionStore = {
  getSnapshot: () => (media ?? readMedia())?.matches ?? false,
  getServerSnapshot: () => false,
  subscribe(listener: () => void) {
    // A wrapper gives each subscription independent ownership, even for the same callback.
    const subscription = () => listener();
    listeners.add(subscription);
    if (listeners.size === 1) {
      media = readMedia();
      media?.addEventListener('change', notify);
    }
    return () => {
      listeners.delete(subscription);
      if (listeners.size === 0) {
        media?.removeEventListener('change', notify);
        media = undefined;
      }
    };
  },
};

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    reducedMotionStore.subscribe, reducedMotionStore.getSnapshot, reducedMotionStore.getServerSnapshot,
  );
}
