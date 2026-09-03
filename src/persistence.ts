const STORAGE_KEY = 'cococrunch:v1';
export type PersistedState = { destination?: string; budgetTotal?: number; profile?: Record<string, string>; courtVotes?: Record<string, 'ramen' | 'sushi'> };
export function loadPersisted(fallback: PersistedState = {}): PersistedState {
  try { const raw = localStorage.getItem(STORAGE_KEY); const parsed = raw ? JSON.parse(raw) : {}; return typeof parsed === 'object' && parsed ? { ...fallback, ...parsed } : fallback; } catch { return fallback; }
}
export function savePersisted(value: PersistedState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch { /* Keep the in-memory experience usable when storage is unavailable. */ }
}
export function clearPersisted(): void { try { localStorage.removeItem(STORAGE_KEY); } catch { /* no-op */ } }
