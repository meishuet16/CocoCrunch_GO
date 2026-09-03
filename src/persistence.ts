import type { BudgetPlan } from './domain/budget';
import type { CourtVote } from './domain/court';
import type { TravelProfile, TripReview } from './domain/preferences';

const STORAGE_KEY = 'cococrunch:v1';

export type PersistedRecommendation = {
  name: string;
  saved: boolean;
  added: boolean;
};

export type PersistedState = {
  version: 1;
  mode: 'group' | 'solo';
  destination: string;
  profile: TravelProfile;
  plannerTurn: string;
  courtVotes: CourtVote[];
  courtConfirmed: boolean;
  courtDecision: string | null;
  groupBudgetTotal: number;
  soloBudgetTotal: number;
  groupBudgetPlan: BudgetPlan;
  soloBudgetPlan: BudgetPlan;
  privacy: 'status' | 'area' | 'exact';
  continuousLocation: boolean;
  recommendations: PersistedRecommendation[];
  worthIt: TripReview | null;
  profileLearned: boolean;
};

export function loadPersisted(): Partial<PersistedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (!parsed || typeof parsed !== 'object' || (parsed.version !== undefined && parsed.version !== 1)) return {};
    return parsed;
  } catch {
    return {};
  }
}

export function savePersisted(value: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage is progressive enhancement: keep the in-memory trip usable.
  }
}

export function clearPersisted(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
