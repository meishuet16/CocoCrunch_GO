import React from 'react';
import { TravelCourtCharacter, type CharacterVariant, type CharacterState } from './TravelCourtCharacter';
import { createTransparentSpriteSheet } from './CourtCharacter';
import './court-styles.css';

export type JudgeState = 'idle' | 'waving' | 'striking' | 'slumped';

export function DuolingoJudge({ state = 'idle', size = 180 }: { state?: JudgeState; size?: number }) {
  // Solemn & serious magistrate: NO jumping celebrate pose!
  const charState: CharacterState =
    state === 'striking' ? 'action' :
    state === 'waving' ? 'action' :
    state === 'slumped' ? 'thinking' : 'idle';

  return (
    <div
      className={`duo-judge-wrap ${state === 'striking' ? 'court-gavel-slamming' : ''}`}
      style={{ width: size, height: size * 0.95, display: 'inline-flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
    >
      <TravelCourtCharacter
        variant="judge"
        state={charState}
        size={size}
        blinkDelay={0.2}
      />
    </div>
  );
}

/**
 * Duolingo Judge seated behind the classical courtroom wooden bench
 * Exactly matching Image 4 (Podium with wood bevel, gold court seal, and gavel block)
 */
export function DuolingoJudgeBench({
  state = 'idle',
  size = 96,
  benchWidth = 138,
}: {
  state?: JudgeState;
  size?: number;
  benchWidth?: number;
}) {
  // Solemn, serious magistrate posture: NO celebrate, NO jumping!
  const charState: CharacterState =
    state === 'striking' ? 'action' :
    state === 'waving' ? 'action' :
    state === 'slumped' ? 'thinking' :
    'idle';

  const containerHeight = Math.round(size * 1.15) + 16;

  return (
    <div
      className="duo-judge-bench-container"
      style={{
        position: 'relative',
        width: benchWidth,
        height: containerHeight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      {/* The Judge standing solemnly behind the bench with NO jumping */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          zIndex: 1,
        }}
      >
        <TravelCourtCharacter
          variant="judge"
          state={charState}
          size={size}
          animated={false}
        />
      </div>

      {/* The Carved Mahogany Courtroom Bench / Podium */}
      <div
        className="duo-court-podium"
        style={{
          position: 'relative',
          zIndex: 3,
          width: '100%',
          height: 44,
          background: 'linear-gradient(180deg, #935a46 0%, #784433 45%, #563023 100%)',
          borderRadius: '8px 8px 4px 4px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.22), inset 0 2px 0 rgba(255,255,255,0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '1px solid #4a281d',
        }}
      >
        {/* Top wood ledge */}
        <div
          style={{
            position: 'absolute',
            top: -5,
            width: '106%',
            height: 9,
            background: '#a26651',
            borderRadius: 5,
            boxShadow: '0 2px 4px rgba(0,0,0,0.18)',
            border: '1px solid #5a3022',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 10px',
          }}
        >
          <div
            style={{
              width: 18,
              height: 4,
              background: '#5c382e',
              borderRadius: 2,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          />
        </div>

        {/* Golden Court Seal / Emblem in the center */}
        <div
          style={{
            marginTop: 8,
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #fde047 0%, #ca8a04 100%)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            border: '1.5px solid #fef08a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#713f12',
            fontSize: '11px',
            fontWeight: 900,
          }}
        >
          ⚖️
        </div>
      </div>
    </div>
  );
}

/**
 * Image 1 Main Stage: Lively Courtroom Debate with Judge, 4 Members & Comic Electric Clash
 * "激烈的4个人和法官坐在法庭然后中间电光的感觉，就是法庭的有趣的表现"
 */
export function DuolingoCourtroomClashStage({
  onClashClick,
}: {
  onClashClick?: () => void;
}) {
  const [sparkKey, setSparkKey] = React.useState(0);

  const handleStageClick = () => {
    setSparkKey(k => k + 1);
    if (onClashClick) onClashClick();
  };

  return (
    <div
      className="court-clash-stage"
      onClick={handleStageClick}
      style={{
        position: 'relative',
        width: '100%',
        height: 265,
        borderRadius: 24,
        background: 'linear-gradient(180deg, #dbeafe 0%, #eff6ff 55%, #f1f5f9 100%)',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.7), 0 8px 24px -6px rgba(15,23,42,0.08)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: 0,
        cursor: 'pointer',
      }}
      title="Tap court debate!"
    >
      {/* Background Classical Pillars & Arch */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            top: -24,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 260,
            height: 180,
            borderRadius: '130px 130px 0 0',
            border: '6px solid rgba(255,255,255,0.6)',
            background: 'radial-gradient(circle at 50% 30%, #ffffff 0%, rgba(255,255,255,0) 70%)',
          }}
        />
        {/* Left classical pillar */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 8,
            width: 16,
            height: 200,
            background: 'linear-gradient(90deg, #cbd5e1 0%, #ffffff 50%, #cbd5e1 100%)',
            borderRadius: '4px 4px 0 0',
            opacity: 0.5,
          }}
        />
        {/* Right classical pillar */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 8,
            width: 16,
            height: 200,
            background: 'linear-gradient(90deg, #cbd5e1 0%, #ffffff 50%, #cbd5e1 100%)',
            borderRadius: '4px 4px 0 0',
            opacity: 0.5,
          }}
        />
      </div>

      {/* CENTER: The Judge behind the Stately Podium - NO JUMPING, SOLEMN & DIGNIFIED */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
        }}
      >
        <DuolingoJudgeBench state="idle" size={96} benchWidth={138} />
      </div>

      {/* LEFT TEAM: Alex (green hoodie) & June (blonde) - ANCHORED LEFT, NO BOUNCING */}
      <div
        className="court-clash-team left-team"
        style={{
          position: 'absolute',
          left: 6,
          bottom: 4,
          zIndex: 4,
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        {/* Alex: Green hoodie boy in back */}
        <div style={{ zIndex: 2 }}>
          <TravelCourtCharacter
            variant="green"
            state="idle"
            size={65}
            animated={false}
          />
        </div>

        {/* June: Blonde girl in front facing center */}
        <div style={{ marginLeft: -14, marginBottom: 2, zIndex: 3 }}>
          <TravelCourtCharacter
            variant="purple"
            state="idle"
            size={64}
            animated={false}
          />
        </div>

        {/* Left Wood Witness Railing */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: -2,
            width: 96,
            height: 14,
            background: 'linear-gradient(180deg, #935a46 0%, #563023 100%)',
            borderRadius: '3px 3px 0 0',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            zIndex: 5,
          }}
        />
      </div>

      {/* RIGHT TEAM: Ken (sunglasses) & Mavis (red hat) - ANCHORED RIGHT, NO BOUNCING */}
      <div
        className="court-clash-team right-team"
        style={{
          position: 'absolute',
          right: 6,
          bottom: 4,
          zIndex: 4,
          display: 'flex',
          alignItems: 'flex-end',
          flexDirection: 'row-reverse',
        }}
      >
        {/* Ken: Sunglasses boy in back */}
        <div style={{ zIndex: 2 }}>
          <TravelCourtCharacter
            variant="blue"
            state="idle"
            size={65}
            animated={false}
          />
        </div>

        {/* Mavis: Red hat girl in front facing center */}
        <div style={{ marginRight: -14, marginBottom: 2, zIndex: 3 }}>
          <TravelCourtCharacter
            variant="coral"
            state="idle"
            size={64}
            animated={false}
          />
        </div>

        {/* Right Wood Witness Railing */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: -2,
            width: 96,
            height: 14,
            background: 'linear-gradient(180deg, #935a46 0%, #563023 100%)',
            borderRadius: '3px 3px 0 0',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            zIndex: 5,
          }}
        />
      </div>

      {/* CENTER GAP: HIGH-QUALITY CINEMATIC ANIME ELECTRIC CLASH ("有质感的电光表现") */}
      {/* Positioned strictly between Left Team and Right Team with ZERO character overlap */}
      <div
        className="duo-electric-clash-zone"
        key={sparkKey}
        style={{
          position: 'absolute',
          bottom: 26,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 5,
          width: 108,
          height: 68,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Ambient Radial Energy Field */}
        <div
          style={{
            position: 'absolute',
            width: 96,
            height: 48,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(250,204,21,0.25) 0%, rgba(56,189,248,0.18) 45%, transparent 70%)',
            filter: 'blur(4px)',
          }}
        />

        {/* High-Precision Jagged Multi-Branch Dual Lightning SVG */}
        <svg
          viewBox="0 0 110 65"
          width="106"
          height="62"
          className="duo-electric-lightning"
          style={{
            overflow: 'visible',
            filter: 'drop-shadow(0 0 6px rgba(250, 204, 21, 0.85)) drop-shadow(0 0 10px rgba(56, 189, 248, 0.8))',
          }}
        >
          <defs>
            <linearGradient id="clashGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="48%" stopColor="#ffffff" />
              <stop offset="52%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#facc15" />
            </linearGradient>
            <filter id="lightningGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Left-side cyan electric bolt surging to center (55, 32) */}
          <path
            d="M 6 32 L 18 22 L 30 38 L 42 24 L 55 32"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#lightningGlow)"
            opacity="0.9"
          />

          {/* Right-side amber electric bolt surging to center (55, 32) */}
          <path
            d="M 104 32 L 92 22 L 80 38 L 68 24 L 55 32"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#lightningGlow)"
            opacity="0.9"
          />

          {/* White-hot sharp continuous lightning core */}
          <path
            d="M 6 32 L 18 22 L 30 38 L 42 24 L 55 32 L 68 24 L 80 38 L 92 22 L 104 32"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Upper branching sparks */}
          <path
            d="M 30 38 L 38 48 L 48 42"
            fill="none"
            stroke="#67e8f9"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
          <path
            d="M 80 38 L 72 48 L 62 42"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />

          {/* Lower branching sparks */}
          <path
            d="M 42 24 L 38 14 L 46 18"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />
          <path
            d="M 68 24 L 72 14 L 64 18"
            fill="none"
            stroke="#ef4444"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />
        </svg>

        {/* Central Anime Diamond Clash Star (Cross Flare) */}
        <div
          className="duo-clash-burst"
          style={{
            position: 'absolute',
            width: 26,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* 4-pointed SVG anime impact star */}
          <svg viewBox="0 0 40 40" width="26" height="26">
            <path
              d="M 20 2 Q 20 16 34 20 Q 20 24 20 38 Q 20 24 6 20 Q 20 16 20 2 Z"
              fill="#ffffff"
              filter="drop-shadow(0 0 8px #facc15) drop-shadow(0 0 12px #38bdf8)"
            />
            <circle cx="20" cy="20" r="3.5" fill="#fbbf24" />
          </svg>
        </div>

        {/* Delicate floating sparks strictly within center gap */}
        <div
          className="duo-sparkle-1"
          style={{ position: 'absolute', top: 6, left: 16, fontSize: '10px', color: '#38bdf8' }}
        >
          ✦
        </div>
        <div
          className="duo-sparkle-2"
          style={{ position: 'absolute', bottom: 8, right: 18, fontSize: '10px', color: '#f59e0b' }}
        >
          ✦
        </div>
        <div
          className="duo-sparkle-3"
          style={{ position: 'absolute', top: 8, right: 28, fontSize: '11px', color: '#fbbf24' }}
        >
          ⚡
        </div>
      </div>

      {/* Top Speech Bubbles - Clear of Judge's head */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 8,
          background: 'rgba(255,255,255,0.95)',
          padding: '2px 8px',
          borderRadius: 99,
          fontSize: '11px',
          fontWeight: 800,
          color: '#15803d',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          border: '1px solid #bbf7d0',
          zIndex: 5,
        }}
      >
        Beach! 🏖️
      </div>
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 8,
          background: 'rgba(255,255,255,0.95)',
          padding: '2px 8px',
          borderRadius: 99,
          fontSize: '11px',
          fontWeight: 800,
          color: '#b91c1c',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          border: '1px solid #fecaca',
          zIndex: 5,
        }}
      >
        BBQ! 🍖
      </div>
    </div>
  );
}

/**
 * 4-Member Hero Squad from authentic characters
 * Includes animated Duolingo friends with the idea lightbulb and scenic sky.
 */
export function DuolingoHeroSquad() {
  return (
    <div
      className="court-hero-illustration-stage"
      style={{
        position: 'relative',
        width: '100%',
        height: 155,
        borderRadius: 18,
        background: 'linear-gradient(180deg, #bde7ff 0%, #e0f2fe 55%, #dcfce7 100%)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        padding: '0 8px 4px',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.6)',
      }}
    >
      {/* Cartoon clouds drifting */}
      <div style={{ position: 'absolute', top: 12, left: 16, opacity: 0.8 }} className="duo-cloud-drift">
        <svg width="60" height="24" viewBox="0 0 60 24" fill="white">
          <ellipse cx="20" cy="14" rx="16" ry="10" />
          <circle cx="34" cy="12" r="12" />
          <ellipse cx="44" cy="14" rx="14" ry="9" />
        </svg>
      </div>
      <div style={{ position: 'absolute', top: 22, right: 28, opacity: 0.75 }} className="duo-cloud-drift">
        <svg width="50" height="20" viewBox="0 0 50 20" fill="white">
          <ellipse cx="18" cy="12" rx="14" ry="8" />
          <circle cx="28" cy="10" r="10" />
          <ellipse cx="38" cy="12" rx="12" ry="7" />
        </svg>
      </div>

      {/* Floating Idea Lightbulb */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 6,
          background: 'rgba(255,255,255,0.92)',
          borderRadius: 99,
          padding: '2px 8px',
          boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
        }}
        className="duo-bulb-pulse"
      >
        <span style={{ fontSize: '22px', filter: 'drop-shadow(0 2px 4px rgba(245, 158, 11, 0.4))' }}>💡</span>
      </div>

      {/* 4 Authentic Traveler Friends */}
      <TravelCourtCharacter variant="coral" state="idle" size={78} />
      <TravelCourtCharacter variant="yellow" state="idle" size={80} />
      <TravelCourtCharacter variant="green" state="idle" size={78} />
      <TravelCourtCharacter variant="purple" state="thinking" size={76} />
    </div>
  );
}

/**
 * Court Amphitheater Jury Box (Screen 4 from Image 2)
 * Shows 6 animated jurors in a tiered courtroom gallery casting votes.
 */
export type JurorVoteState = {
  id: string;
  name: string;
  vote: 'go' | 'not-now' | null;
  variant?: CharacterVariant;
  avatarColor: string;
  hairColor: string;
};

export function DuolingoJuryBox({ jurors }: { jurors: JurorVoteState[] }) {
  return (
    <div className="court-jury-amphitheater" style={{ position: 'relative', width: '100%', maxWidth: 360, height: 210, margin: '10px auto 16px' }}>
      {/* Wooden tiered backdrop arches */}
      <div
        style={{
          position: 'absolute',
          left: 10,
          right: 10,
          top: 35,
          height: 70,
          background: '#8d5b4c',
          borderRadius: '35px 35px 0 0',
          boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 105,
          height: 105,
          background: '#a36e5a',
          borderRadius: '45px 45px 0 0',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.15)',
          zIndex: 3,
        }}
      />

      {/* Back Row Jurors */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          display: 'flex',
          justifyContent: 'space-around',
          padding: jurors.length <= 4 ? '0 40px' : '0 20px',
          zIndex: 2,
        }}
      >
        {(jurors.length <= 4 ? jurors.slice(2, 4) : jurors.slice(3, 6)).map((juror, idx) => {
          const charVariant: CharacterVariant = juror.variant || (['purple', 'yellow', 'navy'][idx] as CharacterVariant);
          const charState: CharacterState = juror.vote ? (juror.vote === 'go' ? 'support' : 'objection') : 'thinking';
          const voteVal = juror.vote === 'go' ? 'yes' : juror.vote === 'not-now' ? 'no' : null;

          return (
            <TravelCourtCharacter
              key={juror.id}
              variant={charVariant}
              state={charState}
              vote={voteVal}
              size={95}
              blinkDelay={(idx * 0.55) % 3}
            />
          );
        })}
      </div>

      {/* Front Row Jurors */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 75,
          display: 'flex',
          justifyContent: 'space-around',
          padding: jurors.length <= 4 ? '0 32px' : '0 12px',
          zIndex: 4,
        }}
      >
        {(jurors.length <= 4 ? jurors.slice(0, 2) : jurors.slice(0, 3)).map((juror, idx) => {
          const charVariant: CharacterVariant = juror.variant || (['green', 'coral', 'blue'][idx] as CharacterVariant);
          const charState: CharacterState = juror.vote ? (juror.vote === 'go' ? 'support' : 'objection') : 'thinking';
          const voteVal = juror.vote === 'go' ? 'yes' : juror.vote === 'not-now' ? 'no' : null;

          return (
            <TravelCourtCharacter
              key={juror.id}
              variant={charVariant}
              state={charState}
              vote={voteVal}
              size={105}
              blinkDelay={(idx * 0.7) % 3}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * Voter Girl Avatar for Screen 3 ("It's your turn! What's your vote?")
 */
export function DuolingoVoterGirl({
  size = 120,
  vote = null,
}: {
  size?: number;
  vote?: 'yes' | 'no' | null;
}) {
  const state: CharacterState = vote === 'yes' ? 'support' : vote === 'no' ? 'objection' : 'thinking';
  return (
    <div style={{ width: size, display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
      <TravelCourtCharacter
        variant="coral"
        state={state}
        vote={vote}
        size={size}
      />
    </div>
  );
}

/**
 * Airplane Squad for Screen 8 ("Jeju added! It's official. Jeju is in our trip plan!")
 * Exactly matching Image 1 & 2: Shows all 4 traveler friends (Mavis, Ken, Alex, June)
 * riding together in the blue-and-white passenger jet with floating tickets and celebration confetti!
 */
const AIRPLANE_SQUAD_CANDIDATES = [
  '/characters/airplane_squad.png',
];

export function DuolingoAirplaneSquad({ size = 260 }: { size?: number }) {
  const [candidateIdx, setCandidateIdx] = React.useState(0);
  const currentCandidate = AIRPLANE_SQUAD_CANDIDATES[candidateIdx] || AIRPLANE_SQUAD_CANDIDATES[0];
  const [imgSrc, setImgSrc] = React.useState<string>(currentCandidate);

  React.useEffect(() => {
    let active = true;
    createTransparentSpriteSheet(currentCandidate)
      .then((transparentUrl) => {
        if (active && transparentUrl) {
          setImgSrc(transparentUrl);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [currentCandidate]);

  const handleImgError = () => {
    if (candidateIdx < AIRPLANE_SQUAD_CANDIDATES.length - 1) {
      const nextIdx = candidateIdx + 1;
      setCandidateIdx(nextIdx);
      setImgSrc(AIRPLANE_SQUAD_CANDIDATES[nextIdx]);
    }
  };

  return (
    <div
      className="duo-airplane-squad-wrapper select-none"
      style={{
        width: size,
        height: Math.round(size * 0.88),
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Drifting Clouds in Background */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div className="duo-cloud-drift" style={{ position: 'absolute', top: 22, left: 10 }}>
          <div style={{ width: 44, height: 18, background: '#e2e8f0', borderRadius: 20, opacity: 0.65 }} />
        </div>
        <div className="duo-cloud-drift" style={{ position: 'absolute', top: 48, right: 12, animationDelay: '1.4s' }}>
          <div style={{ width: 38, height: 16, background: '#e2e8f0', borderRadius: 20, opacity: 0.55 }} />
        </div>
        <div className="duo-cloud-drift" style={{ position: 'absolute', bottom: 20, left: 30, animationDelay: '2.2s' }}>
          <div style={{ width: 50, height: 20, background: '#e2e8f0', borderRadius: 20, opacity: 0.6 }} />
        </div>
      </div>



      {/* Colorful Confetti Sparks & Streamers */}
      <div style={{ position: 'absolute', top: 12, right: 38, fontSize: '14px', color: '#facc15', zIndex: 3 }}>✦</div>
      <div style={{ position: 'absolute', bottom: 18, left: 24, fontSize: '13px', color: '#ec4899', zIndex: 3 }}>✦</div>
      <div style={{ position: 'absolute', top: 44, right: 18, width: 7, height: 7, borderRadius: '50%', background: '#3b82f6', zIndex: 3 }} />
      <div style={{ position: 'absolute', bottom: 44, left: 14, width: 7, height: 7, background: '#10b981', transform: 'rotate(25deg)', zIndex: 3 }} />
      <div style={{ position: 'absolute', top: 80, left: 8, width: 8, height: 4, background: '#ef4444', transform: 'rotate(-20deg)', borderRadius: 2, zIndex: 3 }} />
      <div style={{ position: 'absolute', top: 90, right: 8, width: 8, height: 4, background: '#f59e0b', transform: 'rotate(30deg)', borderRadius: 2, zIndex: 3 }} />

      {/* The 4-Character Airplane Squad Flight Stage */}
      <div
        className="duo-plane-fly"
        style={{
          width: size,
          height: Math.round(size * 0.85),
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}
      >
        <img
          src={imgSrc}
          alt="4 Duolingo friends flying together to Jeju"
          onError={handleImgError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 14px 28px rgba(15, 23, 42, 0.14))',
            pointerEvents: 'none',
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}

// Backward compatibility alias
export const DuolingoAirplaneGirl = DuolingoAirplaneSquad;

/**
 * Member mini-avatars
 */
export function MemberMiniAvatar({ name, color = '#3b82f6', size = 38 }: { name: string; color?: string; size?: number }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: size * 0.42,
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        border: '2px solid #ffffff',
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}
