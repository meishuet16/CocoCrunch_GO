import React from 'react';
import {
  CourtCharacter,
  type CharacterVariant,
  type CharacterPose,
  resolveCharacterId,
} from './CourtCharacter';
import './court-styles.css';

export type { CharacterVariant };

export type CharacterState =
  | 'idle'
  | 'support'
  | 'objection'
  | 'thinking'
  | 'celebrate'
  | 'slumped'
  | 'action';

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
  animated?: boolean;
  isAvatar?: boolean;
}

export function mapStateToPose(state: CharacterState = 'idle', vote: VoteValue = null): CharacterPose {
  if (vote === 'yes') return 'correct';
  if (vote === 'no') return 'wrong';

  switch (state) {
    case 'action':
      return 'action';
    case 'support':
      return 'correct';
    case 'objection':
      return 'wrong';
    case 'celebrate':
      return 'celebrate';
    case 'thinking':
      return 'thinking';
    case 'slumped':
      return 'wrong';
    case 'idle':
    default:
      return 'idle';
  }
}

export function TravelCourtCharacter({
  variant,
  state = 'idle',
  vote = null,
  size = 120,
  label,
  onClick,
  selected = false,
  className = '',
  animated = true,
  isAvatar = false,
}: TravelCourtCharacterProps) {
  const pose = mapStateToPose(state, vote);
  const charId = resolveCharacterId(variant);

  if (isAvatar) {
    return (
      <CourtCharacter
        character={charId}
        status={pose}
        size={size}
        isAvatar
        animated={false}
        className={className}
        onClick={onClick}
        title={label || charId}
      />
    );
  }

  return (
    <div
      className={`tc-character-wrapper ${selected ? 'is-selected' : ''} ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={label || charId}
    >
      <CourtCharacter
        character={charId}
        status={pose}
        size={size}
        autoBlink={state === 'idle' && !vote && animated}
        animated={animated}
      />
      {label && <span className="tc-character-label">{label}</span>}
    </div>
  );
}
