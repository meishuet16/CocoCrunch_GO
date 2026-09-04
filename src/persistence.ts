import type { BudgetActuals, BudgetPlan } from './domain/budget';
import type { CourtVote } from './domain/court';
import type { TravelProfile, TripReview } from './domain/preferences';
import type { TingoAnswer, TingoDimensions } from './domain/tingo';
import type { HumanCommitment, ReunionAgreement, TripConstraint, TripMember, TripReminder } from './domain/trip';
import type { MemberPreferenceProfile } from './domain/group-dna';
import type { BackupCandidate } from './domain/backup-repair';

const STORAGE_KEY = 'cococrunch:v1';

export type PersistedRecommendation = {
  name: string;
  saved: boolean;
  added: boolean;
};

export type CourtOptionState = {
  id: string;
  label: string;
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
  tingoAnswers?: TingoAnswer[];
  tingoDimensions?: TingoDimensions;
  basePackingPreferences?: string[];
  tripCreated?: boolean;
  members?: TripMember[];
  memberPreferenceProfiles?: Record<string, MemberPreferenceProfile>;
  backupCandidates?: BackupCandidate[];
  constraints?: TripConstraint[];
  reminders?: TripReminder[];
  commitments?: HumanCommitment[];
  reunion?: ReunionAgreement;
  published?: boolean;
  memoryNote?: string;
  memoryPublic?: boolean;
  itemReviews?: Record<string, 'worth' | 'mixed' | 'skip'>;
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
