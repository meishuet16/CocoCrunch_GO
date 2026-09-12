import { useEffect, useRef, useState } from 'react';
import { CocoCompanion } from './coco/CocoCompanion';
import type { CocoContext } from './coco/assets';
import { subscribeExperience } from '../experience';
import './global-coco.css';

type Edge = 'left' | 'right';
type Props = { context: CocoContext; onAsk: () => void; onPray: () => void; onNext: () => void; onEveryday: () => void; onLucky: () => void };
const STORAGE_KEY = 'cococrunch:coco-position:v1';

export function GlobalCocoCompanion({ context, onAsk, onPray, onNext, onEveryday, onLucky }: Props) {
  const [open, setOpen] = useState(false);
  const [packingOpen, setPackingOpen] = useState(false);
  const [position, setPosition] = useState<{ edge: Edge; y: number }>(() => {
    try { const saved = typeof window !== 'undefined' ? JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null') : null; return saved?.edge && Number.isFinite(saved.y) ? saved : { edge: 'right', y: .68 }; } catch { return { edge: 'right', y: .68 }; }
  });
  const drag = useRef<{ pointerId: number; moved: boolean } | null>(null);
  useEffect(() => { if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(position)); }, [position]);
  useEffect(() => { const resize = () => setPosition(current => ({ ...current, y: Math.max(.1, Math.min(.9, current.y)) })); window.addEventListener('resize', resize); return () => window.removeEventListener('resize', resize); }, []);
  useEffect(() => subscribeExperience(event => {
    if (event.type === 'open-packing') setPackingOpen(true);
    if (event.type === 'close-packing') setPackingOpen(false);
  }), []);
  const effectiveContext = packingOpen ? 'packing' : context;
  const activate = (action: () => void) => { setOpen(false); action(); };
  return <aside className={`global-coco global-coco--${position.edge} ${open ? 'is-open' : ''}`} style={{ top: `${position.y * 100}%` }} aria-label="Coco companion">
    <button className="global-coco__button" type="button" aria-expanded={open} aria-label="Open Coco menu" onPointerDown={event => { drag.current = { pointerId: event.pointerId, moved: false }; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={event => { if (!drag.current || drag.current.pointerId !== event.pointerId) return; if (Math.abs(event.movementX) + Math.abs(event.movementY) > 4) drag.current.moved = true; if (drag.current.moved) setPosition(current => ({ edge: event.clientX < window.innerWidth / 2 ? 'left' : 'right', y: Math.max(.08, Math.min(.92, event.clientY / window.innerHeight)) })); }} onPointerUp={event => { if (drag.current?.moved) { drag.current = null; return; } drag.current = null; setOpen(value => !value); }} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setOpen(value => !value); } }}><CocoCompanion context={effectiveContext} pose={open ? 'expression-happy' : undefined} size={112}/></button>
    {open && <nav className={`global-coco__menu global-coco__menu--${position.edge}`} aria-label="Coco actions"><button onClick={() => activate(onAsk)}>Ask Coco</button><button onClick={() => activate(onPray)}>Pray</button><button onClick={() => activate(onNext)}>What next?</button><div className="global-coco__sub"><span>Surprise me</span><button onClick={() => activate(onEveryday)}>Everyday Gacha</button><button onClick={() => activate(onLucky)}>Lucky Draw</button></div></nav>}
  </aside>;
}
