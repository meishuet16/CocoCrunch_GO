import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Lock,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react';
import type { PhotoMemoryArtifact, DecisionRecord } from '../persistence';
import type { TripIntent } from '../domain/trip-intent';
import type { TripPlan } from '../domain/itinerary';
import type { TripMember } from '../domain/trip';
import type { TripReview } from '../domain/preferences';
import { CocoCompanion } from './coco/CocoCompanion';
import { getPlacePhoto } from './explore/explorePhotos';

export type MemoryTripItem = {
  id: string;
  name: string;
  destination: string;
  mode: 'group' | 'solo';
  status?: string;
  completedDate?: string;
};

export type MemoryScreenProps = {
  initialTripId?: string | null;
  destination: string;
  mode: 'group' | 'solo';
  tripIntent?: TripIntent;
  plan?: TripPlan;
  photoArtifacts: PhotoMemoryArtifact[];
  onPhotoArtifactsChange: (artifacts: PhotoMemoryArtifact[]) => void;
  itemReviews: Record<string, 'worth' | 'mixed' | 'skip'>;
  onItemReviewChange: (placeId: string, rating: 'worth' | 'mixed' | 'skip') => void;
  decisionHistory: DecisionRecord[];
  onRateDecision?: (id: string, satisfaction: 'worth' | 'mixed' | 'skip') => void;
  categoryVariance?: Array<{ category: string; planned: number; actual: number; status: string }>;
  spent?: number;
  totalBudget?: number;
  worthIt?: TripReview | null;
  onRecordWorthIt?: (value: TripReview) => void;
  members?: TripMember[];
  tripList?: MemoryTripItem[];
  onManageCommunity?: () => void;
};

// Initial realistic default photo artifacts if none exist
function buildDefaultArtifacts(destination: string): PhotoMemoryArtifact[] {
  const dest = destination || 'Tokyo';
  return [
    {
      id: 'photo-default-1',
      title: 'Tsukiji Outer Market Morning Seafood Don',
      body: 'Morning tamagoyaki and kaisen don were unforgettable! Waiting 20 minutes was totally worth it, vibrant street atmosphere.',
      source: 'EXIF 2099-10-12 09:30 · GPS Tagged',
      locationLabel: 'Tsukiji Outer Market',
      audience: 'personal',
      isPublic: true,
      capturedAt: '2099-10-12 09:30',
      archiveDay: 1,
      archivePlace: 'Tsukiji Outer Market',
      latitude: 35.6655,
      longitude: 139.7707,
    },
    {
      id: 'photo-default-2',
      title: 'Meiji Jingu Shrine Torii Avenue',
      body: 'Walking the gravel path under massive cedar trees felt so peaceful as sunlight filtered through. Even caught a glimpse of a traditional wedding procession.',
      source: 'EXIF 2099-10-12 14:15 · GPS Tagged',
      locationLabel: 'Meiji Jingu Shrine',
      audience: 'personal',
      isPublic: false,
      capturedAt: '2099-10-12 14:15',
      archiveDay: 1,
      archivePlace: 'Meiji Jingu',
      latitude: 35.6764,
      longitude: 139.6993,
    },
    {
      id: 'photo-default-3',
      title: 'Shibuya Sky Sunset Panorama',
      body: 'Unbelievable 360-degree vista of the Shibuya scramble crossing and Mt. Fuji silhouette at dusk! Booking twilight tickets early paid off.',
      source: 'EXIF 2099-10-13 17:00 · GPS Tagged',
      locationLabel: 'Shibuya Sky',
      audience: 'personal',
      isPublic: true,
      capturedAt: '2099-10-13 17:00',
      archiveDay: 2,
      archivePlace: 'Shibuya Sky',
      latitude: 35.658,
      longitude: 139.7016,
    },
    {
      id: 'photo-default-4',
      title: 'Omoide Yokocho Yakitori Night',
      body: 'Atmospheric izakaya alley filled with savory grill aromas. Grilled skewers paired with crisp draft beer while we lingered for hours.',
      source: 'EXIF 2099-10-13 20:30 · GPS Tagged',
      locationLabel: 'Omoide Yokocho',
      audience: 'group',
      isPublic: false,
      capturedAt: '2099-10-13 20:30',
      archiveDay: 2,
      archivePlace: 'Omoide Yokocho',
      latitude: 35.6938,
      longitude: 139.6995,
    },
    {
      id: 'photo-default-5',
      title: 'Akihabara Gacha & Retro Walk',
      body: 'Drew the rare CocoCrunch hidden capsule! Followed by a relaxing pour-over Mandheling coffee in a quiet neighborhood cafe.',
      source: 'EXIF 2099-10-14 11:30 · GPS Tagged',
      locationLabel: 'Akihabara Station Area',
      audience: 'personal',
      isPublic: true,
      capturedAt: '2099-10-14 11:30',
      archiveDay: 3,
      archivePlace: 'Akihabara',
      latitude: 35.6983,
      longitude: 139.7731,
    },
    {
      id: 'photo-default-6',
      title: 'Roppongi Hills Mori Art Museum Night View',
      body: 'Inspiring contemporary art exhibits and stunning nighttime vistas of Tokyo Tower from the 52nd-floor deck. Perfect ambiance.',
      source: 'EXIF 2099-10-14 19:15 · GPS Tagged',
      locationLabel: 'Roppongi Hills Mori Art Museum',
      audience: 'personal',
      isPublic: true,
      capturedAt: '2099-10-14 19:15',
      archiveDay: 3,
      archivePlace: 'Roppongi Hills',
      latitude: 35.6605,
      longitude: 139.7292,
    },
  ];
}

export function MemoryScreen({
  initialTripId,
  destination = 'Tokyo',
  mode = 'group',
  tripIntent,
  plan,
  photoArtifacts,
  onPhotoArtifactsChange,
  itemReviews,
  onItemReviewChange,
  decisionHistory,
  onRateDecision,
  categoryVariance,
  spent = 2150,
  totalBudget = 2400,
  worthIt,
  onRecordWorthIt,
  members = [],
  tripList = [],
  onManageCommunity,
}: MemoryScreenProps) {
  // Selected past trip ID (null means viewing the trips list matching Image 2)
  const [selectedTripId, setSelectedTripId] = useState<string | null>(initialTripId ?? null);

  // Sub-navigation segment tab state inside detail view
  const [activeTab, setActiveTab] = useState<'all' | 'journal' | 'retrospective' | 'decisions'>('all');

  // Photo presentation view toggle: photo map vs timeline
  const [journalView, setJournalView] = useState<'both' | 'map' | 'timeline'>('both');

  // Selected map location filter
  const [selectedMapPlace, setSelectedMapPlace] = useState<string | null>(null);

  // Active editing note card ID
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState('');

  // Prepare completed trips list for Image 2 layout
  const pastGroupTrips: MemoryTripItem[] = tripList.filter(t => t.mode === 'group');
  const pastSoloTrips: MemoryTripItem[] = tripList.filter(t => t.mode === 'solo');

  // If no past trips yet, create the canonical completed trip (e.g. g'g / Tokyo from Image 2)
  if (pastGroupTrips.length === 0 && pastSoloTrips.length === 0) {
    pastGroupTrips.push({
      id: 'past-trip-1',
      name: "g'g",
      destination: destination || 'Tokyo',
      mode: 'group',
      completedDate: 'Oct 2026',
    });
  }

  // Ensure we have artifacts to display
  const effectiveArtifacts = photoArtifacts.length > 0
    ? photoArtifacts
    : buildDefaultArtifacts(destination);

  // Filtered artifacts if a map place is selected
  const displayArtifacts = selectedMapPlace
    ? effectiveArtifacts.filter(a => (a.archivePlace || a.locationLabel).includes(selectedMapPlace))
    : effectiveArtifacts;

  // Toggle privacy for a specific photo card
  const togglePrivacy = (id: string) => {
    const next = effectiveArtifacts.map(card => {
      if (card.id === id) {
        return { ...card, isPublic: !card.isPublic };
      }
      return card;
    });
    onPhotoArtifactsChange(next);
  };

  // Start editing a memory card note
  const startEditNote = (id: string, currentNote: string) => {
    setEditingCardId(id);
    setDraftNote(currentNote);
  };

  // Save edited note
  const saveNote = (id: string) => {
    const next = effectiveArtifacts.map(card => {
      if (card.id === id) {
        return { ...card, body: draftNote };
      }
      return card;
    });
    onPhotoArtifactsChange(next);
    setEditingCardId(null);
  };

  // Group artifacts by Day for Timeline presentation
  const groupedByDay = displayArtifacts.reduce((acc, card) => {
    const day = card.archiveDay || 1;
    if (!acc[day]) acc[day] = [];
    acc[day].push(card);
    return acc;
  }, {} as Record<number, PhotoMemoryArtifact[]>);

  // List of visited places for "Worth It" review
  const visitedStops = [
    { id: 'tsukiji', name: 'Tsukiji Outer Market', type: 'food', desc: 'Seafood donburi and traditional street food crawl' },
    { id: 'meiji', name: 'Meiji Jingu Shrine', type: 'temple', desc: 'Tranquil forest stroll and sacred shrine visit' },
    { id: 'shibuya', name: 'Shibuya Sky', type: 'scenery', desc: '360° panoramic city skyline and golden hour sunset' },
    { id: 'shinjuku-izakaya', name: 'Omoide Yokocho', type: 'food', desc: 'Vintage alleyways, yakitori grills, and local taverns' },
    { id: 'akihabara', name: 'Akihabara Electric Town', type: 'walk', desc: 'Anime culture, collectibles, and special gachapon' },
    { id: 'roppongi', name: 'Roppongi Hills Mori Art Museum', type: 'art', desc: 'Modern art exhibits and illuminated Tokyo Tower view' },
  ];

  // Said vs Done structured comparison data
  const saidDoneItems = [
    {
      topic: 'Trip Vibe & Rhythm',
      said: tripIntent?.tripVibe || 'Slow food & side streets exploration',
      done: 'Explored 5 authentic heritage eateries, but shopping pushed daily step count to 16,800 steps (+35% over target).',
      gapBadge: 'Slightly faster pace · Minor gap',
      gapType: 'shifted',
      insight: 'Rhythm was slightly more packed than planned. Recommend adding a 30-minute cafe breather each afternoon on future trips.',
    },
    {
      topic: 'Must-Go Priorities',
      said: tripIntent?.mustGo || 'Tsukiji early morning seafood don walk',
      done: 'Completed smoothly on Day 1 at 09:30, spent 2.5 hours, unanimously rated "Worth It" 🌟 by everyone.',
      gapBadge: '100% Achieved · Perfect match',
      gapType: 'matched',
      insight: 'Core wish completely fulfilled, actual visit was 45 minutes longer than planned with top satisfaction.',
    },
    {
      topic: 'Deal-Breaker Guardrails',
      said: tripIntent?.dealBreaker || 'No red-eye flights, avoid walking continuously for over 4 hours',
      done: 'Daytime flights both ways, longest continuous walk stayed under 3 hours with 2 scheduled afternoon tea breaks.',
      gapBadge: 'Strictly kept · High energy',
      gapType: 'matched',
      insight: 'Energy baseline preserved successfully with zero group exhaustion or burnout.',
    },
    {
      topic: 'Time Allocation Shift',
      said: 'Planned: Food 30% · Sightseeing 45% · Free Wandering 25%',
      done: 'Actual: Food & Dining 42% · Sightseeing 33% · Free Wandering 25%',
      gapBadge: 'Dining share increased',
      gapType: 'shifted',
      insight: 'Invested 4.5 extra hours in leisurely dining and food discoveries, trading superficial sightseeing for deeper culinary memories.',
    },
  ];

  // Budget comparison data
  const defaultBudgetItems = [
    { category: 'Stay', planned: 800, actual: 780, unit: 'RM' },
    { category: 'Dining', planned: 600, actual: 750, unit: 'RM' },
    { category: 'Transit', planned: 350, actual: 320, unit: 'RM' },
    { category: 'Activities', planned: 300, actual: 240, unit: 'RM' },
    { category: 'Shopping', planned: 350, actual: 390, unit: 'RM' },
  ];

  const budgetItems = categoryVariance && categoryVariance.length > 0
    ? categoryVariance.map(c => ({
      category: c.category,
      planned: c.planned,
      actual: c.actual,
      unit: 'RM',
    }))
    : defaultBudgetItems;

  const totalPlanned = budgetItems.reduce((s, i) => s + i.planned, 0) || totalBudget;
  const totalActual = budgetItems.reduce((s, i) => s + i.actual, 0) || spent;
  const totalVariance = totalActual - totalPlanned;

  // Curated Group Decision Records
  const groupDecisions: DecisionRecord[] = decisionHistory.length > 0
    ? decisionHistory
    : [
      {
        id: 'court-decision-1',
        kind: 'court',
        topic: 'Day 1 Dinner Dispute: Ramen Queue vs Yakiniku Izakaya',
        decision: 'Adopted compromise: 18:30 Tonkotsu ramen first, then 21:00 walk to izakaya for late-night drinks & skewers',
        voteSummary: 'Priya, Alex (Ramen 🍜) vs Sam, Riley (Izakaya 🥩) · 2 : 2 Deadlock',
        usedGacha: true,
        satisfaction: 'worth',
        createdAt: 'Day 1 · 17:45',
      },
      {
        id: 'court-decision-2',
        kind: 'court',
        topic: 'Day 2 Early Asakusa vs Sleep In',
        decision: 'Depart together at 10:00 to dodge morning rush hour; lunch moved back by 45 minutes',
        voteSummary: '3 votes for sleeping in, 1 vote for early start (passed by majority)',
        usedGacha: false,
        satisfaction: 'worth',
        createdAt: 'Day 2 · 08:30',
      },
    ];

  // =========================================================================
  // VIEW 1: TRIPS-STYLE LIST (Matching Image 2 exactly, with labeled sections)
  // =========================================================================
  if (!selectedTripId) {
    return (
      <div className="memories-screen" aria-label="Memories">
        <section className="trips-index" style={{ paddingTop: 10 }}>
          {pastGroupTrips.length > 0 && (
            <section className="trip-list-section">
              <span className="trips-index-heading">GROUP TRIPS</span>
              {pastGroupTrips.map(trip => (
                <button
                  key={trip.id}
                  type="button"
                  className="trips-index-card cc-card"
                  onClick={() => setSelectedTripId(trip.id)}
                >
                  <CocoCompanion context="planning" pose="action-map" size={58} />
                  <div>
                    <div className="memory-card-title-row">
                      <b>{trip.name}</b>
                      <span className="memory-trip-tag">COMPLETED</span>
                    </div>
                    <small>{trip.destination} · Completed {trip.completedDate || 'Oct 2026'}</small>
                  </div>
                  <ChevronRight size={18} />
                </button>
              ))}
            </section>
          )}

          {pastSoloTrips.length > 0 && (
            <section className="trip-list-section">
              <span className="trips-index-heading">SOLO TRIPS</span>
              {pastSoloTrips.map(trip => (
                <button
                  key={trip.id}
                  type="button"
                  className="trips-index-card cc-card"
                  onClick={() => setSelectedTripId(trip.id)}
                >
                  <CocoCompanion context="planning" pose="action-journal" size={58} />
                  <div>
                    <div className="memory-card-title-row">
                      <b>{trip.name}</b>
                      <span className="memory-trip-tag">COMPLETED</span>
                    </div>
                    <small>{trip.destination} · Completed {trip.completedDate || 'Oct 2026'}</small>
                  </div>
                  <ChevronRight size={18} />
                </button>
              ))}
            </section>
          )}
        </section>
      </div>
    );
  }

  // Active selected trip info (when viewing details)
  const activeTrip = [...pastGroupTrips, ...pastSoloTrips].find(t => t.id === selectedTripId) || pastGroupTrips[0] || pastSoloTrips[0];
  const activeDestination = activeTrip?.destination || destination || 'Tokyo';
  const activeMode = activeTrip?.mode || mode;

  // =========================================================================
  // VIEW 2: DETAILED MEMORY & RETROSPECTIVE (7 Core Features)
  // STRICT COLOR SCHEME: ALL TEXT ONLY BLACK, RED, AND GRAY
  // =========================================================================
  return (
    <div className="memories-screen" aria-label="Memories and Retrospective Page">
      {/* Back button to return to the Image 2 trips list */}
      <button
        type="button"
        className="memory-back-btn"
        onClick={() => setSelectedTripId(null)}
      >
        <ChevronLeft size={16} />
        <span>Back to Past Trips</span>
      </button>

      {/* 1. Trip Hero Summary Card */}
      <section className="memory-hero-card" aria-label="Trip overview">
        <div className="memory-hero-badge-row">
          <span className="memory-trip-status-pill">
            Trip Completed & Archived
          </span>
          <span className="memory-mode-pill">
            <Users size={12} />
            {activeMode === 'group' ? `Group Trip · ${members.length || 4} members` : 'Solo Trip'}
          </span>
        </div>

        <div className="memory-hero-title-area">
          <h2>{activeDestination} Memories & Retrospective</h2>
          <span className="memory-hero-dates">
            {tripIntent?.dates ? `${tripIntent.dates.start} – ${tripIntent.dates.end}` : '2099-10-12 – 2099-10-15'}
          </span>
        </div>

        <div className="memory-hero-metrics">
          <div className="memory-metric-cell">
            <span className="memory-metric-label">Photos Archived</span>
            <span className="memory-metric-value">{effectiveArtifacts.length} Photos</span>
          </div>
          <div className="memory-metric-cell">
            <span className="memory-metric-label">Places Visited</span>
            <span className="memory-metric-value">{visitedStops.length} Places</span>
          </div>
          <div className="memory-metric-cell">
            <span className="memory-metric-label">Total Spend</span>
            <span className="memory-metric-value">RM {totalActual}</span>
          </div>
          <div className="memory-metric-cell">
            <span className="memory-metric-label">Decisions Made</span>
            <span className="memory-metric-value">{groupDecisions.length} Decisions</span>
          </div>
        </div>
      </section>

      {/* 2. Navigation Tabs */}
      <nav className="memory-nav-tabs" aria-label="Memory page tabs">
        <button
          type="button"
          className={`memory-nav-tab-btn ${activeTab === 'all' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Archives
        </button>
        <button
          type="button"
          className={`memory-nav-tab-btn ${activeTab === 'journal' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('journal')}
        >
          Journal & Timeline
        </button>
        <button
          type="button"
          className={`memory-nav-tab-btn ${activeTab === 'retrospective' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('retrospective')}
        >
          Worth It & Retrospective
        </button>
        {mode === 'group' && (
          <button
            type="button"
            className={`memory-nav-tab-btn ${activeTab === 'decisions' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('decisions')}
          >
            Decisions (Group)
          </button>
        )}
      </nav>

      {/* 3. Auto-Generated Travel Journal: Photo Map + Timeline */}
      {(activeTab === 'all' || activeTab === 'journal') && (
        <section className="memory-section-card" aria-label="Auto-generated travel journal">
          <div className="memory-section-header">
            <div className="memory-section-kicker-box">
              <span className="memory-section-kicker">AUTOMATIC JOURNAL</span>
              <h3 className="memory-section-title">Photo Map & Timeline Archive</h3>
            </div>
            <div className="memory-view-toggle">
              <button
                type="button"
                className={journalView === 'both' ? 'is-active' : ''}
                onClick={() => setJournalView('both')}
              >
                Overview
              </button>
              <button
                type="button"
                className={journalView === 'map' ? 'is-active' : ''}
                onClick={() => setJournalView('map')}
              >
                Map
              </button>
              <button
                type="button"
                className={journalView === 'timeline' ? 'is-active' : ''}
                onClick={() => setJournalView('timeline')}
              >
                Timeline
              </button>
            </div>
          </div>

          {/* Photo Map Presentation */}
          {(journalView === 'both' || journalView === 'map') && (
            <div className="memory-photo-map-container" aria-label="Photo Map">
              <div className="memory-photo-map-canvas">
                <svg className="memory-map-bg-svg" viewBox="0 0 380 200" preserveAspectRatio="none" fill="none">
                  <path d="M-20,120 Q80,70 180,100 T390,70" stroke="rgba(147, 5, 0, 0.12)" strokeWidth="6" opacity="0.6" fill="none" />
                  <path d="M50,190 Q150,130 240,150 T400,120" stroke="rgba(117, 104, 98, 0.15)" strokeWidth="8" opacity="0.5" fill="none" />
                  <path d="M120,30 Q200,60 280,40" stroke="rgba(147, 5, 0, 0.1)" strokeWidth="4" strokeDasharray="5 5" fill="none" />
                  <circle cx="90" cy="110" r="38" fill="rgba(117, 104, 98, 0.08)" />
                  <circle cx="210" cy="85" r="46" fill="rgba(147, 5, 0, 0.06)" />
                  <circle cx="310" cy="130" r="40" fill="rgba(117, 104, 98, 0.08)" />
                </svg>

                {/* Hotspot Pins with Photo Counts */}
                <button
                  type="button"
                  className={`memory-map-pin-badge ${selectedMapPlace === 'Tsukiji' ? 'is-selected' : ''}`}
                  style={{ top: '65%', left: '26%' }}
                  onClick={() => setSelectedMapPlace(selectedMapPlace === 'Tsukiji' ? null : 'Tsukiji')}
                >
                  <MapPin size={11} />
                  <span>Tsukiji · 1 photo</span>
                </button>

                <button
                  type="button"
                  className={`memory-map-pin-badge ${selectedMapPlace === 'Meiji Jingu' ? 'is-selected' : ''}`}
                  style={{ top: '38%', left: '22%' }}
                  onClick={() => setSelectedMapPlace(selectedMapPlace === 'Meiji Jingu' ? null : 'Meiji Jingu')}
                >
                  <MapPin size={11} />
                  <span>Meiji Jingu · 1 photo</span>
                </button>

                <button
                  type="button"
                  className={`memory-map-pin-badge ${selectedMapPlace === 'Shibuya' ? 'is-selected' : ''}`}
                  style={{ top: '48%', left: '54%' }}
                  onClick={() => setSelectedMapPlace(selectedMapPlace === 'Shibuya' ? null : 'Shibuya')}
                >
                  <MapPin size={11} />
                  <span>Shibuya · 1 photo</span>
                </button>

                <button
                  type="button"
                  className={`memory-map-pin-badge ${selectedMapPlace === 'Shinjuku' ? 'is-selected' : ''}`}
                  style={{ top: '28%', left: '50%' }}
                  onClick={() => setSelectedMapPlace(selectedMapPlace === 'Shinjuku' ? null : 'Shinjuku')}
                >
                  <MapPin size={11} />
                  <span>Shinjuku · 1 photo</span>
                </button>

                <button
                  type="button"
                  className={`memory-map-pin-badge ${selectedMapPlace === 'Akihabara' ? 'is-selected' : ''}`}
                  style={{ top: '40%', left: '80%' }}
                  onClick={() => setSelectedMapPlace(selectedMapPlace === 'Akihabara' ? null : 'Akihabara')}
                >
                  <MapPin size={11} />
                  <span>Akihabara · 1 photo</span>
                </button>

                <button
                  type="button"
                  className={`memory-map-pin-badge ${selectedMapPlace === 'Roppongi' ? 'is-selected' : ''}`}
                  style={{ top: '74%', left: '72%' }}
                  onClick={() => setSelectedMapPlace(selectedMapPlace === 'Roppongi' ? null : 'Roppongi')}
                >
                  <MapPin size={11} />
                  <span>Roppongi · 1 photo</span>
                </button>
              </div>

              <div className="memory-map-summary-strip">
                <span>
                  {selectedMapPlace
                    ? `Filtered: Footsteps around ${selectedMapPlace}`
                    : `Auto-archived ${effectiveArtifacts.length} photos via EXIF timestamp & coordinates · Across 6 main districts`}
                </span>
                {selectedMapPlace && (
                  <button
                    type="button"
                    className="memory-card-edit-btn"
                    onClick={() => setSelectedMapPlace(null)}
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Timeline Presentation with Memory Small Cards */}
          {(journalView === 'both' || journalView === 'timeline') && (
            <div className="memory-timeline-wrap" aria-label="Timeline of Memories">
              {Object.entries(groupedByDay).map(([dayNum, cards]) => (
                <div key={dayNum} className="memory-day-group">
                  <div className="memory-day-header">
                    <span className="memory-day-pill">Day {dayNum}</span>
                    <span className="memory-day-title">
                      {dayNum === '1' ? 'Tsukiji Seafood & Meiji Shrine Morning Light' : dayNum === '2' ? 'Shibuya Sunset & Shinjuku Cozy Izakaya' : 'Akihabara Anime & Roppongi Skyline'}
                    </span>
                    <span className="memory-day-date">
                      {dayNum === '1' ? 'Oct 12' : dayNum === '2' ? 'Oct 13' : 'Oct 14'}
                    </span>
                  </div>

                  <div className="memory-day-cards-list">
                    {cards.map(card => {
                      const photoUrl = getPlacePhoto(card.archivePlace || card.title, 'food', destination);
                      const isEditing = editingCardId === card.id;

                      return (
                        <article key={card.id} className="memory-card-item" aria-label={`Memory card: ${card.title}`}>
                          <div className="memory-card-top-row">
                            <div className="memory-card-photo-box">
                              <img
                                className="memory-card-photo-img"
                                src={photoUrl}
                                alt={card.title}
                                loading="lazy"
                              />
                              <span className="memory-card-day-tag">Day {card.archiveDay || dayNum}</span>
                            </div>

                            <div className="memory-card-info-col">
                              <div>
                                <h4 className="memory-card-place-title">{card.title}</h4>
                                <div className="memory-card-time-loc">
                                  <Clock size={10} />
                                  <span>{card.capturedAt || '12:00'}</span>
                                  <span>·</span>
                                  <MapPin size={10} />
                                  <span>{card.archivePlace || card.locationLabel}</span>
                                </div>
                              </div>

                              {isEditing ? (
                                <div>
                                  <textarea
                                    className="memory-card-note-edit-area"
                                    value={draftNote}
                                    onChange={e => setDraftNote(e.target.value)}
                                    placeholder="Write thoughts behind this photo..."
                                    rows={2}
                                  />
                                </div>
                              ) : (
                                <div className="memory-card-note-box">
                                  <span>“{card.body || 'No note added'}”</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="memory-card-bottom-actions">
                            {/* Privacy toggle: Private vs Public */}
                            <button
                              type="button"
                              className={`memory-privacy-toggle-btn ${card.isPublic ? 'is-public' : 'is-private'}`}
                              onClick={() => togglePrivacy(card.id)}
                              aria-label={`Toggle privacy for ${card.title}`}
                            >
                              {card.isPublic ? <Globe size={11} /> : <Lock size={11} />}
                              <span>{card.isPublic ? 'Public card' : 'Private memory'}</span>
                            </button>

                            {/* Caption / Note editing action */}
                            {isEditing ? (
                              <button
                                type="button"
                                className="memory-card-edit-btn"
                                onClick={() => saveNote(card.id)}
                              >
                                Save note
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="memory-card-edit-btn"
                                onClick={() => startEditNote(card.id, card.body)}
                              >
                                Edit thought note
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 4. "Worth It" Review */}
      {(activeTab === 'all' || activeTab === 'retrospective') && (
        <section className="memory-section-card" aria-label="Worth it review">
          <div className="memory-section-header">
            <div className="memory-section-kicker-box">
              <span className="memory-section-kicker">WORTH IT REVIEW</span>
              <h3 className="memory-section-title">Honest Experience Ratings</h3>
            </div>
          </div>

          <div className="memory-worthit-list">
            {visitedStops.map(stop => {
              const currentRating = itemReviews[stop.id];

              return (
                <div key={stop.id} className="memory-worthit-row">
                  <span className="memory-worthit-name">{stop.name}</span>

                  <div className="memory-worthit-actions">
                    <button
                      type="button"
                      className={`memory-worthit-btn ${currentRating === 'worth' ? 'is-active-worth' : ''}`}
                      onClick={() => onItemReviewChange(stop.id, 'worth')}
                    >
                      🌟 Worth it
                    </button>
                    <button
                      type="button"
                      className={`memory-worthit-btn ${currentRating === 'mixed' ? 'is-active-mixed' : ''}`}
                      onClick={() => onItemReviewChange(stop.id, 'mixed')}
                    >
                      🤔 Mixed
                    </button>
                    <button
                      type="button"
                      className={`memory-worthit-btn ${currentRating === 'skip' ? 'is-active-skip' : ''}`}
                      onClick={() => onItemReviewChange(stop.id, 'skip')}
                    >
                      🙅 Skip
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="memory-ai-hint-badge">
            <Sparkles size={13} />
            <span>Ratings are continuously ingested to automatically optimize recommendation ranking in your next trips.</span>
          </div>
        </section>
      )}

      {/* 5. Said vs Done Comparison */}
      {(activeTab === 'all' || activeTab === 'retrospective') && (
        <section className="memory-section-card" aria-label="Said vs Done Comparison">
          <div className="memory-section-header">
            <div className="memory-section-kicker-box">
              <span className="memory-section-kicker">SAID VS DONE</span>
              <h3 className="memory-section-title">Initial Intent vs Actual Trip Outcome</h3>
            </div>
          </div>

          <div className="memory-said-done-grid">
            {saidDoneItems.map(item => (
              <div key={item.topic} className="memory-said-done-simple-row">
                <div className="memory-said-done-simple-left">
                  <span className="memory-said-done-topic">{item.topic}</span>
                  <div className="memory-said-done-comparison-cols">
                    <div className="memory-col-said">
                      <small className="memory-col-label">Initial Intent (Said)</small>
                      <span className="memory-col-text">{item.said}</span>
                    </div>
                    <div className="memory-col-done">
                      <small className="memory-col-label">Actual Outcome (Done)</small>
                      <span className="memory-col-text">{item.done}</span>
                    </div>
                  </div>
                  <p className="memory-outcome-insight">
                    <strong>Outcome Insight:</strong> {item.insight}
                  </p>
                </div>
                <span className={`memory-said-done-gap-badge ${item.gapType === 'matched' ? 'gap-matched' : 'gap-shifted'}`}>
                  {item.gapBadge}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Budget vs Actual Spend Review */}
      {(activeTab === 'all' || activeTab === 'retrospective') && (
        <section className="memory-section-card" aria-label="Budget review">
          <div className="memory-section-header">
            <div className="memory-section-kicker-box">
              <span className="memory-section-kicker">BUDGET REVIEW</span>
              <h3 className="memory-section-title">Category Variance & Spend Satisfaction</h3>
            </div>
          </div>

          <div className="memory-budget-total-bar">
            <div>
              <span className="memory-budget-total-label">Total Spend Review</span>
              <div className="memory-budget-total-num">
                RM {totalActual} <small style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted, #756862)' }}>/ Budget RM {totalPlanned}</small>
              </div>
            </div>
            <div>
              <span className={`memory-budget-diff-tag ${totalVariance > 0 ? 'diff-over' : 'diff-under'}`}>
                {totalVariance > 0 ? `+RM ${totalVariance} (Over by ${Math.round((totalVariance / totalPlanned) * 100)}%)` : `-RM ${Math.abs(totalVariance)} (Saved)`}
              </span>
            </div>
          </div>

          <div className="memory-budget-categories-list">
            {budgetItems.map(item => {
              const diff = item.actual - item.planned;
              const pct = Math.min(130, Math.round((item.actual / item.planned) * 100));

              return (
                <div key={item.category} className="memory-budget-cat-row">
                  <div className="memory-budget-cat-top">
                    <span>{item.category}</span>
                    <div className="memory-budget-cat-nums">
                      <span>{item.unit} {item.actual} <small style={{ color: 'var(--muted, #756862)' }}>/ {item.planned}</small></span>
                      <span className={`memory-budget-diff-tag ${diff > 0 ? 'diff-over' : diff < 0 ? 'diff-under' : 'diff-on-track'}`}>
                        {diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : 'On track'}
                      </span>
                    </div>
                  </div>

                  <div className="memory-budget-bar-track">
                    <div
                      className={`memory-budget-bar-fill ${diff > 0 ? 'is-over' : ''}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  <div className="memory-budget-satisfaction-row">
                    <span className="memory-budget-sublabel">Spend Satisfaction:</span>
                    <div className="memory-spend-rating-buttons">
                      <button type="button" className="memory-rating-btn active">Worth it</button>
                      <button type="button" className="memory-rating-btn">Fair</button>
                      <button type="button" className="memory-rating-btn">Overpriced</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 7. Decision History Review (Group) */}
      {(activeTab === 'all' || activeTab === 'decisions') && mode === 'group' && (
        <section className="memory-section-card" aria-label="Group decision history">
          <div className="memory-section-header">
            <div className="memory-section-kicker-box">
              <span className="memory-section-kicker">GROUP COURT ARCHIVE</span>
              <h3 className="memory-section-title">Disputes, Votes & Final Resolutions</h3>
            </div>
            <span className="memory-mode-pill">Group Arbitration Archive</span>
          </div>

          <div className="memory-decision-list">
            {groupDecisions.map(record => (
              <article key={record.id} className="memory-decision-card">
                <div className="memory-decision-top">
                  <span className="memory-decision-topic">{record.topic}</span>
                  {record.usedGacha && (
                    <span className="memory-decision-gacha-pill">
                      <Sparkles size={10} />
                      Triggered Gacha Arbitration
                    </span>
                  )}
                </div>

                <div className="memory-decision-detail-grid">
                  <div className="memory-decision-row">
                    <strong>Vote outcome:</strong>
                    <span>{record.voteSummary || 'Unanimous vote'}</span>
                  </div>

                  <div className="memory-decision-row">
                    <strong>Final decision:</strong>
                    <span>{record.decision}</span>
                  </div>

                  <div className="memory-decision-row">
                    <strong>Retrospective:</strong>
                    <span>⭐⭐⭐⭐⭐ Win-win outcome, resolved itinerary conflict smoothly</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 8. AI Preference Evolution Card (Adaptive Behavioral Learning) */}
      <section className="memory-ai-evolution-card" aria-label="AI Preference Evolution">
        <div className="memory-ai-evolution-header">
          <div className="memory-ai-evolution-title">
            <Sparkles size={16} />
            <span>AI Preference Evolution · Adaptive Learning</span>
          </div>
          <span className="memory-ai-status-tag">Preference Model Updated</span>
        </div>
        <p className="memory-ai-desc">
          Automatically evolving your personalized travel profile from this trip’s actual behavioral choices, pace deviations, and decision records — without retaking any surveys.
        </p>
        <div className="memory-ai-tags-row">
          <div className="memory-ai-learning-item">
            <Sparkles size={13} />
            <span><strong>Food &amp; Dining weight +18%</strong> (Explored 5 authentic eateries, higher engagement)</span>
          </div>
          <div className="memory-ai-learning-item">
            <Sparkles size={13} />
            <span><strong>Pacing buffer +25 mins</strong> (Step count reached 16,800 steps, afternoon rest auto-injected)</span>
          </div>
          <div className="memory-ai-learning-item">
            <Sparkles size={13} />
            <span><strong>Dining budget flexibility</strong> (Higher willingness to invest in unique culinary experiences)</span>
          </div>
          <div className="memory-ai-learning-item">
            <Sparkles size={13} />
            <span><strong>Group arbitration playbook</strong> (Gacha compromise successfully resolved deadlock tie)</span>
          </div>
        </div>
      </section>
    </div>
  );
}
