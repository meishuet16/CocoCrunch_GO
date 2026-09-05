/** Expressive records only. Never a second source of plan, privacy or Tingo state. */
export interface RitualState {
  savedIdeas?: { name: string; source: string }[];
  releasedWishIds?: number[];
  revivedWishIds?: number[];
  authoredMemoryNote?: string;
}
const key = 'cococrunch:rituals:v2';
export function loadRitualState(): RitualState {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return {
      savedIdeas: Array.isArray(value.savedIdeas) ? value.savedIdeas.filter((x: unknown) => x && typeof x === 'object' && typeof (x as {name?:unknown}).name === 'string' && typeof (x as {source?:unknown}).source === 'string') : [],
      releasedWishIds: Array.isArray(value.releasedWishIds) ? value.releasedWishIds.filter(Number.isSafeInteger) : [],
      revivedWishIds: Array.isArray(value.revivedWishIds) ? value.revivedWishIds.filter(Number.isSafeInteger) : [],
      authoredMemoryNote: typeof value.authoredMemoryNote === 'string' ? value.authoredMemoryNote : undefined,
    };
  } catch { return {}; }
}
export function commitRitualState(patch: Partial<RitualState>): boolean {
  try {
    const serialized = JSON.stringify({ ...loadRitualState(), ...patch });
    localStorage.setItem(key, serialized);
    return localStorage.getItem(key) === serialized;
  } catch { return false; }
}
export function memoryEligible(outcome: boolean, reflection: string | null, confirmed: boolean, status?: string): boolean {
  return outcome && Boolean(reflection) && (confirmed || status === 'confirmed' || status === 'dismissed');
}
export function qualifiesForPrayer(input: { important: boolean; uncontrollable: boolean; actionsExhausted: boolean; usefulRepair: boolean }): boolean {
  return input.important && input.uncontrollable && input.actionsExhausted && !input.usefulRepair;
}
