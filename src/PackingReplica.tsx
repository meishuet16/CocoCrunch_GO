import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft, ChevronUp, ChevronDown, RotateCcw, Plus, Trash2,
  Check, CheckCircle2, Circle, Sparkles, X, Compass, GripVertical
} from 'lucide-react';
import { subscribeExperience, emitExperience } from './experience';
import { playSound } from './sound';
import { getItemVisualConfig } from './components/LuggageLineArt';
import { loadPersisted } from './persistence';
import './packing-replica.css';

export type PackItem = {
  id: string;
  name: string;
  packed: boolean;
  x?: number; // relative px inside suitcase (0 to 240)
  y?: number; // relative px inside suitcase (0 to 300)
  rot?: number; // tilt angle
  zIndex?: number;
};

type DragInfo = {
  id: string;
  source: 'desk' | 'suitcase';
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  initCaseX: number;
  initCaseY: number;
} | null;

const STORAGE_KEY = 'cococrunch:packing-v2';

const defaultTripItems: PackItem[] = [
  { id: 'shoes-1', name: 'comfortable walking shoes', packed: false },
  { id: 'charger-1', name: 'portable charger', packed: false },
  { id: 'rain-1', name: 'light rain layer', packed: false },
  { id: 'passport-1', name: 'passport', packed: false },
  { id: 'bottle-1', name: 'portable water bottle', packed: false },
  { id: 'clothes-1', name: '5-day clothing set', packed: false },
  { id: 'camera-1', name: 'camera', packed: false },
  { id: 'umbrella-1', name: 'compact umbrella', packed: false },
];

function readStoredItems(): PackItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultTripItems;
    const parsed = JSON.parse(raw) as PackItem[];
    return Array.isArray(parsed) && parsed.length ? parsed : defaultTripItems;
  } catch {
    return defaultTripItems;
  }
}

// Naturally scattered travel desk layout strictly situated in the spacious open desk area ABOVE the suitcase.
// Items look casually laid out before departure (organic angles & varied positions, NOT rigid grid lines),
// while maintaining generous clearance from suitcase top latches, corners, and edges.
const deskSlots = [
  { left: 14, top: 4, rotate: -12 },
  { left: 38, top: 2, rotate: 9 },
  { left: 62, top: 5, rotate: -8 },
  { left: 86, top: 3, rotate: 14 },
  { left: 24, top: 14, rotate: 11 },
  { left: 50, top: 12, rotate: -10 },
  { left: 76, top: 15, rotate: 6 },
  { left: 14, top: 21, rotate: -14 },
  { left: 86, top: 21, rotate: -7 },
];

// Default smart positions inside suitcase when tapped or initially packed
function getAutoCasePosition(name: string, index: number) {
  const n = name.toLowerCase();
  let x = 45 + ((index * 28) % 150);
  let y = 145 + ((index * 26) % 80);
  let rot = (index % 2 === 0 ? 1 : -1) * (2 + ((index * 3) % 7));

  if (n.includes('passport') || n.includes('ticket') || n.includes('card') || n.includes('doc')) {
    x = 40 + ((index * 36) % 140);
    y = 30 + ((index * 15) % 40);
  } else if (n.includes('cloth') || n.includes('shirt') || n.includes('rain') || n.includes('layer') || n.includes('5-day')) {
    x = 40 + ((index * 30) % 90);
    y = 150 + ((index * 20) % 65);
  } else if (n.includes('shoe') || n.includes('walking')) {
    x = 140 + ((index * 20) % 60);
    y = 160 + ((index * 15) % 55);
  } else if (n.includes('camera') || n.includes('charger') || n.includes('tech')) {
    x = 145 + ((index * 25) % 65);
    y = 150 + ((index * 20) % 65);
  } else if (n.includes('water') || n.includes('bottle') || n.includes('umbrella')) {
    x = 30 + ((index * 22) % 60);
    y = 155 + ((index * 20) % 65);
  }

  return { x, y, rot };
}

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function PackingReplica({ visible, onClose }: Props) {
  const [items, setItems] = useState<PackItem[]>(readStoredItems);
  const [draft, setDraft] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [topZ, setTopZ] = useState(10);
  const [flightNumber, setFlightNumber] = useState(() => loadPersisted().flightBooking?.flightNumber ?? 'FLIGHT 772');

  useEffect(() => {
    if (visible) setFlightNumber(loadPersisted().flightBooking?.flightNumber ?? 'FLIGHT 772');
  }, [visible]);

  // Active Drag Info
  const [drag, setDrag] = useState<DragInfo>(null);

  // Active Held/Hovered item to reveal floating name bubble
  const [activeHeldId, setActiveHeldId] = useState<string | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // iOS-style long press state for checklist pills
  const [longPressActiveId, setLongPressActiveId] = useState<string | null>(null);
  const [pillDragY, setPillDragY] = useState(0);
  const [pillStartY, setPillStartY] = useState(0);
  const [isOverDeleteZone, setIsOverDeleteZone] = useState(false);

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suitcaseRef = useRef<HTMLDivElement>(null);
  const deleteZoneRef = useRef<HTMLDivElement>(null);

  // Experience subscriptions
  useEffect(() => {
    return subscribeExperience(event => {
      if (event.type === 'close-packing') onClose();
      if (event.type === 'open-packing' && event.items?.length) {
        setItems(current => {
          const map = new Map(current.map(i => [i.name.toLowerCase(), i]));
          return event.items!.map((name, index) => {
            const existing = map.get(name.toLowerCase());
            const pos = getAutoCasePosition(name, index);
            return {
              id: existing?.id ?? `item-${index}-${name.toLowerCase().replace(/\W+/g, '-')}`,
              name,
              packed: existing?.packed ?? false,
              x: existing?.x ?? pos.x,
              y: existing?.y ?? pos.y,
              rot: existing?.rot ?? pos.rot,
              zIndex: existing?.zIndex ?? index + 1,
            };
          });
        });
      }
    });
  }, [onClose]);

  // Persist items
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  // Entrance opening animation
  useEffect(() => {
    if (visible) {
      setIsOpen(false);
      const timer = setTimeout(() => {
        setIsOpen(true);
        playSound('courier');
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const packedCount = items.filter(i => i.packed).length;
  const unpackedItems = useMemo(() => items.filter(i => !i.packed), [items]);
  const packedItems = useMemo(() => items.filter(i => i.packed), [items]);
  const complete = items.length > 0 && packedCount === items.length;

  if (!visible) return null;

  const close = () => {
    emitExperience({ type: 'close-packing' });
    onClose();
  };

  const replayOpen = () => {
    setIsOpen(false);
    playSound('tap');
    setTimeout(() => {
      setIsOpen(true);
      playSound('courier');
    }, 400);
  };

  const togglePacked = (id: string) => {
    setItems(curr =>
      curr.map((item, idx) => {
        if (item.id === id) {
          const next = !item.packed;
          playSound(next ? 'save' : 'tap');
          const pos = getAutoCasePosition(item.name, idx);
          return {
            ...item,
            packed: next,
            x: item.x ?? pos.x,
            y: item.y ?? pos.y,
            rot: item.rot ?? pos.rot,
            zIndex: topZ + 1,
          };
        }
        return item;
      })
    );
    setTopZ(z => z + 1);
  };

  const addItem = () => {
    const name = draft.trim();
    if (!name || items.length >= 18) return;
    const pos = getAutoCasePosition(name, items.length);
    const newItem: PackItem = {
      id: `${Date.now()}-${name.toLowerCase().replace(/\W+/g, '-')}`,
      name,
      packed: false,
      x: pos.x,
      y: pos.y,
      rot: pos.rot,
      zIndex: topZ + 1,
    };
    setItems(curr => [...curr, newItem]);
    setDraft('');
    playSound('tap');
  };

  const deleteItem = (id: string) => {
    setItems(curr => curr.filter(i => i.id !== id));
    setLongPressActiveId(null);
    playSound('tap');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  // ==========================================
  // PRESS-AND-HOLD TO REVEAL NAME BUBBLE
  // "按着那个东西久久就浮现那个东西的名字在物品上面，放开手就回去线条"
  // ==========================================
  const handleItemPressStart = (id: string) => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(() => {
      setActiveHeldId(id);
    }, 180);
  };

  const handleItemPressEnd = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setActiveHeldId(null);
  };

  // ==========================================
  // UNIFIED DRAG & DROP SYSTEM
  // ==========================================
  const startDragItem = (
    event: React.PointerEvent<HTMLDivElement>,
    id: string,
    source: 'desk' | 'suitcase'
  ) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    event.stopPropagation();

    handleItemPressStart(id);

    const targetItem = items.find(i => i.id === id);
    const initCaseX = targetItem?.x ?? 80;
    const initCaseY = targetItem?.y ?? 100;

    // Bring to top layer immediately
    setTopZ(z => {
      const nextZ = z + 1;
      setItems(curr =>
        curr.map(item => (item.id === id ? { ...item, zIndex: nextZ } : item))
      );
      return nextZ;
    });

    setDrag({
      id,
      source,
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      initCaseX,
      initCaseY,
    });
  };

  const moveDragItem = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    setDrag(curr => (curr ? { ...curr, currentX: event.clientX, currentY: event.clientY } : null));
  };

  const endDragItem = (event: React.PointerEvent<HTMLDivElement>) => {
    handleItemPressEnd();
    if (!drag) return;

    const sRect = suitcaseRef.current?.getBoundingClientRect();

    if (sRect) {
      const isInsideSuitcase =
        event.clientX >= sRect.left &&
        event.clientX <= sRect.right &&
        event.clientY >= sRect.top &&
        event.clientY <= sRect.bottom;

      if (drag.source === 'desk') {
        if (isInsideSuitcase) {
          // Pack into suitcase at drop location
          const dropX = Math.max(10, Math.min(235, event.clientX - sRect.left - 24));
          const dropY = Math.max(10, Math.min(235, event.clientY - sRect.top - 24));
          setItems(curr =>
            curr.map(item =>
              item.id === drag.id
                ? { ...item, packed: true, x: dropX, y: dropY, zIndex: topZ + 1 }
                : item
            )
          );
          setTopZ(z => z + 1);
          playSound('save');
        }
      } else if (drag.source === 'suitcase') {
        if (isInsideSuitcase) {
          // Move and layer within suitcase
          const newX = Math.max(10, Math.min(235, event.clientX - sRect.left - 24));
          const newY = Math.max(10, Math.min(235, event.clientY - sRect.top - 24));
          setItems(curr =>
            curr.map(item =>
              item.id === drag.id ? { ...item, x: newX, y: newY, zIndex: topZ + 1 } : item
            )
          );
          setTopZ(z => z + 1);
          playSound('tap');
        } else {
          // Dragged OUT of suitcase -> UNPACK!
          setItems(curr =>
            curr.map(item => (item.id === drag.id ? { ...item, packed: false } : item))
          );
          playSound('tap');
        }
      }
    }

    setDrag(null);
  };

  // ==========================================
  // iOS LONG PRESS FOR CHECKLIST PILLS
  // ==========================================
  const handlePillPointerDown = (event: React.PointerEvent<HTMLDivElement>, id: string) => {
    setPillStartY(event.clientY);
    setPillDragY(0);
    setIsOverDeleteZone(false);

    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      setLongPressActiveId(id);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([20, 30, 20]);
      }
      playSound('tap');
    }, 380);
  };

  const handlePillPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (longPressActiveId) {
      const deltaY = event.clientY - pillStartY;
      setPillDragY(deltaY);

      if (deleteZoneRef.current) {
        const zoneRect = deleteZoneRef.current.getBoundingClientRect();
        const over = event.clientY >= zoneRect.top - 25 && event.clientY <= zoneRect.bottom + 25;
        setIsOverDeleteZone(over);
      }
    }
  };

  const handlePillPointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (longPressActiveId) {
      if (isOverDeleteZone || pillDragY > 45) {
        deleteItem(longPressActiveId);
      }
    }
    setPillDragY(0);
    setIsOverDeleteZone(false);
  };

  const handlePillPointerCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setPillDragY(0);
    setIsOverDeleteZone(false);
  };

  return (
    <div
      className="luggage-modal-overlay"
      onClick={e => {
        if (e.target === e.currentTarget) close();
      }}
    >
      {/* iPhone Device Mockup Frame (Strictly matching Image 2 / Travel Court) */}
      <div className="luggage-phone-frame">
        {/* 1. iOS Status Bar with Dynamic Island */}
        <div className="phone-status-bar">
          <span className="status-time">9:41</span>
          <div className="dynamic-island">
            <div className="island-lens">
              <div className="lens-glint" />
            </div>
            <div className="island-sensor" />
          </div>
          <div className="status-icons">
            <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
              <rect x="0" y="7.5" width="2.5" height="3.5" rx="0.8" />
              <rect x="4.5" y="5" width="2.5" height="6" rx="0.8" />
              <rect x="9" y="2.5" width="2.5" height="8.5" rx="0.8" />
              <rect x="13.5" y="0" width="2.5" height="11" rx="0.8" />
            </svg>
            <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor">
              <path d="M7.5 9a1.2 1.2 0 100 2.4A1.2 1.2 0 007.5 9zm-3.6-2.5a5.1 5.1 0 017.2 0 .7.7 0 001-1 6.5 6.5 0 00-9.2 0 .7.7 0 001 1zm-2.4-2.4a8.5 8.5 0 0112 0 .7.7 0 001-1 9.9 9.9 0 00-14 0 .7.7 0 001 1z" />
            </svg>
            <svg width="22" height="11" viewBox="0 0 22 11" fill="none">
              <rect x="0.8" y="0.8" width="17.4" height="9.4" rx="2.8" stroke="currentColor" strokeWidth="1.2" />
              <rect x="2.5" y="2.5" width="12" height="6" rx="1.2" fill="currentColor" />
              <path d="M20 4v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 2. Top Navigation Bar (No "JOURNAL" text) */}
        <header className="journal-topbar">
          <button className="journal-back-btn" onClick={close} aria-label="Back">
            <ChevronLeft size={20} />
          </button>

          <div className="journal-washi-tape">
            <span>PACKING MEMO · 07</span>
          </div>

          <div className="journal-topbar-actions">
            <button
              className="journal-replay-btn"
              onClick={replayOpen}
              title="Replay opening suitcase"
              aria-label="Replay suitcase opening"
            >
              <RotateCcw size={14} />
              <span>{isOpen ? 'Close' : 'Open'}</span>
            </button>
          </div>
        </header>

        {/* 3. Blue Travel Journal Stamp & Packing Status Header */}
        <div className="journal-meta-header">
          <div className="journal-stamp-badge blue-journal-stamp">
            <div className="stamp-inner">
              <span className="stamp-dest">PACK</span>
              <span className="stamp-date">10 · 13</span>
              <span className="stamp-code">JOURNAL</span>
            </div>
          </div>

          <div className="journal-headline-wrap">
            <h1 className="journal-headline">Ready to Pack</h1>
            <p className="journal-subhead">Record essentials • Drag to organize</p>
          </div>

          <div className={`journal-count-pill ${complete ? 'is-complete' : ''}`}>
            <b>{packedCount}/{items.length}</b>
            <span>{complete ? 'READY' : 'PACKED'}</span>
          </div>
        </div>

        {/* 4. Luggage Playfield Area */}
        <div className="luggage-playfield">
          {/* Scattered Desk Items (Unpacked) - Pure Line-Art, No labels unless held */}
          <div className="scattered-items-layer" aria-label="Unpacked items on desk">
            {unpackedItems.map((item, index) => {
              const config = getItemVisualConfig(item.name);
              const Icon = config.icon;
              const slot = deskSlots[index % deskSlots.length];
              const isDragging = drag?.id === item.id && drag.source === 'desk';
              const isHeld = activeHeldId === item.id;
              const dx = isDragging ? drag.currentX - drag.startX : 0;
              const dy = isDragging ? drag.currentY - drag.startY : 0;

              return (
                <div
                  key={item.id}
                  className={`scattered-line-item ${isDragging ? 'is-dragging' : ''} ${
                    isHeld ? 'is-held' : ''
                  }`}
                  style={{
                    left: `${slot.left}%`,
                    top: `${slot.top}%`,
                    transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) rotate(${slot.rotate}deg) scale(${isDragging ? 1.15 : isHeld ? 1.1 : 1})`,
                    '--accent': config.colorAccent,
                  } as React.CSSProperties}
                  onPointerDown={e => startDragItem(e, item.id, 'desk')}
                  onPointerMove={moveDragItem}
                  onPointerUp={endDragItem}
                  onPointerCancel={endDragItem}
                  onMouseEnter={() => handleItemPressStart(item.id)}
                  onMouseLeave={handleItemPressEnd}
                  onClick={() => {
                    if (!drag) togglePacked(item.id);
                  }}
                  title={item.name}
                  role="button"
                  tabIndex={0}
                >
                  {/* Floating Name Bubble (Appears only when held/pressed) */}
                  {isHeld && (
                    <div className="item-name-float-bubble">
                      <span>{item.name}</span>
                    </div>
                  )}

                  {/* Pure Line-Art Artwork (NO TEXT LABEL UNDERNEATH) */}
                  <div className="scatter-artwork-wrap">
                    <Icon size={46} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================
             REDESIGNED LUXURY VINTAGE SUITCASE (Globe-Trotter / Rimowa Aesthetic)
             ======================================================== */}
          <div
            className={`luxury-vintage-suitcase ${isOpen ? 'is-open' : 'is-closed'}`}
            ref={suitcaseRef}
            aria-label="Suitcase packing area"
          >
            {/* Real Top Metal Latches */}
            <div className="trunk-top-latches">
              <span className="top-latch latch-l" />
              <span className="top-latch latch-r" />
            </div>

            {/* Leather Handle with Dual Brass Swivel Brackets */}
            <div className="trunk-luxury-handle">
              <span className="handle-bracket bracket-l" />
              <div className="handle-grip-leather">
                <span className="handle-stitch" />
              </div>
              <span className="handle-bracket bracket-r" />
            </div>

            {/* Brass & Leather Corner Caps */}
            <div className="vintage-corner-cap cap-tl" />
            <div className="vintage-corner-cap cap-tr" />
            <div className="vintage-corner-cap cap-bl" />
            <div className="vintage-corner-cap cap-br" />

            {/* ================= CLOSED STATE ================= */}
            {!isOpen && (
              <div className="luxury-cover" onClick={replayOpen}>
                <div className="cover-sand-body">
                  {/* Outer Edge Stitching */}
                  <div className="cover-perimeter-stitch" />

                  {/* Vertical Saddle-Leather Binding Belts with Brass Buckles */}
                  <div className="cover-leather-belt belt-left">
                    <span className="belt-stitch-line" />
                    <div className="brass-harness-buckle">
                      <span className="buckle-tongue" />
                    </div>
                    <span className="belt-eyelet e1" />
                    <span className="belt-eyelet e2" />
                    <span className="belt-eyelet e3" />
                  </div>

                  <div className="cover-leather-belt belt-right">
                    <span className="belt-stitch-line" />
                    <div className="brass-harness-buckle">
                      <span className="buckle-tongue" />
                    </div>
                    <span className="belt-eyelet e1" />
                    <span className="belt-eyelet e2" />
                    <span className="belt-eyelet e3" />
                  </div>

                  {/* Center Brass Lock Plate */}
                  <div className="center-brass-lock">
                    <span className="keyhole-slot" />
                    <small>COCO · 1982</small>
                  </div>

                  {/* High Quality Travel Stickers */}
                  <div className="cover-sticker sticker-airmail">
                    <div className="airmail-stripes" />
                    <span>PAR AVION · AIR MAIL</span>
                  </div>

                  <div className="cover-sticker sticker-haneda">
                    <b>HND</b>
                    <span>TOKYO · {flightNumber}</span>
                  </div>

                  <div className="cover-sticker sticker-fragile">
                    <span>FRAGILE</span>
                    <small>HANDLE WITH CARE</small>
                  </div>

                  <div className="cover-sticker sticker-postage-stamp">
                    <div className="stamp-serrated" />
                    <span>JEJU IN AMBER</span>
                  </div>

                  {/* Tap to Unlock Hint */}
                  <div className="tap-to-open-hint">
                    <Sparkles size={13} />
                    <span>TAP TO UNLOCK TRUNK</span>
                  </div>
                </div>
              </div>
            )}

            {/* ================= OPEN INTERIOR ================= */}
            {isOpen && (
              <div className="luxury-interior">
                {/* Upper Lid: Translucent Cross-Hatch Mesh Pocket with Gold Zipper */}
                <div className="interior-upper-mesh">
                  <div className="mesh-diamond-pattern" />
                  <div className="mesh-gold-zipper-track">
                    <span className="zipper-slider-gold" />
                    <span className="zipper-leather-pull" />
                  </div>
                  <div className="mesh-pocket-label">
                    <span>ORGANIZER · QUICK ACCESS</span>
                  </div>
                </div>

                {/* Polished Brass Piano Hinge Bar */}
                <div className="interior-piano-hinge">
                  <span className="hinge-knuckle k1" />
                  <span className="hinge-knuckle k2" />
                  <span className="hinge-knuckle k3" />
                  <span className="hinge-knuckle k4" />
                </div>

                {/* Lower Base: Cream Pinstripe Linen Lining with Diagonal Harness Straps */}
                <div className="interior-lower-base">
                  <div className="base-pinstripe-fabric" />
                  <div className="interior-webbing-straps">
                    <span className="webbing-strap diag-1" />
                    <span className="webbing-strap diag-2" />
                    <div className="webbing-center-brass-lock">
                      <span className="lock-crest" />
                    </div>
                  </div>
                </div>

                {/* FREEFORM PACKED ITEMS LAYER (Pure Line-Art Only, Draggable, Stackable, Zero Boxes) */}
                <div className="interior-freeform-surface">
                  {packedItems.map((item, idx) => {
                    const config = getItemVisualConfig(item.name);
                    const Icon = config.icon;
                    const isDragging = drag?.id === item.id && drag.source === 'suitcase';
                    const isHeld = activeHeldId === item.id;
                    const fallbackPos = getAutoCasePosition(item.name, idx);

                    const currentCaseX = item.x ?? fallbackPos.x;
                    const currentCaseY = item.y ?? fallbackPos.y;
                    const rot = item.rot ?? fallbackPos.rot;

                    const dx = isDragging ? drag.currentX - drag.startX : 0;
                    const dy = isDragging ? drag.currentY - drag.startY : 0;

                    return (
                      <div
                        key={item.id}
                        className={`pure-line-packed-item ${isDragging ? 'is-dragging' : ''} ${
                          isHeld ? 'is-held' : ''
                        }`}
                        style={{
                          left: `${currentCaseX}px`,
                          top: `${currentCaseY}px`,
                          transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(${isDragging ? 1.15 : isHeld ? 1.1 : 1})`,
                          zIndex: isDragging ? 999 : item.zIndex ?? idx + 1,
                        }}
                        onPointerDown={e => startDragItem(e, item.id, 'suitcase')}
                        onPointerMove={moveDragItem}
                        onPointerUp={endDragItem}
                        onPointerCancel={endDragItem}
                        onMouseEnter={() => handleItemPressStart(item.id)}
                        onMouseLeave={handleItemPressEnd}
                        title={item.name}
                        role="button"
                        tabIndex={0}
                      >
                        {/* Floating Name Bubble (Appears only when held/pressed) */}
                        {isHeld && (
                          <div className="item-name-float-bubble">
                            <span>{item.name}</span>
                          </div>
                        )}

                        {/* Pure Line-Art Artwork (NO CARD, NO BOX, NO PERMANENT TEXT) */}
                        <div className="pure-line-art-wrap">
                          <Icon size={46} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5. Pull-Up Bottom Sheet: Inventory Checklist & iOS-Style Long-Press Delete */}
        <section
          className={`luggage-inventory-sheet ${sheetExpanded ? 'is-expanded' : 'is-collapsed'}`}
          aria-label="Trip luggage inventory drawer"
        >
          {/* Pull Handle Header */}
          <div
            className="sheet-drag-handle"
            onClick={() => setSheetExpanded(prev => !prev)}
            role="button"
            tabIndex={0}
            aria-label={sheetExpanded ? 'Collapse inventory sheet' : 'Expand inventory sheet'}
          >
            <div className="sheet-pill-bar" />
            <div className="sheet-title-row">
              <div className="sheet-title-info">
                <Compass size={15} />
                <span className="sheet-main-title">TRIP INVENTORY</span>
                <span className="sheet-count-tag">{items.length} ITEMS</span>
              </div>
              <div className="sheet-action-hint">
                <small>{sheetExpanded ? 'Tap to collapse' : 'Pull up to manage items'}</small>
                {sheetExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </div>
            </div>
          </div>

          {/* Sheet Content Body */}
          <div className="sheet-content-body">
            {/* Quick Add Custom Item Form */}
            <form
              className="sheet-add-form"
              onSubmit={e => {
                e.preventDefault();
                addItem();
              }}
            >
              <input
                type="text"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Add item: sunscreen, adapter, sunglasses…"
                maxLength={36}
                className="sheet-add-input"
              />
              <button
                type="submit"
                disabled={!draft.trim() || items.length >= 18}
                className="sheet-add-submit"
              >
                <Plus size={16} />
                <span>Add</span>
              </button>
            </form>

            {/* Instruction Banner (English Only) */}
            <div className="sheet-instruction-banner">
              <span className="banner-badge">TIP</span>
              <span>
                Tap to toggle • <b>Hold item</b> to delete or drag down
              </span>
            </div>

            {/* Text Pills Container */}
            <div className="inventory-pills-grid" aria-label="Trip item pills">
              {items.map(item => {
                const config = getItemVisualConfig(item.name);
                const isLongPressing = longPressActiveId === item.id;
                const transformStyle =
                  isLongPressing && pillDragY > 0
                    ? `translateY(${Math.min(pillDragY, 80)}px) scale(1.05)`
                    : undefined;

                return (
                  <div
                    key={item.id}
                    className={`inventory-text-pill ${item.packed ? 'is-packed' : ''} ${
                      isLongPressing ? 'is-long-press-active' : ''
                    }`}
                    style={{ transform: transformStyle }}
                    onPointerDown={e => handlePillPointerDown(e, item.id)}
                    onPointerMove={handlePillPointerMove}
                    onPointerUp={handlePillPointerUp}
                    onPointerCancel={handlePillPointerCancel}
                    onClick={() => {
                      if (!longPressActiveId) togglePacked(item.id);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <span className="pill-status-dot">
                      {item.packed ? <Check size={12} strokeWidth={3} /> : <Circle size={10} />}
                    </span>

                    <span className="pill-name">{item.name}</span>

                    <span className="pill-category-tag">{config.category}</span>

                    {/* iOS Quick Delete Button on Long Press */}
                    {isLongPressing && (
                      <button
                        className="pill-quick-del-btn"
                        onClick={e => {
                          e.stopPropagation();
                          deleteItem(item.id);
                        }}
                        title="Delete item"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* iOS Downward Drag Delete Drop Zone (English Only) */}
            <div
              className={`ios-delete-dropzone ${longPressActiveId ? 'is-visible' : ''} ${
                isOverDeleteZone || pillDragY > 40 ? 'is-hovered' : ''
              }`}
              ref={deleteZoneRef}
              onClick={() => {
                if (longPressActiveId) deleteItem(longPressActiveId);
              }}
            >
              <Trash2 size={18} />
              <span>Drop or tap here to delete</span>
            </div>
          </div>
        </section>

        {/* 6. iOS Home Indicator Bar at bottom of frame */}
        <div className="phone-home-bar-wrap">
          <div className="ios-home-indicator" />
        </div>

        {/* Backdrop for long press dismiss */}
        {longPressActiveId && (
          <div
            className="ios-longpress-backdrop"
            onClick={() => setLongPressActiveId(null)}
          />
        )}
      </div>
    </div>
  );
}
