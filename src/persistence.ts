import type { BudgetActuals, BudgetPlan } from './domain/budget';
import type { CourtVote } from './domain/court';
import type { LearningProposal } from './domain/learning';
import type { TravelProfile, TripReview } from './domain/preferences';
import { tripIntentFromLegacyState, type TripIntent } from './domain/trip-intent';
import { scoreTingo, type TingoAnswer, type TingoDimensions } from './domain/tingo';
import type { HumanCommitment, ReunionAgreement, TripConstraint, TripMember, TripReminder } from './domain/trip';
import type { MemberPreferenceProfile } from './domain/group-dna';
import type { BackupCandidate, RepairResult } from './domain/backup-repair';
import type { GroupChannelMessage } from './components/GroupChannel';

const STORAGE_KEY = 'cococrunch:v1';

export type PersistedRecommendation = {
  name: string;
  saved: boolean;
  added: boolean;
};

export type FlightBookingState = {
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  checkInTime: string;
  provider?: string;
  voucherCode?: string;
  sharedWithGroup: boolean;
  source: 'email-prototype' | 'quote-prototype';
};

export type AccommodationBookingState = {
  propertyName: string;
  checkInTime: string;
  checkOutTime: string;
  notes: string;
  cancellationDeadline: string;
  provider?: string;
  sharedWithGroup: boolean;
  source: 'email-prototype' | 'quote-prototype';
};

export type GroupSplitPlan = {
  memberIds: string[];
  destination: string;
  meetingPoint: string;
  meetingTime: string;
  suggestionSource: 'prototype-midpoint' | 'manual';
};

export type PhotoMemoryArtifact = {
  id: string;
  title: string;
  body: string;
  source: string;
  locationLabel: string;
  audience: 'personal' | 'group';
  isPublic?: boolean;
  capturedAt?: string;
  latitude?: number;
  longitude?: number;
  archiveDay?: number;
  archivePlace?: string;
};

export type EmergencyContact = { id: string; name: string; contact: string; permission: 'location' | 'message' | 'both' };

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

export type ConfirmedLearningRecord = {
  id: string;
  proposalId: string;
  confirmedAt: string;
  sourceTripReview: TripReview;
  changes: LearningProposal['changes'];
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
  learningProposal?: LearningProposal;
  confirmedLearningHistory?: ConfirmedLearningRecord[];
  tingoAnswers?: TingoAnswer[];
  tingoDimensions?: TingoDimensions;
  onboardingComplete?: boolean;
  onboardingName?: string;
  onboardingCountryCode?: string;
  onboardingBirthday?: string;
  basePackingPreferences?: string[];
  tripCreated?: boolean;
  tripList?: Array<{ id: string; name: string; destination: string; mode: 'group' | 'solo'; status: 'planning' | 'ongoing' | 'completed'; createdAt: string }>;
  tripPhase?: 'planning' | 'traveling' | 'completed';
  groupName?: string;
  destinationLockedByLeader?: boolean;
  datesLockedByLeader?: boolean;
  groupMemberBudgets?: Record<string, number>;
  groupMemberVibes?: Record<string, string[]>;
  groupMemberDestinations?: Record<string, string>;
  itineraryOrder?: string[];
  groupChannelMessages?: GroupChannelMessage[];
  groupCourtUnreadCount?: number;
  groupSplitPlan?: GroupSplitPlan;
  photoMemoryArtifacts?: PhotoMemoryArtifact[];
  automaticDeviationPrompted?: boolean;
  completedTodayItemIds?: string[];
  tripEndPromptDismissed?: boolean;
  emergencyContacts?: EmergencyContact[];
  emergencyCheckInFrequency?: number;
  selectedEmergencyContactId?: string;
  flightBooking?: FlightBookingState;
  flightBookingDraft?: string;
  accommodationBooking?: AccommodationBookingState;
  accommodationBookingDraft?: string;
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
  revivedWishIds?: number[];
};

export type PersistedTripState = {
  mode: 'group' | 'solo';
  tripBudget: number;
  profile?: TravelProfile;
  tripIntent: TripIntent;
};

export function resetTripScopedSharing(): Pick<PersistedState, 'privacy' | 'continuousLocation'> {
  return { privacy: 'status', continuousLocation: false };
}

function normalizePersistedState(parsed: Partial<PersistedState>): Partial<PersistedState> {
  const normalizedPrivacy = parsed.privacy === 'exact' ? 'status' : parsed.privacy;
  const normalized = normalizedPrivacy ? { ...parsed, privacy: normalizedPrivacy, continuousLocation: false } : parsed;
  const groupMemberVibes = Object.fromEntries(Object.entries(parsed.groupMemberVibes ?? {}).map(([memberId, vibes]) => [memberId, Array.isArray(vibes) ? vibes : [vibes].filter(Boolean)]));
  const withVibes = { ...normalized, groupMemberVibes };
  if (!Array.isArray(parsed.tingoAnswers)) return withVibes;
  return { ...withVibes, tingoDimensions: scoreTingo(parsed.tingoAnswers) };
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
