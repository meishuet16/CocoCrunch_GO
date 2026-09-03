import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell, BookOpen, Box, CalendarDays, Check, ChevronRight, CircleDollarSign, CloudRain,
  Compass, Gavel, Heart, Home, Link2, Map, MapPin, PackageCheck, ReceiptText,
  Send, Sparkles, Users, X
} from 'lucide-react';
import { emitExperience } from './experience';
import { courtTally, type CourtOption, type CourtVote } from './domain/court';
import {
  actualBudget, budgetLearning, budgetVariance, defaultGroupActuals, defaultGroupBudget,
  defaultSoloActuals, defaultSoloBudget, plannedBudget, remainingBudget, sanitizeAmount,
  updateBudget, type BudgetActuals, type BudgetCategory, type BudgetPlan,
} from './domain/budget';
import { discoverPlaces, type DiscoveryPlace } from './domain/discovery';
import {
  learningSummary, reconcileTripLearning, reviewLearningSummary,
  type TravelProfile, type TripReview,
} from './domain/preferences';
import { normalizeBudgetActuals, rateDecision, updateBudgetActual } from './domain/retrospective';
import { loadPersisted, savePersisted, type CourtOptionState, type DecisionRecord } from './persistence';
import { TripLifecycleTabs, TripWorkspaceContext, TripWorkspaceHeader, type TripPhase } from './components/TripWorkspace';
import {
  deriveTingoBehavior, describeTingo, defaultTingoDimensions, scoreTingo, tingoCompletion,
  tingoGuidance, tingoQuestions, type TingoAnswer, type TingoDimensions,
} from './domain/tingo';
import { checkFeasibility, comparisonOptions, importPhotoMetadata } from './domain/adapters';
import {
  applyResponsibilitySuggestions, defaultCommitments, defaultMembers, defaultReminders,
  defaultReunion, slowestMemberMinutes, suggestResponsibilities, type HumanCommitment,
  type ReunionAgreement, type TripConstraint, type TripMember, type TripReminder,
} from './domain/trip';
import cocoCanonicalSheet from './assets/coco/coco-idle.png';

type Tab = 'home' | 'trips' | 'explore' | 'memories' | 'me';
type TripMode = 'group' | 'solo';
type Mood = 'great' | 'okay' | 'tired' | null;
type Privacy = 'status' | 'area' | 'exact';
type Drawer = 'group' | 'backup' | 'budget' | 'family' | 'community' | 'import' | 'discover' | 'tingo' | 'tripSetup' | 'compare' | 'feasibility' | 'reminders' | 'commitments' | 'safety' | 'assistant' | 'gacha' | 'lucky' | 'memoryCard' | null;
type CommunityTrip = { id: number; title: string; author: string; match: number; saved: boolean };
type PlaceRecommendation = DiscoveryPlace & { id: number; saved: boolean; added: boolean };
type GhostWish = { id: number; name: string; reason: string; status: 'resting' | 'revived' | 'released' };
type Backup = { name: string; support: number; cost: number; time: number; viable: boolean };

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

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'trips', label: 'Trips', icon: CalendarDays },
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'memories', label: 'Memories', icon: Box },
  { id: 'me', label: 'Me', icon: Heart },
];

const backups: Backup[] = [
  { name: 'Underground food hall', support: 4, cost: 8, time: 12, viable: true },
  { name: 'Retro kissaten crawl', support: 3, cost: 4, time: 18, viable: true },
  { name: 'Riverside night market', support: 1, cost: -6, time: 6, viable: false },
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
  if (parts.length !== 2) return null;
  return parts.map((label, index) => ({ id: optionSlug(label, index), label }));
}

function Coco({ mood = 'idle', tiny = false }: { mood?: 'idle' | 'happy' | 'panic'; tiny?: boolean }) {
  return <div className={`coco ${mood} ${tiny ? 'tiny' : ''}`} aria-label={`Coco ${mood}`}>
    <span className="coco-canonical" aria-hidden="true"><img src={cocoCanonicalSheet} alt=""/></span>
    <span className="antenna a1"/><span className="antenna a2"/>
    <span className="coco-shell"><i className="eye e1"/><i className="eye e2"/><i className="mouth"/></span>
    <span className="leg l1"/><span className="leg l2"/><span className="leg l3"/>
    <span className="leg r1"/><span className="leg r2"/><span className="leg r3"/>
  </div>;
}

function SectionTitle({ kicker, title, copy }: { kicker: string; title: string; copy?: string }) {
  return <header className="page-title"><span>{kicker}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</header>;
}

function MiniTool({ icon: Icon, label, note, onClick }: { icon: React.ComponentType<{ size?: number }>; label: string; note: string; onClick: () => void }) {
  return <button className="mini-tool" onClick={onClick}><Icon size={18}/><span><b>{label}</b><small>{note}</small></span><ChevronRight size={16}/></button>;
}

export default function AppRescued() {
  const [stored] = useState(() => loadPersisted());
  const [tab, setTab] = useState<Tab>('home');
  const [tripWorkspaceOpen, setTripWorkspaceOpen] = useState(false);
  const [tripPhase, setTripPhase] = useState<TripPhase>('planning');
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [mode, setMode] = useState<TripMode>(stored.mode ?? 'group');
  const [profile, setProfile] = useState<TravelProfile>({ ...defaultProfile, ...stored.profile });
  const [plannerTurn, setPlannerTurn] = useState(stored.plannerTurn ?? 'Mei');
  const [courtOpen, setCourtOpen] = useState(false);
  const [courtOptions, setCourtOptions] = useState<CourtOptionState[]>(stored.courtOptions?.length === 2 ? stored.courtOptions : defaultCourtOptions);
  const [courtVotes, setCourtVotes] = useState<CourtVote[]>(stored.courtVotes?.length ? stored.courtVotes : defaultVotes);
  const [gacha, setGacha] = useState<string | null>(null);
  const [courtDecision, setCourtDecision] = useState<string | null>(stored.courtDecision ?? null);
  const [courtConfirmed, setCourtConfirmed] = useState(Boolean(stored.courtConfirmed));
  const [decisionHistory, setDecisionHistory] = useState<DecisionRecord[]>(stored.decisionHistory ?? []);
  const [delay, setDelay] = useState(false);
  const [replanPreview, setReplanPreview] = useState(false);
  const [emergencyApproved, setEmergencyApproved] = useState(false);
  const [replanApplied, setReplanApplied] = useState(false);
  const [mood, setMood] = useState<Mood>(null);
  const [split, setSplit] = useState(false);
  const [privacy, setPrivacy] = useState<Privacy>(stored.privacy ?? 'status');
  const [continuousLocation, setContinuousLocation] = useState(Boolean(stored.continuousLocation));
  const [reported, setReported] = useState(false);
  const [receiptPrinted, setReceiptPrinted] = useState(false);
  const [worthIt, setWorthIt] = useState<TripReview | null>(stored.worthIt ?? null);
  const [profileLearned, setProfileLearned] = useState(Boolean(stored.profileLearned));
  const [learningChanges, setLearningChanges] = useState<string[]>([]);
  const [tingoAnswers, setTingoAnswers] = useState<TingoAnswer[]>(stored.tingoAnswers ?? []);
  const [tingoDimensions, setTingoDimensions] = useState<TingoDimensions>(stored.tingoDimensions ?? defaultTingoDimensions);
  const [tingoStep, setTingoStep] = useState(0);
  const [basePackingPreferences, setBasePackingPreferences] = useState<string[]>(stored.basePackingPreferences ?? ['comfortable walking shoes', 'portable charger', 'light rain layer']);
  const [tripCreated, setTripCreated] = useState(stored.tripCreated ?? true);
  const [members, setMembers] = useState<TripMember[]>(stored.members ?? defaultMembers);
  const [constraints, setConstraints] = useState<TripConstraint[]>(stored.constraints ?? []);
  const [reminders, setReminders] = useState<TripReminder[]>(stored.reminders ?? defaultReminders);
  const [commitments, setCommitments] = useState<HumanCommitment[]>(stored.commitments ?? defaultCommitments);
  const [reunion, setReunion] = useState<ReunionAgreement>(stored.reunion ?? defaultReunion);
  const [assistantPreview, setAssistantPreview] = useState(false);
  const [assistantApplied, setAssistantApplied] = useState(false);
  const [assistantUndone, setAssistantUndone] = useState(false);
  const [cafeTime, setCafeTime] = useState('14:30');
  const [everydayGacha, setEverydayGacha] = useState<string | null>(null);
  const [tradeAccepted, setTradeAccepted] = useState(false);
  const [tradeSnapshot, setTradeSnapshot] = useState<CourtVote[] | null>(null);
  const [draftConflict, setDraftConflict] = useState('');
  const [conflictMarked, setConflictMarked] = useState(false);
  const [activeConflict, setActiveConflict] = useState(stored.activeConflict ?? 'Ramen tonight vs Sushi tonight');
  const [luckyDraw, setLuckyDraw] = useState<string | null>(null);
  const [memoryNote, setMemoryNote] = useState(stored.memoryNote ?? 'The rain made us choose slower, and that was the best part.');
  const [memoryPublic, setMemoryPublic] = useState(Boolean(stored.memoryPublic));
  const [photoImport, setPhotoImport] = useState(false);
  const [arrivalChecked, setArrivalChecked] = useState(false);
  const [itemReviews, setItemReviews] = useState<Record<string, 'worth' | 'mixed' | 'skip'>>(stored.itemReviews ?? {});
  const [photoIndexed, setPhotoIndexed] = useState(false);
  const [journalGenerated, setJournalGenerated] = useState(false);
  const [published, setPublished] = useState(Boolean(stored.published));
  const [externalLink, setExternalLink] = useState('https://example.com/tokyo-cafe-list');
  const [linkAnalyzed, setLinkAnalyzed] = useState(false);
  const [destination, setDestination] = useState(stored.destination ?? 'Tokyo');
  const [destinationSearched, setDestinationSearched] = useState(true);
  const [recommendations, setRecommendations] = useState<PlaceRecommendation[]>(() => makeRecommendations(stored.destination ?? 'Tokyo', stored.tingoDimensions ?? defaultTingoDimensions, stored.recommendations));
  const [groupBudgetTotal, setGroupBudgetTotal] = useState(stored.groupBudgetTotal ?? 2400);
  const [soloBudgetTotal, setSoloBudgetTotal] = useState(stored.soloBudgetTotal ?? 1200);
  const [groupBudgetPlan, setGroupBudgetPlan] = useState<BudgetPlan>(stored.groupBudgetPlan ?? defaultGroupBudget);
  const [soloBudgetPlan, setSoloBudgetPlan] = useState<BudgetPlan>(stored.soloBudgetPlan ?? defaultSoloBudget);
  const [groupBudgetActuals, setGroupBudgetActuals] = useState<BudgetActuals>(() => normalizeBudgetActuals(stored.groupBudgetActuals, defaultGroupActuals));
  const [soloBudgetActuals, setSoloBudgetActuals] = useState<BudgetActuals>(() => normalizeBudgetActuals(stored.soloBudgetActuals, defaultSoloActuals));
  const [communityTrips, setCommunityTrips] = useState<CommunityTrip[]>([
    { id: 1, title: 'Tokyo: slow food + vintage streets', author: 'Aki', match: 92, saved: false },
    { id: 2, title: 'Rain-proof Tokyo weekend', author: 'Mina', match: 86, saved: false },
  ]);
  const [trunkOpen, setTrunkOpen] = useState(false);
  const [ghostWishes, setGhostWishes] = useState<GhostWish[]>([
    { id: 1, name: 'Riverside night market', reason: 'Rain made the route unreliable.', status: 'resting' },
    { id: 2, name: 'Late-night observation deck', reason: 'Group energy dropped below the planned pace.', status: 'resting' },
  ]);
  const [futurePostcard, setFuturePostcard] = useState('Leave one evening unplanned. You liked the surprise more than the perfect schedule.');
  const [postcardSealed, setPostcardSealed] = useState(false);

  const tally = useMemo(() => courtTally(courtVotes), [courtVotes]);
  const tingoBehavior = useMemo(() => deriveTingoBehavior(tingoDimensions), [tingoDimensions]);
  const tingoPlanGuidance = useMemo(() => tingoGuidance(tingoDimensions), [tingoDimensions]);
  const responsibilitySuggestions = useMemo(() => suggestResponsibilities(members, tingoBehavior), [members, tingoBehavior]);
  const budgetPlan = mode === 'group' ? groupBudgetPlan : soloBudgetPlan;
  const budgetActuals = mode === 'group' ? groupBudgetActuals : soloBudgetActuals;
  const budgetTotal = mode === 'group' ? groupBudgetTotal : soloBudgetTotal;
  const planned = plannedBudget(budgetPlan);
  const spent = actualBudget(budgetActuals);
  const replanCost = replanApplied ? 8 : 0;
  const remaining = remainingBudget(budgetTotal, spent, replanCost);
  const categoryVariance = budgetVariance(budgetPlan, budgetActuals);
  const budgetLearningNotes = budgetLearning(budgetActuals, budgetPlan);
  const travellerCount = mode === 'group' ? members.filter(member => member.inviteStatus === 'joined').length : 1;
  const planHealth = replanApplied ? 91 : 86;
  const optionLabel = (id: string | null) => courtOptions.find(option => option.id === id)?.label ?? id ?? '';
  const majorityDecision = tally.majority ? optionLabel(tally.majority) : null;
  const proposedDecision = gacha ?? majorityDecision;
  const actualPaceCopy = delay || mood === 'tired' ? 'Slower than planned after disruption / energy change' : arrivalChecked ? 'Matched the planned rhythm' : 'No completed pace signal yet';
  const cocoMood: 'idle' | 'happy' | 'panic' = delay && !replanApplied ? 'panic' : courtConfirmed || replanApplied || reported || receiptPrinted ? 'happy' : 'idle';

  useEffect(() => {
    savePersisted({
      version: 1, mode, destination, profile, plannerTurn, courtVotes, courtConfirmed, courtDecision,
      courtOptions, activeConflict, decisionHistory,
      groupBudgetTotal, soloBudgetTotal, groupBudgetPlan, soloBudgetPlan, groupBudgetActuals, soloBudgetActuals,
      privacy, continuousLocation,
      recommendations: recommendations.map(({ name, saved, added }) => ({ name, saved, added })),
      worthIt, profileLearned, tingoAnswers, tingoDimensions, basePackingPreferences, tripCreated,
      members, constraints, reminders, commitments, reunion, published, memoryNote, memoryPublic, itemReviews,
    });
  }, [mode, destination, profile, plannerTurn, courtVotes, courtConfirmed, courtDecision, courtOptions, activeConflict, decisionHistory, groupBudgetTotal, soloBudgetTotal, groupBudgetPlan, soloBudgetPlan, groupBudgetActuals, soloBudgetActuals, privacy, continuousLocation, recommendations, worthIt, profileLearned, tingoAnswers, tingoDimensions, basePackingPreferences, tripCreated, members, constraints, reminders, commitments, reunion, published, memoryNote, memoryPublic, itemReviews]);

  function setProfileField(field: keyof TravelProfile, value: string) {
    setProfile(current => ({ ...current, [field]: value }));
    setProfileLearned(false);
    setLearningChanges([]);
  }

  function searchDestination() {
    setRecommendations(makeRecommendations(destination, tingoDimensions, recommendations));
    setDestinationSearched(true);
  }

  function toggleRecommendation(id: number, action: 'save' | 'add') {
    const place = recommendations.find(item => item.id === id);
    if (action === 'save' && place && !place.saved) emitExperience({ type: 'capture-place', place: place.name });
    setRecommendations(items => items.map(item => item.id === id ? { ...item, [action === 'save' ? 'saved' : 'added']: !item[action === 'save' ? 'saved' : 'added'] } : item));
  }

  function castVote(member: string, pick: CourtOption) {
    setCourtVotes(votes => votes.map(vote => vote.member === member ? { ...vote, pick } : vote));
    setGacha(null);
    setCourtConfirmed(false);
    setCourtDecision(null);
  }

  function attachConcession() {
    if (!tradeAccepted) {
      setTradeSnapshot(courtVotes.map(vote => ({ ...vote })));
      setTradeAccepted(true);
      return;
    }
    if (tradeSnapshot) setCourtVotes(tradeSnapshot);
    setTradeSnapshot(null);
    setTradeAccepted(false);
    setGacha(null);
    setCourtConfirmed(false);
    setCourtDecision(null);
  }

  function confirmCourt() {
    if (!proposedDecision) return;
    const decision = proposedDecision;
    setCourtDecision(decision);
    setCourtConfirmed(true);
    setDecisionHistory(history => {
      if (history[0]?.kind === 'court' && history[0].topic === activeConflict && history[0].decision === decision) return history;
      const voteSummary = courtOptions.map(option => `${option.label}: ${tally.counts[option.id] ?? 0}`).join(' · ');
      return [{ id: `court-${Date.now()}`, kind: 'court', topic: activeConflict, decision, voteSummary, usedGacha: Boolean(gacha), createdAt: new Date().toISOString() }, ...history];
    });
  }

  function applyRepair() {
    setReplanApplied(true);
    setDecisionHistory(history => history.some(record => record.kind === 'emergency' && record.topic === 'Heavy rain disruption') ? history : [{ id: `emergency-${Date.now()}`, kind: 'emergency', topic: 'Heavy rain disruption', decision: 'Underground food hall accepted; Mystery Window moved to 19:00', voteSummary: mode === 'group' ? 'Emergency Court approved 3/4' : 'Solo confirmation', usedGacha: false, createdAt: new Date().toISOString() }, ...history]);
    emitExperience({ type: 'open-prayer' });
  }

  function printReceipt() {
    setReceiptPrinted(true);
    emitExperience({ type: 'print-receipt' });
  }

  function sendFamilyReassurance() {
    setReported(true);
    emitExperience({ type: 'send-family-reassurance', destination, privacy, delayed: delay });
  }

  function confirmLearning() {
    if (!worthIt) return;
    const next = reconcileTripLearning(profile, worthIt, itemReviews);
    setLearningChanges([...learningSummary(profile, next), ...reviewLearningSummary(itemReviews)]);
    setProfile(next);
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

  function answerTingo(optionId: string) {
    const question = tingoQuestions[tingoStep];
    setTingoAnswers(current => {
      const next = [...current.filter(answer => answer.questionId !== question.id), { questionId: question.id, optionId }];
      setTingoDimensions(scoreTingo(next));
      return next;
    });
    if (tingoStep < tingoQuestions.length - 1) setTingoStep(step => step + 1);
  }

  function finishTingo() {
    const dimensions = scoreTingo(tingoAnswers);
    setTingoDimensions(dimensions);
    setRecommendations(current => makeRecommendations(destination, dimensions, current));
    setProfile(current => ({ ...current, vibe: dimensions.food >= 2 ? 'Relax + Food' : dimensions.adventure >= 2 ? 'Culture + Adventure' : 'Slow + Flexible', flexible: dimensions.flexibility >= 2 ? 'Evening activity can move' : 'Explain changes before moving anything' }));
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
    const options = ['Take the café route', 'Follow the riverside route'];
    setEverydayGacha(options[Math.floor(Math.random() * options.length)]);
  }

  function markConflict() {
    const conflict = draftConflict.trim();
    if (!conflict) return;
    const parsedOptions = parseConflictOptions(conflict);
    setActiveConflict(conflict);
    setConflictMarked(true);
    setCourtConfirmed(false);
    setCourtDecision(null);
    setGacha(null);
    setTradeAccepted(false);
    setTradeSnapshot(null);
    if (parsedOptions) {
      setCourtOptions(parsedOptions);
      setCourtVotes(members.filter(member => member.inviteStatus === 'joined').map((member, index) => ({ member: member.name, pick: parsedOptions[index % 2].id })));
    }
    setDraftConflict('');
    setDrawer(null);
    setCourtOpen(true);
  }

  function renderHome() {
    return <>
      <section className="home-hero paper-sheet"><div><span className="eyebrow">YOUR TRAVEL NOTEBOOK</span><h2>Good morning, Mei.</h2><p>One protected highlight, a little room to wander, and Coco keeping the plan human.</p><button className="hero-link" onClick={() => openTrip('planning')}>Open {destination} trip <ChevronRight size={15}/></button></div><Coco mood={cocoMood}/></section>
      <section className="today-card"><div className="today-head"><div><span>Today’s journey</span><b>Oct 13 · 18°C · cloudy</b></div><button onClick={() => openTrip('planning')}>Full plan <ChevronRight size={15}/></button></div><div className="journey-line"><div className="journey-stop anchor"><time>10:00</time><span/><div><b>{profile.mustGo}</b><small>⚓ Anchor · protected</small></div></div><div className="journey-stop"><time>{cafeTime}</time><span/><div><b>Scenic café block</b><small>🫧 Floating · flexible</small></div></div><div className="journey-stop mystery"><time>17:00</time><span/><div><b>Mystery Window</b><small>🎰 Open · spontaneous slot</small></div></div></div></section>
      <section className="status-strip"><div><span>Plan health</span><b>{planHealth}/100</b></div><div><span>Budget left</span><b>RM {remaining}</b></div><div><span>Group</span><b>{travellerCount} people</b></div></section>
      <section className="home-tools"><MiniTool icon={MapPin} label="Discover places" note={`Tingo-ranked · ${tingoBehavior.recommendationBias} bias`} onClick={() => setTab('explore')}/><MiniTool icon={Users} label="Group DNA" note={courtConfirmed ? 'Latest conflict resolved' : '1 conflict needs a decision'} onClick={() => setDrawer('group')}/><MiniTool icon={PackageCheck} label="Packing" note={`${basePackingPreferences.length} habits + trip essentials`} onClick={openPacking}/><MiniTool icon={Send} label="Family Window" note="Status-only sharing by default" onClick={() => setDrawer('family')}/></section>
    </>;
  }

  function renderTrips() {
    return <>
      <SectionTitle kicker="TRIPS · YOUR NOTEBOOK" title="Keep the trip in view." copy="Planning, traveling, and remembering all belong to the same journey."/>
      <button className="new-trip-link" onClick={() => { setTripCreated(false); setDrawer('tripSetup'); }}>+ Start a new trip</button>
      <section className="trip-card active-trip paper-sheet"><div className="trip-card-art"><span>COCOCRUNCH</span><b>{destination}</b><small>12–21 Oct 2026 · {travellerCount} travellers</small><i>✦</i></div><div className="trip-card-body"><div className="trip-card-heading"><div><span>IN MOTION</span><h3>{destination} · slow food + small discoveries</h3></div><b>{planHealth}</b></div><div className="trip-phase-preview"><span className={tripPhase === 'planning' ? 'active' : ''}>Planning</span><span className={tripPhase === 'traveling' ? 'active' : ''}>Traveling</span><span className={tripPhase === 'completed' ? 'active' : ''}>Completed</span></div><p>Today: {profile.mustGo} · one open pocket</p><button className="primary" onClick={() => openTrip(tripPhase)}>Continue trip <ChevronRight size={16}/></button></div></section>
      <section className="trip-list"><div className="section-rule"><span>OTHER TRIPS</span><button onClick={() => setTab('explore')}>Find inspiration <ChevronRight size={14}/></button></div><article className="trip-list-row"><div className="trip-thumb sea-thumb"/><div><b>Jeju · salt air and citrus</b><small>Completed · 5 days · shared privately</small></div><button onClick={() => openTrip('completed')} aria-label="Open Jeju trip"><ChevronRight size={17}/></button></article><article className="trip-list-row"><div className="trip-thumb blue-thumb"/><div><b>Kyoto · temple mornings</b><small>Draft · solo · 3 anchor ideas</small></div><button onClick={() => openTrip('planning')} aria-label="Open Kyoto trip"><ChevronRight size={17}/></button></article></section>
      <section className="trip-footer-note"><Coco tiny mood="happy"/><div><b>Every trip gets a little wiser.</b><small>Reviews and category-level actual spend feed back into your private Tingo Card.</small></div></section>
    </>;
  }

  function renderExplore() {
    return <>
      <SectionTitle kicker="EXPLORE · COCO PICKS" title="Borrow a feeling, make it yours." copy="Prototype places and openly shared trips, ranked against your Tingo pace, budget, and must-go."/>
      <section className="explore-hero paper-sheet"><div><span>YOUR NEXT LITTLE YES</span><h3>Rain-proof Tokyo, still full of flavour.</h3><p>{tingoBehavior.recommendationBias} discovery · {tingoBehavior.itineraryDensity} pace · {tingoBehavior.budgetMode} budget</p><button className="primary" onClick={() => setDrawer('discover')}>Explore places <ChevronRight size={16}/></button></div><div className="explore-orbit" aria-hidden="true"><span>✦</span><span>○</span><span>✧</span></div></section>
      <div className="explore-section-heading"><span>COMMUNITY NOTEBOOKS</span><button onClick={() => setDrawer('community')}>See all <ChevronRight size={14}/></button></div>
      <section className="explore-community">{communityTrips.map(trip => <article className="explore-community-card" key={trip.id}><div className={trip.id === 1 ? 'community-photo street-photo' : 'community-photo rain-photo'}><span>{trip.match}% fit</span></div><div><b>{trip.title}</b><small>By {trip.author} · explicitly shared</small><button onClick={() => setCommunityTrips(items => items.map(item => item.id === trip.id ? { ...item, saved: !item.saved } : item))}>{trip.saved ? 'Saved to ideas' : 'Save idea'}</button></div></article>)}</section>
      <div className="explore-section-heading"><span>TRIP VIBES</span><span className="quiet-note">Driven by Tingo profile</span></div><section className="vibe-row"><button className="vibe-chip active">{tingoBehavior.recommendationBias} first</button><button className="vibe-chip">{tingoBehavior.itineraryDensity} days</button><button className="vibe-chip">{tingoBehavior.accommodationBias} stay</button><button className="vibe-chip">{tingoBehavior.changeStyle} changes</button></section>
    </>;
  }

  function renderGlobalMemories() {
    return <>
      <SectionTitle kicker="MEMORIES · YOUR ARCHIVE" title="The trips that stayed with you." copy="Private by default. Keep the decisions, detours, and tiny wins close."/>
      <section className="memory-archive-feature paper-sheet"><div className="archive-photo"><span>OCT 2026</span><b>{destination}</b></div><div><span>LAST TRIP · 4.2 / 5</span><h3>Rain changed the evening. The group kept the promise.</h3><p>18 photos · {decisionHistory.length} decisions · RM {spent + replanCost} actual</p><button className="primary" onClick={() => openTrip('completed')}>Open Memory Trunk <ChevronRight size={16}/></button></div></section>
      <div className="explore-section-heading"><span>KEEPSAKE SHELF</span><span className="quiet-note">Only you can see these</span></div><section className="keepsake-grid"><article><span>PHOTO MAP</span><b>4 places</b><small>Tsukiji · café · underground · hotel</small></article><article><span>FUTURE POSTCARD</span><b>1 sealed</b><small>Waiting for your next trip</small></article><article><span>GHOST WISHES</span><b>{ghostWishes.length} remembered</b><small>Some plans can come back</small></article></section>
      <section className="community-entry"><div><span>COMMUNITY</span><b>{published ? 'Published with consent' : 'Private by default'}</b><small>Nothing becomes public without an explicit action.</small></div><button onClick={() => setDrawer('community')}>Manage</button></section>
    </>;
  }

  function renderTripWorkspace() {
    return <>
      <TripWorkspaceHeader destination={destination} travellerCount={travellerCount} planHealth={planHealth} onBack={openTripsIndex} />
      <TripLifecycleTabs phase={tripPhase} onChange={setTripPhase} />
      <TripWorkspaceContext phase={tripPhase} onExit={openTripsIndex} />
      {tripPhase === 'planning' ? renderPlan() : tripPhase === 'traveling' ? renderDuring() : renderMemories()}
    </>;
  }

  function renderPlan() {
    const first = courtOptions[0];
    const second = courtOptions[1];
    const firstCount = first ? tally.counts[first.id] ?? 0 : 0;
    const secondCount = second ? tally.counts[second.id] ?? 0 : 0;
    return <>
      <SectionTitle kicker="PLAN · TRAVEL NOTEBOOK" title="Build a plan that can bend." copy="Keep the important things firm. Let the rest breathe."/>
      {!tripCreated && <section className="setup-banner"><div><span>NEW TRIP</span><b>Give this journey a home before Coco plans it.</b><small>Destination, people, vibe, constraints, then a reviewable plan.</small></div><button className="primary" onClick={() => setDrawer('tripSetup')}>Set up trip <ChevronRight size={15}/></button></section>}
      <section className="trip-promise paper-strip"><span>TRIP PROMISE</span><b>{tingoBehavior.itineraryDensity} pace · {tingoBehavior.dailyStops} meaningful stops · {tingoBehavior.bufferMinutes} min buffers · one protected highlight</b></section>
      <section className="plan-intake"><MiniTool icon={Heart} label="Tingo Card" note={`${tingoCompletion(tingoAnswers)}% complete · ${describeTingo(tingoDimensions).slice(0, 2).join(' · ')}`} onClick={() => setDrawer('tingo')}/><MiniTool icon={Users} label="Know us" note={`${members.filter(member => member.inviteStatus === 'joined').length}/${members.length} travellers · DNA + roles`} onClick={() => setDrawer('group')}/><MiniTool icon={MapPin} label="Trip inputs" note={`${constraints.length || 4} constraints · ${destination}`} onClick={() => setDrawer('tripSetup')}/><MiniTool icon={CircleDollarSign} label="Compare options" note="Deterministic price + deal adapter" onClick={() => setDrawer('compare')}/></section>
      <button className="mini-tool" onClick={() => setDrawer('discover')}><MapPin size={18}/><span><b>Find places in {destination}</b><small>Tingo-ranked for {tingoBehavior.recommendationBias} · {tingoBehavior.budgetMode}</small></span><ChevronRight size={16}/></button>
      <section className="itinerary-sheet paper-sheet"><div className="sheet-heading"><div><span>DAY 2</span><h3>{destination} · city wandering</h3></div><div className="score-stamp">{planHealth}</div></div><div className="itinerary-row anchor"><time>10:00</time><div><b>{profile.mustGo}</b><small>Must-Go · cannot be AI-replaced</small></div><em>ANCHOR</em></div><div className="itinerary-row"><time>{cafeTime}</time><div><b>Scenic café block</b><small>{profile.preference}</small></div><em>FLOATING</em></div><div className="itinerary-row mystery"><time>17:00</time><div><b>Mystery Window</b><small>{profile.flexible}</small></div><em>OPEN</em></div><div className="itinerary-row anchor"><time>19:30</time><div><b>{courtConfirmed && courtDecision ? courtDecision : 'Neighbourhood dinner'}</b><small>{courtConfirmed ? 'Confirmed by Group Court · official timeline' : 'Group reunion point'}</small></div><em>ANCHOR</em></div></section>
      <section className="why-note"><Sparkles size={19}/><div><b>Why this plan?</b><p>{tingoPlanGuidance.itineraryGuidance} {tingoPlanGuidance.budgetGuidance}</p></div></section>
      <section className="plan-health"><div className="section-rule"><span>PLAN HEALTH · EXPLAINED</span><button onClick={() => setDrawer('feasibility')}>Run checks <ChevronRight size={14}/></button></div><div className="health-score"><b>{planHealth}</b><span><strong>Healthy with one watch item</strong><small>Based on pace, budget, food match, transfer time, and protected anchors.</small></span></div><div className="health-metrics"><span>Walk <b>{(4.2 * slowestMemberMinutes(members)).toFixed(1)} km</b></span><span>Pressure <b>low</b></span><span>Budget <b>RM {remaining}</b></span><span>Anchors <b>2 protected</b></span></div></section>
      <section className="plan-toolbox"><MiniTool icon={Users} label="Group workspace" note={`Editing turn: ${plannerTurn}`} onClick={() => setDrawer('group')}/><MiniTool icon={Box} label="Backup Plan pool" note="2 viable · 1 weather-blocked" onClick={() => setDrawer('backup')}/><MiniTool icon={CircleDollarSign} label="Budget planner" note={`RM ${planned} planned of RM ${budgetTotal}`} onClick={() => setDrawer('budget')}/><MiniTool icon={Link2} label="Import inspiration" note="Source parser demo" onClick={() => setDrawer('import')}/></section>
      {mode === 'group' && <section className="conflict-ticket"><span>{courtConfirmed ? 'COURT DECISION RECORDED' : 'UNRESOLVED CONFLICT'}</span><b>{activeConflict}</b><small>{first?.label ?? 'Option A'} {firstCount} · {second?.label ?? 'Option B'} {secondCount} · {tally.tied ? 'tie · Gacha is eligible' : `${optionLabel(tally.majority)} has majority`}</small><button className="ritual-trigger" onClick={() => setCourtOpen(true)}>{courtConfirmed ? 'Review Group Court' : 'Open Group Court'} <Gavel size={18}/></button></section>}
    </>;
  }

  function renderDuring() {
    return <>
      <SectionTitle kicker="DURING · LIVE TRIP" title={delay ? 'Reality changed.' : 'The trip is moving.'} copy="Coco watches the plan, not your every step."/>
      <section className={`live-map ${delay ? 'rain' : ''}`}><div className="map-top"><span><MapPin size={15}/> {destination} area</span><b>{delay ? '30 min behind' : 'On schedule'}</b></div><svg viewBox="0 0 340 180" role="img" aria-label="Schematic route map"><path d="M25 135 C78 64 132 126 185 85 S265 52 315 42"/><circle cx="25" cy="135" r="6"/><circle cx="185" cy="85" r="6"/><circle cx="315" cy="42" r="7"/></svg><div className="ride-coco"><Coco tiny mood={delay ? 'panic' : 'happy'}/></div><div className="next-stop"><span>Next</span><b>{delay ? 'Replan needed' : `Floating café block · ${cafeTime}`}</b></div></section>
      <section className="arrival-check"><div><span>PROGRESS CHECK</span><b>{arrivalChecked ? 'Arrived at the anchor.' : 'Has the group reached the morning anchor?'}</b><small>Manual check-in is always available; location permission is not required.</small></div><button onClick={() => setArrivalChecked(!arrivalChecked)}>{arrivalChecked ? 'Undo check-in' : 'Mark arrived'}</button></section>
      {!delay && <button className="event-button" onClick={() => { setDelay(true); setReplanPreview(false); setReplanApplied(false); setEmergencyApproved(false); }}><CloudRain size={20}/> Simulate heavy rain disruption</button>}
      {delay && !replanApplied && <section className="disruption-stage"><div className="disruption-head"><CloudRain size={26}/><div><span>OUTDOOR BLOCK FAILED</span><b>17:00 market is no longer viable.</b></div></div>{!replanPreview ? <><div className="ghost-suggestion"><span>👻 GHOST REVIVAL</span><b>Underground food hall</b><small>Highest-support viable backup · +RM8 · +12 min · Anchor protected</small></div><button className="primary" onClick={() => setReplanPreview(true)}>Preview minimum-loss repair</button></> : <><div className="change-ticket"><div><span>KEEP</span><b>{profile.mustGo}</b></div><div><span>REPLACE</span><b>Market → food hall</b></div><div><span>MOVE</span><b>Mystery Window → 19:00</b></div><div><span>IMPACT</span><b>+RM8 · +12 min</b></div></div>{mode === 'group' && <div className="emergency-court"><span>EMERGENCY COURT · 90 SEC</span><b>{emergencyApproved ? 'Approved · 3/4' : 'Group approval required'}</b><button onClick={() => setEmergencyApproved(true)}>{emergencyApproved ? '✓ Approved' : 'Simulate group approval'}</button></div>}<div className="action-row"><button className="secondary" onClick={() => setReplanPreview(false)}>Not now</button><button className="primary" disabled={mode === 'group' && !emergencyApproved} onClick={applyRepair}>Apply repair</button></div></>}</section>}
      {replanApplied && <section className="success-note"><Check size={21}/><div><b>Plan repaired.</b><small>Anchor protected · Mystery Window moved · +RM8 · undo available</small></div><button onClick={() => setReplanApplied(false)}>Undo</button></section>}
      <section className="energy-check"><span>HOW’S THE GROUP?</span><div>{(['great','okay','tired'] as const).map(value => <button key={value} className={mood === value ? 'active' : ''} onClick={() => setMood(value)}>{value === 'great' ? '⚡ Great' : value === 'okay' ? '🙂 Okay' : '🥱 Tired'}</button>)}</div>{mood === 'tired' && <small>Coco suggests dropping one floating item and adding 45 min rest. Anchors stay untouched.</small>}</section>
      {mode === 'group' && <section className="heartbeat"><span>GROUP HEARTBEAT</span><b>{delay ? 'Needs a decision' : split ? 'Can reunite on time' : arrivalChecked ? 'Together at the anchor' : 'Status check pending'}</b><small>Only shared status is shown. Exact group coordinates stay hidden by default.</small></section>}
      {mode === 'group' && <section className="split-note"><div><span>SMART SPLIT</span><b>{split ? '2 café · 2 shopping' : 'Different energy levels?'}</b><small>{split ? 'Reunion · 19:30 · ±15 min' : 'Split only when both mini-plans stay feasible.'}</small>{split && <div className="split-timelines"><span>Mei + Zi Shan · café · 14:30</span><span>JH + Alex · shopping · 14:30</span></div>}</div><button onClick={() => setSplit(!split)}>{split ? 'Cancel' : 'Create split'}</button></section>}
      <section className="during-tools"><MiniTool icon={Send} label="Family Window" note={reported ? 'Latest reassurance sent' : 'Reassurance, not surveillance'} onClick={() => setDrawer('family')}/><MiniTool icon={MapPin} label="Location privacy" note={continuousLocation ? 'Continuous location on by consent' : 'Continuous location off'} onClick={() => setDrawer('family')}/><MiniTool icon={Users} label="Reunion agreement" note={`${reunion.place} · ${reunion.time} · ±${reunion.tolerance} min`} onClick={() => setDrawer('commitments')}/><MiniTool icon={Heart} label="Safety + local help" note="Prototype contact and nearby useful info" onClick={() => setDrawer('safety')}/><MiniTool icon={Sparkles} label="Ask Coco" note={assistantApplied ? 'Suggestion applied · undo available' : 'Read-only until you confirm'} onClick={() => setDrawer('assistant')}/><MiniTool icon={Sparkles} label="Everyday Gacha" note="Real choice · never governance" onClick={() => setDrawer('gacha')}/><MiniTool icon={Sparkles} label="Lucky Draw" note="Entertainment only · isolated from decisions" onClick={() => setDrawer('lucky')}/></section>
    </>;
  }

  function renderMemories() {
    return <>
      <SectionTitle kicker="AFTER · MEMORY TRUNK" title="Keep what the trip taught you." copy="Photos, choices, little failures, and the things you would do again."/>
      <button className={`trunk-hero trunk-button ${trunkOpen ? 'open' : ''}`} aria-expanded={trunkOpen} onClick={() => setTrunkOpen(open => !open)}><div className="trunk-lid"/><div className="trunk-body"><span className="postcard p1">{destination.toUpperCase()}</span><span className="postcard p2">雨の日</span><span className="ticket">10.13</span><Coco tiny mood="happy"/></div><small>{trunkOpen ? 'Tap to close the trunk' : 'Tap to open the trunk'}</small></button>
      {trunkOpen && <section className="trunk-contents paper-sheet"><b>Trip keepsakes</b><span>🎫 Day 2 transit stub</span><span>🧾 Dinner split receipt</span><span>📸 Rainy underground detour</span><span>⚖️ {courtDecision ?? 'No Court verdict saved yet'}</span></section>}
      <section className="memory-actions"><button onClick={() => { setPhotoIndexed(true); setPhotoImport(true); }}><Map size={20}/><span><b>Photo Map</b><small>{photoIndexed ? `${importPhotoMetadata().imported} photos indexed · ${importPhotoMetadata().grouped} areas` : 'Index local photo metadata'}</small></span></button><button onClick={() => setJournalGenerated(true)}><BookOpen size={20}/><span><b>Travel journal</b><small>{journalGenerated ? 'Draft generated' : 'Generate from timeline + photos'}</small></span></button></section>
      {photoImport && <section className="adapter-note"><b>Metadata adapter complete.</b><small>{importPhotoMetadata().note}</small></section>}
      <section className="memory-note-card"><div><span>MEMORY NOTE</span><b>Leave one thought with the photo.</b></div><textarea value={memoryNote} onChange={e => setMemoryNote(e.target.value)} aria-label="Memory note"/><label><input type="checkbox" checked={memoryPublic} onChange={e => setMemoryPublic(e.target.checked)}/> Public only if I explicitly choose it</label><small>{memoryPublic ? 'Ready for Community after confirmation.' : 'Private in your archive.'}</small></section>
      <button className="memory-card-trigger" onClick={() => setDrawer('memoryCard')}><span>MEMORY STICKER CARD</span><b>Make one moment collectible <ChevronRight size={15}/></b></button>
      <section className="review-items"><div className="section-rule"><span>HOW EACH STOP FELT</span><span className="quiet-note">Feeds future recommendations</span></div><div className="review-item"><div><b>{profile.mustGo}</b><small>Must-Go anchor · actual visit</small></div><div className="rating-row"><button className={itemReviews.anchor === 'worth' ? 'active' : ''} onClick={() => setItemReviews(current => ({ ...current, anchor: 'worth' }))}>Worth it</button><button className={itemReviews.anchor === 'mixed' ? 'active' : ''} onClick={() => setItemReviews(current => ({ ...current, anchor: 'mixed' }))}>Mixed</button><button className={itemReviews.anchor === 'skip' ? 'active' : ''} onClick={() => setItemReviews(current => ({ ...current, anchor: 'skip' }))}>Skip next time</button></div></div><div className="review-item"><div><b>Scenic café block</b><small>Preference · stayed flexible</small></div><div className="rating-row"><button className={itemReviews.cafe === 'worth' ? 'active' : ''} onClick={() => setItemReviews(current => ({ ...current, cafe: 'worth' }))}>Worth it</button><button className={itemReviews.cafe === 'mixed' ? 'active' : ''} onClick={() => setItemReviews(current => ({ ...current, cafe: 'mixed' }))}>Mixed</button><button className={itemReviews.cafe === 'skip' ? 'active' : ''} onClick={() => setItemReviews(current => ({ ...current, cafe: 'skip' }))}>Skip next time</button></div></div></section>
      {journalGenerated && <section className="postcard-note"><span>OCT 13 · {destination.toUpperCase()}</span><p>Rain changed the evening, but the group kept the one thing everyone cared about. We ended up underground, warmer, later, and somehow happier.</p><small>Prototype draft · editable before saving</small></section>}
      <section className="ghost-wish"><span>GHOST WISH CEMETERY</span><h3>Trips that didn’t make it.</h3>{ghostWishes.map(wish => <div className={`ghost-wish-row ${wish.status}`} key={wish.id}><div><b>{wish.name}</b><small>{wish.reason}</small><em>{wish.status === 'resting' ? 'Still remembered' : wish.status === 'revived' ? 'Revived into Backup Plan' : 'Released, history kept'}</em></div>{wish.status === 'resting' && <div><button onClick={() => setGhostWishes(items => items.map(item => item.id === wish.id ? { ...item, status: 'revived' } : item))}>Revive</button><button onClick={() => setGhostWishes(items => items.map(item => item.id === wish.id ? { ...item, status: 'released' } : item))}>超度行程</button></div>}</div>)}</section>
      <section className="future-postcard"><span>FUTURE POSTCARD</span><h3>To your next-trip self.</h3>{postcardSealed ? <div className="sealed-postcard"><b>✉ Sealed for the next trip</b><button onClick={() => setPostcardSealed(false)}>Reopen</button></div> : <><textarea value={futurePostcard} onChange={e => setFuturePostcard(e.target.value)}/><button className="primary" onClick={() => setPostcardSealed(true)}>Seal postcard</button></>}</section>
      <section className="worth-card"><span>WORTH IT?</span><h3>Would you choose this kind of day again?</h3><div>{(['yes','mixed','no'] as const).map(value => <button key={value} className={worthIt === value ? 'active' : ''} onClick={() => { setWorthIt(value); setProfileLearned(false); setLearningChanges([]); }}>{value === 'yes' ? 'Worth it' : value === 'mixed' ? 'Mixed' : 'Not really'}</button>)}</div>{worthIt && <p>Coco combines your overall review with stop-level reviews, but only after you confirm it.</p>}{worthIt && <button className="secondary" onClick={confirmLearning}>{profileLearned ? '✓ Profile updated' : 'Confirm this learning'}</button>}{learningChanges.length > 0 && <div className="learning-changes">{learningChanges.map(change => <small key={change}>{change}</small>)}</div>}</section>
      <section className="review-ledger paper-sheet"><div><span>Budget vs actual</span><b>RM {spent + replanCost} spent</b><small>RM {remaining} remaining</small></div><div><span>Decisions</span><b>{decisionHistory.length} recorded</b><small>{decisionHistory[0] ? `${decisionHistory[0].topic} · ${decisionHistory[0].decision}` : 'No Court history yet'}</small></div></section>
      {decisionHistory.length > 0 && <section className="review-items"><div className="section-rule"><span>DECISION HISTORY · SATISFACTION</span><span className="quiet-note">Saved to the exact decision</span></div>{decisionHistory.map(record => <div className="review-item" key={record.id}><div><b>{record.topic}</b><small>{record.decision} · {record.usedGacha ? 'Gacha tie-break' : record.kind === 'court' ? 'Court decision' : 'Emergency decision'}</small></div><div className="rating-row">{(['worth','mixed','skip'] as const).map(value => <button key={value} className={record.satisfaction === value ? 'active' : ''} onClick={() => rateDecisionRecord(record.id, value)}>{value === 'worth' ? 'Worth it' : value === 'mixed' ? 'Mixed' : 'Skip next time'}</button>)}</div></div>)}</section>}
      <section className="compare-ledger"><span>CATEGORY BUDGET · PLANNED VS ACTUAL</span>{categoryVariance.map(item => <div key={item.category}><b>{item.category}</b><i className={item.status === 'over' ? 'actual' : ''}/><small>RM {item.planned} planned · RM {item.actual} actual · {item.status}</small></div>)}{budgetLearningNotes.length > 0 && <p>{budgetLearningNotes.join(' ')}</p>}</section>
      <section className="compare-ledger"><span>PACE · PLANNED VS ACTUAL</span><div><b>Planned</b><i/><small>{tingoBehavior.itineraryDensity} · {tingoBehavior.dailyStops} stops/day · {tingoBehavior.bufferMinutes} min buffers</small></div><div><b>Actual</b><i className="actual"/><small>{actualPaceCopy}</small></div><p>{profileLearned ? 'Confirmed learning can now shape future ranking and pacing.' : 'Review data stays observational until you confirm learning.'}</p></section>
      <section className="community-entry"><div><span>COMMUNITY</span><b>{published ? 'Published with consent' : 'Private by default'}</b><small>Nothing becomes public without an explicit action.</small></div><button onClick={() => setDrawer('community')}>Open</button></section>
    </>;
  }

  function renderMe() {
    return <>
      <SectionTitle kicker="ME · COCO PROFILE" title="How do you actually like to travel?" copy="Private preferences first. Group DNA comes after."/>
      <section className="profile-hero paper-sheet"><Coco mood="happy"/><div><span>MEI · {mode === 'group' ? 'GROUP' : 'SOLO'} TRAVELLER</span><h3>{profile.vibe}</h3><p>{tingoBehavior.recommendationBias}-leaning · {tingoBehavior.budgetMode} · {tingoBehavior.changeStyle}</p></div></section>
      <section className="tingo-summary paper-sheet"><div><span>TINGO CARD</span><h3>{tingoCompletion(tingoAnswers) === 100 ? 'A profile Coco can explain.' : 'Let Coco learn your travel rhythm.'}</h3><p>{describeTingo(tingoDimensions).join(' · ')}</p></div><button className="primary" onClick={() => setDrawer('tingo')}>{tingoCompletion(tingoAnswers) === 100 ? 'Review Card' : 'Take assessment'} <ChevronRight size={15}/></button></section>
      <section className="profile-fields"><label><span>Trip vibe</span><input value={profile.vibe} onChange={e => setProfileField('vibe', e.target.value)}/></label><label><span>Must-Go</span><input value={profile.mustGo} onChange={e => setProfileField('mustGo', e.target.value)}/></label><label><span>Deal breaker</span><input value={profile.veto} onChange={e => setProfileField('veto', e.target.value)}/></label><label><span>Preference</span><input value={profile.preference} onChange={e => setProfileField('preference', e.target.value)}/></label><label><span>Flexible</span><input value={profile.flexible} onChange={e => setProfileField('flexible', e.target.value)}/></label></section>
      <div className="mode-toggle"><button className={mode === 'group' ? 'active' : ''} onClick={() => setMode('group')}>Group trip</button><button className={mode === 'solo' ? 'active' : ''} onClick={() => setMode('solo')}>Solo trip</button></div>
      <section className="base-packing"><div><span>BASE PACKING HABITS</span><b>Inherited by every new checklist</b></div><div className="packing-preferences">{basePackingPreferences.map(item => <button key={item} onClick={() => setBasePackingPreferences(current => current.filter(value => value !== item))}>{item} ×</button>)}<button className="add-preference" onClick={() => setBasePackingPreferences(current => current.includes('medication pouch') ? current : [...current, 'medication pouch'])}>+ medication pouch</button></div></section>
      <section className="me-tools"><MiniTool icon={Users} label="Group DNA" note="See common ground + explicit conflict" onClick={() => setDrawer('group')}/><MiniTool icon={PackageCheck} label="Packing ownership" note="Shared items have one clear owner" onClick={openPacking}/><MiniTool icon={Link2} label="External inspiration" note="Analyze before adding" onClick={() => setDrawer('import')}/></section>
    </>;
  }

  function renderDrawer() {
    if (!drawer) return null;
    return <div className="overlay" onMouseDown={() => setDrawer(null)}><section className="drawer" onMouseDown={e => e.stopPropagation()}><button className="close" onClick={() => setDrawer(null)}><X size={20}/></button>
      {drawer === 'discover' && <><span className="drawer-kicker">DISCOVER · COCO PICKS</span><h3>Where are we going?</h3><p className="drawer-copy">Search Tokyo, Kyoto or Osaka for destination-aware prototype data. Unknown destinations are explicitly marked as fallback examples. Ranking uses your current Tingo dimensions.</p><div className="discover-search"><input className="big-input" value={destination} onChange={e => { setDestination(e.target.value); setDestinationSearched(false); }} placeholder="Tokyo, Kyoto, Osaka…"/><button className="primary" onClick={searchDestination}>Search</button></div>{destinationSearched && <div className="discover-results"><span className="drawer-kicker">FOR YOUR {destination.toUpperCase()} TRIP · {tingoBehavior.recommendationBias.toUpperCase()} BIAS</span>{recommendations.map(place => <article className="community-row discover-row" key={place.id}><div><b>{place.name}</b><small>{place.match}% Tingo-adjusted match · {place.type}</small><small>{place.cost} · {place.duration}</small><small><strong>Why Coco picked this:</strong> {place.why}</small><small>{place.source === 'prototype-catalog' ? 'Local prototype catalog' : 'Fallback example · not live destination data'}</small><div className="inline-actions"><button onClick={() => toggleRecommendation(place.id, 'save')}>{place.saved ? '✓ Saved' : 'Save idea'}</button><button onClick={() => toggleRecommendation(place.id, 'add')}>{place.added ? '✓ In plan' : 'Add to plan'}</button></div></div></article>)}</div>}</>}
      {drawer === 'tingo' && <><span className="drawer-kicker">TINGO CARD · {tingoCompletion(tingoAnswers)}% COMPLETE</span><h3>Tell Coco what a good trip feels like.</h3><p className="drawer-copy">Six small choices become a persistent, explainable profile — not a personality label.</p>{tingoCompletion(tingoAnswers) < 100 ? <><div className="assessment-progress"><i style={{ width: `${tingoCompletion(tingoAnswers)}%` }}/></div><div className="assessment-question"><span>QUESTION {tingoStep + 1} / {tingoQuestions.length}</span><b>{tingoQuestions[tingoStep].prompt}</b></div><div className="assessment-options">{tingoQuestions[tingoStep].options.map(option => <button key={option.id} className={tingoAnswers.some(answer => answer.questionId === tingoQuestions[tingoStep].id && answer.optionId === option.id) ? 'active' : ''} onClick={() => answerTingo(option.id)}><b>{option.label}</b><small>{option.hint}</small></button>)}</div></> : <><div className="tingo-result"><span>YOUR TRAVEL DNA</span><b>{describeTingo(tingoDimensions).join(' · ')}</b><small>{tingoPlanGuidance.itineraryGuidance} {tingoPlanGuidance.accommodationGuidance}</small></div><button className="primary" onClick={finishTingo}>Refresh profile + recommendations</button></>}</>}
      {drawer === 'tripSetup' && <><span className="drawer-kicker">NEW TRIP · BEFORE</span><h3>Give this journey a shape.</h3><label className="setup-field"><span>Destination</span><input className="big-input" value={destination} onChange={e => { setDestination(e.target.value); setDestinationSearched(false); }}/></label><div className="mode-toggle"><button className={mode === 'group' ? 'active' : ''} onClick={() => setMode('group')}>Group</button><button className={mode === 'solo' ? 'active' : ''} onClick={() => setMode('solo')}>Solo</button></div><div className="setup-fields"><label><span>Trip vibe / goal</span><input value={profile.vibe} onChange={e => setProfileField('vibe', e.target.value)}/></label><label><span>Must-Go anchor</span><input value={profile.mustGo} onChange={e => setProfileField('mustGo', e.target.value)}/></label><label><span>Deal breaker</span><input value={profile.veto} onChange={e => setProfileField('veto', e.target.value)}/></label><label><span>Preference</span><input value={profile.preference} onChange={e => setProfileField('preference', e.target.value)}/></label><label><span>Flexible</span><input value={profile.flexible} onChange={e => setProfileField('flexible', e.target.value)}/></label></div><div className="constraint-row"><button onClick={() => updateConstraint('must-go', profile.mustGo)}>Save Must-Go</button><button onClick={() => updateConstraint('deal-breaker', profile.veto)}>Save Deal Breaker</button><button onClick={() => updateConstraint('preference', profile.preference)}>Save Preference</button><button onClick={() => updateConstraint('flexible', profile.flexible)}>Save Flexible</button></div><div className="adapter-note"><b>Coco plan adapter</b><small>{tingoPlanGuidance.itineraryGuidance} {tingoPlanGuidance.budgetGuidance} No live weather, map, or pricing service is connected.</small></div><button className="primary" onClick={() => { setTripCreated(true); setDrawer(null); openTrip('planning'); }}>Confirm inputs & open plan <ChevronRight size={15}/></button></>}
      {drawer === 'group' && <><span className="drawer-kicker">GROUP DNA</span><h3>Mostly aligned. Conflict stays visible until the group decides.</h3><div className="dna-grid"><div><span>Vibe</span><b>{profile.vibe}</b></div><div><span>Pace</span><b>{tingoBehavior.itineraryDensity}</b></div><div><span>Budget</span><b>RM{Math.round(groupBudgetTotal / Math.max(1, members.length))} / person</b></div><div><span>Food</span><b>{tingoDimensions.food >= 2 ? 'High priority' : 'Balanced'}</b></div></div><div className="member-list">{members.map(member => <div key={member.id}><div><b>{member.name}</b><small>{member.inviteStatus === 'pending' ? 'Invite pending' : member.role} · {member.pace} pace</small></div><button onClick={() => setMembers(current => current.map(item => item.id === member.id ? { ...item, role: item.role === 'Trip lead' ? 'Food scout' : item.role === 'Food scout' ? 'Memory keeper' : 'Trip lead' } : item))}>Rotate role</button></div>)}</div><div className="adapter-note"><b>Coco responsibility preview</b>{responsibilitySuggestions.map(item => <small key={item.memberId}>{item.memberName}: {item.suggestedRole} — {item.reason}</small>)}<button className="secondary" onClick={() => setMembers(current => applyResponsibilitySuggestions(current, responsibilitySuggestions))}>Confirm & apply suggested roles</button></div><button className="secondary" onClick={inviteMember}>+ Invite a traveller</button><div className="conflict-mini"><span>EXPLICIT PREFERENCE CONFLICT</span><b>Mei: {profile.mustGo}</b><b>JH: {profile.veto}</b><small>{tingoPlanGuidance.courtGuidance} AI can explain options, but cannot silently choose for the group.</small></div><label className="setup-field"><span>Mark another uncertainty</span><input className="big-input" value={draftConflict} onChange={e => setDraftConflict(e.target.value)} placeholder="e.g. Shinjuku hotel vs Asakusa hotel"/></label><button className="secondary" onClick={markConflict}>{conflictMarked ? 'Send another conflict to Court' : 'Mark conflict & open Court'}</button><div className="planner-turn"><span>Editing turn</span><b>{plannerTurn}</b><button onClick={() => setPlannerTurn(plannerTurn === 'Mei' ? 'JH' : plannerTurn === 'JH' ? 'Zi Shan' : plannerTurn === 'Zi Shan' ? 'Alex' : 'Mei')}>Pass turn</button></div><button className="secondary" onClick={() => setDrawer('reminders')}>Reminders & human commitments</button></>}
      {drawer === 'backup' && <><span className="drawer-kicker">BACKUP PLAN POOL</span><h3>Ideas worth keeping when reality misbehaves.</h3>{backups.map(item => <div className={`backup-row ${item.viable ? '' : 'off'}`} key={item.name}><b>{item.name}</b><small>{item.support} supporters · {item.cost >= 0 ? '+' : ''}RM{item.cost} · +{item.time} min {item.viable ? '· viable' : '· blocked'}</small></div>)}{ghostWishes.filter(wish => wish.status === 'revived').map(wish => <div className="backup-row" key={`ghost-${wish.id}`}><b>👻 {wish.name}</b><small>Revived from Ghost Wish · preserved with original reason</small></div>)}</>}
      {drawer === 'budget' && <><span className="drawer-kicker">TRIP BUDGET</span><h3>Editable plan and actual category spend.</h3><label className="budget-total-input"><span>{mode === 'group' ? 'Group' : 'Solo'} total</span><input type="number" min="0" value={budgetTotal} onChange={e => mode === 'group' ? setGroupBudgetTotal(sanitizeAmount(Number(e.target.value))) : setSoloBudgetTotal(sanitizeAmount(Number(e.target.value)))}/></label><div className="budget-big"><b>RM {remaining}</b><span>remaining after RM {spent + replanCost} actual spend</span></div><div className="surprise-budget"><span>SPONTANEITY RESERVE</span><b>RM {mode === 'group' ? 120 : 60}</b><small>Held outside the base plan for a real little surprise.</small></div><div className="budget-lines">{(['stay','food','transport','activities'] as BudgetCategory[]).map(category => <label key={category}><span>{category === 'transport' ? 'Transit' : category[0].toUpperCase() + category.slice(1)}</span><input type="number" min="0" value={budgetPlan[category]} onChange={e => changeBudgetCategory(category, Number(e.target.value))}/><small>Planned</small><input type="number" min="0" aria-label={`${category} actual spend`} value={budgetActuals[category]} onChange={e => changeBudgetActual(category, Number(e.target.value))}/><small>Actual · persisted for this prototype trip</small></label>)}</div><div className={`budget-balance ${planned > budgetTotal ? 'over' : ''}`}><span>Planned</span><b>RM {planned} / RM {budgetTotal}</b><small>{planned > budgetTotal ? `Over plan by RM ${planned - budgetTotal}` : `RM ${budgetTotal - planned} unallocated buffer`}</small></div><button className="receipt-button" onClick={printReceipt}><ReceiptText size={18}/>{receiptPrinted ? 'Print receipt again' : 'Print split-bill receipt'}</button></>}
      {drawer === 'compare' && <><span className="drawer-kicker">COMPARE · HONEST PROTOTYPE</span><h3>Shortlist the option that fits the trip, not just the price.</h3><p className="drawer-copy">These are deterministic demo prices. No live supplier, inventory, or external checkout is connected.</p>{comparisonOptions.map(option => <article className="compare-option" key={option.id}><div><span>{option.category.toUpperCase()} · {option.fit}% fit</span><b>{option.label}</b><small>{option.why}</small></div><strong>RM {option.price}<em>{option.deal}</em></strong><small className={option.price <= remaining ? 'within-budget' : 'over-budget'}>{option.price <= remaining ? 'Within current remaining budget' : 'Over current remaining budget'}</small><button className="secondary" onClick={() => setDrawer(null)}>Preview in plan</button></article>)}</>}
      {drawer === 'feasibility' && <><span className="drawer-kicker">PLAN HEALTH · FEASIBILITY</span><h3>Check the joins before the trip does.</h3><div className="health-check-list">{checkFeasibility().map(issue => <div className={issue.severity === 'block' ? 'block' : ''} key={issue.id}><span>{issue.resolved ? '✓' : '!'}</span><div><b>{issue.label}</b><small>{issue.detail}</small></div></div>)}</div><div className="adapter-note"><b>One watch item remains.</b><small>The local adapter can flag opening hours and buffer risks; it cannot verify live operating data.</small></div><button className="primary" onClick={() => setDrawer(null)}>Keep this reviewed plan</button></>}
      {drawer === 'reminders' && <><span className="drawer-kicker">REMINDERS · PEOPLE COUNT TOO</span><h3>Important dates and human plans belong on the timeline.</h3><div className="reminder-list">{reminders.map(reminder => <button key={reminder.id} className={reminder.done ? 'done' : ''} onClick={() => setReminders(current => current.map(item => item.id === reminder.id ? { ...item, done: !item.done } : item))}><span>{reminder.done ? '✓' : '○'}</span><div><b>{reminder.label}</b><small>{reminder.date} · {reminder.kind}</small></div></button>)}</div><button className="secondary" onClick={() => setDrawer('commitments')}>Open human commitments & reunion</button></>}
      {drawer === 'commitments' && <><span className="drawer-kicker">HUMAN COMMITMENTS · REUNION</span><h3>Make the invisible parts of a day schedulable.</h3><div className="commitment-list">{commitments.map(item => <div key={item.id}><div><b>{item.label}</b><small>{item.time} · {item.owner} · {item.fixed ? 'fixed' : 'flexible'}</small></div><span>{item.fixed ? 'ANCHOR' : 'FLOATING'}</span></div>)}</div><div className="reunion-form"><span>REUNION AGREEMENT</span><label>Time<input value={reunion.time} onChange={e => setReunion(current => ({ ...current, time: e.target.value }))}/></label><label>Place<input value={reunion.place} onChange={e => setReunion(current => ({ ...current, place: e.target.value }))}/></label><label>Tolerance<input type="number" min="0" max="60" value={reunion.tolerance} onChange={e => setReunion(current => ({ ...current, tolerance: sanitizeAmount(Number(e.target.value)) }))}/></label></div><button className="primary" onClick={() => setDrawer(null)}>Save agreement</button></>}
      {drawer === 'safety' && <><span className="drawer-kicker">SAFETY · SOLO+ TOOLKIT</span><h3>Useful if the day gets uncomfortable.</h3><div className="safety-list"><div><b>Safety check-in</b><small>Share a status-only check-in with your chosen contact.</small><button className="secondary">Prepare check-in</button></div><div><b>Nearby useful places</b><small>Prototype lookup: hospital · pharmacy · luggage storage.</small><button className="secondary">View local list</button></div><div><b>Emergency contact</b><small>Stored locally for this prototype · no call or location service is connected.</small><button className="secondary">Edit contact</button></div></div></>}
      {drawer === 'assistant' && <><span className="drawer-kicker">ASK COCO · REVIEW BEFORE APPLY</span><h3>“Can we make the afternoon gentler?”</h3><p className="drawer-copy">Coco can read the current plan and propose a reversible change. It cannot silently rewrite the group itinerary.</p>{!assistantPreview && !assistantApplied && <button className="primary" onClick={() => { setAssistantPreview(true); setAssistantUndone(false); }}>Show suggestion preview</button>}{assistantPreview && !assistantApplied && <><div className="change-ticket"><div><span>KEEP</span><b>{profile.mustGo} · anchor</b></div><div><span>MOVE</span><b>{cafeTime} café → 15:00</b></div><div><span>WHY</span><b>Less pressure after the slowest member’s morning pace</b></div></div><div className="action-row"><button className="secondary" onClick={() => setAssistantPreview(false)}>Not now</button><button className="primary" onClick={() => { setCafeTime('15:00'); setAssistantApplied(true); setAssistantPreview(false); }}>Confirm & apply</button></div></>}{assistantApplied && <><div className="success-note"><Check size={21}/><div><b>Suggestion applied.</b><small>Only the floating café block moved. Anchor and promise stayed intact.</small></div></div><button className="secondary" onClick={() => { setCafeTime('14:30'); setAssistantApplied(false); setAssistantUndone(true); }}>Undo change</button></>}{assistantUndone && <small className="adapter-note">Change undone. No group decision was silently changed.</small>}</>}
      {drawer === 'gacha' && <><span className="drawer-kicker">GACHA · EVERYDAY INDECISION</span><h3>Can’t choose the next little thing?</h3><p className="drawer-copy">This is a real random choice for an everyday moment, separate from Court governance.</p><div className="gacha-choice"><b>After lunch, which route?</b><span>Café route <i/> Riverside route</span></div><button className="gacha-machine" onClick={runEverydayGacha}>{everydayGacha ? 'Turn again' : 'Turn the Gacha'}</button>{everydayGacha && <div className="verdict"><span>EVERYDAY RESULT · NOT A COURT DECISION</span><b>{everydayGacha}</b><small>This does not write to the official group itinerary or learning profile.</small></div>}</>}
      {drawer === 'lucky' && <><span className="drawer-kicker">LUCKY DRAW · ENTERTAINMENT</span><h3>A tiny fortune for the mood.</h3><p className="drawer-copy">Purely for fun. It never changes weather, re-plans the trip, resolves Court, or becomes learning data.</p><button className="lucky-ticket" onClick={runLuckyDraw}>{luckyDraw ?? 'Draw a fortune'}</button>{luckyDraw && <small className="adapter-note">Entertainment result only · itinerary unchanged.</small>}</>}
      {drawer === 'memoryCard' && <><span className="drawer-kicker">MEMORY STICKER CARD</span><h3>Turn one moment into a keepsake.</h3><p className="drawer-copy">Generation-ready entry point. No image-generation backend is connected, so this prototype saves the note and metadata contract only.</p><label className="setup-field"><span>Memory note</span><textarea value={memoryNote} onChange={e => setMemoryNote(e.target.value)}/></label><label className="toggle-row"><span><b>Public Community card</b><small>Private by default; explicit consent required.</small></span><input type="checkbox" checked={memoryPublic} onChange={e => setMemoryPublic(e.target.checked)}/></label><button className="primary" onClick={() => setDrawer(null)}>Save {memoryPublic ? 'public' : 'private'} card</button></>}
      {drawer === 'family' && <><span className="drawer-kicker">FAMILY WINDOW</span><h3>Reassurance, not surveillance.</h3><div className="porch-light"><span className="lantern">◉</span><div><b>{delay ? 'Plan changed. Everyone is safe.' : 'Everything is going as planned.'}</b><small>No action needed.</small></div></div><div className="privacy-grid">{(['status','area','exact'] as Privacy[]).map(level => <button key={level} className={privacy === level ? 'active' : ''} onClick={() => setPrivacy(level)}>{level === 'status' ? 'Status only' : level === 'area' ? 'Approx. area' : 'Exact location'}</button>)}</div><label className="toggle-row"><span><b>Continuous location</b><small>Off by default and separate from reassurance</small></span><input type="checkbox" checked={continuousLocation} onChange={e => setContinuousLocation(e.target.checked)}/></label><button className="courier-button" onClick={sendFamilyReassurance}>{reported ? 'Send updated reassurance' : 'Send reassurance with Coco'}</button></>}
      {drawer === 'import' && <><span className="drawer-kicker">IMPORT INSPIRATION</span><h3>Check if an outside recommendation fits your trip.</h3><input className="big-input" value={externalLink} onChange={e => setExternalLink(e.target.value)}/><button className="primary" onClick={() => setLinkAnalyzed(true)}>{linkAnalyzed ? 'Analyze again' : 'Analyze link'}</button>{linkAnalyzed && <div className="analysis-result"><b>84% demo fit</b><small>3 ideas match your pace · 1 conflicts with the budget cap. Execution still requires your confirmation.</small></div>}</>}
      {drawer === 'community' && <><span className="drawer-kicker">COMMUNITY</span><h3>Borrow ideas, not someone else’s whole trip.</h3>{communityTrips.map(trip => <div className="community-row" key={trip.id}><div><b>{trip.title}</b><small>{trip.match}% fit · by {trip.author}</small></div><button onClick={() => setCommunityTrips(items => items.map(item => item.id === trip.id ? { ...item, saved: !item.saved } : item))}>{trip.saved ? 'Saved' : 'Save'}</button></div>)}<div className="publish-row"><div><b>Your trip</b><small>{published ? 'Public by explicit consent' : 'Private'}</small></div><button onClick={() => setPublished(!published)}>{published ? 'Unpublish' : 'Publish'}</button></div></>}
    </section></div>;
  }

  const renderCourt = () => {
    if (!courtOpen) return null;
    const first = courtOptions[0];
    const second = courtOptions[1];
    const gachaResult = () => {
      const winner = Math.random() > .5 ? first : second;
      if (!winner) return;
      setGacha(winner.label);
      setCourtConfirmed(false);
      setCourtDecision(null);
    };
    return <div className="ritual-overlay"><section className="court-stage"><button className="close light" onClick={() => setCourtOpen(false)}><X size={20}/></button><span className="ritual-kicker">GROUP COURT</span><Coco mood="happy"/><h3>{activeConflict}</h3><p>{courtOptions.map(option => `${option.label}: ${tally.counts[option.id] ?? 0}`).join(' · ')}. {tally.tied ? 'This is a true unresolved tie.' : 'There is a majority, so Gacha stays locked.'}</p><div className="member-votes">{courtVotes.map(vote => <div key={vote.member}><b>{vote.member}</b><span>{courtOptions.map(option => <button key={option.id} className={vote.pick === option.id ? 'active' : ''} onClick={() => castVote(vote.member, option.id)}>{option.label}</button>)}</span></div>)}</div><div className="trade-slip"><b>Possible exchange</b><small>{first?.label ?? 'Option A'} ↔ protect a linked concession for {second?.label ?? 'Option B'} later. If the linked concession fails, withdraw it to restore the pre-concession vote snapshot.</small><button onClick={attachConcession}>{tradeAccepted ? 'Withdraw concession & restore votes' : 'Attach concession snapshot'}</button></div>{tally.tied ? <button className="gacha-machine" onClick={gachaResult}>Turn Gacha for this tie</button> : <div className="majority-note"><b>Majority decides normally.</b><small>Randomness is not used when the vote already resolves the conflict.</small></div>}{proposedDecision && <div className="verdict"><span>PROPOSED VERDICT</span><b>{proposedDecision}</b><small>{gacha ? 'Random tie-break is still only a proposal.' : 'Computed from member votes.'}</small><button onClick={confirmCourt}>{courtConfirmed && courtDecision === proposedDecision ? '✓ Added to official timeline' : 'Confirm result'}</button></div>}</section></div>;
  };

  return <div className="app-shell">
    <header className="topbar"><button className="brand-lockup" onClick={() => { setTripWorkspaceOpen(false); setTab('home'); }} aria-label="Go to Home"><span className="brand-mark">c</span><span className="wordmark"><b>COCOCRUNCH</b><small>travel, with room to breathe</small></span></button><div className="topbar-actions"><span className="tiny-avatar">M</span><button className="bell" aria-label="Notifications"><Bell size={19}/><i/></button></div></header>
    <main>{tab === 'home' ? renderHome() : tab === 'trips' ? (tripWorkspaceOpen ? renderTripWorkspace() : renderTrips()) : tab === 'explore' ? renderExplore() : tab === 'memories' ? renderGlobalMemories() : renderMe()}</main>
    <nav className="bottom-nav">{tabs.map(item => { const Icon = item.icon; return <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => { if (item.id === 'trips') setTripWorkspaceOpen(false); setTab(item.id); }}><Icon size={20}/><span>{item.label}</span></button>; })}</nav>
    {renderCourt()}
    {renderDrawer()}
  </div>;
}
