import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell, BookOpen, Box, Check, ChevronRight, CircleDollarSign, CloudRain,
  Gavel, Heart, Link2, Map, MapPin, PackageCheck, ReceiptText,
  Send, Sparkles, Users, X
} from 'lucide-react';
import { emitExperience } from './experience';
import { GlobalNav, type GlobalTab } from './components/GlobalNav';
import { TripJourneyStatus } from './components/TripJourneyStatus';
import { JourneyProgress } from './components/JourneyProgress';
import { TripSpatialView } from './components/TripSpatialView';
import { TodayTimeline } from './components/TodayTimeline';
import { TripConditions } from './components/TripConditions';
import { FamilyWindowPanel, LocationPrivacyPanel } from './components/SharingBoundaryPanels';
import { ContextualToolList, type ContextualTool } from './components/ContextualToolList';
import { TripPlanOverview } from './components/TripPlanOverview';
import { TripRetrospective } from './components/TripRetrospective';
import { CompletedLearningGuide, ExplorePlanningGuide, MemoryArchiveGuide, TingoOwnershipGuide } from './components/JourneyPhaseGuide';
import { ExploreScreen } from './components/explore/ExploreScreen';
import { courtTally, type CourtOption, type CourtVote } from './domain/court';
import { attachCourtConcession, withdrawCourtConcession, type CourtConcession } from './domain/concession';
import { gatePlanMutation } from './domain/governance';
import {
  actualBudget, budgetLearning, budgetVariance, defaultGroupActuals, defaultGroupBudget,
  defaultSoloActuals, defaultSoloBudget, plannedBudget, remainingBudget, sanitizeAmount,
  updateBudget, type BudgetActuals, type BudgetCategory, type BudgetPlan,
} from './domain/budget';
import { discoverPlaces, type DiscoveryPlace } from './domain/discovery';
import {
  type TravelProfile, type TripReview,
} from './domain/preferences';
import { buildLearningProposal, confirmLearningProposal, type LearningProposal } from './domain/learning';
import { normalizeBudgetActuals, paceEvidenceSummary, rateDecision, updateBudgetActual } from './domain/retrospective';
import { derivePersistedTripState, loadPersisted, resetTripScopedSharing, savePersisted, type CompletedPaceEvidence, type ConfirmedLearningRecord, type CourtOptionState, type DecisionRecord } from './persistence';
import { RecommendationEvidenceText } from './components/RecommendationEvidenceText';
import { EverydayGachaMachine } from './components/EverydayGachaMachine';
import { LuckyDrawReveal } from './components/LuckyDrawReveal';
import { TripLifecycleTabs, TripWorkspaceContext, TripWorkspaceHeader, type TripPhase } from './components/TripWorkspace';
import {
  deriveTingoBehavior, describeTingo, defaultTingoDimensions, scoreTingo, tingoCompletion,
  tingoGuidance, tingoQuestions, type TingoAnswer, type TingoDimensions,
} from './domain/tingo';
import { tripIntentIsReviewable, type TripIntent } from './domain/trip-intent';
import { checkFeasibility, comparisonOptions, importPhotoMetadata } from './domain/adapters';
import { deriveGroupDNA, scopeGroupDNAForMode, type MemberPreferenceProfile } from './domain/group-dna';
import { candidateFromDiscovery, generateTripPlan } from './domain/itinerary';
import { deriveJourneyState, transitionReadyConfirmation } from './domain/journey-state';
import { calculatePlanHealth } from './domain/plan-health';
import { applyRepairToPlan, buildMinimumLossRepair, promoteCourtLosers, type BackupCandidate, type RepairResult } from './domain/backup-repair';
import { deriveEverydayDrawPool } from './domain/random-pool';
import {
  applyResponsibilitySuggestions, defaultCommitments, defaultMembers, defaultReminders,
  defaultReunion, suggestResponsibilities, type HumanCommitment,
  type ReunionAgreement, type TripConstraint, type TripMember, type TripReminder,
} from './domain/trip';
import { CocoCompanion } from './components/coco/CocoCompanion';
import { cocoAsset } from './components/coco/assets';
import { commitRitualState, loadRitualState, memoryEligible } from './ritualState';
import { MemoryTrunk } from './components/MemoryTrunk';
import { CourtTieRitual } from './components/CourtTieRitual';
import { WeatherGlance } from './components/WeatherGlance';
import { GlobalCocoCompanion } from './components/GlobalCocoCompanion';
import { HomeTripGlance } from './components/HomeTripGlance';
import { CompletedKeepLauncher, type CompletedPanel } from './components/CompletedKeepLauncher';
import { SafetyToolkit } from './components/SafetyToolkit';
import { CocoAssistantPrompt } from './components/CocoAssistantPrompt';
import { CommunityPublishPanel } from './components/CommunityPublishPanel';
import { PhotoJournalCapture } from './components/PhotoJournalCapture';

type Tab = GlobalTab;
type TripMode = 'group' | 'solo';
type Mood = 'great' | 'okay' | 'tired' | null;
type Privacy = 'status' | 'area' | 'exact';
type Drawer = 'group' | 'backup' | 'budget' | 'family' | 'location' | 'community' | 'import' | 'discover' | 'tingo' | 'tripSetup' | 'compare' | 'feasibility' | 'reminders' | 'commitments' | 'safety' | 'assistant' | 'gacha' | 'lucky' | 'memoryCard' | null;
type CommunityTrip = { id: number; title: string; author: string; match: number; saved: boolean };
type PlaceRecommendation = DiscoveryPlace & { id: number; saved: boolean; added: boolean };
type GhostWish = { id: number; name: string; reason: string; status: 'resting' | 'revived' | 'released' };
type GovernedAction = 'assistant-move' | 'split-on' | 'split-off' | null;
type TripScopedInputs = Pick<TripIntent, 'tripVibe' | 'mustGo' | 'dealBreaker' | 'preference' | 'flexible'>;

const defaultProfile: TravelProfile = {
  vibe: 'Relax + Food',
  mustGo: 'Tsukiji food walk',
  veto: 'No raw-food-only dinner',
  preference: 'One scenic café each day',
  flexible: 'Evening activity can move',
};

const defaultCourtOptions: CourtOptionState[] = [
  { id: 'ramen', label: 'Ramen tonight' },
  { id: 'sushi', label: 'Sushi tonight' },
];

const defaultVotes: CourtVote[] = [
  { member: 'Mei', pick: 'ramen' },
  { member: 'JH', pick: 'sushi' },
  { member: 'Zi Shan', pick: 'ramen' },
  { member: 'Alex', pick: 'sushi' },
];

function makeRecommendations(
  destination: string,
  dimensions: TingoDimensions,
  saved: { name: string; saved: boolean; added: boolean }[] = [],
): PlaceRecommendation[] {
  return discoverPlaces(destination, dimensions).map((place, index) => {
    const prior = saved.find(item => item.name === place.name);
    return { ...place, id: index + 1, saved: prior?.saved ?? false, added: prior?.added ?? false };
  });
}

function optionSlug(label: string, index: number): string {
  const slug = label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return slug || `option-${index + 1}`;
}

function parseConflictOptions(conflict: string): CourtOptionState[] | null {
  const parts = conflict.split(/\s+(?:vs\.?|versus|or)\s+|\s*\/\s*/i).map(value => value.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  return parts.map((label, index) => ({ id: optionSlug(label, index), label }));
}

function Coco({ mood = 'idle', tiny = false, context = 'default' }: { mood?: 'idle' | 'happy' | 'panic'; tiny?: boolean; context?: 'default' | 'court' | 'memory' | 'travel' }) {
  return <CocoCompanion context={context === 'default' ? 'home' : context === 'travel' ? 'traveling' : context} pose={mood === 'panic' ? 'expression-worried' : undefined} size={tiny ? 72 : 128}/>;
}

function formatPlanTime(minutes: number): string {
  const hour = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function SectionTitle({ kicker, title, copy }: { kicker: string; title: string; copy?: string }) {
  return <header className="page-title"><span>{kicker}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</header>;
}

function MiniTool({ icon: Icon, label, note, onClick }: { icon: React.ComponentType<{ size?: number }>; label: string; note: string; onClick: () => void }) {
  return <button className="mini-tool" onClick={onClick}><Icon size={18}/><span><b>{label}</b><small>{note}</small></span><ChevronRight size={16}/></button>;
}

export default function AppRescued() {
  const [stored] = useState(() => loadPersisted());
  const [ritualRecords, setRitualRecords] = useState(() => loadRitualState());
  const storedPace = stored.completedPaceEvidence;
  const { mode: storedMode, tripBudget: storedTripBudget, profile: storedProfile, tripIntent: storedTripIntent } = derivePersistedTripState(stored);
  const initialTripIntent = stored.tripIntent
    ? storedTripIntent
    : {
      ...storedTripIntent,
      destination: storedTripIntent.destination || stored.destination || 'Tokyo',
      tripVibe: storedTripIntent.tripVibe || storedProfile?.vibe || defaultProfile.vibe,
      mustGo: storedTripIntent.mustGo || storedProfile?.mustGo || defaultProfile.mustGo,
      dealBreaker: storedTripIntent.dealBreaker || storedProfile?.veto || defaultProfile.veto,
      preference: storedTripIntent.preference || storedProfile?.preference || defaultProfile.preference,
      flexible: storedTripIntent.flexible || storedProfile?.flexible || defaultProfile.flexible,
    };
  const storedTripDates = storedTripIntent.dates ?? null;
  const storedTingoDimensions = stored.tingoDimensions ?? defaultTingoDimensions;
  const [tab, setTab] = useState<Tab>(() => (stored as { tab?: Tab }).tab ?? 'home');
  const [tripWorkspaceOpen, setTripWorkspaceOpen] = useState(false);
  const [tripPhase, setTripPhase] = useState<TripPhase>(stored.tripPhase ?? 'planning');
  const [completedPanel, setCompletedPanel] = useState<CompletedPanel>(null);
  const [readyConfirmed, setReadyConfirmed] = useState(Boolean(stored.readyConfirmed));
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [mode, setMode] = useState<TripMode>(storedMode);
  const [profile, setProfile] = useState<TravelProfile>({
    vibe: storedProfile?.vibe ?? defaultProfile.vibe,
    mustGo: storedProfile?.mustGo ?? defaultProfile.mustGo,
    veto: storedProfile?.veto ?? defaultProfile.veto,
    preference: storedProfile?.preference ?? defaultProfile.preference,
    flexible: storedProfile?.flexible ?? defaultProfile.flexible,
  });
  const [tripInputs, setTripInputs] = useState<TripScopedInputs>({
    tripVibe: initialTripIntent.tripVibe,
    mustGo: initialTripIntent.mustGo,
    dealBreaker: initialTripIntent.dealBreaker,
    preference: initialTripIntent.preference,
    flexible: initialTripIntent.flexible,
  });
  const [plannerTurn, setPlannerTurn] = useState(stored.plannerTurn ?? 'Mei');
  const [courtOpen, setCourtOpen] = useState(false);
  const [courtOptions, setCourtOptions] = useState<CourtOptionState[]>(stored.courtOptions && stored.courtOptions.length >= 2 ? stored.courtOptions : defaultCourtOptions);
  const [draftCourtOption, setDraftCourtOption] = useState('');
  const [courtVotes, setCourtVotes] = useState<CourtVote[]>(stored.courtVotes?.length ? stored.courtVotes : defaultVotes);
  const [gacha, setGacha] = useState<string | null>(null);
  const [courtDrawRevealed, setCourtDrawRevealed] = useState(false);
  const [planWhyItemId, setPlanWhyItemId] = useState<string | null>(null);
  const [courtDecision, setCourtDecision] = useState<string | null>(stored.courtDecision ?? null);
  const [courtConfirmed, setCourtConfirmed] = useState(Boolean(stored.courtConfirmed));
  const [decisionHistory, setDecisionHistory] = useState<DecisionRecord[]>(stored.decisionHistory ?? []);
  const [delay, setDelay] = useState(Boolean(storedPace?.delayed));
  const [replanPreview, setReplanPreview] = useState(false);
  const [emergencyApproved, setEmergencyApproved] = useState(false);
  const [replanApplied, setReplanApplied] = useState(Boolean(stored.appliedRepair));
  const [mood, setMood] = useState<Mood>(storedPace?.mood ?? null);
  const [split, setSplit] = useState(false);
  const [privacy, setPrivacy] = useState<Privacy>(stored.privacy ?? 'status');
  const [continuousLocation, setContinuousLocation] = useState(Boolean(stored.continuousLocation));
  const [reported, setReported] = useState(false);
  const [receiptPrinted, setReceiptPrinted] = useState(false);
  const [worthIt, setWorthIt] = useState<TripReview | null>(stored.worthIt ?? null);
  const [profileLearned, setProfileLearned] = useState(Boolean(stored.profileLearned));
  const [learningProposal, setLearningProposal] = useState<LearningProposal | null>(stored.learningProposal ?? null);
  const [confirmedLearningHistory, setConfirmedLearningHistory] = useState<ConfirmedLearningRecord[]>(stored.confirmedLearningHistory ?? []);
  const [tingoAnswers, setTingoAnswers] = useState<TingoAnswer[]>(stored.tingoAnswers ?? []);
  const [tingoStep, setTingoStep] = useState(0);
  const [basePackingPreferences, setBasePackingPreferences] = useState<string[]>(stored.basePackingPreferences ?? ['comfortable walking shoes', 'portable charger', 'light rain layer']);
  const [tripCreated, setTripCreated] = useState(stored.tripCreated ?? true);
  const [members, setMembers] = useState<TripMember[]>(() => {
    const loadedMembers = stored.members ?? defaultMembers;
    return loadedMembers.map(member => {
      if (member.preferenceProfile) return member;
      const seededProfile = stored.memberPreferenceProfiles?.[member.id] ?? defaultMembers.find(candidate => candidate.id === member.id)?.preferenceProfile;
      return seededProfile ? { ...member, preferenceProfile: seededProfile } : member;
    });
  });
  const [constraints, setConstraints] = useState<TripConstraint[]>(stored.constraints ?? []);
  const [reminders, setReminders] = useState<TripReminder[]>(stored.reminders ?? defaultReminders);
  const [commitments, setCommitments] = useState<HumanCommitment[]>(stored.commitments ?? defaultCommitments);
  const [reunion, setReunion] = useState<ReunionAgreement>(stored.reunion ?? defaultReunion);
  const [assistantPreview, setAssistantPreview] = useState(false);
  const [assistantApplied, setAssistantApplied] = useState(false);
  const [assistantUndone, setAssistantUndone] = useState(false);
  const [floatingStartOverride, setFloatingStartOverride] = useState<number | null>(null);
  const [everydayGacha, setEverydayGacha] = useState<string | null>(null);
  const [tradeAccepted, setTradeAccepted] = useState(false);
  const [tradeSnapshot, setTradeSnapshot] = useState<CourtVote[] | null>(null);
  const [courtConcession, setCourtConcession] = useState<CourtConcession | null>(null);
  const [draftConflict, setDraftConflict] = useState('');
  const [conflictMarked, setConflictMarked] = useState(false);
  const [activeConflict, setActiveConflict] = useState(stored.activeConflict ?? 'Ramen tonight vs Sushi tonight');
  const [pendingGovernedAction, setPendingGovernedAction] = useState<GovernedAction>(null);
  const [luckyDraw, setLuckyDraw] = useState<string | null>(null);
  const [memoryNote, setMemoryNote] = useState(ritualRecords.authoredMemoryNote ?? '');
  const [memorySaveError, setMemorySaveError] = useState(false);
  const [memoryPublic, setMemoryPublic] = useState(Boolean(stored.memoryPublic));
  const [photoImport, setPhotoImport] = useState(false);
  const [arrivalChecked, setArrivalChecked] = useState(Boolean(storedPace?.arrivalChecked));
  const [itemReviews, setItemReviews] = useState<Record<string, 'worth' | 'mixed' | 'skip'>>(stored.itemReviews ?? {});
  const [photoIndexed, setPhotoIndexed] = useState(false);
  const [journalGenerated, setJournalGenerated] = useState(false);
  const [published, setPublished] = useState(Boolean(stored.published));
  const [externalLink, setExternalLink] = useState('https://example.com/tokyo-cafe-list');
  const [linkAnalyzed, setLinkAnalyzed] = useState(false);
  const [destination, setDestination] = useState(initialTripIntent.destination);
  const [exploreDestination, setExploreDestination] = useState(initialTripIntent.destination || 'Tokyo');
  const [destinationSearched, setDestinationSearched] = useState(true);
  const [recommendations, setRecommendations] = useState<PlaceRecommendation[]>(() => makeRecommendations(initialTripIntent.destination, storedTingoDimensions, [...(stored.recommendations ?? []), ...(ritualRecords.savedIdeas ?? []).map(item => ({ name: item.name, saved: true, added: false }))]));
  const [backupCandidates, setBackupCandidates] = useState<BackupCandidate[]>(stored.backupCandidates ?? []);
  const [appliedRepair, setAppliedRepair] = useState<RepairResult | null>(stored.appliedRepair ?? null);
  const [groupBudgetTotal, setGroupBudgetTotal] = useState(storedMode === 'group' ? storedTripBudget : stored.groupBudgetTotal ?? 2400);
  const [soloBudgetTotal, setSoloBudgetTotal] = useState(storedMode === 'solo' ? storedTripBudget : stored.soloBudgetTotal ?? 1200);
  const [groupBudgetPlan, setGroupBudgetPlan] = useState<BudgetPlan>(stored.groupBudgetPlan ?? defaultGroupBudget);
  const [soloBudgetPlan, setSoloBudgetPlan] = useState<BudgetPlan>(stored.soloBudgetPlan ?? defaultSoloBudget);
  const [groupBudgetActuals, setGroupBudgetActuals] = useState<BudgetActuals>(() => normalizeBudgetActuals(stored.groupBudgetActuals, defaultGroupActuals));
  const [soloBudgetActuals, setSoloBudgetActuals] = useState<BudgetActuals>(() => normalizeBudgetActuals(stored.soloBudgetActuals, defaultSoloActuals));
  const [communityTrips, setCommunityTrips] = useState<CommunityTrip[]>([
    { id: 1, title: 'Tokyo: slow food + vintage streets', author: 'Aki', match: 92, saved: false },
    { id: 2, title: 'Rain-proof Tokyo weekend', author: 'Mina', match: 86, saved: false },
  ]);
  const [trunkRequest, setTrunkRequest] = useState(0);
  const [ghostWishes, setGhostWishes] = useState<GhostWish[]>([
    { id: 1, name: 'Riverside night market', reason: 'Rain made the route unreliable.', status: ritualRecords.releasedWishIds?.includes(1) ? 'released' : ritualRecords.revivedWishIds?.includes(1) ? 'revived' : 'resting' },
    { id: 2, name: 'Late-night observation deck', reason: 'Group energy dropped below the planned pace.', status: ritualRecords.releasedWishIds?.includes(2) ? 'released' : ritualRecords.revivedWishIds?.includes(2) ? 'revived' : 'resting' },
  ]);
  const [futurePostcard, setFuturePostcard] = useState('Leave one evening unplanned. You liked the surprise more than the perfect schedule.');
  const [postcardSealed, setPostcardSealed] = useState(false);

  const tally = useMemo(() => courtTally(courtVotes), [courtVotes]);
  const tingoDimensions = useMemo(() => scoreTingo(tingoAnswers), [tingoAnswers]);
  const tingoBehavior = useMemo(() => deriveTingoBehavior(tingoDimensions), [tingoDimensions]);
  const tingoPlanGuidance = useMemo(() => tingoGuidance(tingoDimensions), [tingoDimensions]);
  const responsibilitySuggestions = useMemo(() => suggestResponsibilities(members, tingoBehavior, { mei: tingoBehavior }), [members, tingoBehavior]);
  const memberPreferenceProfiles = useMemo<Record<string, MemberPreferenceProfile>>(() => Object.fromEntries(members.map(member => [member.id, member.preferenceProfile ?? { tingoAssessed: false, preferences: [] }])), [members]);
  const groupMemberInputs = useMemo(() => members.filter(member => member.inviteStatus === 'joined').map(member => ({
    id: member.id,
    name: member.name,
    tingoAssessed: memberPreferenceProfiles[member.id]?.tingoAssessed ?? false,
    preferences: memberPreferenceProfiles[member.id]?.preferences ?? [],
    budget: memberPreferenceProfiles[member.id]?.budget,
  })), [members, memberPreferenceProfiles]);
  const derivedGroupDNA = useMemo(() => deriveGroupDNA(groupMemberInputs), [groupMemberInputs]);
  const groupDNA = useMemo(() => scopeGroupDNAForMode(mode, derivedGroupDNA), [mode, derivedGroupDNA]);
  const budgetPlan = mode === 'group' ? groupBudgetPlan : soloBudgetPlan;
  const budgetActuals = mode === 'group' ? groupBudgetActuals : soloBudgetActuals;
  const budgetTotal = mode === 'group' ? groupBudgetTotal : soloBudgetTotal;
  const tripIntent = useMemo<TripIntent>(() => ({
    destination,
    dates: storedTripDates,
    mode,
    ...tripInputs,
    budget: budgetTotal,
  }), [destination, storedTripDates, mode, tripInputs, budgetTotal]);
  const planned = plannedBudget(budgetPlan);
  const spent = actualBudget(budgetActuals);
  const replanCost = 0;
  const remaining = remainingBudget(budgetTotal, spent, replanCost);
  const categoryVariance = budgetVariance(budgetPlan, budgetActuals);
  const budgetLearningNotes = budgetLearning(budgetActuals, budgetPlan);
  const travellerCount = mode === 'group' ? members.filter(member => member.inviteStatus === 'joined').length : 1;
  const destinationCandidates = useMemo(() => recommendations.map((place, index) => candidateFromDiscovery(place, index)), [recommendations]);
  const resolvedConflictLabels = useMemo(() => courtConfirmed ? [activeConflict] : [], [courtConfirmed, activeConflict]);
  const baseTripPlan = useMemo(() => generateTripPlan({
    destination: tripIntent.destination,
    tingoBehavior,
    tripVibe: tripIntent.tripVibe,
    mustGo: tripIntent.mustGo,
    dealBreaker: tripIntent.dealBreaker,
    preference: tripIntent.preference,
    flexible: tripIntent.flexible,
    budget: tripIntent.budget,
    members,
    groupDNA,
    candidates: destinationCandidates,
    floatingStartMinutes: floatingStartOverride ?? undefined,
    resolvedConflictLabels,
  }), [tripIntent, tingoBehavior, members, groupDNA, destinationCandidates, floatingStartOverride, resolvedConflictLabels]);
  const suggestedFloatingStart = (baseTripPlan.items.find(item => item.kind === 'floating')?.startMinutes ?? 15 * 60) + 30;
  const suggestedFloatingLabel = formatPlanTime(suggestedFloatingStart);
  const failedPlanItem = baseTripPlan.items.find(item => item.kind === 'floating');
  const backupPool = backupCandidates;
  const repairSourcePlan = useMemo(() => delay && !replanApplied && failedPlanItem
    ? { ...baseTripPlan, unresolvedRisks: [...baseTripPlan.unresolvedRisks, `${failedPlanItem.name} failed due to weather.`] }
    : baseTripPlan, [baseTripPlan, delay, failedPlanItem, replanApplied]);
  const repairPreview = useMemo(() => failedPlanItem ? buildMinimumLossRepair({ plan: repairSourcePlan, failedItemId: failedPlanItem.id, backups: backupPool, budgetRemaining: remaining, mode }) : null, [backupPool, failedPlanItem, mode, remaining, repairSourcePlan]);
  const visibleTripPlan = useMemo(() => appliedRepair ? applyRepairToPlan(repairSourcePlan, appliedRepair, true).plan : repairSourcePlan, [appliedRepair, repairSourcePlan]);
  const everydayCandidates = useMemo(() => deriveEverydayDrawPool([
    ...visibleTripPlan.items.filter(item => item.kind === 'floating').map(item => ({ name: item.name, source: 'floating-itinerary' as const })),
    ...recommendations.filter(place => place.saved).map(place => ({ name: place.name, source: 'saved-idea' as const })),
    ...backupPool.map(item => ({ name: item.name, source: 'backup' as const, viable: item.viable, dealBreakerSafe: item.dealBreakerSafe })),
  ]), [backupPool, recommendations, visibleTripPlan.items]);
  const planHealth = calculatePlanHealth({ plan: visibleTripPlan, budget: budgetTotal, groupDNA, tingoBehavior, dealBreaker: tripInputs.dealBreaker, resolvedConflictLabels });
  const optionLabel = (id: string | null) => courtOptions.find(option => option.id === id)?.label ?? id ?? '';
  const majorityDecision = tally.majority ? optionLabel(tally.majority) : null;
  const proposedDecision = gacha ?? majorityDecision;
  const completedPaceEvidence: CompletedPaceEvidence = { delayed: delay, mood, arrivalChecked };
  const actualPaceCopy = paceEvidenceSummary(completedPaceEvidence);
  const tingoComplete = tingoCompletion(tingoAnswers) === 100;
  const outcomeReviewed = actualPaceCopy !== 'No completed pace signal yet' || Object.keys(itemReviews).length > 0;
  const expressiveAvailable = memoryEligible(outcomeReviewed, worthIt, profileLearned, learningProposal?.status);
  const journeyState = useMemo(() => deriveJourneyState({
    phase: tripPhase,
    tripCreated,
    tingoComplete,
    mode,
    unresolvedConflictCount: planHealth.metrics.unresolvedConflicts,
    planHealth: planHealth.overall,
    planHealthBlockers: planHealth.deductions
      .filter(deduction => deduction.component !== 'conflicts' && deduction.points >= 10)
      .map(deduction => deduction.reason),
    hasPlan: tripIntentIsReviewable(tripIntent) && visibleTripPlan.items.length > 0,
    readyConfirmed,
    disruption: delay && !replanApplied ? 'failed-floating-item' : null,
    repairAvailable: Boolean(repairPreview?.applicable),
    repairRequiresGroupConfirmation: Boolean(repairPreview?.requiresGroupConfirmation),
    currentStopNeedsCheckIn: tripPhase === 'traveling' && !arrivalChecked,
    outcomeReviewed,
    worthItRecorded: Boolean(worthIt),
    learningProposalPending: Boolean(worthIt && !profileLearned && learningProposal?.status !== 'dismissed'),
    learningConfirmed: profileLearned,
  }), [
    arrivalChecked,
    delay,
    itemReviews,
    journalGenerated,
    mode,
    photoImport,
    planHealth.deductions,
    planHealth.metrics.unresolvedConflicts,
    planHealth.overall,
    profileLearned,
    learningProposal,
    outcomeReviewed,
    readyConfirmed,
    replanApplied,
    repairPreview?.applicable,
    repairPreview?.requiresGroupConfirmation,
    tripCreated,
    tripIntent,
    tripPhase,
    tingoComplete,
    visibleTripPlan.items.length,
    worthIt,
  ]);

  useEffect(() => {
    savePersisted({
      version: 1, mode, destination, readyConfirmed, profile, plannerTurn, courtVotes, courtConfirmed, courtDecision,
      courtOptions, activeConflict, decisionHistory,
      groupBudgetTotal, soloBudgetTotal, groupBudgetPlan, soloBudgetPlan, groupBudgetActuals, soloBudgetActuals,
      completedPaceEvidence,
      privacy, continuousLocation,
      recommendations: recommendations.map(({ name, saved, added }) => ({ name, saved, added })),
      tripIntent,
      worthIt, profileLearned, learningProposal: learningProposal?.status === 'confirmed' ? undefined : learningProposal ?? undefined, confirmedLearningHistory, tingoAnswers, tingoDimensions, basePackingPreferences, tripCreated, tripPhase,
      members, memberPreferenceProfiles, backupCandidates, appliedRepair: appliedRepair ?? undefined, constraints, reminders, commitments, reunion, published, memoryPublic, itemReviews, revivedWishIds: ghostWishes.filter(wish => wish.status === 'revived').map(wish => wish.id),
    });
  }, [mode, destination, readyConfirmed, profile, plannerTurn, courtVotes, courtConfirmed, courtDecision, courtOptions, activeConflict, decisionHistory, groupBudgetTotal, soloBudgetTotal, groupBudgetPlan, soloBudgetPlan, groupBudgetActuals, soloBudgetActuals, delay, mood, arrivalChecked, privacy, continuousLocation, recommendations, tripIntent, worthIt, profileLearned, learningProposal, confirmedLearningHistory, tingoAnswers, tingoDimensions, basePackingPreferences, tripCreated, tripPhase, members, memberPreferenceProfiles, backupCandidates, appliedRepair, constraints, reminders, commitments, reunion, published, memoryPublic, itemReviews, ghostWishes]);

  function setProfileField(field: keyof TravelProfile, value: string) {
    setProfile(current => ({ ...current, [field]: value }));
    setProfileLearned(false);
  }

  function setTripInputField(field: keyof TripScopedInputs, value: string) {
    setTripInputs(current => ({ ...current, [field]: value }));
  }

  function searchDestination() {
    setRecommendations(makeRecommendations(exploreDestination, tingoDimensions, recommendations));
    setDestinationSearched(true);
  }

  function toggleRecommendation(id: number, action: 'save' | 'add') {
    const place = recommendations.find(item => item.id === id);
    if (!place) return;
    if (action === 'save') {
      emitExperience({ type: 'capture-place', place: place.name, save: () => {
        const current = loadRitualState();
        const savedIdeas = [...(current.savedIdeas ?? []).filter(item => item.name !== place.name), { name: place.name, source: place.source }];
        if (!commitRitualState({ savedIdeas })) return false;
        setRitualRecords(loadRitualState());
        setRecommendations(items => items.map(item => item.name === place.name ? { ...item, saved: true } : item));
        return true;
      } });
      return;
    }
    if (action === 'add') {
      const gate = gatePlanMutation(mode, mode === 'group' ? 'idea-save' : 'personal-draft');
      if (!gate.allowed) return;
    }
    setRecommendations(items => items.map(item => item.id === id ? { ...item, added: !item.added } : item));
  }

  function castVote(member: string, pick: CourtOption) {
    setCourtVotes(votes => votes.map(vote => vote.member === member ? { ...vote, pick } : vote));
    if (tradeAccepted) {
      setTradeAccepted(false);
      setTradeSnapshot(null);
      setCourtConcession(null);
    }
    setGacha(null);
    setCourtConfirmed(false);
    setCourtDecision(null);
  }

  function attachConcession() {
    if (!tradeAccepted) {
      const linkedOptionId = courtOptions[1]?.id ?? courtOptions[0]?.id ?? 'option';
      const concession = attachCourtConcession(courtVotes, {
        id: `concession-${Date.now()}`,
        offeredBy: plannerTurn,
        description: `Protect a linked concession for ${optionLabel(linkedOptionId)} later`,
        linkedOptionId,
      });
      setCourtConcession(concession);
      setTradeSnapshot(concession.voteSnapshot);
      setTradeAccepted(true);
      return;
    }
    if (courtConcession) {
      const withdrawn = withdrawCourtConcession(courtConcession);
      setCourtVotes(withdrawn.restoredVotes);
      setCourtConcession(withdrawn.concession);
    } else if (tradeSnapshot) {
      setCourtVotes(tradeSnapshot);
    }
    setTradeSnapshot(null);
    setTradeAccepted(false);
    setGacha(null);
    setCourtConfirmed(false);
    setCourtDecision(null);
  }

  function applyPendingGovernedDecision(decision: string) {
    if (pendingGovernedAction === 'assistant-move' && decision === `Move floating block to ${suggestedFloatingLabel}`) {
      setFloatingStartOverride(suggestedFloatingStart);
      setAssistantApplied(true);
      setAssistantPreview(false);
      setAssistantUndone(false);
    }
    if (pendingGovernedAction === 'split-on' && decision === 'Create Smart Split') setSplit(true);
    if (pendingGovernedAction === 'split-off' && decision === 'Reunite group') setSplit(false);
    setPendingGovernedAction(null);
  }

  function confirmCourt() {
    if (!proposedDecision) return;
    const decision = proposedDecision;
    const winnerId = courtOptions.find(option => option.label === decision)?.id ?? tally.majority ?? '';
    const losingBackups = promoteCourtLosers(courtOptions.map(option => ({ ...option, support: tally.counts[option.id] ?? 0 })), winnerId, tripInputs.dealBreaker);
    if (losingBackups.length) {
      setBackupCandidates(current => [...losingBackups.filter(candidate => !current.some(existing => existing.id === candidate.id)), ...current]);
    }
    setCourtDecision(decision);
    setCourtConfirmed(true);
    applyPendingGovernedDecision(decision);
    setDecisionHistory(history => {
      if (history[0]?.kind === 'court' && history[0].topic === activeConflict && history[0].decision === decision) return history;
      const voteSummary = courtOptions.map(option => `${option.label}: ${tally.counts[option.id] ?? 0}`).join(' · ');
      return [{ id: `court-${Date.now()}`, kind: 'court', topic: activeConflict, decision, voteSummary, usedGacha: Boolean(gacha), createdAt: new Date().toISOString() }, ...history];
    });
  }

  function applyRepair() {
    if (!repairPreview?.applicable) return;
    const applied = applyRepairToPlan(repairSourcePlan, repairPreview, mode === 'solo' || emergencyApproved);
    if (!applied.applied) return;
    if (!replanApplied) {
      if (mode === 'group') setGroupBudgetActuals(actuals => updateBudgetActual(actuals, 'activities', actuals.activities + repairPreview.impact.costDelta));
      else setSoloBudgetActuals(actuals => updateBudgetActual(actuals, 'activities', actuals.activities + repairPreview.impact.costDelta));
    }
    setAppliedRepair(repairPreview);
    setReplanApplied(true);
    setDecisionHistory(history => history.some(record => record.kind === 'emergency' && record.topic === 'Weather disruption') ? history : [{ id: `emergency-${Date.now()}`, kind: 'emergency', topic: 'Weather disruption', decision: repairPreview.preview.join(' · '), voteSummary: mode === 'group' ? 'Emergency Court approved' : 'Solo confirmation', usedGacha: false, createdAt: new Date().toISOString() }, ...history]);
  }

  function undoRepair() {
    if (replanApplied && appliedRepair) {
      if (mode === 'group') setGroupBudgetActuals(actuals => updateBudgetActual(actuals, 'activities', actuals.activities - appliedRepair.impact.costDelta));
      else setSoloBudgetActuals(actuals => updateBudgetActual(actuals, 'activities', actuals.activities - appliedRepair.impact.costDelta));
    }
    setAppliedRepair(null);
    setReplanApplied(false);
    setReplanPreview(false);
    setEmergencyApproved(false);
  }

  function printReceipt() {
    setReceiptPrinted(true);
    emitExperience({ type: 'print-receipt', total: spent, participants: mode === 'group' ? members.filter(member => member.inviteStatus === 'joined').map(member => member.name) : ['Mei'] });
  }

  function sendFamilyReassurance() {
    setReported(true);
    emitExperience({ type: 'send-family-reassurance', destination, privacy, delayed: delay });
  }

  function buildCurrentLearningProposal(review: TripReview) {
    const proposal = buildLearningProposal({ answers: tingoAnswers, tripReview: review, itemReviews, actualPace: actualPaceCopy });
    setLearningProposal(proposal);
  }

  function recordWorthIt(value: TripReview) {
    if (!outcomeReviewed) return;
    setWorthIt(value);
    setProfileLearned(false);
    buildCurrentLearningProposal(value);
  }

  function dismissLearning() {
    if (!learningProposal) return;
    setLearningProposal({ ...learningProposal, status: 'dismissed' });
    setProfileLearned(false);
  }

  function confirmLearning() {
    if (!learningProposal || learningProposal.status !== 'proposed') return;
    const nextAnswers = confirmLearningProposal(tingoAnswers, learningProposal);
    const record: ConfirmedLearningRecord = {
      id: `confirmed-${learningProposal.id}`,
      proposalId: learningProposal.id,
      confirmedAt: new Date().toISOString(),
      sourceTripReview: learningProposal.source.tripReview,
      changes: learningProposal.changes,
    };
    setTingoAnswers(nextAnswers);
    setConfirmedLearningHistory(history => [record, ...history.filter(item => item.proposalId !== record.proposalId)]);
    setLearningProposal({ ...learningProposal, status: 'confirmed' });
    setProfileLearned(true);
  }

  function changeBudgetCategory(category: BudgetCategory, value: number) {
    if (mode === 'group') setGroupBudgetPlan(plan => updateBudget(plan, category, value));
    else setSoloBudgetPlan(plan => updateBudget(plan, category, value));
  }

  function changeBudgetActual(category: BudgetCategory, value: number) {
    if (mode === 'group') setGroupBudgetActuals(actuals => updateBudgetActual(actuals, category, value));
    else setSoloBudgetActuals(actuals => updateBudgetActual(actuals, category, value));
  }

  function rateDecisionRecord(recordId: string, satisfaction: NonNullable<DecisionRecord['satisfaction']>) {
    setDecisionHistory(history => rateDecision(history, recordId, satisfaction));
  }

  function openPacking() {
    setDrawer(null);
    const weatherItems = delay ? ['compact umbrella', 'quick-dry layer'] : ['light rain layer'];
    const destinationItems = /tokyo|kyoto|osaka/i.test(destination) ? ['transit card'] : [];
    const fiveDayItems = ['5-day clothing set', 'laundry pouch'];
    const generated = Array.from(new Set([...basePackingPreferences, 'passport', 'portable water bottle', ...fiveDayItems, ...destinationItems, ...weatherItems]));
    emitExperience({ type: 'open-packing', items: generated });
  }

  function openTrip(phase: TripPhase = 'planning') {
    setTripPhase(phase);
    setTripWorkspaceOpen(true);
    setTab('trips');
  }

  function openTripsIndex() {
    setTripWorkspaceOpen(false);
    setTab('trips');
  }

  function handleJourneyAction(target: NonNullable<typeof journeyState.nextAction>['target']) {
    const actionId = journeyState.nextAction?.id;

    if (actionId === 'setup-trip' || actionId === 'review-intent') {
      openTrip('planning');
      setDrawer('tripSetup');
      return;
    }

    if (actionId === 'open-court') {
      openTrip('planning');
      setDrawer(null);
      setCourtOpen(true);
      return;
    }

    if (actionId === 'review-health' || actionId === 'confirm-ready') {
      openTrip('planning');
      setDrawer('feasibility');
      return;
    }

    if (actionId === 'preview-repair' || actionId === 'approve-repair') {
      openTrip('traveling');
      setDrawer(null);
      setReplanPreview(Boolean(repairPreview?.applicable));
      return;
    }

    if (actionId === 'check-in' || actionId === 'continue-traveling') {
      openTrip('traveling');
      setDrawer(null);
      return;
    }

    if (actionId === 'review-outcome' || actionId === 'open-memories' || actionId === 'review-learning') {
      openTrip('completed');
      setDrawer(null);
      return;
    }

    if (actionId === 'complete-tingo') {
      setTripWorkspaceOpen(false);
      setTab('me');
      setDrawer('tingo');
      return;
    }

    if (actionId === 'continue-planning') {
      openTrip('planning');
      setDrawer(null);
      return;
    }

    setDrawer(null);
    if (target === 'trip') openTrip(tripPhase);
    else {
      setTripWorkspaceOpen(false);
      setTab(target);
    }
  }

  function answerTingo(optionId: string) {
    const question = tingoQuestions[tingoStep];
    setTingoAnswers(current => {
      return [...current.filter(answer => answer.questionId !== question.id), { questionId: question.id, optionId }];
    });
    if (tingoStep < tingoQuestions.length - 1) setTingoStep(step => step + 1);
  }

  function finishTingo() {
    const dimensions = scoreTingo(tingoAnswers);
    setRecommendations(current => makeRecommendations(destination, dimensions, current));
  }

  function retakeTingo() {
    setTingoAnswers([]);
    setTingoStep(0);
    setDrawer('tingo');
  }

  function updateConstraint(type: TripConstraint['type'], value: string) {
    if (!value.trim()) return;
    setConstraints(current => [...current.filter(item => item.type !== type), { id: `${type}-${Date.now()}`, type, value: value.trim(), source: 'member' }]);
  }

  function inviteMember() {
    setMembers(current => current.some(member => member.id === 'alex' && member.inviteStatus === 'pending') ? current.map(member => member.id === 'alex' ? { ...member, inviteStatus: 'joined' } : member) : [...current, { id: `guest-${current.length}`, name: 'Guest', role: 'New traveller', inviteStatus: 'pending', pace: 'steady' }]);
  }

  function runLuckyDraw() {
    const results = ['A tiny detour is waiting.', 'Choose the blue door today.', 'Leave one hour unplanned.'];
    setLuckyDraw(results[Math.floor(Math.random() * results.length)]);
  }

  function runEverydayGacha() {
    if (everydayCandidates.length === 0) { setEverydayGacha(null); return; }
    setEverydayGacha(everydayCandidates[Math.floor(Math.random() * everydayCandidates.length)]);
  }

  function openGovernedAction(action: Exclude<GovernedAction, null>) {
    const gate = gatePlanMutation(mode, 'official-itinerary');
    if (gate.allowed) {
      if (action === 'assistant-move') {
        setFloatingStartOverride(15 * 60);
        setAssistantApplied(true);
        setAssistantPreview(false);
        setAssistantUndone(false);
      } else if (action === 'split-on') setSplit(true);
      else setSplit(false);
      return;
    }
    const proposal = action === 'assistant-move'
      ? { topic: 'Coco timing suggestion', options: [{ id: 'keep-cafe', label: `Keep floating block at ${baseTripPlan.items.find(item => item.kind === 'floating')?.timeLabel ?? 'current time'}` }, { id: 'move-cafe', label: `Move floating block to ${suggestedFloatingLabel}` }] }
      : action === 'split-on'
        ? { topic: 'Smart Split', options: [{ id: 'stay-together', label: 'Stay together' }, { id: 'create-split', label: 'Create Smart Split' }] }
        : { topic: 'Smart Split reunion', options: [{ id: 'keep-split', label: 'Keep Smart Split' }, { id: 'reunite', label: 'Reunite group' }] };
    setPendingGovernedAction(action);
    setActiveConflict(proposal.topic);
    setCourtOptions(proposal.options);
    const joined = members.filter(member => member.inviteStatus === 'joined');
    setCourtVotes(joined.map((member, index) => ({ member: member.name, pick: proposal.options[index % 2].id })));
    setCourtConfirmed(false);
    setCourtDecision(null);
    setGacha(null);
    setTradeAccepted(false);
    setTradeSnapshot(null);
    setCourtConcession(null);
    setDrawer(null);
    setCourtOpen(true);
  }

  function markConflict() {
    const conflict = draftConflict.trim();
    if (!conflict) return;
    const parsedOptions = parseConflictOptions(conflict);
    setActiveConflict(conflict);
    setConflictMarked(true);
    setCourtConfirmed(false);
    setCourtDecision(null);
    setPendingGovernedAction(null);
    setGacha(null);
    setTradeAccepted(false);
    setTradeSnapshot(null);
    setCourtConcession(null);
    if (parsedOptions) {
      setCourtOptions(parsedOptions);
      setCourtVotes(members.filter(member => member.inviteStatus === 'joined').map((member, index) => ({ member: member.name, pick: parsedOptions[index % parsedOptions.length].id })));
    }
    setDraftConflict('');
    setDrawer(null);
    setCourtOpen(true);
  }

  function renderHome() {
    const groupStatus = mode === 'group'
      ? planHealth.metrics.unresolvedConflicts > 0
        ? `${planHealth.metrics.unresolvedConflicts} conflict${planHealth.metrics.unresolvedConflicts === 1 ? '' : 's'} to resolve`
        : `${travellerCount} travellers aligned`
      : 'Solo trip';

    return <div className="home-orientation">
      <SectionTitle kicker="HOME · ACTIVE TRIP" title={`${destination} stays in view.`} copy="Follow the next meaningful action first, then inspect the rest of the trip as needed."/>
      <HomeTripGlance destination={destination} dates={tripIntent.dates} phase={tripPhase}/>
      <TripJourneyStatus state={journeyState} destination={destination} onAction={handleJourneyAction} />
      <JourneyProgress destination={destination} currentPhase={tripPhase} nextActionLabel={journeyState.nextAction?.label} />
      <section className="status-strip status-strip--home"><div><span>Current Phase</span><b>{tripPhase === 'planning' ? 'Planning' : tripPhase === 'traveling' ? 'Traveling' : 'Completed'}</b></div><div><span>Plan Health</span><b>{planHealth.overall}/100</b></div><div><span>Budget Remaining</span><b>RM {remaining}</b></div><div><span>Group Status</span><b>{groupStatus}</b></div></section>
    </div>;
  }

  function startNewTrip() {
    const sharing = resetTripScopedSharing();
    setReadyConfirmed(current => transitionReadyConfirmation(current, 'start-new-trip'));
    setTripCreated(false);
    setTripPhase('planning');
    setDelay(false);
    setReplanPreview(false);
    setEmergencyApproved(false);
    setReplanApplied(false);
    setAppliedRepair(null);
    setMood(null);
    setArrivalChecked(false);
    setSplit(false);
    setBackupCandidates([]);
    setCourtOptions(defaultCourtOptions);
    setCourtVotes(defaultVotes);
    setCourtConfirmed(false);
    setCourtDecision(null);
    setCourtConcession(null);
    setTradeAccepted(false);
    setTradeSnapshot(null);
    setGacha(null);
    setActiveConflict('Ramen tonight vs Sushi tonight');
    setConflictMarked(false);
    setPrivacy(sharing.privacy);
    setContinuousLocation(sharing.continuousLocation);
    setReported(false);
    setPhotoImport(false);
    setPhotoIndexed(false);
    setJournalGenerated(false);
    setDrawer('tripSetup');
  }

  function renderTrips() {
    return <>
      <SectionTitle kicker="TRIPS · YOUR NOTEBOOK" title="Keep the trip in view." copy="Planning, traveling, and remembering all belong to the same journey."/>
      <button className="new-trip-link" onClick={startNewTrip}>+ Start a new trip</button>
      <section className="trip-card active-trip paper-sheet"><div className="trip-card-art"><span>COCOCRUNCH</span><b>{destination}</b><small>12–21 Oct 2026 · {travellerCount} travellers</small><i>✦</i></div><div className="trip-card-body"><div className="trip-card-heading"><div><span>IN MOTION</span><h3>{destination} · slow food + small discoveries</h3></div><b>{planHealth.overall}</b></div><div className="trip-phase-preview"><span className={tripPhase === 'planning' ? 'active' : ''}>Planning</span><span className={tripPhase === 'traveling' ? 'active' : ''}>Traveling</span><span className={tripPhase === 'completed' ? 'active' : ''}>Completed</span></div><p>Today: {tripInputs.mustGo} · one open pocket</p><button className="primary" onClick={() => openTrip(tripPhase)}>Continue trip <ChevronRight size={16}/></button></div></section>
      <section className="trip-list"><div className="section-rule"><span>OTHER TRIPS</span><button onClick={() => setTab('explore')}>Find inspiration <ChevronRight size={14}/></button></div><article className="trip-list-row"><div className="trip-thumb sea-thumb"/><div><b>Jeju · salt air and citrus</b><small>Completed · 5 days · shared privately</small></div><button onClick={() => openTrip('completed')} aria-label="Open Jeju trip"><ChevronRight size={17}/></button></article><article className="trip-list-row"><div className="trip-thumb blue-thumb"/><div><b>Kyoto · temple mornings</b><small>Draft · solo · 3 anchor ideas</small></div><button onClick={() => openTrip('planning')} aria-label="Open Kyoto trip"><ChevronRight size={17}/></button></article></section>
      <section className="trip-footer-note"><Coco tiny mood="happy" context="travel"/><div><b>Every trip gets a little wiser.</b><small>Reviews and category-level actual spend feed back into your private Tingo Card.</small></div></section>
    </>;
  }

  function renderExplore() {
    return <ExploreScreen
      activeTripDestination={destination}
      mode={mode}
      tingoBehavior={tingoBehavior}
      tingoDimensions={tingoDimensions}
      placeRecommendations={recommendations}
      onSavePlace={(id) => toggleRecommendation(id, 'save')}
      onAddPlace={(id) => toggleRecommendation(id, 'add')}
      communityTrips={communityTrips}
      onToggleSaveCommunityTrip={(id) => setCommunityTrips(items => items.map(item => item.id === id ? { ...item, saved: !item.saved } : item))}
      savedIdeas={ritualRecords.savedIdeas}
      onOpenTripPlanning={() => openTrip('planning')}
      onSearchPlaces={(dest) => {
        setExploreDestination(dest);
        setRecommendations(makeRecommendations(dest, tingoDimensions, recommendations));
        setDestinationSearched(true);
      }}
    />;
  }

  function renderGlobalMemories() {
    return <div className="memories-screen">
      <SectionTitle kicker="MEMORIES · YOUR ARCHIVE" title="The trips that stayed with you." copy="Private by default. Start with the review, then keep the decisions, detours, and tiny wins close."/>
      <MemoryArchiveGuide onOpenTrip={() => openTrip('completed')}/>
      <section className="memory-archive-feature paper-sheet"><div className="archive-photo"><span>OCT 2026</span><b>{destination}</b></div><div><span>LAST TRIP · {worthIt ? (worthIt === 'yes' ? 'Worth it' : worthIt === 'mixed' ? 'Mixed' : 'Not really') : 'Not reviewed'}</span><h3>{outcomeReviewed ? 'Your recorded outcome is ready to revisit.' : 'The retrospective starts with what actually happened.'}</h3><p>{photoImport ? `${importPhotoMetadata().imported} local metadata entries` : 'No photo metadata recorded'} · {decisionHistory.length} decisions · RM {spent} actual</p><button className="primary" onClick={() => openTrip('completed')}>Open Memory Trunk <ChevronRight size={16}/></button></div></section>
      <div className="explore-section-heading"><span>KEEPSAKE SHELF</span><span className="quiet-note">Only you can see these</span></div><section className="keepsake-grid"><article><span>PHOTO MAP</span><b>{photoImport ? `${importPhotoMetadata().grouped} areas` : 'Not indexed'}</b><small>{photoImport ? 'Local metadata only' : 'Available after explicit review'}</small></article><article><span>FUTURE POSTCARD</span><b>{postcardSealed ? '1 sealed' : 'Not sealed'}</b><small>{postcardSealed ? 'Waiting for your next trip' : 'Write after the review loop'}</small></article><article><span>GHOST WISHES</span><b>{ghostWishes.length} remembered</b><small>Some plans can come back</small></article></section>
      <section className="community-entry"><div><span>COMMUNITY</span><b>{published ? 'Published with consent' : 'Private by default'}</b><small>Nothing becomes public without an explicit action.</small></div><button onClick={() => setDrawer('community')}>Manage</button></section>
    </div>;
  }

  function renderTripWorkspace() {
    return <>
      <TripWorkspaceHeader destination={destination} mode={mode} travellerCount={travellerCount} planHealth={planHealth.overall} onBack={openTripsIndex} />
      <TripLifecycleTabs phase={tripPhase} onChange={setTripPhase} />
      <TripWorkspaceContext phase={tripPhase} onExit={openTripsIndex} />
      <TripJourneyStatus state={journeyState} destination={destination} onAction={handleJourneyAction} />
      <JourneyProgress destination={destination} currentPhase={tripPhase} nextActionLabel={journeyState.nextAction?.label} />
      {tripPhase === 'planning' ? renderPlan() : tripPhase === 'traveling' ? renderDuring() : renderMemories()}
    </>;
  }

  function renderPlan() {
    const first = courtOptions[0];
    const second = courtOptions[1];
    const firstCount = first ? tally.counts[first.id] ?? 0 : 0;
    const secondCount = second ? tally.counts[second.id] ?? 0 : 0;
    const selectedWhyItem = visibleTripPlan.items.find(item => item.id === planWhyItemId);
    const planTools: ContextualTool[] = [
      { id: 'tingo', label: 'Tingo Card', note: `${tingoCompletion(tingoAnswers)}% complete · long-term profile`, visible: true, onOpen: () => setDrawer('tingo') },
      { id: 'group', label: 'People & Group DNA', note: `${members.filter(member => member.inviteStatus === 'joined').length}/${members.length} joined · explicit signals`, visible: mode === 'group', onOpen: () => setDrawer('group') },
      { id: 'trip-inputs', label: 'Trip Intent', note: `${constraints.length || 4} constraints · ${destination}`, visible: true, onOpen: () => setDrawer('tripSetup') },
      { id: 'budget', label: 'Budget planner', note: `RM ${planned} planned of RM ${budgetTotal}`, visible: true, onOpen: () => setDrawer('budget') },
      { id: 'discover', label: 'Find places', note: `Tingo-ranked · ${tingoBehavior.recommendationBias} bias`, visible: true, onOpen: () => setDrawer('discover') },
      { id: 'compare', label: 'Compare options', note: 'Deterministic price + deal adapter', visible: true, onOpen: () => setDrawer('compare') },
      { id: 'backup', label: 'Backup Plan pool', note: `${backupPool.filter(item => item.viable && item.dealBreakerSafe).length} viable candidates`, visible: backupPool.length > 0, onOpen: () => setDrawer('backup') },
    ];
    return <div className="planning-screen">
      <SectionTitle kicker="PLAN · TRAVEL NOTEBOOK" title="Build a plan that can bend." copy="Keep the important things firm. Let the rest breathe."/>
      <WeatherGlance destination={destination} compact/>
      {!tripCreated && <section className="setup-banner"><div><span>NEW TRIP</span><b>Give this journey a home before Coco plans it.</b><small>Destination, people, vibe, constraints, then a reviewable plan.</small></div><button className="primary" onClick={() => setDrawer('tripSetup')}>Set up trip <ChevronRight size={15}/></button></section>}
      <section className="planning-brief">
      <section className="trip-intent-summary paper-sheet"><div><span>TRIP INTENT · THIS JOURNEY ONLY</span><h3>{tripInputs.tripVibe || 'A shape is still forming.'}</h3><p>Must-Go: {tripInputs.mustGo || 'not set'} · Deal breaker: {tripInputs.dealBreaker || 'not set'}</p><small>Preference: {tripInputs.preference || 'optional'} · Flexible: {tripInputs.flexible || 'not set'} · Budget: RM {budgetTotal}</small></div><button className="secondary" onClick={() => setDrawer('tripSetup')}>Review inputs <ChevronRight size={14}/></button></section>
      {mode === 'group' && <section className="group-signal-summary paper-sheet"><div><span>PEOPLE · GROUP DNA</span><h3>{groupDNA.conflicts.length ? `${groupDNA.conflicts.length} decision${groupDNA.conflicts.length === 1 ? '' : 's'} remain visible.` : 'Shared signals are explicit, not averaged.'}</h3><p>{groupDNA.sharedPriorities[0]?.label ?? 'No shared priority yet'} · {groupDNA.budgetSensitivity} budget sensitivity</p></div><button className="secondary" onClick={() => setDrawer('group')}>Open people <ChevronRight size={14}/></button></section>}
      </section>
      {mode === 'group' && <section className="conflict-ticket"><span>{courtConfirmed ? 'COURT DECISION RECORDED' : 'UNRESOLVED CONFLICT'}</span><b>{activeConflict}</b><small>{first?.label ?? 'Option A'} {firstCount} · {second?.label ?? 'Option B'} {secondCount} · {tally.tied ? 'tie · Gacha is eligible' : `${optionLabel(tally.majority)} has majority`}</small><button className="ritual-trigger" onClick={() => setCourtOpen(true)}>{courtConfirmed ? 'Review Group Court' : 'Open Group Court'} <Gavel size={18}/></button></section>}
      <div className="planning-plan">
      <div className="planning-itinerary-primary">
        <TripPlanOverview plan={visibleTripPlan} planHealth={planHealth} tripIntent={tripIntent} onOpenWhy={setPlanWhyItemId} onOpenHealth={() => setDrawer('feasibility')} />
        {selectedWhyItem && <section className="why-note"><Sparkles size={19}/><div><b>Why this? · {selectedWhyItem.name}</b><p><RecommendationEvidenceText evidence={selectedWhyItem.evidence}/></p></div><button className="secondary" onClick={() => setPlanWhyItemId(null)}>Close</button></section>}
      </div>
      <div className="spatial-secondary-panel">
        <TripSpatialView mode="planning" destination={destination} source={recommendations.some(place => place.source === 'prototype-catalog') ? 'prototype-catalog' : 'unavailable'} plan={visibleTripPlan} candidates={recommendations.slice(0, 4).map(place => ({ id: `recommendation-${place.id}`, name: place.name, source: place.source }))} />
      </div>
      <section className="plan-health"><div className="section-rule"><span>PLAN HEALTH · EXPLAINED</span><button onClick={() => setDrawer('feasibility')}>Run checks <ChevronRight size={14}/></button></div><div className="health-score"><b>{planHealth.overall}</b><span><strong>{planHealth.overall >= 80 ? 'Healthy with watch items shown' : planHealth.overall >= 60 ? 'Usable with meaningful watch items' : 'Needs a planning decision'}</strong><small>{planHealth.reasons[0] ?? 'No current risk deductions; inputs fit the generated structure.'}</small></span></div><div className="health-metrics"><span>Walk <b>{planHealth.metrics.walkingKm.toFixed(1)} km</b></span><span>Pressure <b>{planHealth.metrics.timePressureMinutes} min</b></span><span>Budget <b>{planHealth.metrics.budgetOverrun ? `RM ${planHealth.metrics.budgetOverrun} over` : 'Within cap'}</b></span><span>Transfer <b>{planHealth.metrics.transferMinutes} min</b></span><span>Anchors <b>{planHealth.metrics.protectedAnchors} protected</b></span><span>Risks <b>{planHealth.metrics.unresolvedRisks}</b></span></div></section>
      </div>
      <details className="secondary-launcher"><summary>Plan details & tools</summary><ContextualToolList tools={planTools} /></details>
      <section className="ready-to-go-card paper-sheet"><div><span>READY TO GO</span><h3>{readyConfirmed ? 'This plan is ready to continue.' : 'Review the joins before you go.'}</h3><p>{readyConfirmed ? 'You can still inspect the workspace and change course when reality changes.' : 'Coco will show the current risks; confirmation stays yours.'}</p></div><button className="primary" onClick={() => setDrawer('feasibility')}>{readyConfirmed ? 'Review readiness' : 'Confirm Ready to Go'} <ChevronRight size={15}/></button></section>
    </div>;
  }

  function renderDuring() {
      const anchorItem = visibleTripPlan.items.find(item => item.kind === 'anchor');
      const floatingItem = visibleTripPlan.items.find(item => item.kind === 'floating');
      return <>
        <SectionTitle kicker="DURING · LIVE TRIP" title={delay ? 'Reality changed.' : 'The trip is moving.'} copy="Coco watches the plan, not your every step."/>
        <WeatherGlance destination={destination} compact/>
        <TodayTimeline items={visibleTripPlan.items} delay={delay} arrivalChecked={arrivalChecked} appliedRepair={replanApplied} />
        <TripConditions delay={delay} failedItemName={failedPlanItem?.name} repairAvailable={Boolean(repairPreview?.applicable)} repairStrategy={repairPreview?.strategy} onSimulateDisruption={() => { setDelay(true); setReplanPreview(false); setAppliedRepair(null); setReplanApplied(false); setEmergencyApproved(false); }}/>
      {delay && !replanApplied && <section className="disruption-stage"><div className="disruption-head"><CloudRain size={26}/><div><span>TRIP CHANGE</span><b>{failedPlanItem?.timeLabel ?? 'Current'} {failedPlanItem?.name ?? 'item'} no longer fits today.</b><small>Demo condition · not a live weather alert.</small></div></div>{!replanPreview ? <><div className="ghost-suggestion"><span>SAFEST ADJUSTMENT</span><b>{repairPreview?.replacement?.name ?? (repairPreview?.strategy === 'open-recovery' ? 'Leave this time open for recovery' : 'No safe repair available')}</b><small>{repairPreview?.replacement ? `${repairPreview.replacement.support} supporters · ${repairPreview.impact.costDelta >= 0 ? '+' : ''}RM${repairPreview.impact.costDelta} · ${repairPreview.impact.timeDeltaMinutes >= 0 ? '+' : ''}${repairPreview.impact.timeDeltaMinutes} min` : repairPreview?.strategy === 'open-recovery' ? 'No direct Backup candidate; recovery time can protect the anchor.' : repairPreview?.reasons[repairPreview.reasons.length - 1] ?? 'No repair result available.'}</small></div><button className="primary" disabled={!repairPreview?.applicable} onClick={() => setReplanPreview(true)}>See the safest adjustment</button></> : <><div className="repair-impact-head"><span>REVIEW BEFORE APPLY</span><b>Protect what matters, soften the rest.</b></div><div className="repair-diff"><div><span>WHAT STAYS</span><b>{tripInputs.mustGo || anchorItem?.name || 'Must-Go anchor'}</b><small>Protected before flexible blocks move.</small></div><div><span>WHAT CHANGES</span><b>{repairPreview?.replacement?.name ?? (repairPreview?.strategy === 'open-recovery' ? 'Recovery time' : 'No replacement')}</b><small>{repairPreview?.replacement ? `${repairPreview.replacement.support} supporters` : 'No direct Backup candidate is required for recovery time.'}</small></div><div><span>IMPACT</span><b>{repairPreview ? `${repairPreview.impact.costDelta >= 0 ? '+' : ''}RM${repairPreview.impact.costDelta} · ${repairPreview.impact.timeDeltaMinutes >= 0 ? '+' : ''}${repairPreview.impact.timeDeltaMinutes} min` : 'No computed impact'}</b><small>Calculated from the repair result.</small></div></div><div className="change-ticket">{repairPreview?.preview.map(line => <div key={line}><span>PLAN CHANGE</span><b>{line}</b></div>)}</div>{repairPreview?.reasons.map(reason => <small className="adapter-note" key={reason}>{reason}</small>)}{mode === 'group' && repairPreview?.requiresGroupConfirmation && <div className="emergency-court"><span>EMERGENCY COURT · 90 SEC</span><b>{emergencyApproved ? 'Approved for this repair' : 'Group approval required'}</b><button onClick={() => setEmergencyApproved(true)}>{emergencyApproved ? '✓ Approved' : 'Simulate group approval'}</button></div>}<div className="action-row"><button className="secondary" onClick={() => setReplanPreview(false)}>Not now</button><button className="primary" disabled={!repairPreview?.applicable || (repairPreview.requiresGroupConfirmation && !emergencyApproved)} onClick={applyRepair}>Apply repair</button></div></>}</section>}
      {replanApplied && <section className="success-note"><Check size={21}/><div><b>Plan repaired.</b><small>{appliedRepair?.preview.join(' · ')} · undo available</small></div><button onClick={undoRepair}>Undo</button></section>}
      <section className="arrival-check"><div><span>PROGRESS CHECK</span><b>{arrivalChecked ? `Arrived at ${anchorItem?.name ?? 'the anchor'}.` : `Has the group reached ${anchorItem?.name ?? 'the morning anchor'}?`}</b><small>Manual check-in is always available; location permission is not required.</small></div><button onClick={() => setArrivalChecked(!arrivalChecked)}>{arrivalChecked ? 'Undo check-in' : 'Mark arrived'}</button></section>
      <section className="energy-check"><span>HOW’S THE GROUP?</span><div>{(['great','okay','tired'] as const).map(value => <button key={value} className={mood === value ? 'active' : ''} onClick={() => setMood(value)}>{value === 'great' ? '⚡ Great' : value === 'okay' ? '🙂 Okay' : '🥱 Tired'}</button>)}</div>{mood === 'tired' && <small>Coco suggests dropping one floating item and adding 45 min rest. Anchors stay untouched.</small>}</section>
      {mode === 'group' && <section className="heartbeat"><span>GROUP HEARTBEAT</span><b>{delay ? 'Needs a decision' : split ? 'Can reunite on time' : arrivalChecked ? 'Together at the anchor' : 'Status check pending'}</b><small>Only shared status is shown. Exact group coordinates stay hidden by default.</small></section>}
      {mode === 'group' && <section className="split-note"><div><span>SMART SPLIT</span><b>{split ? '2 café · 2 shopping' : 'Different energy levels?'}</b><small>{split ? 'Reunion · 19:30 · ±15 min · official shared state' : 'Preview is harmless; creating the official split requires Group Court.'}</small>{split && <div className="split-timelines"><span>Mei + Zi Shan · café · {floatingItem?.timeLabel ?? 'time pending'}</span><span>JH + Alex · shopping · {floatingItem?.timeLabel ?? 'time pending'}</span></div>}</div><button onClick={() => openGovernedAction(split ? 'split-off' : 'split-on')}>{split ? 'Request reunion' : 'Propose split'}</button></section>}
      <details className="during-tools secondary-launcher"><summary>More tools · sharing, reunion, safety & play</summary><div className="contextual-section-heading"><span>WHEN YOU NEED A HAND</span><small>These tools stay secondary to Today, conditions, and repair.</small></div><div className="during-tool-group"><span className="tool-group-label">SHARE & SAFETY</span><MiniTool icon={Send} label="Family Window" note={reported ? 'Latest reassurance sent' : 'Reassurance, not surveillance'} onClick={() => setDrawer('family')}/><MiniTool icon={MapPin} label="Location privacy" note="Permission and provider boundary" onClick={() => setDrawer('location')}/><MiniTool icon={Users} label="Reunion agreement" note={`${reunion.place} · ${reunion.time} · ±${reunion.tolerance} min`} onClick={() => setDrawer('commitments')}/><MiniTool icon={Heart} label="Safety + local help" note="Prototype contact and nearby useful info" onClick={() => setDrawer('safety')}/></div><div className="during-tool-group"><span className="tool-group-label">EXPLAIN & PLAY</span><MiniTool icon={Sparkles} label="Ask Coco" note={assistantApplied ? 'Suggestion applied · undo available' : 'Read-only until you confirm'} onClick={() => setDrawer('assistant')}/><MiniTool icon={Sparkles} label="Everyday Gacha" note="Real choice · never governance" onClick={() => setDrawer('gacha')}/><MiniTool icon={Sparkles} label="Lucky Draw" note="Entertainment only · isolated from decisions" onClick={() => setDrawer('lucky')}/></div></details>
      <TripSpatialView
        mode="traveling"
        destination={destination}
        source="local-schematic"
        plan={visibleTripPlan}
        currentItem={anchorItem ? { name: anchorItem.name, timeLabel: anchorItem.timeLabel } : undefined}
        nextItem={!delay && floatingItem ? { name: floatingItem.name, timeLabel: floatingItem.timeLabel } : undefined}
        reunionLabel={mode === 'group' ? `${reunion.place} · ${reunion.time} · ±${reunion.tolerance} min` : undefined}
        privacy={privacy}
        disruptionLabel={delay ? 'Floating block needs repair review.' : undefined}
        overlay={<Coco tiny mood={delay ? 'panic' : 'happy'} context="travel"/>}
      />
    </>;
  }

  function renderMemories() {
    const keepsakes = [
      ...decisionHistory.map(record => ({ id: record.id, title: record.topic, body: record.decision, source: `Recorded ${record.kind} decision · ${record.createdAt}` })),
      ...(ritualRecords.authoredMemoryNote ? [{ id: 'authored-note', title: 'My memory note', body: ritualRecords.authoredMemoryNote, source: 'Explicitly saved personal note' }] : []),
    ];
    const photoMetadata = photoImport ? importPhotoMetadata() : null;
    return <div className="completed-screen">
      <SectionTitle kicker="COMPLETED" title={`${destination}, kept close.`} copy={tripIntent.dates ? `${tripIntent.dates.start}–${tripIntent.dates.end}` : 'Trip dates were not recorded.'}/>
      <section className="completed-nutshell paper-sheet"><span>TRIP IN A NUTSHELL</span><h3>{outcomeReviewed ? actualPaceCopy : 'No actual outcome has been recorded yet.'}</h3><div><small>{spent > 0 ? `RM ${spent} recorded spend` : 'No spend recorded'}</small><small>{decisionHistory.length ? `${decisionHistory.length} recorded decision${decisionHistory.length === 1 ? '' : 's'}` : 'No recorded decisions'}</small><small>{keepsakes.length ? `${keepsakes.length} kept memor${keepsakes.length === 1 ? 'y' : 'ies'}` : 'No memories kept yet'}</small></div></section>
      <section className="completed-learning-loop">
        <TripRetrospective actualSummary={{ pace: actualPaceCopy, spent, decisions: decisionHistory.length, outcomeRecorded: outcomeReviewed }} worthIt={worthIt} proposal={learningProposal} learningConfirmed={profileLearned} showMemoryAction={false} onRecordReflection={recordWorthIt} onBuildProposal={() => { if (worthIt) buildCurrentLearningProposal(worthIt); }} onConfirmLearning={confirmLearning} onDismissLearning={dismissLearning} onOpenMemory={() => { if (expressiveAvailable) setTrunkRequest(value => value + 1); }} />
      </section>
      <CompletedKeepLauncher active={completedPanel} onOpen={panel => setCompletedPanel(current => current === panel ? null : panel)}/>
      {completedPanel && <section className="completed-progressive" aria-label={`${completedPanel} details`}>
        <button className="completed-progressive-close" onClick={() => setCompletedPanel(null)}>Close details</button>
        {completedPanel === 'trunk' && <><MemoryTrunk artifacts={keepsakes} available={expressiveAvailable} openRequested={trunkRequest}/>{expressiveAvailable && <><section className="memory-note-card"><div><span>MEMORY NOTE</span><b>Keep your own words.</b></div><textarea value={memoryNote} onChange={e => setMemoryNote(e.target.value)} aria-label="Memory note"/><button onClick={() => { const ok = commitRitualState({ authoredMemoryNote: memoryNote }); setMemorySaveError(!ok); if (ok) setRitualRecords(loadRitualState()); }}>Save note to trunk</button>{memorySaveError && <p role="alert">Could not save this note. Please retry.</p>}<small>Private, explicitly authored memory. No generated travel story.</small></section><button className="memory-card-trigger" onClick={() => setDrawer('memoryCard')}><span>MEMORY STICKER CARD</span><b>Make one moment collectible <ChevronRight size={15}/></b></button></>}</>}
        {completedPanel === 'photo' && <><PhotoJournalCapture destination={destination} onIndex={() => { setPhotoIndexed(true); setPhotoImport(true); }}/><section className="memory-actions"><button onClick={() => { setPhotoIndexed(true); setPhotoImport(true); }}><Map size={20}/><span><b>Photo Map</b><small>{photoIndexed ? `${importPhotoMetadata().imported} photos indexed · ${importPhotoMetadata().grouped} areas` : 'Index local photo metadata'}</small></span></button></section>{photoImport && <section className="adapter-note"><b>Metadata adapter complete.</b><small>{photoMetadata?.note}</small></section>}<TripSpatialView mode="completed" destination={destination} source={photoMetadata ? 'photo-metadata' : 'local-schematic'} plan={visibleTripPlan} photoSummary={photoMetadata ? { imported: photoMetadata.imported, grouped: photoMetadata.grouped, note: photoMetadata.note } : undefined}/></>}
        {completedPanel === 'ghost' && expressiveAvailable && <section className="ghost-wish"><span>GHOST WISH CEMETERY</span><h3>Retained prototype Ghost Wishes.</h3>{ghostWishes.map(wish => <div className={`ghost-wish-row ${wish.status}`} key={wish.id}><div><b>{wish.name}</b><small>{wish.reason}</small><em>{wish.status === 'resting' ? 'Still remembered' : wish.status === 'revived' ? 'Revived for review · viability not assessed' : 'Released, history kept'}</em></div>{wish.status !== 'released' && <div>{wish.status === 'resting' && <button onClick={() => { const next = ghostWishes.filter(item => item.status === 'revived').map(item => item.id); if (commitRitualState({ revivedWishIds: [...new Set([...next, wish.id])] })) { setRitualRecords(loadRitualState()); setGhostWishes(items => items.map(item => item.id === wish.id ? { ...item, status: 'revived' } : item)); } }}>Revive</button>}<button onClick={() => emitExperience({ type: 'release-wish', name: wish.name, reason: wish.reason, commit: () => { const current = loadRitualState(); if (!commitRitualState({ releasedWishIds: [...new Set([...(current.releasedWishIds ?? []), wish.id])], revivedWishIds: (current.revivedWishIds ?? []).filter(id => id !== wish.id) })) return false; setRitualRecords(loadRitualState()); setGhostWishes(items => items.map(item => item.id === wish.id ? { ...item, status: 'released' } : item)); return true; } })}>超度行程</button></div>}</div>)}</section>}
        {completedPanel === 'ghost' && !expressiveAvailable && <p>Complete the reflection and learning handoff before opening Ghost Wishes.</p>}
        {completedPanel === 'postcard' && expressiveAvailable && <section className="future-postcard"><span>FUTURE POSTCARD</span><h3>To your next-trip self.</h3>{postcardSealed ? <div className="sealed-postcard"><b>✉ Sealed for the next trip</b><button onClick={() => setPostcardSealed(false)}>Reopen</button></div> : <><textarea value={futurePostcard} onChange={e => setFuturePostcard(e.target.value)}/><button className="primary" onClick={() => setPostcardSealed(true)}>Seal postcard</button></>}</section>}
        {completedPanel === 'postcard' && !expressiveAvailable && <p>Complete the reflection and learning handoff before opening the Future Postcard.</p>}
        {completedPanel === 'recap' && <><CompletedLearningGuide/><section className="review-items"><div className="section-rule"><span>HOW EACH STOP FELT</span><span className="quiet-note">Feeds future recommendations</span></div>{[['anchor', tripInputs.mustGo], ['cafe', 'Scenic café block']].map(([id, label]) => <div className="review-item" key={id}><div><b>{label}</b><small>Recorded stop review</small></div><div className="rating-row">{(['worth','mixed','skip'] as const).map(value => <button key={value} className={itemReviews[id] === value ? 'active' : ''} onClick={() => setItemReviews(current => ({ ...current, [id]: value }))}>{value === 'worth' ? 'Worth it' : value === 'mixed' ? 'Mixed' : 'Skip next time'}</button>)}</div></div>)}</section><section className="review-ledger paper-sheet"><div><span>Budget vs actual</span><b>RM {spent} spent</b><small>RM {remaining} remaining</small></div><div><span>Decisions</span><b>{decisionHistory.length} recorded</b><small>{decisionHistory[0] ? `${decisionHistory[0].topic} · ${decisionHistory[0].decision}` : 'No Court history yet'}</small></div></section>{decisionHistory.length > 0 && <section className="review-items"><div className="section-rule"><span>DECISION HISTORY · SATISFACTION</span></div>{decisionHistory.map(record => <div className="review-item" key={record.id}><div><b>{record.topic}</b><small>{record.decision}</small></div><div className="rating-row">{(['worth','mixed','skip'] as const).map(value => <button key={value} className={record.satisfaction === value ? 'active' : ''} onClick={() => rateDecisionRecord(record.id, value)}>{value}</button>)}</div></div>)}</section>}<section className="compare-ledger"><span>CATEGORY BUDGET · PLANNED VS ACTUAL</span>{categoryVariance.map(item => <div key={item.category}><b>{item.category}</b><i className={item.status === 'over' ? 'actual' : ''}/><small>RM {item.planned} planned · RM {item.actual} actual · {item.status}</small></div>)}{budgetLearningNotes.length > 0 && <p>{budgetLearningNotes.join(' ')}</p>}</section><section className="compare-ledger"><span>PACE · PLANNED VS ACTUAL</span><div><b>Planned</b><i/><small>{tingoBehavior.itineraryDensity} · {tingoBehavior.dailyStops} stops/day · {tingoBehavior.bufferMinutes} min buffers</small></div><div><b>Actual</b><i className="actual"/><small>{actualPaceCopy}</small></div></section><section className="community-entry"><div><span>COMMUNITY</span><b>{published ? 'Published with consent' : 'Private by default'}</b><small>Nothing becomes public without an explicit action.</small></div><button onClick={() => setDrawer('community')}>Open</button></section><button className="secondary" onClick={() => setJournalGenerated(true)}><BookOpen size={18}/>{journalGenerated ? 'Regenerate travel journal draft' : 'Generate travel journal draft'}</button>{journalGenerated && <section className="postcard-note"><span>{destination.toUpperCase()}</span><p>Draft from recorded timeline and trip data. Edit before saving.</p><small>Prototype draft · not an inferred factual travel story</small></section>}</>}
      </section>}
    </div>;
  }

  function renderMe() {
    return <div className="me-screen">
      <SectionTitle kicker="ME · COCO PROFILE" title="How do you actually like to travel?" copy="Private preferences first. Group DNA comes after. Trip Vibe and constraints stay with each trip."/>
      <TingoOwnershipGuide/>
      <section className="profile-hero paper-sheet"><Coco mood="happy" context="travel"/><div><span>MEI · LONG-TERM TINGO IDENTITY</span><h3>{tingoCompletion(tingoAnswers) === 100 ? describeTingo(tingoDimensions).slice(0, 2).join(' · ') : 'Your travel rhythm is still forming.'}</h3><p>{tingoBehavior.recommendationBias}-leaning · {tingoBehavior.budgetMode} · {tingoBehavior.changeStyle}</p></div></section>
      <section className="tingo-summary paper-sheet"><div><span>TINGO CARD</span><h3>{tingoCompletion(tingoAnswers) === 100 ? 'A profile Coco can explain.' : 'Let Coco learn your travel rhythm.'}</h3><p>{describeTingo(tingoDimensions).join(' · ')}</p></div><button className="primary" onClick={() => setDrawer('tingo')}>{tingoCompletion(tingoAnswers) === 100 ? 'Review or retake Card' : 'Take assessment'} <ChevronRight size={15}/></button></section>
      {learningProposal?.status === 'proposed' && <section className="learning-handoff paper-sheet"><div><span>TRIP LEARNING · REVIEW BEFORE APPLY</span><h3>{destination} has a proposal for your long-term Tingo.</h3><p>These changes came from this trip’s actual outcome and will not apply until you confirm them.</p>{learningProposal.changes.map(change => <small key={change.questionId}>{change.questionId}: {change.beforeOptionId ?? 'none'} → {change.afterOptionId} · {change.reason}</small>)}</div><div className="learning-handoff-actions"><button className="secondary" onClick={() => openTrip('completed')}>Review in Completed</button><button className="primary" onClick={confirmLearning}>Confirm this learning</button><button className="secondary" onClick={dismissLearning}>Dismiss</button></div></section>}
      {confirmedLearningHistory.length > 0 && <section className="learning-history paper-sheet"><span>CONFIRMED TINGO LEARNING</span><h3>What you chose to carry forward</h3>{confirmedLearningHistory.slice(0, 3).map(record => <div key={record.id}><b>{record.sourceTripReview === 'yes' ? 'Worth it' : record.sourceTripReview === 'mixed' ? 'Mixed' : 'Not really'} · {new Date(record.confirmedAt).toLocaleDateString()}</b>{record.changes.map(change => <small key={change.questionId}>{change.questionId}: {change.beforeOptionId ?? 'none'} → {change.afterOptionId}</small>)}</div>)}</section>}
      <section className="trip-owned-note paper-sheet"><span>TRIP-OWNED INTENT</span><b>Vibe, Must-Go, Deal Breaker, Preference, and Flexible belong to the active trip.</b><small>Open Trips to review this journey’s choices without changing your long-term Tingo Card.</small><button className="secondary" onClick={() => openTrip('planning')}>Open active trip <ChevronRight size={14}/></button></section>
      <section className="base-packing"><div><span>BASE PACKING HABITS</span><b>Inherited by every new checklist</b></div><div className="packing-preferences">{basePackingPreferences.map(item => <button key={item} onClick={() => setBasePackingPreferences(current => current.filter(value => value !== item))}>{item} ×</button>)}<button className="add-preference" onClick={() => setBasePackingPreferences(current => current.includes('medication pouch') ? current : [...current, 'medication pouch'])}>+ medication pouch</button></div></section>
      <section className="me-tools"><MiniTool icon={PackageCheck} label="Packing ownership" note="Shared items have one clear owner" onClick={openPacking}/><MiniTool icon={Heart} label="Profile history" note={profileLearned ? 'Confirmed learning is saved' : 'No new learning confirmed'} onClick={() => setDrawer('tingo')}/></section>
    </div>;
  }

  function renderDrawer() {
    if (!drawer) return null;
    return <div className="overlay" onMouseDown={() => setDrawer(null)}><section className="drawer" onMouseDown={e => e.stopPropagation()}><button className="close" aria-label="Close drawer" onClick={() => setDrawer(null)}><X size={20}/></button>
      {drawer === 'discover' && <><span className="drawer-kicker">DISCOVER · COCO PICKS</span><h3>Where are we going?</h3><p className="drawer-copy">Search Tokyo, Kyoto or Osaka for destination-aware prototype data. Unknown destinations are explicitly marked as fallback examples. Ranking uses your current Tingo dimensions.</p><div className="discover-search"><input className="big-input" value={exploreDestination} onChange={e => { setExploreDestination(e.target.value); setDestinationSearched(false); }} placeholder="Tokyo, Kyoto, Osaka…"/><button className="primary" onClick={searchDestination}>Search</button></div>{destinationSearched && <div className="discover-results"><span className="drawer-kicker">FOR YOUR {exploreDestination.toUpperCase()} TRIP · {tingoBehavior.recommendationBias.toUpperCase()} BIAS</span>{recommendations.map(place => <article className="community-row discover-row" key={place.id}><div><b>{place.name}</b><small>{place.match}% Tingo-adjusted match · {place.type}</small><small>{place.cost} · {place.duration}</small><small><strong>Why Coco picked this:</strong> {place.why}</small><small>{place.source === 'prototype-catalog' ? 'Local prototype catalog' : 'Fallback example · not live destination data'}</small><div className="inline-actions"><button onClick={() => toggleRecommendation(place.id, 'save')}>{place.saved ? '✓ Saved' : 'Save idea'}</button><button onClick={() => toggleRecommendation(place.id, 'add')}>{mode === 'group' ? (place.added ? '✓ Suggested to group' : 'Suggest to group') : (place.added ? '✓ In plan' : 'Add to plan')}</button></div>{mode === 'group' && <small>Suggestion only · the official Group itinerary changes only after group confirmation.</small>}</div></article>)}</div>}</>}
      {drawer === 'tingo' && <><span className="drawer-kicker">TINGO CARD · {tingoCompletion(tingoAnswers)}% COMPLETE</span><h3>Tell Coco what a good trip feels like.</h3><p className="drawer-copy">Six small choices become a persistent, explainable profile — not a personality label.</p>{tingoCompletion(tingoAnswers) < 100 ? <><div className="assessment-progress"><i style={{ width: `${tingoCompletion(tingoAnswers)}%` }}/></div><div className="assessment-question"><span>QUESTION {tingoStep + 1} / {tingoQuestions.length}</span><b>{tingoQuestions[tingoStep].prompt}</b></div><div className="assessment-options">{tingoQuestions[tingoStep].options.map(option => <button key={option.id} className={tingoAnswers.some(answer => answer.questionId === tingoQuestions[tingoStep].id && answer.optionId === option.id) ? 'active' : ''} onClick={() => answerTingo(option.id)}><b>{option.label}</b><small>{option.hint}</small></button>)}</div></> : <><div className="tingo-result"><span>YOUR TRAVEL DNA</span><b>{describeTingo(tingoDimensions).join(' · ')}</b><small>{tingoPlanGuidance.itineraryGuidance} {tingoPlanGuidance.accommodationGuidance}</small></div><button className="primary" onClick={finishTingo}>Refresh profile + recommendations</button><button className="secondary" onClick={retakeTingo}>Retake Tingo Card</button></>}</>}
      {drawer === 'tripSetup' && <><span className="drawer-kicker">NEW TRIP · BEFORE</span><h3>Give this journey a shape.</h3><label className="setup-field"><span>Destination</span><input className="big-input" value={destination} onChange={e => { setDestination(e.target.value); setDestinationSearched(false); }}/></label><div className="mode-toggle"><button className={mode === 'group' ? 'active' : ''} onClick={() => setMode('group')}>Group</button><button className={mode === 'solo' ? 'active' : ''} onClick={() => setMode('solo')}>Solo</button></div><div className="setup-fields"><label><span>Trip vibe / goal</span><input value={tripInputs.tripVibe} onChange={e => setTripInputField('tripVibe', e.target.value)}/></label><label><span>Must-Go anchor</span><input value={tripInputs.mustGo} onChange={e => setTripInputField('mustGo', e.target.value)}/></label><label><span>Deal breaker</span><input value={tripInputs.dealBreaker} onChange={e => setTripInputField('dealBreaker', e.target.value)}/></label><label><span>Preference</span><input value={tripInputs.preference} onChange={e => setTripInputField('preference', e.target.value)}/></label><label><span>Flexible</span><input value={tripInputs.flexible} onChange={e => setTripInputField('flexible', e.target.value)}/></label></div><div className="constraint-row"><button onClick={() => updateConstraint('must-go', tripInputs.mustGo)}>Save Must-Go</button><button onClick={() => updateConstraint('deal-breaker', tripInputs.dealBreaker)}>Save Deal Breaker</button><button onClick={() => updateConstraint('preference', tripInputs.preference)}>Save Preference</button><button onClick={() => updateConstraint('flexible', tripInputs.flexible)}>Save Flexible</button></div><div className="adapter-note"><b>Coco plan adapter</b><small>{tingoPlanGuidance.itineraryGuidance} {tingoPlanGuidance.budgetGuidance} Weather is provider-backed when available; map, traffic, and pricing remain local/prototype boundaries.</small></div><button className="primary" onClick={() => { setReadyConfirmed(current => transitionReadyConfirmation(current, 'confirm-trip-setup')); setTripCreated(true); setDrawer(null); openTrip('planning'); }}>Confirm inputs & open plan <ChevronRight size={15}/></button></>}
      {drawer === 'group' && <><span className="drawer-kicker">GROUP DNA</span><h3>{groupDNA.conflicts.length ? `${groupDNA.conflicts.length} conflict${groupDNA.conflicts.length === 1 ? '' : 's'} stay visible until the group decides.` : 'Shared signals are explicit, not averaged from Mei.'}</h3><div className="dna-grid"><div><span>Trip Vibe</span><b>{tripInputs.tripVibe}</b></div><div><span>Shared priority</span><b>{groupDNA.sharedPriorities[0]?.label ?? 'None yet'}</b></div><div><span>Budget range</span><b>{groupDNA.budgetRange.max ? `RM${groupDNA.budgetRange.min}–${groupDNA.budgetRange.max}` : 'No ranges yet'}</b></div><div><span>Budget sensitivity</span><b>{groupDNA.budgetSensitivity}</b></div></div><div className="member-list">{members.map(member => <div key={member.id}><div><b>{member.name}</b><small>{member.inviteStatus === 'pending' ? 'Invite pending' : member.role} · {member.pace} pace · {memberPreferenceProfiles[member.id]?.tingoAssessed ? 'Tingo assessed' : 'Tingo not assessed'}</small></div><button onClick={() => setMembers(current => current.map(item => item.id === member.id ? { ...item, role: item.role === 'Trip lead' ? 'Food scout' : item.role === 'Food scout' ? 'Memory keeper' : 'Trip lead' } : item))}>Rotate role</button></div>)}</div><div className="adapter-note"><b>Coco responsibility preview</b>{responsibilitySuggestions.map(item => <small key={item.memberId}><strong>{item.source === 'member-tingo' ? 'Tingo-assessed' : 'Fallback'} · </strong>{item.memberName}: {item.suggestedRole} — {item.reason}</small>)}<button className="secondary" onClick={() => setMembers(current => applyResponsibilitySuggestions(current, responsibilitySuggestions))}>Confirm & apply suggested roles</button></div><button className="secondary" onClick={inviteMember}>+ Invite a traveller</button><div className="conflict-mini"><span>GROUP DNA SIGNALS</span>{groupDNA.conflicts.length ? groupDNA.conflicts.map(conflict => <div key={`${conflict.kind}-${conflict.label}`}><b>{conflict.label}</b><small>{conflict.reason}</small></div>) : <b>No strong conflict detected from explicit member inputs.</b>}<small>{groupDNA.evidence.join(' ')}</small><small>{tingoPlanGuidance.courtGuidance} AI can explain options, but cannot silently choose for the group.</small></div><label className="setup-field"><span>Mark another uncertainty</span><input className="big-input" value={draftConflict} onChange={e => setDraftConflict(e.target.value)} placeholder="e.g. Shinjuku hotel vs Asakusa hotel"/></label><button className="secondary" onClick={markConflict}>{conflictMarked ? 'Send another conflict to Court' : 'Mark conflict & open Court'}</button><div className="planner-turn"><span>Editing turn</span><b>{plannerTurn}</b><button onClick={() => setPlannerTurn(plannerTurn === 'Mei' ? 'JH' : plannerTurn === 'JH' ? 'Zi Shan' : plannerTurn === 'Zi Shan' ? 'Alex' : 'Mei')}>Pass turn</button></div><button className="secondary" onClick={() => setDrawer('reminders')}>Reminders & human commitments</button></>}
      {drawer === 'backup' && <><span className="drawer-kicker">BACKUP PLAN POOL</span><h3>Only viable, Deal-Breaker-safe alternatives are repair candidates.</h3>{backupPool.map(item => <div className={`backup-row ${item.viable && item.dealBreakerSafe ? '' : 'off'}`} key={item.id}><b>{item.name}</b><small>{item.support} supporters · {item.costDelta >= 0 ? '+' : ''}RM{item.costDelta} · {item.timeDeltaMinutes >= 0 ? '+' : ''}{item.timeDeltaMinutes} min · {item.viable && item.dealBreakerSafe ? 'viable' : 'blocked'}</small><small>{item.source} · {item.lossReason}</small></div>)}{backupPool.length === 0 && <div className="adapter-note">No Backup candidate has been retained yet. A confirmed Court loser appears here only when it is viable and Deal-Breaker-safe.</div>}{ghostWishes.filter(wish => wish.status === 'revived').map(wish => <div className="backup-row" key={`ghost-${wish.id}`}><b>👻 {wish.name}</b><small>Revived from Ghost Wish · preserved with original reason</small></div>)}</>}
      {drawer === 'budget' && <><span className="drawer-kicker">TRIP BUDGET</span><h3>Editable plan and actual category spend.</h3><label className="budget-total-input"><span>{mode === 'group' ? 'Group' : 'Solo'} total</span><input type="number" min="0" value={budgetTotal} onChange={e => mode === 'group' ? setGroupBudgetTotal(sanitizeAmount(Number(e.target.value))) : setSoloBudgetTotal(sanitizeAmount(Number(e.target.value)))}/></label><div className="budget-big"><b>RM {remaining}</b><span>remaining after RM {spent} actual spend</span></div><div className="surprise-budget"><span>SPONTANEITY RESERVE</span><b>RM {mode === 'group' ? 120 : 60}</b><small>Held outside the base plan for a real little surprise.</small></div><div className="budget-lines">{(['stay','food','transport','activities'] as BudgetCategory[]).map(category => <label key={category}><span>{category === 'transport' ? 'Transit' : category[0].toUpperCase() + category.slice(1)}</span><input type="number" min="0" value={budgetPlan[category]} onChange={e => changeBudgetCategory(category, Number(e.target.value))}/><small>Planned</small><input type="number" min="0" aria-label={`${category} actual spend`} value={budgetActuals[category]} onChange={e => changeBudgetActual(category, Number(e.target.value))}/><small>Actual · persisted for this prototype trip</small></label>)}</div><div className={`budget-balance ${planned > budgetTotal ? 'over' : ''}`}><span>Planned</span><b>RM {planned} / RM {budgetTotal}</b><small>{planned > budgetTotal ? `Over plan by RM ${planned - budgetTotal}` : `RM ${budgetTotal - planned} unallocated buffer`}</small></div><button className="receipt-button" onClick={printReceipt}><ReceiptText size={18}/>{receiptPrinted ? 'Print receipt again' : 'Print split-bill receipt'}</button></>}
      {drawer === 'compare' && <><span className="drawer-kicker">COMPARE · HONEST PROTOTYPE</span><h3>Shortlist the option that fits the trip, not just the price.</h3><p className="drawer-copy">These are deterministic demo prices. No live supplier, inventory, or external checkout is connected.</p>{comparisonOptions.map(option => <article className="compare-option" key={option.id}><div><span>{option.category.toUpperCase()} · {option.fit}% fit</span><b>{option.label}</b><small>{option.why}</small></div><strong>RM {option.price}<em>{option.deal}</em></strong><small className={option.price <= remaining ? 'within-budget' : 'over-budget'}>{option.price <= remaining ? 'Within current remaining budget' : 'Over current remaining budget'}</small><button className="secondary" onClick={() => setDrawer(null)}>Preview in plan</button></article>)}</>}
      {drawer === 'feasibility' && <><span className="drawer-kicker">PLAN HEALTH · FEASIBILITY</span><h3>Check the joins before the trip does.</h3><div className="health-check-list">{checkFeasibility().map(issue => <div className={issue.severity === 'block' ? 'block' : ''} key={issue.id}><span>{issue.resolved ? '✓' : '!'}</span><div><b>{issue.label}</b><small>{issue.detail}</small></div></div>)}</div><div className="adapter-note"><b>One watch item remains.</b><small>The local adapter can flag opening hours and buffer risks; it cannot verify live operating data.</small></div><button className="primary" onClick={() => { setReadyConfirmed(current => transitionReadyConfirmation(current, 'confirm-ready')); setDrawer(null); }}>Keep this reviewed plan</button></>}
      {drawer === 'reminders' && <><span className="drawer-kicker">REMINDERS · PEOPLE COUNT TOO</span><h3>Important dates and human plans belong on the timeline.</h3><div className="reminder-list">{reminders.map(reminder => <button key={reminder.id} className={reminder.done ? 'done' : ''} onClick={() => setReminders(current => current.map(item => item.id === reminder.id ? { ...item, done: !item.done } : item))}><span>{reminder.done ? '✓' : '○'}</span><div><b>{reminder.label}</b><small>{reminder.date} · {reminder.kind}</small></div></button>)}</div><button className="secondary" onClick={() => setDrawer('commitments')}>Open human commitments & reunion</button></>}
      {drawer === 'commitments' && <><span className="drawer-kicker">HUMAN COMMITMENTS · REUNION</span><h3>Make the invisible parts of a day schedulable.</h3><div className="commitment-list">{commitments.map(item => <div key={item.id}><div><b>{item.label}</b><small>{item.time} · {item.owner} · {item.fixed ? 'fixed' : 'flexible'}</small></div><span>{item.fixed ? 'ANCHOR' : 'FLOATING'}</span></div>)}</div><div className="reunion-form"><span>REUNION AGREEMENT</span><label>Time<input value={reunion.time} onChange={e => setReunion(current => ({ ...current, time: e.target.value }))}/></label><label>Place<input value={reunion.place} onChange={e => setReunion(current => ({ ...current, place: e.target.value }))}/></label><label>Tolerance<input type="number" min="0" max="60" value={reunion.tolerance} onChange={e => setReunion(current => ({ ...current, tolerance: sanitizeAmount(Number(e.target.value)) }))}/></label></div><button className="primary" onClick={() => setDrawer(null)}>Save agreement</button></>}
      {drawer === 'safety' && <SafetyToolkit destination={destination}/>} 
      {drawer === 'assistant' && <><CocoAssistantPrompt mode={mode} destination={destination} onReviewProposal={() => { setAssistantPreview(true); setAssistantUndone(false); }}/>{assistantPreview && !assistantApplied && <><div className="change-ticket"><div><span>KEEP</span><b>{tripInputs.mustGo} · anchor</b></div><div><span>MOVE</span><b>{visibleTripPlan.items.find(item => item.kind === 'floating')?.timeLabel ?? 'current time'} → {suggestedFloatingLabel}</b></div><div><span>WHY</span><b>Derived from the generated floating block and the current breathing-room signal.</b></div></div><div className="action-row"><button className="secondary" onClick={() => setAssistantPreview(false)}>Not now</button><button className="primary" onClick={() => openGovernedAction('assistant-move')}>{mode === 'group' ? 'Send to Group Court' : 'Confirm & apply'}</button></div></>}{assistantApplied && <><div className="success-note"><Check size={21}/><div><b>Suggestion applied.</b><small>Only the generated floating block moved. Anchor and promise stayed intact.</small></div></div><button className="secondary" onClick={() => { setFloatingStartOverride(null); setAssistantApplied(false); setAssistantUndone(true); }}>Undo change</button></>}{assistantUndone && <small className="adapter-note">Change undone. No group decision was silently changed.</small>}</>}
      {drawer === 'gacha' && <><EverydayGachaMachine result={everydayGacha ?? undefined} onTurn={runEverydayGacha} candidates={everydayCandidates}/>{everydayCandidates.length === 0 && <div className="adapter-note"><b>No current draw candidates.</b><small>Save an idea, keep an optional activity, or add a flexible block before asking Coco for a playful suggestion. Sources remain unchanged.</small></div>}</>}
      {drawer === 'lucky' && <LuckyDrawReveal result={luckyDraw ?? undefined} onDraw={runLuckyDraw}/>}
      {drawer === 'memoryCard' && expressiveAvailable && <><span className="drawer-kicker">MEMORY STICKER CARD</span><h3>Turn one moment into a keepsake.</h3><p className="drawer-copy">Generation-ready entry point. No image-generation backend is connected, so this prototype saves the note and metadata contract only.</p><label className="setup-field"><span>Memory note</span><textarea value={memoryNote} onChange={e => setMemoryNote(e.target.value)}/></label><label className="toggle-row"><span><b>Public Community card</b><small>Private by default; explicit consent required.</small></span><input type="checkbox" checked={memoryPublic} onChange={e => setMemoryPublic(e.target.checked)}/></label><button className="primary" onClick={() => setDrawer(null)}>Save {memoryPublic ? 'public' : 'private'} card</button></>}
      {drawer === 'family' && <FamilyWindowPanel privacy={privacy} continuousLocation={continuousLocation} reported={reported} delayed={delay} destination={destination} onReviewLocation={() => setDrawer('location')} onSendReassurance={sendFamilyReassurance}/>}
      {drawer === 'location' && <LocationPrivacyPanel privacy={privacy} continuousLocation={continuousLocation} onOpenFamily={() => setDrawer('family')} onPrivacyChange={level => setPrivacy(level)}/>}
      {drawer === 'import' && <><span className="drawer-kicker">IMPORT INSPIRATION</span><h3>Check if an outside recommendation fits your trip.</h3><input className="big-input" value={externalLink} onChange={e => setExternalLink(e.target.value)}/><button className="primary" onClick={() => setLinkAnalyzed(true)}>{linkAnalyzed ? 'Analyze again' : 'Analyze link'}</button>{linkAnalyzed && <div className="analysis-result"><b>84% demo fit</b><small>3 ideas match your pace · 1 conflicts with the budget cap. Execution still requires your confirmation.</small></div>}</>}
      {drawer === 'community' && <><span className="drawer-kicker">COMMUNITY</span><h3>Borrow ideas, not someone else’s whole trip.</h3>{communityTrips.map(trip => <div className="community-row" key={trip.id}><div><b>{trip.title}</b><small>{trip.match}% fit · by {trip.author}</small></div><button onClick={() => setCommunityTrips(items => items.map(item => item.id === trip.id ? { ...item, saved: !item.saved } : item))}>{trip.saved ? 'Saved' : 'Save'}</button></div>)}<CommunityPublishPanel published={published} onChange={setPublished}/></>}
    </section></div>;
  }

  const renderCourt = () => {
    if (!courtOpen) return null;
    const first = courtOptions[0];
    const second = courtOptions[1];
    const gachaResult = () => {
      const topCount = Math.max(...courtOptions.map(option => tally.counts[option.id] ?? 0));
      const tiedOptions = courtOptions.filter(option => (tally.counts[option.id] ?? 0) === topCount);
      const winner = tiedOptions[Math.floor(Math.random() * tiedOptions.length)];
      if (!winner) return;
      setGacha(winner.label);
      setCourtConfirmed(false);
      setCourtDecision(null);
    };
    return <div className="ritual-overlay"><section className="court-stage"><button className="close light" aria-label="Close Group Court" onClick={() => setCourtOpen(false)}><X size={20}/></button><span className="ritual-kicker">GROUP COURT · {courtOptions.length} OPTIONS</span><Coco mood="happy" context="court"/><h3>{activeConflict}</h3><p>{courtOptions.map(option => `${option.label}: ${tally.counts[option.id] ?? 0}`).join(' · ')}. {tally.tied ? 'This is a true unresolved tie.' : 'There is a majority, so Gacha stays locked.'}</p><div className="member-votes">{courtVotes.map(vote => <div key={vote.member}><b>{vote.member}</b><span>{courtOptions.map(option => <button key={option.id} className={vote.pick === option.id ? 'active' : ''} onClick={() => castVote(vote.member, option.id)}>{option.label}</button>)}</span></div>)}</div><div className="court-add-option"><input value={draftCourtOption} onChange={event => setDraftCourtOption(event.target.value)} placeholder="Add an option"/><button onClick={() => { const label = draftCourtOption.trim(); if (!label || courtOptions.some(option => option.label.toLowerCase() === label.toLowerCase())) return; setCourtOptions(options => [...options, { id: optionSlug(label, options.length), label }]); setDraftCourtOption(''); setGacha(null); setCourtDecision(null); setCourtConfirmed(false); }}>Add option</button></div><div className="trade-slip"><b>Possible exchange</b><small>{first?.label ?? 'Option A'} ↔ protect a linked concession for {second?.label ?? 'Option B'} later. The binding stores the exact pre-concession vote snapshot; any new vote invalidates the stale binding.</small><button onClick={attachConcession}>{tradeAccepted ? 'Withdraw concession & restore votes' : 'Attach concession snapshot'}</button>{courtConcession && <small>{courtConcession.status} · linked to {optionLabel(courtConcession.linkedOptionId)}</small>}</div>{tally.tied ? <CourtTieRitual key={JSON.stringify([activeConflict, courtVotes])} tied={tally.tied} options={courtOptions.map(option => option.label)} result={gacha ?? undefined} onDraw={() => { setCourtDrawRevealed(false); gachaResult(); }} onReveal={() => setCourtDrawRevealed(true)}/> : <div className="majority-note"><b>Majority decides normally.</b><small>Randomness is not used when the vote already resolves the conflict.</small></div>}{proposedDecision && (!gacha || courtDrawRevealed) && <div className="verdict"><span>PROPOSED VERDICT</span><b>{proposedDecision}</b><small>{gacha ? 'Random tie-break is still only a proposal.' : 'Computed from member votes.'}</small><button onClick={confirmCourt}>{courtConfirmed && courtDecision === proposedDecision ? '✓ Added to official timeline' : 'Confirm result'}</button></div>}</section></div>;
  };

  return <div className="app-shell">
    <header className="topbar"><button className="brand-lockup" onClick={() => { setTripWorkspaceOpen(false); setTab('home'); }} aria-label="Go to Home"><img className="brand-companion" src={cocoAsset('expression-normal')} alt="Coco, your travel companion"/><span className="wordmark"><b>COCOCRUNCH</b><small>travel, with room to breathe</small></span></button><div className="topbar-actions"><button className="bell" aria-label="Notifications"><Bell size={19}/><i/></button></div></header>
    <main>{tab === 'home' ? renderHome() : tab === 'trips' ? (tripWorkspaceOpen ? renderTripWorkspace() : renderTrips()) : tab === 'explore' ? renderExplore() : tab === 'memories' ? renderGlobalMemories() : renderMe()}</main>
    <GlobalNav tab={tab} onChange={setTab} onOpenTrips={() => setTripWorkspaceOpen(false)} />
    {renderCourt()}
    {renderDrawer()}
    <GlobalCocoCompanion onAsk={() => { setTripWorkspaceOpen(true); setTripPhase('traveling'); setTab('trips'); setDrawer('assistant'); }} onPray={() => emitExperience({ type: 'open-prayer', source: 'user-reported', uncertainty: 'Personal prayer only; no weather, itinerary, or provider claim.' })} onNext={() => handleJourneyAction(journeyState.nextAction?.target ?? 'trip')} onEveryday={() => { setTripWorkspaceOpen(true); setTripPhase('traveling'); setTab('trips'); setDrawer('gacha'); }} onLucky={() => { setTripWorkspaceOpen(true); setTripPhase('traveling'); setTab('trips'); setDrawer('lucky'); }} />
  </div>;
}
