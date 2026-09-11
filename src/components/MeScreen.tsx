import React from 'react';
import {
  Calendar, Check, ChevronRight, FileText, Box, Plane, Image,
  MapPin, RotateCcw, Sparkles, Users
} from 'lucide-react';
import {
  deriveTingoIdentity, tingoCompletion, type TingoAnswer,
  type TingoDimensions, type TingoPersonaKey
} from '../domain/tingo';
import { cocoAsset } from './coco/assets';
import { type TripPhase } from './TripWorkspace';
import foodieHunter from '../assets/coco/personas/foodie_hunter.png';
import masterPlanner from '../assets/coco/personas/master_planner.png';
import transitNavigator from '../assets/coco/personas/transit_navigator.png';
import budgetKeeper from '../assets/coco/personas/budget_keeper.png';
import photoChaser from '../assets/coco/personas/photo_chaser.png';
import cultureExplorer from '../assets/coco/personas/culture_explorer.png';
import adventureSeeker from '../assets/coco/personas/adventure_seeker.png';
import relaxationLover from '../assets/coco/personas/relaxation_lover.png';
import shoppingScout from '../assets/coco/personas/shopping_scout.png';
import weatherWatcher from '../assets/coco/personas/weather_watcher.png';
import safetyGuardian from '../assets/coco/personas/safety_guardian.png';
import groupCoordinator from '../assets/coco/personas/group_coordinator.png';
import packingPro from '../assets/coco/personas/packing_pro.png';
import nightOwl from '../assets/coco/personas/night_owl.png';
import memoryKeeper from '../assets/coco/personas/memory_keeper.png';
import hiddenGemSeeker from '../assets/coco/personas/hidden_gem_seeker.png';

export const tingoPersonaImages: Record<TingoPersonaKey, string> = {
  'foodie-hunter': foodieHunter,
  'master-planner': masterPlanner,
  'transit-navigator': transitNavigator,
  'budget-keeper': budgetKeeper,
  'photo-chaser': photoChaser,
  'culture-explorer': cultureExplorer,
  'adventure-seeker': adventureSeeker,
  'relaxation-lover': relaxationLover,
  'shopping-scout': shoppingScout,
  'weather-watcher': weatherWatcher,
  'safety-guardian': safetyGuardian,
  'group-coordinator': groupCoordinator,
  'packing-pro': packingPro,
  'night-owl': nightOwl,
  'memory-keeper': memoryKeeper,
  'hidden-gem-seeker': hiddenGemSeeker,
};

export type PersonaDetail = {
  label: string;
  tagline: string;
  tags: string[];
  summary: string;
};

export const tingoPersonaDetails: Record<TingoPersonaKey, PersonaDetail> = {
  'hidden-gem-seeker': {
    label: 'Hidden Gem Seeker',
    tagline: 'Handles unique spots',
    tags: ['FOOD', 'CULTURE', 'EXPLORATION', 'LOCAL LIVING'],
    summary: 'You love meaningful local experiences, unhurried moments and good food along the way.',
  },
  'foodie-hunter': {
    label: 'Foodie Hunter',
    tagline: 'Handles food picks',
    tags: ['FOOD', 'LOCAL TASTES', 'MARKETS', 'DINING'],
    summary: 'You read the trip through memorable meals, delicious street snacks and local food culture.',
  },
  'master-planner': {
    label: 'Master Planner',
    tagline: 'Handles trip structure',
    tags: ['ITINERARY', 'TIMING', 'SMOOTH PACE', 'PROTECTED ANCHORS'],
    summary: 'You craft well-balanced itineraries with clear timing so the whole trip feels effortless and calm.',
  },
  'transit-navigator': {
    label: 'Transit Navigator',
    tagline: 'Handles routes & connections',
    tags: ['ROUTES', 'TRANSIT', 'EFFICIENCY', 'SMOOTH MOVES'],
    summary: 'You navigate connections, subway maps and transit tradeoffs to keep everyone moving smoothly.',
  },
  'budget-keeper': {
    label: 'Budget Keeper',
    tagline: 'Handles smart spending',
    tags: ['SMART VALUE', 'BUDGET CALM', 'HIDDEN SAVINGS', 'SPEND WISELY'],
    summary: 'You find clever ways to maximize joy and protect budgets without making the trip feel smaller.',
  },
  'photo-chaser': {
    label: 'Photo Chaser',
    tagline: 'Handles scenic moments',
    tags: ['SCENIC VIEWS', 'GOLDEN HOUR', 'MEMORY CARDS', 'ICONIC SPOTS'],
    summary: 'You seek out once-in-a-trip scenery, golden hour viewpoints and the best memory-worthy spots.',
  },
  'culture-explorer': {
    label: 'Culture Explorer',
    tagline: 'Handles heritage & stories',
    tags: ['TEMPLES', 'HERITAGE', 'LOCAL ART', 'STORIES'],
    summary: 'You immerse yourself in historical quarters, museum quiet and centuries-old local traditions.',
  },
  'adventure-seeker': {
    label: 'Adventure Seeker',
    tagline: 'Handles bold activities',
    tags: ['HIKING', 'COASTLINES', 'NATURE', 'BOLD ENERGY'],
    summary: 'You thrive on coastal walks, summit views and active exploration that gets your heart pumping.',
  },
  'relaxation-lover': {
    label: 'Relaxation Lover',
    tagline: 'Handles restful pace',
    tags: ['SLOW MORNINGS', 'TEA HOUSES', 'UNHURRIED', 'COASTAL CALM'],
    summary: 'You protect gentle mornings, cozy tea stops and peaceful interludes where time slows down.',
  },
  'shopping-scout': {
    label: 'Shopping Scout',
    tagline: 'Handles boutiques & finds',
    tags: ['CERAMICS', 'VINTAGE', 'LOCAL CRAFTS', 'DESIGN SHOPS'],
    summary: 'You discover tucked-away craft studios, stationery shops and authentic design souvenirs.',
  },
  'weather-watcher': {
    label: 'Weather Watcher',
    tagline: 'Handles climate & flow',
    tags: ['RAIN BACKUPS', 'SUNNY PATHS', 'ADAPTIVE', 'COMFORT'],
    summary: 'You watch the skies, anticipate changes and seamlessly adapt plans to keep the vibe joyful.',
  },
  'safety-guardian': {
    label: 'Safety Guardian',
    tagline: 'Handles reassurance & care',
    tags: ['LOW CHAOS', 'SAFE PATHS', 'PREPARED', 'PEACE OF MIND'],
    summary: 'You keep routes safe, emergencies anticipated and travel companions feeling secure and cared for.',
  },
  'group-coordinator': {
    label: 'Group Coordinator',
    tagline: 'Handles harmony & choices',
    tags: ['SHARED JOY', 'CONSENSUS', 'TEAM SPIRIT', 'FAIR CHOICES'],
    summary: 'You keep everyone engaged, listen to every voice and ensure group decisions feel effortless and fair.',
  },
  'packing-pro': {
    label: 'Packing Pro',
    tagline: 'Handles gear & essentials',
    tags: ['LIGHT LUGGAGE', 'ORGANIZED', 'ESSENTIALS', 'SMART PACKING'],
    summary: 'You pack smart, light and organized, ensuring nothing essential gets left behind.',
  },
  'night-owl': {
    label: 'Night Owl',
    tagline: 'Handles evening momentum',
    tags: ['NIGHTLIFE', 'EVENING WALKS', 'LATE BITES', 'CITY LIGHTS'],
    summary: 'You come alive after dusk, exploring illuminated cityscapes, cozy taverns and night markets.',
  },
  'memory-keeper': {
    label: 'Memory Keeper',
    tagline: 'Handles keepsakes & stories',
    tags: ['JOURNALS', 'POSTCARDS', 'MEMENTOS', 'SHARED STORIES'],
    summary: 'You curate ticket stubs, handwritten notes and photo keepsakes that preserve the magic.',
  },
};

export function SuitcaseGraphic() {
  return (
    <svg viewBox="0 0 100 85" className="me-suitcase-svg" aria-hidden="true">
      <path d="M12,18 L14,14 L18,16 L14,18 L12,22 L10,18 L6,16 L10,14 Z" fill="#f6a83e" opacity="0.8" />
      <path d="M88,14 L90,11 L93,12 L90,14 L91,17 L89,14 L86,13 L89,11 Z" fill="#f6a83e" opacity="0.8" />
      <path d="M8,70 L9,68 L11,69 L9,70 L10,72 L8,71 L7,70 L8,68 Z" fill="#f6a83e" opacity="0.7" />
      <path d="M92,62 L93,60 L95,61 L93,62 L94,64 L92,63 L91,62 L92,60 Z" fill="#f6a83e" opacity="0.7" />

      <ellipse cx="50" cy="80" rx="42" ry="4" fill="rgba(20, 40, 80, 0.15)" />

      <rect x="12" y="24" width="76" height="52" rx="8" fill="#8d5b36" stroke="#683d1c" strokeWidth="1.5" />
      <rect x="14" y="26" width="72" height="48" rx="6" fill="#a46d43" />

      <path d="M12,34 L22,24 L12,24 Z" fill="#583115" />
      <path d="M88,34 L78,24 L88,24 Z" fill="#583115" />
      <path d="M12,66 L22,76 L12,76 Z" fill="#583115" />
      <path d="M88,66 L78,76 L88,76 Z" fill="#583115" />
      <circle cx="15" cy="27" r="1" fill="#dfad5c" />
      <circle cx="85" cy="27" r="1" fill="#dfad5c" />
      <circle cx="15" cy="73" r="1" fill="#dfad5c" />
      <circle cx="85" cy="73" r="1" fill="#dfad5c" />

      <rect x="28" y="24" width="7" height="52" fill="#583115" />
      <rect x="65" y="24" width="7" height="52" fill="#583115" />
      <rect x="27" y="44" width="9" height="6" rx="1.5" fill="#dfad5c" stroke="#8d5b36" strokeWidth="0.8" />
      <rect x="64" y="44" width="9" height="6" rx="1.5" fill="#dfad5c" stroke="#8d5b36" strokeWidth="0.8" />

      <path d="M40,24 C40,16 60,16 60,24" fill="none" stroke="#583115" strokeWidth="4" strokeLinecap="round" />
      <rect x="38" y="21" width="5" height="4" rx="1" fill="#dfad5c" />
      <rect x="57" y="21" width="5" height="4" rx="1" fill="#dfad5c" />

      <g transform="translate(42, 32) rotate(-5)">
        <rect x="0" y="0" width="16" height="15" rx="3" fill="#ffffff" />
        <rect x="1" y="1" width="14" height="13" rx="2" fill="#1b72e8" />
        <path d="M2,11 Q5,7 9,9 Q13,11 14,8 L14,13 L2,13 Z" fill="#ffffff" />
        <circle cx="11" cy="4" r="2" fill="#fbbf24" />
      </g>

      <g transform="translate(20, 52) rotate(6)">
        <rect x="0" y="0" width="15" height="15" rx="3" fill="#ffffff" />
        <rect x="1" y="1" width="13" height="13" rx="2" fill="#f59e0b" />
        <circle cx="7.5" cy="7.5" r="4.5" fill="#ffffff" />
        <circle cx="7.5" cy="7.5" r="3" fill="#ea580c" />
        <path d="M8,6 Q8,2 7,1" stroke="#2e7d32" strokeWidth="1.5" fill="none" />
        <ellipse cx="8" cy="14" rx="5" ry="1.5" fill="#f59e0b" opacity="0.6" />
      </g>

      <g transform="translate(45, 54) rotate(-3)">
        <rect x="0" y="0" width="18" height="16" rx="3" fill="#ffffff" />
        <rect x="1" y="1" width="16" height="14" rx="2" fill="#fff7ed" />
        <circle cx="9" cy="8" r="4" fill="#f97316" />
        <polygon points="2,14 7,8 11,14" fill="#0284c7" />
        <polygon points="8,14 12,6 16,14" fill="#0369a1" />
      </g>
    </svg>
  );
}

export type MeScreenProps = {
  tingoAnswers: TingoAnswer[];
  tingoDimensions: TingoDimensions;
  personaOverride?: TingoPersonaKey | null;
  onSelectPersona?: (key: TingoPersonaKey) => void;
  retakeTingo: () => void;
  setDrawer: (drawer: any) => void;
  openTrip: (phase: TripPhase) => void;
  openPacking: () => void;
  tripPhase: TripPhase;
  destination: string;
  learningProposal: any;
  confirmLearning: () => void;
  dismissLearning: () => void;
  confirmedLearningHistory: any[];
};

export function MeScreen({
  tingoAnswers = [],
  tingoDimensions,
  personaOverride,
  retakeTingo,
  setDrawer,
  openTrip,
  openPacking,
  tripPhase,
  destination,
  learningProposal,
  confirmLearning,
  dismissLearning,
  confirmedLearningHistory,
}: MeScreenProps) {
  const isAssessed = tingoCompletion(tingoAnswers) === 100;
  const identity = deriveTingoIdentity(tingoDimensions);
  const currentPersonaKey = personaOverride ?? identity.personaKey;
  const detail = tingoPersonaDetails[currentPersonaKey] ?? tingoPersonaDetails['hidden-gem-seeker'];
  const personaImage = tingoPersonaImages[currentPersonaKey] ?? tingoPersonaImages['hidden-gem-seeker'];
  const typeLabel = detail.label;
  const typeCopy = detail.summary;
  const personaTagline = detail.tagline;
  const personaTags = detail.tags;

  return (
    <div className="me-screen">
      {/* 1. MY TINGO CARD */}
      <section className="me-tingo-card redesign-card paper-sheet">
        <svg className="me-card-bg-deco" viewBox="0 0 340 180" fill="none" aria-hidden="true">
          <path d="M150,30 Q180,20 220,35 Q260,50 280,30 Q300,50 290,80 Q270,110 240,100 Q200,120 180,90 Q150,80 150,30 Z" fill="#ebf4fc" opacity="0.6" />
          <path d="M20,60 Q50,40 80,65 Q90,90 70,110 Q40,120 25,100 Z" fill="#ebf4fc" opacity="0.5" />
          <path d="M60,140 Q150,110 205,42" stroke="#4a89d0" strokeWidth="1.2" strokeDasharray="3 4" opacity="0.4" fill="none" />
          <g transform="translate(205, 38) rotate(35) scale(0.65)">
            <path d="M0,0 L14,6 L18,4 L10,0 L18,-4 L14,-6 Z" fill="#1b72e8" />
            <path d="M4,1 L2,8 L5,8 L7,1 Z" fill="#1b72e8" />
            <path d="M4,-1 L2,-8 L5,-8 L7,-1 Z" fill="#1b72e8" />
          </g>
        </svg>

        {isAssessed ? (
          <>
            <div className="me-card-copy">
              <span className="me-tingo-kicker">MY TINGO CARD</span>

              <h2>
                You&apos;re a<br />
                {typeLabel === 'Hidden Gem Seeker' ? (
                  <>Hidden Gem<br />Seeker</>
                ) : typeLabel.split(' ').length === 2 ? (
                  <>{typeLabel.split(' ')[0]}<br />{typeLabel.split(' ')[1]}</>
                ) : typeLabel.split(' ').length > 2 ? (
                  <>{typeLabel.split(' ').slice(0, 2).join(' ')}<br />{typeLabel.split(' ').slice(2).join(' ')}</>
                ) : (
                  typeLabel
                )}
              </h2>

              <p>{typeCopy}</p>

              <div className="me-chip-row">
                {personaTags.map(tag => (
                  <small key={tag}>{tag}</small>
                ))}
              </div>

              <div className="me-tingo-actions-col">
                <button className="me-all-types-link" onClick={() => setDrawer('all-personas')}>
                  <Users size={15} />
                  <span>See all 16 travel types</span>
                  <span className="arrow">→</span>
                </button>
                <button className="me-retake-link" onClick={retakeTingo}>
                  <RotateCcw size={13} />
                  <span>Retake assessment</span>
                </button>
              </div>
            </div>

            <div className="me-card-collage">
              <div className="me-handwritten-note-top">
                <span>Small<br />Places<br />Big Stories</span>
                <span className="sparks">彡</span>
              </div>

              <div className="me-floating-mini-card">
                <img className="me-persona-art" src={personaImage} alt={`${typeLabel} illustration`} />
                <span className="me-persona-badge">{typeLabel}</span>
                <small className="me-persona-subtag">{personaTagline}</small>
              </div>

              <button
                className="me-view-profile-btn"
                onClick={() => setDrawer('tingo')}
              >
                <span>View profile</span>
                <span className="arrow">→</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="me-card-copy">
              <span className="me-tingo-kicker">DISCOVER YOUR TRAVEL DNA</span>

              <h2>
                What kind of<br />
                traveller are you?
              </h2>

              <p>
                Take our quick 2-minute vibe quiz to unlock your personal Tingo Card, travel rhythm, and tailor-made spot suggestions.
              </p>

              <div className="me-chip-row me-chip-row--unassessed">
                <small>16 TRAVEL TYPES</small>
                <small>SMART MATCH</small>
                <small>UNHURRIED VIBES</small>
              </div>

              <div className="me-tingo-actions-col">
                <button className="me-all-types-link" onClick={() => setDrawer('all-personas')}>
                  <Users size={15} />
                  <span>Explore all 16 personas</span>
                  <span className="arrow">→</span>
                </button>
                <span className="me-quiz-badge-note">
                  <Sparkles size={12} />
                  <span>2 min vibe quiz · No wrong answers</span>
                </span>
              </div>
            </div>

            <div className="me-card-collage">
              <div className="me-handwritten-note-top">
                <span>Find<br />Your<br />Travel Vibe</span>
                <span className="sparks">✦</span>
              </div>

              <div className="me-floating-mini-card me-floating-mini-card--unassessed">
                <img className="me-persona-art" src={cocoAsset('action-binoculars')} alt="Mystery travel persona" />
                <span className="me-persona-badge">Mystery Persona ✦</span>
                <small className="me-persona-subtag">Waiting to be unlocked ✨</small>
              </div>

              <button
                className="me-view-profile-btn me-start-assessment-btn"
                onClick={retakeTingo}
              >
                <span>Start assessment</span>
                <span className="arrow">→</span>
              </button>
            </div>
          </>
        )}
      </section>

      {/* 2. CURRENT TRIP CARD (Jeju In Amber) */}
      <section className="me-trip-card redesign-trip paper-sheet">
        <div className="me-trip-hero-section">
          <div className="me-postmark-stamp">
            <b>JEJU</b>
            <small>SOUTH KOREA</small>
          </div>

          <div className="me-good-journeys-note">
            <span>Good<br />Journeys<br />Ahead</span>
            <span className="sparks">彡</span>
            <div className="underline" />
          </div>

          <span className="me-trip-tag-pill">CURRENT TRIP</span>
          <h2>Jeju In Amber</h2>

          <div className="me-trip-meta-list">
            <div className="me-trip-meta-item">
              <Calendar size={13} />
              <span>20 - 24 Nov 2026</span>
            </div>
            <div className="me-trip-meta-item">
              <MapPin size={13} />
              <span>Jeju Island, South Korea</span>
            </div>
          </div>

          <p className="me-trip-blurb">Volcanic beauty, coastal trails and incredible local cuisine awaits.</p>

          <button className="me-open-trip-btn" onClick={() => openTrip(tripPhase)}>
            <span>Open active trip</span>
            <span className="arrow">→</span>
          </button>

          <div className="me-trip-scallop-divider" aria-hidden="true">
            <svg viewBox="0 0 400 14" preserveAspectRatio="none" fill="#ffffff">
              <path d="M0,14 L0,8 Q12.5,0 25,8 Q37.5,16 50,8 Q62.5,0 75,8 Q87.5,16 100,8 Q112.5,0 125,8 Q137.5,16 150,8 Q162.5,0 175,8 Q187.5,16 200,8 Q212.5,0 225,8 Q237.5,16 250,8 Q262.5,0 275,8 Q287.5,16 300,8 Q312.5,0 325,8 Q337.5,16 350,8 Q362.5,0 375,8 Q387.5,16 400,8 L400,14 Z" />
            </svg>
          </div>
        </div>

        <div className="me-phase-tracker-bar">
          <div className="me-tracker-steps-grid" aria-label="Trip progress">
            <button className="me-phase-step-btn" onClick={() => openTrip('planning')}>
              <div className="me-step-icon-box">
                <FileText size={20} />
                <div className="me-step-check-dot"><Check size={8} /></div>
              </div>
              <span>Plan</span>
            </button>
            <button className="me-phase-step-btn" onClick={openPacking}>
              <div className="me-step-icon-box">
                <Box size={20} />
                <div className="me-step-check-dot"><Check size={8} /></div>
              </div>
              <span>Pack</span>
            </button>
            <button className="me-phase-step-btn is-active" onClick={() => openTrip('traveling')}>
              <div className="me-step-icon-box me-step-active-circle">
                <Plane size={20} />
              </div>
              <span>Go</span>
            </button>
            <button className="me-phase-step-btn" onClick={() => openTrip('completed')}>
              <div className="me-step-icon-box">
                <Image size={20} />
              </div>
              <span>Memories</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. PACKING SUMMARY CARD */}
      <section className="me-summary-card redesign-summary paper-sheet" onClick={openPacking}>
        <svg className="me-summary-bg-track" viewBox="0 0 340 90" fill="none" aria-hidden="true">
          <path d="M120,65 Q210,50 255,20" stroke="#4a89d0" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" />
          <g transform="translate(225, 28) rotate(-25) scale(0.55)">
            <path d="M0,0 L14,6 L18,4 L10,0 L18,-4 L14,-6 Z" fill="#1b72e8" opacity="0.6" />
          </g>
        </svg>

        <div className="me-summary-content">
          <div className="me-summary-head-row">
            <h3>Packing Summary</h3>
            <span className="me-summary-pct">70%</span>
          </div>
          <div className="me-progress-bar-track">
            <div className="me-progress-bar-fill" style={{ width: '70%' }} />
          </div>
          <span className="me-summary-subtext">14 / 20 items packed</span>
          <div className="me-summary-pill">Almost there! Great progress!</div>
        </div>

        <div className="me-summary-right-visual">
          <div className="me-suitcase-container">
            <SuitcaseGraphic />
          </div>
          <button className="me-round-nav-btn" aria-label="Open packing">
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* 4. PROFILE HISTORY CARD */}
      <section className="me-history-card redesign-history paper-sheet" onClick={() => setDrawer('tingo')}>
        <div className="me-history-content">
          <h3>Profile History</h3>
          <p>Look back on your trips, memories and how you&apos;ve grown.</p>
          <div className="me-summary-pill">Your journey tells a great story!</div>
        </div>

        <div className="me-summary-right-visual">
          <div className="me-polaroid-stack-wrap">
            <div className="me-polaroid-card me-polaroid-back">
              <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=260&auto=format&fit=crop&q=80" alt="Coast" />
            </div>
            <div className="me-polaroid-card me-polaroid-front">
              <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=260&auto=format&fit=crop&q=80" alt="Sunset" />
            </div>
            <div className="me-polaroid-post-it">
              <span>More<br />Good<br />Places</span>
            </div>
          </div>
          <button className="me-round-nav-btn" aria-label="Open profile history">
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* Learning Handoff / Confirmation if present */}
      {learningProposal?.status === 'proposed' && (
        <section className="learning-handoff paper-sheet">
          <div>
            <span>TRIP LEARNING · REVIEW BEFORE APPLY</span>
            <h3>{destination} has a proposal for your long-term Tingo.</h3>
            <p>These changes came from this trip’s actual outcome and will not apply until you confirm them.</p>
            {learningProposal.changes.map((change: any) => (
              <small key={change.questionId}>
                {change.questionId}: {change.beforeOptionId ?? 'none'} → {change.afterOptionId} · {change.reason}
              </small>
            ))}
          </div>
          <div className="learning-handoff-actions">
            <button className="secondary" onClick={() => openTrip('completed')}>Review in Completed</button>
            <button className="primary" onClick={confirmLearning}>Confirm this learning</button>
            <button className="secondary" onClick={dismissLearning}>Dismiss</button>
          </div>
        </section>
      )}

      {confirmedLearningHistory.length > 0 && (
        <section className="learning-history paper-sheet">
          <span>CONFIRMED TINGO LEARNING</span>
          <h3>What you chose to carry forward</h3>
          {confirmedLearningHistory.slice(0, 3).map((record: any) => (
            <div key={record.id}>
              <b>{record.sourceTripReview === 'yes' ? 'Worth it' : record.sourceTripReview === 'mixed' ? 'Mixed' : 'Not really'} · {new Date(record.confirmedAt).toLocaleDateString()}</b>
              {record.changes.map((change: any) => (
                <small key={change.questionId}>{change.questionId}: {change.beforeOptionId ?? 'none'} → {change.afterOptionId}</small>
              ))}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
