import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BatteryCharging, BookOpen, Camera, Droplets, Glasses, Headphones, Map,
  Package, Pill, Plug, Shirt, Smartphone, Ticket, Umbrella, Wallet, Wifi, X,
} from 'lucide-react';
import { subscribeExperience, emitExperience } from './experience';
import { playSound } from './sound';
import cocoIdle from './assets/coco/coco-idle.png';
import './packing-replica.css';

type PackItem = { id: string; name: string; packed: boolean };
type DragState = { id: string; x: number; y: number; startX: number; startY: number } | null;

const STORAGE_KEY = 'cococrunch:packing-v2';
const starterItems: PackItem[] = [
  { id: 'charger', name: 'Portable charger', packed: false },
  { id: 'umbrella', name: 'Umbrella', packed: false },
  { id: 'wifi', name: 'Pocket Wi-Fi', packed: false },
  { id: 'camera', name: 'Camera', packed: false },
];

function readItems(): PackItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return starterItems;
    const parsed = JSON.parse(raw) as PackItem[];
    return Array.isArray(parsed) && parsed.length ? parsed.slice(0, 10) : starterItems;
  } catch {
    return starterItems;
  }
}

function iconFor(name: string) {
  const n = name.toLowerCase();
  if (n.includes('umbrella') || n.includes('rain')) return Umbrella;
  if (n.includes('wifi') || n.includes('wi-fi')) return Wifi;
  if (n.includes('charger') || n.includes('power bank') || n.includes('battery')) return BatteryCharging;
  if (n.includes('camera')) return Camera;
  if (n.includes('shirt') || n.includes('cloth') || n.includes('jacket')) return Shirt;
  if (n.includes('phone')) return Smartphone;
  if (n.includes('plug') || n.includes('adapter')) return Plug;
  if (n.includes('medicine') || n.includes('pill')) return Pill;
  if (n.includes('water') || n.includes('bottle')) return Droplets;
  if (n.includes('glass')) return Glasses;
  if (n.includes('wallet') || n.includes('cash') || n.includes('card')) return Wallet;
  if (n.includes('headphone') || n.includes('earphone')) return Headphones;
  if (n.includes('book') || n.includes('journal')) return BookOpen;
  if (n.includes('map')) return Map;
  if (n.includes('ticket') || n.includes('pass')) return Ticket;
  return Package;
}

const scatter = [
  { left: 4, top: 12, rotate: -8 }, { left: 73, top: 9, rotate: 7 },
  { left: 1, top: 48, rotate: 6 }, { left: 76, top: 49, rotate: -7 },
  { left: 11, top: 76, rotate: -4 }, { left: 67, top: 76, rotate: 8 },
  { left: 35, top: 2, rotate: -3 }, { left: 37, top: 82, rotate: 4 },
  { left: 2, top: 29, rotate: -5 }, { left: 78, top: 30, rotate: 5 },
];

type Props = { visible: boolean; onClose: () => void };

export default function PackingReplica({ visible, onClose }: Props) {
  const [items, setItems] = useState<PackItem[]>(readItems);
  const [draft, setDraft] = useState('');
  const [drag, setDrag] = useState<DragState>(null);
  const suitcaseRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeExperience(event => {
    if (event.type === 'close-packing') onClose();
    if (event.type === 'open-packing' && event.items?.length) {
      setItems(current => event.items!.map((name, index) => ({ id: `${index}-${name}`, name, packed: current.find(item => item.name === name)?.packed ?? false })));
    }
  }), [onClose]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* progressive persistence */ }
  }, [items]);

  const packedCount = items.filter(item => item.packed).length;
  const complete = items.length > 0 && packedCount === items.length;
  const packedItems = useMemo(() => items.filter(item => item.packed), [items]);

  if (!visible) return null;

  const close = () => { emitExperience({ type: 'close-packing' }); onClose(); };

  const setPacked = (id: string, packed: boolean) => {
    setItems(current => current.map(item => item.id === id ? { ...item, packed } : item));
    playSound(packed ? 'save' : 'tap');
  };

  const addItem = () => {
    const name = draft.trim();
    if (!name || items.length >= 10) return;
    setItems(current => [...current, { id: `${Date.now()}-${name.toLowerCase().replace(/\W+/g, '-')}`, name, packed: false }]);
    setDraft('');
    playSound('tap');
  };

  const removeItem = (id: string) => {
    setItems(current => current.filter(item => item.id !== id));
    playSound('tap');
  };

  const startDrag = (event: React.PointerEvent<HTMLButtonElement>, id: string) => {
    const item = items.find(candidate => candidate.id === id);
    if (!item || item.packed) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ id, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY });
  };

  const moveDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    setDrag(current => current ? { ...current, x: event.clientX, y: event.clientY } : current);
  };

  const endDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const rect = suitcaseRef.current?.getBoundingClientRect();
    const droppedInside = rect && event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    if (droppedInside) setPacked(drag.id, true);
    setDrag(null);
  };

  return <div className="pack-replica-overlay" role="dialog" aria-modal="true" aria-label="Pack a bag">
    <section className={`pack-replica ${complete ? 'is-ready' : ''}`}>
      <button className="pack-replica-close" onClick={close} aria-label="Close packing"><X size={18}/></button>
      <header className="pack-replica-head">
        <span>PACK A BAG</span>
        <h2>Drag your things into the suitcase</h2>
        <p>Your trip inputs become the objects around the bag. Tap is always available as a fallback.</p>
      </header>

      <form className="pack-add" onSubmit={event => { event.preventDefault(); addItem(); }}>
        <input value={draft} onChange={event => setDraft(event.target.value)} placeholder="Add something: passport, adapter…" maxLength={36}/>
        <button type="submit" disabled={!draft.trim() || items.length >= 10}>Add</button>
      </form>

      <div className="pack-checklist" aria-label="Packing checklist">
        {items.map(item => <div className={item.packed ? 'done' : ''} key={item.id}>
          <button className="pack-check" onClick={() => setPacked(item.id, !item.packed)} aria-label={`${item.packed ? 'Unpack' : 'Pack'} ${item.name}`}>{item.packed ? '✓' : '○'}</button>
          <span>{item.name}</span>
          <button className="pack-remove" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}>×</button>
        </div>)}
      </div>

      <div className="pack-playfield">
        <div className="packing-hint">drag → drop</div>
        {items.map((item, index) => {
          const Icon = iconFor(item.name);
          const pos = scatter[index % scatter.length];
          const isDragging = drag?.id === item.id;
          const dx = isDragging ? drag.x - drag.startX : 0;
          const dy = isDragging ? drag.y - drag.startY : 0;
          return <button
            key={item.id}
            className={`loose-item ${item.packed ? 'packed' : ''} ${isDragging ? 'dragging' : ''}`}
            style={{ left: `${pos.left}%`, top: `${pos.top}%`, '--r': `${pos.rotate}deg`, transform: `translate(${dx}px, ${dy}px) rotate(${pos.rotate}deg)` } as React.CSSProperties}
            onPointerDown={event => startDrag(event, item.id)}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={() => setDrag(null)}
            onClick={() => { if (!drag && !item.packed) setPacked(item.id, true); }}
            aria-label={`${item.name}. Drag into suitcase, or tap to pack.`}
          >
            <span className="loose-object"><Icon size={34}/></span>
            <small>{item.name}</small>
          </button>;
        })}

        <div className="replica-suitcase" ref={suitcaseRef} aria-label="Open suitcase drop zone">
          <div className="replica-case-lid">
            <span className="case-handle"/>
            <span className="lid-mesh"/>
            <span className="lid-label">COCOCRUNCH</span>
          </div>
          <div className="replica-case-base">
            <span className="case-divider"/>
            <span className="case-strap s1"/><span className="case-strap s2"/>
            <div className="inside-grid">
              {packedItems.map(item => { const Icon = iconFor(item.name); return <button key={item.id} onClick={() => setPacked(item.id, false)} aria-label={`Take ${item.name} back out`}><Icon size={20}/><small>{item.name}</small></button>; })}
            </div>
          </div>
          <div className="replica-coco" aria-hidden="true"><img src={cocoIdle} alt=""/></div>
        </div>
      </div>

      <div className="pack-progress"><span>{packedCount} / {items.length || 0} packed</span><i><b style={{ width: `${items.length ? (packedCount / items.length) * 100 : 0}%` }}/></i></div>
      <button className="pack-ready" disabled={!complete} onClick={close}>
        <span>{complete ? 'READY TO GO' : 'KEEP PACKING'}</span><b>{complete ? '→' : 'drag or tap any item'}</b>
      </button>
    </section>
  </div>;
}
