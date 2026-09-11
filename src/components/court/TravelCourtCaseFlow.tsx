import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft, Check, X, Clock, Heart, Send, Plane, Home,
  MapPin, Utensils, ArrowRight, Plus, MessageCircle, Edit3, Coins, Lightbulb
} from 'lucide-react';
import {
  DuolingoJudge, DuolingoJudgeBench,
  DuolingoJuryBox, DuolingoAirplaneSquad,
  type JurorVoteState
} from './CourtCharacters';
import { TravelCourtCharacter, type CharacterVariant } from './TravelCourtCharacter';
import {
  DynamicCourtroomStage,
  type DynamicCourtMember,
} from './DynamicCourtroomStage';
import {
  playGavelStrike, playVoteChime, playVictoryFanfare,
  playPop, playWhoosh, triggerHaptic, triggerScreenShake
} from './courtSoundAndHaptics';
import './court-styles.css';

export type CourtStep =
  | 'lobby'       // Screen 1: Intro / Lobby
  | 'proposal'    // Screen 2: Case 1 of 3 - Proposal
  | 'voting'      // Screen 3: Case 1 of 3 - User Voting Turn
  | 'jury-live'   // Screen 4: Case 1 of 3 - Jury Voting Live
  | 'verdict-pass'// Screen 5: Case 1 of 3 - Approved Verdict
  | 'verdict-fail'// Screen 6: Case 2 of 3 - Rejected Verdict
  | 'discussion'  // Screen 7: Discussion / Votes Tab
  | 'showdown'    // Screen 7.5: 2 vs 2 Tiebreaker Duel & Betting
  | 'summary';    // Screen 8: Final Trip Summary (Jeju Added!)

const JURORS: JurorVoteState[] = [
  { id: 'alex', name: 'Alex', vote: null, variant: 'green', avatarColor: '#10b981', hairColor: '#065f46' },
  { id: 'mavis', name: 'Mavis', vote: null, variant: 'purple', avatarColor: '#a855f7', hairColor: '#f59e0b' },
  { id: 'ken', name: 'Ken', vote: null, variant: 'blue', avatarColor: '#f59e0b', hairColor: '#1e3a8a' },
  { id: 'june', name: 'June', vote: null, variant: 'coral', avatarColor: '#ef4444', hairColor: '#db2777' },
];

export const DEFAULT_COURT_MEMBERS: DynamicCourtMember[] = [
  {
    id: 'alex',
    name: 'Alex',
    variant: 'green',
    avatarColor: '#10b981',
    team: 'left',
    statusBadgeColor: '#10b981',
    speech: 'Ready to judge! ⚖️',
  },
  {
    id: 'mavis',
    name: 'Mavis',
    variant: 'purple',
    avatarColor: '#a855f7',
    team: 'left',
    statusBadgeColor: '#a855f7',
    speech: 'Here and ready! ✨',
  },
  {
    id: 'ken',
    name: 'Ken',
    variant: 'blue',
    avatarColor: '#f59e0b',
    team: 'right',
    statusBadgeColor: '#f59e0b',
    speech: 'All set! 😎',
  },
  {
    id: 'june',
    name: 'June',
    variant: 'coral',
    avatarColor: '#ef4444',
    team: 'right',
    statusBadgeColor: '#ef4444',
    speech: 'Objection! 💥',
  },
];

export interface TravelCourtCaseFlowProps {
  initialStep?: CourtStep;
  onBackToIdeas: () => void;
  onGoToIdeas?: () => void;
  onClose?: () => void;
  onConfirmPlan: (decision: string) => void;
  onSkippedIdeaSealed?: (idea: string) => void;
  courtMembers?: DynamicCourtMember[];
  onUpdateMembers?: (members: DynamicCourtMember[]) => void;
}

export function MobileStatusBar({ light = false }: { light?: boolean }) {
  const textColor = light ? '#ffffff' : '#0f172a';
  return (
    <div
      className="court-phone-status-bar"
      style={{
        width: '100%',
        height: 42,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
        userSelect: 'none',
        position: 'relative',
        zIndex: 50,
      }}
    >
      <span style={{ fontSize: '15px', fontWeight: 800, color: textColor, letterSpacing: '-0.02em' }}>
        9:41
      </span>
      {/* Dynamic Island (iPhone 16/17 Pro Max 6.9") */}
      <div
        style={{
          width: 114,
          height: 30,
          background: '#000000',
          borderRadius: 99,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#0a0a0a', border: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#081c3b', opacity: 0.8 }} />
        </div>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#050505' }} />
      </div>
      {/* Cellular / WiFi / Battery */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: textColor }}>
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
  );
}

export function MobileHomeIndicator({ light = false }: { light?: boolean }) {
  return (
    <div className="court-phone-home-bar-wrap">
      <div
        className="court-ios-home-indicator"
        style={{
          background: light ? '#ffffff' : '#0f172a',
          opacity: light ? 0.6 : 0.28,
        }}
      />
    </div>
  );
}

export function BouncingWaveText({ text }: { text: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="court-bouncing-letter"
          style={{
            animationDelay: `${i * 0.08}s`,
            whiteSpace: 'pre',
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

/* ==========================================================================
   VINTAGE SCRAPBOOK ELEMENT SHEET COMPONENTS
   Authentic elements inspired by Image 3:
   - TornPaperButton (Plan Trip ->, Add to Itinerary, Start Journey ticket)
   - WashiTapeStrip (denim blue, crimson, khaki)
   - LuggageTag (rounded-top tag with brass eyelet and string loop)
   - PostmarkStamp (circular cancellation mark + wavy lines)
   - PolaroidCard (white photo frame with handwritten Caveat caption)
   ========================================================================== */

export interface TornPaperButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'crimson' | 'blue' | 'kraft' | 'ticket' | 'ticket-blue';
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  arrow?: boolean;
  fontFamily?: 'cursive' | 'sans';
  subText?: string;
}

let tornPaperCounter = 0;

export function TornPaperButton({
  onClick,
  children,
  variant = 'crimson',
  className = '',
  style,
  disabled = false,
  arrow = true,
  fontFamily = 'cursive',
  subText,
}: TornPaperButtonProps) {
  const [btnId] = React.useState(() => `tpb-${++tornPaperCounter}`);

  // Ticket-style button (like "Start Journey / TRAVEL TO A BETTER YOU" in element sheet)
  if (variant === 'ticket' || variant === 'ticket-blue') {
    const isBlueTicket = variant === 'ticket-blue';
    const ticketBg = isBlueTicket
      ? 'linear-gradient(135deg, #2c5985 0%, #3a72a8 45%, #4c87c2 70%, #265078 100%)'
      : 'linear-gradient(135deg, #7c1018 0%, #8f1722 45%, #a11c27 70%, #750e15 100%)';
    const ticketShadow = isBlueTicket
      ? '0 6px 18px rgba(45, 85, 130, 0.35), 0 2px 5px rgba(20, 40, 65, 0.2)'
      : '0 6px 18px rgba(139,21,32,0.32), 0 2px 5px rgba(50,10,15,0.2)';
    const subColor = isBlueTicket ? '#d6e6f7' : '#eed7c5';

    return (
      <div
        className={`court-torn-paper-btn-wrap ${className}`}
        style={{
          width: '100%',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          ...style,
        }}
        onClick={disabled ? undefined : onClick}
      >
        <button
          type="button"
          disabled={disabled}
          style={{
            width: '100%',
            height: 52,
            display: 'flex',
            alignItems: 'center',
            background: ticketBg,
            color: '#ffffff',
            border: 'none',
            borderRadius: 14,
            padding: '0 16px 0 0',
            cursor: disabled ? 'not-allowed' : 'pointer',
            boxShadow: ticketShadow,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Frosted matte paper tooth texture overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '4px 4px',
              opacity: 0.65,
              mixBlendMode: 'overlay',
            }}
          />

          {/* Left globe/airplane icon stub with dashed separator */}
          <div
            style={{
              width: 52,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.16)',
              borderRight: '1.5px dashed rgba(255,255,255,0.42)',
              fontSize: 22,
              flexShrink: 0,
              zIndex: 2,
            }}
          >
            ✈
          </div>
          {/* Center content */}
          <div style={{ flex: 1, padding: '0 14px', textAlign: 'left', minWidth: 0, zIndex: 2 }}>
            <div
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: 23,
                fontWeight: 700,
                lineHeight: 1.15,
                color: '#fffdf7',
                letterSpacing: '0.02em',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
              }}
            >
              {children}
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.9, marginTop: 1, color: subColor }}>
              {subText || 'TRAVEL TO A BETTER YOU'}
            </div>
          </div>
          {arrow && (
            <div style={{ fontSize: 22, color: '#fffdf7', transform: 'translateX(-2px)', zIndex: 2, fontFamily: "'Caveat', cursive" }}>
              →
            </div>
          )}
        </button>
      </div>
    );
  }

  // Organic Torn Paper Button (like "Plan Trip ->" and "Add to Itinerary" in element sheet)
  const isBlue = variant === 'blue';
  const isKraft = variant === 'kraft';

  // Multi-stop rich oil paint impasto pigments
  const oilGradStops = isBlue
    ? [
        { offset: '0%', color: '#387dc0' },
        { offset: '22%', color: '#4f96dc' },
        { offset: '50%', color: '#62a8ed' },
        { offset: '78%', color: '#478fd4' },
        { offset: '100%', color: '#2e72b0' },
      ]
    : isKraft
    ? [
        { offset: '0%', color: '#9e7e56' },
        { offset: '30%', color: '#b99971' },
        { offset: '60%', color: '#cbab83' },
        { offset: '85%', color: '#b3936a' },
        { offset: '100%', color: '#8f7048' },
      ]
    : [
        { offset: '0%', color: '#740e15' },
        { offset: '24%', color: '#8b1620' },
        { offset: '52%', color: '#9e1b26' },
        { offset: '76%', color: '#88151f' },
        { offset: '100%', color: '#680b12' },
      ];

  const shadowColor = isBlue
    ? 'rgba(50, 120, 190, 0.35)'
    : isKraft
    ? 'rgba(90, 60, 25, 0.25)'
    : 'rgba(120, 15, 22, 0.42)';

  const crestHighlight = isBlue ? '#b8dcfd' : isKraft ? '#ffffff' : '#e0584d';

  // The organic deckled tear path
  const deckledPath =
    'M 6 3.5 L 24 2 L 48 4.2 L 74 2.2 L 102 3.8 L 132 1.8 L 164 4.0 L 196 2.0 L 226 3.8 L 258 1.8 L 288 4.0 L 314 2.0 L 334 3.8 L 338 9 L 335 17 L 339 25 L 334 33 L 338 41 L 334 46.5 L 314 45.2 L 288 47.5 L 258 45.2 L 226 47.5 L 196 45.2 L 164 47.5 L 132 45.2 L 102 47.5 L 74 45.2 L 48 47.5 L 24 45.2 L 6 47.0 L 2 41 L 5 33 L 1 25 L 5 17 L 2 9 Z';

  return (
    <div
      className={`court-torn-paper-btn-wrap ${className}`}
      style={{
        width: '100%',
        position: 'relative',
        filter: `drop-shadow(0 6px 14px ${shadowColor}) drop-shadow(0 2px 4px rgba(40,20,10,0.18))`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1), filter 0.18s ease',
        ...style,
      }}
      onClick={disabled ? undefined : onClick}
    >
      <button
        type="button"
        className="court-torn-paper-btn"
        disabled={disabled}
        style={{
          width: '100%',
          height: 52,
          background: 'transparent',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: disabled ? 'not-allowed' : 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
        }}
      >
        <svg
          viewBox="0 0 340 52"
          preserveAspectRatio="none"
          className="court-torn-paper-svg"
          aria-hidden="true"
        >
          <defs>
            {/* Multi-stop rich oil pigment gradient */}
            <linearGradient id={`oil-grad-${btnId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              {oilGradStops.map(s => (
                <stop key={s.offset} offset={s.offset} stopColor={s.color} />
              ))}
            </linearGradient>

            {/* Cold-press matte sand grain pattern (Strictly clipped inside path, ZERO grey outside) */}
            <pattern id={`matte-tooth-${btnId}`} width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.75" fill="#ffffff" opacity="0.28" />
              <circle cx="6" cy="6" r="0.7" fill="#000000" opacity="0.2" />
              <circle cx="6" cy="2" r="0.5" fill="#ffffff" opacity="0.2" />
              <circle cx="2" cy="6" r="0.55" fill="#000000" opacity="0.18" />
            </pattern>
          </defs>

          {/* LAYER 1: MAIN OIL PAINT PIGMENT BODY */}
          <path
            d={deckledPath}
            fill={`url(#oil-grad-${btnId})`}
          />

          {/* LAYER 2: MATTE SAND GRAIN OVERLAY (Same deckled path, 100% transparent outside) */}
          <path
            d={deckledPath}
            fill={`url(#matte-tooth-${btnId})`}
            style={{ mixBlendMode: 'overlay', opacity: 0.65, pointerEvents: 'none' }}
          />

          {/* LAYER 3: DRY-BRUSH CHALK HIGHLIGHT (顶部干刷白油画微提亮) */}
          <path
            d="M 12 5 Q 90 3 170 4 Q 260 4.8 328 6"
            stroke={crestHighlight}
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeDasharray="16 4 8 5 22 6"
            opacity="0.38"
            fill="none"
          />
        </svg>

        <div
          className="court-torn-btn-content"
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: '23px',
            fontWeight: 700,
            color: isKraft ? '#2b1810' : '#fffdf7',
            letterSpacing: '0.02em',
            gap: 8,
            textShadow: isKraft ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.45)',
          }}
        >
          <span>{children}</span>
          {arrow && (
            <span className="court-torn-btn-arrow" style={{ fontFamily: "'Caveat', cursive", fontSize: '24px', display: 'inline-block' }}>
              →
            </span>
          )}
        </div>
      </button>
    </div>
  );
}

/* Washi Tape Strip (semi-transparent denim / red / khaki strip) */
export function WashiTapeStrip({
  label,
  color = 'blue',
  angle = -1,
  style,
}: {
  label?: string;
  color?: 'blue' | 'red' | 'kraft';
  angle?: number;
  style?: React.CSSProperties;
}) {
  const bg =
    color === 'blue'
      ? 'linear-gradient(135deg, #4a7ba8 0%, #3d6a95 100%)'
      : color === 'red'
      ? 'linear-gradient(135deg, #a31520 0%, #8b1520 100%)'
      : 'linear-gradient(135deg, #c4a882 0%, #b3936a 100%)';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3px 12px',
        background: bg,
        color: '#ffffff',
        fontFamily: "'Caveat', cursive",
        fontSize: '13px',
        fontWeight: 700,
        letterSpacing: '0.04em',
        borderRadius: 2,
        transform: `rotate(${angle}deg)`,
        boxShadow: '0 2px 5px rgba(0,0,0,0.12)',
        borderLeft: '2px dashed rgba(255,255,255,0.65)',
        borderRight: '2px dashed rgba(255,255,255,0.65)',
        userSelect: 'none',
        ...style,
      }}
    >
      {label}
    </div>
  );
}

/* Luggage Tag (Matching the 4 luggage tags in the element sheet) */
export function LuggageTag({
  label,
  icon,
  active = false,
  color = 'cream',
  onClick,
  style,
}: {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  color?: 'cream' | 'blue' | 'red';
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const bg =
    active || color === 'red'
      ? '#8b1520'
      : color === 'blue'
      ? '#4a7ba8'
      : '#fffdf7';

  const textColor = active || color === 'red' || color === 'blue' ? '#ffffff' : '#2b1810';
  const borderColor = active || color === 'red' ? '#6f0e16' : color === 'blue' ? '#38638b' : '#e8d5b5';

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        padding: '6px 12px 5px',
        background: bg,
        border: `1.5px solid ${borderColor}`,
        borderRadius: '8px 8px 6px 6px',
        boxShadow: '0 3px 8px rgba(100,65,25,0.10)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        minWidth: 54,
        ...style,
      }}
    >
      {/* Top Eyelet Hole with string loop */}
      <div style={{ position: 'relative', marginBottom: 3, display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#f5edd8',
            border: '1.5px solid #c4a882',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: -5,
            width: 2,
            height: 5,
            background: '#a88960',
            borderRadius: 1,
          }}
        />
      </div>

      {icon && <div style={{ fontSize: 13, marginBottom: 2, color: textColor }}>{icon}</div>}

      <span
        style={{
          fontFamily: "'Caveat', cursive",
          fontSize: '13.5px',
          fontWeight: 700,
          color: textColor,
          whiteSpace: 'nowrap',
          lineHeight: 1.15,
        }}
      >
        {label}
      </span>
    </button>
  );
}

/* Circular Cancellation Postmark Stamp */
export function PostmarkStamp({
  textTop = 'TRAVEL MORE',
  textBottom = 'GOOD DAYS',
  year = '2026',
  color = '#8b1520',
  size = 52,
  style,
}: {
  textTop?: string;
  textBottom?: string;
  year?: string;
  color?: string;
  size?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        pointerEvents: 'none',
        userSelect: 'none',
        opacity: 0.85,
        ...style,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `1.8px dashed ${color}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
          textAlign: 'center',
          position: 'relative',
          padding: 2,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: size - 8,
            height: size - 8,
            borderRadius: '50%',
            border: `1px solid ${color}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: `${Math.max(5, size * 0.12)}px`, fontWeight: 900, letterSpacing: '0.08em', lineHeight: 1 }}>
            {textTop}
          </span>
          <span style={{ fontSize: `${Math.max(10, size * 0.28)}px`, margin: '1px 0', lineHeight: 1 }}>✈</span>
          <span style={{ fontSize: `${Math.max(5, size * 0.11)}px`, fontWeight: 800, letterSpacing: '0.06em', lineHeight: 1 }}>
            {textBottom} {year}
          </span>
        </div>
      </div>

      <svg width={size * 0.45} height={size * 0.5} viewBox="0 0 24 20" fill="none">
        <path d="M 0 4 Q 6 1 12 4 Q 18 7 24 4" stroke={color} strokeWidth="1.3" opacity="0.8" />
        <path d="M 0 10 Q 6 7 12 10 Q 18 13 24 10" stroke={color} strokeWidth="1.3" opacity="0.8" />
        <path d="M 0 16 Q 6 13 12 16 Q 18 19 24 16" stroke={color} strokeWidth="1.3" opacity="0.8" />
      </svg>
    </div>
  );
}

/* Classic Polaroid Photo Frame with Caveat handwritten caption */
export function PolaroidCard({
  children,
  caption,
  rotation = 0,
  pushpin = false,
  style,
  onClick,
}: {
  children: React.ReactNode;
  caption?: string;
  rotation?: number;
  pushpin?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      style={{
        position: 'relative',
        background: '#ffffff',
        padding: '6px 6px 20px',
        borderRadius: 4,
        boxShadow: '0 8px 24px rgba(100,65,25,0.14), 0 2px 6px rgba(100,65,25,0.06)',
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        boxSizing: 'border-box',
        ...style,
      }}
      onClick={onClick}
    >
      {pushpin && (
        <div
          style={{
            position: 'absolute',
            top: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, #f87171 0%, #dc2626 45%, #8b0d09 85%)',
            boxShadow: '0 3px 6px rgba(0,0,0,0.35)',
            zIndex: 15,
          }}
        />
      )}

      <div style={{ width: '100%', overflow: 'hidden', borderRadius: 2, background: '#f5edd8' }}>
        {children}
      </div>

      {caption && (
        <div
          style={{
            position: 'absolute',
            bottom: 3,
            left: 6,
            right: 6,
            height: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Caveat', cursive",
            fontSize: '12px',
            fontWeight: 700,
            color: '#554133',
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
}


const CASE_DEFAULT_COMMENTS: Record<number, Array<{ id: string; author: string; avatar: string; text: string; timeAgo: string; likes: number; liked: boolean }>> = {
  1: [
    { id: '1-1', author: 'Alex', avatar: '#10b981', text: 'The food in Jeju is amazing!', timeAgo: '2m ago', likes: 3, liked: false },
    { id: '1-2', author: 'Mavis', avatar: '#a855f7', text: 'I really want to see the beaches', timeAgo: '3m ago', likes: 2, liked: false },
    { id: '1-3', author: 'Ken', avatar: '#3b82f6', text: 'Maybe we should also check city spots?', timeAgo: '4m ago', likes: 1, liked: false },
  ],
  2: [
    { id: '2-1', author: 'Alex', avatar: '#10b981', text: 'Fresh seafood right by the ocean sounds incredible!', timeAgo: '2m ago', likes: 3, liked: false },
    { id: '2-2', author: 'Mavis', avatar: '#a855f7', text: 'Love seafood hotpot, count me in!', timeAgo: '3m ago', likes: 2, liked: false },
    { id: '2-3', author: 'Ken', avatar: '#3b82f6', text: 'Is it too spicy or raw? Not sure yet.', timeAgo: '4m ago', likes: 1, liked: false },
  ],
  3: [
    { id: '3-1', author: 'Alex', avatar: '#10b981', text: 'The aerial ocean view from the cable car is top rated!', timeAgo: '2m ago', likes: 3, liked: false },
    { id: '3-2', author: 'Mavis', avatar: '#a855f7', text: 'A must-do photo spot at sunset!', timeAgo: '3m ago', likes: 2, liked: false },
    { id: '3-3', author: 'Ken', avatar: '#3b82f6', text: 'A bit scared of heights, but willing to try.', timeAgo: '4m ago', likes: 1, liked: false },
  ],
};

export function TravelCourtCaseFlow({
  initialStep = 'lobby',
  onBackToIdeas,
  onGoToIdeas,
  onClose,
  onConfirmPlan,
  onSkippedIdeaSealed,
  courtMembers: externalMembers,
  onUpdateMembers,
}: TravelCourtCaseFlowProps) {
  const [currentStep, setCurrentStep] = useState<CourtStep>(initialStep);

  useEffect(() => {
    setCurrentStep(initialStep);
  }, [initialStep]);

  const [caseIndex, setCaseIndex] = useState(1); // 1 of 3, 2 of 3, 3 of 3
  const [cardExiting, setCardExiting] = useState(false);
  const [showSkippedGachaShowcase, setShowSkippedGachaShowcase] = useState(false);
  const sealedSkippedIdeas = useRef(new Set<string>());

  // The 3 travel discussion cards
  const CASES = [
    {
      id: 1,
      type: 'destination',
      typeLabel: '📍 Destination',
      title: 'Jeju Island',
      selectedTitle: 'Jeju Island selected',
      verdictTitle: "We're going to Jeju!",
      description: 'Golden beaches, volcanic landscapes, and fresh seafood by the ocean.',
      question: 'Shall we go to Jeju?',
      imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80',
      tags: ['Beaches', 'Nature', 'Good food', 'Relax'],
    },
    {
      id: 2,
      type: 'restaurant',
      typeLabel: '🍽️ Restaurant',
      title: 'Haenyeo Seafood House',
      selectedTitle: 'Haenyeo Seafood House selected',
      verdictTitle: "We're eating at Haenyeo Seafood!",
      description: 'Fresh abalone and seafood hotpot cooked by local haenyeo divers right by the sea.',
      question: 'Eat at Haenyeo Seafood?',
      imageUrl: 'https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=800&auto=format&fit=crop&q=80',
      tags: ['Fresh seafood', 'Local culinary', 'Must-try'],
    },
    {
      id: 3,
      type: 'activity',
      typeLabel: '🚠 Activity',
      title: 'Seongsan Cable Car',
      selectedTitle: 'Seongsan Cable Car selected',
      verdictTitle: "We're riding the Seongsan Cable Car!",
      description: 'Panoramic views of the sunrise peak and coastline from high-altitude glass cabins.',
      question: 'Ride the Seongsan Cable Car?',
      imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
      tags: ['Scenic views', 'Outdoor', 'Family friendly'],
    },
  ];
  const activeCase = CASES[caseIndex - 1] ?? CASES[0];

  // Voting state for user
  const [userVote, setUserVote] = useState<'go' | 'either' | 'not-now' | null>(null);
  const [userReason, setUserReason] = useState('');
  const [voteZooming, setVoteZooming] = useState(false);

  // Proposal screen: countdown timer (5 min limit)
  const PROPOSAL_TOTAL = 300;
  const [proposalElapsed, setProposalElapsed] = useState(42); // starts partway through
  useEffect(() => {
    if (currentStep !== 'proposal') return;
    const t = setInterval(() => setProposalElapsed(p => p < PROPOSAL_TOTAL ? p + 1 : p), 1000);
    return () => clearInterval(t);
  }, [currentStep]);
  const proposalTimeLeft = Math.max(0, PROPOSAL_TOTAL - proposalElapsed);
  const proposalProgress = Math.min(100, Math.round((proposalElapsed / PROPOSAL_TOTAL) * 100));
  const fmtProposalTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
  const openIdeasBoard = () => {
    playWhoosh();
    triggerHaptic('tap');
    if (onGoToIdeas) {
      onGoToIdeas();
    } else {
      setCurrentStep('proposal');
    }
  };
  const DiscussIdeaButton = () => (
    <button
      type="button"
      className="court-top-idea-btn"
      onClick={openIdeasBoard}
      aria-label="Add idea to court discussion"
      title="Add idea to court discussion"
    >
      <Lightbulb size={15} strokeWidth={2.6} />
      <span>Idea</span>
    </button>
  );

  // Proposal screen: auto-animate friend votes (pop sounds)
  const [proposalVotedCount, setProposalVotedCount] = useState(0);
  useEffect(() => {
    if (currentStep !== 'proposal') { setProposalVotedCount(0); return; }
    const t1 = setTimeout(() => { setProposalVotedCount(1); playPop(); }, 1400);
    const t2 = setTimeout(() => { setProposalVotedCount(2); playPop(); }, 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [currentStep, caseIndex]);

  // Jury live voting states
  const [liveJurors, setLiveJurors] = useState<JurorVoteState[]>(JURORS);
  const [timerCount, setTimerCount] = useState(8);

  // Confetti particles for verdict passed
  const [showConfetti, setShowConfetti] = useState(false);

  // Track passed/failed outcomes for each case (Case 1 destination Jeju is passed by default)
  const [caseOutcomes, setCaseOutcomes] = useState<Record<number, boolean>>({
    1: true,
  });

  useEffect(() => {
    if (currentStep === 'verdict-pass') {
      setCaseOutcomes(prev => ({ ...prev, [caseIndex]: true }));
    } else if (currentStep === 'verdict-fail') {
      setCaseOutcomes(prev => ({ ...prev, [caseIndex]: false }));
    }
  }, [currentStep, caseIndex]);

  useEffect(() => {
    if (currentStep !== 'verdict-fail' || caseIndex !== 3) {
      setShowSkippedGachaShowcase(false);
      return;
    }

    if (!sealedSkippedIdeas.current.has(activeCase.title)) {
      sealedSkippedIdeas.current.add(activeCase.title);
      onSkippedIdeaSealed?.(activeCase.title);
    }
    setShowSkippedGachaShowcase(true);
    const timer = window.setTimeout(() => setShowSkippedGachaShowcase(false), 3600);
    return () => window.clearTimeout(timer);
  }, [activeCase.title, currentStep, caseIndex, onSkippedIdeaSealed]);

  // Showdown Duel State (Case 2: 2 vs 2 Tiebreaker)
  const [showdownUserStake, setShowdownUserStake] = useState(40);
  const [showdownStakesLocked, setShowdownStakesLocked] = useState(false);
  const [showdownDebateChat, setShowdownDebateChat] = useState('');
  const [showdownWinner, setShowdownWinner] = useState<'go' | 'not-now' | null>(null);
  const [debateBubbles, setDebateBubbles] = useState<Array<{
    id: string;
    sender: string;
    team: 'left' | 'right';
    text: string;
  }>>([
    { id: 'b1', sender: 'Alex', team: 'left', text: 'Fresh seafood hotpot is unbeatable!' },
    { id: 'b2', sender: 'Ken', team: 'right', text: "Let's check other spots instead!" },
  ]);
  const [activeLeftBubble, setActiveLeftBubble] = useState<{ id: string; sender: string; text: string } | null>(null);
  const [activeRightBubble, setActiveRightBubble] = useState<{ id: string; sender: string; text: string } | null>(null);
  const [showPointBubbles, setShowPointBubbles] = useState(false);

  // Auto-dismiss initial debate bubbles after 4.2s on entering showdown
  useEffect(() => {
    if (currentStep === 'showdown') {
      const initId = `init-${Date.now()}`;
      setActiveLeftBubble({
        id: `left-${initId}`,
        sender: 'Alex',
        text: 'Fresh seafood hotpot is unbeatable!',
      });
      setActiveRightBubble({
        id: `right-${initId}`,
        sender: 'Ken',
        text: "Let's check other spots instead!",
      });

      const timer = window.setTimeout(() => {
        setActiveLeftBubble(null);
        setActiveRightBubble(null);
      }, 4200);

      return () => window.clearTimeout(timer);
    } else {
      setActiveLeftBubble(null);
      setActiveRightBubble(null);
      setShowPointBubbles(false);
    }
  }, [currentStep]);

  // Discussion comments state
  const [segmentedTab, setSegmentedTab] = useState<'discussion' | 'votes'>('discussion');
  const [comments, setComments] = useState(CASE_DEFAULT_COMMENTS[1]);
  const [newCommentText, setNewCommentText] = useState('');
  const [inviteToast, setInviteToast] = useState(false);
  const [internalMembers, setInternalMembers] = useState<DynamicCourtMember[]>(DEFAULT_COURT_MEMBERS);
  const courtMembers = externalMembers ?? internalMembers;
  const setCourtMembers = (action: React.SetStateAction<DynamicCourtMember[]>) => {
    if (typeof action === 'function') {
      const next = action(courtMembers);
      if (onUpdateMembers) onUpdateMembers(next);
      setInternalMembers(next);
    } else {
      if (onUpdateMembers) onUpdateMembers(action);
      setInternalMembers(action);
    }
  };
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberTeam, setNewMemberTeam] = useState<'beach' | 'bbq'>('beach');
  const [newMemberVariant, setNewMemberVariant] = useState<CharacterVariant>('purple');
  const [newMemberSpeech, setNewMemberSpeech] = useState('');
  const [memberNotification, setMemberNotification] = useState<string | null>(null);

  const handleAddFriend = () => {
    playPop();
    triggerHaptic('tap');
    setAddModalOpen(true);
  };

  const handleQuickAdd = (preset: {
    name: string;
    variant: CharacterVariant;
    team: 'beach' | 'bbq';
    color: string;
    speech: string;
  }) => {
    playPop();
    triggerHaptic('vote');
    const newId = `buddy_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const leftCount = courtMembers.filter(m => m.team === 'left' || m.team === 'beach').length;
    const rightCount = courtMembers.filter(m => m.team === 'right' || m.team === 'bbq').length;
    const assignedSide: 'left' | 'right' = leftCount <= rightCount ? 'left' : 'right';

    const newMember: DynamicCourtMember = {
      id: newId,
      name: preset.name,
      variant: preset.variant,
      avatarColor: preset.color,
      statusBadgeColor: preset.color,
      team: assignedSide,
      speech: preset.speech.toLowerCase().includes('beach') || preset.speech.toLowerCase().includes('bbq')
        ? (assignedSide === 'left' ? 'Ready to judge! ⚖️' : 'Objection! 💥')
        : preset.speech,
    };
    setCourtMembers((prev) => [...prev, newMember]);
    setAddModalOpen(false);
    setMemberNotification(`🎉 ${preset.name} joined the Travel Court! ⚖️`);
    setTimeout(() => setMemberNotification(null), 3500);
  };

  const handleAddCustomMember = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newMemberName.trim() || 'New Friend';
    playPop();
    triggerHaptic('vote');
    const newId = `buddy_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const leftCount = courtMembers.filter(m => m.team === 'left' || m.team === 'beach').length;
    const rightCount = courtMembers.filter(m => m.team === 'right' || m.team === 'bbq').length;
    const assignedSide: 'left' | 'right' = leftCount <= rightCount ? 'left' : 'right';

    const newMember: DynamicCourtMember = {
      id: newId,
      name: trimmedName,
      variant: newMemberVariant,
      avatarColor: '#3b82f6',
      statusBadgeColor: '#3b82f6',
      team: assignedSide,
      speech: newMemberSpeech.trim() || (assignedSide === 'left' ? 'Present and ready! 🙋' : 'Objection! 💥'),
    };
    setCourtMembers((prev) => [...prev, newMember]);
    setNewMemberName('');
    setNewMemberSpeech('');
    setAddModalOpen(false);
    setMemberNotification(`🎉 ${trimmedName} joined the Travel Court! ⚖️`);
    setTimeout(() => setMemberNotification(null), 3500);
  };

  const handleRemoveMember = (id: string) => {
    playPop();
    triggerHaptic('pop');
    const memberToRemove = courtMembers.find((m) => m.id === id);
    setCourtMembers((prev) => prev.filter((m) => m.id !== id));
    if (memberToRemove) {
      setMemberNotification(`👋 ${memberToRemove.name} left the court`);
      setTimeout(() => setMemberNotification(null), 2500);
    }
  };

  const handleResetMembers = () => {
    playPop();
    triggerHaptic('tap');
    setCourtMembers(DEFAULT_COURT_MEMBERS);
    setMemberNotification('🔄 Restored original 4 court members');
    setTimeout(() => setMemberNotification(null), 2500);
  };

  // When entering Screen 4 (jury-live), simulate sequential voting reveals
  useEffect(() => {
    if (currentStep === 'jury-live') {
      const userEffectiveVote = userVote === 'not-now' ? 'not-now' : 'go';

      // For Case 3 (Cable Car), outcome is REJECTED (opposite of Case 1: 1 Go vs 3 Not now)
      const initialAlexVote = caseIndex === 3
        ? (userEffectiveVote === 'go' ? 'not-now' : 'go')
        : 'go';

      // Initially 2 submitted: Alex and June (You, the user whose vote is already in!)
      // and 2 pending: Mavis and Ken
      setLiveJurors([
        { id: 'alex', name: 'Alex', vote: initialAlexVote, variant: 'green', avatarColor: '#10b981', hairColor: '#065f46' },
        { id: 'june', name: 'June (You)', vote: userEffectiveVote, variant: 'coral', avatarColor: '#ef4444', hairColor: '#db2777' },
        { id: 'mavis', name: 'Mavis', vote: null, variant: 'purple', avatarColor: '#a855f7', hairColor: '#f59e0b' },
        { id: 'ken', name: 'Ken', vote: null, variant: 'blue', avatarColor: '#f59e0b', hairColor: '#1e3a8a' },
      ]);
      setTimerCount(6);

      // Mavis votes after 1.8s
      const tMavis = window.setTimeout(() => {
        playPop();
        triggerHaptic('pop');
        setLiveJurors(prev =>
          prev.map(j => (j.id === 'mavis' ? { ...j, vote: caseIndex === 3 ? 'not-now' : 'go' } : j))
        );
      }, 1800);

      // Ken votes after 3.6s
      const tKen = window.setTimeout(() => {
        playPop();
        triggerHaptic('pop');
        setLiveJurors(prev =>
          prev.map(j =>
            j.id === 'ken' ? {
              ...j,
              vote: caseIndex === 3
                ? 'not-now'
                : ((caseIndex === 2 && userEffectiveVote === 'not-now')
                  ? 'not-now'
                  : (userEffectiveVote === 'not-now' ? 'go' : 'not-now')),
            } : j
          )
        );
      }, 3600);

      // 1-second countdown timer
      const countdownInterval = window.setInterval(() => {
        setTimerCount(c => (c > 0 ? c - 1 : 0));
      }, 1000);

      // Auto-advance to verdict or showdown after all votes are in
      const finishTimer = window.setTimeout(() => {
        if (caseIndex === 2 && userEffectiveVote === 'not-now') {
          handleGoToShowdown();
        } else if (caseIndex === 3) {
          handleGoToVerdict('fail');
        } else {
          handleGoToVerdict('pass');
        }
      }, 5400);

      return () => {
        clearTimeout(tMavis);
        clearTimeout(tKen);
        clearInterval(countdownInterval);
        clearTimeout(finishTimer);
      };
    }
  }, [currentStep, userVote, caseIndex]);

  // Trigger 2 vs 2 Tie Showdown on Case 2
  const handleGoToShowdown = () => {
    setLiveJurors([
      { id: 'alex', name: 'Alex', vote: 'go', variant: 'green', avatarColor: '#10b981', hairColor: '#065f46' },
      { id: 'mavis', name: 'Mavis', vote: 'go', variant: 'purple', avatarColor: '#a855f7', hairColor: '#f59e0b' },
      { id: 'ken', name: 'Ken', vote: 'not-now', variant: 'blue', avatarColor: '#f59e0b', hairColor: '#1e3a8a' },
      { id: 'june', name: 'June (You)', vote: 'not-now', variant: 'coral', avatarColor: '#ef4444', hairColor: '#db2777' },
    ]);
    setShowdownStakesLocked(false);
    setShowdownWinner(null);
    setShowdownUserStake(60);
    setShowdownDebateChat('');
    setDebateBubbles([
      { id: 'b1', sender: 'Alex', team: 'left', text: 'Fresh seafood hotpot is unbeatable! 🍲' },
      { id: 'b2', sender: 'Ken', team: 'right', text: 'Too raw and pricey! Save money! 💸' },
      {
        id: 'b3',
        sender: 'June (You)',
        team: 'right',
        text: userReason.trim() ? userReason.trim() : 'Let’s check other spots instead! 🙅‍♀️',
      },
    ]);
    playGavelStrike();
    triggerHaptic('gavel');
    triggerScreenShake('court-shake-target');
    setCurrentStep('showdown');
  };

  const handleTriggerLeftBubble = (customText?: string) => {
    playPop();
    triggerHaptic('tap');
    const bubble = {
      id: `left-${Date.now()}`,
      sender: 'Alex',
      text: customText || 'Fresh seafood hotpot is unbeatable!',
    };
    setActiveLeftBubble(bubble);
    window.setTimeout(() => {
      setActiveLeftBubble(prev => (prev?.id === bubble.id ? null : prev));
    }, 4200);
  };

  const handleTriggerRightBubble = (customText?: string) => {
    playPop();
    triggerHaptic('tap');
    const bubble = {
      id: `right-${Date.now()}`,
      sender: 'Ken',
      text: customText || "Let's check other spots instead!",
    };
    setActiveRightBubble(bubble);
    window.setTimeout(() => {
      setActiveRightBubble(prev => (prev?.id === bubble.id ? null : prev));
    }, 4200);
  };

  const handleSendShowdownChat = () => {
    const text = showdownDebateChat.trim();
    if (!text) return;
    playPop();
    triggerHaptic('tap');
    const newBubble = {
      id: `chat-${Date.now()}`,
      sender: 'June (You)',
      team: 'right' as const,
      text,
    };
    setDebateBubbles(prev => [...prev.slice(-3), newBubble]);
    setActiveRightBubble({
      id: newBubble.id,
      sender: newBubble.sender,
      text: newBubble.text,
    });
    setShowdownDebateChat('');

    // Auto-dismiss June's bubble after 4.2s
    window.setTimeout(() => {
      setActiveRightBubble(prev => (prev?.id === newBubble.id ? null : prev));
    }, 4200);

    // Opponent team rebuttal after 850ms
    const rebuttals = [
      'We came all the way to Jeju for fresh seafood!',
      'Abalone hotpot is legendary here in Jeju!',
      'The ocean table view is already booked!',
      'Give it a try, it will be an unforgettable meal!',
    ];
    window.setTimeout(() => {
      playPop();
      triggerHaptic('pop');
      const oppBubble = {
        id: `opp-${Date.now()}`,
        sender: Math.random() > 0.5 ? 'Alex' : 'Mavis',
        team: 'left' as const,
        text: rebuttals[Math.floor(Math.random() * rebuttals.length)],
      };
      setDebateBubbles(prev => [...prev.slice(-3), oppBubble]);
      setActiveLeftBubble({
        id: oppBubble.id,
        sender: oppBubble.sender,
        text: oppBubble.text,
      });

      // Auto-dismiss opponent bubble after 4.2s
      window.setTimeout(() => {
        setActiveLeftBubble(prev => (prev?.id === oppBubble.id ? null : prev));
      }, 4200);
    }, 850);
  };

  const handleConfirmShowdownStakes = () => {
    playGavelStrike();
    triggerHaptic('gavel');
    triggerScreenShake('court-shake-target');
    setShowdownStakesLocked(true);
    setShowPointBubbles(true);

    // Point bubbles stay visible for 4.2s then fade out smoothly
    window.setTimeout(() => {
      setShowPointBubbles(false);
    }, 4200);

    const teamGoPoints = 85;
    const teamNotNowPoints = 45 + showdownUserStake;

    window.setTimeout(() => {
      playVictoryFanfare();
      triggerHaptic('victory');
      if (teamNotNowPoints >= teamGoPoints) {
        setShowdownWinner('not-now');
        setCaseOutcomes(prev => ({ ...prev, 2: false }));
      } else {
        setShowdownWinner('go');
        setCaseOutcomes(prev => ({ ...prev, 2: true }));
      }
    }, 400);
  };

  // Handle verdict trigger with Gavel strike sound, haptic, screen shake
  const handleGoToVerdict = (outcome: 'pass' | 'fail') => {
    const userEffectiveVote = userVote === 'not-now' ? 'not-now' : 'go';

    // Record decision for current case based on outcome
    setCaseOutcomes(prev => ({
      ...prev,
      [caseIndex]: outcome === 'pass',
    }));

    // Ensure all 4 juror votes are fully set and consistent
    if (outcome === 'fail' || caseIndex === 3) {
      const alexVote = userEffectiveVote === 'go' ? 'not-now' : 'go';
      setLiveJurors([
        { id: 'alex', name: 'Alex', vote: alexVote, variant: 'green', avatarColor: '#10b981', hairColor: '#065f46' },
        { id: 'mavis', name: 'Mavis', vote: 'not-now', variant: 'purple', avatarColor: '#a855f7', hairColor: '#f59e0b' },
        { id: 'ken', name: 'Ken', vote: 'not-now', variant: 'blue', avatarColor: '#f59e0b', hairColor: '#1e3a8a' },
        { id: 'june', name: 'June (You)', vote: userEffectiveVote, variant: 'coral', avatarColor: '#ef4444', hairColor: '#db2777' },
      ]);
    } else {
      setLiveJurors([
        { id: 'alex', name: 'Alex', vote: 'go', variant: 'green', avatarColor: '#10b981', hairColor: '#065f46' },
        { id: 'mavis', name: 'Mavis', vote: 'go', variant: 'purple', avatarColor: '#a855f7', hairColor: '#f59e0b' },
        { id: 'ken', name: 'Ken', vote: userEffectiveVote === 'not-now' ? 'go' : 'not-now', variant: 'blue', avatarColor: '#f59e0b', hairColor: '#1e3a8a' },
        { id: 'june', name: 'June (You)', vote: userEffectiveVote, variant: 'coral', avatarColor: '#ef4444', hairColor: '#db2777' },
      ]);
    }

    if (outcome === 'pass') {
      setCurrentStep('verdict-pass');
      playGavelStrike();
      triggerHaptic('gavel');
      triggerScreenShake('court-shake-target');

      window.setTimeout(() => {
        playVictoryFanfare();
        triggerHaptic('victory');
        setShowConfetti(true);
      }, 350);
    } else {
      setCurrentStep('verdict-fail');
      playGavelStrike();
      triggerHaptic('gavel');
      triggerScreenShake('court-shake-target');
    }
  };

  const handleLikeComment = (id: string) => {
    playPop();
    triggerHaptic('pop');
    setComments(prev =>
      prev.map(c => {
        if (c.id === id) {
          const nextLiked = !c.liked;
          return {
            ...c,
            liked: nextLiked,
            likes: nextLiked ? c.likes + 1 : c.likes - 1,
          };
        }
        return c;
      })
    );
  };

  const handleAddComment = () => {
    const text = newCommentText.trim();
    if (!text) return;
    playPop();
    triggerHaptic('vote');
    const newC = {
      id: `c-${Date.now()}`,
      author: 'June (You)',
      avatar: '#ef4444',
      text,
      timeAgo: 'Just now',
      likes: 0,
      liked: false,
    };
    setComments(prev => [...prev, newC]);
    setNewCommentText('');
  };

  return (
    <div className="court-phone-container court-shake-target">
      {/* Confetti Explosion Layer */}
      {showConfetti && currentStep === 'verdict-pass' && (
        <div className="court-confetti-stage" aria-hidden="true">
          {Array.from({ length: 36 }).map((_, i) => (
            <div
              key={i}
              className="court-confetti-particle"
              style={{
                left: `${(i * 100) / 36}%`,
                background: ['#12b76a', '#ffc72c', '#1877f2', '#f04438', '#ec4899', '#8b5cf6'][i % 6],
                animationDelay: `${(i % 10) * 0.15}s`,
                borderRadius: i % 2 === 0 ? '50%' : '2px',
                width: `${6 + (i % 6)}px`,
                height: `${8 + (i % 8)}px`,
                ['--drift' as string]: `${(i % 2 === 0 ? 1 : -1) * (30 + (i % 60))}px`,
              }}
            />
          ))}
        </div>
      )}

      {voteZooming && (
        <div className="court-vote-zoom-overlay" aria-hidden="true">
          <div className="court-vote-zoom-scene">
            <img
              src="/characters/court_stage_bg.jpg?v=vote_zoom"
              alt=""
              className="court-vote-zoom-bg"
              draggable={false}
            />
            <div className="court-vote-zoom-member court-vote-zoom-alex">
              <TravelCourtCharacter variant="boy_green" state="thinking" size={64} label="Alex" animated />
            </div>
            <div className="court-vote-zoom-member court-vote-zoom-mavis">
              <TravelCourtCharacter variant="girl_blonde" state="idle" size={64} label="Mavis" animated />
            </div>
            <div className="court-vote-zoom-member court-vote-zoom-ken">
              <TravelCourtCharacter variant="boy_yellow" state="thinking" size={64} label="Ken" animated />
            </div>
            <div className="court-vote-zoom-member court-vote-zoom-focus">
              <TravelCourtCharacter variant="girl_redhat" state="idle" size={72} label="June" animated />
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          SCREEN 1: COURT LOBBY / INTRO (MASTER DESIGN)
          ==================================================================== */}
      {currentStep === 'lobby' && (
        <div
          className="court-case-chamber court-vintage-chamber"
          style={{
            paddingBottom: 4,
          }}
        >
          {/* Authentic iPhone 16/17 Pro Max (6.9") Status Bar */}
          <MobileStatusBar />

          {/* Top Navigation Bar with centered "Travel Court" title */}
          <header
            className="court-navbar"
            style={{
              background: 'transparent',
              borderBottom: 'none',
              padding: '2px 16px 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <button
              className="court-nav-back-btn"
              onClick={onClose || onBackToIdeas}
              aria-label="Back"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '1.5px solid #e8d5b5',
                background: 'rgba(255,253,247,0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(110, 70, 30, 0.08)',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={22} color="#8b1520" />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <DiscussIdeaButton />
              <div className="vp-postmark" style={{ width: 42, height: 42, opacity: 0.8 }}>
                <div className="vp-postmark-label">
                  <div>✈ COURT</div>
                  <div>2026</div>
                </div>
              </div>
            </div>
          </header>

          <div
            className="court-lobby-screen"
            style={{
              padding: '0 16px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              flex: 1,
              minHeight: 0,
              width: '100%',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            {/* Top Group: Master Header Lockup + Central Courtroom Stage */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {/* Retro Postmark / Travel Stamp Watermark */}
              <div
                className="court-vintage-stamp-mark"
                style={{
                  top: 50,
                  left: -8,
                  width: 66,
                  height: 66,
                  transform: 'rotate(-14deg)',
                  fontSize: '7px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  lineHeight: 1.25,
                  zIndex: 0,
                }}
              >
                <span>★ VOYAGE ★</span>
                <span style={{ fontSize: '8.5px', fontWeight: 900, color: 'rgba(147, 5, 0, 0.32)' }}>COURT</span>
                <span>JEJU 2026</span>
              </div>

              <div
                className="court-master-header-wrap"
                style={{
                  position: 'relative',
                  width: '100%',
                  padding: '2px 0 4px',
                  textAlign: 'center',
                }}
              >
              {/* Palm tree silhouette on left */}
              <div
                style={{
                  position: 'absolute',
                  top: -4,
                  left: 2,
                  opacity: 0.55,
                  pointerEvents: 'none',
                }}
              >
                <svg width="50" height="42" viewBox="0 0 60 50" fill="#95BBEA">
                  <path d="M 12 45 Q 16 28 28 20 Q 18 16 10 18 Q 18 24 20 36 Z" />
                  <path d="M 28 20 Q 32 10 24 4 Q 22 14 26 18 Z" />
                  <path d="M 28 20 Q 40 16 46 22 Q 36 22 30 20 Z" />
                  <path d="M 10 48 Q 18 36 28 32 Q 22 40 18 48 Z" opacity="0.7" />
                </svg>
              </div>

              {/* Dotted Airplane Trail on right */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 4,
                  opacity: 0.85,
                  pointerEvents: 'none',
                }}
              >
                <svg width="70" height="36" viewBox="0 0 84 42" fill="none">
                  <path
                    d="M 10 32 Q 42 38 66 16"
                    stroke="#95BBEA"
                    strokeWidth="1.8"
                    strokeDasharray="3 3"
                  />
                  <text x="67" y="15" fontSize="14" fill="#930500">✈</text>
                </svg>
              </div>

              {/* Title: Travel Court with 3D Gavel and Sparks */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  position: 'relative',
                }}
              >
                <h2
                  className="vp-title"
                  style={{
                    fontSize: '34px',
                    fontWeight: 900,
                    color: '#930500',
                    letterSpacing: '-0.02em',
                    margin: 0,
                    lineHeight: 1.1,
                    fontFamily: "'Caveat', cursive",
                  }}
                >
                  Travel Court
                </h2>
                <div
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    transform: 'rotate(-15deg)',
                    marginTop: -3,
                  }}
                >
                  <span
                    style={{
                      fontSize: '22px',
                      filter: 'drop-shadow(0 2px 4px rgba(147,5,0,0.25))',
                    }}
                  >
                    🔨
                  </span>
                  <div
                    style={{
                      position: 'absolute',
                      top: -5,
                      right: -7,
                      color: '#f59e0b',
                      fontSize: '13px',
                      fontWeight: 900,
                      display: 'flex',
                      flexDirection: 'column',
                      lineHeight: 0.8,
                    }}
                  >
                    <span>✦</span>
                  </div>
                </div>
              </div>

              {/* Subtitle */}
              <p
                className="court-vintage-subtitle"
                style={{
                  fontSize: '15px',
                  color: '#6d5241',
                  fontWeight: 600,
                  margin: '2px 0 4px',
                  letterSpacing: '0.01em',
                  fontFamily: "'Caveat', cursive",
                }}
              >
                Different opinions? Let's decide together!
              </p>
            </div>

            {/* Dynamic Central Courtroom Hero Card with Scrapbook Washi Tape Corners */}
            <div style={{ position: 'relative', width: '100%' }}>
              {/* Top-Left Blue Washi Tape Strip */}
              <div
                style={{
                  position: 'absolute',
                  top: -6,
                  left: 14,
                  width: 52,
                  height: 16,
                  background: 'linear-gradient(135deg, rgba(74,123,168,0.88) 0%, rgba(61,106,149,0.88) 100%)',
                  transform: 'rotate(-12deg)',
                  zIndex: 25,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.14)',
                  borderLeft: '2px dashed rgba(255,255,255,0.7)',
                  borderRight: '2px dashed rgba(255,255,255,0.7)',
                  pointerEvents: 'none',
                }}
              />
              {/* Top-Right Red Washi Tape Strip */}
              <div
                style={{
                  position: 'absolute',
                  top: -6,
                  right: 14,
                  width: 52,
                  height: 16,
                  background: 'linear-gradient(135deg, rgba(163,21,32,0.88) 0%, rgba(139,21,32,0.88) 100%)',
                  transform: 'rotate(14deg)',
                  zIndex: 25,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.14)',
                  borderLeft: '2px dashed rgba(255,255,255,0.7)',
                  borderRight: '2px dashed rgba(255,255,255,0.7)',
                  pointerEvents: 'none',
                }}
              />
              <DynamicCourtroomStage
                members={courtMembers}
                onCourtClick={() => {
                  playVoteChime(true);
                  triggerHaptic('tap');
                  setMemberNotification('⚖️ The Travel Court is now in session! Waiting for all members to join.');
                  setTimeout(() => setMemberNotification(null), 3000);
                }}
                onMemberClick={(m) => {
                  playPop();
                  triggerHaptic('tap');
                  setMemberNotification(`💬 ${m.name}: "${m.speech || 'Present and ready!'}"`);
                  setTimeout(() => setMemberNotification(null), 3000);
                }}
              />
            </div>
          </div>

          {/* Bottom Group: Members Card + iOS Home Indicator */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: 8,
              flex: 1,
              justifyContent: 'space-between',
            }}
          >
            {/* Bottom "{courtMembers.length} members in the court" Card (Vintage Scrapbook Memo / Pin-up Card) */}
            <div
              className="court-lobby-members-card court-vintage-memo-card"
              style={{
                width: '100%',
                background: '#fffefa',
                borderRadius: 20,
                padding: '11px 13px 12px',
                boxShadow:
                  '0 8px 24px rgba(115, 75, 40, 0.08), 0 2px 6px rgba(115, 75, 40, 0.04)',
                border: '1px solid #f2e3cc',
                marginTop: 0,
                position: 'relative',
              }}
            >
              {/* 3D Red Pushpin Detail (Pins the memo card to the oatmeal paper) */}
              <div className="court-vintage-pushpin" aria-hidden="true" title="Pinned to Journal">
                <div className="court-pushpin-pin" />
                <div className="court-pushpin-head" />
              </div>

              {/* Header Row: 4 / 6 members joined on left + Washi Tape "waiting...." on right */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                  padding: '0 2px',
                }}
              >
                {/* Left: Pulsing Green Dot + Dynamic Member Counter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: '#10b981',
                      boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.25)',
                      display: 'inline-block',
                      animation: 'court-dot-pulse 1.8s infinite',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: '#2b1810',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {courtMembers.length} / 6 members joined
                  </span>
                  {courtMembers.length !== 4 && (
                    <button
                      type="button"
                      onClick={handleResetMembers}
                      style={{
                        background: '#fcf4e8',
                        border: '1px solid #ecd8bf',
                        borderRadius: 99,
                        padding: '1px 6px',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        color: '#7c5b46',
                        cursor: 'pointer',
                        marginLeft: 2,
                      }}
                      title="Reset back to default 4 members"
                    >
                      ↺ Reset
                    </button>
                  )}
                </div>

                {/* Right: Cornflower Blue Washi Tape "waiting...." */}
                <div className="court-vintage-washi-pill">
                  <BouncingWaveText text={courtMembers.length >= 6 ? 'All ready! 🎉' : 'waiting....'} />
                </div>
              </div>

              {/* Dynamic Avatars Row + 1 Add Button */}
              <div
                className="court-lobby-avatars-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: courtMembers.length <= 4 ? 'space-between' : 'flex-start',
                  gap: 10,
                  overflowX: 'auto',
                  padding: '2px 2px 6px',
                  marginBottom: 6,
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {courtMembers.map((m) => {
                  const isDefault = ['alex', 'mavis', 'ken', 'june'].includes(m.id);
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 3,
                        flexShrink: 0,
                        position: 'relative',
                      }}
                    >
                      {/* Authentic Character Avatar Circle (Original Character Art) */}
                      <div
                        onClick={() => {
                          playPop();
                          triggerHaptic('tap');
                          setMemberNotification(`💬 ${m.name}: "${m.speech || 'Present and ready!'}"`);
                          setTimeout(() => setMemberNotification(null), 3000);
                        }}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          position: 'relative',
                          boxShadow: '0 2px 8px rgba(110,70,30,0.08)',
                          background: 'radial-gradient(circle at 50% 35%, #ffffff 0%, #FFF8E7 100%)',
                          border: '2px solid #ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        <TravelCourtCharacter
                          variant={m.variant}
                          state="idle"
                          size={44}
                          isAvatar
                          animated={false}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: 11,
                            height: 11,
                            borderRadius: '50%',
                            background: m.statusBadgeColor || m.avatarColor || '#95BBEA',
                            border: '2px solid #ffffff',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                          }}
                        />
                      </div>

                      {/* Name Label */}
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#554133',
                          maxWidth: 52,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          textAlign: 'center',
                        }}
                      >
                        {m.name}
                      </span>

                      {/* Remove Button for newly added members */}
                      {!isDefault && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveMember(m.id);
                          }}
                          title={`Remove ${m.name} from court`}
                          style={{
                            position: 'absolute',
                            top: -3,
                            right: -3,
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            background: '#930500',
                            color: '#ffffff',
                            border: '1.5px solid #ffffff',
                            fontSize: 9,
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            zIndex: 10,
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* 5. Add Button */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    flexShrink: 0,
                  }}
                >
                  <button
                    type="button"
                    onClick={handleAddFriend}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      border: '1.5px dashed #95BBEA',
                      background: '#fffdf6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#930500',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(110, 70, 30, 0.04)',
                      transition: 'transform 0.15s ease',
                    }}
                    aria-label="Add friend"
                  >
                    <Plus size={22} strokeWidth={2.6} color="#930500" />
                  </button>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#7a6252',
                    }}
                  >
                    Add
                  </span>
                </div>
              </div>

              {/* Dynamic Notification Toast */}
              {memberNotification && (
                <div
                  style={{
                    background: '#fdf4e7',
                    border: '1px solid #f6d8ae',
                    color: '#930500',
                    padding: '6px 10px',
                    borderRadius: 12,
                    fontSize: '11px',
                    fontWeight: 700,
                    textAlign: 'center',
                    marginBottom: 8,
                    animation: 'court-fade-in 0.2s ease',
                    boxShadow: '0 2px 6px rgba(147,5,0,0.08)',
                  }}
                >
                  {memberNotification}
                </div>
              )}

              {/* Start the Case Button: Authentic Sangria Red Torn Paper Strip */}
              <TornPaperButton
                onClick={() => {
                  playWhoosh();
                  triggerHaptic('tap');
                  if (onGoToIdeas) {
                    onGoToIdeas();
                  } else {
                    setCurrentStep('proposal');
                  }
                }}
                variant="crimson"
              >
                Start the case
              </TornPaperButton>
            </div>

            {/* Authentic iOS Home Indicator */}
            <MobileHomeIndicator />
          </div>

            {/* =========================================================
                ADD FRIEND MODAL (Dynamic Courtroom Buddy Addition)
                ========================================================= */}
            {addModalOpen && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(15, 23, 42, 0.65)',
                  backdropFilter: 'blur(6px)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  zIndex: 9999,
                  animation: 'court-fade-in 0.2s ease',
                }}
                onClick={() => setAddModalOpen(false)}
              >
                <div
                  style={{
                    background: '#ffffff',
                    width: '100%',
                    maxWidth: 440,
                    borderRadius: '28px 28px 0 0',
                    padding: '24px 20px 32px',
                    boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
                    animation: 'court-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                        Add Friend to Court ⚖️
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                        Watch them appear live on the debate witness stand!
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAddModalOpen(false)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#f1f5f9',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#64748b',
                        fontWeight: 900,
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* 1-Tap Quick Add Presets */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: 8, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                      ⚡ Quick Pick Travelers
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                      {/* Preset 1: Lily */}
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickAdd({
                            name: 'Lily',
                            variant: 'girl_blonde',
                            team: 'beach',
                            color: '#ec4899',
                            speech: 'Ready to vote! ✨',
                          })
                        }
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 10px',
                          borderRadius: 16,
                          background: '#eff6ff',
                          border: '1.5px solid #bfdbfe',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ffffff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <TravelCourtCharacter variant="girl_blonde" state="idle" size={34} isAvatar animated={false} />
                        </div>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e3a8a' }}>+ Lily</div>
                          <div style={{ fontSize: '10px', color: '#2563eb', fontWeight: 600 }}>🏛️ Juror</div>
                        </div>
                      </button>

                      {/* Preset 2: Ethan */}
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickAdd({
                            name: 'Ethan',
                            variant: 'boy_green',
                            team: 'beach',
                            color: '#10b981',
                            speech: 'Present and ready! 🙋',
                          })
                        }
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 10px',
                          borderRadius: 16,
                          background: '#eff6ff',
                          border: '1.5px solid #bfdbfe',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ffffff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <TravelCourtCharacter variant="boy_green" state="idle" size={34} isAvatar animated={false} />
                        </div>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e3a8a' }}>+ Ethan</div>
                          <div style={{ fontSize: '10px', color: '#2563eb', fontWeight: 600 }}>🏛️ Juror</div>
                        </div>
                      </button>

                      {/* Preset 3: Zack */}
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickAdd({
                            name: 'Zack',
                            variant: 'boy_yellow',
                            team: 'bbq',
                            color: '#f97316',
                            speech: 'All set! 😎',
                          })
                        }
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 10px',
                          borderRadius: 16,
                          background: '#eff6ff',
                          border: '1.5px solid #bfdbfe',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ffffff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <TravelCourtCharacter variant="boy_yellow" state="idle" size={34} isAvatar animated={false} />
                        </div>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e3a8a' }}>+ Zack</div>
                          <div style={{ fontSize: '10px', color: '#2563eb', fontWeight: 600 }}>🏛️ Juror</div>
                        </div>
                      </button>

                      {/* Preset 4: Chloe */}
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickAdd({
                            name: 'Chloe',
                            variant: 'girl_redhat',
                            team: 'bbq',
                            color: '#ef4444',
                            speech: 'Objection! 💥',
                          })
                        }
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 10px',
                          borderRadius: 16,
                          background: '#eff6ff',
                          border: '1.5px solid #bfdbfe',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ffffff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <TravelCourtCharacter variant="girl_redhat" state="idle" size={34} isAvatar animated={false} />
                        </div>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e3a8a' }}>+ Chloe</div>
                          <div style={{ fontSize: '10px', color: '#2563eb', fontWeight: 600 }}>💥 Objection!</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Custom Friend Creation Form */}
                  <form onSubmit={handleAddCustomMember}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: 8, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                      ✍️ Custom Traveler
                    </div>

                    {/* Friend Name Input */}
                    <div style={{ marginBottom: 12 }}>
                      <input
                        type="text"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        placeholder="Enter friend's name (e.g. Taylor)..."
                        maxLength={18}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 14,
                          border: '1.5px solid #cbd5e1',
                          fontSize: '13px',
                          fontWeight: 600,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    {/* Choose Team Toggle */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
                        Court Seating:
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => setNewMemberTeam('beach')}
                          style={{
                            flex: 1,
                            padding: '9px 10px',
                            borderRadius: 14,
                            border: `2px solid ${newMemberTeam === 'beach' ? '#2563eb' : '#e2e8f0'}`,
                            background: newMemberTeam === 'beach' ? '#eff6ff' : '#ffffff',
                            color: newMemberTeam === 'beach' ? '#1e3a8a' : '#64748b',
                            fontSize: '12px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                          }}
                        >
                          <span>👈</span>
                          <span>Left Table</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewMemberTeam('bbq')}
                          style={{
                            flex: 1,
                            padding: '9px 10px',
                            borderRadius: 14,
                            border: `2px solid ${newMemberTeam === 'bbq' ? '#2563eb' : '#e2e8f0'}`,
                            background: newMemberTeam === 'bbq' ? '#eff6ff' : '#ffffff',
                            color: newMemberTeam === 'bbq' ? '#1e3a8a' : '#64748b',
                            fontSize: '12px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                          }}
                        >
                          <span>👉</span>
                          <span>Right Table</span>
                        </button>
                      </div>
                    </div>

                    {/* Choose Character Style */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
                        Choose Look:
                      </div>
                      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                        {[
                          { variant: 'green' as CharacterVariant, label: 'Cap' },
                          { variant: 'purple' as CharacterVariant, label: 'Blonde' },
                          { variant: 'coral' as CharacterVariant, label: 'Hat' },
                          { variant: 'blue' as CharacterVariant, label: 'Shades' },
                        ].map((styleOption) => {
                          const isSelected = newMemberVariant === styleOption.variant;
                          return (
                            <div
                              key={styleOption.variant}
                              onClick={() => setNewMemberVariant(styleOption.variant)}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 3,
                                cursor: 'pointer',
                              }}
                            >
                              <div
                                style={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: '50%',
                                  border: `2px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                                  boxShadow: isSelected ? '0 0 0 2px #93c5fd' : 'none',
                                  overflow: 'hidden',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: '#f8fafc',
                                }}
                              >
                                <TravelCourtCharacter variant={styleOption.variant} state="idle" size={40} isAvatar animated={false} />
                              </div>
                              <span style={{ fontSize: '10px', fontWeight: 700, color: isSelected ? '#1d4ed8' : '#64748b' }}>
                                {styleOption.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Add to Court Submit Button */}
                    <button
                      type="submit"
                      className="court-dark-pill-btn"
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 30,
                        padding: '12px 20px',
                        fontSize: '14px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
                      }}
                    >
                      Add to Court Witness Stand 🚀
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          SCREEN 2: CASE 1 OF 3 - PROPOSAL PRESENTATION
          ==================================================================== */}
      {currentStep === 'proposal' && (
        <div className="court-case-chamber court-vintage-chamber">
          <header className="court-navbar">
            <button
              className="court-nav-back-btn"
              onClick={() => {
                playWhoosh();
                triggerHaptic('tap');
                if (onBackToIdeas) {
                  onBackToIdeas();
                } else {
                  setCurrentStep('lobby');
                }
              }}
              aria-label="Back"
              style={{
                background: 'rgba(255,253,247,0.95)',
                border: '1.5px solid #e8d5b5',
              }}
            >
              <ChevronLeft size={24} />
            </button>
            <div className="court-nav-title-group" style={{ alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#8b6b4e', fontFamily: "'Caveat', cursive" }}>
                Case {caseIndex} of 3
              </span>
              <div style={{ display: 'flex', gap: 4, width: 80, marginTop: 4 }}>
                <div style={{ height: 4, flex: 1, background: '#8b1520', borderRadius: 99 }} />
                <div style={{ height: 4, flex: 1, background: '#dece9a', borderRadius: 99 }} />
                <div style={{ height: 4, flex: 1, background: '#dece9a', borderRadius: 99 }} />
              </div>
            </div>
            <DiscussIdeaButton />
          </header>

          {(() => {
            const currentCase = CASES[caseIndex - 1];
            const remainingAfter = CASES.slice(caseIndex); // cards behind
            return (
              <div
                className="court-proposal-screen"
                style={{
                  position: 'relative',
                  padding: '10px 16px 112px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 0,
                  flex: 1,
                  minHeight: 0,
                  width: '100%',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                }}
              >
                {/* Top: Timer row → Judge with title above his head */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>

                  {/* Timer + Vote Count Row — at the very top */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    margin: '0 0 1px',
                    background: '#f8fafc',
                    borderRadius: 99,
                    padding: '5px 14px',
                    border: '1px solid #e2e8f0',
                  }}>
                    {/* Countdown */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} color="#e11d48" strokeWidth={2.5} />
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#e11d48' }}>
                        {fmtProposalTime(proposalTimeLeft)}
                      </span>
                    </div>
                    <div style={{ width: 1, height: 14, background: '#e2e8f0' }} />
                    {/* Vote avatars */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {courtMembers.slice(0, 4).map((m, idx) => {
                        const voted = idx < proposalVotedCount;
                        return (
                          <div key={m.id} style={{
                            width: 22, height: 22, borderRadius: '50%',
                            background: voted ? m.avatarColor : '#e2e8f0',
                            border: voted ? `2px solid ${m.avatarColor}` : '2px solid #cbd5e1',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '9px', fontWeight: 800, color: voted ? '#fff' : '#94a3b8',
                            transform: voted ? 'scale(1.15)' : 'scale(1)',
                            transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                            boxShadow: voted ? `0 2px 6px ${m.avatarColor}55` : 'none',
                          }}>
                            {voted ? '✓' : m.name[0]}
                          </div>
                        );
                      })}
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginLeft: 2, fontFamily: "'Inter', sans-serif" }}>
                        {proposalVotedCount}/{courtMembers.length} voted
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: '80%', height: 3, background: '#f1f5f9', borderRadius: 99, margin: '3px 0 0', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${proposalProgress}%`, background: 'linear-gradient(90deg, #800000, #b91c1c)', borderRadius: 99, transition: 'width 0.4s ease' }} />
                  </div>

                  {/* Title floats right above judge */}
                  <div style={{ margin: '11px 0 7px', textAlign: 'center', lineHeight: 1.12 }}>
                    <span style={{
                      fontSize: '27px', fontWeight: 900, color: '#8b1520',
                      fontFamily: "'Caveat', cursive",
                      letterSpacing: '-0.02em',
                    }}>
                      {currentCase.question.split(' ').map((word, i, arr) => {
                        const isLast = i === arr.length - 1;
                        return (
                          <span key={i}>
                            {word}{!isLast ? ' ' : ''}
                          </span>
                        );
                      })}
                    </span>
                  </div>

                  {/* Judge */}
                  <div style={{ margin: '0 0 -18px', display: 'flex', justifyContent: 'center' }}>
                    <DuolingoJudgeBench state="waving" size={100} benchWidth={130} />
                  </div>
                </div>


                {/* Stacked Card Deck — back cards peek from ABOVE, anchored to bottom */}
                {(() => {
                  const PEEK_HEIGHT = 36; // how many px of each back card peeks above the front card
                  const FRONT_CARD_HEIGHT = 224;
                  // Total container height: front card + 2 peek strips
                  const numPeekCards = Math.min(remainingAfter.length, 2);
                  const containerHeight = FRONT_CARD_HEIGHT + numPeekCards * PEEK_HEIGHT;

                  return (
                    <div className="court-proposal-stack" style={{ height: containerHeight, marginTop: 32 }}>

                      {/* Back card 2 (furthest behind) — peeks at very top */}
                      {remainingAfter.length >= 2 && (
                        <div
                          className="court-stack-peek-card court-stack-peek-card--back"
                          style={{ top: 0, height: FRONT_CARD_HEIGHT + 2 * PEEK_HEIGHT }}
                        >
                          {/* Only the top strip is visible — show peek content */}
                          <div className="court-stack-peek-content" style={{ height: PEEK_HEIGHT }}>
                            <div className="court-stack-peek-thumb">
                              <img src={remainingAfter[1]?.imageUrl} alt="" />
                            </div>
                            <span className="court-stack-case-chip">Case {remainingAfter[1]?.id}</span>
                            <div className="court-stack-peek-copy">
                              <b>{remainingAfter[1]?.title}</b>
                              <span>{remainingAfter[1]?.typeLabel.replace(/^[^\w]+ /, '')}</span>
                            </div>
                            <ArrowRight size={14} className="court-stack-peek-arrow" />
                          </div>
                        </div>
                      )}

                      {/* Back card 1 (middle) — peeks second from top */}
                      {remainingAfter.length >= 1 && (
                        <div
                          className="court-stack-peek-card court-stack-peek-card--middle"
                          style={{
                            top: remainingAfter.length >= 2 ? PEEK_HEIGHT : 0,
                            height: FRONT_CARD_HEIGHT + PEEK_HEIGHT,
                          }}
                        >
                          {/* Only the top strip is visible */}
                          <div className="court-stack-peek-content" style={{ height: PEEK_HEIGHT }}>
                            <div className="court-stack-peek-thumb">
                              <img src={remainingAfter[0]?.imageUrl} alt="" />
                            </div>
                            <span className="court-stack-case-chip">Case {remainingAfter[0]?.id}</span>
                            <div className="court-stack-peek-copy">
                              <b>{remainingAfter[0]?.title}</b>
                              <span>{remainingAfter[0]?.typeLabel.replace(/^[^\w]+ /, '')}</span>
                            </div>
                            <ArrowRight size={14} className="court-stack-peek-arrow" />
                          </div>
                        </div>
                      )}

                      {/* Front card — fully visible, sits at the bottom of the stack */}
                      <div
                        className={`court-stack-front-card ${cardExiting ? 'court-card-swipe-out' : ''}`}
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: FRONT_CARD_HEIGHT,
                          background: '#ffffff',
                          borderRadius: 22,
                          boxShadow: '0 10px 28px rgba(100,65,25,0.14), 0 2px 6px rgba(100,65,25,0.08)',
                          overflow: 'hidden',
                          zIndex: 10,
                          border: '1.5px solid #e8d5b5',
                        }}
                      >
                        {/* Type badge */}
                        <div style={{
                          position: 'absolute', top: 0, left: 14, zIndex: 20,
                          background: 'linear-gradient(135deg, #4a7ba8 0%, #3d6a95 100%)',
                          borderRadius: '0 0 10px 10px', padding: '3px 9px',
                          fontSize: '10px', fontWeight: 800, color: '#ffffff',
                          letterSpacing: '0.02em', fontFamily: "'Caveat', cursive"
                        }}>
                          {currentCase.typeLabel}
                        </div>
                        {/* Photo */}
                        <div style={{ height: 136, overflow: 'hidden' }}>
                          <img
                            src={currentCase.imageUrl}
                            alt={currentCase.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        </div>
                        {/* Info */}
                        <div style={{ padding: '10px 14px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                            <MapPin size={13} color="#8b1520" />
                            <span style={{ fontSize: '16px', fontWeight: 800, color: '#2b1810', fontFamily: "'Caveat', cursive" }}>{currentCase.title}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                            {currentCase.tags.map(tag => (
                              <span key={tag} style={{
                                fontSize: '11px', fontWeight: 600, color: '#4a7ba8',
                                background: 'rgba(149,187,234,0.2)', borderRadius: 4, padding: '2px 8px',
                                border: '1px solid rgba(74,123,168,0.3)', fontFamily: "'Inter', sans-serif"
                              }}>{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })()}

                {/* Bottom Action */}
                <div style={{
                  position: 'absolute',
                  left: 16,
                  right: 16,
                  bottom: 34,
                  display: 'flex',
                  alignItems: 'center',
                  zIndex: 30,
                }}>
                  <button
                    type="button"
                    className="vp-btn-ticket blue"
                    onClick={() => {
                      if (voteZooming) return;
                      playWhoosh();
                      triggerHaptic('tap');
                      setVoteZooming(true);
                      setTimeout(() => {
                        setVoteZooming(false);
                        setCurrentStep('voting');
                      }, 620);
                    }}
                  >
                    <div className="vp-btn-ticket-icon">✈</div>
                    <div className="vp-btn-ticket-text">
                      <div className="vp-btn-ticket-title">Next to Vote →</div>
                      <div className="vp-btn-ticket-sub">Cast your verdict now</div>
                    </div>
                  </button>
                </div>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 4,
                  zIndex: 29,
                  pointerEvents: 'none',
                }}>
                  <MobileHomeIndicator />
                </div>
              </div>
            );
          })()}
        </div>
      )}



      {/* ====================================================================
          SCREEN 3: CASE 1 OF 3 - IT'S YOUR TURN! (VOTING)
          ==================================================================== */}
      {currentStep === 'voting' && (
        <div className="court-case-chamber court-vote-chamber court-vintage-chamber">
          <header className="court-navbar court-vote-navbar">
            <button
              className="court-nav-back-btn"
              onClick={() => setCurrentStep('proposal')}
              aria-label="Back"
              style={{
                background: 'rgba(255,253,247,0.95)',
                border: '1.5px solid #e8d5b5',
              }}
            >
              <ChevronLeft size={22} color="#8b1520" />
            </button>
            <div className="court-nav-title-group" style={{ alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#8b6b4e', fontFamily: "'Caveat', cursive" }}>
                Case {caseIndex} of 3
              </span>
              <div style={{ display: 'flex', gap: 4, width: 80, marginTop: 4 }}>
                <div style={{ height: 4, flex: 1, background: '#8b1520', borderRadius: 99 }} />
                <div style={{ height: 4, flex: 1, background: '#dece9a', borderRadius: 99 }} />
                <div style={{ height: 4, flex: 1, background: '#dece9a', borderRadius: 99 }} />
              </div>
            </div>
            <DiscussIdeaButton />
          </header>

          <div
            className="court-voting-screen"
            style={{
              padding: '4px 18px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              flex: 1,
              minHeight: 0,
              width: '100%',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            <div className="court-vote-focus-area" style={{ width: '100%' }}>
              <div className="court-voting-header" style={{ textAlign: 'center', margin: '2px 0 4px' }}>
                <h2 style={{ fontFamily: "'Caveat', cursive", fontSize: '32px', fontWeight: 700, color: '#8b1520', margin: 0, lineHeight: 1.05 }}>
                  It's your turn!
                </h2>
                <p style={{ fontFamily: "'Caveat', cursive", fontSize: '15px', fontWeight: 600, color: '#7a5840', margin: '1px 0 0' }}>
                  What's your vote?
                </p>
              </div>

              <div className="court-vote-mini-stage">
                <img
                  src="/characters/court_stage_bg.jpg?v=vote_focus"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/court_stage_bg.jpg?v=vote_focus';
                  }}
                  alt=""
                  className="court-vote-mini-stage-bg"
                  draggable={false}
                />
                <div className="court-vote-stage-glow" />
                <div className="court-vote-friend court-vote-friend-left">
                  <TravelCourtCharacter variant="boy_green" state="thinking" size={56} label="Alex" animated />
                </div>
                <div className="court-vote-friend court-vote-friend-right">
                  <TravelCourtCharacter variant="boy_yellow" state="thinking" size={56} label="Ken" animated />
                </div>
                <div className="court-voting-avatar-wrap">
                  <div className={userVote === 'go' ? 'court-june-react-yes' : userVote === 'either' ? 'court-june-react-either' : userVote === 'not-now' ? 'court-june-react-no' : 'court-june-idle-2d'}>
                    <TravelCourtCharacter
                      variant="girl_redhat"
                      state="idle"
                      vote={null}
                      size={132}
                      label="June"
                      animated={false}
                    />
                    <span className={`court-june-expression ${userVote === 'go' ? 'is-happy' : userVote === 'either' ? 'is-either' : userVote === 'not-now' ? 'is-no' : ''}`}>
                      {userVote === 'go' ? '♪' : userVote === 'either' ? '~' : userVote === 'not-now' ? '!' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Case Brief Polaroid Card */}
              <div
                className="court-vote-case-brief"
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #e8d5b5',
                  borderRadius: 16,
                  boxShadow: '0 4px 14px rgba(100,65,25,0.08)',
                  padding: '7px 11px',
                  margin: '6px 0 8px',
                }}
              >
                <img
                  src={activeCase.imageUrl}
                  alt={activeCase.title}
                  className="court-vote-case-thumb"
                  draggable={false}
                  style={{ width: 62, height: 52, borderRadius: 10, objectFit: 'cover' }}
                />
                <div className="court-vote-case-copy">
                  <div className="court-vote-case-meta" style={{ marginBottom: 2 }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#4a7ba8', fontWeight: 600 }}>
                      {activeCase.typeLabel}
                    </span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#8b6b4e', fontWeight: 500 }}>
                      Case {caseIndex}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "'Caveat', cursive", fontSize: '18px', fontWeight: 700, color: '#8b1520', margin: 0 }}>
                    {activeCase.question}
                  </h3>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12.5px', color: '#2b1810', margin: '1px 0 2px' }}>
                    {activeCase.title}
                  </p>
                  <div className="court-vote-case-tags">
                    {activeCase.tags.slice(0, 3).map(tag => (
                      <span key={tag} style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600, background: 'rgba(149,187,234,0.2)', color: '#4a7ba8', borderRadius: 4, padding: '1px 6px' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* S3 VOTING: Original 3D Physical Circular Vote Buttons (All Denim Blue & Sunken Pressed-in State) */}
              <div className="court-dual-vote-buttons" style={{ display: 'flex', justifyContent: 'center', gap: 36, margin: '8px 0 10px' }}>
                <button
                  type="button"
                  className={`court-vote-btn-choice ${userVote === 'go' ? 'selected' : userVote ? 'dimmed' : ''}`}
                  onClick={() => {
                    playVoteChime(true);
                    triggerHaptic('vote');
                    setUserVote('go');
                  }}
                >
                  <div className="court-vote-circle go">
                    <Check size={30} strokeWidth={3.8} />
                  </div>
                  <span>Go!</span>
                </button>

                <button
                  type="button"
                  className={`court-vote-btn-choice ${userVote === 'not-now' ? 'selected' : userVote ? 'dimmed' : ''}`}
                  onClick={() => {
                    playVoteChime(false);
                    triggerHaptic('vote');
                    setUserVote('not-now');
                  }}
                >
                  <div className="court-vote-circle not-now">
                    <X size={30} strokeWidth={3.8} />
                  </div>
                  <span>Not now</span>
                </button>
              </div>

              {/* Either option: subtle denim blue choice */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '0 0 8px' }}>
                <button
                  type="button"
                  className={`court-vote-either-text-btn ${userVote === 'either' ? 'selected' : ''}`}
                  onClick={() => {
                    playVoteChime(true);
                    triggerHaptic('vote');
                    setUserVote('either');
                  }}
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: '15px',
                    fontWeight: 700,
                    color: userVote === 'either' ? '#244360' : '#4a7ba8',
                    background: userVote === 'either' ? 'rgba(74,123,168,0.22)' : 'transparent',
                    border: userVote === 'either' ? '1.5px dashed #4a7ba8' : '1px dashed rgba(74,123,168,0.4)',
                    borderRadius: 99,
                    padding: '3px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  I'm fine with either ~
                </button>
              </div>

              <input
                type="text"
                className="court-reason-input"
                placeholder="Add a travel note or reason (optional)..."
                value={userReason}
                onChange={e => setUserReason(e.target.value)}
                style={{
                  background: 'rgba(255,253,247,0.95)',
                  border: '1.5px solid #e8d5b5',
                  borderRadius: 14,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13.5px',
                  color: '#2b1810',
                  padding: '9px 14px',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Bottom Action Group */}
            <div className="court-vote-submit-wrap" style={{ width: '100%', padding: '6px 0 0', marginTop: 'auto' }}>
              <TornPaperButton
                variant="blue"
                disabled={!userVote}
                onClick={() => {
                  playWhoosh();
                  triggerHaptic('tap');

                  const userEffectiveVote = userVote === 'not-now' ? 'not-now' : 'go';

                  setLiveJurors(prev =>
                    prev.map(j => (j.id === 'june' ? { ...j, vote: userEffectiveVote } : j))
                  );

                  if (userReason.trim()) {
                    setComments(prev => {
                      const clean = prev.filter(c => c.author !== 'June (You)' && c.author !== 'June' && c.author !== 'You');
                      return [
                        ...clean,
                        {
                          id: `c-june-${caseIndex}-${Date.now()}`,
                          author: 'June (You)',
                          avatar: '#ef4444',
                          text: userReason.trim(),
                          timeAgo: 'Just now',
                          likes: 0,
                          liked: false,
                        }
                      ];
                    });
                  } else {
                    setComments(prev =>
                      prev.filter(c => c.author !== 'June (You)' && c.author !== 'June' && c.author !== 'You')
                    );
                  }

                  setCurrentStep('jury-live');
                }}
              >
                Submit Vote
              </TornPaperButton>
            </div>
            <div className="court-vote-home-wrap" style={{ width: '100%', padding: '6px 0 2px' }}>
              <MobileHomeIndicator />
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          SCREEN 4: CASE 1 OF 3 - THE JURY IS VOTING...
          ==================================================================== */}
      {/* ====================================================================
          SCREEN 4: CASE 1 OF 3 - THE JURY IS VOTING...
          ==================================================================== */}
      {currentStep === 'jury-live' && (() => {
        const submittedJurors = liveJurors.filter(j => j.vote !== null);
        const pendingJurors = liveJurors.filter(j => j.vote === null);

        const alexJuror = liveJurors.find(j => j.id === 'alex') || liveJurors[0];
        const mavisJuror = liveJurors.find(j => j.id === 'mavis') || liveJurors[1];
        const kenJuror = liveJurors.find(j => j.id === 'ken') || liveJurors[2];
        const juneJuror = liveJurors.find(j => j.id === 'june') || liveJurors[3];

        return (
          <div className="court-case-chamber court-vintage-chamber">
            <header className="court-navbar">
              <button
                className="court-nav-back-btn"
                onClick={() => setCurrentStep('voting')}
                aria-label="Back"
                style={{
                  background: 'rgba(255,253,247,0.95)',
                  border: '1.5px solid #e8d5b5',
                }}
              >
                <ChevronLeft size={22} color="#8b1520" />
              </button>
              <div className="court-nav-title-group" style={{ alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#8b6b4e', fontFamily: "'Caveat', cursive" }}>
                  Case {caseIndex} of 3
                </span>
                <div style={{ display: 'flex', gap: 4, width: 80, marginTop: 4 }}>
                  <div style={{ height: 4, flex: 1, background: '#8b1520', borderRadius: 99 }} />
                  <div style={{ height: 4, flex: 1, background: caseIndex >= 2 ? '#8b1520' : '#dece9a', borderRadius: 99 }} />
                  <div style={{ height: 4, flex: 1, background: caseIndex >= 3 ? '#8b1520' : '#dece9a', borderRadius: 99 }} />
                </div>
              </div>
              <DiscussIdeaButton />
            </header>

            <div
              className="court-jury-screen"
              style={{
                padding: '4px 16px 8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flex: 1,
                minHeight: 0,
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              {/* Header in Caveat font */}
              <div className="court-jury-header" style={{ margin: '2px 0 8px', textAlign: 'center' }}>
                <h2 style={{ fontFamily: "'Caveat', cursive", fontSize: '32px', fontWeight: 700, color: '#8b1520', margin: 0, lineHeight: 1.05 }}>
                  The jury is voting...
                </h2>
                <p style={{ fontFamily: "'Caveat', cursive", fontSize: '15px', fontWeight: 600, color: '#7a5840', margin: '2px 0 0' }}>
                  Your vote is in. Waiting for the rest of the court.
                </p>
              </div>

              {/* Case Brief Polaroid Card (Matching Screen 3 exactly) */}
              <div
                className="court-vote-case-brief"
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #e8d5b5',
                  borderRadius: 16,
                  boxShadow: '0 4px 14px rgba(100,65,25,0.08)',
                  padding: '7px 11px',
                  margin: '0 0 12px',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <img
                  src={activeCase.imageUrl}
                  alt={activeCase.title}
                  className="court-vote-case-thumb"
                  draggable={false}
                  style={{ width: 62, height: 52, borderRadius: 10, objectFit: 'cover' }}
                />
                <div className="court-vote-case-copy">
                  <div className="court-vote-case-meta" style={{ marginBottom: 2 }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#4a7ba8', fontWeight: 600 }}>
                      {activeCase.typeLabel}
                    </span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#8b6b4e', fontWeight: 500 }}>
                      Case {caseIndex}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "'Caveat', cursive", fontSize: '18px', fontWeight: 700, color: '#8b1520', margin: 0 }}>
                    {activeCase.question}
                  </h3>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12.5px', color: '#2b1810', margin: '1px 0 2px' }}>
                    {activeCase.title}
                  </p>
                  <div className="court-vote-case-tags">
                    {activeCase.tags.slice(0, 3).map(tag => (
                      <span key={tag} style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600, background: 'rgba(149,187,234,0.2)', color: '#4a7ba8', borderRadius: 4, padding: '1px 6px' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Courtroom Stage (Matching Figure 2 scene with animated characters holding voted paddles - NO duplicated judge sprite) */}
              <div className="court-jury-stage" style={{ height: 262, margin: '0 0 14px' }}>
                <img
                  src="/characters/court_stage_bg.jpg?v=vertical_no_chairs_v6"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/court_stage_bg.jpg?v=vertical_no_chairs_v6';
                  }}
                  alt="Courtroom Stage"
                  className="court-jury-stage-bg"
                  draggable={false}
                />

                {/* Top-Right Badge: "X / 4 votes received" */}
                <div className="court-jury-votes-badge">
                  <div className="court-jury-votes-count">
                    <span>{submittedJurors.length} / 4</span>
                    <span style={{ color: '#f59e0b', fontSize: '12px' }}>✨</span>
                  </div>
                  <div className="court-jury-votes-label">votes received</div>
                </div>

                {/* ================= LEFT DESK MEMBERS ================= */}
                {/* Alex (Back Left Desk) */}
                <div
                  style={{
                    position: 'absolute',
                    left: '26%',
                    top: 92,
                    transform: 'translateX(-50%)',
                    zIndex: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {alexJuror.vote ? (
                    <div className="court-jury-bubble-submitted">
                      <Check size={9} strokeWidth={3.5} /> Submitted
                    </div>
                  ) : (
                    <div className="court-jury-bubble-waiting">
                      ••• Waiting
                    </div>
                  )}
                  <TravelCourtCharacter
                    variant="boy_green"
                    vote={alexJuror.vote === 'go' ? 'yes' : alexJuror.vote === 'not-now' ? 'no' : null}
                    state={alexJuror.vote ? 'action' : 'thinking'}
                    size={48}
                    animated
                  />
                  <span className="tc-character-label" style={{ marginTop: -3, fontSize: '9.5px', padding: '1px 7px' }}>
                    Alex
                  </span>
                </div>

                {/* Mavis (Front Left Desk - comfortably separated) */}
                <div
                  style={{
                    position: 'absolute',
                    left: '13%',
                    top: 184,
                    transform: 'translateX(-50%)',
                    zIndex: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {mavisJuror.vote ? (
                    <div className="court-jury-bubble-submitted">
                      <Check size={9} strokeWidth={3.5} /> Submitted
                    </div>
                  ) : (
                    <div className="court-jury-bubble-waiting">
                      ••• Waiting
                    </div>
                  )}
                  <TravelCourtCharacter
                    variant="girl_blonde"
                    vote={mavisJuror.vote === 'go' ? 'yes' : mavisJuror.vote === 'not-now' ? 'no' : null}
                    state={mavisJuror.vote ? 'support' : 'thinking'}
                    size={52}
                    animated
                  />
                  <span className="tc-character-label" style={{ marginTop: -3, fontSize: '9.5px', padding: '1px 7px' }}>
                    Mavis
                  </span>
                </div>

                {/* ================= RIGHT DESK MEMBERS ================= */}
                {/* Ken (Back Right Desk) */}
                <div
                  style={{
                    position: 'absolute',
                    left: '74%',
                    top: 92,
                    transform: 'translateX(-50%)',
                    zIndex: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {kenJuror.vote ? (
                    <div className="court-jury-bubble-submitted">
                      <Check size={9} strokeWidth={3.5} /> Submitted
                    </div>
                  ) : (
                    <div className="court-jury-bubble-waiting">
                      ••• Waiting
                    </div>
                  )}
                  <TravelCourtCharacter
                    variant="boy_yellow"
                    vote={kenJuror.vote === 'go' ? 'yes' : kenJuror.vote === 'not-now' ? 'no' : null}
                    state={kenJuror.vote ? 'action' : 'thinking'}
                    size={48}
                    animated
                  />
                  <span className="tc-character-label" style={{ marginTop: -3, fontSize: '9.5px', padding: '1px 7px' }}>
                    Ken
                  </span>
                </div>

                {/* June (Front Right Desk - comfortably separated) */}
                <div
                  style={{
                    position: 'absolute',
                    left: '87%',
                    top: 184,
                    transform: 'translateX(-50%)',
                    zIndex: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {juneJuror.vote ? (
                    <div className="court-jury-bubble-submitted">
                      <Check size={9} strokeWidth={3.5} /> Submitted
                    </div>
                  ) : (
                    <div className="court-jury-bubble-waiting">
                      ••• Waiting
                    </div>
                  )}
                  <TravelCourtCharacter
                    variant="girl_redhat"
                    vote={juneJuror.vote === 'go' ? 'yes' : juneJuror.vote === 'not-now' ? 'no' : null}
                    state={juneJuror.vote ? 'celebrate' : 'thinking'}
                    size={52}
                    animated
                  />
                  <span className="tc-character-label" style={{ marginTop: -3, fontSize: '9.5px', padding: '1px 7px' }}>
                    June
                  </span>
                </div>
              </div>

              {/* Bottom Waiting Card (Matching Figure 3 exactly) */}
              <div className="court-jury-waiting-card" style={{ margin: '0 0 10px' }}>
                {/* Top row: Clock + Waiting for others... + 00:06 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Clock size={16} strokeWidth={2.4} color="#0f172a" />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                      Waiting for others...
                    </span>
                  </div>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                    00:0{timerCount}
                  </span>
                </div>

                {/* Middle row: Progress bar */}
                <div className="court-jury-progress-track">
                  <div
                    className="court-jury-progress-fill"
                    style={{ width: `${Math.min(100, ((6 - timerCount) / 6) * 100)}%` }}
                  />
                </div>

                {/* Bottom row: Submitted Avatars & Count | Pending Avatars & Count */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {/* Left: Submitted */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {submittedJurors.map((j, i) => (
                        <div
                          key={j.id}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.12)',
                            marginLeft: i === 0 ? 0 : -6,
                            zIndex: 10 - i,
                            border: '1.5px solid #ffffff',
                            background: j.avatarColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <TravelCourtCharacter variant={j.variant || 'green'} size={24} isAvatar />
                        </div>
                      ))}
                    </div>
                    <span style={{ fontSize: '12.5px', fontWeight: 750, color: '#059669' }}>
                      {submittedJurors.length} submitted
                    </span>
                  </div>

                  {/* Vertical Divider */}
                  <div style={{ width: 1, height: 18, background: '#e2e8f0' }} />

                  {/* Right: Pending */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {pendingJurors.map((j, i) => (
                        <div
                          key={j.id}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.12)',
                            marginLeft: i === 0 ? 0 : -6,
                            zIndex: 10 - i,
                            border: '1.5px solid #ffffff',
                            background: j.avatarColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <TravelCourtCharacter variant={j.variant || 'coral'} size={24} isAvatar />
                        </div>
                      ))}
                    </div>
                    <span style={{ fontSize: '12.5px', fontWeight: 750, color: '#64748b' }}>
                      {pendingJurors.length} pending
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Group */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'auto', paddingTop: 2 }}>
                <button
                  type="button"
                  onClick={() => {
                    const userEffectiveVote = userVote === 'not-now' ? 'not-now' : 'go';
                    if (caseIndex === 2 && userEffectiveVote === 'not-now') {
                      handleGoToShowdown();
                    } else if (caseIndex === 3) {
                      handleGoToVerdict('fail');
                    } else {
                      handleGoToVerdict('pass');
                    }
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '8px 16px',
                    fontSize: '18px',
                    fontWeight: 700,
                    fontFamily: "'Caveat', cursive",
                    color: '#6d5241',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    marginBottom: 6,
                    outline: 'none',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#8b1520')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#6d5241')}
                >
                  Skip to verdict →
                </button>
                <MobileHomeIndicator />
              </div>
            </div>
          </div>
        );
      })()}

      {/* ====================================================================
          SCREEN 5: CASE 1 OF 3 - VERDICT ACCEPTED ("We're going to Jeju!")
          ==================================================================== */}
      {currentStep === 'verdict-pass' && (
        <div className="court-case-chamber court-vintage-chamber">
          <header className="court-navbar">
            <button
              className="court-nav-back-btn"
              onClick={() => setCurrentStep('proposal')}
              aria-label="Back"
              style={{
                background: 'rgba(255,253,247,0.95)',
                border: '1.5px solid #e8d5b5',
              }}
            >
              <ChevronLeft size={22} color="#8b1520" />
            </button>
            <div className="court-nav-title-group" style={{ alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#8b6b4e', fontFamily: "'Caveat', cursive" }}>
                Case {caseIndex} of 3
              </span>
              <div style={{ display: 'flex', gap: 4, width: 80, marginTop: 4 }}>
                <div style={{ height: 4, flex: 1, background: '#8b1520', borderRadius: 99 }} />
                <div style={{ height: 4, flex: 1, background: caseIndex >= 2 ? '#8b1520' : '#dece9a', borderRadius: 99 }} />
                <div style={{ height: 4, flex: 1, background: caseIndex >= 3 ? '#8b1520' : '#dece9a', borderRadius: 99 }} />
              </div>
            </div>
            <DiscussIdeaButton />
          </header>

          {(() => {
            const currentVerdictTitle = activeCase.verdictTitle ?? `We're going to ${activeCase.title}!`;
            const userEffectiveVote = userVote === 'not-now' ? 'not-now' : 'go';

            // 4 Members with dynamic voting states guaranteeing exactly 3 Go and 1 Not now matching Figure 2
            const verdictMembers = [
              { id: 'alex', name: 'Alex', variant: 'green' as CharacterVariant, vote: 'go' as const, bg: '#e6f9f0' },
              { id: 'mavis', name: 'Mavis', variant: 'purple' as CharacterVariant, vote: 'go' as const, bg: '#fef7e7' },
              { id: 'ken', name: 'Ken', variant: 'blue' as CharacterVariant, vote: (userEffectiveVote === 'not-now' ? 'go' : 'not-now') as 'go' | 'not-now', bg: '#f1f5f9' },
              { id: 'june', name: 'June (You)', variant: 'coral' as CharacterVariant, vote: userEffectiveVote, bg: '#fff1f2' },
            ];
            const yesCount = verdictMembers.filter(m => m.vote === 'go').length;
            const noCount = verdictMembers.filter(m => m.vote === 'not-now').length;
            const greenPct = Math.round((yesCount / verdictMembers.length) * 100);

            return (
              <div className="court-verdict-page-container">
                {/* Top Section: Subtitle + Large Red Torn Paper Banner (PASSED!) */}
                <div className="court-verdict-header-block" style={{ width: '100%', alignItems: 'center' }}>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: '15px', color: '#8b6b4e', fontWeight: 600, textAlign: 'center' }}>
                    The verdict is...
                  </div>

                  {/* S5: "PASSED! Good Days Ahead" Large Red Torn-Paper Banner */}
                  <div
                    style={{
                      margin: '4px 0 6px',
                      background: 'linear-gradient(135deg, #a31520 0%, #8b1520 100%)',
                      borderRadius: 14,
                      padding: '8px 18px',
                      boxShadow: '0 6px 20px rgba(139,21,32,0.35)',
                      transform: 'rotate(-1.2deg)',
                      textAlign: 'center',
                      position: 'relative',
                    }}
                  >
                    <div style={{ fontFamily: "'Caveat', cursive", fontSize: '13px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', fontWeight: 700 }}>
                      ★ PASSED! GOOD DAYS AHEAD ★
                    </div>
                    <h2
                      style={{
                        fontFamily: "'Caveat', cursive",
                        fontSize: '25px',
                        fontWeight: 700,
                        color: '#ffffff',
                        margin: '2px 0 0',
                        lineHeight: 1.1,
                      }}
                    >
                      {currentVerdictTitle}
                    </h2>
                  </div>

                  {/* Stage Area: Sticky Note + Judge + Stamp */}
                  <div className="court-verdict-stage-area">
                    <div className="court-verdict-stickynote">
                      Good<br />
                      Places<br />
                      Brighter<br />
                      Journeys<br />
                      Together ♡
                    </div>

                    <DuolingoJudgeBench state="striking" size={118} benchWidth={148} />

                    <div className="court-verdict-stamp">
                      <div className="court-stamp-circle">
                        <span className="court-stamp-label">TRAVEL</span>
                        <span className="court-stamp-label">COURT</span>
                        <Plane size={11} className="court-stamp-plane-icon" />
                      </div>
                      <svg width={22} height={26} viewBox="0 0 22 26" style={{ marginLeft: 2 }}>
                        <path d="M0 5 Q 5 1, 11 5 T 22 5 M0 13 Q 5 9, 11 13 T 22 13 M0 21 Q 5 17, 11 21 T 22 21" stroke="#b91c1c" strokeWidth="1.3" fill="none" opacity="0.65" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Card 1: Selected Case Card */}
                <div className="court-selected-case-card" style={{ background: '#ffffff', border: '1.5px solid #e8d5b5' }}>
                  <img
                    src={activeCase.imageUrl}
                    alt={activeCase.title}
                    className="court-selected-case-thumb"
                  />
                  <div className="court-selected-case-info">
                    <div className="court-selected-case-badges">
                      <span className="court-badge-type">{activeCase.typeLabel}</span>
                      <span className="court-badge-result" style={{ background: '#ecfdf5', color: '#059669' }}>Verdict Approved</span>
                    </div>
                    <h3 className="court-selected-case-title" style={{ fontFamily: "'Caveat', cursive", fontSize: '18px', color: '#8b1520' }}>
                      {activeCase.selectedTitle}
                    </h3>
                    <p className="court-selected-case-desc">
                      {activeCase.description}
                    </p>
                    <div className="court-selected-case-tags">
                      {activeCase.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="court-selected-case-tag" style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600, background: 'rgba(149,187,234,0.2)', color: '#4a7ba8', borderRadius: 4, padding: '2px 8px', border: '1px solid rgba(74,123,168,0.3)' }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card 2: Vote Results Card */}
                <div className="court-vote-results-card" style={{ background: '#ffffff', border: '1.5px solid #e8d5b5' }}>
                  <div className="court-vote-results-header">
                    <div className="court-vote-results-title-group">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="13" width="4.5" height="8" rx="1.5" fill="#93c5fd" />
                        <rect x="9.75" y="8" width="4.5" height="13" rx="1.5" fill="#60a5fa" />
                        <rect x="16.5" y="3" width="4.5" height="18" rx="1.5" fill="#1877f2" />
                      </svg>
                      <h3 className="court-vote-results-title" style={{ fontFamily: "'Caveat', cursive", fontSize: '18px', color: '#2b1810' }}>Vote results</h3>
                    </div>
                    <span className="court-vote-results-count" style={{ fontFamily: "'Inter', sans-serif", fontSize: '11.5px', fontWeight: 600, color: '#6d5241' }}>4 members voted</span>
                  </div>

                  {/* Score numbers and Split Bar */}
                  <div className="court-vote-score-row">
                    <span className="court-vote-num-green">{yesCount}</span>
                    <div className="court-vote-progress-track">
                      <div className="court-vote-progress-green" style={{ width: `${greenPct}%` }} />
                      <div className="court-vote-progress-red" style={{ width: `${100 - greenPct}%` }} />
                    </div>
                    <span className="court-vote-num-red">{noCount}</span>
                  </div>

                  {/* 4 Members */}
                  <div className="court-vote-members-grid">
                    {verdictMembers.map((j) => {
                      const isYes = j.vote === 'go';
                      return (
                        <div key={j.id} className="court-vote-member-cell" style={{ background: j.bg }}>
                          <TravelCourtCharacter
                            variant={j.variant}
                            vote={isYes ? 'yes' : 'no'}
                            size={34}
                            isAvatar
                            animated={false}
                          />
                          <div className="court-vote-member-info">
                            <span className="court-vote-member-name">{j.name}</span>
                            <span className={`court-vote-member-badge ${isYes ? 'yes' : 'no'}`}>
                              {isYes ? '✓ Go' : '✕ Not now'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Action Group */}
                <div className="court-verdict-bottom-actions" style={{ display: 'flex', gap: 10, width: '100%', marginTop: 8 }}>
                  <div style={{ flex: 1 }}>
                    <TornPaperButton
                      variant="blue"
                      onClick={() => {
                        playWhoosh();
                        setCurrentStep('discussion');
                      }}
                      arrow={false}
                    >
                      💬 Discussion
                    </TornPaperButton>
                  </div>

                  <div style={{ flex: 1.3 }}>
                    <TornPaperButton
                      variant="crimson"
                      onClick={() => {
                        playWhoosh();
                        triggerHaptic('tap');
                        if (caseIndex < CASES.length) {
                          const nextCase = caseIndex + 1;
                          setCaseIndex(nextCase);
                          setUserVote(null);
                          setUserReason('');
                          setComments(CASE_DEFAULT_COMMENTS[nextCase] || CASE_DEFAULT_COMMENTS[1]);
                          setCurrentStep('proposal');
                        } else {
                          setCurrentStep('summary');
                        }
                      }}
                    >
                      {caseIndex < CASES.length ? 'Next case' : 'View summary'}
                    </TornPaperButton>
                  </div>
                </div>

                <MobileHomeIndicator />
              </div>
            );
          })()}
        </div>
      )}

      {/* ====================================================================
          SCREEN 6: CASE 2 OF 3 - VERDICT REJECTED ("Not this time!")
          ==================================================================== */}
      {currentStep === 'verdict-fail' && (
        <div className="court-case-chamber court-vintage-chamber">
          <header className="court-navbar">
            <button
              className="court-nav-back-btn"
              onClick={() => setCurrentStep('proposal')}
              aria-label="Back"
              style={{
                background: 'rgba(255,253,247,0.95)',
                border: '1.5px solid #e8d5b5',
              }}
            >
              <ChevronLeft size={22} color="#8b1520" />
            </button>
            <div className="court-nav-title-group" style={{ alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#8b6b4e', fontFamily: "'Caveat', cursive" }}>
                Case {caseIndex} of 3
              </span>
              <div style={{ display: 'flex', gap: 4, width: 80, marginTop: 4 }}>
                <div style={{ height: 4, flex: 1, background: '#8b1520', borderRadius: 99 }} />
                <div style={{ height: 4, flex: 1, background: caseIndex >= 2 ? '#8b1520' : '#dece9a', borderRadius: 99 }} />
                <div style={{ height: 4, flex: 1, background: caseIndex >= 3 ? '#8b1520' : '#dece9a', borderRadius: 99 }} />
              </div>
            </div>
            <DiscussIdeaButton />
          </header>

          {(() => {
            const userEffectiveVote = userVote === 'not-now' ? 'not-now' : 'go';
            const verdictMembers = [
              { id: 'alex', name: 'Alex', variant: 'green' as CharacterVariant, vote: (userEffectiveVote === 'go' ? 'not-now' : 'go') as 'go' | 'not-now', bg: '#e6f9f0' },
              { id: 'mavis', name: 'Mavis', variant: 'purple' as CharacterVariant, vote: 'not-now' as const, bg: '#fef7e7' },
              { id: 'ken', name: 'Ken', variant: 'blue' as CharacterVariant, vote: 'not-now' as const, bg: '#f1f5f9' },
              { id: 'june', name: 'June (You)', variant: 'coral' as CharacterVariant, vote: userEffectiveVote, bg: '#fff1f2' },
            ];
            const yesCount = verdictMembers.filter(m => m.vote === 'go').length;
            const noCount = verdictMembers.filter(m => m.vote === 'not-now').length;
            const greenPct = Math.round((yesCount / verdictMembers.length) * 100);

            return (
              <div className="court-verdict-page-container">
                {showSkippedGachaShowcase && (
                  <div className="court-skipped-gacha-showcase" aria-label="Skipped idea sealed for a future gacha draw">
                    <div className="court-skipped-gacha-pack">
                      <div className="court-skipped-gacha-pack__capsule"><i /><b /></div>
                      <div className="court-skipped-gacha-pack__paper">
                        <span>Seongsan Cable Car</span>
                      </div>
                      <small>Skipped idea sealed for a future gacha draw</small>
                    </div>
                  </div>
                )}
                {/* Top Section: Subtitle + Weathered Torn-Paper REJECTED Banner */}
                <div className="court-verdict-header-block" style={{ width: '100%', alignItems: 'center' }}>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: '15px', color: '#8b6b4e', fontWeight: 600, textAlign: 'center' }}>
                    The verdict is...
                  </div>

                  {/* S6: REJECTED Banner in weathered kraft / deep red */}
                  <div
                    style={{
                      margin: '4px 0 6px',
                      background: 'linear-gradient(135deg, #c4a882 0%, #a88960 100%)',
                      borderRadius: 14,
                      padding: '8px 18px',
                      boxShadow: '0 6px 20px rgba(100,65,25,0.25)',
                      transform: 'rotate(1.2deg)',
                      textAlign: 'center',
                      position: 'relative',
                    }}
                  >
                    <div style={{ fontFamily: "'Caveat', cursive", fontSize: '13px', letterSpacing: '0.12em', color: '#6f0e16', textTransform: 'uppercase', fontWeight: 800 }}>
                      ✕ CASE DISMISSED • NOT THIS TIME ✕
                    </div>
                    <h2
                      style={{
                        fontFamily: "'Caveat', cursive",
                        fontSize: '25px',
                        fontWeight: 700,
                        color: '#2b1810',
                        margin: '2px 0 0',
                        lineHeight: 1.1,
                      }}
                    >
                      {caseIndex === 3 ? "We're skipping Cable Car!" : "Not this time!"}
                    </h2>
                  </div>

                  {/* Stage Area: Sticky Note + Slumped Judge + Stamp */}
                  <div className="court-verdict-stage-area">
                    <div className="court-verdict-stickynote" style={{ background: '#fef3f2', border: '1px solid #fecdd3', color: '#991b1b' }}>
                      Next<br />
                      Time<br />
                      Another<br />
                      Spot<br />
                      Together ♡
                    </div>

                    <DuolingoJudgeBench state="slumped" size={118} benchWidth={148} />

                    <div className="court-verdict-stamp">
                      <div className="court-stamp-circle" style={{ borderColor: '#ef4444' }}>
                        <span className="court-stamp-label" style={{ color: '#ef4444' }}>TRAVEL</span>
                        <span className="court-stamp-label" style={{ color: '#ef4444' }}>COURT</span>
                        <X size={11} color="#ef4444" strokeWidth={3} className="court-stamp-plane-icon" />
                      </div>
                      <svg width="22" height="26" viewBox="0 0 22 26" style={{ marginLeft: 2 }}>
                        <path d="M0 5 Q 5 1, 11 5 T 22 5 M0 13 Q 5 9, 11 13 T 22 13 M0 21 Q 5 17, 11 21 T 22 21" stroke="#ef4444" strokeWidth="1.3" fill="none" opacity="0.65" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Card 1: Selected Case Card */}
                <div className="court-selected-case-card">
                  <img
                    src={activeCase.imageUrl}
                    alt={activeCase.title}
                    className="court-selected-case-thumb"
                  />
                  <div className="court-selected-case-info">
                    <div className="court-selected-case-badges">
                      <span className="court-badge-type">{activeCase.typeLabel}</span>
                      <span className="court-badge-result" style={{ background: '#fee2e2', color: '#b91c1c' }}>Verdict Rejected</span>
                    </div>
                    <h3 className="court-selected-case-title">
                      {caseIndex === 3 ? 'Seongsan Cable Car skipped' : `${activeCase.title} skipped`}
                    </h3>
                    <p className="court-selected-case-desc">
                      {activeCase.description}
                    </p>
                    <div className="court-selected-case-tags">
                      {activeCase.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="court-selected-case-tag" style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600, background: 'rgba(149,187,234,0.2)', color: '#4a7ba8', borderRadius: 4, padding: '2px 8px', border: '1px solid rgba(74,123,168,0.3)' }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card 2: Vote Results Card */}
                <div className="court-vote-results-card">
                  <div className="court-vote-results-header">
                    <div className="court-vote-results-title-group">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="13" width="4.5" height="8" rx="1.5" fill="#93c5fd" />
                        <rect x="9.75" y="8" width="4.5" height="13" rx="1.5" fill="#60a5fa" />
                        <rect x="16.5" y="3" width="4.5" height="18" rx="1.5" fill="#1877f2" />
                      </svg>
                      <h3 className="court-vote-results-title">Vote results</h3>
                    </div>
                    <span className="court-vote-results-count" style={{ fontFamily: "'Inter', sans-serif", fontSize: '11.5px', fontWeight: 600, color: '#6d5241' }}>4 members voted</span>
                  </div>

                  {/* Score numbers and Split Bar */}
                  <div className="court-vote-score-row">
                    <span className="court-vote-num-green">{yesCount}</span>
                    <div className="court-vote-progress-track">
                      <div className="court-vote-progress-green" style={{ width: `${greenPct}%` }} />
                      <div className="court-vote-progress-red" style={{ width: `${100 - greenPct}%` }} />
                    </div>
                    <span className="court-vote-num-red">{noCount}</span>
                  </div>

                  {/* 4 Members */}
                  <div className="court-vote-members-grid">
                    {verdictMembers.map((j) => {
                      const isYes = j.vote !== 'not-now';
                      return (
                        <div key={j.id} className="court-vote-member-col">
                          <div className="court-vote-avatar-container" style={{ background: j.bg }}>
                            <TravelCourtCharacter
                              variant={j.variant}
                              isAvatar
                              size={46}
                            />
                            <div className={`court-vote-member-badge ${isYes ? 'badge-green' : 'badge-red'}`}>
                              {isYes ? '✓' : '✕'}
                            </div>
                          </div>
                          <span className="court-vote-member-name">{j.name}</span>
                          <span className={`court-vote-member-pill ${isYes ? 'pill-green' : 'pill-red'}`}>
                            {isYes ? 'Go!' : 'Not now'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Action Group */}
                <div className="court-verdict-bottom-actions" style={{ display: 'flex', gap: 10, width: '100%', marginTop: 8 }}>
                  <div style={{ flex: 1 }}>
                    <TornPaperButton
                      variant="blue"
                      onClick={() => {
                        playWhoosh();
                        setCurrentStep('discussion');
                      }}
                      arrow={false}
                    >
                      💬 Discussion
                    </TornPaperButton>
                  </div>

                  <div style={{ flex: 1.3 }}>
                    <TornPaperButton
                      variant="crimson"
                      onClick={() => {
                        playWhoosh();
                        triggerHaptic('tap');
                        if (caseIndex < CASES.length) {
                          const nextCase = caseIndex + 1;
                          setCaseIndex(nextCase);
                          setUserVote(null);
                          setUserReason('');
                          setComments(CASE_DEFAULT_COMMENTS[nextCase] || CASE_DEFAULT_COMMENTS[1]);
                          setCurrentStep('proposal');
                        } else {
                          setCurrentStep('summary');
                        }
                      }}
                    >
                      {caseIndex < CASES.length ? 'Next case' : 'View summary'}
                    </TornPaperButton>
                  </div>
                </div>

                <MobileHomeIndicator />
              </div>
            );
          })()}
        </div>
      )}

      {/* ====================================================================
          SCREEN 7: DISCUSSION & VOTES TAB
          ==================================================================== */}
      {/* ====================================================================
          SCREEN 7: DISCUSSION & VOTES TAB
          ==================================================================== */}
      {currentStep === 'discussion' && (
        <div className="court-case-chamber court-vintage-chamber">
          <header className="court-navbar">
            <button
              className="court-nav-back-btn"
              onClick={() => setCurrentStep(caseOutcomes[caseIndex] === false ? 'verdict-fail' : 'verdict-pass')}
              aria-label="Back"
              style={{
                background: 'rgba(255,253,247,0.95)',
                border: '1.5px solid #e8d5b5',
              }}
            >
              <ChevronLeft size={22} color="#8b1520" />
            </button>
            <div className="court-nav-title-group" style={{ alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#8b6b4e', fontFamily: "'Caveat', cursive" }}>
                Case {caseIndex} of 3
              </span>
              <div style={{ display: 'flex', gap: 4, width: 80, marginTop: 4 }}>
                <div style={{ height: 4, flex: 1, background: '#8b1520', borderRadius: 99 }} />
                <div style={{ height: 4, flex: 1, background: caseIndex >= 2 ? '#8b1520' : '#dece9a', borderRadius: 99 }} />
                <div style={{ height: 4, flex: 1, background: caseIndex >= 3 ? '#8b1520' : '#dece9a', borderRadius: 99 }} />
              </div>
            </div>
            <DiscussIdeaButton />
          </header>

          <div
            className="court-discussion-screen"
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: 0,
              padding: '0 16px 2px',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            {/* Segmented Control [ Discussion | Votes ] */}
            <div className="court-segmented-control" style={{ background: 'rgba(255,253,247,0.85)', border: '1.5px solid #e8d5b5', borderRadius: 12, padding: 3 }}>
              <button
                type="button"
                className={`court-segment-btn ${segmentedTab === 'discussion' ? 'active' : ''}`}
                onClick={() => setSegmentedTab('discussion')}
                style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: '16px',
                  fontWeight: 700,
                  borderRadius: 9,
                  background: segmentedTab === 'discussion' ? '#8b1520' : 'transparent',
                  color: segmentedTab === 'discussion' ? '#ffffff' : '#8b6b4e',
                }}
              >
                Discussion
              </button>
              <button
                type="button"
                className={`court-segment-btn ${segmentedTab === 'votes' ? 'active' : ''}`}
                onClick={() => setSegmentedTab('votes')}
                style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: '16px',
                  fontWeight: 700,
                  borderRadius: 9,
                  background: segmentedTab === 'votes' ? '#8b1520' : 'transparent',
                  color: segmentedTab === 'votes' ? '#ffffff' : '#8b6b4e',
                }}
              >
                Votes
              </button>
            </div>

            {segmentedTab === 'discussion' ? (
              <>
                <div className="court-comments-stream">
                  {comments.map((c, i) => {
                    const noteStyles = [
                      { bg: '#fef9c3', border: '#fde047', text: '#713f12', authorColor: '#854d0e' }, // yellow
                      { bg: 'rgba(149,187,234,0.25)', border: 'rgba(74,123,168,0.35)', text: '#1e3a8a', authorColor: '#1d4ed8' }, // blue
                      { bg: '#fffdf7', border: '#e8d5b5', text: '#2b1810', authorColor: '#8b1520' }, // cream
                    ];
                    const note = noteStyles[i % 3];
                    const angle = i % 2 === 0 ? -1 : 1;

                    return (
                      <div
                        key={c.id}
                        className="court-comment-bubble"
                        style={{
                          background: note.bg,
                          border: `1.5px solid ${note.border}`,
                          borderRadius: 12,
                          boxShadow: '0 4px 12px rgba(100,65,25,0.08)',
                          transform: `rotate(${angle}deg)`,
                          padding: '9px 12px',
                          margin: '6px 0',
                        }}
                      >
                        <TravelCourtCharacter
                          variant={
                            c.author.includes('Alex') ? 'green' :
                            c.author.includes('Mavis') ? 'purple' :
                            c.author.includes('Ken') ? 'blue' :
                            'coral'
                          }
                          isAvatar
                          size={40}
                        />
                        <div className="court-comment-content" style={{ marginLeft: 8, flex: 1 }}>
                          <div className="court-comment-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <b style={{ fontFamily: "'Caveat', cursive", fontSize: '17px', fontWeight: 700, color: note.authorColor }}>
                              {c.author}
                            </b>
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#8b6b4e' }}>{c.timeAgo}</span>
                          </div>
                          <p className="court-comment-text" style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 500, color: note.text, margin: '3px 0 0', lineHeight: 1.35 }}>
                            {c.text}
                          </p>
                        </div>
                        <button
                          type="button"
                          className={`court-comment-like-btn ${c.liked ? 'liked' : ''}`}
                          onClick={() => handleLikeComment(c.id)}
                        >
                          <Heart size={14} fill={c.liked ? '#f43f5e' : 'none'} color={c.liked ? '#f43f5e' : '#8b6b4e'} />
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 600 }}>{c.likes}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="court-comment-input-bar" style={{ background: 'rgba(255,253,247,0.95)', border: '1.5px solid #e8d5b5', borderRadius: 16 }}>
                  <input
                    type="text"
                    placeholder="Write a travel note..."
                    value={newCommentText}
                    onChange={e => setNewCommentText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddComment();
                    }}
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#2b1810' }}
                  />
                  <button
                    type="button"
                    className="court-comment-send-btn"
                    onClick={handleAddComment}
                    aria-label="Send comment"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </>
            ) : (
              /* Votes Tab breakdown */
              <div className="court-comments-stream">
                {(() => {
                  const userEffectiveVote = userVote === 'not-now' ? 'not-now' : 'go';
                  const votesBreakdown = [
                    {
                      id: 'alex',
                      name: 'Alex',
                      variant: 'green' as CharacterVariant,
                      vote: 'go' as const,
                      reason: activeCase.id === 1 ? 'Wants to visit beaches & food' : activeCase.id === 2 ? 'Loves seafood hotpot by the coast' : 'Excited for high-altitude scenic views',
                    },
                    {
                      id: 'mavis',
                      name: 'Mavis',
                      variant: 'purple' as CharacterVariant,
                      vote: 'go' as const,
                      reason: activeCase.id === 1 ? 'Can’t wait for coastal walks' : activeCase.id === 2 ? 'Eager to try local abalone' : 'Great spot for group photos',
                    },
                    {
                      id: 'ken',
                      name: 'Ken',
                      variant: 'blue' as CharacterVariant,
                      vote: (userEffectiveVote === 'not-now' ? 'go' : 'not-now') as 'go' | 'not-now',
                      reason: userEffectiveVote === 'not-now'
                        ? (activeCase.id === 1 ? 'Convinced to join the beach trip' : activeCase.id === 2 ? 'Convinced to try fresh seafood' : 'Ready to enjoy the scenic ride')
                        : (activeCase.id === 1 ? 'Prefers downtown city spots' : activeCase.id === 2 ? 'Worried about seafood allergies' : 'Prefers staying on the ground'),
                    },
                    {
                      id: 'june',
                      name: 'June (You)',
                      variant: 'coral' as CharacterVariant,
                      vote: userEffectiveVote,
                      reason: userReason.trim()
                        ? userReason.trim()
                        : (userEffectiveVote === 'not-now' ? 'Prefers an alternative plan' : 'Ready to explore!'),
                    },
                  ];

                  return votesBreakdown.map((j) => {
                    const isYes = j.vote === 'go';
                    return (
                      <div key={j.id} className="court-comment-bubble" style={{ alignItems: 'center' }}>
                        <TravelCourtCharacter
                          variant={j.variant}
                          isAvatar
                          size={44}
                        />
                        <div style={{ flex: 1, marginLeft: 10 }}>
                          <b style={{ fontFamily: "'Caveat', cursive", fontSize: '18px', fontWeight: 700, color: '#2b1810' }}>{j.name}</b>
                          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '12.5px', color: '#6d5241', marginTop: '2px' }}>
                            {isYes ? `Voted Go! (${j.reason})` : `Voted Not now (${j.reason})`}
                          </div>
                        </div>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: 99,
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '12px',
                            fontWeight: 700,
                            background: isYes ? '#edfdf5' : '#fef3f2',
                            color: isYes ? '#12b76a' : '#f04438',
                            border: isYes ? '1px solid #bbf7d0' : '1px solid #fecaca',
                          }}
                        >
                          {isYes ? 'Go!' : 'Not now'}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            )}

            <button
              type="button"
              className="court-vote-submit-btn-3d"
              style={{
                width: '100%',
                margin: '10px 0 6px',
                flexShrink: 0,
              }}
              onClick={() => {
                playWhoosh();
                setCurrentStep('summary');
              }}
            >
              Continue to summary →
            </button>
            <MobileHomeIndicator />
          </div>
        </div>
      )}

      {/* ====================================================================
          SCREEN 7.5: CASE 2 TIE SHOWDOWN (2 vs 2 COURT DUEL & BETTING)
          ==================================================================== */}
      {currentStep === 'showdown' && (
        <div className="court-case-chamber court-vintage-chamber">
          <header className="court-navbar">
            <button
              className="court-nav-back-btn"
              onClick={() => setCurrentStep('proposal')}
              aria-label="Back"
              style={{
                background: 'rgba(255,253,247,0.95)',
                border: '1.5px solid #e8d5b5',
              }}
            >
              <ChevronLeft size={22} color="#8b1520" />
            </button>
            <div className="court-nav-title-group" style={{ alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#8b1520', fontFamily: "'Caveat', cursive" }}>
                Case 2 of 3 • 2 vs 2 Showdown
              </span>
              <div style={{ display: 'flex', gap: 4, width: 80, marginTop: 4 }}>
                <div style={{ height: 4, flex: 1, background: '#8b1520', borderRadius: 99 }} />
                <div style={{ height: 4, flex: 1, background: '#8b1520', borderRadius: 99 }} />
                <div style={{ height: 4, flex: 1, background: '#dece9a', borderRadius: 99 }} />
              </div>
            </div>
            <DiscussIdeaButton />
          </header>

          {(() => {
            const resolvedShowdownWinner = showdownWinner ?? (45 + showdownUserStake >= 85 ? 'not-now' : 'go');
            const teamGoScore = 85;
            const teamNotNowScore = 45 + showdownUserStake;
            const totalShowdownScore = teamGoScore + teamNotNowScore;
            const teamGoShare = (teamGoScore / totalShowdownScore) * 100;
            const teamNotNowShare = (teamNotNowScore / totalShowdownScore) * 100;

            return (
          <div className="court-showdown-screen">
            {/* Header info card */}
            <div className="court-showdown-header-card">
              <img
                src={activeCase.imageUrl}
                alt="Haenyeo Seafood"
                className="court-showdown-case-thumb"
              />
              <div className="court-showdown-case-info">
                <h3 className="court-showdown-case-title">
                  Court Deadlock: 2 vs 2 Tie!
                </h3>
                <p className="court-showdown-case-sub">
                  Eat at Haenyeo Seafood? Stake points to break the tie.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', flexShrink: 0 }}>
                <div className="court-showdown-sword-badge">
                  <span style={{ fontSize: '16px', lineHeight: 1 }}>⚔️</span>
                  <span style={{ fontSize: '9px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.4px', marginTop: 1 }}>
                    SHOWDOWN
                  </span>
                </div>
              </div>
            </div>

            {/* Courtroom Stage Box with Duel Banners */}
            <div className="court-showdown-stage-box">
              <img
                src="/characters/court_stage_bg.jpg?v=vertical_no_chairs_v6"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/court_stage_bg.jpg?v=vertical_no_chairs_v6';
                }}
                alt="Courtroom Duel Stage"
                className="court-showdown-stage-bg"
                draggable={false}
              />

              {/* Team Banners as Washi Tape Strips */}
              <div className="court-showdown-pill-left" style={{ fontFamily: "'Inter', sans-serif", fontSize: '11.5px', fontWeight: 800 }}>
                <Send size={11} style={{ transform: 'rotate(-30deg)' }} /> Team Go
              </div>
              <div className="court-showdown-pill-right" style={{ fontFamily: "'Inter', sans-serif", fontSize: '11.5px', fontWeight: 800 }}>
                <span style={{ fontSize: '11px', fontWeight: 900 }}>✕</span> Team Not Now
              </div>

              {/* Left Desk Team (Team Go: Alex & Mavis) */}
              {/* Alex */}
              <div
                style={{
                  position: 'absolute',
                  left: '18%',
                  top: showdownStakesLocked ? 58 : 131,
                  transform: 'translateX(-50%)',
                  zIndex: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => handleTriggerLeftBubble('Fresh seafood hotpot is unbeatable!')}
                title="Click Alex to speak"
              >
                {showPointBubbles && (
                  <div className="court-point-bubble bubble-green">+45</div>
                )}
                <div style={{ position: 'relative' }}>
                  <TravelCourtCharacter
                    variant="boy_green"
                    vote="yes"
                    state="action"
                    size={52}
                    animated
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#10b981',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1.5px solid #ffffff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    ✓
                  </div>
                </div>
                <span className="tc-character-label" style={{ marginTop: -2, fontSize: '9.5px', padding: '1px 7px' }}>
                  Alex
                </span>
              </div>

              {/* Mavis */}
              <div
                style={{
                  position: 'absolute',
                  left: '32%',
                  top: 180,
                  transform: 'translateX(-50%)',
                  zIndex: 15,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => handleTriggerLeftBubble('We can share the big abalone platter!')}
                title="Click Mavis to speak"
              >
                {showPointBubbles && (
                  <div className="court-point-bubble bubble-green">+40</div>
                )}
                <div style={{ position: 'relative' }}>
                  <TravelCourtCharacter
                    variant="girl_blonde"
                    vote="yes"
                    state="support"
                    size={54}
                    animated
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#10b981',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1.5px solid #ffffff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    ✓
                  </div>
                </div>
                <span className="tc-character-label" style={{ marginTop: -2, fontSize: '9.5px', padding: '1px 7px' }}>
                  Mavis
                </span>
              </div>

              {/* Right Desk Team (Team Not Now: Ken & June) */}
              {/* Ken */}
              <div
                style={{
                  position: 'absolute',
                  right: '32%',
                  top: 135,
                  transform: 'translateX(50%)',
                  zIndex: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => handleTriggerRightBubble('Seafood can be pricey, let us check cafes!')}
                title="Click Ken to speak"
              >
                {showPointBubbles && (
                  <div className="court-point-bubble bubble-red">+45</div>
                )}
                <div style={{ position: 'relative' }}>
                  <TravelCourtCharacter
                    variant="boy_yellow"
                    vote="no"
                    state="action"
                    size={52}
                    animated
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#ef4444',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1.5px solid #ffffff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    ✕
                  </div>
                </div>
                <span className="tc-character-label" style={{ marginTop: -2, fontSize: '9.5px', padding: '1px 7px' }}>
                  Ken
                </span>
              </div>

              {/* June (You) */}
              <div
                style={{
                  position: 'absolute',
                  right: '18%',
                  top: 180,
                  transform: 'translateX(50%)',
                  zIndex: 15,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {showPointBubbles && (
                  <div className="court-point-bubble bubble-red">+{showdownUserStake}</div>
                )}
                <div style={{ position: 'relative' }}>
                  <TravelCourtCharacter
                    variant="girl_redhat"
                    vote="no"
                    state="idle"
                    size={54}
                    animated={false}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#ef4444',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1.5px solid #ffffff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    ✕
                  </div>
                </div>
                <span className="tc-character-label" style={{ marginTop: -2, fontSize: '9.5px', padding: '1px 7px', background: '#fee2e2', color: '#991b1b', border: '1.5px solid #fca5a5' }}>
                  June (You)
                </span>
              </div>

              {/* Debate Speech Bubbles */}
              {activeLeftBubble && (
                <div key={activeLeftBubble.id} className="court-debate-bubble-left">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4 }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600, color: '#0f172a', lineHeight: 1.35 }}>
                      {activeLeftBubble.text}
                    </span>
                    <span style={{ color: '#10b981', fontSize: '11px', flexShrink: 0, marginTop: -2 }}>🪄</span>
                  </div>
                </div>
              )}

              {activeRightBubble && (
                <div key={activeRightBubble.id} className="court-debate-bubble-right">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4 }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600, color: '#0f172a', lineHeight: 1.35 }}>
                      {activeRightBubble.text}
                    </span>
                    <span style={{ color: '#ef4444', fontSize: '11px', flexShrink: 0, marginTop: -2 }}>🪄</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input for debate */}
            <div className="court-showdown-chat-card">
              <Edit3 size={17} color="#8b6b4e" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Type your argument for Team Not Now..."
                value={showdownDebateChat}
                onChange={(e) => setShowdownDebateChat(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendShowdownChat();
                }}
                className="court-showdown-chat-input"
              />
              <button
                type="button"
                onClick={handleSendShowdownChat}
                className="court-showdown-send-btn"
                aria-label="Send debate chat"
              >
                <Send size={15} />
              </button>
            </div>

            {/* Betting Stakes Slider Section */}
            {!showdownStakesLocked ? (
              <div className="court-showdown-betting-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Caveat', cursive", fontSize: '18px', fontWeight: 700, color: '#2b1810', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Coins size={17} color="#d97706" /> Back Team Not Now
                  </span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12.5px', fontWeight: 700, color: '#8b1520', background: 'rgba(139,21,32,0.08)', padding: '3px 10px', borderRadius: 99, border: '1px solid rgba(139,21,32,0.2)' }}>
                    {showdownUserStake} pts (RM {(showdownUserStake * 0.5).toFixed(2)})
                  </span>
                </div>

                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#6d5241', margin: '0 0 6px', lineHeight: 1.35 }}>
                  Drag slider to stake trip points. If your team wins, your verdict sticks!
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10.5px', fontWeight: 600, color: '#8b6b4e' }}>10 pts</span>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={showdownUserStake}
                    onChange={(e) => setShowdownUserStake(Number(e.target.value))}
                    className="court-showdown-slider"
                  />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10.5px', fontWeight: 600, color: '#8b6b4e' }}>100 pts</span>
                </div>
              </div>
            ) : null}

            {/* Confirm or Locked Results */}
            {!showdownStakesLocked ? (
              <button
                type="button"
                className="court-showdown-confirm-btn-3d"
                onClick={handleConfirmShowdownStakes}
              >
                Confirm Stakes (RM {(showdownUserStake * 0.5).toFixed(2)}) →
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                {/* Court Result Card matching Image 1 exactly */}
                <div style={{
                  background: '#ffffff',
                  borderRadius: 16,
                  border: '1px solid #e2e8f0',
                  padding: '12px 14px 14px',
                  boxShadow: '0 4px 14px rgba(100,65,25,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}>
                  {/* Top Row: Title + "Court result" */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{
                        fontFamily: "'Caveat', cursive",
                        fontSize: '22px',
                        fontWeight: 700,
                        margin: 0,
                        lineHeight: 1.15,
                      }}>
                        <span style={{ color: showdownWinner === 'not-now' ? '#ef4444' : '#10b981' }}>
                          {showdownWinner === 'not-now' ? 'Team Not Now' : 'Team Go'}
                        </span>
                        <span style={{ color: '#2b1810' }}> takes the case</span>
                      </h3>
                      <div style={{
                        display: 'inline-block',
                        background: showdownWinner === 'not-now' ? '#fff1f2' : '#edfdf5',
                        color: showdownWinner === 'not-now' ? '#ef4444' : '#059669',
                        fontSize: '15px',
                        fontWeight: 700,
                        padding: '2px 10px',
                        borderRadius: 99,
                        marginTop: 4,
                        fontFamily: "'Caveat', cursive",
                      }}>
                        {showdownWinner === 'not-now'
                          ? 'Haenyeo Seafood stays off the plan'
                          : 'Haenyeo Seafood added to the plan'}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#94a3b8',
                      fontFamily: "'Inter', sans-serif",
                      marginTop: 2,
                    }}>
                      Court result
                    </span>
                  </div>

                  {/* Team Labels Row */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    fontFamily: "'Inter', sans-serif",
                    color: '#64748b',
                    marginTop: 6,
                    padding: '0 2px',
                  }}>
                    <span>Team Go</span>
                    <span>Team Not Now</span>
                  </div>

                  {/* Big Green & Red Score Blocks with VS Circle floating in center */}
                  <div style={{ position: 'relative', display: 'flex', gap: 6, alignItems: 'center' }}>
                    {/* Left: Green Team Go Block */}
                    <div style={{
                      flex: 1,
                      background: '#10b981',
                      borderRadius: '16px 6px 6px 16px',
                      padding: '12px 14px',
                      color: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1, fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}>
                        85
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 600, marginTop: 4, color: 'rgba(255,255,255,0.92)', fontFamily: "'Inter', sans-serif" }}>
                        RM 42.50
                      </span>
                    </div>

                    {/* VS Circle in Center */}
                    <div style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#f8fafc',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                      border: '2px solid #ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#64748b',
                      zIndex: 3,
                      textTransform: 'lowercase',
                      fontFamily: "'Inter', sans-serif",
                    }}>
                      vs
                    </div>

                    {/* Right: Red Team Not Now Block */}
                    <div style={{
                      flex: 1,
                      background: '#ff4d4f',
                      borderRadius: '6px 16px 16px 6px',
                      padding: '12px 14px',
                      color: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1, fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}>
                        {45 + showdownUserStake}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 600, marginTop: 4, color: 'rgba(255,255,255,0.92)', fontFamily: "'Inter', sans-serif" }}>
                        RM {((45 + showdownUserStake) * 0.5).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <TornPaperButton
                  variant="ticket-blue"
                  subText="CASE 3 OF 3"
                  onClick={() => {
                    playWhoosh();
                    triggerHaptic('tap');
                    setCaseIndex(3);
                    setUserVote(null);
                    setUserReason('');
                    setComments(CASE_DEFAULT_COMMENTS[3] || CASE_DEFAULT_COMMENTS[1]);
                    setCurrentStep('proposal');
                  }}
                >
                  Proceed to Next Case
                </TornPaperButton>
              </div>
            )}
          </div>
            );
          })()}
          <MobileHomeIndicator />
        </div>
      )}

      {/* ====================================================================
          SCREEN 8: TRIP PLAN SUMMARY (JEJU ADDED! — AUTHENTIC SCRAPBOOK)
          ==================================================================== */}
      {currentStep === 'summary' && (
        <div className="court-case-chamber court-vintage-chamber">
          <header className="court-navbar" style={{ justifyContent: 'space-between', padding: '4px 16px' }}>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: '18px', fontWeight: 700, color: '#8b1520' }}>
              ✦ Trip Summary
            </div>
            <button
              className="court-nav-back-btn"
              onClick={() => onConfirmPlan('Jeju')}
              aria-label="Close"
              style={{
                background: 'rgba(255,253,247,0.95)',
                border: '1.5px solid #e8d5b5',
              }}
            >
              <X size={20} color="#8b1520" />
            </button>
          </header>

          {(() => {
            const foodCase = CASES.find(c => (c.type === 'restaurant' || c.type === 'food') && caseOutcomes[c.id]);
            const foodPlanned = Boolean(foodCase);
            const foodTitle = foodCase ? (foodCase.id === 2 ? 'Haenyeo Seafood' : foodCase.title) : '';

            const activitiesCase = CASES.find(c => c.type === 'activity' && caseOutcomes[c.id]);
            const activitiesPlanned = Boolean(activitiesCase);
            const activitiesTitle = activitiesCase ? activitiesCase.title : '';

            const flightsCase = CASES.find(c => c.type === 'flight' && caseOutcomes[c.id]);
            const flightsPlanned = Boolean(flightsCase);
            const flightsTitle = flightsCase ? flightsCase.title : '';

            const accommodationCase = CASES.find(c => (c.type === 'hotel' || c.type === 'accommodation') && caseOutcomes[c.id]);
            const accommodationPlanned = Boolean(accommodationCase);
            const accommodationTitle = accommodationCase ? accommodationCase.title : '';

            return (
              <div
                className="court-summary-screen"
                style={{
                  padding: '4px 18px 2px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flex: 1,
                  minHeight: 0,
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                }}
              >
                {/* Top Section: Illustration + Title + Authentic Element Sheet Checklist */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className="court-summary-illustration" style={{ margin: '0 0 4px', transform: 'scale(0.92)' }}>
                    <DuolingoAirplaneSquad size={190} />
                  </div>

                  <h2 style={{ fontFamily: "'Caveat', cursive", fontSize: '32px', fontWeight: 700, color: '#8b1520', margin: 0, lineHeight: 1.0 }}>
                    Jeju added! ✦
                  </h2>
                  <p style={{ fontFamily: "'Caveat', cursive", fontSize: '15px', color: '#7a5840', margin: '2px 0 8px', fontWeight: 600 }}>
                    It's official. Jeju is in our trip plan!
                  </p>

                  {/* Authentic Checklist Card matching bottom-right of Element Sheet (Image 3) */}
                  <div
                    style={{
                      width: '100%',
                      background: '#fffdf7',
                      border: '1.5px solid #e8d5b5',
                      borderRadius: 16,
                      boxShadow: '0 6px 18px rgba(100,65,25,0.1)',
                      padding: '10px 14px',
                      boxSizing: 'border-box',
                      position: 'relative',
                    }}
                  >
                    {/* Header with Sun Doodle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderBottom: '1px dashed #e8d5b5', paddingBottom: 5 }}>
                      <div style={{ fontFamily: "'Caveat', cursive", fontSize: '22px', fontWeight: 700, color: '#8b1520', textDecoration: 'underline' }}>
                        Trip Checklist
                      </div>
                      <span style={{ fontSize: '22px', color: '#f59e0b' }}>☼</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {/* Flights */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '18px', fontFamily: "'Caveat', cursive" }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: flightsPlanned ? '#059669' : '#a88960', fontSize: '20px', fontWeight: 700 }}>
                            {flightsPlanned ? '☑' : '☐'}
                          </span>
                          <span style={{ fontWeight: 700, color: '#2b1810' }}>Flights</span>
                        </div>
                        <span style={{ color: flightsPlanned ? '#059669' : '#8b6b4e', fontWeight: 700, fontSize: '17px' }}>
                          {flightsPlanned ? flightsTitle : 'Pending'}
                        </span>
                      </div>

                      {/* Accommodation */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '18px', fontFamily: "'Caveat', cursive" }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: accommodationPlanned ? '#059669' : '#a88960', fontSize: '20px', fontWeight: 700 }}>
                            {accommodationPlanned ? '☑' : '☐'}
                          </span>
                          <span style={{ fontWeight: 700, color: '#2b1810' }}>Accommodation</span>
                        </div>
                        <span style={{ color: accommodationPlanned ? '#059669' : '#8b6b4e', fontWeight: 700, fontSize: '17px' }}>
                          {accommodationPlanned ? accommodationTitle : 'Pending'}
                        </span>
                      </div>

                      {/* Activities */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '18px', fontFamily: "'Caveat', cursive" }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: activitiesPlanned ? '#059669' : '#a88960', fontSize: '20px', fontWeight: 700 }}>
                            {activitiesPlanned ? '☑' : '☐'}
                          </span>
                          <span style={{ fontWeight: 700, color: '#2b1810' }}>Activities</span>
                        </div>
                        <span style={{ color: activitiesPlanned ? '#059669' : '#8b6b4e', fontWeight: 700, fontSize: '17px' }}>
                          {activitiesPlanned ? activitiesTitle : 'Pending'}
                        </span>
                      </div>

                      {/* Food */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '18px', fontFamily: "'Caveat', cursive" }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: foodPlanned ? '#059669' : '#a88960', fontSize: '20px', fontWeight: 700 }}>
                            {foodPlanned ? '☑' : '☐'}
                          </span>
                          <span style={{ fontWeight: 700, color: '#2b1810' }}>Local Food</span>
                        </div>
                        <span style={{ color: foodPlanned ? '#059669' : '#8b6b4e', fontWeight: 700, fontSize: '17px' }}>
                          {foodPlanned ? foodTitle : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cute Note: Small Steps Big Adventures */}
                  <div
                    style={{
                      marginTop: 8,
                      background: 'rgba(149,187,234,0.25)',
                      border: '1px solid rgba(74,123,168,0.3)',
                      borderRadius: 12,
                      padding: '6px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>🐻</span>
                    <span style={{ fontFamily: "'Caveat', cursive", fontSize: '16px', fontWeight: 700, color: '#1a4a82' }}>
                      Small steps, big adventures! Ready for takeoff! ♡
                    </span>
                  </div>
                </div>

                {/* Bottom Action Group: Ticket-Style CTA (Start Journey) */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8, paddingTop: 4 }}>
                  <TornPaperButton
                    variant="ticket"
                    onClick={() => {
                      playVictoryFanfare();
                      triggerHaptic('victory');
                      onConfirmPlan('Jeju');
                    }}
                  >
                    Start Journey
                  </TornPaperButton>
                  <MobileHomeIndicator />
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
