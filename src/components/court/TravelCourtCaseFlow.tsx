import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, Check, X, Clock, Heart, Send, Plane, Home,
  MapPin, Utensils, ArrowRight, Plus, MessageCircle
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

export function TravelCourtCaseFlow({
  initialStep = 'lobby',
  onBackToIdeas,
  onGoToIdeas,
  onClose,
  onConfirmPlan,
  courtMembers: externalMembers,
  onUpdateMembers,
}: TravelCourtCaseFlowProps) {
  const [currentStep, setCurrentStep] = useState<CourtStep>(initialStep);

  useEffect(() => {
    setCurrentStep(initialStep);
  }, [initialStep]);

  const [caseIndex, setCaseIndex] = useState(1); // 1 of 3, 2 of 3, 3 of 3
  const [cardExiting, setCardExiting] = useState(false);

  // The 3 travel discussion cards
  const CASES = [
    {
      id: 1,
      type: 'destination',
      typeLabel: '📍 Destination',
      title: 'Jeju Island',
      selectedTitle: 'Jeju Island selected',
      verdictTitle: "We're going to Jeju!",
      description: 'Clear turquoise water, volcanic landscapes, delicious food, and so much more!',
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

  // Discussion comments state
  const [segmentedTab, setSegmentedTab] = useState<'discussion' | 'votes'>('discussion');
  const [comments, setComments] = useState([
    { id: '1', author: 'Alex', avatar: '#10b981', text: 'The food in Jeju is amazing!', timeAgo: '2m ago', likes: 3, liked: false },
    { id: '2', author: 'Mavis', avatar: '#ec4899', text: 'I really want to see the beaches', timeAgo: '3m ago', likes: 2, liked: false },
    { id: '3', author: 'Ken', avatar: '#3b82f6', text: 'Maybe we should also check city spots?', timeAgo: '4m ago', likes: 1, liked: false },
    { id: '4', author: 'June', avatar: '#f59e0b', text: "I'm totally down! It's been on my bucket list!", timeAgo: '5m ago', likes: 2, liked: false },
  ]);
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
      // Initially 2 submitted (Alex & Mavis) and 2 pending (Ken & June), matching Figure 3
      setLiveJurors([
        { id: 'alex', name: 'Alex', vote: 'go', variant: 'green', avatarColor: '#10b981', hairColor: '#065f46' },
        { id: 'mavis', name: 'Mavis', vote: 'go', variant: 'purple', avatarColor: '#a855f7', hairColor: '#f59e0b' },
        { id: 'ken', name: 'Ken', vote: null, variant: 'blue', avatarColor: '#f59e0b', hairColor: '#1e3a8a' },
        { id: 'june', name: 'June', vote: null, variant: 'coral', avatarColor: '#ef4444', hairColor: '#db2777' },
      ]);
      setTimerCount(6);

      // Ken votes after 1.8s
      const tKen = window.setTimeout(() => {
        playPop();
        triggerHaptic('pop');
        setLiveJurors(prev =>
          prev.map(j => (j.id === 'ken' ? { ...j, vote: 'not-now' } : j))
        );
      }, 1800);

      // June votes after 3.6s
      const tJune = window.setTimeout(() => {
        playPop();
        triggerHaptic('pop');
        setLiveJurors(prev =>
          prev.map(j => (j.id === 'june' ? { ...j, vote: 'go' } : j))
        );
      }, 3600);

      // 1-second countdown timer
      const countdownInterval = window.setInterval(() => {
        setTimerCount(c => (c > 0 ? c - 1 : 0));
      }, 1000);

      // Auto-advance to verdict after all votes are in
      const finishTimer = window.setTimeout(() => {
        handleGoToVerdict('pass');
      }, 5400);

      return () => {
        clearTimeout(tKen);
        clearTimeout(tJune);
        clearInterval(countdownInterval);
        clearTimeout(finishTimer);
      };
    }
  }, [currentStep]);

  // Handle verdict trigger with Gavel strike sound, haptic, screen shake
  const handleGoToVerdict = (outcome: 'pass' | 'fail') => {
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
      author: 'You',
      avatar: '#10b981',
      text,
      timeAgo: 'Just now',
      likes: 0,
      liked: false,
    };
    setComments([...comments, newC]);
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
          className="court-case-chamber"
          style={{
            background: 'linear-gradient(180deg, #dbeafe 0%, #eff6ff 25%, #f8fafc 60%, #ffffff 100%)',
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
                border: 'none',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={22} color="#1e293b" />
            </button>
            <div style={{ width: 36 }} />
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
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                  opacity: 0.4,
                  pointerEvents: 'none',
                }}
              >
                <svg width="50" height="42" viewBox="0 0 60 50" fill="#38bdf8">
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
                  opacity: 0.75,
                  pointerEvents: 'none',
                }}
              >
                <svg width="70" height="36" viewBox="0 0 84 42" fill="none">
                  <path
                    d="M 10 32 Q 42 38 66 16"
                    stroke="#93c5fd"
                    strokeWidth="1.8"
                    strokeDasharray="3 3"
                  />
                  <text x="67" y="15" fontSize="14" fill="#1877f2">✈</text>
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
                  style={{
                    fontSize: '25px',
                    fontWeight: 900,
                    color: '#1877f2',
                    letterSpacing: '-0.03em',
                    margin: 0,
                    lineHeight: 1.1,
                    fontFamily: "Georgia, 'Times New Roman', serif",
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
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
                    }}
                  >
                    🔨
                  </span>
                  <div
                    style={{
                      position: 'absolute',
                      top: -5,
                      right: -7,
                      color: '#facc15',
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
                style={{
                  fontSize: '12px',
                  color: '#475569',
                  fontWeight: 600,
                  margin: '2px 0 4px',
                  letterSpacing: '0.01em',
                }}
              >
                Different opinions? Let's decide together!
              </p>
            </div>

            {/* Dynamic Central Courtroom Hero Card */}
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
            {/* Bottom "{courtMembers.length} members in the court" Card */}
            <div
              className="court-lobby-members-card"
              style={{
                width: '100%',
                background: '#ffffff',
                borderRadius: 20,
                padding: '10px 12px 10px',
                boxShadow:
                  '0 6px 24px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.04)',
                border: '1px solid #f1f5f9',
                marginTop: 0,
              }}
            >
              {/* Header Row: 4 / 6 members joined on left + Bouncing "waiting...." on right */}
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
                      color: '#0f172a',
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
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: 99,
                        padding: '1px 6px',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        color: '#64748b',
                        cursor: 'pointer',
                        marginLeft: 2,
                      }}
                      title="Reset back to default 4 members"
                    >
                      ↺ Reset
                    </button>
                  )}
                </div>

                {/* Right: Bouncing Wave "waiting...." */}
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#2563eb',
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: '#eff6ff',
                    padding: '2px 8px',
                    borderRadius: 99,
                    border: '1px solid #bfdbfe',
                    letterSpacing: '0.01em',
                  }}
                >
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
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          background: 'radial-gradient(circle at 50% 35%, #ffffff 0%, #f1f5f9 100%)',
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
                            background: m.statusBadgeColor || m.avatarColor || '#3b82f6',
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
                          color: '#475569',
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
                            background: '#ef4444',
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
                      border: '1.5px dashed #93c5fd',
                      background: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1877f2',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      transition: 'transform 0.15s ease',
                    }}
                    aria-label="Add friend"
                  >
                    <Plus size={22} strokeWidth={2.6} color="#1877f2" />
                  </button>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#64748b',
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
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1d4ed8',
                    padding: '6px 10px',
                    borderRadius: 12,
                    fontSize: '11px',
                    fontWeight: 700,
                    textAlign: 'center',
                    marginBottom: 8,
                    animation: 'court-fade-in 0.2s ease',
                    boxShadow: '0 2px 6px rgba(37,99,235,0.08)',
                  }}
                >
                  {memberNotification}
                </div>
              )}

              {/* Start the Case Button */}
              <button
                type="button"
                className="court-dark-pill-btn"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 24,
                  padding: '11px 18px',
                  fontSize: '14.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.2)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onClick={() => {
                  playWhoosh();
                  triggerHaptic('tap');
                  if (onGoToIdeas) {
                    onGoToIdeas();
                  } else {
                    setCurrentStep('proposal');
                  }
                }}
              >
                <span>Start the case</span>
                <span style={{ fontSize: '17px' }}>→</span>
              </button>
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
        <div className="court-case-chamber">
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
            >
              <ChevronLeft size={24} />
            </button>
            <div className="court-nav-title-group" style={{ alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                Case {caseIndex} of 3
              </span>
              <div style={{ display: 'flex', gap: 4, width: 80, marginTop: 4 }}>
                <div style={{ height: 4, flex: 1, background: '#1877f2', borderRadius: 99 }} />
                <div style={{ height: 4, flex: 1, background: '#e2e8f0', borderRadius: 99 }} />
                <div style={{ height: 4, flex: 1, background: '#e2e8f0', borderRadius: 99 }} />
              </div>
            </div>
            <div style={{ width: 38 }} />
          </header>

          {(() => {
            const currentCase = CASES[caseIndex - 1];
            const remainingAfter = CASES.slice(caseIndex); // cards behind
            return (
              <div
                className="court-proposal-screen"
                style={{
                  position: 'relative',
                  padding: '2px 16px 112px',
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
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginLeft: 2 }}>
                        {proposalVotedCount}/{courtMembers.length} voted
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: '80%', height: 3, background: '#f1f5f9', borderRadius: 99, margin: '1px 0 0', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${proposalProgress}%`, background: 'linear-gradient(90deg, #800000, #b91c1c)', borderRadius: 99, transition: 'width 0.4s ease' }} />
                  </div>

                  {/* Title floats right above judge */}
                  <div style={{ margin: '4px 0 -8px', textAlign: 'center', lineHeight: 1.12 }}>
                    <span style={{
                      fontSize: '25px', fontWeight: 900, color: '#0f172a',
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      letterSpacing: '-0.02em',
                    }}>
                      {currentCase.question.split(' ').map((word, i, arr) => {
                        const isLast = i === arr.length - 1;
                        const isDestWord = i >= arr.length - 2;
                        return (
                          <span key={i} style={isDestWord ? { color: '#1877f2', fontStyle: 'italic' } : undefined}>
                            {word}{!isLast ? ' ' : ''}
                          </span>
                        );
                      })}
                    </span>
                  </div>

                  {/* Judge */}
                  <div style={{ margin: '-2px 0 -22px', display: 'flex', justifyContent: 'center' }}>
                    <DuolingoJudgeBench state="waving" size={100} benchWidth={130} />
                  </div>
                </div>


                {/* Stacked Card Deck — back cards peek from ABOVE, anchored to bottom */}
                {(() => {
                  const PEEK_HEIGHT = 34; // how many px of each back card peeks above the front card
                  const FRONT_CARD_HEIGHT = 224;
                  // Total container height: front card + 2 peek strips
                  const numPeekCards = Math.min(remainingAfter.length, 2);
                  const containerHeight = FRONT_CARD_HEIGHT + numPeekCards * PEEK_HEIGHT;

                  return (
                    <div style={{ position: 'relative', width: '100%', height: containerHeight, flexShrink: 0, marginTop: 46 }}>

                      {/* Back card 2 (furthest behind) — peeks at very top */}
                      {remainingAfter.length >= 2 && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 12,
                          right: 12,
                          height: FRONT_CARD_HEIGHT + 2 * PEEK_HEIGHT,
                          background: 'linear-gradient(145deg, rgba(255,255,255,0.42), rgba(222,235,248,0.22))',
                          backdropFilter: 'blur(24px) saturate(180%)',
                          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                          borderRadius: 20,
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,.82), 0 12px 30px rgba(37,62,91,0.10)',
                          zIndex: 1,
                          overflow: 'hidden',
                          border: '1px solid rgba(255,255,255,0.64)',
                        }}>
                          {/* Only the top strip is visible — show peek content */}
                          <div style={{ padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 10, height: PEEK_HEIGHT, overflow: 'hidden' }}>
                            <div style={{ width: 23, height: 23, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#cbd5e1' }}>
                              <img src={remainingAfter[1]?.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 750, color: 'rgba(71,85,105,.66)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {remainingAfter[1]?.title}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Back card 1 (middle) — peeks second from top */}
                      {remainingAfter.length >= 1 && (
                        <div style={{
                          position: 'absolute',
                          top: remainingAfter.length >= 2 ? PEEK_HEIGHT : 0,
                          left: 6,
                          right: 6,
                          height: FRONT_CARD_HEIGHT + PEEK_HEIGHT,
                          background: 'linear-gradient(145deg, rgba(255,255,255,0.58), rgba(226,238,249,0.30))',
                          backdropFilter: 'blur(26px) saturate(185%)',
                          WebkitBackdropFilter: 'blur(26px) saturate(185%)',
                          borderRadius: 22,
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,.9), 0 14px 32px rgba(37,62,91,0.12)',
                          zIndex: 2,
                          overflow: 'hidden',
                          border: '1px solid rgba(255,255,255,0.68)',
                        }}>
                          {/* Only the top strip is visible */}
                          <div style={{ padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 10, height: PEEK_HEIGHT, overflow: 'hidden' }}>
                            <div style={{ width: 24, height: 24, borderRadius: 9, overflow: 'hidden', flexShrink: 0, background: '#e2e8f0' }}>
                              <img src={remainingAfter[0]?.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                            </div>
                            <span style={{ fontSize: '12.5px', fontWeight: 760, color: 'rgba(71,85,105,.76)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {remainingAfter[0]?.title}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Front card — fully visible, sits at the bottom of the stack */}
                      <div
                        className={cardExiting ? 'court-card-swipe-out' : ''}
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: FRONT_CARD_HEIGHT,
                          background: '#ffffff',
                          borderRadius: 22,
                          boxShadow: '0 12px 32px rgba(15,23,42,0.14), 0 1px 4px rgba(0,0,0,0.06)',
                          overflow: 'hidden',
                          zIndex: 10,
                          border: '1px solid #f1f5f9',
                        }}
                      >
                        {/* Type badge */}
                        <div style={{
                          position: 'absolute', top: 10, left: 10, zIndex: 20,
                          background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(6px)',
                          borderRadius: 99, padding: '3px 9px',
                          fontSize: '10px', fontWeight: 800, color: '#ffffff',
                          letterSpacing: '0.02em',
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
                            <MapPin size={14} color="#1877f2" />
                            <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{currentCase.title}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                            {currentCase.tags.map(tag => (
                              <span key={tag} style={{
                                fontSize: '10.5px', fontWeight: 700, color: '#1877f2',
                                background: '#eff6ff', borderRadius: 99, padding: '3px 8px',
                                border: '1px solid #bfdbfe',
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
                    className="court-sticky-cta-btn"
                    style={{ width: '100%' }}
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
                    Next to Vote →
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
        <div className="court-case-chamber court-vote-chamber">
          <header className="court-navbar court-vote-navbar">
            <button className="court-nav-back-btn" onClick={() => setCurrentStep('proposal')} aria-label="Back">
              <ChevronLeft size={24} />
            </button>
            <div className="court-nav-title-group" style={{ alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                Case {caseIndex} of 3
              </span>
              <div style={{ display: 'flex', gap: 4, width: 80, marginTop: 4 }}>
                <div style={{ height: 4, flex: 1, background: '#1877f2', borderRadius: 99 }} />
                <div style={{ height: 4, flex: 1, background: '#e2e8f0', borderRadius: 99 }} />
                <div style={{ height: 4, flex: 1, background: '#e2e8f0', borderRadius: 99 }} />
              </div>
            </div>
            <div style={{ width: 38 }} />
          </header>

          <div
            className="court-voting-screen"
            style={{
              padding: '8px 18px 0',
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
            <div className="court-vote-focus-area">
              <div className="court-voting-header">
                <h2>It's your turn!</h2>
                <p>What's your vote?</p>
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

              <div className="court-vote-case-brief">
                <img
                  src={activeCase.imageUrl}
                  alt={activeCase.title}
                  className="court-vote-case-thumb"
                  draggable={false}
                />
                <div className="court-vote-case-copy">
                  <div className="court-vote-case-meta">
                    <span>{activeCase.typeLabel}</span>
                    <span>Case {caseIndex}</span>
                  </div>
                  <h3>{activeCase.question}</h3>
                  <p>{activeCase.title}</p>
                  <div className="court-vote-case-tags">
                    {activeCase.tags.slice(0, 3).map(tag => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="court-dual-vote-buttons">
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
                    <Check size={34} strokeWidth={3.8} />
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
                    <X size={34} strokeWidth={3.8} />
                  </div>
                  <span>Not now</span>
                </button>
              </div>

              {/* Either option: subtle grey underlined text button */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '-2px 0 10px' }}>
                <button
                  type="button"
                  className={`court-vote-either-text-btn ${userVote === 'either' ? 'selected' : ''}`}
                  onClick={() => {
                    playVoteChime(true);
                    triggerHaptic('vote');
                    setUserVote('either');
                  }}
                >
                  I'm fine with either
                </button>
              </div>

              <input
                type="text"
                className="court-reason-input"
                placeholder="Add a reason (optional)"
                value={userReason}
                onChange={e => setUserReason(e.target.value)}
              />
            </div>

            {/* Bottom Action Group */}
            <div className="court-vote-submit-wrap">
              <button
                type="button"
                className="court-sticky-cta-btn"
                style={{ width: '100%', opacity: userVote ? 1 : 0.6 }}
                disabled={!userVote}
                onClick={() => {
                  playWhoosh();
                  triggerHaptic('tap');
                  setCurrentStep('jury-live');
                }}
              >
                Submit →
              </button>
            </div>
            <div className="court-vote-home-wrap">
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
          <div className="court-case-chamber">
            <MobileStatusBar />
            <header className="court-navbar">
              <button className="court-nav-back-btn" onClick={() => setCurrentStep('voting')} aria-label="Back">
                <ChevronLeft size={24} />
              </button>
              <div className="court-nav-title-group" style={{ alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                  Case {caseIndex} of 3
                </span>
                <div style={{ display: 'flex', gap: 4, width: 80, marginTop: 4 }}>
                  <div style={{ height: 4, flex: 1, background: '#1877f2', borderRadius: 99 }} />
                  <div style={{ height: 4, flex: 1, background: caseIndex >= 2 ? '#1877f2' : '#e2e8f0', borderRadius: 99 }} />
                  <div style={{ height: 4, flex: 1, background: caseIndex >= 3 ? '#1877f2' : '#e2e8f0', borderRadius: 99 }} />
                </div>
              </div>
              <div style={{ width: 38 }} />
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
              {/* Header (Matching Figure 3) */}
              <div className="court-jury-header" style={{ margin: '2px 0 10px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, position: 'relative' }}>
                  <h2>The jury is voting...</h2>
                  <span style={{ color: '#ef4444', fontSize: '18px', fontWeight: 900, marginTop: -10 }}>″</span>
                </div>
                <p style={{ marginTop: 2 }}>Your vote is in. Waiting for the rest of the court.</p>
              </div>

              {/* Case Brief Card (Matching Figure 3) */}
              <div className="court-vote-case-brief" style={{ width: '100%', margin: '0 0 12px', minHeight: 68, padding: '8px 11px' }}>
                <img
                  src={activeCase.imageUrl}
                  alt={activeCase.title}
                  className="court-vote-case-thumb"
                  style={{ width: 66, height: 56, borderRadius: 12 }}
                  draggable={false}
                />
                <div className="court-vote-case-copy">
                  <div className="court-vote-case-meta" style={{ marginBottom: 2 }}>
                    <span style={{ fontSize: '9px', minHeight: 16, padding: '1px 6px' }}>{activeCase.typeLabel}</span>
                    <span style={{ fontSize: '9px', minHeight: 16, padding: '1px 6px' }}>Case {caseIndex}</span>
                  </div>
                  <h3 style={{ fontSize: '13.5px', margin: 0 }}>{activeCase.question}</h3>
                  <p style={{ fontSize: '11px', margin: '1px 0 3px' }}>{activeCase.title}</p>
                  <div className="court-vote-case-tags">
                    {activeCase.tags.slice(0, 3).map(tag => (
                      <span key={tag} style={{ fontSize: '9px', padding: '1px 6px' }}>{tag}</span>
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
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: '6px 12px',
                  }}
                  onClick={() => handleGoToVerdict('pass')}
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
        <div className="court-case-chamber">
          <MobileStatusBar />
          <header className="court-navbar">
            <button className="court-nav-back-btn" onClick={() => setCurrentStep('proposal')} aria-label="Back">
              <ChevronLeft size={24} />
            </button>
            <div className="court-nav-title-group" style={{ alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                Case {caseIndex} of 3
              </span>
              <div style={{ display: 'flex', gap: 4, width: 80, marginTop: 4 }}>
                <div style={{ height: 4, flex: 1, background: '#1877f2', borderRadius: 99 }} />
                <div style={{ height: 4, flex: 1, background: caseIndex >= 2 ? '#1877f2' : '#e2e8f0', borderRadius: 99 }} />
                <div style={{ height: 4, flex: 1, background: caseIndex >= 3 ? '#1877f2' : '#e2e8f0', borderRadius: 99 }} />
              </div>
            </div>
            <div style={{ width: 38 }} />
          </header>

          {(() => {
            const currentVerdictTitle = activeCase.verdictTitle ?? `We're going to ${activeCase.title}!`;
            const yesCount = 3;
            const noCount = 1;
            const greenPct = 75;

            // 4 Members with explicit voting states matching Figure 2
            const verdictMembers = [
              { id: 'alex', name: 'Alex', variant: 'green' as CharacterVariant, vote: 'go', bg: '#e6f9f0' },
              { id: 'mavis', name: 'Mavis', variant: 'purple' as CharacterVariant, vote: 'go', bg: '#fef7e7' },
              { id: 'ken', name: 'Ken', variant: 'blue' as CharacterVariant, vote: 'go', bg: '#f1f5f9' },
              { id: 'june', name: 'June', variant: 'coral' as CharacterVariant, vote: 'not-now', bg: '#fff1f2' },
            ];

            return (
              <div className="court-verdict-page-container">
                {/* Top Section: Subtitle + Dynamic Title with Sparks + Stage Judge Area */}
                <div className="court-verdict-header-block">
                  <div className="court-verdict-subtitle-text">The verdict is...</div>
                  <div className="court-verdict-title-wrap">
                    {/* Festive confetti sparks */}
                    <svg width="18" height="18" viewBox="0 0 24 24" style={{ position: 'absolute', left: 4, top: -4 }}>
                      <path d="M4 14 Q8 10 14 6" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" fill="none" />
                    </svg>
                    <svg width="16" height="16" viewBox="0 0 24 24" style={{ position: 'absolute', left: -6, bottom: 2 }}>
                      <path d="M6 6 C12 6 14 12 10 16" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" fill="none" />
                    </svg>

                    <h2 className="court-verdict-main-title">
                      {currentVerdictTitle}
                    </h2>

                    <svg width="18" height="18" viewBox="0 0 24 24" style={{ position: 'absolute', right: 4, top: -4 }}>
                      <path d="M4 6 Q10 10 14 14" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" fill="none" />
                    </svg>
                    <svg width="16" height="16" viewBox="0 0 24 24" style={{ position: 'absolute', right: -6, bottom: 2 }}>
                      <path d="M14 6 C8 6 6 12 10 16" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" fill="none" />
                    </svg>
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
                      <svg width="22" height="26" viewBox="0 0 22 26" style={{ marginLeft: 2 }}>
                        <path d="M0 5 Q 5 1, 11 5 T 22 5 M0 13 Q 5 9, 11 13 T 22 13 M0 21 Q 5 17, 11 21 T 22 21" stroke="#b91c1c" strokeWidth="1.3" fill="none" opacity="0.65" />
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
                      <span className="court-badge-result">Final result</span>
                    </div>
                    <h3 className="court-selected-case-title">
                      {activeCase.selectedTitle}
                    </h3>
                    <p className="court-selected-case-desc">
                      {activeCase.description}
                    </p>
                    <div className="court-selected-case-tags">
                      {activeCase.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="court-selected-case-tag">{tag}</span>
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
                    <span className="court-vote-results-count">4 members voted</span>
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
                <div className="court-verdict-bottom-actions">
                  <button
                    type="button"
                    className="court-verdict-secondary-btn"
                    onClick={() => {
                      playWhoosh();
                      setCurrentStep('discussion');
                    }}
                  >
                    <MessageCircle size={18} />
                    <span>View discussion</span>
                  </button>

                  <button
                    type="button"
                    className="court-verdict-primary-btn"
                    onClick={() => {
                      playWhoosh();
                      triggerHaptic('tap');
                      if (caseIndex < CASES.length) {
                        setCaseIndex(prev => prev + 1);
                        setUserVote(null);
                        setUserReason('');
                        setCurrentStep('proposal');
                      } else {
                        setCurrentStep('summary');
                      }
                    }}
                  >
                    <span>{caseIndex < CASES.length ? 'Next case →' : 'View summary →'}</span>
                  </button>
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
        <div className="court-case-chamber">
          <MobileStatusBar />
          <header className="court-navbar">
            <button className="court-nav-back-btn" onClick={() => setCurrentStep('jury-live')} aria-label="Back">
              <ChevronLeft size={24} />
            </button>
            <div className="court-nav-title-group" style={{ alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                Case 2 of 3
              </span>
              <div style={{ display: 'flex', gap: 4, width: 80, marginTop: 4 }}>
                <div style={{ height: 4, flex: 1, background: '#1877f2', borderRadius: 99 }} />
                <div style={{ height: 4, flex: 1, background: '#1877f2', borderRadius: 99 }} />
                <div style={{ height: 4, flex: 1, background: '#e2e8f0', borderRadius: 99 }} />
              </div>
            </div>
            <div style={{ width: 38 }} />
          </header>

          <div
            className="court-verdict-screen"
            style={{
              padding: '8px 18px 2px',
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
            {/* Top Section */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="court-verdict-subtitle" style={{ fontSize: '13px', margin: '2px 0' }}>The verdict is...</div>
              <div className="court-verdict-title rejected" style={{ fontSize: '24px', margin: '2px 0 6px' }}>Not this time!</div>

              <div style={{ margin: '4px 0 10px', display: 'flex', justifyContent: 'center' }}>
                <DuolingoJudgeBench state="slumped" size={135} benchWidth={160} />
              </div>

              {/* Score Bar 1 vs 3 */}
              <div className="court-score-bar-card" style={{ width: '100%', marginTop: 4 }}>
                <div className="court-score-numbers">
                  <span className="court-score-green">1</span>
                  <span className="court-score-red">3</span>
                </div>
                <div className="court-score-split-bar">
                  <div className="court-score-bar-green" style={{ width: '25%' }} />
                  <div className="court-score-bar-red" style={{ width: '75%' }} />
                </div>
                <div className="court-score-avatars-row" style={{ justifyContent: 'space-around', padding: '0 20px' }}>
                  {JURORS.map((j, i) => (
                    <div key={j.id} className="court-score-avatar-item">
                      <TravelCourtCharacter
                        variant={j.variant || 'blue'}
                        isAvatar
                        size={42}
                      />
                      <div className={`court-score-avatar-badge ${i < 1 ? 'green' : 'red'}`}>
                        {i < 1 ? '✓' : '✕'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Action Group */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8, paddingTop: 4 }}>
              <button
                type="button"
                className="court-sticky-cta-btn"
                style={{ width: '100%', marginBottom: 6 }}
                onClick={() => {
                  playWhoosh();
                  triggerHaptic('tap');
                  if (caseIndex < CASES.length) {
                    setCaseIndex(prev => prev + 1);
                    setUserVote(null);
                    setUserReason('');
                    setCurrentStep('proposal');
                  } else {
                    setCurrentStep('summary');
                  }
                }}
              >
                {caseIndex < CASES.length ? 'Next case →' : 'View summary →'}
              </button>
              <MobileHomeIndicator />
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          SCREEN 7: DISCUSSION & VOTES TAB
          ==================================================================== */}
      {currentStep === 'discussion' && (
        <div className="court-case-chamber">
          <MobileStatusBar />
          <header className="court-navbar">
            <button className="court-nav-back-btn" onClick={() => setCurrentStep('verdict-pass')} aria-label="Back">
              <ChevronLeft size={24} />
            </button>
            <div className="court-nav-title-group" style={{ alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                Case {caseIndex} of 3
              </span>
              <div style={{ display: 'flex', gap: 4, width: 80, marginTop: 4 }}>
                <div style={{ height: 4, flex: 1, background: '#1877f2', borderRadius: 99 }} />
                <div style={{ height: 4, flex: 1, background: '#e2e8f0', borderRadius: 99 }} />
                <div style={{ height: 4, flex: 1, background: '#e2e8f0', borderRadius: 99 }} />
              </div>
            </div>
            <div style={{ width: 38 }} />
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
            <div className="court-segmented-control">
              <button
                type="button"
                className={`court-segment-btn ${segmentedTab === 'discussion' ? 'active' : ''}`}
                onClick={() => setSegmentedTab('discussion')}
              >
                Discussion
              </button>
              <button
                type="button"
                className={`court-segment-btn ${segmentedTab === 'votes' ? 'active' : ''}`}
                onClick={() => setSegmentedTab('votes')}
              >
                Votes
              </button>
            </div>

            {segmentedTab === 'discussion' ? (
              <>
                <div className="court-comments-stream">
                  {comments.map(c => (
                    <div key={c.id} className="court-comment-bubble">
                      <TravelCourtCharacter
                        variant={c.author === 'Alex' ? 'green' : c.author === 'Mavis' ? 'coral' : c.author === 'Ken' ? 'blue' : c.author === 'June' ? 'purple' : 'yellow'}
                        isAvatar
                        size={40}
                      />
                      <div className="court-comment-content">
                        <div className="court-comment-header">
                          <b>{c.author}</b>
                          <span>{c.timeAgo}</span>
                        </div>
                        <p className="court-comment-text">{c.text}</p>
                      </div>
                      <button
                        type="button"
                        className={`court-comment-like-btn ${c.liked ? 'liked' : ''}`}
                        onClick={() => handleLikeComment(c.id)}
                      >
                        <Heart size={14} fill={c.liked ? '#f43f5e' : 'none'} />
                        <span>{c.likes}</span>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="court-comment-input-bar">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newCommentText}
                    onChange={e => setNewCommentText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddComment();
                    }}
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
                {JURORS.map((j, i) => (
                  <div key={j.id} className="court-comment-bubble" style={{ alignItems: 'center' }}>
                    <TravelCourtCharacter
                      variant={j.variant || 'blue'}
                      isAvatar
                      size={44}
                    />
                    <div style={{ flex: 1, marginLeft: 10 }}>
                      <b style={{ fontSize: '14px', color: '#0f172a' }}>{j.name}</b>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {i !== 2 ? 'Voted Go! (Wants to visit beaches & food)' : 'Voted Not now (Prefers city spots)'}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 99,
                        fontSize: '12px',
                        fontWeight: 800,
                        background: i !== 2 ? '#edfdf5' : '#fef3f2',
                        color: i !== 2 ? '#12b76a' : '#f04438',
                      }}
                    >
                      {i !== 2 ? 'Go!' : 'Not now'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              className="court-sticky-cta-btn"
              style={{
                width: '100%',
                height: 50,
                minHeight: 50,
                maxHeight: 50,
                borderRadius: 16,
                flexShrink: 0,
                margin: '10px 0 6px',
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
          SCREEN 8: TRIP PLAN SUMMARY (JEJU ADDED!)
          ==================================================================== */}
      {currentStep === 'summary' && (
        <div className="court-case-chamber">
          <MobileStatusBar />
          <header className="court-navbar" style={{ justifyContent: 'flex-end' }}>
            <button
              className="court-nav-back-btn"
              onClick={() => onConfirmPlan('Jeju')}
              aria-label="Close"
            >
              <X size={22} />
            </button>
          </header>

          <div
            className="court-summary-screen"
            style={{
              padding: '8px 18px 2px',
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
            {/* Top Section: Illustration + Title + Checklist */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="court-summary-illustration" style={{ margin: '2px 0 6px' }}>
                <DuolingoAirplaneSquad size={210} />
              </div>

              <div className="court-summary-title" style={{ fontSize: '24px', margin: '0 0 2px' }}>Jeju added!</div>
              <div className="court-summary-desc" style={{ fontSize: '13px', margin: '0 0 10px' }}>It's official. Jeju is in our trip plan!</div>

              <div className="court-checklist-container" style={{ gap: 7, marginBottom: 0 }}>
                <div className="court-checklist-item" style={{ padding: '9px 14px' }}>
                  <div className="court-check-label">
                    <Plane size={17} color="#1877f2" /> Flights
                  </div>
                  <span className="court-check-status">Not planned</span>
                </div>

                <div className="court-checklist-item" style={{ padding: '9px 14px' }}>
                  <div className="court-check-label">
                    <Home size={17} color="#1877f2" /> Accommodation
                  </div>
                  <span className="court-check-status">Not planned</span>
                </div>

                <div className="court-checklist-item" style={{ padding: '9px 14px' }}>
                  <div className="court-check-label">
                    <MapPin size={17} color="#1877f2" /> Activities
                  </div>
                  <span className="court-check-status">Not planned</span>
                </div>

                <div className="court-checklist-item" style={{ padding: '9px 14px' }}>
                  <div className="court-check-label">
                    <Utensils size={17} color="#1877f2" /> Food
                  </div>
                  <span className="court-check-status">Not planned</span>
                </div>
              </div>
            </div>

            {/* Bottom Action Group */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8, paddingTop: 4 }}>
              <button
                type="button"
                className="court-dark-pill-btn"
                style={{ width: '100%', marginBottom: 6 }}
                onClick={() => {
                  playVictoryFanfare();
                  triggerHaptic('victory');
                  onConfirmPlan('Jeju');
                }}
              >
                Continue planning →
              </button>
              <MobileHomeIndicator />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
