const STORAGE_KEY = 'cococrunch:v1';
export function loadPersisted<T>(fallback: T): T {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? { ...fallback, ...JSON.parse(raw) } : fallback; } catch { return fallback; }
}
export function savePersisted(value: unknown): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch { /* Keep the in-memory experience usable when storage is unavailable. */ }
}
