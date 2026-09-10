import React, { useState } from 'react';
import {
  CourtCharacter,
  type CharacterId,
  type CharacterPose,
} from './CourtCharacter';
import { playPop, playVoteChime, playVictoryFanfare, triggerHaptic } from './courtSoundAndHaptics';
import { Check, X, Sparkles, RefreshCw, Hand, Brain, ChevronLeft } from 'lucide-react';
import { MobileStatusBar, MobileHomeIndicator } from './TravelCourtCaseFlow';
import './court-styles.css';

const CHARACTERS: { id: CharacterId; name: string; title: string; desc: string }[] = [
  { id: 'judge', name: 'The Judge', title: 'Chief Magistrate', desc: 'Robed judge holding the wooden gavel. Gives thumbs up with green paddle.' },
  { id: 'boy_yellow', name: 'Hawaiian Boy', title: 'Trendy Traveler', desc: 'Curly hair with dark sunglasses and floral shirt. Raises voting paddles.' },
  { id: 'boy_green', name: 'Green Hoodie Boy', title: 'Adventure Guide', desc: 'Sporty boy in green cap and hoodie. Friendly wave and celebration jump.' },
  { id: 'girl_redhat', name: 'Red Hat Girl', title: 'Active Explorer', desc: 'Red bucket hat, red jacket tied at waist. Winking smile and stop gestures.' },
  { id: 'girl_blonde', name: 'Blonde Girl', title: 'Trip Planner', desc: 'Wavy golden hair and lilac sweater. Ponders route ideas and cheers joyfully.' },
];

export function CourtCharacterPlayground({ onBack }: { onBack: () => void }) {
  const [selectedChar, setSelectedChar] = useState<CharacterId>('judge');
  const [currentPose, setCurrentPose] = useState<CharacterPose>('idle');
  const [showAllGrid, setShowAllGrid] = useState<boolean>(false);

  const handleSetPose = (pose: CharacterPose) => {
    setCurrentPose(pose);
    if (pose === 'correct') {
      playVoteChime(true);
      triggerHaptic('vote');
    } else if (pose === 'wrong') {
      playVoteChime(false);
      triggerHaptic('tap');
    } else if (pose === 'celebrate') {
      playVictoryFanfare();
      triggerHaptic('vote');
    } else {
      playPop();
      triggerHaptic('tap');
    }
  };

  const currentCharInfo = CHARACTERS.find((c) => c.id === selectedChar) || CHARACTERS[0];

  return (
    <div className="court-phone-container" style={{ background: '#f8fafc' }}>
      <MobileStatusBar />
      {/* Top Navbar */}
      <header className="court-navbar">
        <button className="court-nav-back-btn" onClick={onBack} aria-label="Back">
          <ChevronLeft size={24} />
        </button>
        <div className="court-nav-title-group" style={{ alignItems: 'center' }}>
          <h1 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
            Duolingo Character Library
          </h1>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            6-Pose Sprite & Physics Testing
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowAllGrid(!showAllGrid)}
          style={{
            background: showAllGrid ? '#1877f2' : '#e2e8f0',
            color: showAllGrid ? '#fff' : '#475569',
            border: 'none',
            borderRadius: 8,
            padding: '5px 10px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {showAllGrid ? 'Single View' : 'All Characters'}
        </button>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px' }}>
        {showAllGrid ? (
          /* Grid View: All 5 characters side by side */
          <div>
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '15px', color: '#0f172a' }}>
                Current State: <span style={{ color: '#1877f2' }}>{currentPose}</span>
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                All 5 characters retain 100% authentic artist-drawn quality.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {CHARACTERS.map((char) => (
                <div
                  key={char.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: 16,
                    padding: '12px 8px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <CourtCharacter
                    character={char.id}
                    status={currentPose}
                    size={110}
                    autoBlink={currentPose === 'idle'}
                  />
                  <b style={{ fontSize: '13px', color: '#0f172a', marginTop: 6 }}>{char.name}</b>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{char.title}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Single Interactive Stage */
          <div>
            {/* Character Selector Pills */}
            <div
              style={{
                display: 'flex',
                gap: 6,
                overflowX: 'auto',
                paddingBottom: 8,
                marginBottom: 12,
              }}
            >
              {CHARACTERS.map((char) => {
                const isSel = char.id === selectedChar;
                return (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => {
                      setSelectedChar(char.id);
                      playPop();
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 99,
                      border: isSel ? '2px solid #1877f2' : '1px solid #cbd5e1',
                      background: isSel ? '#e8f3ff' : '#ffffff',
                      color: isSel ? '#1877f2' : '#475569',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {char.name}
                  </button>
                );
              })}
            </div>

            {/* Character Showcase Stage */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: 24,
                padding: '24px 16px 16px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                position: 'relative',
              }}
            >
              {/* State Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  padding: '3px 10px',
                  borderRadius: 99,
                  fontSize: '11px',
                  fontWeight: 800,
                  background:
                    currentPose === 'correct'
                      ? '#edfdf5'
                      : currentPose === 'wrong'
                      ? '#fef3f2'
                      : currentPose === 'celebrate'
                      ? '#fef08a'
                      : '#f1f5f9',
                  color:
                    currentPose === 'correct'
                      ? '#12b76a'
                      : currentPose === 'wrong'
                      ? '#f04438'
                      : currentPose === 'celebrate'
                      ? '#ca8a04'
                      : '#475569',
                }}
              >
                State: {currentPose}
              </div>

              {/* The Live Duolingo Animated Character */}
              <CourtCharacter
                character={selectedChar}
                status={currentPose}
                size={180}
                autoBlink={currentPose === 'idle'}
              />

              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <h2 style={{ margin: '0 0 4px', fontSize: '18px', color: '#0f172a' }}>
                  {currentCharInfo.name}
                </h2>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  {currentCharInfo.desc}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 6-State Interactive Triggers */}
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: '#334155',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>Trigger Duolingo 6-State Physics:</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleSetPose('correct')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 14px',
                borderRadius: 14,
                border: 'none',
                background: '#12b76a',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '13px',
                boxShadow: '0 4px 0 #027a48',
                cursor: 'pointer',
              }}
            >
              <Check size={18} strokeWidth={3} />
              Vote Yes (Green)
            </button>

            <button
              type="button"
              onClick={() => handleSetPose('wrong')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 14px',
                borderRadius: 14,
                border: 'none',
                background: '#f04438',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '13px',
                boxShadow: '0 4px 0 #b42318',
                cursor: 'pointer',
              }}
            >
              <X size={18} strokeWidth={3} />
              Vote No (Red)
            </button>

            <button
              type="button"
              onClick={() => handleSetPose('celebrate')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 14px',
                borderRadius: 14,
                border: 'none',
                background: '#f59e0b',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '13px',
                boxShadow: '0 4px 0 #b45309',
                cursor: 'pointer',
              }}
            >
              <Sparkles size={18} />
              Victory Cheer
            </button>

            <button
              type="button"
              onClick={() => handleSetPose('idle')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 14px',
                borderRadius: 14,
                border: 'none',
                background: '#1877f2',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '13px',
                boxShadow: '0 4px 0 #0f62d1',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={18} />
              Idle Breathing
            </button>

            <button
              type="button"
              onClick={() => handleSetPose('action')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 14,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontWeight: 700,
                fontSize: '13px',
                boxShadow: '0 2px 0 #cbd5e1',
                cursor: 'pointer',
              }}
            >
              <Hand size={18} />
              Action Gesture
            </button>

            <button
              type="button"
              onClick={() => handleSetPose('thinking')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 14,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontWeight: 700,
                fontSize: '13px',
                boxShadow: '0 2px 0 #cbd5e1',
                cursor: 'pointer',
              }}
            >
              <Brain size={18} />
              Pondering / Think
            </button>
          </div>
        </div>
      </div>
      <MobileHomeIndicator />
    </div>
  );
}
