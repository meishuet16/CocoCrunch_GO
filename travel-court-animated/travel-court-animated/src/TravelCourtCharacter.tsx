import React from 'react';
import './travel-court.css';

export type CharacterVariant =
  | 'judge'
  | 'green'
  | 'coral'
  | 'blue'
  | 'purple'
  | 'yellow'
  | 'navy';

export type CharacterState =
  | 'idle'
  | 'support'
  | 'objection'
  | 'thinking'
  | 'celebrate';

export type VoteValue = 'yes' | 'no' | null;

export interface TravelCourtCharacterProps {
  variant: CharacterVariant;
  state?: CharacterState;
  vote?: VoteValue;
  size?: number;
  label?: string;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
  blinkDelay?: number;
}

const palettes = {
  judge:  { skin:'#F4B58E', hair:'#2A2630', top:'#20242E', accent:'#D99743', lower:'#20242E' },
  green:  { skin:'#D18B5B', hair:'#22212A', top:'#26A269', accent:'#F7C843', lower:'#173F36' },
  coral:  { skin:'#F3B997', hair:'#C93F72', top:'#6A46B9', accent:'#FF5B6E', lower:'#F4EEE5' },
  blue:   { skin:'#F3B28F', hair:'#252934', top:'#1677FF', accent:'#0B2B6B', lower:'#263D67' },
  purple: { skin:'#E9B290', hair:'#6C4BD4', top:'#2FBF71', accent:'#6C4BD4', lower:'#F5F0E6' },
  yellow: { skin:'#9B5E3B', hair:'#22212A', top:'#F4B83F', accent:'#0E7C66', lower:'#1D73CE' },
  navy:   { skin:'#E5A37E', hair:'#132C4F', top:'#133C7B', accent:'#FF5A4F', lower:'#20375C' },
} as const;

function Eye({x, delay}:{x:number; delay:number}) {
  return (
    <g className="tc-eye" style={{ ['--blink-delay' as any]: `${delay}s` }}>
      <ellipse cx={x} cy="67" rx="6.4" ry="8.6" fill="#172036" />
      <circle cx={x+2.2} cy="64.5" r="1.7" fill="white" opacity="0.9" />
    </g>
  );
}

function VoteSign({vote}:{vote:VoteValue}) {
  if (!vote) return null;
  const yes = vote === 'yes';
  return (
    <g className={`tc-vote-sign ${yes ? 'is-yes' : 'is-no'}`}>
      <rect x="149" y="68" width="48" height="48" rx="24" fill={yes ? '#24B566' : '#FF525D'} />
      {yes ? (
        <path d="M162 91l8 8 15-19" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M164 82l18 18M182 82l-18 18" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" />
      )}
      <rect x="169" y="115" width="8" height="26" rx="4" fill="#6B4A2E" />
    </g>
  );
}

function Judge({state, vote, blinkDelay}:{state:CharacterState; vote:VoteValue; blinkDelay:number}) {
  const p = palettes.judge;
  return (
    <svg viewBox="0 0 220 220" className={`tc-character tc-${state} tc-judge`} role="img" aria-label="Travel Court judge">
      <g className="tc-body-wrap">
        <ellipse cx="108" cy="202" rx="65" ry="8" fill="#0B2B6B" opacity="0.08"/>
        <g className="tc-torso">
          <path d="M67 125c7-19 26-28 43-28 20 0 40 9 46 28l6 64H60z" fill={p.top}/>
          <path d="M97 104h26l-6 24h-14z" fill="white"/>
          <path d="M104 104h13l-7 17z" fill="#0B2B6B"/>
        </g>
        <g className="tc-head">
          <circle cx="110" cy="72" r="42" fill={p.skin}/>
          <path d="M72 68c-3-31 18-52 41-50 26-2 49 20 43 51-8-9-17-16-25-20-8 12-28 18-59 19z" fill="#F2EEE8"/>
          <path d="M80 45c-8-15 7-27 17-16M141 41c9-14-5-28-16-17" fill="none" stroke="#F2EEE8" strokeWidth="15" strokeLinecap="round"/>
          <Eye x={96} delay={blinkDelay}/><Eye x={124} delay={blinkDelay+0.12}/>
          <path d="M103 82c5 5 11 5 16 0" fill="none" stroke="#A54E40" strokeWidth="4" strokeLinecap="round"/>
          <path d="M89 91c7 15 36 16 43 0-8 4-14 6-21 6s-14-2-22-6z" fill="white" opacity="0.95"/>
        </g>
        <g className="tc-left-arm"><path d="M71 128c-17 8-25 26-18 44 4 11 14 13 22 4l18-24" fill={p.top}/></g>
        <g className="tc-right-arm">
          <path d="M151 127c18 4 30 19 31 38 1 11-9 16-18 10l-22-18" fill={p.top}/>
          <g className="tc-gavel">
            <rect x="170" y="96" width="8" height="42" rx="4" fill="#7A4A2A" transform="rotate(-25 174 117)"/>
            <rect x="164" y="88" width="31" height="17" rx="6" fill="#A96936" transform="rotate(-25 180 97)"/>
          </g>
        </g>
        <rect x="47" y="176" width="126" height="23" rx="8" fill="#8D542D"/>
        <rect x="61" y="182" width="98" height="31" rx="5" fill="#A96936"/>
        <circle cx="110" cy="194" r="9" fill="#E7B858"/><path d="M105 194h10M110 189v10" stroke="#8D542D" strokeWidth="2"/>
      </g>
      <VoteSign vote={vote}/>
    </svg>
  );
}

function Traveler({variant, state, vote, blinkDelay}:{variant:Exclude<CharacterVariant,'judge'>;state:CharacterState;vote:VoteValue;blinkDelay:number}) {
  const p = palettes[variant];
  const hairShape = variant === 'yellow'
    ? 'M68 72c-3-33 23-52 47-47 19 4 37 20 36 46-12-8-22-13-32-16-8 12-25 18-51 17z'
    : variant === 'coral'
    ? 'M66 70c0-31 19-49 44-49 26 0 45 20 45 49-11-9-20-15-29-17-12 11-31 17-60 17z'
    : variant === 'purple'
    ? 'M67 71c-1-30 18-48 43-48 29 0 48 21 45 51-9-10-18-17-28-19-10 11-29 16-60 16z'
    : 'M70 71c-2-28 16-47 40-47 26 0 45 20 44 48-12-10-21-16-31-18-10 12-27 17-53 17z';

  return (
    <svg viewBox="0 0 220 220" className={`tc-character tc-${state} tc-${variant}`} role="img" aria-label={`${variant} traveler`}>
      <g className="tc-body-wrap">
        <ellipse cx="110" cy="205" rx="52" ry="7" fill="#0B2B6B" opacity="0.07"/>
        <g className="tc-legs">
          <rect x="82" y="151" width="27" height="45" rx="13" fill={p.lower}/>
          <rect x="114" y="151" width="27" height="45" rx="13" fill={p.lower}/>
          <rect x="76" y="188" width="40" height="15" rx="8" fill="#F7F2E8"/>
          <rect x="108" y="188" width="40" height="15" rx="8" fill="#F7F2E8"/>
        </g>
        <g className="tc-torso">
          <rect x="72" y="105" width="76" height="64" rx="27" fill={p.top}/>
          <path d="M79 121c-12 4-21 14-22 29-1 10 8 14 17 8l18-14" fill={p.top}/>
          <path d="M141 121c12 4 21 14 22 29 1 10-8 14-17 8l-18-14" fill={p.top}/>
          <path d="M86 110l-8 47" stroke={p.accent} strokeWidth="7" strokeLinecap="round" opacity="0.85"/>
          <path d="M134 110l8 47" stroke={p.accent} strokeWidth="7" strokeLinecap="round" opacity="0.85"/>
        </g>
        <g className="tc-head">
          <circle cx="110" cy="70" r="39" fill={p.skin}/>
          <path d={hairShape} fill={p.hair}/>
          {variant === 'purple' && <g><circle cx="92" cy="68" r="14" fill="none" stroke="#252A43" strokeWidth="4"/><circle cx="126" cy="68" r="14" fill="none" stroke="#252A43" strokeWidth="4"/><path d="M106 68h6" stroke="#252A43" strokeWidth="4"/></g>}
          <Eye x={97} delay={blinkDelay}/><Eye x={123} delay={blinkDelay+0.11}/>
          <path d="M103 84c5 4 10 4 15 0" fill="none" stroke="#A74A45" strokeWidth="4" strokeLinecap="round"/>
        </g>
        {variant === 'blue' && <path d="M78 40c8-16 30-24 50-16 10 4 17 10 22 17-20-4-43-5-72-1z" fill="#1677FF"/>}
        {variant === 'yellow' && <rect x="81" y="30" width="57" height="8" rx="4" fill="#F7C843" transform="rotate(-8 110 34)"/>}
        <g className="tc-left-arm"><circle cx="63" cy="150" r="11" fill={p.skin}/></g>
        <g className="tc-right-arm"><circle cx="157" cy="150" r="11" fill={p.skin}/></g>
        <g className="tc-thinking-hand"><circle cx="139" cy="87" r="9" fill={p.skin}/></g>
      </g>
      <VoteSign vote={vote}/>
      <g className="tc-sparkles" fill={p.accent}><circle cx="42" cy="84" r="4"/><circle cx="176" cy="54" r="3"/><circle cx="181" cy="113" r="4"/></g>
    </svg>
  );
}

export function TravelCourtCharacter({
  variant,
  state='idle',
  vote=null,
  size=120,
  label,
  onClick,
  selected=false,
  className='',
  blinkDelay=0,
}:TravelCourtCharacterProps) {
  const content = variant === 'judge'
    ? <Judge state={state} vote={vote} blinkDelay={blinkDelay}/>
    : <Traveler variant={variant} state={state} vote={vote} blinkDelay={blinkDelay}/>;

  return (
    <button
      type="button"
      className={`tc-character-button ${selected ? 'is-selected' : ''} ${className}`}
      style={{ width:size, minWidth:size }}
      onClick={onClick}
      aria-label={label || variant}
    >
      {content}
      {label && <span className="tc-character-label">{label}</span>}
    </button>
  );
}
