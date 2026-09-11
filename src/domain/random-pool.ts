export type DrawPoolSource = 'floating-itinerary' | 'saved-idea' | 'backup' | 'court-skipped' | 'optional';

export type DrawPoolCandidate = { name: string; source: DrawPoolSource; viable?: boolean; dealBreakerSafe?: boolean };

/** Builds a playful suggestion pool without mutating any source trip state. */
export function deriveEverydayDrawPool(candidates: DrawPoolCandidate[]): string[] {
  return [...new Set(candidates
    .filter(candidate => candidate.name.trim() && candidate.viable !== false && candidate.dealBreakerSafe !== false)
    .map(candidate => candidate.name.trim()))].slice(0, 8);
}
