import React, { useMemo, useState } from 'react';
import { ArrowRight, Check, CircleDollarSign, CloudRain, Gavel, Heart, Map, Sparkles, Users, Send, ReceiptText, Box, Route, PackageCheck } from 'lucide-react';
import { familyReport, savedPlace, splitBill } from './features';

const steps = [
  { id: 'me', label: 'Know me', icon: Heart },
  { id: 'us', label: 'Know us', icon: Users },
  { id: 'plan', label: 'Plan', icon: Map },
  { id: 'court', label: 'Court', icon: Gavel },
  { id: 'reality', label: 'Reality', icon: CloudRain },
  { id: 'family', label: 'Report', icon: Send },
  { id: 'budget', label: 'Budget', icon: ReceiptText },
  { id: 'memories', label: 'Memories', icon: Box },
];

const palette = {
  cream: '#FFF8E7',
  sangria: '#930500',
  blue: '#95BBEA',
};

function Coco({ mood = 'idle' }: { mood?: 'idle' | 'happy' | 'panic' }) {
  return (
    <div className={`coco coco-${mood}`} aria-label={`Coco mascot ${mood}`}>
      <span className="antenna left" />
      <span className="antenna right" />
      <span className="coco-body">
        <span className="eye left" />
        <span className="eye right" />
        <span className="mouth" />
      </span>
      <span className="leg l1" /><span className="leg l2" /><span className="leg r1" /><span className="leg r2" />
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState('me');
  const [courtChoice, setCourtChoice] = useState<'ramen' | 'sushi' | null>(null);
  const [gacha, setGacha] = useState<string | null>(null);
  const [replanned, setReplanned] = useState(false);
  const [reported, setReported] = useState(false);
  const [printed, setPrinted] = useState(false);
  const [captured, setCaptured] = useState(false);

  const index = steps.findIndex((step) => step.id === active);
  const next = steps[Math.min(index + 1, steps.length - 1)]?.id;
  const mood = active === 'reality' && !replanned ? 'panic' : courtChoice || replanned || reported || printed || captured ? 'happy' : 'idle';

  const content = useMemo(() => {
    if (active === 'me') return (
      <section className="panel">
        <p className="eyebrow">01 · Coco Profile</p>
        <h2>Coco learns how you travel.</h2>
        <div className="trait-grid">
          {['Slow mornings', 'Food-first', 'Budget-aware', 'Flexible plans'].map((trait, i) => <button key={trait} className={i < 3 ? 'chip selected' : 'chip'}>{trait}</button>)}
        </div>
        <div className="explain"><Sparkles size={18}/><span>These preferences influence pacing, recommendations, budget trade-offs and conflict detection.</span></div>
      </section>
    );

    if (active === 'us') return (
      <section className="panel">
        <p className="eyebrow">02 · Group Travel DNA</p>
        <h2>Your group mostly agrees… except here.</h2>
        <div className="dna-row"><span>Food</span><strong>High priority</strong></div>
        <div className="dna-row"><span>Pace</span><strong>Relaxed</strong></div>
        <div className="conflict-card"><span>⚠ Preference conflict</span><b>Mei: Must-Go sushi · JH: Strongly avoid raw food</b><small>Coco won’t average this away. Send it to Court.</small></div>
      </section>
    );

    if (active === 'plan') return (
      <section className="panel">
        <p className="eyebrow">03 · Executable plan</p>
        <h2>Tokyo · 5 days</h2>
        <div className="promise">Trip Promise · “Slow, food-first, leave room to wander.”</div>
        <div className="timeline-item anchor"><span>⚓ 10:00</span><div><b>Tsukiji food walk</b><small>Must-Go · protected</small></div><strong>Anchor</strong></div>
        <div className="timeline-item"><span>🫧 14:30</span><div><b>Daikanyama cafés</b><small>Fits group pace · RM38 est.</small></div><strong>Floating</strong></div>
        <div className="timeline-item mystery"><span>🎰 17:00</span><div><b>Mystery Window</b><small>Reserved for a viable surprise</small></div><strong>Open</strong></div>
        <div className="map-ride"><Route size={20}/><div><b>Ride with Coco</b><small>Map transitions can animate Coco carrying the traveller between itinerary stops.</small></div></div>
        <div className="health"><span>Plan Health</span><b>86 / 100</b><small>Budget ✓ · Walking moderate · 1 weather-sensitive block</small></div>
      </section>
    );

    if (active === 'court') return (
      <section className="panel">
        <p className="eyebrow">04 · Group Court</p>
        <h2>We disagree. Decide transparently.</h2>
        <div className="court-option"><b>🍜 Ramen dinner</b><button onClick={() => setCourtChoice('ramen')} className={courtChoice === 'ramen' ? 'vote active' : 'vote'}>Vote</button></div>
        <div className="court-option"><b>🍣 Sushi dinner</b><button onClick={() => setCourtChoice('sushi')} className={courtChoice === 'sushi' ? 'vote active' : 'vote'}>Vote</button></div>
        <button className="gacha" onClick={() => setGacha(Math.random() > 0.5 ? 'Ramen wins the tie.' : 'Sushi wins the tie.')}>🎰 Tie? Gacha decides</button>
        {gacha && <div className="result">{gacha} <span>Decision recorded.</span></div>}
      </section>
    );

    if (active === 'reality') return (
      <section className="panel">
        <p className="eyebrow">05 · Reality happens</p>
        <h2>Heavy rain hits your outdoor block.</h2>
        {!replanned ? <>
          <div className="alert"><CloudRain size={24}/><div><b>17:00 outdoor market is no longer viable.</b><small>Anchor stays protected. Coco found a Backup Plan within remaining budget.</small></div></div>
          <div className="backup"><span>👻 Ghost revival</span><b>Underground food hall</b><small>+12 min · +RM8 · matches Food priority · indoors</small></div>
          <button className="primary" onClick={() => setReplanned(true)}>Preview minimum-loss replan <ArrowRight size={18}/></button>
        </> : <>
          <div className="success"><Check size={22}/><div><b>Plan repaired.</b><small>Tsukiji Anchor preserved · Mystery Window moved · +RM8 · Trip Promise still intact.</small></div></div>
          <div className="absurd"><span>🙏 Still worried?</span><b>Coco recommends praying.</b><small>Entertainment only. Weather forecast remains unchanged.</small></div>
        </>}
      </section>
    );

    if (active === 'family') return (
      <section className="panel">
        <p className="eyebrow">06 · Family Window</p>
        <h2>Reassurance, not surveillance.</h2>
        <div className="family-status"><span>🟡 Plan changed, but everything is okay.</span><b>{familyReport.area}</b><small>{familyReport.note}</small><small>{familyReport.withGroup ? 'Still with the group' : 'Travelling solo'} · expected back {familyReport.returnTime}</small></div>
        <button className="primary" onClick={() => setReported(true)}><Send size={18}/> {reported ? 'Coco delivered it.' : 'Send a one-tap report'}</button>
        {reported && <div className="delivery"><Coco mood="happy"/><span>🪳💨 Coco carried the note out of the screen.</span></div>}
      </section>
    );

    if (active === 'budget') return (
      <section className="panel">
        <p className="eyebrow">07 · Budget + Split Bill</p>
        <h2>Make the boring part tactile.</h2>
        <div className="receipt-card">
          <div className="receipt-head"><ReceiptText size={20}/><b>PLANPAN TRAVEL OFFICE</b></div>
          <div className="receipt-line"><span>Total</span><strong>{splitBill.currency} {splitBill.total.toLocaleString()}</strong></div>
          {splitBill.members.map((member) => <div className="receipt-line" key={member.name}><span>{member.name}</span><strong>{member.amount.toLocaleString()}</strong></div>)}
        </div>
        <button className="primary" onClick={() => setPrinted(true)}><ReceiptText size={18}/> {printed ? 'RRRIP— receipt saved' : 'Print & tear receipt'}</button>
        {printed && <div className="printed">PAID · budget history updated</div>}
      </section>
    );

    return (
      <section className="panel">
        <p className="eyebrow">08 · Memories</p>
        <h2>Your trip lives in a box, not a grid.</h2>
        <div className="memory-box"><Box size={40}/><b>2.5D Travel Trunk</b><small>Postcards, tickets, receipts and photos stack inside as physical-feeling objects.</small></div>
        <div className="capture-card"><PackageCheck size={22}/><div><b>{savedPlace.name}</b><small>{savedPlace.reason}</small></div><button className={captured ? 'vote active' : 'vote'} onClick={() => setCaptured(true)}>{captured ? 'Captured' : 'Capture'}</button></div>
        {captured && <div className="result">🔴 WHOOP— location absorbed into the capsule.</div>}
      </section>
    );
  }, [active, courtChoice, gacha, replanned, reported, printed, captured]);

  return (
    <main className="app-shell" style={{ '--cream': palette.cream, '--sangria': palette.sangria, '--blue': palette.blue } as React.CSSProperties}>
      <header className="topbar">
        <div>
          <p className="brand-kicker">COCOCRUNCH</p>
          <h1>COCO IN YOUR AREA.</h1>
          <p className="subtitle">Trips get messy. Coco rolls with it.</p>
        </div>
        <Coco mood={mood} />
      </header>

      <div className="status-strip">
        <div><CircleDollarSign size={16}/><span>Budget RM 2,400</span></div>
        <div><Users size={16}/><span>4 travellers</span></div>
        <div><Sparkles size={16}/><span>AI changes always require confirmation</span></div>
      </div>

      <nav className="stepper" aria-label="CocoCrunch demo flow">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return <button key={step.id} onClick={() => setActive(step.id)} className={active === step.id ? 'step active' : 'step'}>
            <span>{i + 1}</span><Icon size={16}/><small>{step.label}</small>
          </button>;
        })}
      </nav>

      {content}

      {active !== 'memories' && <button className="next" onClick={() => setActive(next)}>Continue <ArrowRight size={17}/></button>}

      <footer>
        <button onClick={() => setActive('plan')}>Plan</button>
        <button onClick={() => setActive('court')}>Court</button>
        <button onClick={() => setActive('reality')}>During</button>
        <button onClick={() => setActive('family')}>Report</button>
        <button onClick={() => setActive('me')}>Me</button>
      </footer>
    </main>
  );
}
