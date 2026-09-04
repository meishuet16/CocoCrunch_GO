import type { BudgetActuals, BudgetPlan } from './domain/budget';
import type { CourtVote } from './domain/court';
import type { TravelProfile, TripReview } from './domain/preferences';
import { tripIntentFromLegacyState, type TripIntent } from './domain/trip-intent';
import { scoreTingo, type TingoAnswer, type TingoDimensions } from './domain/tingo';
import type { HumanCommitment, ReunionAgreement, TripConstraint, TripMember, TripReminder } from './domain/trip';
import type { MemberPreferenceProfile } from './domain/group-dna';
import type { BackupCandidate, RepairResult } from './domain/backup-repair';

const STORAGE_KEY = 'cococrunch:v1';

export type PersistedRecommendation = {
  name: string;
  saved: boolean;
  added: boolean;
};

export type CourtOptionState = {
  id: string;
  label: string;
  viable?: boolean;
  dealBreakerSafe?: boolean;
  costDelta?: number;
  timeDeltaMinutes?: number;
  preferenceLoss?: number;
  lossReason?: string;
};

export type DecisionRecord = {
  id: string;
  kind: 'court' | 'emergency';
  topic: string;
  decision: string;
  voteSummary?: string;
  usedGacha?: boolean;
  satisfaction?: 'worth' | 'mixed' | 'skip';
  createdAt: string;
};

export type CompletedPaceEvidence = {
  delayed: boolean;
  mood: 'great' | 'okay' | 'tired' | null;
  arrivalChecked: boolean;
};

export type PersistedState = {
  version: 1;
  mode: 'group' | 'solo';
  destination: string;
  readyConfirmed?: boolean;
  profile: TravelProfile;
  plannerTurn: string;
  courtVotes: CourtVote[];
  courtConfirmed: boolean;
  courtDecision: string | null;
  courtOptions?: CourtOptionState[];
  activeConflict?: string;
  decisionHistory?: DecisionRecord[];
  groupBudgetTotal: number;
  soloBudgetTotal: number;
  groupBudgetPlan: BudgetPlan;
  soloBudgetPlan: BudgetPlan;
  groupBudgetActuals?: BudgetActuals;
  soloBudgetActuals?: BudgetActuals;
  completedPaceEvidence?: CompletedPaceEvidence;
  privacy: 'status' | 'area' | 'exact';
  continuousLocation: boolean;
  recommendations: PersistedRecommendation[];
  worthIt: TripReview | null;
  profileLearned: boolean;
  tripIntent?: TripIntent;
  tingoAnswers?: TingoAnswer[];
  tingoDimensions?: TingoDimensions;
  basePackingPreferences?: string[];
  tripCreated?: boolean;
  members?: TripMember[];
  memberPreferenceProfiles?: Record<string, MemberPreferenceProfile>;
  backupCandidates?: BackupCandidate[];
  appliedRepair?: RepairResult;
  constraints?: TripConstraint[];
  reminders?: TripReminder[];
  commitments?: HumanCommitment[];
  reunion?: ReunionAgreement;
  published?: boolean;
  memoryNote?: string;
  memoryPublic?: boolean;
  itemReviews?: Record<string, 'worth' | 'mixed' | 'skip'>;
};

export type PersistedTripState = {
  mode: 'group' | 'solo';
  tripBudget: number;
  profile?: TravelProfile;
  tripIntent: TripIntent;
};

function normalizePersistedState(parsed: Partial<PersistedState>): Partial<PersistedState> {
  if (!Array.isArray(parsed.tingoAnswers)) return parsed;
  return { ...parsed, tingoDimensions: scoreTingo(parsed.tingoAnswers) };
}

export function derivePersistedTripState(parsed: Partial<PersistedState>): PersistedTripState {
  const mode = parsed.tripIntent?.mode ?? parsed.mode ?? 'group';
  const tripBudget = parsed.tripIntent?.budget
    ?? (mode === 'group' ? parsed.groupBudgetTotal : parsed.soloBudgetTotal)
    ?? (mode === 'group' ? 2400 : 1200);

  return {
    mode,
    tripBudget,
    profile: parsed.profile,
    tripIntent: parsed.tripIntent ?? tripIntentFromLegacyState({
      destination: parsed.destination,
      mode,
      profile: parsed.profile,
      budget: tripBudget,
    }),
  };
}

export function loadPersisted(): Partial<PersistedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (!parsed || typeof parsed !== 'object' || (parsed.version !== undefined && parsed.version !== 1)) return {};
    return normalizePersistedState(parsed);
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
