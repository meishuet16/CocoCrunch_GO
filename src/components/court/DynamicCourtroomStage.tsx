import React, { useState } from 'react';
import { TravelCourtCharacter, type CharacterVariant } from './TravelCourtCharacter';
import { playGavelStrike, playPop, triggerHaptic, triggerScreenShake } from './courtSoundAndHaptics';

export interface DynamicCourtMember {
  id: string;
  name: string;
  variant: CharacterVariant;
  avatarColor: string;
  team?: 'beach' | 'bbq' | 'left' | 'right';
  statusBadgeColor?: string;
  speech?: string;
}

export interface DynamicCourtroomStageProps {
  members: DynamicCourtMember[];
  onMemberClick?: (member: DynamicCourtMember) => void;
  onCourtClick?: () => void;
}

export function DynamicCourtroomStage({
  members,
  onMemberClick,
  onCourtClick,
}: DynamicCourtroomStageProps) {
  const [judgeQuote, setJudgeQuote] = useState<string | null>(null);
  const [activeSpeechMember, setActiveSpeechMember] = useState<string | null>(null);
  const [clashSpark, setClashSpark] = useState(false);

  // Divide members between Left and Right Counsel Desks
  const leftMembers: DynamicCourtMember[] = [];
  const rightMembers: DynamicCourtMember[] = [];

  members.forEach((m, idx) => {
    if (m.team === 'beach' || m.team === 'left') {
      leftMembers.push(m);
    } else if (m.team === 'bbq' || m.team === 'right') {
      rightMembers.push(m);
    } else {
      if (idx % 2 === 0) {
        leftMembers.push(m);
      } else {
        rightMembers.push(m);
      }
    }
  });

  const handleJudgeClick = () => {
    playGavelStrike();
    triggerHaptic('gavel');
    triggerScreenShake();
    setJudgeQuote('Order in the court! ⚖️');
    setTimeout(() => {
      setJudgeQuote(null);
    }, 2400);
  };

  const triggerCourtPulse = () => {
    playPop();
    triggerHaptic('tap');
    setClashSpark(true);
    setTimeout(() => setClashSpark(false), 700);
    onCourtClick?.();
  };

  const handleMemberTap = (m: DynamicCourtMember) => {
    playPop();
    triggerHaptic('tap');
    setActiveSpeechMember(m.id);
    onMemberClick?.(m);
    setTimeout(() => {
      setActiveSpeechMember((curr) => (curr === m.id ? null : curr));
    }, 2800);
  };

  // =========================================================================
  // Member Slot Positioning System
  // - Background image: Courtroom with compact horizontal tables moved inward,
  //   no chairs, clean parquet floors.
  // - Front row counsel: Characters stand comfortably separated side-by-side
  //   behind their tables so they never block each other ("人物站分开点不要挡住对方"):
  //     - Left table: Alex (x: 74) & Mavis (x: 140) [66px apart, 0% overlap!]
  //     - Right table: June (x: 272) & Ken (x: 338) [66px apart, 0% overlap!]
  // - Dynamically added members queue into spacious outer aisles (x: 28 and x: 384)
  // =========================================================================
  const getLeftSlot = (index: number) => {
    const slots = [
      { x: 80, y: 210, size: 60, zIndex: 6, isBack: false }, // 0: Alex (Top of left desk - completely clear!)
      { x: 36, y: 285, size: 62, zIndex: 7, isBack: false }, // 1: Mavis (Outer front left floor - separated by 44px, 0% overlap!)
      { x: 36, y: 210, size: 48, zIndex: 4, isBack: true },  // 2: 3rd member (Outer back left floor)
      { x: 80, y: 285, size: 52, zIndex: 5, isBack: true },  // 3: 4th member (Lower desk aisle)
      { x: 16, y: 240, size: 42, zIndex: 3, isBack: true },  // 4: 5th member (Outer wing)
      { x: 60, y: 140, size: 38, zIndex: 2, isBack: true },  // 5: 6th member (Upper gallery)
    ];
    return slots[index] || slots[slots.length - 1];
  };

  const getRightSlot = (index: number) => {
    const slots = [
      { x: 278, y: 210, size: 60, zIndex: 6, isBack: false }, // 0: Ken (Top of right desk - exactly mirrors Alex at 80px!)
      { x: 322, y: 285, size: 62, zIndex: 7, isBack: false }, // 1: June (Outer front right floor - exactly mirrors Mavis at 36px!)
      { x: 322, y: 210, size: 48, zIndex: 4, isBack: true },  // 2: 3rd member (Outer back right floor)
      { x: 278, y: 285, size: 52, zIndex: 5, isBack: true },  // 3: 4th member (Lower desk aisle)
      { x: 342, y: 240, size: 42, zIndex: 3, isBack: true },  // 4: 5th member (Outer wing)
      { x: 298, y: 140, size: 38, zIndex: 2, isBack: true },  // 5: 6th member (Upper gallery)
    ];
    return slots[index] || slots[slots.length - 1];
  };

  return (
    <div
      className="court-stage-container-wrap"
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '0',
        userSelect: 'none',
        position: 'relative',
      }}
    >
      {/* ===================================================================
          HIGH-DESIGN COURTROOM ASSEMBLY STAGE (358px x 350px for 390x844)
          - Background: Rendered 3D Pixar Courtroom Scene (court_stage_bg.jpg)
            Includes: Arched Window, Fluted Marble Columns, Royal Blue Banners,
            Elevated Judge with Gavel, and 2 Inward Vertical Wooden Desks!
            (Clean background: tables only, no chairs, spacious aisles)
          - Foreground: Dynamic interactive character avatars, completely free,
            separated, and unblocked!
          =================================================================== */}
      <div
        className="court-horseshoe-stage"
        onClick={triggerCourtPulse}
        style={{
          width: '100%',
          maxWidth: 358,
          height: 350,
          borderRadius: 22,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12), inset 0 0 0 1.5px rgba(255, 255, 255, 0.9)',
          border: '1px solid #cbd5e1',
          flexShrink: 0,
          cursor: 'pointer',
          background: '#dbeafe',
        }}
      >
        {/* Authentic 3D Rendered Courtroom Background Image (Vertical Inward Desks, NO Chairs) */}
        <img
          src="/characters/court_stage_bg.jpg?v=vertical_no_chairs_v6"
          onError={(e) => {
            // Fallback path
            (e.currentTarget as HTMLImageElement).src = '/court_stage_bg.jpg?v=vertical_no_chairs_v6';
          }}
          alt="Courtroom Stage"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
          draggable={false}
        />

        {/* ===================================================================
            TOP CENTER INTERACTIVE JUDGE CLICK ZONE
            Clicking the judge strikes gavel with haptics & screen shake!
            =================================================================== */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleJudgeClick();
          }}
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 130,
            height: 90,
            cursor: 'pointer',
            zIndex: 15,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
          title="Click the Judge to strike gavel!"
        >
          {/* Judge Speech Bubble on Tap */}
          {judgeQuote && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                background: '#0f172a',
                color: '#ffffff',
                padding: '4px 14px',
                borderRadius: 99,
                fontSize: '11px',
                fontWeight: 800,
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                animation: 'court-slide-up 0.18s ease-out',
                whiteSpace: 'nowrap',
                zIndex: 35,
              }}
            >
              {judgeQuote}
            </div>
          )}
        </div>

        {/* Dynamic Comic Spark on Court Floor Tap */}
        {clashSpark && (
          <div
            style={{
              position: 'absolute',
              top: 128,
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 25,
              pointerEvents: 'none',
              animation: 'court-slide-up 0.18s ease-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontSize: '26px', filter: 'drop-shadow(0 0 8px #facc15)' }}>⚡</span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 900,
                color: '#ffffff',
                background: '#0f172a',
                padding: '4px 14px',
                borderRadius: 99,
                boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
              }}
            >
              ORDER IN COURT! ⚖️
            </span>
            <span style={{ fontSize: '26px', filter: 'drop-shadow(0 0 8px #facc15)' }}>⚡</span>
          </div>
        )}

        {/* ===================================================================
            LEFT TEAM MEMBERS (Alex & Mavis - CLOSE TO VERTICAL DESK!)
            - Alex is upper left, standing directly alongside the vertical desk
            - Mavis is lower left, standing directly alongside the vertical desk ("mavis靠近桌子")!
            - Dynamically added members queue into the back row!
            =================================================================== */}
        {leftMembers.map((member, index) => {
          const slot = getLeftSlot(index);
          const isAlex = member.id === 'alex';
          const isMavis = member.id === 'mavis';
          const showSpeech = activeSpeechMember === member.id;
          const speechText = member.speech || (isAlex ? 'Ready! ✨' : isMavis ? 'Here! 👋' : 'Present! 🙋');
          const isObjection = speechText.toLowerCase().includes('objection');

          return (
            <div
              key={member.id}
              onClick={(e) => {
                e.stopPropagation();
                handleMemberTap(member);
              }}
              style={{
                position: 'absolute',
                left: slot.x,
                top: slot.y - slot.size,
                transform: 'translateX(-50%)',
                zIndex: slot.zIndex,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'all 0.25s ease-out',
                opacity: slot.isBack ? 0.94 : 1,
              }}
              title={`${member.name}`}
            >
              {/* Speech Bubble / Objection Burst on Tap */}
              {showSpeech && (
                isObjection ? (
                  <div
                    style={{
                      position: 'absolute',
                      top: -30,
                      background: '#ef4444',
                      color: '#ffffff',
                      padding: '3px 10px',
                      borderRadius: 8,
                      fontSize: '11px',
                      fontWeight: 900,
                      letterSpacing: '0.04em',
                      boxShadow: '0 4px 14px rgba(239, 68, 68, 0.45)',
                      border: '2px solid #ffffff',
                      animation: 'court-slide-up 0.15s ease',
                      zIndex: 40,
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>💥</span>
                    <span>OBJECTION!</span>
                  </div>
                ) : (
                  <div
                    style={{
                      position: 'absolute',
                      top: -24,
                      background: '#fefcf6',
                      color: '#1e293b',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: 14,
                      padding: '2px 8px',
                      fontSize: '9.5px',
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      animation: 'court-slide-up 0.15s ease',
                      zIndex: 40,
                    }}
                  >
                    {speechText}
                  </div>
                )
              )}

              {/* Character Sprite: NO bouncing/jumping! */}
              <TravelCourtCharacter
                variant={member.variant}
                state={isAlex ? 'action' : isMavis ? 'support' : 'idle'}
                size={slot.size}
                animated={false}
              />

              {/* Name Tag Pill */}
              <span
                style={{
                  fontSize: slot.isBack ? '9.5px' : '10.5px',
                  fontWeight: 800,
                  color: '#1e293b',
                  marginTop: -3,
                  background: 'rgba(255, 255, 255, 0.96)',
                  padding: '1px 7px',
                  borderRadius: 99,
                  border: '1px solid #cbd5e1',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
              >
                {member.name}
              </span>
            </div>
          );
        })}

        {/* ===================================================================
            RIGHT TEAM MEMBERS (Ken & June - CLOSE TO VERTICAL DESK!)
            - Ken is upper right, standing directly alongside the vertical desk
            - June is lower right, standing directly alongside the vertical desk ("june靠近桌子")!
            - Dynamically added members queue into the back row!
            =================================================================== */}
        {rightMembers.map((member, index) => {
          const slot = getRightSlot(index);
          const isJune = member.id === 'june';
          const isKen = member.id === 'ken';
          const showSpeech = activeSpeechMember === member.id;
          const speechText = member.speech || (isJune ? 'Objection! 💥' : isKen ? 'All set! 😎' : 'Ready! 🙋');
          const isObjection = speechText.toLowerCase().includes('objection');

          return (
            <div
              key={member.id}
              onClick={(e) => {
                e.stopPropagation();
                handleMemberTap(member);
              }}
              style={{
                position: 'absolute',
                left: slot.x,
                top: slot.y - slot.size,
                transform: 'translateX(-50%)',
                zIndex: slot.zIndex,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'all 0.25s ease-out',
                opacity: slot.isBack ? 0.94 : 1,
              }}
              title={`${member.name}`}
            >
              {/* Speech Bubble / Objection Burst on Tap */}
              {showSpeech && (
                isObjection ? (
                  <div
                    style={{
                      position: 'absolute',
                      top: -30,
                      background: '#ef4444',
                      color: '#ffffff',
                      padding: '3px 10px',
                      borderRadius: 8,
                      fontSize: '11px',
                      fontWeight: 900,
                      letterSpacing: '0.04em',
                      boxShadow: '0 4px 14px rgba(239, 68, 68, 0.45)',
                      border: '2px solid #ffffff',
                      animation: 'court-slide-up 0.15s ease',
                      zIndex: 40,
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>💥</span>
                    <span>OBJECTION!</span>
                  </div>
                ) : (
                  <div
                    style={{
                      position: 'absolute',
                      top: -24,
                      background: '#fefcf6',
                      color: '#1e293b',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: 14,
                      padding: '2px 8px',
                      fontSize: '9.5px',
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      animation: 'court-slide-up 0.15s ease',
                      zIndex: 40,
                    }}
                  >
                    {speechText}
                  </div>
                )
              )}

              {/* Character Sprite: NO bouncing/jumping! */}
              <TravelCourtCharacter
                variant={member.variant}
                state={isJune ? 'objection' : isKen ? 'action' : 'idle'}
                size={slot.size}
                animated={false}
              />

              {/* Name Tag Pill */}
              <span
                style={{
                  fontSize: slot.isBack ? '9.5px' : '10.5px',
                  fontWeight: 800,
                  color: '#1e293b',
                  marginTop: -3,
                  background: 'rgba(255, 255, 255, 0.96)',
                  padding: '1px 7px',
                  borderRadius: 99,
                  border: '1px solid #cbd5e1',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
              >
                {member.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
