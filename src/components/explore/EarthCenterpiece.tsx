import React, { useState } from 'react';
import { Compass, MapPin, Maximize2 } from 'lucide-react';
import { RotatableEarth, type EarthMarker } from './RotatableEarth';
import { EarthFullscreenModal } from './EarthFullscreenModal';

interface EarthCenterpieceProps {
  destinationsCovered?: string[];
  totalItineraries?: number;
  activeDestination?: string;
  onSelectDestination?: (destination: string) => void;
}

const CENTERPIECE_MARKERS: EarthMarker[] = [
  { id: 'marker-tokyo', name: 'Tokyo', lat: 35.6762, lon: 139.6503, label: 'Tokyo', reviewStatus: 'yes' },
  { id: 'marker-kyoto', name: 'Kyoto', lat: 35.0116, lon: 135.7681, label: 'Kyoto', reviewStatus: 'mixed' },
  { id: 'marker-osaka', name: 'Osaka', lat: 34.6937, lon: 135.5023, label: 'Osaka', reviewStatus: 'unexplored' },
  { id: 'marker-jeju', name: 'Jeju', lat: 33.4996, lon: 126.5312, label: 'Jeju', reviewStatus: 'yes' },
];

export const EarthCenterpiece: React.FC<EarthCenterpieceProps> = ({
  destinationsCovered = ['Tokyo', 'Kyoto', 'Osaka'],
  totalItineraries = 12,
  activeDestination = 'Tokyo',
  onSelectDestination,
}) => {
  const [fullscreenOpen, setFullscreenOpen] = useState<boolean>(false);

  return (
    <>
      <section className="explore-earth-centerpiece" aria-label="Destinations covered globe">
        {/* Full screen button on top right of the widget */}
        <button
          type="button"
          className="earth-yt-fullscreen-btn"
          onClick={(e) => {
            e.stopPropagation();
            setFullscreenOpen(true);
          }}
          title="Full screen"
          aria-label="Full screen"
        >
          <Maximize2 size={13} />
        </button>

        <div
          className="earth-visual-container clickable"
          onClick={() => setFullscreenOpen(true)}
          role="button"
          tabIndex={0}
          aria-label="Click to view Earth in full screen with past trip reviews"
        >
          <div className="earth-atmosphere" />
          <div className="earth-globe rotatable" role="img" aria-label="Rotatable real-color Earth globe with covered travel destinations">
            <RotatableEarth
              size={112}
              interactive={true}
              autoRotate={false}
              markers={CENTERPIECE_MARKERS}
              onClick={() => setFullscreenOpen(true)}
            />
            <div className="earth-orbit-ring" />
            <div className="earth-orbit-dot dot-1" title="Tokyo: 35.6° N" />
            <div className="earth-orbit-dot dot-2" title="Kyoto: 35.0° N" />
            <div className="earth-orbit-dot dot-3" title="Osaka: 34.6° N" />
          </div>
        </div>

        <div className="earth-info-block">
          <div className="earth-kicker">
            <Compass size={13} className="earth-kicker-icon" />
            <span>DESTINATIONS COVERED</span>
          </div>
          <h3 className="earth-heading">
            {destinationsCovered.length} regions mapped · {totalItineraries} community itineraries
          </h3>
          <p className="earth-subcopy">
            Rotate the real-color Earth to explore travel footprints, or open full screen to review past trip outcomes.
          </p>

          <div className="earth-destination-pills" role="tablist" aria-label="Destinations covered">
            {destinationsCovered.map(dest => {
              const isActive = activeDestination.toLowerCase() === dest.toLowerCase();
              return (
                <button
                  key={dest}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`earth-dest-pill ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectDestination?.(dest)}
                >
                  <MapPin size={11} />
                  <span>{dest}</span>
                  {isActive && <span className="earth-pill-active-dot" />}
                </button>
              );
            })}
          </div>

          <div className="earth-stats-bar">
            <div className="earth-stat-item">
              <b>{destinationsCovered.length}</b>
              <small>Destinations</small>
            </div>
            <span className="earth-stat-divider">/</span>
            <div className="earth-stat-item">
              <b>{totalItineraries}+</b>
              <small>Shared Plans</small>
            </div>
            <span className="earth-stat-divider">/</span>
            <div className="earth-stat-item">
              <b>100%</b>
              <small>Explicit Sharing</small>
            </div>
          </div>
        </div>
      </section>

      {/* Fullscreen Earth Modal with Back button & Past Trip Reviews */}
      <EarthFullscreenModal
        isOpen={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        activeDestination={activeDestination}
        onSelectDestination={onSelectDestination}
      />
    </>
  );
};
export default EarthCenterpiece;

