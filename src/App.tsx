import React, { useMemo, useState } from 'react';
import {
  Bell, BookOpen, Box, Check, ChevronRight, CircleDollarSign, CloudRain,
  Gavel, Heart, Home, Link2, Map, MapPin, PackageCheck, ReceiptText,
  RefreshCw, Route, Send, Sparkles, Suitcase, Users, X
} from 'lucide-react';

type Tab = 'home' | 'plan' | 'during' | 'memories' | 'me';
type TripMode = 'group' | 'solo';
type CourtPick = 'ramen' | 'sushi' | null;
type Mood = 'great' | 'okay' | 'tired' | null;
type Privacy = 'status' | 'area' | 'exact';
type Drawer = 'profile' | 'group' | 'packing' | 'backup' | 'budget' | 'family' | 'community' | 'import' | null;

type Backup = { name: string; support: number; cost: number; time: number; viable: boolean };
type PackItem = { name: string; owner: string; shared: boolean; done: boolean };
type CommunityTrip = { id: number; title: string; author: string; match: number; saved: boolean };

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'plan', label: 'Plan', icon: BookOpen },
  { id: 'during', label: 'During', icon: Route },
  { id: 'memories', label: 'Memories', icon: Suitcase },
  { id: 'me', label: 'Me', icon: Heart },
];

const backups: Backup[] = [
  { name: 'Underground food hall', support: 4, cost: 8, time: 12, viable: true },
  { name: 'Retro kissaten crawl', support: 3, cost: 4, time: 18, viable: true },
  { name: 'Riverside night market', support: 1, cost: -6, time: 6, viable: false },
];

function Coco({ mood = 'idle', tiny = false }: { mood?: 'idle' | 'happy' | 'panic'; tiny?: boolean }) {
  return (
    <div className={`coco ${mood} ${tiny ? 'tiny' : ''}`} aria-label={`Coco ${mood}`}>
      <span className="antenna a1" /><span className="antenna a2" />
      <span className="coco-shell"><i className="eye e1" /><i className="eye e2" /><i className="mouth" /></span>
      <span className="leg l1" /><span className="leg l2" /><span className="leg l3" />
      <span className="leg r1" /><span className="leg r2" /><span className="leg r3" />
    </div>
  );
}

function SectionTitle({ kicker, title, copy }: { kicker: string; title: string; copy?: string }) {
  return <header className="page-title"><span>{kicker}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</header>;
}

function MiniTool({ icon: Icon, label, note, onClick }: { icon: React.ComponentType<{ size?: number }>; label: string; note: string; onClick: () => void }) {
  return <button className="mini-tool" onClick={onClick}><Icon size={18}/><span><b>{label}</b><small>{note}</small></span><ChevronRight size={16}/></button>;
}

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [mode, setMode] = useState<TripMode>('group');
  const [mustGo, setMustGo] = useState('Tsukiji food walk');
  const [veto, setVeto] = useState('No raw-food-only dinner');
  const [tripVibe, setTripVibe] = useState('Relax + Food');
  const [preference, setPreference] = useState('One scenic café each day');
  const [flexible, setFlexible] = useState('Evening activity can move');
  const [plannerTurn, setPlannerTurn] = useState('Mei');
  const [packing, setPacking] = useState<PackItem[]>([
    { name: 'Portable charger', owner: 'Mei', shared: false, done: true },
    { name: 'Umbrella', owner: 'JH', shared: true, done: false },
    { name: 'Pocket Wi-Fi', owner: 'Zi Shan', shared: true, done: true },
  ]);
  const [courtOpen, setCourtOpen] = useState(false);
  const [courtPick, setCourtPick] = useState<CourtPick>(null);
  const [gacha, setGacha] = useState<string | null>(null);
  const [courtConfirmed, setCourtConfirmed] = useState(false);
  const [delay, setDelay] = useState(false);
  const [replanPreview, setReplanPreview] = useState(false);
  const [emergencyApproved, setEmergencyApproved] = useState(false);
  const [replanApplied, setReplanApplied] = useState(false);
  const [mood, setMood] = useState<Mood>(null);
  const [split, setSplit] = useState(false);
  const [privacy, setPrivacy] = useState<Privacy>('status');
  const [continuousLocation, setContinuousLocation] = useState(false);
  const [reported, setReported] = useState(false);
  const [receiptPrinted, setReceiptPrinted] = useState(false);
  const [worthIt, setWorthIt] = useState<'yes' | 'mixed' | 'no' | null>(null);
  const [profileLearned, setProfileLearned] = useState(false);
  const [photoIndexed, setPhotoIndexed] = useState(false);
  const [journalGenerated, setJournalGenerated] = useState(false);
  const [published, setPublished] = useState(false);
  const [externalLink, setExternalLink] = useState('https://example.com/tokyo-cafe-list');
  const [linkAnalyzed, setLinkAnalyzed] = useState(false);
  const [communityTrips, setCommunityTrips] = useState<CommunityTrip[]>([
    { id: 1, title: 'Tokyo: slow food + vintage streets', author: 'Aki', match: 92, saved: false },
    { id: 2, title: 'Rain-proof Tokyo weekend', author: 'Mina', match: 86, saved: false },
  ]);

  const travellerCount = mode === 'group' ? 4 : 1;
  const budgetTotal = mode === 'group' ? 2400 : 1200;
  const planned = mode === 'group' ? 1760 : 820;
  const spent = mode === 'group' ? 1288 : 604;
  const replanCost = replanApplied ? 8 : 0;
  const remaining = budgetTotal - spent - replanCost;
  const planHealth = replanApplied ? 91 : 86;
  const cocoMood: 'idle' | 'happy' | 'panic' = delay && !replanApplied ? 'panic' : courtConfirmed || replanApplied || reported || receiptPrinted ? 'happy' : 'idle';

  const decisionHistory = useMemo(() => [
    ...(courtConfirmed && gacha ? [`Dinner Court · ${gacha}`] : []),
    ...(replanApplied ? ['Emergency Court · Underground food hall accepted'] : []),
  ], [courtConfirmed, gacha, replanApplied]);

  function togglePack(index: number) {
    setPacking(items => items.map((item, i) => i === index ? { ...item, done: !item.done } : item));
  }

  function renderHome() {
    return <>
      <section className="home-hero paper-sheet">
        <div><span className="eyebrow">DAY 2 · TOKYO</span><h2>Good morning, Mei.</h2><p>Today is gentle on purpose. One anchor, two flexible pockets, and room for the city to surprise you.</p></div>
        <Coco mood={cocoMood}/>
      </section>

      <section className="today-card">
        <div className="today-head"><div><span>Today’s journey</span><b>Oct 13 · 18°C · cloudy</b></div><button onClick={() => setTab('plan')}>Full plan <ChevronRight size={15}/></button></div>
        <div className="journey-line">
          <div className="journey-stop anchor"><time>10:00</time><span/><div><b>{mustGo}</b><small>⚓ Anchor · protected</small></div></div>
          <div className="journey-stop"><time>14:30</time><span/><div><b>Daikanyama cafés</b><small>🫧 Floating · RM38 est.</small></div></div>
          <div className="journey-stop mystery"><time>17:00</time><span/><div><b>Mystery Window</b><small>🎰 Open · spontaneous slot</small></div></div>
        </div>
      </section>

      <section className="status-strip">
        <div><span>Plan health</span><b>{planHealth}/100</b></div>
        <div><span>Budget left</span><b>RM {remaining}</b></div>
        <div><span>Group</span><b>{travellerCount} people</b></div>
      </section>

      <section className="home-tools">
        <MiniTool icon={Users} label="Group DNA" note="1 conflict needs a decision" onClick={() => setDrawer('group')}/>
        <MiniTool icon={PackageCheck} label="Packing" note={`${packing.filter(i => i.done).length}/${packing.length} ready`} onClick={() => setDrawer('packing')}/>
        <MiniTool icon={Send} label="Family Window" note="Status-only sharing" onClick={() => setDrawer('family')}/>
      </section>
    </>;
  }

  function renderPlan() {
    return <>
      <SectionTitle kicker="PLAN · TRAVEL NOTEBOOK" title="Build a plan that can bend." copy="Keep the important things firm. Let the rest breathe." />

      <section className="trip-promise paper-strip"><span>TRIP PROMISE</span><b>Easy pace · food-first · one protected highlight · room for surprise</b></section>

      <section className="itinerary-sheet paper-sheet">
        <div className="sheet-heading"><div><span>DAY 2</span><h3>Tokyo · city wandering</h3></div><div className="score-stamp">{planHealth}</div></div>
        <div className="itinerary-row anchor"><time>10:00</time><div><b>{mustGo}</b><small>Must-Go · cannot be AI-replaced</small></div><em>ANCHOR</em></div>
        <div className="itinerary-row"><time>14:30</time><div><b>Daikanyama cafés</b><small>{preference}</small></div><em>FLOATING</em></div>
        <div className="itinerary-row mystery"><time>17:00</time><div><b>Mystery Window</b><small>{flexible}</small></div><em>OPEN</em></div>
        <div className="itinerary-row anchor"><time>19:30</time><div><b>Neighbourhood dinner</b><small>Group reunion point</small></div><em>ANCHOR</em></div>
      </section>

      <section className="why-note"><Sparkles size={19}/><div><b>Why this plan?</b><p>{mustGo} protects the strongest preference. The café stays floating so weather or fatigue can move it without breaking the trip promise.</p></div></section>

      <section className="plan-toolbox">
        <MiniTool icon={Users} label="Group workspace" note={`Editing turn: ${plannerTurn}`} onClick={() => setDrawer('group')}/>
        <MiniTool icon={Box} label="Backup Plan pool" note="2 viable · 1 weather-blocked" onClick={() => setDrawer('backup')}/>
        <MiniTool icon={CircleDollarSign} label="Budget planner" note={`RM ${planned} planned of RM ${budgetTotal}`} onClick={() => setDrawer('budget')}/>
        <MiniTool icon={Link2} label="Import inspiration" note="P2 parser placeholder ready" onClick={() => setDrawer('import')}/>
      </section>

      {mode === 'group' && <section className="conflict-ticket">
        <span>UNRESOLVED CONFLICT</span><b>Ramen tonight vs sushi tonight</b><small>2–2 tie · Gacha unlocks only after a real tie</small>
        <button className="ritual-trigger" onClick={() => { setCourtOpen(true); setGacha(null); setCourtConfirmed(false); }}>Open Group Court <Gavel size={18}/></button>
      </section>}
    </>;
  }

  function renderDuring() {
    return <>
      <SectionTitle kicker="DURING · LIVE TRIP" title={delay ? 'Reality changed.' : 'The trip is moving.'} copy="Coco watches the plan, not your every step." />

      <section className={`live-map ${delay ? 'rain' : ''}`}>
        <div className="map-top"><span><MapPin size={15}/> Shibuya area</span><b>{delay ? '30 min behind' : 'On schedule'}</b></div>
        <svg viewBox="0 0 340 180" role="img" aria-label="Schematic route map"><path d="M25 135 C78 64 132 126 185 85 S265 52 315 42"/><circle cx="25" cy="135" r="6"/><circle cx="185" cy="85" r="6"/><circle cx="315" cy="42" r="7"/></svg>
        <div className="ride-coco"><Coco tiny mood={delay ? 'panic' : 'happy'}/></div>
        <div className="next-stop"><span>Next</span><b>{delay ? 'Replan needed' : 'Daikanyama cafés · 14:30'}</b></div>
      </section>

      {!delay && <button className="event-button" onClick={() => { setDelay(true); setReplanPreview(false); setReplanApplied(false); setEmergencyApproved(false); }}><CloudRain size={20}/> Simulate heavy rain disruption</button>}

      {delay && !replanApplied && <section className="disruption-stage">
        <div className="disruption-head"><CloudRain size={26}/><div><span>OUTDOOR BLOCK FAILED</span><b>17:00 market is no longer viable.</b></div></div>
        {!replanPreview ? <>
          <div className="ghost-suggestion"><span>👻 GHOST REVIVAL</span><b>Underground food hall</b><small>Highest-support viable backup · +RM8 · +12 min · Anchor protected</small></div>
          <button className="primary" onClick={() => setReplanPreview(true)}>Preview minimum-loss repair</button>
        </> : <>
          <div className="change-ticket"><div><span>KEEP</span><b>{mustGo}</b></div><div><span>REPLACE</span><b>Market → food hall</b></div><div><span>MOVE</span><b>Mystery Window → 19:00</b></div><div><span>IMPACT</span><b>+RM8 · +12 min</b></div></div>
          {mode === 'group' && <div className="emergency-court"><span>EMERGENCY COURT · 90 SEC</span><b>{emergencyApproved ? 'Approved · 3/4' : 'Group approval required'}</b><button onClick={() => setEmergencyApproved(true)}>{emergencyApproved ? '✓ Approved' : 'Simulate group approval'}</button></div>}
          <div className="action-row"><button className="secondary" onClick={() => setReplanPreview(false)}>Not now</button><button className="primary" disabled={mode === 'group' && !emergencyApproved} onClick={() => setReplanApplied(true)}>Apply repair</button></div>
        </>}
      </section>}

      {replanApplied && <section className="success-note"><Check size={21}/><div><b>Plan repaired.</b><small>Anchor protected · Mystery Window moved · +RM8 · undo available</small></div><button onClick={() => setReplanApplied(false)}>Undo</button></section>}

      <section className="energy-check"><span>HOW’S THE GROUP?</span><div>{(['great','okay','tired'] as const).map(value => <button key={value} className={mood === value ? 'active' : ''} onClick={() => setMood(value)}>{value === 'great' ? '⚡ Great' : value === 'okay' ? '🙂 Okay' : '🥱 Tired'}</button>)}</div>{mood === 'tired' && <small>Coco suggests dropping one floating item and adding 45 min rest. Anchors stay untouched.</small>}</section>

      {mode === 'group' && <section className="split-note"><div><span>SMART SPLIT</span><b>{split ? '2 café · 2 shopping' : 'Different energy levels?'}</b><small>{split ? 'Reunion · Hachiko 19:30 · ±15 min' : 'Split only when both mini-plans stay feasible.'}</small></div><button onClick={() => setSplit(!split)}>{split ? 'Cancel' : 'Create split'}</button></section>}

      <section className="during-tools">
        <MiniTool icon={Send} label="Family Window" note={reported ? 'Latest reassurance sent' : 'Reassurance, not surveillance'} onClick={() => setDrawer('family')}/>
        <MiniTool icon={MapPin} label="Location privacy" note={continuousLocation ? 'Continuous location on by consent' : 'Continuous location off'} onClick={() => setDrawer('family')}/>
      </section>
    </>;
  }

  function renderMemories() {
    return <>
      <SectionTitle kicker="AFTER · MEMORY TRUNK" title="Keep what the trip taught you." copy="Photos, choices, little failures, and the things you would do again." />

      <section className="trunk-hero">
        <div className="trunk-lid"/><div className="trunk-body"><span className="postcard p1">TOKYO</span><span className="postcard p2">雨の日</span><span className="ticket">10.13</span><Coco tiny mood="happy"/></div>
      </section>

      <section className="memory-actions">
        <button onClick={() => setPhotoIndexed(true)}><Map size={20}/><span><b>Photo Map</b><small>{photoIndexed ? '18 photos indexed · 4 areas' : 'Import EXIF placeholder'}</small></span></button>
        <button onClick={() => setJournalGenerated(true)}><BookOpen size={20}/><span><b>Travel journal</b><small>{journalGenerated ? 'Draft generated' : 'Generate from timeline + photos'}</small></span></button>
      </section>

      {journalGenerated && <section className="postcard-note"><span>OCT 13 · TOKYO</span><p>Rain changed the evening, but the group kept the one thing everyone cared about. We ended up underground, warmer, later, and somehow happier.</p><small>Mock AI draft · editable before saving</small></section>}

      <section className="worth-card"><span>WORTH IT?</span><h3>Would you choose this kind of day again?</h3><div>{(['yes','mixed','no'] as const).map(value => <button key={value} className={worthIt === value ? 'active' : ''} onClick={() => setWorthIt(value)}>{value === 'yes' ? 'Worth it' : value === 'mixed' ? 'Mixed' : 'Not really'}</button>)}</div>{worthIt && <p>Coco noticed you declared “slow mornings” but enjoyed the earlier food walk. Update your profile only if you agree.</p>}{worthIt && <button className="secondary" onClick={() => setProfileLearned(true)}>{profileLearned ? '✓ Preference learning saved' : 'Confirm this learning'}</button>}</section>

      <section className="review-ledger paper-sheet"><div><span>Budget vs actual</span><b>RM {spent + replanCost} spent</b><small>RM {remaining} remaining</small></div><div><span>Decisions</span><b>{decisionHistory.length || 0} recorded</b><small>{decisionHistory[0] || 'No Court history yet'}</small></div></section>

      <section className="community-entry"><div><span>COMMUNITY</span><b>{published ? 'Published with consent' : 'Private by default'}</b><small>Nothing becomes public without an explicit action.</small></div><button onClick={() => setDrawer('community')}>Open</button></section>
    </>;
  }

  function renderMe() {
    return <>
      <SectionTitle kicker="ME · COCO PROFILE" title="How do you actually like to travel?" copy="Private preferences first. Group DNA comes after." />
      <section className="profile-hero paper-sheet"><Coco mood="happy"/><div><span>MEI · GROUP TRAVELLER</span><h3>{tripVibe}</h3><p>Food-first · budget-aware · flexible plans</p></div></section>
      <section className="profile-fields">
        <label><span>Trip vibe</span><input value={tripVibe} onChange={e => setTripVibe(e.target.value)}/></label>
        <label><span>Must-Go</span><input value={mustGo} onChange={e => setMustGo(e.target.value)}/></label>
        <label><span>Deal breaker</span><input value={veto} onChange={e => setVeto(e.target.value)}/></label>
        <label><span>Preference</span><input value={preference} onChange={e => setPreference(e.target.value)}/></label>
        <label><span>Flexible</span><input value={flexible} onChange={e => setFlexible(e.target.value)}/></label>
      </section>
      <div className="mode-toggle"><button className={mode === 'group' ? 'active' : ''} onClick={() => setMode('group')}>Group trip</button><button className={mode === 'solo' ? 'active' : ''} onClick={() => setMode('solo')}>Solo trip</button></div>
      <section className="me-tools"><MiniTool icon={Users} label="Group DNA" note="See common ground + explicit conflict" onClick={() => setDrawer('group')}/><MiniTool icon={PackageCheck} label="Packing ownership" note="Shared items have one clear owner" onClick={() => setDrawer('packing')}/><MiniTool icon={Link2} label="External inspiration" note="P2 parser placeholder" onClick={() => setDrawer('import')}/></section>
    </>;
  }

  function renderDrawer() {
    if (!drawer) return null;
    return <div className="overlay" onMouseDown={() => setDrawer(null)}><section className="drawer" onMouseDown={e => e.stopPropagation()}><button className="close" onClick={() => setDrawer(null)}><X size={20}/></button>
      {drawer === 'group' && <><span className="drawer-kicker">GROUP DNA</span><h3>Mostly aligned. One thing needs a real decision.</h3><div className="dna-grid"><div><span>Vibe</span><b>{tripVibe}</b></div><div><span>Pace</span><b>Relaxed</b></div><div><span>Budget</span><b>RM600 / person</b></div><div><span>Food</span><b>High priority</b></div></div><div className="conflict-mini"><span>CONFLICT</span><b>Mei: {mustGo}</b><b>JH: {veto}</b></div><div className="planner-turn"><span>Editing turn</span><b>{plannerTurn}</b><button onClick={() => setPlannerTurn(plannerTurn === 'Mei' ? 'JH' : plannerTurn === 'JH' ? 'Zi Shan' : 'Mei')}>Pass turn</button></div></>}
      {drawer === 'packing' && <><span className="drawer-kicker">PACKING</span><h3>One bag, zero “I thought you brought it.”</h3>{packing.map((item, i) => <button className={`pack-row ${item.done ? 'done' : ''}`} key={item.name} onClick={() => togglePack(i)}><span>{item.done ? '✓' : '○'}</span><div><b>{item.name}</b><small>{item.shared ? `Shared · ${item.owner} owns this` : `Owner · ${item.owner}`}</small></div></button>)}</>}
      {drawer === 'backup' && <><span className="drawer-kicker">BACKUP PLAN POOL</span><h3>Ideas worth keeping when reality misbehaves.</h3>{backups.map(item => <div className={`backup-row ${item.viable ? '' : 'off'}`} key={item.name}><b>{item.name}</b><small>{item.support} supporters · {item.cost >= 0 ? '+' : ''}RM{item.cost} · +{item.time} min {item.viable ? '· viable' : '· blocked'}</small></div>)}</>}
      {drawer === 'budget' && <><span className="drawer-kicker">TRIP BUDGET</span><h3>Spend on what matters, not on surprises you forgot to price.</h3><div className="budget-big"><b>RM {remaining}</b><span>remaining</span></div><div className="budget-lines"><div><span>Stay</span><b>RM900</b></div><div><span>Food</span><b>RM420</b></div><div><span>Transit</span><b>RM220</b></div><div><span>Activities</span><b>RM220</b></div></div><button className="receipt-button" onClick={() => setReceiptPrinted(true)}><ReceiptText size={18}/>{receiptPrinted ? '✓ Receipt printed' : 'Print split-bill receipt'}</button>{receiptPrinted && <div className="receipt-paper"><b>COCOCRUNCH · DINNER</b><span>Mei · RM47</span><span>JH · RM43</span><span>Zi Shan · RM46</span><span>Alex · RM44</span><em>PAID</em></div>}</>}
      {drawer === 'family' && <><span className="drawer-kicker">FAMILY WINDOW</span><h3>Reassurance, not surveillance.</h3><div className="porch-light"><span className="lantern">◉</span><div><b>{delay ? '🟡 Plan changed, everyone is safe.' : '🟢 Everything is going as planned.'}</b><small>No action needed.</small></div></div><div className="privacy-grid">{(['status','area','exact'] as Privacy[]).map(level => <button key={level} className={privacy === level ? 'active' : ''} onClick={() => setPrivacy(level)}>{level === 'status' ? 'Status only' : level === 'area' ? 'Approx. area' : 'Exact location'}</button>)}</div><label className="toggle-row"><span><b>Continuous location</b><small>Off by default</small></span><input type="checkbox" checked={continuousLocation} onChange={e => setContinuousLocation(e.target.checked)}/></label><button className="courier-button" onClick={() => setReported(true)}>{reported ? '🪳💨 Sent to family' : 'Send reassurance with Coco'}</button></>}
      {drawer === 'import' && <><span className="drawer-kicker">IMPORT INSPIRATION · P2</span><h3>Check if an outside recommendation fits your trip.</h3><input className="big-input" value={externalLink} onChange={e => setExternalLink(e.target.value)}/><button className="primary" onClick={() => setLinkAnalyzed(true)}>{linkAnalyzed ? 'Analyze again' : 'Analyze link'}</button>{linkAnalyzed && <div className="analysis-result"><b>84% fit</b><small>3 places match your pace · 1 conflicts with the budget cap · parser/data source still placeholder.</small></div>}</>}
      {drawer === 'community' && <><span className="drawer-kicker">COMMUNITY · P2</span><h3>Borrow ideas, not someone else’s whole trip.</h3>{communityTrips.map(trip => <div className="community-row" key={trip.id}><div><b>{trip.title}</b><small>{trip.match}% fit · by {trip.author}</small></div><button onClick={() => setCommunityTrips(items => items.map(item => item.id === trip.id ? { ...item, saved: !item.saved } : item))}>{trip.saved ? 'Saved' : 'Save'}</button></div>)}<div className="publish-row"><div><b>Your trip</b><small>{published ? 'Public by explicit consent' : 'Private'}</small></div><button onClick={() => setPublished(!published)}>{published ? 'Unpublish' : 'Publish'}</button></div></>}
    </section></div>;
  }

  return <div className="app-shell">
    <header className="topbar"><div className="wordmark"><span>COCOCRUNCH</span><b>COCO IN YOUR AREA.</b></div><button className="bell"><Bell size={19}/><i/></button></header>
    <main>{tab === 'home' ? renderHome() : tab === 'plan' ? renderPlan() : tab === 'during' ? renderDuring() : tab === 'memories' ? renderMemories() : renderMe()}</main>

    <nav className="bottom-nav">{tabs.map(item => { const Icon = item.icon; return <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => setTab(item.id)}><Icon size={20}/><span>{item.label}</span></button>; })}</nav>

    {courtOpen && <div className="ritual-overlay"><section className="court-stage"><button className="close light" onClick={() => setCourtOpen(false)}><X size={20}/></button><span className="ritual-kicker">GROUP COURT</span><Coco mood="happy"/><h3>Lunch argument, now with due process.</h3><p>2–2 tie. No averaging away the conflict.</p><div className="court-options"><button className={courtPick === 'ramen' ? 'active' : ''} onClick={() => setCourtPick('ramen')}>🍜<b>Ramen</b><small>2 votes · cheaper</small></button><button className={courtPick === 'sushi' ? 'active' : ''} onClick={() => setCourtPick('sushi')}>🍣<b>Sushi</b><small>2 votes · stronger wish</small></button></div><div className="trade-slip"><b>Possible trade</b><small>Ramen tonight ↔ sushi market becomes tomorrow’s protected lunch.</small></div><button className="gacha-machine" onClick={() => { setGacha(Math.random() > .5 ? 'Ramen wins the tie.' : 'Sushi wins the tie.'); setCourtConfirmed(false); }}>🎰 Pull Gacha</button>{gacha && <div className="verdict"><span>VERDICT</span><b>{gacha}</b><small>Random result is still only a proposal.</small><button onClick={() => setCourtConfirmed(true)}>{courtConfirmed ? '✓ Added to official timeline' : 'Confirm result'}</button></div>}</section></div>}

    {renderDrawer()}
  </div>;
}
