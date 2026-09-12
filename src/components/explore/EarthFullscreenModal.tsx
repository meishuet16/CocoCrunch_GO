import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Compass,
  Sparkles,
  X,
  Calendar,
  Users,
  CircleDollarSign,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { RotatableEarth, type EarthMarker } from './RotatableEarth';
import { PAST_TRIP_REVIEWS, type PastTripReviewItem } from './pastTripReviews';

interface EarthFullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDestination?: string;
  initialTripId?: string | null;
  onSelectDestination?: (dest: string) => void;
}

export const EarthFullscreenModal: React.FC<EarthFullscreenModalProps> = ({
  isOpen,
  onClose,
  initialTripId = null,
  onSelectDestination,
}) => {
  // Default to null: only the 3D Earth model shows when entering; details only pop up after clicking a pin
  const [selectedTripId, setSelectedTripId] = useState<string | null>(initialTripId ?? null);
  const [targetCoords, setTargetCoords] = useState<{ lat: number; lon: number } | null>(() => {
    if (initialTripId) {
      const found = PAST_TRIP_REVIEWS.find(t => t.id === initialTripId);
      return found ? { lat: found.lat, lon: found.lon } : null;
    }
    return null;
  });

  // Sync initialTripId when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTripId(initialTripId ?? null);
      if (initialTripId) {
        const found = PAST_TRIP_REVIEWS.find(t => t.id === initialTripId);
        if (found) {
          setTargetCoords({ lat: found.lat, lon: found.lon });
        }
      } else {
        setTargetCoords(null);
      }
    }
  }, [isOpen, initialTripId]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Generate Earth Markers from past trips
  const markers: EarthMarker[] = useMemo(() => {
    return PAST_TRIP_REVIEWS.map(trip => ({
      id: trip.id,
      name: trip.destination,
      lat: trip.lat,
      lon: trip.lon,
      label: `${trip.destination} · ${trip.reviewVerdict === 'yes' ? 'Worth it ✦' : 'Mixed'}`,
      reviewStatus: trip.reviewVerdict,
      flag: trip.flag,
    }));
  }, []);

  // Currently selected trip item
  const selectedTrip = useMemo(() => {
    if (!selectedTripId) return null;
    return PAST_TRIP_REVIEWS.find(t => t.id === selectedTripId) || null;
  }, [selectedTripId]);

  const currentIndex = useMemo(() => {
    if (!selectedTripId) return 0;
    const idx = PAST_TRIP_REVIEWS.findIndex(t => t.id === selectedTripId);
    return idx >= 0 ? idx : 0;
  }, [selectedTripId]);

  // Select and focus on a specific trip
  const handleSelectTrip = (trip: PastTripReviewItem) => {
    setSelectedTripId(trip.id);
    setTargetCoords({ lat: trip.lat, lon: trip.lon });
  };

  // Focus from Earth marker pin click
  const handleMarkerClick = (marker: EarthMarker) => {
    const found = PAST_TRIP_REVIEWS.find(t => t.id === marker.id);
    if (found) {
      handleSelectTrip(found);
    }
  };

  // Close the floating review window (leaves 3D Earth full view)
  const handleCloseReview = () => {
    setSelectedTripId(null);
  };

  // Navigate to previous / next pin
  const handleNavigatePin = (delta: number) => {
    const nextIdx = (currentIndex + delta + PAST_TRIP_REVIEWS.length) % PAST_TRIP_REVIEWS.length;
    const nextTrip = PAST_TRIP_REVIEWS[nextIdx];
    handleSelectTrip(nextTrip);
  };

  if (!isOpen) return null;

  return (
    <div
      className="earth-fullscreen-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Interactive Earth"
    >
      <div className="earth-fullscreen-sheet paper-sheet">
        <div className="earth-fullscreen-stage">
          {/* Floating Back Button (Icon only without word) */}
          <button
            type="button"
            className="earth-floating-back-btn"
            onClick={onClose}
            title="Back to Explore"
            aria-label="Back to Explore"
          >
            <ArrowLeft size={20} />
          </button>

          {/* 3D Earth Stage Viewport */}
          <div className="earth-stage-viewport" aria-label="3D Earth Interactive View">
            {/* Subtle instructional hint */}
            <div className="earth-instruction-badge">
              <Compass size={12} />
              <span>Drag to rotate · Click any pin or title to view review</span>
            </div>

            {/* Rotatable 3D Earth Hero */}
            <div className="earth-fullscreen-globe-canvas">
              <RotatableEarth
                size={440}
                interactive={true}
                autoRotate={false}
                markers={markers}
                selectedMarkerId={selectedTripId ?? undefined}
                targetCoordinates={targetCoords}
                onMarkerClick={handleMarkerClick}
              />
            </div>

            {/* Subtle Earth Legend */}
            <div className="globe-legend-strip">
              <div className="legend-item">
                <span className="legend-dot worth-it-dot" />
                <span>Worth it (Reviewed)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot mixed-dot" />
                <span>Mixed (Reviewed)</span>
              </div>
            </div>
          </div>

          {/* 3. Floating Review Window Beside the 3D Globe (shown when pin is clicked) */}
          {selectedTrip && (
            <aside
              className="floating-review-window"
              role="complementary"
              aria-label={`Past trip review for ${selectedTrip.destination}`}
            >
              {/* Floating Header */}
              <div className="floating-review-header">
                <div className="floating-header-left">
                  <span className="floating-flag">{selectedTrip.flag}</span>
                  <div>
                    <span className="floating-kicker">TRIP REVIEW</span>
                    <h3 className="floating-dest-title">{selectedTrip.destination}</h3>
                  </div>
                </div>

                <div className="floating-header-actions">
                  <span className={`verdict-badge ${selectedTrip.reviewVerdict}`}>
                    {selectedTrip.reviewVerdict === 'yes' ? '✦ Worth it' : 'Mixed verdict'}
                  </span>
                  <button
                    type="button"
                    className="floating-review-close-btn"
                    onClick={handleCloseReview}
                    title="Close floating review"
                    aria-label="Close floating review"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Floating Scrollable Body */}
              <div className="floating-review-body">
                {/* Visual Cover Photo */}
                <div className="past-review-photo-frame">
                  <img
                    src={selectedTrip.coverPhoto}
                    alt={`${selectedTrip.title} cover`}
                    className="past-review-cover-img"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="past-review-photo-scrim" />
                  <div className="past-review-floating-meta">
                    <div className="past-review-dest-pill">
                      <span className="dest-flag">{selectedTrip.flag}</span>
                      <span>{selectedTrip.destination}</span>
                    </div>
                  </div>
                </div>

                <div className="floating-review-content">
                  {/* Title & Timing */}
                  <div className="past-review-title-row">
                    <h4 className="past-review-title">{selectedTrip.title}</h4>
                    <div className="past-review-timing">
                      <Calendar size={12} />
                      <span>{selectedTrip.dates} · {selectedTrip.durationDays} days</span>
                    </div>
                  </div>

                  {/* Travellers & Budget Spend */}
                  <div className="past-review-metrics-chips">
                    <span className="metric-chip">
                      <Users size={12} />
                      <span>
                        {selectedTrip.mode === 'solo'
                          ? 'Solo'
                          : `${selectedTrip.travellersCount} travellers (${selectedTrip.travellerNames.join(', ')})`}
                      </span>
                    </span>
                    <span className="metric-chip spend-chip">
                      <CircleDollarSign size={12} />
                      <span>RM {selectedTrip.spendActual} actual (Planned RM {selectedTrip.spendBudget})</span>
                    </span>
                    {selectedTrip.spendBudget - selectedTrip.spendActual > 0 && (
                      <span className="savings-chip">
                        ✓ RM {selectedTrip.spendBudget - selectedTrip.spendActual} under budget
                      </span>
                    )}
                  </div>

                  {/* Retrospective Review Quote */}
                  <div className="past-review-quote-box">
                    <span className="quote-label">Traveler Retrospective:</span>
                    <p className="quote-text">“{selectedTrip.reviewReflection}”</p>
                  </div>

                  {/* Key Visited Anchors */}
                  <div className="past-anchors-row">
                    <span className="anchors-label">Key anchors:</span>
                    <div className="anchors-tags">
                      {selectedTrip.visitedAnchors.map(anchor => (
                        <span key={anchor} className="anchor-tag">
                          <CheckCircle2 size={11} className="check-icon" />
                          <span>{anchor}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tingo Wisdom Recorded */}
                  <div className="tingo-learning-note">
                    <Sparkles size={13} className="tingo-icon" />
                    <div>
                      <b>Tingo wisdom recorded:</b>
                      <p>{selectedTrip.tingoTakeaway}</p>
                    </div>
                  </div>

                  {/* Keepsake Status */}
                  <div className="keepsake-shelf-note">
                    <Bookmark size={12} />
                    <span>{selectedTrip.keepsakeStatus}</span>
                  </div>

                  {/* Action: Browse Destination in Explore */}
                  {onSelectDestination && (
                    <button
                      type="button"
                      className="explore-dest-btn full-width"
                      onClick={() => {
                        onSelectDestination(selectedTrip.destination);
                        onClose();
                      }}
                    >
                      <span>Browse {selectedTrip.destination} in Explore →</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Pin Switcher Footer */}
              <div className="floating-review-footer">
                <button
                  type="button"
                  className="pin-nav-btn"
                  onClick={() => handleNavigatePin(-1)}
                  aria-label="Previous pin"
                >
                  <ChevronLeft size={13} />
                  <span>Prev Pin</span>
                </button>
                <span className="pin-nav-counter">
                  {currentIndex + 1} of {PAST_TRIP_REVIEWS.length}
                </span>
                <button
                  type="button"
                  className="pin-nav-btn"
                  onClick={() => handleNavigatePin(1)}
                  aria-label="Next pin"
                >
                  <span>Next Pin</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default EarthFullscreenModal;
