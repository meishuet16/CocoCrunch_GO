import { useState } from 'react';
import { Box, Mail, RotateCcw, X } from 'lucide-react';

type MemoryView = 'trunk' | 'ghost' | 'postcard';

export default function MemoryRituals() {
  const [view, setView] = useState<MemoryView>('trunk');
  const [trunkOpen, setTrunkOpen] = useState(false);
  const [revived, setRevived] = useState(false);
  const [sealed, setSealed] = useState(false);
  const [note, setNote] = useState('Remember: the best part was not following the plan perfectly.');

  return <section className="memory-rituals" aria-label="Trip memory rituals">
    <nav className="memory-tabs" aria-label="Memory ritual views">
      <button aria-pressed={view === 'trunk'} onClick={() => setView('trunk')}><Box size={16}/> Trunk</button>
      <button aria-pressed={view === 'ghost'} onClick={() => setView('ghost')}>👻 Ghost Wish</button>
      <button aria-pressed={view === 'postcard'} onClick={() => setView('postcard')}><Mail size={16}/> Future Postcard</button>
    </nav>
    {view === 'trunk' && <div className={`memory-trunk ${trunkOpen ? 'open' : ''}`}>
      <button className="trunk-lid" aria-expanded={trunkOpen} onClick={() => setTrunkOpen(open => !open)}>{trunkOpen ? <X/> : <Box/>}<b>{trunkOpen ? 'Close travel trunk' : 'Open travel trunk'}</b></button>
      {trunkOpen && <div className="trunk-keepsakes"><span>🎫 Metro ticket</span><span>📷 Rainy Shibuya</span><span>🧾 Dinner receipt</span><span>💌 Tokyo postcard</span></div>}
    </div>}
    {view === 'ghost' && <div className="ghost-wish"><span className="memory-kicker">THE TRIPS THAT DIDN'T MAKE IT</span><h3>Riverside night market</h3><p>Rejected because heavy rain made the route unsafe. Coco keeps the idea and its reason instead of deleting history.</p><button onClick={() => setRevived(value => !value)}><RotateCcw size={17}/>{revived ? 'Returned to Ghost Wish' : 'Revive for another day'}</button>{revived && <small>Revived as a future idea — not inserted into today’s official itinerary.</small>}</div>}
    {view === 'postcard' && <div className="future-postcard"><span className="memory-kicker">POSTCARD TO FUTURE ME</span>{!sealed ? <><textarea value={note} onChange={event => setNote(event.target.value)} aria-label="Future postcard message"/><button onClick={() => setSealed(true)}>Seal postcard</button></> : <><div className="sealed-card"><b>TO: FUTURE ME</b><p>{note}</p><small>From Tokyo · after the messy plan worked out anyway</small></div><button onClick={() => setSealed(false)}>Open & edit</button></>}</div>}
  </section>;
}
