import { useState } from 'react';
import { Sparkles, MapPin, Clock, DollarSign, Navigation, Info, X, Check, ArrowRight } from 'lucide-react';

export type AssistantChipKey = 'where-to-go' | 'more-packed' | 'detour' | 'skip-next' | 'add-item';

export type AssistantProposal = {
  chipKey: AssistantChipKey;
  chipLabel: string;
  promptText: string;
  reason: string;
  targetPlace: {
    name: string;
    description: string;
    address: string;
    openingHours: string;
    tags: string[];
    priceLabel: string;
  };
  fitScore: number;
  replacementAction: string;
  subsequentChanges: string;
  transitTime: string;
  budgetImpact: string;
  isOverBudget: boolean;
  openingHours: string;
};

const ASSISTANT_PROPOSALS: Record<AssistantChipKey, AssistantProposal> = {
  'where-to-go': {
    chipKey: 'where-to-go',
    chipLabel: '🌟 Where to Go',
    promptText: 'Where to go · Recommend spots matching my current rhythm',
    reason: 'Based on the past few days, you prefer slow-paced independent bookstores and lifestyle neighborhoods during the afternoon.',
    targetPlace: {
      name: 'Daikanyama T-Site & Ivy Place',
      description: 'Award-winning lifestyle cultural complex hidden in lush trees, featuring curated books, art magazines, and relaxing garden cafe terrace.',
      address: '17-5 Sarugakucho, Shibuya-ku, Tokyo',
      openingHours: '09:00–22:00 · Open now',
      tags: ['Bookstore', 'Café', 'Lifestyle', 'Scenic'],
      priceLabel: 'RM 28 est.',
    },
    fitScore: 96,
    replacementAction: 'Insert Daikanyama T-Site lifestyle district (replaces regular shopping mall in current plan)',
    subsequentChanges: 'Later dinner pushes back by 30 mins; evening Anchor core event is fully protected and unaffected.',
    transitTime: '8 min walk (via Kyu-Yamate Dori, wide sidewalks)',
    budgetImpact: '+RM 28 · Within budget',
    isOverBudget: false,
    openingHours: '09:00–22:00 · Open now',
  },
  'more-packed': {
    chipKey: 'more-packed',
    chipLabel: '⚡ Pack My Day',
    promptText: 'Pack my schedule · Add more activities & exploration',
    reason: 'Detected high walking pace and energetic vibe. You can seamlessly connect nearby Meguro River promenade and vintage shops to today’s route.',
    targetPlace: {
      name: 'Meguro River Walk & Vintage Alley',
      description: 'Scenic riverside promenade with artisan boutiques, local vintage treasure troves, and seasonal canal views.',
      address: 'Kamimeguro 1-chome, Meguro-ku, Tokyo',
      openingHours: 'Promenade open 24/7 · Shops 11:00–20:00',
      tags: ['Walking', 'Vintage', 'Riverside', 'Scenic'],
      priceLabel: 'RM 15 est.',
    },
    fitScore: 93,
    replacementAction: 'Insert 45-minute Meguro River stroll and boutique shop visits',
    subsequentChanges: 'Zero downtime or waiting, schedule pace improves, and all scheduled stops stay on track.',
    transitTime: '12 min walk (~850m)',
    budgetImpact: '+RM 15 · Within budget',
    isOverBudget: false,
    openingHours: 'Open 24/7 (Shops open)',
  },
  'detour': {
    chipKey: 'detour',
    chipLabel: '☕ Quick Detour',
    promptText: 'Quick detour nearby · Discover hidden highlights en route',
    reason: 'Current route passes right by Saigoyama Park Vista Deck. Wide-open view, perfect for an effortless 15-minute rest.',
    targetPlace: {
      name: 'Saigoyama Park Vista Deck',
      description: 'Quiet hillside public park offering panoramic views toward Mount Fuji on clear days, with gentle slopes and shaded benches.',
      address: 'Aobadai 2-10-7, Meguro-ku, Tokyo',
      openingHours: 'Open 24 hours · Free entry',
      tags: ['Park', 'Viewpoint', 'Free', 'Relax'],
      priceLabel: 'Free',
    },
    fitScore: 98,
    replacementAction: 'Slight detour on way to Daikanyama for a 15-minute scenic rest at Saigoyama Park',
    subsequentChanges: 'No impact on later stops, only adds a 4-minute scenic loop to the walking path.',
    transitTime: '4 min extra walk (en route 220m)',
    budgetImpact: 'RM 0 · Free en-route attraction',
    isOverBudget: false,
    openingHours: 'Open 24 hours',
  },
  'skip-next': {
    chipKey: 'skip-next',
    chipLabel: '⏭️ Skip to Next',
    promptText: 'Skip to next stop · Head to next core destination early',
    reason: 'Current stop is done and surrounding area requires no further lingering. Recommend heading straight to the next anchor station.',
    targetPlace: {
      name: 'Daikanyama Main Promenade',
      description: 'Chic open-air shopping and dining promenade featuring independent designers, patisseries, and calm tree canopy.',
      address: 'Daikanyamacho, Shibuya-ku, Tokyo',
      openingHours: '10:00–20:00 · Open now',
      tags: ['Promenade', 'Architecture', 'Shopping'],
      priceLabel: 'Within budget',
    },
    fitScore: 95,
    replacementAction: 'End current waiting time early and navigate immediately to next destination',
    subsequentChanges: 'Next stop begins 35 minutes earlier, freeing up generous exploration time for tonight.',
    transitTime: '10 min walk',
    budgetImpact: 'RM 0 · No extra cost',
    isOverBudget: false,
    openingHours: '10:00–20:00 · Open now',
  },
  'add-item': {
    chipKey: 'add-item',
    chipLabel: '➕ Add Activity',
    promptText: 'Add an activity · Fill free buffer time with a highlight',
    reason: 'Detected a 60-minute buffer window between 16:30 and 17:30. Recommend enjoying popular artisan afternoon tea.',
    targetPlace: {
      name: 'Shiro-Hige Cream Puff Factory',
      description: 'Charming Miyazaki-inspired artisanal cream puff bakery and tea room hidden within peaceful greenery.',
      address: 'Daita 5-3-1, Setagaya-ku, Tokyo',
      openingHours: '10:30–19:00 · Open now',
      tags: ['Bakery', 'Dessert', 'Exclusive', 'Indoor'],
      priceLabel: 'RM 32 est.',
    },
    fitScore: 94,
    replacementAction: 'Insert artisan afternoon dessert experience into evening buffer window',
    subsequentChanges: 'Makes full use of downtime; evening 19:00 dinner anchor remains on schedule without disruption.',
    transitTime: 'Train + 14 min walk',
    budgetImpact: '+RM 32 · Within budget',
    isOverBudget: false,
    openingHours: '10:30–19:00 · Open now',
  },
};

type CocoAssistantPromptProps = {
  mode: 'solo' | 'group';
  destination: string;
  onReviewProposal: () => void;
  onApplyProposal?: (proposal: AssistantProposal) => void;
  onSendToCourt?: (proposal: AssistantProposal) => void;
};

export function CocoAssistantPrompt({
  mode,
  destination,
  onReviewProposal,
  onApplyProposal,
  onSendToCourt,
}: CocoAssistantPromptProps) {
  const [prompt, setPrompt] = useState('Can we make the afternoon gentler?');
  const [activeChip, setActiveChip] = useState<AssistantChipKey | null>(null);
  const [currentProposal, setCurrentProposal] = useState<AssistantProposal | null>(null);
  const [showPlaceDetails, setShowPlaceDetails] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [applied, setApplied] = useState(false);

  const cleanPrompt = prompt.trim();

  function handleSelectChip(key: AssistantChipKey) {
    const proposal = ASSISTANT_PROPOSALS[key];
    setActiveChip(key);
    setPrompt(proposal.promptText);
    setCurrentProposal(proposal);
    setAnswered(true);
    setApplied(false);
  }

  function handleConfirmApply() {
    if (mode === 'group') {
      if (currentProposal) onSendToCourt?.(currentProposal);
    } else {
      if (currentProposal) onApplyProposal?.(currentProposal);
    }
    setApplied(true);
    onReviewProposal();
  }

  return (
    <div className="coco-assistant-wrap">
      <h3>Ask Coco</h3>

      {/* 5 Quick Prompt Chips */}
      <div className="assistant-chips-section">
        <span className="assistant-chips-label">Quick Prompts:</span>
        <div className="assistant-prompt-chips">
          {(Object.keys(ASSISTANT_PROPOSALS) as AssistantChipKey[]).map(key => {
            const item = ASSISTANT_PROPOSALS[key];
            const isSelected = activeChip === key;
            return (
              <button
                key={key}
                type="button"
                className={`assistant-chip-btn ${isSelected ? 'active' : ''}`}
                onClick={() => handleSelectChip(key)}
              >
                {item.chipLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Text Input */}
      <label className="setup-field coco-chat-input">
        <textarea
          aria-label="Ask Coco about this trip"
          placeholder="Ask about your trip…"
          value={prompt}
          onChange={event => {
            setPrompt(event.target.value);
            setAnswered(false);
            setActiveChip(null);
            setCurrentProposal(null);
            setApplied(false);
          }}
        />
      </label>

      <button
        className="primary"
        disabled={!cleanPrompt}
        onClick={() => {
          setAnswered(true);
          if (!currentProposal) {
            setCurrentProposal(ASSISTANT_PROPOSALS['where-to-go']);
          }
        }}
      >
        Send
      </button>

      {/* AI Proposal Breakdown Preview */}
      {answered && currentProposal && (
        <section className="adapter-note coco-chat-reply" aria-live="polite">
          <div className="proposal-mascot-header">
            <Sparkles size={16} color="#930500" />
            <b>Coco Analysis &amp; Proposal</b>
            <span className="proposal-fit-badge">{currentProposal.fitScore}% Fit</span>
          </div>

          <div className="proposal-reason-box">
            <p><strong>💡 Reason: </strong>{currentProposal.reason}</p>
          </div>

          <div className="proposal-preview-grid">
            <div className="proposal-preview-row">
              <span className="preview-label">Proposed change</span>
              <b>{currentProposal.replacementAction}</b>
            </div>

            <div className="proposal-preview-row">
              <span className="preview-label">Schedule impact</span>
              <p>{currentProposal.subsequentChanges}</p>
            </div>

            <div className="proposal-preview-meta-row">
              <div className="meta-item">
                <Navigation size={13} />
                <span>Transit: <b>{currentProposal.transitTime}</b></span>
              </div>
              <div className="meta-item">
                <Clock size={13} />
                <span>Hours: <b>{currentProposal.openingHours}</b></span>
              </div>
              <div className="meta-item">
                <DollarSign size={13} />
                <span>Budget impact: <b>{currentProposal.budgetImpact}</b></span>
              </div>
            </div>
          </div>

          {/* Place Details Trigger */}
          <button
            type="button"
            className="proposal-place-details-btn"
            onClick={() => setShowPlaceDetails(true)}
          >
            <Info size={13} /> View place details ({currentProposal.targetPlace.name})
          </button>

          {/* Modal / Flyout for Place Details */}
          {showPlaceDetails && (
            <div className="place-details-dialog-overlay" onClick={() => setShowPlaceDetails(false)}>
              <div className="place-details-dialog" onClick={e => e.stopPropagation()}>
                <div className="dialog-header">
                  <b>{currentProposal.targetPlace.name}</b>
                  <button type="button" onClick={() => setShowPlaceDetails(false)}>
                    <X size={16} />
                  </button>
                </div>
                <p className="dialog-desc">{currentProposal.targetPlace.description}</p>
                <div className="dialog-meta">
                  <div><MapPin size={13} /> <span>{currentProposal.targetPlace.address}</span></div>
                  <div><Clock size={13} /> <span>{currentProposal.targetPlace.openingHours}</span></div>
                  <div><DollarSign size={13} /> <span>{currentProposal.targetPlace.priceLabel}</span></div>
                </div>
                <div className="dialog-tags">
                  {currentProposal.targetPlace.tags.map(tag => (
                    <span key={tag} className="dialog-tag">#{tag}</span>
                  ))}
                </div>
                <button className="primary" onClick={() => setShowPlaceDetails(false)}>
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Confirmation Actions */}
          {!applied ? (
            <div className="proposal-action-row">
              <button className="secondary" onClick={() => setAnswered(false)}>
                Not now
              </button>
              <button className="primary" onClick={handleConfirmApply}>
                {mode === 'group' ? 'Send to Group Court' : 'Confirm & apply'}
              </button>
            </div>
          ) : (
            <div className="success-note">
              <Check size={18} />
              <span>
                {mode === 'group'
                  ? 'Sent to Group Court for voting.'
                  : 'Proposal confirmed and applied to today’s itinerary!'}
              </span>
            </div>
          )}
        </section>
      )}

      {answered && !currentProposal && (
        <section className="adapter-note coco-chat-reply" aria-live="polite">
          <b>Coco</b>
          <small>“{cleanPrompt}”</small>
          <small>{mode === 'group' ? 'Ready to review with the group.' : `Ready to review for ${destination}.`}</small>
          <button className="secondary" onClick={onReviewProposal}>Review suggestion</button>
        </section>
      )}
    </div>
  );
}

