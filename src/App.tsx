import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell, BookOpen, Box, Check, ChevronRight, CircleDollarSign, CloudRain,
  Gavel, Heart, Home, Link2, Map, MapPin, PackageCheck, ReceiptText,
  Route, Send, Sparkles, Users, X
} from 'lucide-react';
import { emitExperience } from './experience';
import { courtTally, type CourtOption, type CourtVote } from './domain/court';
import {
  defaultGroupBudget, defaultSoloBudget, plannedBudget, remainingBudget,
  sanitizeAmount, updateBudget, type BudgetCategory, type BudgetPlan,
} from './domain/budget';
import { discoverPlaces, type DiscoveryPlace } from './domain/discovery';
import { learnFromTrip, learningSummary, type TravelProfile, type TripReview } from './domain/preferences';
import { loadPersisted, savePersisted } from './persistence';

type Tab = 'home' | 'plan' | 'during' | 'memories' | 'me';
type TripMode = 'group' | 'solo';
type Mood = 'great' | 'okay' | 'tired' | null;
type Privacy = 'status' | 'area' | 'exact';
type Drawer = 'group' | 'packing' | 'backup' | 'budget' | 'family' | 'community' | 'import' | 'discover' | null;
type Backup = { name: string; support: number; cost: number; time: number; viable: boolean };
type PackItem = { name: string; owner: string; shared: boolean; done: boolean };
type CommunityTrip = { id: number; title: string; author: string; match: number; saved: boolean };
type PlaceRecommendation = DiscoveryPlace & { id: number; saved: boolean; added: boolean };
type GhostWish = { id: number; name: string; reason: string; status: 'resting' | 'revived' | 'released' };

const defaultProfile: TravelProfile = {
  vibe: 'Relax + Food',
  mustGo: 'Tsukiji food walk',
  veto: 'No raw-food-only dinner',
  preference: 'One scenic café each day',
  flexible: 'Evening activity can move',
};

const defaultVotes: CourtVote[] = [
  { member: 'Mei', pick: 'ramen' },
  { member: 'JH', pick: 'sushi' },
  { member: 'Zi Shan', pick: 'ramen' },
  { member: 'Alex', pick: 'sushi' },
];

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'plan', label: 'Plan', icon: BookOpen },
  { id: 'during', label: 'During', icon: Route },
  { id: 'memories', label: 'Memories', icon: Box },
  { id: 'me', label: 'Me', icon: Heart },
];

const backups: Backup[] = [
  { name: 'Underground food hall', support: 4, cost: 8, time: 12, viable: true },
  { name: 'Retro kissaten crawl', support: 3, cost: 4, time: 18, viable: true },
  { name: 'Riverside night market', support: 1, cost: -6, time: 6, viable: false },
];

function makeRecommendations(destination: string, saved: { name: string; saved: boolean; added: boolean }[] = []): PlaceRecommendation[] {
  return discoverPlaces(destination).map((place, index) => {
    const prior = saved.find(item => item.name === place.name);
    return { ...place, id: index + 1, saved: prior?.saved ?? false, added: prior?.added ?? false };
  });
}

function Coco({ mood = 'idle', tiny = false }: { mood?: 'idle' | 'happy' | 'panic'; tiny?: boolean }) {
  return <div className={`coco ${mood} ${tiny ? 'tiny' : ''}`} aria-label={`Coco ${mood}`}>
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

export default function App() {
  const [stored] = useState(() => loadPersisted());
  const [tab, setTab] = useState<Tab>('home');
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [mode, setMode] = useState<TripMode>(stored.mode ?? 'group');
  const [profile, setProfile] = useState<TravelProfile>({ ...defaultProfile, ...stored.profile });
  const [plannerTurn, setPlannerTurn] = useState(stored.plannerTurn ?? 'Mei');
  const [packing, setPacking] = useState<PackItem[]>([
    { name: 'Portable charger', owner: 'Mei', shared: false, done: true },
    { name: 'Umbrella', owner: 'JH', shared: true, done: false },
    { name: 'Pocket Wi-Fi', owner: 'Zi Shan', shared: true, done: true },
  ]);
  const [courtOpen, setCourtOpen] = useState(false);
  const [courtVotes, setCourtVotes] = useState<CourtVote[]>(stored.courtVotes?.length ? stored.courtVotes : defaultVotes);
  const [gacha, setGacha] = useState<string | null>(null);
  const [courtDecision, setCourtDecision] = useState<string | null>(stored.courtDecision ?? null);
  const [courtConfirmed, setCourtConfirmed] = useState(Boolean(stored.courtConfirmed));
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
  const [photoIndexed, setPhotoIndexed] = useState(false);
  const [journalGenerated, setJournalGenerated] = useState(false);
  const [published, setPublished] = useState(false);
  const [externalLink, setExternalLink] = useState('https://example.com/tokyo-cafe-list');
  const [linkAnalyzed, setLinkAnalyzed] = useState(false);
  const [destination, setDestination] = useState(stored.destination ?? 'Tokyo');
  const [destinationSearched, setDestinationSearched] = useState(true);
  const [recommendations, setRecommendations] = useState<PlaceRecommendation[]>(() => makeRecommendations(stored.destination ?? 'Tokyo', stored.recommendations));
  const [groupBudgetTotal, setGroupBudgetTotal] = useState(stored.groupBudgetTotal ?? 2400);
  const [soloBudgetTotal, setSoloBudgetTotal] = useState(stored.soloBudgetTotal ?? 1200);
  const [groupBudgetPlan, setGroupBudgetPlan] = useState<BudgetPlan>(stored.groupBudgetPlan ?? defaultGroupBudget);
  const [soloBudgetPlan, setSoloBudgetPlan] = useState<BudgetPlan>(stored.soloBudgetPlan ?? defaultSoloBudget);
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
  const budgetPlan = mode === 'group' ? groupBudgetPlan : soloBudgetPlan;
  const budgetTotal = mode === 'group' ? groupBudgetTotal : soloBudgetTotal;
  const planned = plannedBudget(budgetPlan);
  const spent = mode === 'group' ? 1288 : 604;
  const replanCost = replanApplied ? 8 : 0;
  const remaining = remainingBudget(budgetTotal, spent, replanCost);
  const travellerCount = mode === 'group' ? 4 : 1;
  const planHealth = replanApplied ? 91 : 86;
  const majorityDecision = tally.majority ? `${tally.majority === 'ramen' ? 'Ramen' : 'Sushi'} wins the vote.` : null;
  const proposedDecision = gacha ?? majorityDecision;
  const cocoMood: 'idle' | 'happy' | 'panic' = delay && !replanApplied ? 'panic' : courtConfirmed || replanApplied || reported || receiptPrinted ? 'happy' : 'idle';

  const decisionHistory = useMemo(() => [
    ...(courtConfirmed && courtDecision ? [`Dinner Court · ${courtDecision}`] : []),
    ...(replanApplied ? ['Emergency Court · Underground food hall accepted'] : []),
  ], [courtConfirmed, courtDecision, replanApplied]);

  useEffect(() => {
    savePersisted({
      version: 1, mode, destination, profile, plannerTurn, courtVotes, courtConfirmed, courtDecision,
      groupBudgetTotal, soloBudgetTotal, groupBudgetPlan, soloBudgetPlan, privacy, continuousLocation,
      recommendations: recommendations.map(({ name, saved, added }) => ({ name, saved, added })),
      worthIt, profileLearned,
    });
  }, [mode, destination, profile, plannerTurn, courtVotes, courtConfirmed, courtDecision, groupBudgetTotal, soloBudgetTotal, groupBudgetPlan, soloBudgetPlan, privacy, continuousLocation, recommendations, worthIt, profileLearned]);

  function setProfileField(field: keyof TravelProfile, value: string) {
    setProfile(current => ({ ...current, [field]: value }));
    setProfileLearned(false);
    setLearningChanges([]);
  }

  function togglePack(index: number) {
    setPacking(items => items.map((item, i) => i === index ? { ...item, done: !item.done } : item));
  }

  function searchDestination() {
    setRecommendations(makeRecommendations(destination, recommendations));
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

  function confirmCourt() {
    if (!proposedDecision) return;
    setCourtDecision(proposedDecision);
    setCourtConfirmed(true);
  }

  function applyRepair() {
    setReplanApplied(true);
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
    const next = learnFromTrip(profile, worthIt);
    setLearningChanges(learningSummary(profile, next));
    setProfile(next);
    setProfileLearned(true);
  }

  function changeBudgetCategory(category: BudgetCategory, value: number) {
    if (mode === 'group') setGroupBudgetPlan(plan => updateBudget(plan, category, value));
    else setSoloBudgetPlan(plan => updateBudget(plan, category, value));
  }

  function renderHome() {
    return <>
      <section className="home-hero paper-sheet"><div><span className="eyebrow">DAY 2 · {destination.toUpperCase()}</span><h2>Good morning, Mei.</h2><p>Today is gentle on purpose. One anchor, two flexible pockets, and room for the city to surprise you.</p></div><Coco mood={cocoMood}/></section>
      <section className="today-card"><div className="today-head"><div><span>Today’s journey</span><b>Oct 13 · 18°C · cloudy</b></div><button onClick={() => setTab('plan')}>Full plan <ChevronRight size={15}/></button></div><div className="journey-line"><div className="journey-stop anchor"><time>10:00</time><span/><div><b>{profile.mustGo}</b><small>⚓ Anchor · protected</small></div></div><div className="journey-stop"><time>14:30</time><span/><div><b>Scenic café block</b><small>🫧 Floating · flexible</small></div></div><div className="journey-stop mystery"><time>17:00</time><span/><div><b>Mystery Window</b><small>🎰 Open · spontaneous slot</small></div></div></div></section>
      <section className="status-strip"><div><span>Plan health</span><b>{planHealth}/100</b></div><div><span>Budget left</span><b>RM {remaining}</b></div><div><span>Group</span><b>{travellerCount} people</b></div></section>
      <section className="home-tools"><MiniTool icon={MapPin} label="Discover places" note="Destination-aware prototype catalog" onClick={() => setDrawer('discover')}/><MiniTool icon={Users} label="Group DNA" note={courtConfirmed ? 'Latest conflict resolved' : '1 conflict needs a decision'} onClick={() => setDrawer('group')}/><MiniTool icon={PackageCheck} label="Packing" note={`${packing.filter(i => i.done).length}/${packing.length} ready`} onClick={() => setDrawer('packing')}/><MiniTool icon={Send} label="Family Window" note="Status-only sharing by default" onClick={() => setDrawer('family')}/></section>
    </>;
  }

  function renderPlan() {
    return <>
      <SectionTitle kicker="PLAN · TRAVEL NOTEBOOK" title="Build a plan that can bend." copy="Keep the important things firm. Let the rest breathe."/>
      <section className="trip-promise paper-strip"><span>TRIP PROMISE</span><b>Easy pace · food-first · one protected highlight · room for surprise</b></section>
      <button className="mini-tool" onClick={() => setDrawer('discover')}><MapPin size={18}/><span><b>Find places in {destination}</b><small>Ranked against vibe, budget and group constraints</small></span><ChevronRight size={16}/></button>
      <section className="itinerary-sheet paper-sheet"><div className="sheet-heading"><div><span>DAY 2</span><h3>{destination} · city wandering</h3></div><div className="score-stamp">{planHealth}</div></div><div className="itinerary-row anchor"><time>10:00</time><div><b>{profile.mustGo}</b><small>Must-Go · cannot be AI-replaced</small></div><em>ANCHOR</em></div><div className="itinerary-row"><time>14:30</time><div><b>Scenic café block</b><small>{profile.preference}</small></div><em>FLOATING</em></div><div className="itinerary-row mystery"><time>17:00</time><div><b>Mystery Window</b><small>{profile.flexible}</small></div><em>OPEN</em></div><div className="itinerary-row anchor"><time>19:30</time><div><b>Neighbourhood dinner</b><small>Group reunion point</small></div><em>ANCHOR</em></div></section>
      <section className="why-note"><Sparkles size={19}/><div><b>Why this plan?</b><p>{profile.mustGo} protects the strongest preference. Floating blocks can move without breaking the trip promise.</p></div></section>
      <section className="plan-toolbox"><MiniTool icon={Users} label="Group workspace" note={`Editing turn: ${plannerTurn}`} onClick={() => setDrawer('group')}/><MiniTool icon={Box} label="Backup Plan pool" note="2 viable · 1 weather-blocked" onClick={() => setDrawer('backup')}/><MiniTool icon={CircleDollarSign} label="Budget planner" note={`RM ${planned} planned of RM ${budgetTotal}`} onClick={() => setDrawer('budget')}/><MiniTool icon={Link2} label="Import inspiration" note="Source parser demo" onClick={() => setDrawer('import')}/></section>
      {mode === 'group' && <section className="conflict-ticket"><span>{courtConfirmed ? 'COURT DECISION RECORDED' : 'UNRESOLVED CONFLICT'}</span><b>Ramen tonight vs sushi tonight</b><small>{tally.ramen}–{tally.sushi} {tally.tied ? 'tie · Gacha is eligible' : `vote · ${tally.majority === 'ramen' ? 'Ramen' : 'Sushi'} has majority`}</small><button className="ritual-trigger" onClick={() => setCourtOpen(true)}>{courtConfirmed ? 'Review Group Court' : 'Open Group Court'} <Gavel size={18}/></button></section>}
    </>;
  }

  function renderDuring() {
    return <>
      <SectionTitle kicker="DURING · LIVE TRIP" title={delay ? 'Reality changed.' : 'The trip is moving.'} copy="Coco watches the plan, not your every step."/>
      <section className={`live-map ${delay ? 'rain' : ''}`}><div className="map-top"><span><MapPin size={15}/> {destination} area</span><b>{delay ? '30 min behind' : 'On schedule'}</b></div><svg viewBox="0 0 340 180" role="img" aria-label="Schematic route map"><path d="M25 135 C78 64 132 126 185 85 S265 52 315 42"/><circle cx="25" cy="135" r="6"/><circle cx="185" cy="85" r="6"/><circle cx="315" cy="42" r="7"/></svg><div className="ride-coco"><Coco tiny mood={delay ? 'panic' : 'happy'}/></div><div className="next-stop"><span>Next</span><b>{delay ? 'Replan needed' : 'Floating café block · 14:30'}</b></div></section>
      {!delay && <button className="event-button" onClick={() => { setDelay(true); setReplanPreview(false); setReplanApplied(false); setEmergencyApproved(false); }}><CloudRain size={20}/> Simulate heavy rain disruption</button>}
      {delay && !replanApplied && <section className="disruption-stage"><div className="disruption-head"><CloudRain size={26}/><div><span>OUTDOOR BLOCK FAILED</span><b>17:00 market is no longer viable.</b></div></div>{!replanPreview ? <><div className="ghost-suggestion"><span>👻 GHOST REVIVAL</span><b>Underground food hall</b><small>Highest-support viable backup · +RM8 · +12 min · Anchor protected</small></div><button className="primary" onClick={() => setReplanPreview(true)}>Preview minimum-loss repair</button></> : <><div className="change-ticket"><div><span>KEEP</span><b>{profile.mustGo}</b></div><div><span>REPLACE</span><b>Market → food hall</b></div><div><span>MOVE</span><b>Mystery Window → 19:00</b></div><div><span>IMPACT</span><b>+RM8 · +12 min</b></div></div>{mode === 'group' && <div className="emergency-court"><span>EMERGENCY COURT · 90 SEC</span><b>{emergencyApproved ? 'Approved · 3/4' : 'Group approval required'}</b><button onClick={() => setEmergencyApproved(true)}>{emergencyApproved ? '✓ Approved' : 'Simulate group approval'}</button></div>}<div className="action-row"><button className="secondary" onClick={() => setReplanPreview(false)}>Not now</button><button className="primary" disabled={mode === 'group' && !emergencyApproved} onClick={applyRepair}>Apply repair</button></div></>}</section>}
      {replanApplied && <section className="success-note"><Check size={21}/><div><b>Plan repaired.</b><small>Anchor protected · Mystery Window moved · +RM8 · undo available</small></div><button onClick={() => setReplanApplied(false)}>Undo</button></section>}
      <section className="energy-check"><span>HOW’S THE GROUP?</span><div>{(['great','okay','tired'] as const).map(value => <button key={value} className={mood === value ? 'active' : ''} onClick={() => setMood(value)}>{value === 'great' ? '⚡ Great' : value === 'okay' ? '🙂 Okay' : '🥱 Tired'}</button>)}</div>{mood === 'tired' && <small>Coco suggests dropping one floating item and adding 45 min rest. Anchors stay untouched.</small>}</section>
      {mode === 'group' && <section className="split-note"><div><span>SMART SPLIT</span><b>{split ? '2 café · 2 shopping' : 'Different energy levels?'}</b><small>{split ? 'Reunion · 19:30 · ±15 min' : 'Split only when both mini-plans stay feasible.'}</small></div><button onClick={() => setSplit(!split)}>{split ? 'Cancel' : 'Create split'}</button></section>}
      <section className="during-tools"><MiniTool icon={Send} label="Family Window" note={reported ? 'Latest reassurance sent' : 'Reassurance, not surveillance'} onClick={() => setDrawer('family')}/><MiniTool icon={MapPin} label="Location privacy" note={continuousLocation ? 'Continuous location on by consent' : 'Continuous location off'} onClick={() => setDrawer('family')}/></section>
    </>;
  }

  function renderMemories() {
    return <>
      <SectionTitle kicker="AFTER · MEMORY TRUNK" title="Keep what the trip taught you." copy="Photos, choices, little failures, and the things you would do again."/>
      <button className={`trunk-hero trunk-button ${trunkOpen ? 'open' : ''}`} aria-expanded={trunkOpen} onClick={() => setTrunkOpen(open => !open)}><div className="trunk-lid"/><div className="trunk-body"><span className="postcard p1">{destination.toUpperCase()}</span><span className="postcard p2">雨の日</span><span className="ticket">10.13</span><Coco tiny mood="happy"/></div><small>{trunkOpen ? 'Tap to close the trunk' : 'Tap to open the trunk'}</small></button>
      {trunkOpen && <section className="trunk-contents paper-sheet"><b>Trip keepsakes</b><span>🎫 Day 2 transit stub</span><span>🧾 Dinner split receipt</span><span>📸 Rainy underground detour</span><span>⚖️ {courtDecision ?? 'No Court verdict saved yet'}</span></section>}
      <section className="memory-actions"><button onClick={() => setPhotoIndexed(true)}><Map size={20}/><span><b>Photo Map</b><small>{photoIndexed ? '18 photos indexed · 4 areas' : 'Index local photo metadata'}</small></span></button><button onClick={() => setJournalGenerated(true)}><BookOpen size={20}/><span><b>Travel journal</b><small>{journalGenerated ? 'Draft generated' : 'Generate from timeline + photos'}</small></span></button></section>
      {journalGenerated && <section className="postcard-note"><span>OCT 13 · {destination.toUpperCase()}</span><p>Rain changed the evening, but the group kept the one thing everyone cared about. We ended up underground, warmer, later, and somehow happier.</p><small>Prototype draft · editable before saving</small></section>}
      <section className="ghost-wish"><span>GHOST WISH CEMETERY</span><h3>Trips that didn’t make it.</h3>{ghostWishes.map(wish => <div className={`ghost-wish-row ${wish.status}`} key={wish.id}><div><b>{wish.name}</b><small>{wish.reason}</small><em>{wish.status === 'resting' ? 'Still remembered' : wish.status === 'revived' ? 'Revived into Backup Plan' : 'Released, history kept'}</em></div>{wish.status === 'resting' && <div><button onClick={() => setGhostWishes(items => items.map(item => item.id === wish.id ? { ...item, status: 'revived' } : item))}>Revive</button><button onClick={() => setGhostWishes(items => items.map(item => item.id === wish.id ? { ...item, status: 'released' } : item))}>超度行程</button></div>}</div>)}</section>
      <section className="future-postcard"><span>FUTURE POSTCARD</span><h3>To your next-trip self.</h3>{postcardSealed ? <div className="sealed-postcard"><b>✉ Sealed for the next trip</b><button onClick={() => setPostcardSealed(false)}>Reopen</button></div> : <><textarea value={futurePostcard} onChange={e => setFuturePostcard(e.target.value)}/><button className="primary" onClick={() => setPostcardSealed(true)}>Seal postcard</button></>}</section>
      <section className="worth-card"><span>WORTH IT?</span><h3>Would you choose this kind of day again?</h3><div>{(['yes','mixed','no'] as const).map(value => <button key={value} className={worthIt === value ? 'active' : ''} onClick={() => { setWorthIt(value); setProfileLearned(false); setLearningChanges([]); }}>{value === 'yes' ? 'Worth it' : value === 'mixed' ? 'Mixed' : 'Not really'}</button>)}</div>{worthIt && <p>Coco can turn your review into a profile change, but only after you confirm it.</p>}{worthIt && <button className="secondary" onClick={confirmLearning}>{profileLearned ? '✓ Profile updated' : 'Confirm this learning'}</button>}{learningChanges.length > 0 && <div className="learning-changes">{learningChanges.map(change => <small key={change}>{change}</small>)}</div>}</section>
      <section className="review-ledger paper-sheet"><div><span>Budget vs actual</span><b>RM {spent + replanCost} spent</b><small>RM {remaining} remaining</small></div><div><span>Decisions</span><b>{decisionHistory.length} recorded</b><small>{decisionHistory[0] || 'No Court history yet'}</small></div></section>
      <section className="community-entry"><div><span>COMMUNITY</span><b>{published ? 'Published with consent' : 'Private by default'}</b><small>Nothing becomes public without an explicit action.</small></div><button onClick={() => setDrawer('community')}>Open</button></section>
    </>;
  }

  function renderMe() {
    return <>
      <SectionTitle kicker="ME · COCO PROFILE" title="How do you actually like to travel?" copy="Private preferences first. Group DNA comes after."/>
      <section className="profile-hero paper-sheet"><Coco mood="happy"/><div><span>MEI · {mode === 'group' ? 'GROUP' : 'SOLO'} TRAVELLER</span><h3>{profile.vibe}</h3><p>Food-first · budget-aware · flexible plans</p></div></section>
      <section className="profile-fields"><label><span>Trip vibe</span><input value={profile.vibe} onChange={e => setProfileField('vibe', e.target.value)}/></label><label><span>Must-Go</span><input value={profile.mustGo} onChange={e => setProfileField('mustGo', e.target.value)}/></label><label><span>Deal breaker</span><input value={profile.veto} onChange={e => setProfileField('veto', e.target.value)}/></label><label><span>Preference</span><input value={profile.preference} onChange={e => setProfileField('preference', e.target.value)}/></label><label><span>Flexible</span><input value={profile.flexible} onChange={e => setProfileField('flexible', e.target.value)}/></label></section>
      <div className="mode-toggle"><button className={mode === 'group' ? 'active' : ''} onClick={() => setMode('group')}>Group trip</button><button className={mode === 'solo' ? 'active' : ''} onClick={() => setMode('solo')}>Solo trip</button></div>
      <section className="me-tools"><MiniTool icon={Users} label="Group DNA" note="See common ground + explicit conflict" onClick={() => setDrawer('group')}/><MiniTool icon={PackageCheck} label="Packing ownership" note="Shared items have one clear owner" onClick={() => setDrawer('packing')}/><MiniTool icon={Link2} label="External inspiration" note="Analyze before adding" onClick={() => setDrawer('import')}/></section>
    </>;
  }

  function renderDrawer() {
    if (!drawer) return null;
    return <div className="overlay" onMouseDown={() => setDrawer(null)}><section className="drawer" onMouseDown={e => e.stopPropagation()}><button className="close" onClick={() => setDrawer(null)}><X size={20}/></button>
      {drawer === 'discover' && <><span className="drawer-kicker">DISCOVER · COCO PICKS</span><h3>Where are we going?</h3><p className="drawer-copy">Search Tokyo, Kyoto or Osaka for destination-aware prototype data. Unknown destinations are explicitly marked as fallback examples.</p><div className="discover-search"><input className="big-input" value={destination} onChange={e => { setDestination(e.target.value); setDestinationSearched(false); }} placeholder="Tokyo, Kyoto, Osaka…"/><button className="primary" onClick={searchDestination}>Search</button></div>{destinationSearched && <div className="discover-results"><span className="drawer-kicker">FOR YOUR {destination.toUpperCase()} TRIP</span>{recommendations.map(place => <article className="community-row discover-row" key={place.id}><div><b>{place.name}</b><small>{place.match}% match · {place.type}</small><small>{place.cost} · {place.duration}</small><small><strong>Why Coco picked this:</strong> {place.why}</small><small>{place.source === 'prototype-catalog' ? 'Local prototype catalog' : 'Fallback example · not live destination data'}</small><div className="inline-actions"><button onClick={() => toggleRecommendation(place.id, 'save')}>{place.saved ? '✓ Saved' : 'Save idea'}</button><button onClick={() => toggleRecommendation(place.id, 'add')}>{place.added ? '✓ In plan' : 'Add to plan'}</button></div></div></article>)}</div>}</>}
      {drawer === 'group' && <><span className="drawer-kicker">GROUP DNA</span><h3>Mostly aligned. Conflict stays visible until the group decides.</h3><div className="dna-grid"><div><span>Vibe</span><b>{profile.vibe}</b></div><div><span>Pace</span><b>Relaxed</b></div><div><span>Budget</span><b>RM{Math.round(groupBudgetTotal / 4)} / person</b></div><div><span>Food</span><b>High priority</b></div></div><div className="conflict-mini"><span>CONFLICT</span><b>Mei: {profile.mustGo}</b><b>JH: {profile.veto}</b></div><div className="planner-turn"><span>Editing turn</span><b>{plannerTurn}</b><button onClick={() => setPlannerTurn(plannerTurn === 'Mei' ? 'JH' : plannerTurn === 'JH' ? 'Zi Shan' : plannerTurn === 'Zi Shan' ? 'Alex' : 'Mei')}>Pass turn</button></div></>}
      {drawer === 'packing' && <><span className="drawer-kicker">PACKING</span><h3>One bag, zero “I thought you brought it.”</h3>{packing.map((item, i) => <button className={`pack-row ${item.done ? 'done' : ''}`} key={item.name} onClick={() => togglePack(i)}><span>{item.done ? '✓' : '○'}</span><div><b>{item.name}</b><small>{item.shared ? `Shared · ${item.owner} owns this` : `Owner · ${item.owner}`}</small></div></button>)}</>}
      {drawer === 'backup' && <><span className="drawer-kicker">BACKUP PLAN POOL</span><h3>Ideas worth keeping when reality misbehaves.</h3>{backups.map(item => <div className={`backup-row ${item.viable ? '' : 'off'}`} key={item.name}><b>{item.name}</b><small>{item.support} supporters · {item.cost >= 0 ? '+' : ''}RM{item.cost} · +{item.time} min {item.viable ? '· viable' : '· blocked'}</small></div>)}{ghostWishes.filter(wish => wish.status === 'revived').map(wish => <div className="backup-row" key={`ghost-${wish.id}`}><b>👻 {wish.name}</b><small>Revived from Ghost Wish · preserved with original reason</small></div>)}</>}
      {drawer === 'budget' && <><span className="drawer-kicker">TRIP BUDGET</span><h3>Editable totals, computed every time.</h3><label className="budget-total-input"><span>{mode === 'group' ? 'Group' : 'Solo'} total</span><input type="number" min="0" value={budgetTotal} onChange={e => mode === 'group' ? setGroupBudgetTotal(sanitizeAmount(Number(e.target.value))) : setSoloBudgetTotal(sanitizeAmount(Number(e.target.value)))}/></label><div className="budget-big"><b>RM {remaining}</b><span>remaining after RM {spent + replanCost} actual spend</span></div><div className="budget-lines">{(['stay','food','transport','activities'] as BudgetCategory[]).map(category => <label key={category}><span>{category === 'transport' ? 'Transit' : category[0].toUpperCase() + category.slice(1)}</span><input type="number" min="0" value={budgetPlan[category]} onChange={e => changeBudgetCategory(category, Number(e.target.value))}/></label>)}</div><div className={`budget-balance ${planned > budgetTotal ? 'over' : ''}`}><span>Planned</span><b>RM {planned} / RM {budgetTotal}</b><small>{planned > budgetTotal ? `Over plan by RM ${planned - budgetTotal}` : `RM ${budgetTotal - planned} unallocated buffer`}</small></div><button className="receipt-button" onClick={printReceipt}><ReceiptText size={18}/>{receiptPrinted ? 'Print receipt again' : 'Print split-bill receipt'}</button></>}
      {drawer === 'family' && <><span className="drawer-kicker">FAMILY WINDOW</span><h3>Reassurance, not surveillance.</h3><div className="porch-light"><span className="lantern">◉</span><div><b>{delay ? '🟡 Plan changed, everyone is safe.' : '🟢 Everything is going as planned.'}</b><small>No action needed.</small></div></div><div className="privacy-grid">{(['status','area','exact'] as Privacy[]).map(level => <button key={level} className={privacy === level ? 'active' : ''} onClick={() => setPrivacy(level)}>{level === 'status' ? 'Status only' : level === 'area' ? 'Approx. area' : 'Exact location'}</button>)}</div><label className="toggle-row"><span><b>Continuous location</b><small>Off by default and separate from reassurance</small></span><input type="checkbox" checked={continuousLocation} onChange={e => setContinuousLocation(e.target.checked)}/></label><button className="courier-button" onClick={sendFamilyReassurance}>{reported ? '🪳💨 Send updated reassurance' : 'Send reassurance with Coco'}</button></>}
      {drawer === 'import' && <><span className="drawer-kicker">IMPORT INSPIRATION</span><h3>Check if an outside recommendation fits your trip.</h3><input className="big-input" value={externalLink} onChange={e => setExternalLink(e.target.value)}/><button className="primary" onClick={() => setLinkAnalyzed(true)}>{linkAnalyzed ? 'Analyze again' : 'Analyze link'}</button>{linkAnalyzed && <div className="analysis-result"><b>84% demo fit</b><small>3 ideas match your pace · 1 conflicts with the budget cap. Execution still requires your confirmation.</small></div>}</>}
      {drawer === 'community' && <><span className="drawer-kicker">COMMUNITY</span><h3>Borrow ideas, not someone else’s whole trip.</h3>{communityTrips.map(trip => <div className="community-row" key={trip.id}><div><b>{trip.title}</b><small>{trip.match}% fit · by {trip.author}</small></div><button onClick={() => setCommunityTrips(items => items.map(item => item.id === trip.id ? { ...item, saved: !item.saved } : item))}>{trip.saved ? 'Saved' : 'Save'}</button></div>)}<div className="publish-row"><div><b>Your trip</b><small>{published ? 'Public by explicit consent' : 'Private'}</small></div><button onClick={() => setPublished(!published)}>{published ? 'Unpublish' : 'Publish'}</button></div></>}
    </section></div>;
  }

  return <div className="app-shell">
    <header className="topbar"><div className="wordmark"><span>COCOCRUNCH</span><b>COCO IN YOUR AREA.</b></div><button className="bell" aria-label="Notifications"><Bell size={19}/><i/></button></header>
    <main>{tab === 'home' ? renderHome() : tab === 'plan' ? renderPlan() : tab === 'during' ? renderDuring() : tab === 'memories' ? renderMemories() : renderMe()}</main>
    <nav className="bottom-nav">{tabs.map(item => { const Icon = item.icon; return <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => setTab(item.id)}><Icon size={20}/><span>{item.label}</span></button>; })}</nav>
    {courtOpen && <div className="ritual-overlay"><section className="court-stage"><button className="close light" onClick={() => setCourtOpen(false)}><X size={20}/></button><span className="ritual-kicker">GROUP COURT</span><Coco mood="happy"/><h3>Lunch argument, now with due process.</h3><p>{tally.ramen} ramen · {tally.sushi} sushi. {tally.tied ? 'This is a true unresolved tie.' : 'There is a majority, so Gacha stays locked.'}</p><div className="member-votes">{courtVotes.map(vote => <div key={vote.member}><b>{vote.member}</b><span><button className={vote.pick === 'ramen' ? 'active' : ''} onClick={() => castVote(vote.member, 'ramen')}>🍜 Ramen</button><button className={vote.pick === 'sushi' ? 'active' : ''} onClick={() => castVote(vote.member, 'sushi')}>🍣 Sushi</button></span></div>)}</div><div className="trade-slip"><b>Possible trade</b><small>Ramen tonight ↔ sushi market becomes tomorrow’s protected lunch.</small></div>{tally.tied ? <button className="gacha-machine" onClick={() => { setGacha(Math.random() > .5 ? 'Ramen wins the tie.' : 'Sushi wins the tie.'); setCourtConfirmed(false); setCourtDecision(null); }}>🎰 Pull Gacha</button> : <div className="majority-note"><b>Majority decides normally.</b><small>Randomness is not used when the vote already resolves the conflict.</small></div>}{proposedDecision && <div className="verdict"><span>PROPOSED VERDICT</span><b>{proposedDecision}</b><small>{gacha ? 'Random tie-break is still only a proposal.' : 'Computed from member votes.'}</small><button onClick={confirmCourt}>{courtConfirmed && courtDecision === proposedDecision ? '✓ Added to official timeline' : 'Confirm result'}</button></div>}</section></div>}
    {renderDrawer()}
  </div>;
}
