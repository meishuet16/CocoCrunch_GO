import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell, BookOpen, Box, Calendar, Check, ChevronRight, CircleDollarSign, CloudRain,
  FileText, Gavel, Heart, Image, Link2, LogOut, Map, MapPin, PackageCheck, Plane,
  ReceiptText, RotateCcw, Send, Sparkles, Users, X
} from 'lucide-react';
import { emitExperience } from './experience';
import { isPastPlannedCheckIn } from './during-deviation';
import { shouldPromptToEndTrip } from './trip-end';
import { buildPublicCommunityTrip } from './community-sharing';
import { playSound } from './sound';
import { GlobalNav, type GlobalTab } from './components/GlobalNav';
import { PostmarkStamp } from './components/PostmarkStamp';
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
import { CommunityTripCard, type CommunityTripItem } from './components/explore/CommunityTripCard';
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
import { clearPersisted, derivePersistedTripState, loadPersisted, resetTripScopedSharing, savePersisted, type CompletedPaceEvidence, type ConfirmedLearningRecord, type CourtOptionState, type DecisionRecord, type FlightBookingState, type AccommodationBookingState, type GroupSplitPlan, type PhotoMemoryArtifact, type EmergencyContact } from './persistence';
import { RecommendationEvidenceText } from './components/RecommendationEvidenceText';
import { EverydayGachaMachine } from './components/EverydayGachaMachine';
import { LuckyDrawReveal } from './components/LuckyDrawReveal';
import { TripLifecycleTabs, TripWorkspaceContext, TripWorkspaceHeader, type TripLifecycleStatus, type TripPhase } from './components/TripWorkspace';
import {
  deriveTingoBehavior, deriveTingoIdentity, describeTingo, defaultTingoDimensions, scoreTingo, tingoCompletion,
  tingoGuidance, tingoQuestions, type TingoAnswer, type TingoDimensions, type TingoPersonaKey,
} from './domain/tingo';
import { tripIntentIsReviewable, type TripIntent } from './domain/trip-intent';
import { checkFeasibility, comparisonOptions, importPhotoMetadata } from './domain/adapters';
import { deriveGroupDNA, scopeGroupDNAForMode, type MemberPreferenceProfile } from './domain/group-dna';
import { candidateFromDiscovery, generateTripPlan } from './domain/itinerary';
import type { TripPlan } from './domain/itinerary';
import { deriveJourneyState, transitionReadyConfirmation } from './domain/journey-state';
import { calculatePlanHealth } from './domain/plan-health';
import { applyRepairToPlan, buildMinimumLossRepair, promoteCourtLosers, type BackupCandidate, type RepairResult } from './domain/backup-repair';
import { deriveEverydayDrawPool } from './domain/random-pool';
import {
  applyResponsibilitySuggestions, defaultCommitments, defaultMembers, defaultReminders,
  accommodationCancellationReminder, defaultReunion, suggestResponsibilities, type HumanCommitment,
  type ReunionAgreement, type TripConstraint, type TripMember, type TripReminder,
} from './domain/trip';
import { CocoCompanion } from './components/coco/CocoCompanion';
import { cocoAsset, type CocoContext } from './components/coco/assets';
import { commitRitualState, loadRitualState, memoryEligible } from './ritualState';
import { MemoryTrunk } from './components/MemoryTrunk';
import { TravelCourtModal } from './components/court/TravelCourtModal';
import { type CourtStep } from './components/court/TravelCourtCaseFlow';
import { WeatherGlance } from './components/WeatherGlance';
import { GlobalCocoCompanion } from './components/GlobalCocoCompanion';
import { CompletedKeepLauncher, type CompletedPanel } from './components/CompletedKeepLauncher';
import { SafetyToolkit } from './components/SafetyToolkit';
import { EmergencyContactsManager } from './components/EmergencyContactsManager';
import { PhotoArchiveTimeline } from './components/PhotoArchiveTimeline';
import { CocoAssistantPrompt } from './components/CocoAssistantPrompt';
import { CommunityPublishPanel } from './components/CommunityPublishPanel';
import { PhotoJournalCapture } from './components/PhotoJournalCapture';
import { OnboardingFlow } from './components/OnboardingFlow';
import { FlightDrawer } from './components/FlightDrawer';
import { AccommodationDrawer } from './components/AccommodationDrawer';
import { GroupChannel, type GroupChannelMessage } from './components/GroupChannel';
import { GroupSplit } from './components/GroupSplit';
import foodieHunter from './assets/coco/personas/foodie_hunter.png';
import masterPlanner from './assets/coco/personas/master_planner.png';
import transitNavigator from './assets/coco/personas/transit_navigator.png';
import budgetKeeper from './assets/coco/personas/budget_keeper.png';
import photoChaser from './assets/coco/personas/photo_chaser.png';
import cultureExplorer from './assets/coco/personas/culture_explorer.png';
import adventureSeeker from './assets/coco/personas/adventure_seeker.png';
import relaxationLover from './assets/coco/personas/relaxation_lover.png';
import shoppingScout from './assets/coco/personas/shopping_scout.png';
import weatherWatcher from './assets/coco/personas/weather_watcher.png';
import safetyGuardian from './assets/coco/personas/safety_guardian.png';
import groupCoordinator from './assets/coco/personas/group_coordinator.png';
import packingPro from './assets/coco/personas/packing_pro.png';
import nightOwl from './assets/coco/personas/night_owl.png';
import memoryKeeper from './assets/coco/personas/memory_keeper.png';
import hiddenGemSeeker from './assets/coco/personas/hidden_gem_seeker.png';
import userAvatar from './assets/avatar-cartoon-traveler.svg';

type Tab = GlobalTab;
type TripMode = 'group' | 'solo';
type Mood = 'great' | 'okay' | 'tired' | null;
type Privacy = 'status' | 'area' | 'exact';
type CourtView = 'upload' | 'discussion' | 'voting';
type Drawer = 'group' | 'backup' | 'budget' | 'family' | 'location' | 'community' | 'import' | 'discover' | 'tingo' | 'tripSetup' | 'compare' | 'feasibility' | 'reminders' | 'commitments' | 'safety' | 'assistant' | 'gacha' | 'lucky' | 'memoryCard' | 'all-personas' | 'flight' | 'accommodation' | 'tripEnd' | null;
type CommunityTrip = { id: number; title: string; author: string; match: number; saved: boolean };
type PlaceRecommendation = DiscoveryPlace & { id: number; saved: boolean; added: boolean };
type GhostWish = { id: number; name: string; reason: string; status: 'resting' | 'revived' | 'released' };
type GovernedAction = 'assistant-move' | 'split-on' | 'split-off' | null;
type TripScopedInputs = Pick<TripIntent, 'tripVibe' | 'mustGo' | 'dealBreaker' | 'preference' | 'flexible'>;
type TripSetupStep = 1 | 2 | 3 | 4 | 5;
type TripSetupLocationMethod = 'manual' | 'recommendation' | 'link';
type TripReference = { destination: string; tripVibe: string; budget: number; title: string };
type GroupSetupStep = 1 | 2 | 3 | 4 | 5 | 6;

function reorderedPlan(plan: TripPlan, order: string[]): TripPlan {
  const byId = new globalThis.Map(plan.items.map(item => [item.id, item]));
  const items = [...order.map(id => byId.get(id)).filter((item): item is TripPlan['items'][number] => Boolean(item)), ...plan.items.filter(item => !order.includes(item.id))];
  let cursor = items[0]?.startMinutes ?? 0;
  const scheduled = items.map((item, index) => {
    const duration = item.endMinutes - item.startMinutes;
    const startMinutes = index === 0 ? cursor : cursor + item.transferMinutes;
    cursor = startMinutes + duration;
    return { ...item, startMinutes, endMinutes: cursor, timeLabel: formatPlanTime(startMinutes) };
  });
  return { ...plan, items: scheduled, totalEstimatedCost: scheduled.reduce((total, item) => total + item.estimatedCost, 0), walkingKm: Number(scheduled.reduce((total, item) => total + item.walkingKm, 0).toFixed(1)), transferMinutes: scheduled.reduce((total, item) => total + item.transferMinutes, 0) };
}

export function deriveTripLifecycleStatus({ tripCreated, readyConfirmed, dates, phase, now = new Date() }: { tripCreated: boolean; readyConfirmed: boolean; dates: TripIntent['dates']; phase: TripPhase; now?: Date }): TripLifecycleStatus {
  if (phase === 'completed') return 'completed';
  if (!tripCreated || !readyConfirmed || !dates?.start) return 'planning';
  const departure = new Date(`${dates.start}T00:00:00`);
  if (Number.isNaN(departure.getTime())) return 'planning';
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return departure <= today ? 'ongoing' : 'active';
}

const tingoPersonaImages: Record<TingoPersonaKey, string> = {
  'foodie-hunter': foodieHunter,
  'master-planner': masterPlanner,
  'transit-navigator': transitNavigator,
  'budget-keeper': budgetKeeper,
  'photo-chaser': photoChaser,
  'culture-explorer': cultureExplorer,
  'adventure-seeker': adventureSeeker,
  'relaxation-lover': relaxationLover,
  'shopping-scout': shoppingScout,
  'weather-watcher': weatherWatcher,
  'safety-guardian': safetyGuardian,
  'group-coordinator': groupCoordinator,
  'packing-pro': packingPro,
  'night-owl': nightOwl,
  'memory-keeper': memoryKeeper,
  'hidden-gem-seeker': hiddenGemSeeker,
};

type PersonaDetail = {
  label: string;
  tagline: string;
  tags: string[];
  summary: string;
};

const tingoPersonaDetails: Record<TingoPersonaKey, PersonaDetail> = {
  'hidden-gem-seeker': {
    label: 'Hidden Gem Seeker',
    tagline: 'Handles unique spots',
    tags: ['FOOD', 'CULTURE', 'EXPLORATION', 'LOCAL LIVING'],
    summary: 'You love meaningful local experiences, unhurried moments and good food along the way.',
  },
  'foodie-hunter': {
    label: 'Foodie Hunter',
    tagline: 'Handles food picks',
    tags: ['FOOD', 'LOCAL TASTES', 'MARKETS', 'DINING'],
    summary: 'You read the trip through memorable meals, delicious street snacks and local food culture.',
  },
  'master-planner': {
    label: 'Master Planner',
    tagline: 'Handles trip structure',
    tags: ['ITINERARY', 'TIMING', 'SMOOTH PACE', 'PROTECTED ANCHORS'],
    summary: 'You craft well-balanced itineraries with clear timing so the whole trip feels effortless and calm.',
  },
  'transit-navigator': {
    label: 'Transit Navigator',
    tagline: 'Handles routes & connections',
    tags: ['ROUTES', 'TRANSIT', 'EFFICIENCY', 'SMOOTH MOVES'],
    summary: 'You navigate connections, subway maps and transit tradeoffs to keep everyone moving smoothly.',
  },
  'budget-keeper': {
    label: 'Budget Keeper',
    tagline: 'Handles smart spending',
    tags: ['SMART VALUE', 'BUDGET CALM', 'HIDDEN SAVINGS', 'SPEND WISELY'],
    summary: 'You find clever ways to maximize joy and protect budgets without making the trip feel smaller.',
  },
  'photo-chaser': {
    label: 'Photo Chaser',
    tagline: 'Handles scenic moments',
    tags: ['SCENIC VIEWS', 'GOLDEN HOUR', 'MEMORY CARDS', 'ICONIC SPOTS'],
    summary: 'You seek out once-in-a-trip scenery, golden hour viewpoints and the best memory-worthy spots.',
  },
  'culture-explorer': {
    label: 'Culture Explorer',
    tagline: 'Handles heritage & stories',
    tags: ['HERITAGE', 'HISTORY', 'LOCAL ARTS', 'TRADITIONS'],
    summary: 'You dive into local traditions, ancient alleys, museums and stories that bring each place alive.',
  },
  'adventure-seeker': {
    label: 'Adventure Seeker',
    tagline: 'Handles bold outdoor ideas',
    tags: ['OUTDOORS', 'HIKING', 'NEW HORIZONS', 'THRILLS'],
    summary: 'You gravitate toward wild trails, scenic summits and bold outdoor moments that get your heart racing.',
  },
  'relaxation-lover': {
    label: 'Relaxation Lover',
    tagline: 'Handles calm & rest',
    tags: ['UNHURRIED', 'CAFÉ BREAKS', 'SLOW PACE', 'RESTFUL STAYS'],
    summary: 'You protect gentle mornings, leisurely café breaks and the breathing room that makes vacations restorative.',
  },
  'shopping-scout': {
    label: 'Shopping Scout',
    tagline: 'Handles unique finds',
    tags: ['BOUTIQUES', 'LOCAL CRAFTS', 'VINTAGE', 'SOUVENIRS'],
    summary: 'You uncover neighborhood boutiques, curated vintage shops and timeless souvenirs to take home.',
  },
  'weather-watcher': {
    label: 'Weather Watcher',
    tagline: 'Handles backup plans',
    tags: ['WEATHER AWARE', 'RAINY PLANS', 'FLEXIBILITY', 'LOW CHAOS'],
    summary: 'You anticipate seasonal shifts and rain forecasts to pivot gracefully to indoor charms.',
  },
  'safety-guardian': {
    label: 'Safety Guardian',
    tagline: 'Handles peace of mind',
    tags: ['SAFE ROUTES', 'LOW FRICTION', 'PREPARED', 'RELIABLE STAYS'],
    summary: 'You prioritize peace of mind, reliable transport and calm plans so everyone feels secure.',
  },
  'group-coordinator': {
    label: 'Group Coordinator',
    tagline: 'Handles harmony & choices',
    tags: ['SHARED JOY', 'CONSENSUS', 'TEAM SPIRIT', 'FAIR CHOICES'],
    summary: 'You keep everyone engaged, listen to every voice and ensure group decisions feel effortless and fair.',
  },
  'packing-pro': {
    label: 'Packing Pro',
    tagline: 'Handles gear & essentials',
    tags: ['LIGHT LUGGAGE', 'ORGANIZED', 'ESSENTIALS', 'SMART PACKING'],
    summary: 'You pack smart, light and organized, ensuring nothing essential gets left behind.',
  },
  'night-owl': {
    label: 'Night Owl',
    tagline: 'Handles evening momentum',
    tags: ['NIGHTLIFE', 'EVENING WALKS', 'LATE BITES', 'CITY LIGHTS'],
    summary: 'You come alive after dusk, exploring illuminated cityscapes, cozy taverns and night markets.',
  },
  'memory-keeper': {
    label: 'Memory Keeper',
    tagline: 'Handles keepsakes & stories',
    tags: ['JOURNALS', 'POSTCARDS', 'MEMENTOS', 'SHARED STORIES'],
    summary: 'You curate ticket stubs, handwritten notes and photo keepsakes that preserve the magic.',
  },
};

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
  return <CocoCompanion context={context === 'default' ? 'home' : context === 'travel' ? 'traveling' : context} pose={mood === 'panic' ? 'expression-worried' : undefined} size={tiny ? 72 : 128} />;
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
  return <button className="mini-tool" onClick={onClick}><Icon size={18} /><span><b>{label}</b><small>{note}</small></span><ChevronRight size={16} /></button>;
}

function tingoTypeLabel(dimensions: TingoDimensions): string {
  return deriveTingoIdentity(dimensions).title;
}

function tingoTypeCopy(dimensions: TingoDimensions): string {
  return deriveTingoIdentity(dimensions).summary;
}

export default function AppRescued() {
  const [stored] = useState(() => loadPersisted());
  const [onboardingComplete, setOnboardingComplete] = useState(Boolean(stored.onboardingComplete));
  const [onboardingName, setOnboardingName] = useState(stored.onboardingName ?? '');
  const [onboardingCountryCode, setOnboardingCountryCode] = useState(stored.onboardingCountryCode ?? '+60');
  const [onboardingBirthday, setOnboardingBirthday] = useState(stored.onboardingBirthday ?? '');
  const [onboardingStage, setOnboardingStage] = useState<'account' | 'tingo' | 'packing'>('account');
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
  const [personaOverride, setPersonaOverride] = useState<TingoPersonaKey | null>(null);
  const [, setCocoTick] = useState(0);

  useEffect(() => {
    const handleSpritesReady = () => setCocoTick(t => t + 1);
    window.addEventListener('coco-sprites-ready', handleSpritesReady);
    return () => window.removeEventListener('coco-sprites-ready', handleSpritesReady);
  }, []);
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
  const [tripDates, setTripDates] = useState(storedTripDates);
  const [plannerTurn, setPlannerTurn] = useState(stored.plannerTurn ?? 'Mei');
  const [courtOpen, setCourtOpen] = useState(false);
  const [courtCocoContext, setCourtCocoContext] = useState<'court' | 'courtTie'>('court');
  const [courtInitialMode, setCourtInitialMode] = useState<'ideas' | 'case' | 'playground'>('case');
  const [courtInitialStep, setCourtInitialStep] = useState<CourtStep>('lobby');
  const [courtView, setCourtView] = useState<CourtView>('upload');

  // Auto-open Travel Court directly from URL: ?court=summary or ?court=case or ?court=ideas
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleUrlCheck = () => {
      const params = new URLSearchParams(window.location.search);
      const courtParam =
        params.get('court') ||
        (window.location.hash.includes('court=')
          ? window.location.hash.split('court=')[1]?.split('&')[0]
          : null);

      if (courtParam) {
        if (
          courtParam === 'summary' ||
          courtParam === 'jeju' ||
          courtParam === 'airplane' ||
          courtParam === 'screen8' ||
          courtParam === 'save'
        ) {
          setCourtInitialMode('case');
          setCourtInitialStep('summary');
          setCourtOpen(true);
        } else if (courtParam === 'playground' || courtParam === 'poses') {
          setCourtInitialMode('playground');
          setCourtOpen(true);
        } else if (courtParam === 'ideas' || courtParam === 'upload' || courtParam === 'board') {
          setCourtInitialMode('ideas');
          setCourtInitialStep('lobby');
          setCourtOpen(true);
        } else {
          setCourtInitialMode('case');
          setCourtInitialStep('lobby');
          setCourtOpen(true);
        }
      }
    };

    handleUrlCheck();
    window.addEventListener('popstate', handleUrlCheck);
    window.addEventListener('hashchange', handleUrlCheck);
    return () => {
      window.removeEventListener('popstate', handleUrlCheck);
      window.removeEventListener('hashchange', handleUrlCheck);
    };
  }, []);
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
  const [automaticDeviationPrompted, setAutomaticDeviationPrompted] = useState(Boolean(stored.automaticDeviationPrompted));
  const [completedTodayItemIds, setCompletedTodayItemIds] = useState<string[]>(stored.completedTodayItemIds ?? []);
  const [tripEndPromptDismissed, setTripEndPromptDismissed] = useState(Boolean(stored.tripEndPromptDismissed));
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(stored.emergencyContacts ?? []);
  const [emergencyCheckInFrequency, setEmergencyCheckInFrequency] = useState(stored.emergencyCheckInFrequency ?? 60);
  const [selectedEmergencyContactId, setSelectedEmergencyContactId] = useState(stored.selectedEmergencyContactId ?? '');
  const [browserLocation, setBrowserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [browserLocationError, setBrowserLocationError] = useState<string | null>(null);
  useEffect(() => {
    if (!navigator.geolocation) { setBrowserLocationError('This browser does not support location.'); return; }
    const watchId = navigator.geolocation.watchPosition(position => { setBrowserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }); setBrowserLocationError(null); }, error => setBrowserLocationError(error.code === error.PERMISSION_DENIED ? 'Location permission was not granted.' : 'Current location is unavailable.'), { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 });
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);
  const [replanPreview, setReplanPreview] = useState(false);
  const [emergencyApproved, setEmergencyApproved] = useState(false);
  const [replanApplied, setReplanApplied] = useState(Boolean(stored.appliedRepair));
  const [mood, setMood] = useState<Mood>(storedPace?.mood ?? null);
  const [split, setSplit] = useState(false);
  const [groupSplitPlan, setGroupSplitPlan] = useState<GroupSplitPlan>(stored.groupSplitPlan ?? { memberIds: [], destination: '', meetingPoint: '', meetingTime: '', suggestionSource: 'prototype-midpoint' });
  const [photoMemoryArtifacts, setPhotoMemoryArtifacts] = useState<PhotoMemoryArtifact[]>(stored.photoMemoryArtifacts ?? []);
  const [privacy, setPrivacy] = useState<Privacy>(stored.privacy ?? 'status');
  const [continuousLocation, setContinuousLocation] = useState(Boolean(stored.continuousLocation));
  const [reported, setReported] = useState(false);
  const [receiptPrinted, setReceiptPrinted] = useState(false);
  const [worthIt, setWorthIt] = useState<TripReview | null>(stored.worthIt ?? null);
  const [profileLearned, setProfileLearned] = useState(Boolean(stored.profileLearned));
  const [learningProposal, setLearningProposal] = useState<LearningProposal | null>(stored.learningProposal ?? null);
  const [confirmedLearningHistory, setConfirmedLearningHistory] = useState<ConfirmedLearningRecord[]>(stored.confirmedLearningHistory ?? []);
  const [tingoAnswers, setTingoAnswers] = useState<TingoAnswer[]>(stored.tingoAnswers ?? []);
  const [tingoStep, setTingoStep] = useState(-1);
  const [tingoRevealed, setTingoRevealed] = useState(() => tingoCompletion(stored.tingoAnswers ?? []) === 100);
  const [basePackingPreferences, setBasePackingPreferences] = useState<string[]>(stored.basePackingPreferences ?? ['comfortable walking shoes', 'portable charger', 'light rain layer']);
  const [itineraryOrder, setItineraryOrder] = useState<string[]>(stored.itineraryOrder ?? []);
  const [groupChannelMessages, setGroupChannelMessages] = useState<GroupChannelMessage[]>(stored.groupChannelMessages ?? []);
  const [groupCourtUnreadCount, setGroupCourtUnreadCount] = useState(stored.groupCourtUnreadCount ?? 0);
  const [tripCreated, setTripCreated] = useState(stored.tripCreated ?? true);
  const [tripSetupStep, setTripSetupStep] = useState<TripSetupStep>(1);
  const [tripSetupLocationMethod, setTripSetupLocationMethod] = useState<TripSetupLocationMethod>('manual');
  const [tripSetupPrompt, setTripSetupPrompt] = useState('');
  const [tripSetupLink, setTripSetupLink] = useState('');
  const [tripSetupLinkStatus, setTripSetupLinkStatus] = useState<'idle' | 'parsing' | 'ready'>('idle');
  const [tripSetupReference, setTripSetupReference] = useState<TripReference | null>(null);
  const [tripSetupModeChoice, setTripSetupModeChoice] = useState(false);
  const [groupSetupStep, setGroupSetupStep] = useState<GroupSetupStep>(1);
  const [destinationLockedByLeader, setDestinationLockedByLeader] = useState(Boolean(stored.destinationLockedByLeader));
  const [groupMemberBudgets, setGroupMemberBudgets] = useState<Record<string, number>>(stored.groupMemberBudgets ?? {});
  const [groupMemberVibes, setGroupMemberVibes] = useState<Record<string, string>>(stored.groupMemberVibes ?? {});
  const [groupMemberDestinations, setGroupMemberDestinations] = useState<Record<string, string>>(stored.groupMemberDestinations ?? {});
  const [groupUsernameSearch, setGroupUsernameSearch] = useState('');
  const [flightBooking, setFlightBooking] = useState<FlightBookingState | undefined>(stored.flightBooking);
  const [flightBookingDraft, setFlightBookingDraft] = useState(stored.flightBookingDraft ?? '');
  const [accommodationBooking, setAccommodationBooking] = useState<AccommodationBookingState | undefined>(stored.accommodationBooking);
  const [accommodationBookingDraft, setAccommodationBookingDraft] = useState(stored.accommodationBookingDraft ?? '');
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
  const [sealedCourtIdeas, setSealedCourtIdeas] = useState<string[]>([]);
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
  const tingoIdentity = useMemo(() => deriveTingoIdentity(tingoDimensions), [tingoDimensions]);
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
    dates: tripDates,
    mode,
    ...tripInputs,
    budget: budgetTotal,
  }), [destination, tripDates, mode, tripInputs, budgetTotal]);
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
  const orderedTripPlan = useMemo(() => reorderedPlan(baseTripPlan, itineraryOrder), [baseTripPlan, itineraryOrder]);
  const repairSourcePlan = useMemo(() => delay && !replanApplied && failedPlanItem
    ? { ...orderedTripPlan, unresolvedRisks: [...orderedTripPlan.unresolvedRisks, `${failedPlanItem.name} failed due to weather.`] }
    : orderedTripPlan, [orderedTripPlan, delay, failedPlanItem, replanApplied]);
  const repairPreview = useMemo(() => failedPlanItem ? buildMinimumLossRepair({ plan: repairSourcePlan, failedItemId: failedPlanItem.id, backups: backupPool, budgetRemaining: remaining, mode }) : null, [backupPool, failedPlanItem, mode, remaining, repairSourcePlan]);
  const visibleTripPlan = useMemo(() => appliedRepair ? applyRepairToPlan(repairSourcePlan, appliedRepair, true).plan : repairSourcePlan, [appliedRepair, repairSourcePlan]);
  const optionLabel = (id: string | null) => courtOptions.find(option => option.id === id)?.label ?? id ?? '';
  const courtSkippedCandidates = useMemo(() => {
    if (!courtConfirmed || !courtDecision) return [];
    const winnerId = courtOptions.find(option => option.label === courtDecision)?.id ?? tally.majority;
    return courtOptions.filter(option => option.id !== winnerId).map(option => option.label);
  }, [courtConfirmed, courtDecision, courtOptions, tally.majority]);
  const everydayCandidates = useMemo(() => deriveEverydayDrawPool([
    ...visibleTripPlan.items.filter(item => item.kind === 'floating').map(item => ({ name: item.name, source: 'floating-itinerary' as const })),
    ...recommendations.filter(place => place.saved).map(place => ({ name: place.name, source: 'saved-idea' as const })),
    ...backupPool.map(item => ({ name: item.name, source: 'backup' as const, viable: item.viable, dealBreakerSafe: item.dealBreakerSafe })),
    ...courtSkippedCandidates.map(name => ({ name, source: 'court-skipped' as const })),
    ...sealedCourtIdeas.map(name => ({ name, source: 'court-skipped' as const })),
  ]), [backupPool, courtSkippedCandidates, recommendations, sealedCourtIdeas, visibleTripPlan.items]);
  const planHealth = calculatePlanHealth({ plan: visibleTripPlan, budget: budgetTotal, groupDNA, tingoBehavior, dealBreaker: tripInputs.dealBreaker, resolvedConflictLabels });
  const majorityDecision = tally.majority ? optionLabel(tally.majority) : null;
  const proposedDecision = gacha ?? majorityDecision;
  const completedPaceEvidence: CompletedPaceEvidence = { delayed: delay, mood, arrivalChecked };
  const actualPaceCopy = paceEvidenceSummary(completedPaceEvidence);
  const tingoComplete = tingoCompletion(tingoAnswers) === 100;
  const tripLifecycleStatus = deriveTripLifecycleStatus({ tripCreated, readyConfirmed, dates: tripIntent.dates, phase: tripPhase });
  const workspacePhase: TripPhase = tripLifecycleStatus === 'ongoing' ? 'traveling' : tripLifecycleStatus === 'completed' ? 'completed' : 'planning';
  const todayItemIds = visibleTripPlan.items.filter(item => item.kind !== 'buffer').map(item => item.id);
  const allTodayItemsComplete = todayItemIds.length > 0 && todayItemIds.every(id => completedTodayItemIds.includes(id));
  const tripEndDetected = workspacePhase === 'traveling' && shouldPromptToEndTrip({ now: new Date(), returnDate: tripIntent.dates?.end, allTodayItemsComplete });
  const automaticDeviationDetected = workspacePhase === 'traveling' && !arrivalChecked && !delay && Boolean(failedPlanItem && isPastPlannedCheckIn(new Date(), failedPlanItem.endMinutes));
  useEffect(() => {
    if (!automaticDeviationDetected || automaticDeviationPrompted) return;
    setAutomaticDeviationPrompted(true);
    setDelay(true);
    setReplanPreview(false);
    setAppliedRepair(null);
    setReplanApplied(false);
    setEmergencyApproved(false);
    setDrawer('assistant');
  }, [automaticDeviationDetected, automaticDeviationPrompted]);
  useEffect(() => {
    if (!tripEndDetected || tripEndPromptDismissed) return;
    setDrawer('tripEnd');
  }, [tripEndDetected, tripEndPromptDismissed]);
  const outcomeReviewed = actualPaceCopy !== 'No completed pace signal yet' || Object.keys(itemReviews).length > 0;
  const expressiveAvailable = memoryEligible(outcomeReviewed, worthIt, profileLearned, learningProposal?.status);
  const journeyState = useMemo(() => deriveJourneyState({
    phase: workspacePhase,
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
    currentStopNeedsCheckIn: workspacePhase === 'traveling' && !arrivalChecked,
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
    workspacePhase,
    tingoComplete,
    visibleTripPlan.items.length,
    worthIt,
  ]);

  useEffect(() => {
    savePersisted({
      version: 1, mode, destination, readyConfirmed, profile, plannerTurn, courtVotes, courtConfirmed, courtDecision,
      courtOptions, activeConflict, decisionHistory,
      groupBudgetTotal, soloBudgetTotal, groupBudgetPlan, soloBudgetPlan, groupBudgetActuals, soloBudgetActuals,
      completedPaceEvidence, automaticDeviationPrompted, completedTodayItemIds, tripEndPromptDismissed, emergencyContacts, emergencyCheckInFrequency, selectedEmergencyContactId,
      privacy, continuousLocation,
      recommendations: recommendations.map(({ name, saved, added }) => ({ name, saved, added })),
      tripIntent,
      worthIt, profileLearned, learningProposal: learningProposal?.status === 'confirmed' ? undefined : learningProposal ?? undefined, confirmedLearningHistory, tingoAnswers, tingoDimensions, onboardingComplete, onboardingName, onboardingCountryCode, onboardingBirthday, basePackingPreferences, tripCreated, tripPhase,
      members, memberPreferenceProfiles, backupCandidates, appliedRepair: appliedRepair ?? undefined, constraints, reminders, commitments, reunion, published, memoryPublic, itemReviews, revivedWishIds: ghostWishes.filter(wish => wish.status === 'revived').map(wish => wish.id), destinationLockedByLeader, groupMemberBudgets, groupMemberVibes, groupMemberDestinations, itineraryOrder, groupChannelMessages, groupCourtUnreadCount, groupSplitPlan, photoMemoryArtifacts, flightBooking, flightBookingDraft, accommodationBooking, accommodationBookingDraft,
    });
  }, [mode, destination, readyConfirmed, profile, plannerTurn, courtVotes, courtConfirmed, courtDecision, courtOptions, activeConflict, decisionHistory, groupBudgetTotal, soloBudgetTotal, groupBudgetPlan, soloBudgetPlan, groupBudgetActuals, soloBudgetActuals, delay, mood, arrivalChecked, privacy, continuousLocation, recommendations, tripIntent, worthIt, profileLearned, learningProposal, confirmedLearningHistory, tingoAnswers, tingoDimensions, onboardingComplete, onboardingName, onboardingCountryCode, onboardingBirthday, basePackingPreferences, tripCreated, tripPhase, members, memberPreferenceProfiles, backupCandidates, appliedRepair, constraints, reminders, commitments, reunion, published, memoryPublic, itemReviews, ghostWishes, destinationLockedByLeader, groupMemberBudgets, groupMemberVibes, groupMemberDestinations, itineraryOrder, groupChannelMessages, groupCourtUnreadCount, groupSplitPlan, photoMemoryArtifacts, automaticDeviationPrompted, completedTodayItemIds, tripEndPromptDismissed, emergencyContacts, emergencyCheckInFrequency, selectedEmergencyContactId, flightBooking, flightBookingDraft, accommodationBooking, accommodationBookingDraft]);

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
      emitExperience({
        type: 'capture-place', place: place.name, save: () => {
          const current = loadRitualState();
          const savedIdeas = [...(current.savedIdeas ?? []).filter(item => item.name !== place.name), { name: place.name, source: place.source }];
          if (!commitRitualState({ savedIdeas })) return false;
          setRitualRecords(loadRitualState());
          setRecommendations(items => items.map(item => item.name === place.name ? { ...item, saved: true } : item));
          return true;
        }
      });
      return;
    }
    if (action === 'add') {
      const gate = gatePlanMutation(mode, mode === 'group' ? 'idea-save' : 'personal-draft');
      if (!gate.allowed) return;
    }
    setRecommendations(items => items.map(item => item.id === id ? { ...item, added: !item.added } : item));
  }

  function castVote(member: string, pick: CourtOption) {
    playSound('tap');
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

  function openCourt(
    view: CourtView = 'upload',
    step: CourtStep = 'lobby',
    courtMode?: 'ideas' | 'case' | 'playground'
  ) {
    if (tripIntent.mode === 'group') {
      setGroupChannelMessages(messages => [...messages, { id: `court-${Date.now()}`, author: 'CocoCrunch', text: 'Group Court is open. Everyone has been asked to review and vote.', system: true, createdAt: 'Now' }]);
      setGroupCourtUnreadCount(count => count + 1);
    }
    setCourtView(view);
    setCourtInitialMode(courtMode ?? 'case');
    setCourtInitialStep(step);
    setCourtOpen(true);
  }

  function attachConcession() {
    playSound('tap');
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
    playSound('gavel');
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
    emitExperience({ type: 'print-receipt', total: spent, participants: mode === 'group' ? members.filter(member => member.inviteStatus === 'joined').map(member => member.name) : ['Priya'] });
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

  function openTrip() {
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
      openTrip();
      setDrawer('tripSetup');
      return;
    }

    if (actionId === 'open-court') {
      openTrip();
      setDrawer(null);
      openCourt();
      return;
    }

    if (actionId === 'review-health' || actionId === 'confirm-ready') {
      openTrip();
      setDrawer('feasibility');
      return;
    }

    if (actionId === 'preview-repair' || actionId === 'approve-repair') {
      openTrip();
      setDrawer(null);
      setReplanPreview(Boolean(repairPreview?.applicable));
      return;
    }

    if (actionId === 'check-in' || actionId === 'continue-traveling') {
      openTrip();
      setDrawer(null);
      return;
    }

    if (actionId === 'review-outcome' || actionId === 'open-memories' || actionId === 'review-learning') {
      openTrip();
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
      openTrip();
      setDrawer(null);
      return;
    }

    setDrawer(null);
    if (target === 'trip') openTrip();
    else {
      setTripWorkspaceOpen(false);
      setTab(target);
    }
  }

  function answerTingo(optionId: string) {
    const question = tingoQuestions[tingoStep];
    if (!question) return;
    setTingoAnswers(current => {
      return [...current.filter(answer => answer.questionId !== question.id), { questionId: question.id, optionId }];
    });
    setTingoRevealed(false);
    if (tingoStep < tingoQuestions.length - 1) setTingoStep(step => step + 1);
    else setTingoStep(tingoQuestions.length);
  }

  function finishTingo() {
    setPersonaOverride(null);
    const dimensions = scoreTingo(tingoAnswers);
    setRecommendations(current => makeRecommendations(destination, dimensions, current));
    setTingoRevealed(true);
  }

  useEffect(() => {
    if (tingoStep !== tingoQuestions.length || tingoRevealed || tingoCompletion(tingoAnswers) !== 100) return;
    const revealTimer = window.setTimeout(finishTingo, 650);
    return () => window.clearTimeout(revealTimer);
  }, [destination, tingoAnswers, tingoRevealed, tingoStep]);

  function logOut() {
    clearPersisted();
    window.location.reload();
  }

  function confirmAccommodationBooking(booking: AccommodationBookingState) {
    setAccommodationBooking(booking);
    setReminders(current => current.map(reminder => reminder.id === 'hotel-cancel' ? accommodationCancellationReminder(booking.cancellationDeadline) : reminder));
  }

  function continueAfterTingo() {
    finishTingo();
    setDrawer(null);
    if (!onboardingComplete) setOnboardingStage('packing');
  }

  function closeTingoAssessment() {
    setDrawer(null);
    if (!onboardingComplete) setOnboardingStage('account');
  }

  function retakeTingo() {
    setPersonaOverride(null);
    setTingoAnswers([]);
    setTingoStep(-1);
    setTingoRevealed(false);
    setDrawer('tingo');
  }

  function updateConstraint(type: TripConstraint['type'], value: string) {
    if (!value.trim()) return;
    setConstraints(current => [...current.filter(item => item.type !== type), { id: `${type}-${Date.now()}`, type, value: value.trim(), source: 'member' }]);
  }

  function openGroupInviteFlow() {
    setMode('group');
    setTripSetupModeChoice(false);
    setGroupSetupStep(2);
    setDrawer('tripSetup');
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
    openCourt();
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
    openCourt();
  }

  function renderHome() {
    if (tripLifecycleStatus === 'planning') return <div className="home-orientation home-empty">
      <section className="home-empty-state cc-card" aria-label="Trip inspiration">
        <p className="home-empty-status">No active trip</p>
        <CocoCompanion context="planning" size={98} />
        <div><h2>Explore ideas</h2><p>Save a place for later.</p><button className="secondary" onClick={() => setTab('explore')}>Explore <ChevronRight size={16} /></button></div>
      </section>
    </div>;
    if (tripLifecycleStatus === 'completed') return <div className="home-orientation">
      <SectionTitle kicker="HOME · TRIP COMPLETE" title="This journey now lives in Memories." copy="Review what happened and carry the useful parts forward." />
      <button className="primary" onClick={() => setTab('memories')}>Open Memories <ChevronRight size={16} /></button>
    </div>;
    const groupStatus = mode === 'group'
      ? planHealth.metrics.unresolvedConflicts > 0
        ? `${planHealth.metrics.unresolvedConflicts} conflict${planHealth.metrics.unresolvedConflicts === 1 ? '' : 's'} to resolve`
        : `${travellerCount} travellers aligned`
      : 'Solo trip';

    return <div className="home-orientation home-dashboard">
      <button className="home-active-hero" onClick={openTrip} aria-label={`Open ${destination} trip details`}>
        <div className="home-trip-hero-art" aria-hidden="true"><Map size={34} strokeWidth={1.5} /></div>
        <div className="home-active-hero-copy"><span>Active trip</span><h2>{destination}</h2><small>{tripIntent.dates ? `${tripIntent.dates.start} – ${tripIntent.dates.end}` : 'Dates to be confirmed'}</small></div>
        <ChevronRight className="home-active-hero-arrow" size={22} aria-hidden="true" />
      </button>
      <section className="home-current-trips" aria-label="Current trip">
        <div className="home-section-heading"><h2>Current trip</h2><button onClick={openTrip}>View details <ChevronRight size={15} /></button></div>
        <button className="home-current-trip-card" onClick={openTrip}>
          <div><span>{workspacePhase === 'traveling' ? 'Travelling now' : 'Departure ahead'}</span><b>{destination}</b><small>Plan health {planHealth.overall}/100 · {groupStatus}</small></div><ChevronRight size={18} aria-hidden="true" />
        </button>
        <TripJourneyStatus state={journeyState} destination={destination} onAction={handleJourneyAction} />
      </section>
      <section className="home-shortcuts" aria-label="Trip shortcuts">
        <button onClick={openTrip}><Calendar size={20} /><span>Plan</span></button>
        <button onClick={openTrip}><Map size={20} /><span>Map</span></button>
        <button onClick={() => setTab('explore')}><BookOpen size={20} /><span>Saved places</span></button>
        <button onClick={openPacking}><Box size={20} /><span>Packing list</span></button>
      </section>
      <section className="home-tip-card paper-sheet" aria-label="Trip tip"><WeatherGlance destination={destination} compact /></section>
    </div>;
  }

  function startNewTrip() {
    const sharing = resetTripScopedSharing();
    setReadyConfirmed(current => transitionReadyConfirmation(current, 'start-new-trip'));
    setTripCreated(false);
    setTripPhase('planning');
    setDelay(false);
    setAutomaticDeviationPrompted(false);
    setCompletedTodayItemIds([]);
    setTripEndPromptDismissed(false);
    setReplanPreview(false);
    setEmergencyApproved(false);
    setReplanApplied(false);
    setAppliedRepair(null);
    setMood(null);
    setArrivalChecked(false);
    setSplit(false);
    setGroupSplitPlan({ memberIds: [], destination: '', meetingPoint: '', meetingTime: '', suggestionSource: 'prototype-midpoint' });
    setPhotoMemoryArtifacts([]);
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
    setTripSetupReference(null);
    setTripSetupModeChoice(false);
    setTripSetupLocationMethod('manual');
    setTripSetupPrompt('');
    setTripSetupLink('');
    setTripSetupLinkStatus('idle');
    setTripSetupStep(1);
    setGroupSetupStep(1);
    setDestinationLockedByLeader(false);
    setGroupMemberBudgets({});
    setGroupMemberVibes({});
    setGroupMemberDestinations({});
    setGroupUsernameSearch('');
    setDrawer('tripSetup');
  }

  function inviteMember() {
    openGroupInviteFlow();
  }

  function addGroupMemberFromUsername(username: string) {
    const candidates: Record<string, Pick<TripMember, 'name' | 'role' | 'pace'>> = {
      alex: { name: 'Alex', role: 'Transit buddy', pace: 'steady' },
      hana: { name: 'Hana', role: 'Food scout', pace: 'fast' },
      noah: { name: 'Noah', role: 'Memory keeper', pace: 'slow' },
    };
    const candidate = candidates[username.toLowerCase()];
    if (!candidate) return;
    setMembers(current => current.some(member => member.id === username.toLowerCase()) ? current.map(member => member.id === username.toLowerCase() ? { ...member, inviteStatus: 'joined' } : member) : [...current, { id: username.toLowerCase(), ...candidate, inviteStatus: 'joined' }]);
    setGroupUsernameSearch('');
  }

  function openDestinationCourt() {
    const candidates = Array.from(new Set(Object.values(groupMemberDestinations).filter(Boolean)));
    if (candidates.length < 2) return;
    setCourtOptions(candidates.map((label, index) => ({ id: `destination-${index}`, label })));
    setCourtVotes([]);
    setCourtConfirmed(false);
    setCourtDecision(null);
    openCourt('upload', 'lobby', 'case');
  }

  function copyExploreTrip(trip: CommunityTripItem) {
    const destinationFromTitle = trip.title.match(/tokyo|kyoto|osaka|jeju/i)?.[0];
    const reference: TripReference = {
      destination: trip.destination ?? (destinationFromTitle ? destinationFromTitle[0].toUpperCase() + destinationFromTitle.slice(1).toLowerCase() : 'Tokyo'),
      tripVibe: trip.highlights?.slice(0, 2).join(' + ') ?? trip.title.replace(/^[^:]+:\s*/, ''),
      budget: Number((trip.budget ?? '').replace(/[^0-9]/g, '')) || (trip.id === 2 ? 850 : 1400),
      title: trip.title,
    };
    setTripSetupReference(reference);
    setDestination(reference.destination);
    setTripInputs(current => ({ ...current, tripVibe: reference.tripVibe }));
    setSoloBudgetTotal(reference.budget);
    setGroupBudgetTotal(reference.budget);
    setTripCreated(false);
    setTripPhase('planning');
    setItineraryOrder([]);
    setTripSetupModeChoice(true);
    setTab('trips');
    setTripWorkspaceOpen(true);
    setDrawer('tripSetup');
  }

  function startReferenceTrip(modeChoice: TripMode) {
    setMode(modeChoice);
    setTripSetupModeChoice(false);
    if (modeChoice === 'solo') setTripSetupStep(3);
    else setGroupSetupStep(4);
  }

  function runTripSetupRecommendation() {
    const suggestedDestination = /kyoto/i.test(tripSetupPrompt) ? 'Kyoto' : /osaka/i.test(tripSetupPrompt) ? 'Osaka' : /tokyo/i.test(tripSetupPrompt) ? 'Tokyo' : 'Tokyo';
    setDestination(suggestedDestination);
    setRecommendations(current => makeRecommendations(suggestedDestination, tingoDimensions, current));
  }

  function parseTripSetupLink() {
    if (!tripSetupLink.trim()) return;
    setTripSetupLinkStatus('parsing');
    window.setTimeout(() => {
      const suggestedDestination = /kyoto/i.test(tripSetupLink) ? 'Kyoto' : /osaka/i.test(tripSetupLink) ? 'Osaka' : 'Tokyo';
      setDestination(suggestedDestination);
      setTripSetupLinkStatus('ready');
    }, 450);
  }

  function renderTrips() {
    const tripIsActive = tripLifecycleStatus === 'active' || tripLifecycleStatus === 'ongoing';
    const statusLabel = tripLifecycleStatus === 'planning' ? 'PLANNING' : tripLifecycleStatus === 'active' ? 'ACTIVE' : tripLifecycleStatus === 'ongoing' ? 'ONGOING' : 'COMPLETED';
    return <>
      <SectionTitle kicker="TRIPS · YOUR NOTEBOOK" title="Keep the trip in view." copy="Planning, traveling, and remembering all belong to the same journey." />
      <button className="new-trip-link" onClick={startNewTrip}>+ Start a new trip</button>
      <section className={`trip-card ${tripIsActive ? 'active-trip' : 'planning-trip'} paper-sheet`}><div className="trip-card-art"><span>COCOCRUNCH</span><b>{destination}</b><small>{tripIntent.dates ? `${tripIntent.dates.start}–${tripIntent.dates.end}` : 'Dates to be confirmed'} · {travellerCount} travellers</small><i>✦</i></div><div className="trip-card-body"><div className="trip-card-heading"><div><span>{statusLabel}</span><h3>{destination} · slow food + small discoveries</h3></div><b>{planHealth.overall}</b></div><div className="trip-phase-preview"><span className={tripLifecycleStatus === 'planning' ? 'active' : ''}>Planning</span><span className={tripLifecycleStatus === 'active' ? 'active' : ''}>Active</span><span className={tripLifecycleStatus === 'ongoing' ? 'active' : ''}>Ongoing</span></div><p>{tripLifecycleStatus === 'planning' ? 'Finish setup and confirm to make this trip active.' : `Today: ${tripInputs.mustGo} · one open pocket`}</p><button className="primary" onClick={openTrip}>{tripLifecycleStatus === 'planning' ? 'Continue planning' : 'Open trip'} <ChevronRight size={16} /></button></div></section>
      <section className="trip-packing-summary cc-card" aria-label="Packing summary"><div><span>PACKING</span><h3>Packing summary</h3><p>14 / 20 items packed</p></div><button className="primary" onClick={openPacking}>Open list <ChevronRight size={16} /></button></section>
      <section className="trip-list"><div className="section-rule"><span>OTHER TRIPS</span><button onClick={() => setTab('explore')}>Find inspiration <ChevronRight size={14} /></button></div><article className="trip-list-row"><div className="trip-thumb sea-thumb" /><div><b>Jeju · salt air and citrus</b><small>Completed · 5 days · shared privately</small></div><button onClick={openTrip} aria-label="Open Jeju trip"><ChevronRight size={17} /></button></article><article className="trip-list-row"><div className="trip-thumb blue-thumb" /><div><b>Kyoto · temple mornings</b><small>Draft · solo · 3 anchor ideas</small></div><button onClick={openTrip} aria-label="Open Kyoto trip"><ChevronRight size={17} /></button></article></section>
      <section className="trip-footer-note"><Coco tiny mood="happy" context="travel" /><div><b>Every trip gets a little wiser.</b><small>Reviews and category-level actual spend feed back into your private Tingo Card.</small></div></section>
    </>;
  }

  function renderExplore() {
    const ownPublicTrip = buildPublicCommunityTrip({ published, id: 999, title: `${destination} · my CocoCrunch trip`, author: onboardingName || 'You', destination, artifacts: photoMemoryArtifacts });
    return <ExploreScreen
      activeTripDestination={destination}
      mode={mode}
      tingoBehavior={tingoBehavior}
      tingoDimensions={tingoDimensions}
      placeRecommendations={recommendations}
      onSavePlace={(id) => toggleRecommendation(id, 'save')}
      onAddPlace={(id) => toggleRecommendation(id, 'add')}
      communityTrips={ownPublicTrip ? [...communityTrips, ownPublicTrip] : communityTrips}
      onToggleSaveCommunityTrip={(id) => setCommunityTrips(items => items.map(item => item.id === id ? { ...item, saved: !item.saved } : item))}
      onCopyCommunityTrip={copyExploreTrip}
      savedIdeas={ritualRecords.savedIdeas}
      onOpenTripPlanning={openTrip}
      onSearchPlaces={(dest) => {
        setExploreDestination(dest);
        setRecommendations(makeRecommendations(dest, tingoDimensions, recommendations));
        setDestinationSearched(true);
      }}
    />;
  }

  function renderGlobalMemories() {
    return <div className="memories-screen">
      <SectionTitle kicker="MEMORIES · YOUR ARCHIVE" title="The trips that stayed with you." copy="Private by default. Start with the review, then keep the decisions, detours, and tiny wins close." />
      <MemoryArchiveGuide onOpenTrip={openTrip} />
      <section className="memory-archive-feature paper-sheet"><div className="archive-photo"><span>OCT 2026</span><b>{destination}</b></div><div><span>LAST TRIP · {worthIt ? (worthIt === 'yes' ? 'Worth it' : worthIt === 'mixed' ? 'Mixed' : 'Not really') : 'Not reviewed'}</span><h3>{outcomeReviewed ? 'Your recorded outcome is ready to revisit.' : 'The retrospective starts with what actually happened.'}</h3><p>{photoImport ? `${importPhotoMetadata().imported} local metadata entries` : 'No photo metadata recorded'} · {decisionHistory.length} decisions · RM {spent} actual</p><button className="primary" onClick={openTrip}>Open trip workspace <ChevronRight size={16} /></button></div></section>
      <div className="explore-section-heading"><span>KEEPSAKE SHELF</span><span className="quiet-note">Only you can see these</span></div><section className="keepsake-grid"><article><span>PHOTO MAP</span><b>{photoImport ? `${importPhotoMetadata().grouped} areas` : 'Not indexed'}</b><small>{photoImport ? 'Local metadata only' : 'Available after explicit review'}</small></article><article><span>FUTURE POSTCARD</span><b>{postcardSealed ? '1 sealed' : 'Not sealed'}</b><small>{postcardSealed ? 'Waiting for your next trip' : 'Write after the review loop'}</small></article><article><span>GHOST WISHES</span><b>{ghostWishes.length} remembered</b><small>Some plans can come back</small></article></section>
      <section className="community-entry"><div><span>COMMUNITY</span><b>{published ? 'Published with consent' : 'Private by default'}</b><small>Nothing becomes public without an explicit action.</small></div><button onClick={() => setDrawer('community')}>Manage</button></section>
    </div>;
  }

  function renderTripWorkspace() {
    return <>
      <TripWorkspaceHeader destination={destination} mode={mode} travellerCount={travellerCount} planHealth={planHealth.overall} onBack={openTripsIndex} />
      <TripLifecycleTabs status={tripLifecycleStatus} />
      <TripWorkspaceContext phase={workspacePhase} onExit={openTripsIndex} />
      <TripJourneyStatus state={journeyState} destination={destination} onAction={handleJourneyAction} />
      <JourneyProgress destination={destination} currentPhase={workspacePhase} nextActionLabel={journeyState.nextAction?.label} />
      {workspacePhase === 'planning' ? renderPlan() : workspacePhase === 'traveling' ? renderDuring() : renderMemories()}
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
      { id: 'budget', label: 'Budget planner', note: `RM ${planned} planned of RM ${budgetTotal}`, visible: true, onOpen: () => setDrawer('budget') },
      { id: 'discover', label: 'Find places', note: `Tingo-ranked · ${tingoBehavior.recommendationBias} bias`, visible: true, onOpen: () => setDrawer('discover') },
      { id: 'compare', label: 'Compare options', note: 'Deterministic price + deal adapter', visible: true, onOpen: () => setDrawer('compare') },
      { id: 'backup', label: 'Backup Plan pool', note: `${backupPool.filter(item => item.viable && item.dealBreakerSafe).length} viable candidates`, visible: backupPool.length > 0, onOpen: () => setDrawer('backup') },
    ];
    return <div className="planning-screen">
      <SectionTitle kicker="PLAN · TRAVEL NOTEBOOK" title="Build a plan that can bend." copy="Keep the important things firm. Let the rest breathe." />
      <WeatherGlance destination={destination} compact />
      {!tripCreated && <section className="setup-banner"><div><span>NEW TRIP</span><b>Give this journey a home before Coco plans it.</b><small>Destination, people, vibe, constraints, then a reviewable plan.</small></div><button className="primary" onClick={() => setDrawer('tripSetup')}>Set up trip <ChevronRight size={15} /></button></section>}
      <section className="planning-brief">
        <section className="trip-intent-summary paper-sheet"><div><span>TRIP DETAILS</span><h3>{tripInputs.tripVibe || 'A shape is still forming.'}</h3><p>Must-Go: {tripInputs.mustGo || 'not set'} · Deal breaker: {tripInputs.dealBreaker || 'not set'}</p><small>Preference: {tripInputs.preference || 'optional'} · Flexible: {tripInputs.flexible || 'not set'} · Budget: RM {budgetTotal}</small></div></section>
        {mode === 'group' && <section className="group-signal-summary paper-sheet"><div><span>GROUP DETAILS</span><h3>{groupDNA.conflicts.length ? `${groupDNA.conflicts.length} decision${groupDNA.conflicts.length === 1 ? '' : 's'} remain visible.` : 'Shared signals are explicit, not averaged.'}</h3><p>{groupDNA.sharedPriorities[0]?.label ?? 'No shared priority yet'} · {groupDNA.budgetSensitivity} budget sensitivity</p></div><button className="secondary" onClick={() => setDrawer('group')}>Open people <ChevronRight size={14} /></button></section>}
      </section>
      <section className="trip-plan-intent-fields paper-sheet"><span>EDIT PLAN</span><h3>Protect what matters, then leave room to move.</h3><div className="setup-fields"><label><span>Must-Go anchor</span><input value={tripInputs.mustGo} onChange={event => setTripInputField('mustGo', event.target.value)} /></label><label><span>Deal breaker</span><input value={tripInputs.dealBreaker} onChange={event => setTripInputField('dealBreaker', event.target.value)} /></label><label><span>Preference</span><input value={tripInputs.preference} onChange={event => setTripInputField('preference', event.target.value)} /></label><label><span>Flexible</span><input value={tripInputs.flexible} onChange={event => setTripInputField('flexible', event.target.value)} /></label></div></section>
      <details className="trip-add-menu"><summary aria-label="Add to trip">+</summary><div><button onClick={() => setDrawer('flight')}>Flight</button><button onClick={() => setDrawer('accommodation')}>Accommodation</button><button onClick={() => setDrawer(null)}>Plan</button></div></details>
      {mode === 'group' && <section className="conflict-ticket"><span>{courtConfirmed ? 'COURT DECISION RECORDED' : 'UNRESOLVED CONFLICT'}</span><b>{activeConflict}</b><small>{first?.label ?? 'Option A'} {firstCount} · {second?.label ?? 'Option B'} {secondCount} · {tally.tied ? 'tie · Gacha is eligible' : `${optionLabel(tally.majority)} has majority`}</small><button className="ritual-trigger" onClick={() => openCourt()}>{courtConfirmed ? 'Review Group Court' : 'Open Group Court'} <Gavel size={18} /></button></section>}
      {mode === 'group' && <GroupChannel messages={groupChannelMessages} unreadCount={groupCourtUnreadCount} onMarkRead={() => setGroupCourtUnreadCount(0)} onSend={text => setGroupChannelMessages(messages => [...messages, { id: `message-${Date.now()}`, author: onboardingName || 'You', text, createdAt: 'Now' }])} />}
      <div className="planning-plan">
        <div className="planning-itinerary-primary">
          <TripPlanOverview plan={visibleTripPlan} planHealth={planHealth} tripIntent={tripIntent} onOpenWhy={setPlanWhyItemId} onOpenHealth={() => setDrawer('feasibility')} onReorder={setItineraryOrder} mapSource={recommendations.some(place => place.source === 'prototype-catalog') ? 'prototype-catalog' : 'unavailable'} mapCandidates={recommendations.slice(0, 4).map(place => ({ id: `recommendation-${place.id}`, name: place.name, source: place.source }))} />
          {selectedWhyItem && <section className="why-note"><Sparkles size={19} /><div><b>Why this? · {selectedWhyItem.name}</b><p><RecommendationEvidenceText evidence={selectedWhyItem.evidence} /></p></div><button className="secondary" onClick={() => setPlanWhyItemId(null)}>Close</button></section>}
        </div>
        <section className="plan-health"><div className="section-rule"><span>PLAN HEALTH</span><button onClick={() => setDrawer('feasibility')}>Run checks <ChevronRight size={14} /></button></div><div className="health-score"><b>{planHealth.overall}</b><span><strong>{planHealth.overall >= 80 ? 'Healthy with watch items shown' : planHealth.overall >= 60 ? 'Usable with meaningful watch items' : 'Needs a planning decision'}</strong><small>{planHealth.reasons[0] ?? 'No current risk deductions; inputs fit the generated structure.'}</small></span></div><div className="health-metrics"><span>Walk <b>{planHealth.metrics.walkingKm.toFixed(1)} km</b></span><span>Pressure <b>{planHealth.metrics.timePressureMinutes} min</b></span><span>Budget <b>{planHealth.metrics.budgetOverrun ? `RM ${planHealth.metrics.budgetOverrun} over` : 'Within cap'}</b></span><span>Transfer <b>{planHealth.metrics.transferMinutes} min</b></span><span>Anchors <b>{planHealth.metrics.protectedAnchors} protected</b></span><span>Risks <b>{planHealth.metrics.unresolvedRisks}</b></span></div></section>
      </div>
      <details className="secondary-launcher"><summary>Plan details & tools</summary><ContextualToolList tools={planTools} /></details>
      <section className="ready-to-go-card paper-sheet"><div><span>READY TO GO</span><h3>{readyConfirmed ? 'This plan is ready to continue.' : 'Review the joins before you go.'}</h3><p>{readyConfirmed ? 'You can still inspect the workspace and change course when reality changes.' : 'Coco will show the current risks; confirmation stays yours.'}</p></div><button className="primary" onClick={() => setDrawer('feasibility')}>{readyConfirmed ? 'Review readiness' : 'Confirm Ready to Go'} <ChevronRight size={15} /></button></section>
    </div>;
  }

  function renderDuring() {
    const anchorItem = visibleTripPlan.items.find(item => item.kind === 'anchor');
    const floatingItem = visibleTripPlan.items.find(item => item.kind === 'floating');
    return <>
      <SectionTitle kicker="DURING · LIVE TRIP" title={delay ? 'Reality changed.' : 'The trip is moving.'} copy="Coco watches the plan, not your every step." />
      <WeatherGlance destination={destination} compact />
      <TodayTimeline items={visibleTripPlan.items} delay={delay} arrivalChecked={arrivalChecked} appliedRepair={replanApplied} completedItemIds={completedTodayItemIds} onToggleComplete={id => setCompletedTodayItemIds(current => current.includes(id) ? current.filter(itemId => itemId !== id) : [...current, id])} />
      <TripConditions delay={delay} failedItemName={failedPlanItem?.name} repairAvailable={Boolean(repairPreview?.applicable)} repairStrategy={repairPreview?.strategy} automaticDeviationDetected={automaticDeviationPrompted} onSimulateDisruption={() => { setDelay(true); setReplanPreview(false); setAppliedRepair(null); setReplanApplied(false); setEmergencyApproved(false); }} />
      {delay && !replanApplied && <section className="disruption-stage"><div className="disruption-head"><CloudRain size={26} /><div><span>PLAN UPDATE</span><b>{failedPlanItem?.timeLabel ?? 'Current'} {failedPlanItem?.name ?? 'item'} no longer fits today.</b><small>Demo condition · not a live weather alert.</small></div></div>{!replanPreview ? <><div className="ghost-suggestion"><span>SUGGESTED CHANGE</span><b>{repairPreview?.replacement?.name ?? (repairPreview?.strategy === 'open-recovery' ? 'Leave this time open for recovery' : 'No safe repair available')}</b><small>{repairPreview?.replacement ? `${repairPreview.replacement.support} supporters · ${repairPreview.impact.costDelta >= 0 ? '+' : ''}RM${repairPreview.impact.costDelta} · ${repairPreview.impact.timeDeltaMinutes >= 0 ? '+' : ''}${repairPreview.impact.timeDeltaMinutes} min` : repairPreview?.strategy === 'open-recovery' ? 'No direct Backup candidate; recovery time can protect the anchor.' : repairPreview?.reasons[repairPreview.reasons.length - 1] ?? 'No repair result available.'}</small></div><button className="primary" disabled={!repairPreview?.applicable} onClick={() => setReplanPreview(true)}>Review the change</button></> : <><div className="repair-impact-head"><span>REVIEW CHANGES</span><b>Protect what matters, soften the rest.</b></div><div className="repair-diff"><div><span>KEEP</span><b>{tripInputs.mustGo || anchorItem?.name || 'Must-Go anchor'}</b><small>Protected before flexible blocks move.</small></div><div><span>CHANGE</span><b>{repairPreview?.replacement?.name ?? (repairPreview?.strategy === 'open-recovery' ? 'Recovery time' : 'No replacement')}</b><small>{repairPreview?.replacement ? `${repairPreview.replacement.support} supporters` : 'No direct Backup candidate is required for recovery time.'}</small></div><div><span>IMPACT</span><b>{repairPreview ? `${repairPreview.impact.costDelta >= 0 ? '+' : ''}RM${repairPreview.impact.costDelta} · ${repairPreview.impact.timeDeltaMinutes >= 0 ? '+' : ''}${repairPreview.impact.timeDeltaMinutes} min` : 'No computed impact'}</b><small>Calculated from the repair result.</small></div></div><div className="change-ticket">{repairPreview?.preview.map(line => <div key={line}><span>PLAN UPDATE</span><b>{line}</b></div>)}</div>{repairPreview?.reasons.map(reason => <small className="adapter-note" key={reason}>{reason}</small>)}{mode === 'group' && repairPreview?.requiresGroupConfirmation && <div className="emergency-court"><span>GROUP APPROVAL</span><b>{emergencyApproved ? 'Approved for this repair' : 'Group approval required'}</b><button onClick={() => setEmergencyApproved(true)}>{emergencyApproved ? '✓ Approved' : 'Simulate group approval'}</button></div>}<div className="action-row"><button className="secondary" onClick={() => setReplanPreview(false)}>Not now</button><button className="primary" disabled={!repairPreview?.applicable || (repairPreview.requiresGroupConfirmation && !emergencyApproved)} onClick={applyRepair}>Apply repair</button></div></>}</section>}
      {replanApplied && <section className="success-note"><Check size={21} /><div><b>Plan repaired.</b><small>{appliedRepair?.preview.join(' · ')} · undo available</small></div><button onClick={undoRepair}>Undo</button></section>}
      <section className="arrival-check"><div><span>PROGRESS CHECK</span><b>{arrivalChecked ? `Arrived at ${anchorItem?.name ?? 'the anchor'}.` : `Has the group reached ${anchorItem?.name ?? 'the morning anchor'}?`}</b><small>Manual check-in is always available; location permission is not required.</small></div><button onClick={() => setArrivalChecked(!arrivalChecked)}>{arrivalChecked ? 'Undo check-in' : 'Mark arrived'}</button></section>
      <section className="energy-check"><span>HOW’S THE GROUP?</span><div>{(['great', 'okay', 'tired'] as const).map(value => <button key={value} className={mood === value ? 'active' : ''} onClick={() => setMood(value)}>{value === 'great' ? '⚡ Great' : value === 'okay' ? '🙂 Okay' : '🥱 Tired'}</button>)}</div>{mood === 'tired' && <small>Coco suggests dropping one floating item and adding 45 min rest. Anchors stay untouched.</small>}</section>
      {mode === 'group' && <section className="heartbeat"><span>GROUP HEARTBEAT</span><b>{delay ? 'Needs a decision' : split ? 'Can reunite on time' : arrivalChecked ? 'Together at the anchor' : 'Status check pending'}</b><small>Only shared status is shown. Exact group coordinates stay hidden by default.</small></section>}
      {mode === 'group' && <GroupSplit members={members} value={groupSplitPlan} active={split} onChange={setGroupSplitPlan} onRequest={() => openGovernedAction('split-on')} onRequestReunion={() => openGovernedAction('split-off')} />}
      <details className="during-tools secondary-launcher"><summary>More tools · sharing, reunion, safety & play</summary><div className="contextual-section-heading"><span>WHEN YOU NEED A HAND</span><small>These tools stay secondary to Today, conditions, and repair.</small></div><div className="during-tool-group"><span className="tool-group-label">SHARE & SAFETY</span><MiniTool icon={Send} label="Family Window" note={reported ? 'Latest reassurance sent' : 'Reassurance, not surveillance'} onClick={() => setDrawer('family')} /><MiniTool icon={MapPin} label="Location privacy" note="Permission and provider boundary" onClick={() => setDrawer('location')} /><MiniTool icon={Users} label="Reunion agreement" note={`${reunion.place} · ${reunion.time} · ±${reunion.tolerance} min`} onClick={() => setDrawer('commitments')} /><MiniTool icon={Heart} label="Safety + local help" note="Prototype contact and nearby useful info" onClick={() => setDrawer('safety')} /><MiniTool icon={Image} label="Photo pin + memory" note="Local metadata prototype; no upload" onClick={() => setDrawer('import')} /></div><div className="during-tool-group"><span className="tool-group-label">EXPLAIN & PLAY</span><MiniTool icon={Sparkles} label="Ask Coco" note={assistantApplied ? 'Suggestion applied · undo available' : 'Read-only until you confirm'} onClick={() => setDrawer('assistant')} /><MiniTool icon={Sparkles} label="Everyday Gacha" note="Real choice · never governance" onClick={() => setDrawer('gacha')} /><MiniTool icon={Sparkles} label="Lucky Draw" note="Entertainment only · isolated from decisions" onClick={() => setDrawer('lucky')} /></div></details>
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
        liveRoute={{
          currentLocation: browserLocation ? 'Current browser location' : browserLocationError ?? 'Location permission is being requested',
          target: floatingItem?.name ?? anchorItem?.name ?? 'Next saved stop',
          eta: arrivalChecked ? 'ETA 12 min' : 'ETA needs a check-in',
          timelineLabel: arrivalChecked ? 'Timeline is progressing' : 'Mark arrival to advance the local route',
          weatherLabel: 'Weather refreshes in the panel above · Open-Meteo',
          coordinates: browserLocation ?? undefined,
          locationStatus: browserLocation ? 'live' : 'unavailable',
        }}
        servicePins={[
          { id: 'hospital', label: 'Hospital', kind: 'hospital', query: `hospital near ${destination}` },
          { id: 'pharmacy', label: 'Pharmacy', kind: 'pharmacy', query: `pharmacy near ${destination}` },
          { id: 'luggage', label: 'Luggage', kind: 'luggage', query: `luggage storage near ${destination}` },
        ]}
        photoPins={photoMemoryArtifacts}
        overlay={<Coco tiny mood={delay ? 'panic' : 'happy'} context="travel" />}
      />
    </>;
  }

  function renderMemories() {
    const keepsakes = [
      ...decisionHistory.map(record => ({ id: record.id, title: record.topic, body: record.decision, source: `Recorded ${record.kind} decision · ${record.createdAt}` })),
      ...photoMemoryArtifacts,
      ...(ritualRecords.authoredMemoryNote ? [{ id: 'authored-note', title: 'My memory note', body: ritualRecords.authoredMemoryNote, source: 'Explicitly saved personal note' }] : []),
    ];
    const photoMetadata = photoImport ? importPhotoMetadata() : null;
    return <div className="completed-screen">
      <SectionTitle kicker="COMPLETED" title={`${destination}, kept close.`} copy={tripIntent.dates ? `${tripIntent.dates.start}–${tripIntent.dates.end}` : 'Trip dates were not recorded.'} />
      <section className="completed-nutshell paper-sheet"><h3>{outcomeReviewed ? actualPaceCopy : 'No actual outcome has been recorded yet.'}</h3><div><small>{spent > 0 ? `RM ${spent} recorded spend` : 'No spend recorded'}</small><small>{decisionHistory.length ? `${decisionHistory.length} recorded decision${decisionHistory.length === 1 ? '' : 's'}` : 'No recorded decisions'}</small><small>{keepsakes.length ? `${keepsakes.length} kept memor${keepsakes.length === 1 ? 'y' : 'ies'}` : 'No memories kept yet'}</small></div></section>
      <section className="completed-learning-loop">
        <TripRetrospective actualSummary={{ pace: actualPaceCopy, spent, decisions: decisionHistory.length, outcomeRecorded: outcomeReviewed }} worthIt={worthIt} proposal={learningProposal} learningConfirmed={profileLearned} showMemoryAction={false} onRecordReflection={recordWorthIt} onBuildProposal={() => { if (worthIt) buildCurrentLearningProposal(worthIt); }} onConfirmLearning={confirmLearning} onDismissLearning={dismissLearning} onOpenMemory={() => { if (expressiveAvailable) setTrunkRequest(value => value + 1); }} />
      </section>
      <CompletedKeepLauncher active={completedPanel} onOpen={panel => setCompletedPanel(current => current === panel ? null : panel)} />
      {completedPanel && <section className="completed-progressive" aria-label={`${completedPanel} details`}>
        <button className="completed-progressive-close" onClick={() => setCompletedPanel(null)}>Close details</button>
        {completedPanel === 'trunk' && <><MemoryTrunk artifacts={keepsakes} available={expressiveAvailable} openRequested={trunkRequest} />{expressiveAvailable && <><section className="memory-note-card"><div><span>MEMORY NOTE</span><b>Keep your own words.</b></div><textarea value={memoryNote} onChange={e => setMemoryNote(e.target.value)} aria-label="Memory note" /><button onClick={() => { const ok = commitRitualState({ authoredMemoryNote: memoryNote }); setMemorySaveError(!ok); if (ok) setRitualRecords(loadRitualState()); }}>Save note to trunk</button>{memorySaveError && <p role="alert">Could not save this note. Please retry.</p>}<small>Private, explicitly authored memory. No generated travel story.</small></section><button className="memory-card-trigger" onClick={() => setDrawer('memoryCard')}><span>MEMORY STICKER CARD</span><b>Make one moment collectible <ChevronRight size={15} /></b></button></>}</>}
        {completedPanel === 'photo' && <><PhotoJournalCapture destination={destination} onIndex={() => { setPhotoIndexed(true); setPhotoImport(true); }} /><PhotoArchiveTimeline artifacts={photoMemoryArtifacts} plan={visibleTripPlan} onPrivacyChange={(id, isPublic) => setPhotoMemoryArtifacts(items => items.map(item => item.id === id ? { ...item, isPublic } : item))} /><section className="memory-actions"><button onClick={() => { setPhotoIndexed(true); setPhotoImport(true); }}><Map size={20} /><span><b>Photo Map</b><small>{photoIndexed ? `${importPhotoMetadata().imported} photos indexed · ${importPhotoMetadata().grouped} areas` : 'Index local photo metadata'}</small></span></button></section>{photoImport && <section className="adapter-note"><b>Metadata adapter complete.</b><small>{photoMetadata?.note}</small></section>}<TripSpatialView mode="completed" destination={destination} source={photoMetadata ? 'photo-metadata' : 'local-schematic'} plan={visibleTripPlan} photoSummary={photoMetadata ? { imported: photoMetadata.imported, grouped: photoMetadata.grouped, note: photoMetadata.note } : undefined} /></>}
        {completedPanel === 'ghost' && expressiveAvailable && <section className="ghost-wish"><span>GHOST WISH CEMETERY</span><h3>Retained prototype Ghost Wishes.</h3>{ghostWishes.map(wish => <div className={`ghost-wish-row ${wish.status}`} key={wish.id}><div><b>{wish.name}</b><small>{wish.reason}</small><em>{wish.status === 'resting' ? 'Still remembered' : wish.status === 'revived' ? 'Revived for review · viability not assessed' : 'Released, history kept'}</em></div>{wish.status !== 'released' && <div>{wish.status === 'resting' && <button onClick={() => { const next = ghostWishes.filter(item => item.status === 'revived').map(item => item.id); if (commitRitualState({ revivedWishIds: [...new Set([...next, wish.id])] })) { setRitualRecords(loadRitualState()); setGhostWishes(items => items.map(item => item.id === wish.id ? { ...item, status: 'revived' } : item)); } }}>Revive</button>}<button onClick={() => emitExperience({ type: 'release-wish', name: wish.name, reason: wish.reason, commit: () => { const current = loadRitualState(); if (!commitRitualState({ releasedWishIds: [...new Set([...(current.releasedWishIds ?? []), wish.id])], revivedWishIds: (current.revivedWishIds ?? []).filter(id => id !== wish.id) })) return false; setRitualRecords(loadRitualState()); setGhostWishes(items => items.map(item => item.id === wish.id ? { ...item, status: 'released' } : item)); return true; } })}>超度行程</button></div>}</div>)}</section>}
        {completedPanel === 'ghost' && !expressiveAvailable && <p>Complete the reflection and learning handoff before opening Ghost Wishes.</p>}
        {completedPanel === 'postcard' && expressiveAvailable && <section className="future-postcard"><span>FUTURE POSTCARD</span><h3>To your next-trip self.</h3>{postcardSealed ? <div className="sealed-postcard"><b>✉ Sealed for the next trip</b><button onClick={() => setPostcardSealed(false)}>Reopen</button></div> : <><textarea value={futurePostcard} onChange={e => setFuturePostcard(e.target.value)} /><button className="primary" onClick={() => setPostcardSealed(true)}>Seal postcard</button></>}</section>}
        {completedPanel === 'postcard' && !expressiveAvailable && <p>Complete the reflection and learning handoff before opening the Future Postcard.</p>}
        {completedPanel === 'recap' && <><CompletedLearningGuide /><section className="review-items"><div className="section-rule"><span>HOW EACH STOP FELT</span><span className="quiet-note">Feeds future recommendations</span></div>{[['anchor', tripInputs.mustGo], ['cafe', 'Scenic café block']].map(([id, label]) => <div className="review-item" key={id}><div><b>{label}</b><small>Recorded stop review</small></div><div className="rating-row">{(['worth', 'mixed', 'skip'] as const).map(value => <button key={value} className={itemReviews[id] === value ? 'active' : ''} onClick={() => setItemReviews(current => ({ ...current, [id]: value }))}>{value === 'worth' ? 'Worth it' : value === 'mixed' ? 'Mixed' : 'Skip next time'}</button>)}</div></div>)}</section><section className="review-ledger paper-sheet"><div><span>Budget vs actual</span><b>RM {spent} spent</b><small>RM {remaining} remaining</small></div><div><span>Decisions</span><b>{decisionHistory.length} recorded</b><small>{decisionHistory[0] ? `${decisionHistory[0].topic} · ${decisionHistory[0].decision}` : 'No Court history yet'}</small></div></section>{decisionHistory.length > 0 && <section className="review-items"><div className="section-rule"><span>DECISION HISTORY · SATISFACTION</span></div>{decisionHistory.map(record => <div className="review-item" key={record.id}><div><b>{record.topic}</b><small>{record.decision}</small></div><div className="rating-row">{(['worth', 'mixed', 'skip'] as const).map(value => <button key={value} className={record.satisfaction === value ? 'active' : ''} onClick={() => rateDecisionRecord(record.id, value)}>{value}</button>)}</div></div>)}</section>}<section className="compare-ledger"><span>CATEGORY BUDGET · PLANNED VS ACTUAL</span>{categoryVariance.map(item => <div key={item.category}><b>{item.category}</b><i className={item.status === 'over' ? 'actual' : ''} /><small>RM {item.planned} planned · RM {item.actual} actual · {item.status}</small></div>)}{budgetLearningNotes.length > 0 && <p>{budgetLearningNotes.join(' ')}</p>}</section><section className="compare-ledger"><span>PACE · PLANNED VS ACTUAL</span><div><b>Planned</b><i /><small>{tingoBehavior.itineraryDensity} · {tingoBehavior.dailyStops} stops/day · {tingoBehavior.bufferMinutes} min buffers</small></div><div><b>Actual</b><i className="actual" /><small>{actualPaceCopy}</small></div></section><section className="community-entry"><div><span>COMMUNITY</span><b>{published ? 'Published with consent' : 'Private by default'}</b><small>Nothing becomes public without an explicit action.</small></div><button onClick={() => setDrawer('community')}>Open</button></section><button className="secondary" onClick={() => setJournalGenerated(true)}><BookOpen size={18} />{journalGenerated ? 'Regenerate travel journal draft' : 'Generate travel journal draft'}</button>{journalGenerated && <section className="postcard-note"><span>{destination.toUpperCase()}</span><p>Draft from recorded timeline and trip data. Edit before saving.</p><small>Prototype draft · not an inferred factual travel story</small></section>}</>}
      </section>}
    </div>;
  }

  function SuitcaseGraphic() {
    return (
      <svg viewBox="0 0 100 85" className="me-suitcase-svg" aria-hidden="true">
        <path d="M12,18 L14,14 L18,16 L14,18 L12,22 L10,18 L6,16 L10,14 Z" fill="#f6a83e" opacity="0.8" />
        <path d="M88,14 L90,11 L93,12 L90,14 L91,17 L89,14 L86,13 L89,11 Z" fill="#f6a83e" opacity="0.8" />
        <path d="M8,70 L9,68 L11,69 L9,70 L10,72 L8,71 L7,70 L8,68 Z" fill="#f6a83e" opacity="0.7" />
        <path d="M92,62 L93,60 L95,61 L93,62 L94,64 L92,63 L91,62 L92,60 Z" fill="#f6a83e" opacity="0.7" />

        <ellipse cx="50" cy="80" rx="42" ry="4" fill="rgba(20, 40, 80, 0.15)" />

        <rect x="12" y="24" width="76" height="52" rx="8" fill="#8d5b36" stroke="#683d1c" strokeWidth="1.5" />
        <rect x="14" y="26" width="72" height="48" rx="6" fill="#a46d43" />

        <path d="M12,34 L22,24 L12,24 Z" fill="#583115" />
        <path d="M88,34 L78,24 L88,24 Z" fill="#583115" />
        <path d="M12,66 L22,76 L12,76 Z" fill="#583115" />
        <path d="M88,66 L78,76 L88,76 Z" fill="#583115" />
        <circle cx="15" cy="27" r="1" fill="#dfad5c" />
        <circle cx="85" cy="27" r="1" fill="#dfad5c" />
        <circle cx="15" cy="73" r="1" fill="#dfad5c" />
        <circle cx="85" cy="73" r="1" fill="#dfad5c" />

        <rect x="28" y="24" width="7" height="52" fill="#583115" />
        <rect x="65" y="24" width="7" height="52" fill="#583115" />
        <rect x="27" y="44" width="9" height="6" rx="1.5" fill="#dfad5c" stroke="#8d5b36" strokeWidth="0.8" />
        <rect x="64" y="44" width="9" height="6" rx="1.5" fill="#dfad5c" stroke="#8d5b36" strokeWidth="0.8" />

        <path d="M40,24 C40,16 60,16 60,24" fill="none" stroke="#583115" strokeWidth="4" strokeLinecap="round" />
        <rect x="38" y="21" width="5" height="4" rx="1" fill="#dfad5c" />
        <rect x="57" y="21" width="5" height="4" rx="1" fill="#dfad5c" />

        <g transform="translate(42, 32) rotate(-5)">
          <rect x="0" y="0" width="16" height="15" rx="3" fill="#ffffff" />
          <rect x="1" y="1" width="14" height="13" rx="2" fill="#1b72e8" />
          <path d="M2,11 Q5,7 9,9 Q13,11 14,8 L14,13 L2,13 Z" fill="#ffffff" />
          <circle cx="12" cy="4" r="1.5" fill="#fdd835" />
        </g>

        <g transform="translate(16, 44) rotate(4)">
          <rect x="0" y="0" width="16" height="18" rx="3" fill="#ffffff" />
          <rect x="1" y="1" width="14" height="16" rx="2" fill="#f8fafc" />
          <path d="M5,15 Q8,10 8,6" stroke="#8d5b36" strokeWidth="1.5" fill="none" />
          <path d="M8,6 Q5,3 2,5" stroke="#2e7d32" strokeWidth="1.5" fill="none" />
          <path d="M8,6 Q11,3 14,5" stroke="#2e7d32" strokeWidth="1.5" fill="none" />
          <path d="M8,6 Q8,2 7,1" stroke="#2e7d32" strokeWidth="1.5" fill="none" />
          <ellipse cx="8" cy="14" rx="5" ry="1.5" fill="#f59e0b" opacity="0.6" />
        </g>

        <g transform="translate(45, 54) rotate(-3)">
          <rect x="0" y="0" width="18" height="16" rx="3" fill="#ffffff" />
          <rect x="1" y="1" width="16" height="14" rx="2" fill="#fff7ed" />
          <circle cx="9" cy="8" r="4" fill="#f97316" />
          <polygon points="2,14 7,8 11,14" fill="#0284c7" />
          <polygon points="8,14 12,6 16,14" fill="#0369a1" />
        </g>
      </svg>
    );
  }

  function renderMe() {
    const tingoComplete = tingoCompletion(tingoAnswers) === 100;
    const isAssessed = tingoComplete && tingoRevealed;
    const identity = deriveTingoIdentity(tingoDimensions);
    const currentPersonaKey = personaOverride ?? identity.personaKey;
    const detail = tingoPersonaDetails[currentPersonaKey] ?? tingoPersonaDetails['hidden-gem-seeker'];
    const personaImage = tingoPersonaImages[currentPersonaKey] ?? tingoPersonaImages['hidden-gem-seeker'];
    const typeLabel = detail.label;
    const typeCopy = detail.summary;
    const personaTagline = detail.tagline;
    const personaTags = detail.tags;

    return <div className="me-screen">
      <section className="me-tingo-card redesign-card paper-sheet">
        <svg className="me-card-bg-deco" viewBox="0 0 400 240" preserveAspectRatio="none" fill="none" aria-hidden="true">
          <path d="M220,20 C245,10 290,15 325,30 C350,42 385,25 405,40 C410,60 390,80 370,75 C350,95 325,105 300,88 C280,98 255,85 240,65 C225,50 215,30 220,20 Z" fill="#cbe4fc" opacity="0.65" />
          <path d="M290,105 C315,100 340,115 350,135 C355,155 335,170 315,165 C295,160 285,140 280,125 C275,113 282,107 290,105 Z" fill="#d9ebfb" opacity="0.5" />
          <path d="M120,40 C140,30 170,45 165,65 C160,85 135,95 120,85 C105,75 105,50 120,40 Z" fill="#e2f0fc" opacity="0.5" />
          <path d="M25,215 Q140,180 236,40" stroke="#3b82f6" strokeWidth="1.8" strokeDasharray="4 4" opacity="0.6" fill="none" />
          <g transform="translate(236, 40) rotate(38) scale(0.9)">
            <path d="M0,0 L16,7 L20,5 L12,0 L20,-5 L16,-7 Z" fill="#1d6fd8" />
            <path d="M5,1 L3,9 L7,9 L9,1 Z" fill="#1d6fd8" />
            <path d="M5,-1 L3,-9 L7,-9 L9,-1 Z" fill="#1d6fd8" />
          </g>
        </svg>

        {isAssessed ? (
          <>
            <div className="me-handwritten-note-top">
              <span>Small<br />Places<br />Big Stories</span>
              <span className="sparks">彡</span>
            </div>

            <div className="me-card-copy">
              <span className="me-tingo-kicker">MY TINGO CARD</span>

              <h2>
                You&apos;re a<br />
                {typeLabel === 'Hidden Gem Seeker' ? (
                  <>Hidden Gem<br />Seeker</>
                ) : typeLabel.split(' ').length === 2 ? (
                  <>{typeLabel.split(' ')[0]}<br />{typeLabel.split(' ')[1]}</>
                ) : typeLabel.split(' ').length > 2 ? (
                  <>{typeLabel.split(' ').slice(0, 2).join(' ')}<br />{typeLabel.split(' ').slice(2).join(' ')}</>
                ) : (
                  typeLabel
                )}
              </h2>

              <p>{typeCopy}</p>

              <div className="me-chip-row">
                {personaTags.map(tag => (
                  <small key={tag}>{tag}</small>
                ))}
              </div>

              <div className="me-tingo-actions-col">
                <button className="me-all-types-link" onClick={() => setDrawer('all-personas')}>
                  <Users size={15} />
                  <span>See all 16 travel types</span>
                  <span className="arrow">→</span>
                </button>
                <button className="me-retake-link" onClick={retakeTingo}>
                  <RotateCcw size={13} />
                  <span>Retake assessment</span>
                </button>
              </div>
            </div>

            <div className="me-card-collage">
              <div className="me-floating-mini-card">
                <img className="me-persona-art" src={personaImage} alt={`${typeLabel} illustration`} />
                <span className="me-persona-badge">{typeLabel}</span>
                <small className="me-persona-subtag">{personaTagline}</small>
              </div>

              <button
                className="me-view-profile-btn"
                onClick={() => setDrawer('tingo')}
              >
                <span>View profile</span>
                <span className="arrow">→</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="me-handwritten-note-top">
              <span>Find<br />Your<br />Travel Vibe</span>
              <span className="sparks">✦</span>
            </div>

            <div className="me-card-copy">
              <span className="me-tingo-kicker">DISCOVER YOUR TRAVEL DNA</span>

              <h2>
                What kind of<br />
                traveller are you?
              </h2>

              <p>
                Take our quick 2-minute vibe quiz to unlock your personal Tingo Card, travel rhythm, and tailor-made spot suggestions.
              </p>

              <div className="me-chip-row me-chip-row--unassessed">
                <small>16 TRAVEL TYPES</small>
                <small>SMART MATCH</small>
                <small>UNHURRIED VIBES</small>
              </div>

              <div className="me-tingo-actions-col">
                <button className="me-all-types-link" onClick={() => setDrawer('all-personas')}>
                  <Users size={15} />
                  <span>Explore all 16 personas</span>
                  <span className="arrow">→</span>
                </button>
                <span className="me-quiz-badge-note">
                  <Sparkles size={12} />
                  <span>2 min vibe quiz · No wrong answers</span>
                </span>
              </div>
            </div>

            <div className="me-card-collage">
              <div className="me-floating-mini-card me-floating-mini-card--unassessed">
                <img className="me-persona-art" src={cocoAsset('action-binoculars')} alt="Mystery travel persona" />
                <span className="me-persona-badge">Mystery Persona ✦</span>
                <small className="me-persona-subtag">Waiting to be unlocked ✨</small>
              </div>

              <button
                className="me-view-profile-btn me-start-assessment-btn"
                onClick={retakeTingo}
              >
                <span>Start assessment</span>
                <span className="arrow">→</span>
              </button>
            </div>
          </>
        )}
      </section>

      <section className="me-trip-card redesign-trip paper-sheet">
        <div className="me-trip-hero-section">
          <PostmarkStamp label="JEJU" detail="SOUTH KOREA" />

          <div className="me-good-journeys-note">
            <span>Good<br />Journeys<br />Ahead</span>
            <span className="sparks">彡</span>
            <div className="underline" />
          </div>

          <span className="me-trip-tag-pill">CURRENT TRIP</span>
          <h2>Jeju In Amber</h2>

          <div className="me-trip-meta-list">
            <div className="me-trip-meta-item">
              <Calendar size={13} />
              <span>20 - 24 Nov 2026</span>
            </div>
            <div className="me-trip-meta-item">
              <MapPin size={13} />
              <span>Jeju Island, South Korea</span>
            </div>
          </div>

          <p className="me-trip-blurb">Volcanic beauty, coastal trails and incredible local cuisine awaits.</p>

          <button className="me-open-trip-btn" onClick={openTrip}>
            <span>Open active trip</span>
            <span className="arrow">→</span>
          </button>

          <div className="me-trip-scallop-divider" aria-hidden="true">
            <svg viewBox="0 0 400 14" preserveAspectRatio="none" fill="#ffffff">
              <path d="M0,14 L0,8 Q12.5,0 25,8 Q37.5,16 50,8 Q62.5,0 75,8 Q87.5,16 100,8 Q112.5,0 125,8 Q137.5,16 150,8 Q162.5,0 175,8 Q187.5,16 200,8 Q212.5,0 225,8 Q237.5,16 250,8 Q262.5,0 275,8 Q287.5,16 300,8 Q312.5,0 325,8 Q337.5,16 350,8 Q362.5,0 375,8 Q387.5,16 400,8 L400,14 Z" />
            </svg>
          </div>
        </div>

        <div className="me-phase-tracker-bar">
          <div className="me-tracker-steps-grid" aria-label="Trip progress">
            <button className="me-phase-step-btn" onClick={openTrip}>
              <div className="me-step-icon-box">
                <FileText size={20} />
                <div className="me-step-check-dot"><Check size={8} /></div>
              </div>
              <span>Plan</span>
            </button>
            <button className="me-phase-step-btn" onClick={openPacking}>
              <div className="me-step-icon-box">
                <Box size={20} />
                <div className="me-step-check-dot"><Check size={8} /></div>
              </div>
              <span>Pack</span>
            </button>
            <button className="me-phase-step-btn is-active" onClick={openTrip}>
              <div className="me-step-icon-box me-step-active-circle">
                <Plane size={20} />
              </div>
              <span>Go</span>
            </button>
            <button className="me-phase-step-btn" onClick={() => setTab('memories')}>
              <div className="me-step-icon-box">
                <Image size={20} />
              </div>
              <span>Memories</span>
            </button>
          </div>
        </div>
      </section>

      <section className="me-summary-card redesign-summary paper-sheet" onClick={openPacking}>
        <svg className="me-summary-bg-track" viewBox="0 0 340 90" fill="none" aria-hidden="true">
          <path d="M120,65 Q210,50 255,20" stroke="#4a89d0" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" />
          <g transform="translate(225, 28) rotate(-25) scale(0.55)">
            <path d="M0,0 L14,6 L18,4 L10,0 L18,-4 L14,-6 Z" fill="#1b72e8" opacity="0.6" />
          </g>
        </svg>

        <div className="me-summary-content">
          <div className="me-summary-head-row">
            <h3>Packing Summary</h3>
            <span className="me-summary-pct">70%</span>
          </div>
          <div className="me-progress-bar-track">
            <div className="me-progress-bar-fill" style={{ width: '70%' }} />
          </div>
          <span className="me-summary-subtext">14 / 20 items packed</span>
          <div className="me-summary-pill">Almost there! Great progress!</div>
        </div>

        <div className="me-summary-right-visual">
          <div className="me-suitcase-container">
            <SuitcaseGraphic />
          </div>
          <button className="me-round-nav-btn" aria-label="Open packing">
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      <section className="me-history-card redesign-history paper-sheet" onClick={() => setDrawer('tingo')}>
        <div className="me-history-content">
          <h3>Profile History</h3>
          <p>Look back on your trips, memories and how you&apos;ve grown.</p>
          <div className="me-summary-pill">Your journey tells a great story!</div>
        </div>

        <div className="me-summary-right-visual">
          <div className="me-polaroid-stack-wrap">
            <div className="me-polaroid-card me-polaroid-back">
              <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=260&auto=format&fit=crop&q=80" alt="Coast" />
            </div>
            <div className="me-polaroid-card me-polaroid-front">
              <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=260&auto=format&fit=crop&q=80" alt="Sunset" />
            </div>
            <div className="me-polaroid-post-it">
              <span>More<br />Good<br />Places</span>
            </div>
          </div>
          <button className="me-round-nav-btn" aria-label="Open profile history">
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      <EmergencyContactsManager contacts={emergencyContacts} frequency={emergencyCheckInFrequency} onChange={contacts => { setEmergencyContacts(contacts); if (selectedEmergencyContactId && !contacts.some(contact => contact.id === selectedEmergencyContactId)) setSelectedEmergencyContactId(''); }} onFrequencyChange={setEmergencyCheckInFrequency} />
      {learningProposal?.status === 'proposed' && <section className="learning-handoff paper-sheet"><div><span>TRIP LEARNING · REVIEW BEFORE APPLY</span><h3>{destination} has a proposal for your long-term Tingo.</h3><p>These changes came from this trip’s actual outcome and will not apply until you confirm them.</p>{learningProposal.changes.map(change => <small key={change.questionId}>{change.questionId}: {change.beforeOptionId ?? 'none'} → {change.afterOptionId} · {change.reason}</small>)}</div><div className="learning-handoff-actions"><button className="secondary" onClick={() => setTab('memories')}>Review in Memories</button><button className="primary" onClick={confirmLearning}>Confirm this learning</button><button className="secondary" onClick={dismissLearning}>Dismiss</button></div></section>}
      {confirmedLearningHistory.length > 0 && <section className="learning-history paper-sheet"><span>CONFIRMED TINGO LEARNING</span><h3>What you chose to carry forward</h3>{confirmedLearningHistory.slice(0, 3).map(record => <div key={record.id}><b>{record.sourceTripReview === 'yes' ? 'Worth it' : record.sourceTripReview === 'mixed' ? 'Mixed' : 'Not really'} · {new Date(record.confirmedAt).toLocaleDateString()}</b>{record.changes.map(change => <small key={change.questionId}>{change.questionId}: {change.beforeOptionId ?? 'none'} → {change.afterOptionId}</small>)}</div>)}</section>}
      <section className="me-logout-section" aria-label="Account actions">
        <button className="me-logout-button" onClick={logOut}><LogOut size={17} /> Log out</button>
      </section>
    </div>;
  }

  function renderTingoAssessment() {
    const completion = tingoCompletion(tingoAnswers);
    const complete = completion === 100;
    const identity = deriveTingoIdentity(tingoDimensions);
    const currentQuestion = tingoQuestions[Math.max(0, Math.min(tingoStep, tingoQuestions.length - 1))];
    const barWidth = tingoStep < 0 ? 12 : complete ? 100 : Math.round(((tingoStep + 1) / tingoQuestions.length) * 100);
    const statRows: { key: keyof TingoDimensions; label: string; icon: string; color: string }[] = [
      { key: 'pace', label: 'Pace', icon: '🏝️', color: 'var(--sangria)' },
      { key: 'experience', label: 'Experience', icon: '🌎', color: 'var(--blue)' },
      { key: 'budget', label: 'Budget', icon: '💳', color: 'var(--warning)' },
      { key: 'comfort', label: 'Comfort', icon: '🏨', color: 'var(--blue)' },
      { key: 'food', label: 'Food', icon: '🍴', color: 'var(--sangria-deep)' },
      { key: 'adventure', label: 'Adventure', icon: '⛰️', color: 'var(--sangria-soft)' },
      { key: 'planning', label: 'Planning', icon: '🗂️', color: 'var(--warning)' },
      { key: 'flexibility', label: 'Flexibility', icon: '🔁', color: 'var(--success)' },
      { key: 'social', label: 'Social', icon: '👥', color: 'var(--success)' },
    ];
    const scoreValue = (key: keyof TingoDimensions) => Math.max(8, Math.min(98, Math.round(58 + tingoDimensions[key] * 7)));

    if (tingoStep < 0 && !complete) {
      return (
        <div className="tingo-flow tingo-how">
          <div className="tingo-flow-top">
            <button aria-label="Back" onClick={closeTingoAssessment}>‹</button>
            <div><i style={{ width: `${barWidth}%` }} /></div>
            <span>1/12</span>
          </div>

          <div className="tingo-how-header">
            <h2>Find your travel rhythm</h2>
            <p>12 quick choices. One Tingo Card that feels like you.</p>
          </div>

          <div className="tingo-how-list">
            <article className="how-card how-card-1">
              <span className="how-step-num num-maroon">Step 01</span>
              <div className="how-card-body">
                <b>Pick what feels right</b>
                <small>Choose between two travel moments.</small>
              </div>
            </article>

            <article className="how-card how-card-2">
              <span className="how-step-num num-travel">Step 02</span>
              <div className="how-card-body">
                <b>Follow your instinct</b>
                <small>There are no perfect answers.</small>
              </div>
            </article>

            <article className="how-card how-card-3">
              <span className="how-step-num num-heart">Step 03</span>
              <div className="how-card-body">
                <b>See your Tingo Card</b>
                <small>Discover your pace and plan style.</small>
              </div>
            </article>
          </div>

          <button className="tingo-flow-primary tingo-how-maroon-btn" onClick={() => setTingoStep(0)}>
            <span>Start Tingo</span>
            <ChevronRight size={18} />
          </button>
        </div>
      );
    }

    if (complete && tingoRevealed) {
      return <div className="tingo-flow tingo-result-screen">
        <div className="tingo-result-head"><button aria-label="Back" onClick={closeTingoAssessment}>‹</button><b>Your Tingo Card</b><button aria-label="Retake assessment" onClick={retakeTingo}>↻</button></div>
        <div className="tingo-result-hero">
          <div><span>{identity.title}</span><small className="tingo-persona-description">{identity.personaLabel}</small></div>
          <img src={tingoPersonaImages[identity.personaKey]} alt={`${identity.personaLabel} logo`} />
        </div>
        <div className="tingo-stat-list">{statRows.map(row => <div key={row.key}><b>{row.label}</b><i><em style={{ width: `${scoreValue(row.key)}%` }} /></i><strong>{scoreValue(row.key)}</strong></div>)}</div>
        <p className="tingo-result-quote">{identity.summary}</p>
        <button className="tingo-flow-primary tingo-red-primary" onClick={continueAfterTingo}>{onboardingComplete ? 'Plan My Trip' : 'Continue setup'} <ChevronRight size={20} /></button>
      </div>;
    }

    const isFinalizing = complete && !tingoRevealed;
    return <div className={`tingo-flow tingo-question-screen ${isFinalizing ? 'is-finalizing' : ''}`} aria-busy={isFinalizing}>
      <div className="tingo-flow-top"><button aria-label="Back" onClick={() => setTingoStep(step => Math.max(-1, step - 1))}>‹</button><div><i style={{ width: `${barWidth}%` }} /></div><span>{Math.min(tingoStep + 1, tingoQuestions.length)}/12</span></div>
      <span className="tingo-question-kicker">{currentQuestion.category?.toUpperCase()}</span>
      <h2>{currentQuestion.prompt}</h2>
      <div className="tingo-choice-grid">{currentQuestion.options.map(option => <button key={option.id} disabled={isFinalizing} onClick={() => answerTingo(option.id)}>
        <img src={option.photoUrl} alt="" />
        <b>{option.label}</b>
        <span>{option.hint}</span>
        {(option.tags ?? []).map(tag => <small key={tag}>{tag}</small>)}
      </button>)}</div>
      {isFinalizing
        ? <div className="tingo-finalizing" role="status"><span>Preparing your Tingo Card</span><i><em /></i></div>
        : <button className="tingo-neither" onClick={() => answerTingo('neither')}>Neither feels like me</button>}
    </div>;
  }

  function renderDrawer() {
    if (!drawer) return null;
    return <div className={`overlay ${drawer === 'tingo' ? 'tingo-overlay' : ''}`} onMouseDown={() => { if (drawer !== 'tingo' || onboardingComplete) setDrawer(null); }}><section className={`drawer ${drawer === 'tingo' ? 'tingo-flow-drawer' : ''}`} onMouseDown={e => e.stopPropagation()}>{drawer !== 'tingo' && <button className="close" aria-label="Close drawer" onClick={() => setDrawer(null)}><X size={20} /></button>}
      {drawer === 'discover' && <><span className="drawer-kicker">DISCOVER · COCO PICKS</span><h3>Where are we going?</h3><p className="drawer-copy">Search Tokyo, Kyoto or Osaka for destination-aware prototype data. Unknown destinations are explicitly marked as fallback examples. Ranking uses your current Tingo dimensions.</p><div className="discover-search"><input className="big-input" value={exploreDestination} onChange={e => { setExploreDestination(e.target.value); setDestinationSearched(false); }} placeholder="Tokyo, Kyoto, Osaka…" /><button className="primary" onClick={searchDestination}>Search</button></div>{destinationSearched && <div className="discover-results"><span className="drawer-kicker">FOR YOUR {exploreDestination.toUpperCase()} TRIP · {tingoBehavior.recommendationBias.toUpperCase()} BIAS</span>{recommendations.map(place => <article className="community-row discover-row" key={place.id}><div><b>{place.name}</b><small>{place.match}% Tingo-adjusted match · {place.type}</small><small>{place.cost} · {place.duration}</small><small><strong>Why Coco picked this:</strong> {place.why}</small><small>{place.source === 'prototype-catalog' ? 'Local prototype catalog' : 'Fallback example · not live destination data'}</small><div className="inline-actions"><button onClick={() => toggleRecommendation(place.id, 'save')}>{place.saved ? '✓ Saved' : 'Save idea'}</button><button onClick={() => toggleRecommendation(place.id, 'add')}>{mode === 'group' ? (place.added ? '✓ Suggested to group' : 'Suggest to group') : (place.added ? '✓ In plan' : 'Add to plan')}</button></div>{mode === 'group' && <small>Suggestion only · the official Group itinerary changes only after group confirmation.</small>}</div></article>)}</div>}</>}
{drawer === 'tingo' && renderTingoAssessment()}
      {drawer === 'flight' && <FlightDrawer mode={mode} booking={flightBooking} draft={flightBookingDraft} onDraftChange={setFlightBookingDraft} onConfirm={setFlightBooking} onClose={() => setDrawer(null)} />}
      {drawer === 'accommodation' && <AccommodationDrawer mode={mode} booking={accommodationBooking} draft={accommodationBookingDraft} onDraftChange={setAccommodationBookingDraft} onConfirm={confirmAccommodationBooking} onClose={() => setDrawer(null)} />}
      {drawer === 'tripEnd' && <section className="trip-end-prompt" aria-label="End trip confirmation"><CocoCompanion context="memory" size={96} /><span className="drawer-kicker">TRIP WRAP-UP</span><h3>This journey looks like it has ended. End this trip now?</h3><p className="drawer-copy">{allTodayItemsComplete ? 'Today’s saved itinerary items are all marked complete.' : 'The saved return date has passed.'} You can keep travelling if plans changed; CocoCrunch will not end it without your confirmation.</p><div className="action-row"><button className="secondary" onClick={() => { setTripEndPromptDismissed(true); setDrawer(null); }}>Not yet</button><button className="primary" onClick={() => { setTripPhase('completed'); setDrawer(null); }}>End trip &amp; open summary</button></div></section>}
      {drawer === 'tripSetup' && !tripSetupModeChoice && mode === 'group' && groupSetupStep === 3 && <p className="adapter-note">Leader choice rule: confirming a destination and dates makes them read-only for members later. Skip only to send competing member candidates to Group Court.</p>}
      {drawer === 'tripSetup' && !tripSetupModeChoice && mode === 'group' && groupSetupStep === 6 && <p className="adapter-note">{destinationLockedByLeader ? 'Read-only for members: the leader locked this shared destination and schedule in Step 3.' : 'No candidate is adopted directly: member destinations go to Group Court, with Gacha only if Court reaches a tie.'}</p>}
      {drawer === 'tripSetup' && tripSetupModeChoice && tripSetupReference && <section className="trip-setup-wizard"><span className="drawer-kicker">COPY THIS TRIP · PUBLIC REFERENCE</span><h3>How are you travelling?</h3><p className="drawer-copy">{tripSetupReference.title} supplies a starting vibe and estimated budget. Location is already copied; you can change every prefilled value.</p><div className="onboarding-actions"><button className="primary" onClick={() => startReferenceTrip('solo')}>Solo trip</button><button className="secondary" onClick={() => startReferenceTrip('group')}>Group trip</button></div></section>}
      {drawer === 'tripSetup' && !tripSetupModeChoice && mode === 'group' && <section className="trip-setup-wizard"><div className="trip-setup-progress"><span>NEW GROUP TRIP</span><b>Step {groupSetupStep} of 6</b><div><i style={{ width: `${groupSetupStep * (100 / 6)}%` }} /></div></div>
        {groupSetupStep === 1 && <><span className="drawer-kicker">STEP 1 · GROUP LEADER</span><h3>Who is leading this trip?</h3><label className="setup-field"><span>Leader name</span><input className="big-input" value={onboardingName} onChange={event => setOnboardingName(event.target.value)} placeholder="Your name" /></label></>}
        {groupSetupStep === 2 && <><span className="drawer-kicker">STEP 2 · INVITE FRIENDS</span><h3>Bring the right people in.</h3><div className="group-invite-link"><input readOnly value="https://cococrunch.app/join/group-tokyo-demo" /><button className="secondary" onClick={() => void navigator.clipboard?.writeText('https://cococrunch.app/join/group-tokyo-demo')}>Copy link</button></div><small className="adapter-note">Prototype share link · no invitation is sent outside this local app.</small><label className="setup-field"><span>Add by username</span><input value={groupUsernameSearch} onChange={event => setGroupUsernameSearch(event.target.value)} placeholder="alex, hana, or noah" /></label><button className="secondary" disabled={!/^(alex|hana|noah)$/i.test(groupUsernameSearch.trim())} onClick={() => addGroupMemberFromUsername(groupUsernameSearch.trim())}>Add matching username</button><div className="group-setup-members">{members.map(member => <div key={member.id}><b>{member.name}</b><small>{member.inviteStatus === 'joined' ? 'Joined' : 'Invite pending'} · {member.role}</small>{member.inviteStatus === 'pending' && <button onClick={() => setMembers(current => current.map(item => item.id === member.id ? { ...item, inviteStatus: 'joined' } : item))}>Mark joined (prototype)</button>}</div>)}</div></>}
        {groupSetupStep === 3 && <><span className="drawer-kicker">STEP 3 · LEADER LOCATION &amp; DATES</span><h3>Set the shared frame, or let the group decide.</h3><div className="trip-setup-methods"><button className={tripSetupLocationMethod === 'manual' ? 'active' : ''} onClick={() => setTripSetupLocationMethod('manual')}>Enter manually</button><button className={tripSetupLocationMethod === 'recommendation' ? 'active' : ''} onClick={() => setTripSetupLocationMethod('recommendation')}>Ask AI</button><button className={tripSetupLocationMethod === 'link' ? 'active' : ''} onClick={() => setTripSetupLocationMethod('link')}>Paste a link</button></div>{tripSetupLocationMethod === 'manual' && <label className="setup-field"><span>Destination</span><input className="big-input" value={destination} onChange={event => setDestination(event.target.value)} placeholder="Tokyo, Kyoto, Osaka…" /></label>}{tripSetupLocationMethod === 'recommendation' && <div className="trip-setup-panel"><label className="setup-field"><span>Describe the group trip</span><textarea value={tripSetupPrompt} onChange={event => setTripSetupPrompt(event.target.value)} /></label><button className="secondary" onClick={runTripSetupRecommendation}>Ask AI for recommendation</button><small className="adapter-note">Prototype catalog recommendation, not live AI data.</small></div>}{tripSetupLocationMethod === 'link' && <div className="trip-setup-panel"><label className="setup-field"><span>External trip link</span><input value={tripSetupLink} onChange={event => setTripSetupLink(event.target.value)} /></label><button className="secondary" onClick={parseTripSetupLink}>Parse link</button><small className="adapter-note">Prototype parsing only; no webpage is fetched.</small></div>}<div className="trip-date-grid"><label className="setup-field"><span>Departure</span><input type="date" value={tripDates?.start ?? ''} onChange={event => setTripDates(current => ({ start: event.target.value, end: current?.end ?? event.target.value }))} /></label><label className="setup-field"><span>Return</span><input type="date" value={tripDates?.end ?? ''} onChange={event => setTripDates(current => ({ start: current?.start ?? event.target.value, end: event.target.value }))} /></label></div><button className="onboarding-skip" onClick={() => { setDestinationLockedByLeader(false); setTripDates(null); setGroupSetupStep(4); }}>Skip location &amp; dates — let members propose</button></>}
        {groupSetupStep === 4 && <><span className="drawer-kicker">STEP 4 · MEMBER BUDGETS</span><h3>Every joined member sets their own comfort number.</h3><div className="group-member-fields">{members.filter(member => member.inviteStatus === 'joined').map(member => <label key={member.id}><span><b>{member.name}</b><small>{groupMemberBudgets[member.id] ? 'Filled' : 'Pending'}</small></span><input type="number" min="0" value={groupMemberBudgets[member.id] ?? ''} onChange={event => setGroupMemberBudgets(current => ({ ...current, [member.id]: sanitizeAmount(Number(event.target.value)) }))} placeholder="RM" /></label>)}</div></>}
        {groupSetupStep === 5 && <><span className="drawer-kicker">STEP 5 · MEMBER VIBES</span><h3>Every joined member adds their own trip rhythm.</h3><div className="group-member-fields">{members.filter(member => member.inviteStatus === 'joined').map(member => <label key={member.id}><span><b>{member.name}</b><small>{groupMemberVibes[member.id] ? 'Filled' : 'Pending'}</small></span><input value={groupMemberVibes[member.id] ?? ''} onChange={event => setGroupMemberVibes(current => ({ ...current, [member.id]: event.target.value }))} placeholder="e.g. slow food and cafés" /></label>)}</div></>}
        {groupSetupStep === 6 && <><span className="drawer-kicker">STEP 6 · SHARED DESTINATION</span><h3>{destinationLockedByLeader ? 'The leader has set the shared frame.' : 'Let the group take destination candidates to Court.'}</h3>{destinationLockedByLeader ? <div className="success-note"><div><b>{destination}</b><small>{tripDates?.start} → {tripDates?.end} · set by the group leader</small></div></div> : <><div className="group-member-fields">{members.filter(member => member.inviteStatus === 'joined').map(member => <label key={member.id}><span><b>{member.name}</b><small>{groupMemberDestinations[member.id] ? 'Candidate added' : 'Pending'}</small></span><input value={groupMemberDestinations[member.id] ?? ''} onChange={event => setGroupMemberDestinations(current => ({ ...current, [member.id]: event.target.value }))} placeholder="Destination candidate" /></label>)}</div><div className="trip-date-grid"><label className="setup-field"><span>Departure</span><input type="date" value={tripDates?.start ?? ''} onChange={event => setTripDates(current => ({ start: event.target.value, end: current?.end ?? event.target.value }))} /></label><label className="setup-field"><span>Return</span><input type="date" value={tripDates?.end ?? ''} onChange={event => setTripDates(current => ({ start: current?.start ?? event.target.value, end: event.target.value }))} /></label></div><button className="secondary" disabled={new Set(Object.values(groupMemberDestinations).filter(Boolean)).size < 2} onClick={openDestinationCourt}>Send candidates to Group Court</button>{courtConfirmed && <div className="success-note"><div><b>Court selected: {courtDecision}</b><small>Destination is now ready for the group trip.</small></div></div>}</>}</>}
        <div className="trip-setup-actions">{groupSetupStep > 1 && <button className="secondary" onClick={() => setGroupSetupStep(step => Math.max(1, step - 1) as GroupSetupStep)}>Back</button>}{groupSetupStep < 6 ? <button className="primary" disabled={(groupSetupStep === 1 && !onboardingName.trim()) || (groupSetupStep === 2 && !members.some(member => member.inviteStatus === 'joined')) || (groupSetupStep === 4 && members.filter(member => member.inviteStatus === 'joined').some(member => !groupMemberBudgets[member.id])) || (groupSetupStep === 5 && members.filter(member => member.inviteStatus === 'joined').some(member => !groupMemberVibes[member.id]))} onClick={() => { if (groupSetupStep === 3) setDestinationLockedByLeader(Boolean(destination.trim() && tripDates?.start && tripDates?.end)); setGroupSetupStep(step => (step + 1) as GroupSetupStep); }}>Continue <ChevronRight size={15} /></button> : <button className="primary" disabled={!tripDates?.start || !tripDates?.end || (!destinationLockedByLeader && !courtConfirmed)} onClick={() => { setGroupBudgetTotal(Object.values(groupMemberBudgets).reduce((total, value) => total + value, 0)); setReadyConfirmed(true); setTripCreated(true); setDrawer(null); openTrip(); }}>Create group trip &amp; open plan <ChevronRight size={15} /></button>}</div>
      </section>}
      {drawer === 'tripSetup' && !tripSetupModeChoice && mode === 'solo' && <section className="trip-setup-wizard"><div className="trip-setup-progress"><span>NEW SOLO TRIP</span><b>Step {tripSetupStep} of 5</b><div><i style={{ width: `${tripSetupStep * 20}%` }} /></div></div>
        {tripSetupReference && <div className="adapter-note"><b>Starting from {tripSetupReference.title}</b><small>Its vibe and estimated budget are prefilled. You can change both.</small></div>}
        {tripSetupStep === 1 && <><span className="drawer-kicker">STEP 1 · TRAVELLER</span><h3>Who is this trip for?</h3><label className="setup-field"><span>Your name</span><input className="big-input" value={onboardingName} onChange={event => setOnboardingName(event.target.value)} placeholder="Your name" autoFocus /></label></>}
        {tripSetupStep === 2 && <><span className="drawer-kicker">STEP 2 · LOCATION</span><h3>Where should this trip begin?</h3><div className="trip-setup-methods"><button className={tripSetupLocationMethod === 'manual' ? 'active' : ''} onClick={() => setTripSetupLocationMethod('manual')}>Enter manually</button><button className={tripSetupLocationMethod === 'recommendation' ? 'active' : ''} onClick={() => setTripSetupLocationMethod('recommendation')}>Ask AI</button><button className={tripSetupLocationMethod === 'link' ? 'active' : ''} onClick={() => setTripSetupLocationMethod('link')}>Paste a link</button></div>
          {tripSetupLocationMethod === 'manual' && <label className="setup-field"><span>Destination</span><input className="big-input" value={destination} onChange={event => { setDestination(event.target.value); setDestinationSearched(false); }} placeholder="Tokyo, Kyoto, Osaka…" /></label>}
          {tripSetupLocationMethod === 'recommendation' && <div className="trip-setup-panel"><label className="setup-field"><span>Describe your ideal trip</span><textarea value={tripSetupPrompt} onChange={event => setTripSetupPrompt(event.target.value)} placeholder="e.g. slow food, museums, and rainy-day cafés" /></label><button className="secondary" onClick={runTripSetupRecommendation}>Ask AI for recommendation</button><small className="adapter-note">Prototype recommendation · uses the local Tingo-aware catalog, not live AI or travel data.</small>{recommendations.slice(0, 3).map(place => <button className="trip-setup-recommendation" key={place.id} onClick={() => setDestination(place.name.includes('Kyoto') ? 'Kyoto' : place.name.includes('Osaka') ? 'Osaka' : 'Tokyo')}><b>{place.name}</b><small>{place.why}</small></button>)}<div className="trip-setup-reference-list"><span>PUBLIC TRIP REFERENCES</span>{communityTrips.slice(0, 2).map(trip => <CommunityTripCard key={trip.id} trip={trip} onToggleSave={() => undefined} onViewPlan={copyExploreTrip} onCopyTrip={copyExploreTrip} />)}</div></div>}
          {tripSetupLocationMethod === 'link' && <div className="trip-setup-panel"><label className="setup-field"><span>External trip link</span><input className="big-input" value={tripSetupLink} onChange={event => { setTripSetupLink(event.target.value); setTripSetupLinkStatus('idle'); }} placeholder="https://…" /></label><button className="secondary" disabled={!tripSetupLink.trim() || tripSetupLinkStatus === 'parsing'} onClick={parseTripSetupLink}>{tripSetupLinkStatus === 'parsing' ? 'AI is parsing…' : 'Parse link'}</button><small className="adapter-note">Prototype parsing only — CocoCrunch does not fetch or read the external webpage.</small>{tripSetupLinkStatus === 'ready' && <div className="success-note"><div><b>Suggested destination: {destination}</b><small>Confirm it below or edit it manually.</small></div></div>}</div>}</>}
        {tripSetupStep === 3 && <><span className="drawer-kicker">STEP 3 · BUDGET</span><h3>What feels comfortable for this trip?</h3><label className="budget-total-input"><span>Solo total (RM)</span><input type="number" min="0" value={soloBudgetTotal} onChange={event => setSoloBudgetTotal(sanitizeAmount(Number(event.target.value)))} /></label><div className="adapter-note"><b>Budget stays editable.</b><small>This is your starting total; category planning happens in the Plan workspace.</small></div></>}
        {tripSetupStep === 4 && <><span className="drawer-kicker">STEP 4 · TRIP VIBE</span><h3>How much room should the days have?</h3><label className="trip-vibe-slider"><span>Relaxed</span><input type="range" min="0" max="100" value={tripInputs.tripVibe.includes('Packed') ? 80 : tripInputs.tripVibe.includes('Balanced') ? 50 : 20} onChange={event => { const value = Number(event.target.value); setTripInputField('tripVibe', value < 34 ? 'Relaxed and spacious' : value > 66 ? 'Packed with highlights' : 'Balanced days with breathing room'); }} /><span>Packed</span></label><div className="constraint-row">{['Slow food + cafés', 'Culture + museums', 'Nature + movement', 'Night markets + city lights'].map(vibe => <button key={vibe} className={tripInputs.tripVibe === vibe ? 'active' : ''} onClick={() => setTripInputField('tripVibe', vibe)}>{vibe}</button>)}</div><div className="adapter-note"><small>Current vibe: {tripInputs.tripVibe || 'Choose a starting rhythm'}</small></div></>}
        {tripSetupStep === 5 && <><span className="drawer-kicker">STEP 5 · DATES</span><h3>When are you going?</h3><div className="trip-date-grid"><label className="setup-field"><span>Departure</span><input type="date" value={tripDates?.start ?? ''} onChange={event => setTripDates(current => ({ start: event.target.value, end: current?.end ?? event.target.value }))} /></label><label className="setup-field"><span>Return</span><input type="date" min={tripDates?.start} value={tripDates?.end ?? ''} onChange={event => setTripDates(current => ({ start: current?.start ?? event.target.value, end: event.target.value }))} /></label></div><small className="adapter-note">Choose dates from the calendar fields. You can revise them later.</small></>}
        <div className="trip-setup-actions">{tripSetupStep > 1 && <button className="secondary" onClick={() => setTripSetupStep(step => Math.max(1, step - 1) as TripSetupStep)}>Back</button>}{tripSetupStep < 5 ? <button className="primary" disabled={(tripSetupStep === 1 && !onboardingName.trim()) || (tripSetupStep === 2 && !destination.trim())} onClick={() => setTripSetupStep(step => (step + 1) as TripSetupStep)}>Continue <ChevronRight size={15} /></button> : <button className="primary" disabled={!tripDates?.start || !tripDates?.end} onClick={() => { setReadyConfirmed(true); setTripCreated(true); setDrawer(null); openTrip(); }}>Create trip &amp; open plan <ChevronRight size={15} /></button>}</div>
      </section>}
      {drawer === 'group' && <><span className="drawer-kicker">GROUP DNA</span><h3>{groupDNA.conflicts.length ? `${groupDNA.conflicts.length} conflict${groupDNA.conflicts.length === 1 ? '' : 's'} stay visible until the group decides.` : 'Shared signals are explicit, not averaged from Mei.'}</h3><div className="dna-grid"><div><span>Trip Vibe</span><b>{tripInputs.tripVibe}</b></div><div><span>Shared priority</span><b>{groupDNA.sharedPriorities[0]?.label ?? 'None yet'}</b></div><div><span>Budget range</span><b>{groupDNA.budgetRange.max ? `RM${groupDNA.budgetRange.min}–${groupDNA.budgetRange.max}` : 'No ranges yet'}</b></div><div><span>Budget sensitivity</span><b>{groupDNA.budgetSensitivity}</b></div></div><div className="member-list">{members.map(member => <div key={member.id}><div><b>{member.name}</b><small>{member.inviteStatus === 'pending' ? 'Invite pending' : member.role} · {member.pace} pace · {memberPreferenceProfiles[member.id]?.tingoAssessed ? 'Tingo assessed' : 'Tingo not assessed'}</small></div><button onClick={() => setMembers(current => current.map(item => item.id === member.id ? { ...item, role: item.role === 'Trip lead' ? 'Food scout' : item.role === 'Food scout' ? 'Memory keeper' : 'Trip lead' } : item))}>Rotate role</button></div>)}</div><div className="adapter-note"><b>Coco responsibility preview</b>{responsibilitySuggestions.map(item => <small key={item.memberId}><strong>{item.source === 'member-tingo' ? 'Tingo-assessed' : 'Fallback'} · </strong>{item.memberName}: {item.suggestedRole} — {item.reason}</small>)}<button className="secondary" onClick={() => setMembers(current => applyResponsibilitySuggestions(current, responsibilitySuggestions))}>Confirm & apply suggested roles</button></div><button className="secondary" onClick={inviteMember}>+ Invite a traveller</button><div className="conflict-mini"><span>GROUP DNA SIGNALS</span>{groupDNA.conflicts.length ? groupDNA.conflicts.map(conflict => <div key={`${conflict.kind}-${conflict.label}`}><b>{conflict.label}</b><small>{conflict.reason}</small></div>) : <b>No strong conflict detected from explicit member inputs.</b>}<small>{groupDNA.evidence.join(' ')}</small><small>{tingoPlanGuidance.courtGuidance} AI can explain options, but cannot silently choose for the group.</small></div><label className="setup-field"><span>Mark another uncertainty</span><input className="big-input" value={draftConflict} onChange={e => setDraftConflict(e.target.value)} placeholder="e.g. Shinjuku hotel vs Asakusa hotel" /></label><button className="secondary" onClick={markConflict}>{conflictMarked ? 'Send another conflict to Court' : 'Mark conflict & open Court'}</button><div className="planner-turn"><span>Editing turn</span><b>{plannerTurn}</b><button onClick={() => setPlannerTurn(plannerTurn === 'Mei' ? 'JH' : plannerTurn === 'JH' ? 'Zi Shan' : plannerTurn === 'Zi Shan' ? 'Alex' : 'Mei')}>Pass turn</button></div><button className="secondary" onClick={() => setDrawer('reminders')}>Reminders & human commitments</button></>}
      {drawer === 'backup' && <><span className="drawer-kicker">BACKUP PLAN POOL</span><h3>Only viable, Deal-Breaker-safe alternatives are repair candidates.</h3>{backupPool.map(item => <div className={`backup-row ${item.viable && item.dealBreakerSafe ? '' : 'off'}`} key={item.id}><b>{item.name}</b><small>{item.support} supporters · {item.costDelta >= 0 ? '+' : ''}RM{item.costDelta} · {item.timeDeltaMinutes >= 0 ? '+' : ''}{item.timeDeltaMinutes} min · {item.viable && item.dealBreakerSafe ? 'viable' : 'blocked'}</small><small>{item.source} · {item.lossReason}</small></div>)}{backupPool.length === 0 && <div className="adapter-note">No Backup candidate has been retained yet. A confirmed Court loser appears here only when it is viable and Deal-Breaker-safe.</div>}{ghostWishes.filter(wish => wish.status === 'revived').map(wish => <div className="backup-row" key={`ghost-${wish.id}`}><b>👻 {wish.name}</b><small>Revived from Ghost Wish · preserved with original reason</small></div>)}</>}
      {drawer === 'budget' && <><span className="drawer-kicker">TRIP BUDGET</span><h3>Editable plan and actual category spend.</h3><label className="budget-total-input"><span>{mode === 'group' ? 'Group' : 'Solo'} total</span><input type="number" min="0" value={budgetTotal} onChange={e => mode === 'group' ? setGroupBudgetTotal(sanitizeAmount(Number(e.target.value))) : setSoloBudgetTotal(sanitizeAmount(Number(e.target.value)))} /></label><div className="budget-big"><b>RM {remaining}</b><span>remaining after RM {spent} actual spend</span></div><div className="surprise-budget"><span>EXTRA BUDGET</span><b>RM {mode === 'group' ? 120 : 60}</b><small>Held outside the base plan for a real little surprise.</small></div><div className="budget-lines">{(['stay', 'food', 'transport', 'activities'] as BudgetCategory[]).map(category => <label key={category}><span>{category === 'transport' ? 'Transit' : category[0].toUpperCase() + category.slice(1)}</span><input type="number" min="0" value={budgetPlan[category]} onChange={e => changeBudgetCategory(category, Number(e.target.value))} /><small>Planned</small><input type="number" min="0" aria-label={`${category} actual spend`} value={budgetActuals[category]} onChange={e => changeBudgetActual(category, Number(e.target.value))} /><small>Actual · persisted for this prototype trip</small></label>)}</div><div className={`budget-balance ${planned > budgetTotal ? 'over' : ''}`}><span>Planned</span><b>RM {planned} / RM {budgetTotal}</b><small>{planned > budgetTotal ? `Over plan by RM ${planned - budgetTotal}` : `RM ${budgetTotal - planned} unallocated buffer`}</small></div><button className="receipt-button" onClick={printReceipt}><ReceiptText size={18} />{receiptPrinted ? 'Print receipt again' : 'Print split-bill receipt'}</button></>}
      {drawer === 'compare' && <><span className="drawer-kicker">COMPARE · HONEST PROTOTYPE</span><h3>Shortlist the option that fits the trip, not just the price.</h3><p className="drawer-copy">These are deterministic demo prices. No live supplier, inventory, or external checkout is connected.</p>{comparisonOptions.map(option => <article className="compare-option" key={option.id}><div><span>{option.category.toUpperCase()} · {option.fit}% fit</span><b>{option.label}</b><small>{option.why}</small></div><strong>RM {option.price}<em>{option.deal}</em></strong><small className={option.price <= remaining ? 'within-budget' : 'over-budget'}>{option.price <= remaining ? 'Within current remaining budget' : 'Over current remaining budget'}</small><button className="secondary" onClick={() => setDrawer(null)}>Preview in plan</button></article>)}</>}
      {drawer === 'feasibility' && <><span className="drawer-kicker">PLAN HEALTH · FEASIBILITY</span><h3>Check the joins before the trip does.</h3><div className="health-check-list">{checkFeasibility().map(issue => <div className={issue.severity === 'block' ? 'block' : ''} key={issue.id}><span>{issue.resolved ? '✓' : '!'}</span><div><b>{issue.label}</b><small>{issue.detail}</small></div></div>)}</div><div className="adapter-note"><b>One watch item remains.</b><small>The local adapter can flag opening hours and buffer risks; it cannot verify live operating data.</small></div><button className="primary" onClick={() => { setReadyConfirmed(current => transitionReadyConfirmation(current, 'confirm-ready')); setDrawer(null); }}>Keep this reviewed plan</button></>}
      {drawer === 'reminders' && <><span className="drawer-kicker">REMINDERS · PEOPLE COUNT TOO</span><h3>Important dates and human plans belong on the timeline.</h3><div className="reminder-list">{reminders.map(reminder => <button key={reminder.id} className={reminder.done ? 'done' : ''} onClick={() => setReminders(current => current.map(item => item.id === reminder.id ? { ...item, done: !item.done } : item))}><span>{reminder.done ? '✓' : '○'}</span><div><b>{reminder.label}</b><small>{reminder.date} · {reminder.kind}</small></div></button>)}</div><button className="secondary" onClick={() => setDrawer('commitments')}>Open human commitments & reunion</button></>}
      {drawer === 'commitments' && <><span className="drawer-kicker">HUMAN COMMITMENTS · REUNION</span><h3>Make the invisible parts of a day schedulable.</h3><div className="commitment-list">{commitments.map(item => <div key={item.id}><div><b>{item.label}</b><small>{item.time} · {item.owner} · {item.fixed ? 'fixed' : 'flexible'}</small></div><span>{item.fixed ? 'ANCHOR' : 'FLOATING'}</span></div>)}</div><div className="reunion-form"><span>REUNION AGREEMENT</span><label>Time<input value={reunion.time} onChange={e => setReunion(current => ({ ...current, time: e.target.value }))} /></label><label>Place<input value={reunion.place} onChange={e => setReunion(current => ({ ...current, place: e.target.value }))} /></label><label>Tolerance<input type="number" min="0" max="60" value={reunion.tolerance} onChange={e => setReunion(current => ({ ...current, tolerance: sanitizeAmount(Number(e.target.value)) }))} /></label></div><button className="primary" onClick={() => setDrawer(null)}>Save agreement</button></>}
      {drawer === 'safety' && <SafetyToolkit destination={destination} />}
      {drawer === 'assistant' && <><CocoAssistantPrompt mode={mode} destination={destination} onReviewProposal={() => { setAssistantPreview(true); setAssistantUndone(false); }} />{assistantPreview && !assistantApplied && <><div className="change-ticket"><div><span>KEEP</span><b>{tripInputs.mustGo} · anchor</b></div><div><span>MOVE</span><b>{visibleTripPlan.items.find(item => item.kind === 'floating')?.timeLabel ?? 'current time'} → {suggestedFloatingLabel}</b></div><div><span>WHY</span><b>Derived from the generated floating block and the current breathing-room signal.</b></div></div><div className="action-row"><button className="secondary" onClick={() => setAssistantPreview(false)}>Not now</button><button className="primary" onClick={() => openGovernedAction('assistant-move')}>{mode === 'group' ? 'Send to Group Court' : 'Confirm & apply'}</button></div></>}{assistantApplied && <><div className="success-note"><Check size={21} /><div><b>Suggestion applied.</b><small>Only the generated floating block moved. Anchor and promise stayed intact.</small></div></div><button className="secondary" onClick={() => { setFloatingStartOverride(null); setAssistantApplied(false); setAssistantUndone(true); }}>Undo change</button></>}{assistantUndone && <small className="adapter-note">Change undone. No group decision was silently changed.</small>}</>}
      {drawer === 'gacha' && <><EverydayGachaMachine result={everydayGacha ?? undefined} onTurn={runEverydayGacha} candidates={everydayCandidates} />{everydayCandidates.length === 0 && <div className="adapter-note"><b>No current draw candidates.</b><small>Save an idea, keep an optional activity, or add a flexible block before asking Coco for a playful suggestion. Sources remain unchanged.</small></div>}</>}
      {drawer === 'lucky' && <LuckyDrawReveal result={luckyDraw ?? undefined} onDraw={runLuckyDraw} />}
      {drawer === 'family' && <><FamilyWindowPanel privacy={privacy} continuousLocation={continuousLocation} reported={reported} delayed={delay} destination={destination} onReviewLocation={() => setDrawer('location')} onSendReassurance={() => setReported(true)} /><label className="setup-field"><span>Send reassurance to</span><select value={selectedEmergencyContactId} onChange={event => setSelectedEmergencyContactId(event.target.value)}><option value="">Choose an emergency contact</option>{emergencyContacts.map(contact => <option key={contact.id} value={contact.id}>{contact.name} · {contact.permission === 'both' ? 'location + message' : `${contact.permission} only`}</option>)}</select></label><small className="adapter-note">{selectedEmergencyContactId ? `Prototype check-in every ${emergencyCheckInFrequency} minutes; nothing is actually sent.` : 'Add an emergency contact in Me before sending a prototype check-in.'}</small></>}
      {drawer === 'location' && <LocationPrivacyPanel privacy={privacy} continuousLocation={continuousLocation} onOpenFamily={() => setDrawer('family')} onPrivacyChange={setPrivacy} />}
      {drawer === 'community' && <CommunityPublishPanel published={published} onChange={setPublished} artifacts={photoMemoryArtifacts} onArtifactPrivacyChange={(id, isPublic) => setPhotoMemoryArtifacts(items => items.map(item => item.id === id ? { ...item, isPublic } : item))} />}
      {drawer === 'import' && <PhotoJournalCapture destination={destination} groupMode={mode === 'group'} tripStart={tripIntent.dates?.start} places={visibleTripPlan.items.filter(item => item.kind !== 'buffer').map(item => item.name)} onIndex={() => { setPhotoIndexed(true); setPhotoImport(true); }} onSaveMoment={(entry, audience) => { const place = entry.archivePlace ?? (entry.locationSource === 'exif' ? 'GPS pin · choose nearby saved place' : `${destination} photo pin`); setPhotoMemoryArtifacts(current => [...current, { id: `photo-${Date.now()}-${current.length}`, title: entry.name, body: `${entry.note || 'A selected trip moment.'}\n\n${entry.timeSource === 'exif' ? 'EXIF' : 'Fallback'} time: ${entry.takenAt} · ${place}.`, source: `Explicitly saved ${audience === 'group' ? 'shared album' : 'personal'} photo memory · ${entry.timeSource === 'exif' ? 'local EXIF' : 'prototype fallback'} metadata`, locationLabel: place, audience, capturedAt: entry.takenAt, latitude: entry.latitude, longitude: entry.longitude, archiveDay: entry.archiveDay, archivePlace: entry.archivePlace }]); setDrawer(null); }} />}
      {drawer === 'memoryCard' && <section className="memory-card-drawer"><h3>Memory Sticker Card</h3><p>Make one moment collectible.</p><button className="primary" onClick={() => setDrawer(null)}>Collect sticker</button></section>}
      {drawer === 'all-personas' && (
        <section className="me-all-personas-drawer">
          <span className="drawer-kicker">16 TRAVEL PERSONAS</span>
          <h3>Explore Every Travel Style</h3>
          <p className="drawer-copy">From spontaneous food hunters to meticulous planners, find every way CocoCrunch understands travellers.</p>
          <div className="me-personas-grid">
            {Object.entries(tingoPersonaDetails).map(([key, item]) => {
              const isCurrent = key === (personaOverride ?? tingoIdentity.personaKey);
              return (
                <div key={key} className={`me-persona-grid-card ${isCurrent ? 'is-current' : ''}`} onClick={() => { setPersonaOverride(key as TingoPersonaKey); setDrawer(null); }} style={{ cursor: 'pointer' }}>
                  <div className="me-grid-img-wrap">
                    <img src={tingoPersonaImages[key as TingoPersonaKey]} alt={item.label} />
                    {isCurrent && <span className="me-current-badge">★ YOUR TYPE</span>}
                  </div>
                  <div className="me-grid-copy">
                    <b>{item.label}</b>
                    <span className="me-grid-tagline">{item.tagline}</span>
                    <p>{item.summary}</p>
                  </div>
                  <div className="me-grid-chips">
                    {item.tags.map(t => <span key={t}>{t}</span>)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </section></div>;
  }

  function renderCourt() {
    if (!courtOpen) return null;
    return (
      <TravelCourtModal
        isOpen={courtOpen}
        onClose={() => {
          setCourtOpen(false);
          setCourtCocoContext('court');
          if (typeof window !== 'undefined' && window.location.search.includes('court=')) {
            const url = new URL(window.location.href);
            url.searchParams.delete('court');
            window.history.replaceState({}, '', url.pathname + (url.search || ''));
          }
        }}
        initialMode={courtInitialMode}
        initialStep={courtInitialStep}
        onCocoContextChange={setCourtCocoContext}
        flightBooking={flightBooking}
        accommodationBooking={accommodationBooking}
        onSkippedIdeaSealed={(idea) => setSealedCourtIdeas(current => current.includes(idea) ? current : [idea, ...current])}
        onConfirmDecision={(decision) => {
          setCourtDecision(decision);
          setCourtConfirmed(true);
          if (mode === 'group' && groupSetupStep === 6 && !destinationLockedByLeader) setDestination(decision);
          confirmCourt();
        }}
      />
    );
  }

  const globalCocoContext: CocoContext = courtOpen
    ? courtCocoContext
    : drawer === 'gacha'
      ? 'gacha'
      : drawer === 'lucky'
        ? 'lucky'
        : tab === 'memories'
          ? 'memory'
          : tab === 'explore'
            ? 'map'
            : tab === 'trips'
              ? tripWorkspaceOpen
              ? workspacePhase === 'traveling'
                  ? 'traveling'
                  : workspacePhase === 'completed'
                    ? 'memory'
                    : 'planning'
                : 'planning'
              : tab === 'me'
                ? 'empty'
                : 'home';

  if (!onboardingComplete) {
    const beginTingo = () => {
      setTingoStep(-1);
      setTingoRevealed(false);
      setOnboardingStage('tingo');
      setDrawer('tingo');
    };
    const completeOnboarding = (preferences: string[]) => {
      const packingLabels: Record<string, string> = {
        'light-packer': 'comfortable walking shoes',
        'extra-outfits': 'extra outfit options',
        'portable-charger': 'portable charger',
        'rain-layer': 'light rain layer',
      };
      setBasePackingPreferences(preferences.map(preference => packingLabels[preference]).filter((preference): preference is string => Boolean(preference)));
      setOnboardingComplete(true);
    };

    return <div className="app-shell onboarding-shell">
      {onboardingStage === 'tingo'
        ? renderDrawer()
        : <OnboardingFlow
          initialStep={onboardingStage === 'packing' ? 'packing' : 'entry'}
          initialAccount={{ name: onboardingName, countryCode: onboardingCountryCode, birthday: onboardingBirthday }}
          onAccountChange={({ name, countryCode, birthday }) => { setOnboardingName(name); setOnboardingCountryCode(countryCode); setOnboardingBirthday(birthday); }}
          onAccountReady={({ name, countryCode, birthday }) => { setOnboardingName(name); setOnboardingCountryCode(countryCode); setOnboardingBirthday(birthday); }}
          onTermsAccepted={beginTingo}
          onComplete={completeOnboarding}
        />}
    </div>;
  }

  return (
    <div className={`app-shell tab-${tab}`}>
      <header className="topbar">
        <button className="brand-lockup" onClick={() => { setTripWorkspaceOpen(false); setTab('home'); }} aria-label="Go to Home">
          <img className="brand-companion" src={cocoAsset('scene-home')} alt="Coco, your travel companion" />
          <span className="wordmark"><b>COCOCRUNCH</b><small>Plan together, design transparently, recover gracefully.</small></span>
        </button>
        {tab !== 'me' && <button className="bell" aria-label="Notifications"><Bell size={19} /><i /></button>}
        {tab === 'me' && (
          <div className="topbar-actions">
            <button className="bell" aria-label="Notifications"><Bell size={19} /><i /></button>
            <details className="profile-menu">
              <summary className="user-profile-avatar-btn" aria-label="Open profile menu"><img className="me-top-user-avatar" src={userAvatar} alt="User profile" draggable={false} /></summary>
              <div><span>ACCOUNT</span><button onClick={() => setTab('me')}>Profile</button><button onClick={() => setTab('me')}>Settings</button></div>
            </details>
          </div>
        )}
      </header>
      <main>{tab === 'home' ? renderHome() : tab === 'trips' ? (tripWorkspaceOpen ? renderTripWorkspace() : renderTrips()) : tab === 'explore' ? renderExplore() : tab === 'memories' ? renderGlobalMemories() : renderMe()}</main>
      <GlobalNav tab={tab} onChange={setTab} onOpenTrips={() => setTripWorkspaceOpen(false)} />
      {renderCourt()}
      {renderDrawer()}

      <GlobalCocoCompanion context={globalCocoContext} onAsk={() => { setTripWorkspaceOpen(true); setTab('trips'); setDrawer('assistant'); }} onPray={() => emitExperience({ type: 'open-prayer', source: 'user-reported', uncertainty: 'Personal prayer only; no weather, itinerary, or provider claim.' })} onNext={() => handleJourneyAction(journeyState.nextAction?.target ?? 'trip')} onEveryday={() => { setTripWorkspaceOpen(true); setTab('trips'); setDrawer('gacha'); }} onLucky={() => { setTripWorkspaceOpen(true); setTab('trips'); setDrawer('lucky'); }} />
    </div>
  );
}
