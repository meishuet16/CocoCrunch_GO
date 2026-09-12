import React, { useState, useEffect } from 'react';
import { TravelCourtIdeasBoard } from './TravelCourtIdeasBoard';
import { TravelCourtCaseFlow, DEFAULT_COURT_MEMBERS, type CourtStep } from './TravelCourtCaseFlow';
import { type DynamicCourtMember } from './DynamicCourtroomStage';
import type { CocoContext } from '../coco/assets';
import { CourtCharacterPlayground } from './CourtCharacterPlayground';
import { playWhoosh, triggerHaptic } from './courtSoundAndHaptics';
import './court-styles.css';
import type { FlightBookingState } from '../../persistence';
import type { AccommodationBookingState } from '../../persistence';

export interface TravelCourtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDecision: (decision: string) => void;
  onSkippedIdeaSealed?: (idea: string) => void;
  initialMode?: 'ideas' | 'case' | 'playground';
  initialStep?: CourtStep;
  onCocoContextChange?: (context: Extract<CocoContext, 'court' | 'courtTie'>) => void;
  flightBooking?: FlightBookingState;
  accommodationBooking?: AccommodationBookingState;
}

export function TravelCourtModal({
  isOpen,
  onClose,
  onConfirmDecision,
  onSkippedIdeaSealed,
  initialMode = 'case',
  initialStep = 'lobby',
  onCocoContextChange,
  flightBooking,
  accommodationBooking,
}: TravelCourtModalProps) {
  const [viewMode, setViewMode] = useState<'ideas' | 'case' | 'playground'>(initialMode);
  const [caseStep, setCaseStep] = useState<CourtStep>(initialStep);
  const [courtMembers, setCourtMembers] = useState<DynamicCourtMember[]>(DEFAULT_COURT_MEMBERS);

  useEffect(() => {
    if (isOpen) {
      playWhoosh();
      triggerHaptic('tap');
      setViewMode(initialMode);
      setCaseStep(initialStep);

      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen, initialMode, initialStep]);

  useEffect(() => {
    if (isOpen) onCocoContextChange?.('court');
  }, [isOpen, onCocoContextChange]);

  if (!isOpen) return null;

  return (
    <div className="court-modal-overlay" onClick={e => {
      // Close only if backdrop itself is clicked
      if (e.target === e.currentTarget) onClose();
    }}>
      {viewMode === 'playground' ? (
        <CourtCharacterPlayground onBack={() => setViewMode('ideas')} />
      ) : viewMode === 'ideas' ? (
        <TravelCourtIdeasBoard
          onClose={onClose}
          membersCount={courtMembers.length}
          onBackToCourt={() => {
            setCaseStep('lobby');
            setViewMode('case');
          }}
          onEnterCourt={() => {
            setCaseStep('proposal');
            setViewMode('case');
          }}
          onOpenDiscussion={(_ideaId) => {
            setCaseStep('proposal');
            setViewMode('case');
          }}
          onOpenPlayground={() => {
            setViewMode('playground');
          }}
        />
      ) : (
        <TravelCourtCaseFlow
          initialStep={caseStep}
          courtMembers={courtMembers}
          onUpdateMembers={setCourtMembers}
          onClose={onClose}
          onBackToIdeas={() => setViewMode('ideas')}
          onGoToIdeas={() => setViewMode('ideas')}
          onSkippedIdeaSealed={onSkippedIdeaSealed}
          onCocoContextChange={onCocoContextChange}
          flightBooking={flightBooking}
          accommodationBooking={accommodationBooking}
          onConfirmPlan={(decision) => {
            onConfirmDecision(decision);
            onClose();
          }}
        />
      )}
    </div>
  );
}
