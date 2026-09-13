import React, { useState } from 'react';
import { Bookmark, ChevronDown, ChevronUp, Clock, Footprints, Info, Send, ShieldCheck, Sparkles, Umbrella, Camera } from 'lucide-react';
import type { DiscoveryPlace } from '../../domain/discovery';
import { getPlacePhoto } from './explorePhotos';

export type PlaceCandidate = DiscoveryPlace & {
  id: number;
  saved: boolean;
  added: boolean;
  photoUrl?: string;
};

interface ExplorePlaceCardProps {
  place: PlaceCandidate;
  mode: 'group' | 'solo';
  onSave: (id: number) => void;
  onAdd: (id: number) => void;
}

export const ExplorePlaceCard: React.FC<ExplorePlaceCardProps> = ({
  place,
  mode,
  onSave,
  onAdd,
}) => {
  const [whyExpanded, setWhyExpanded] = useState(false);
  const photoUrl = place.photoUrl || getPlacePhoto(place.name, place.type);

  return (
    <article className="explore-place-card" aria-label={`Place recommendation: ${place.name}`}>
      {/* Visual Photo Banner */}
      <div className="place-card-visual-frame">
        <img
          src={photoUrl}
          alt={place.name}
          className="place-photo-img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="place-photo-overlay-scrim" />
        <div className="place-photo-floating-tags">
          <span className="place-type-badge">{place.type}</span>
          <div className="place-fit-badge" title="Tingo-adjusted relevance match">
            <Sparkles size={11} />
            <span>{place.match}% fit</span>
          </div>
        </div>
      </div>

      <div className="place-card-body">
        {/* Place Identity */}
        <div className="place-card-top">
          <div className="place-identity">
            <h4 className="place-name">{place.name}</h4>
          </div>
        </div>

      {/* Place Quick Metrics: Cost, Duration, Distance/Indoor */}
      <div className="place-metrics-row">
        <span className="metric-chip cost-chip">
          <strong>{place.cost}</strong>
        </span>
        <span className="metric-chip duration-chip">
          <Clock size={11} />
          <span>{place.duration}</span>
        </span>
        {place.walkingKm > 0 && (
          <span className="metric-chip walk-chip">
            <Footprints size={11} />
            <span>{place.walkingKm} km</span>
          </span>
        )}
        {place.indoor && (
          <span className="metric-chip indoor-chip">
            <Umbrella size={11} />
            <span>Indoor</span>
          </span>
        )}
      </div>

      {/* Expandable "Why this fits" explainability block */}
      <div className="place-why-block">
        <button
          type="button"
          className="why-toggle-btn"
          onClick={() => setWhyExpanded(!whyExpanded)}
          aria-expanded={whyExpanded}
        >
          <span className="why-lead">
            <strong>Why it fits:</strong> {!whyExpanded && <span className="why-snippet">{place.why}</span>}
          </span>
          <span className="why-toggle-icon">
            {whyExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </button>

        {whyExpanded && (
          <div className="why-expanded-content">
            <p>{place.why}</p>
            {place.tags?.length > 0 && (
              <div className="why-tags">
                {place.tags.map(tag => (
                  <span key={tag} className="why-tag-pill">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Truthful Provenance Indicator */}
      <div className="place-provenance-row">
        <span className={`provenance-indicator ${place.source}`}>
          <Info size={11} />
          <span>
            {place.source === 'prototype-catalog'
              ? 'Local prototype catalog'
              : 'Fallback example · not live destination data'}
          </span>
        </span>
      </div>

      {/* Action Row: Save idea & Suggest to group / Add to plan */}
      <div className="place-actions-row">
        <button
          type="button"
          className={`place-btn save-btn ${place.saved ? 'saved' : ''}`}
          onClick={() => onSave(place.id)}
          aria-label={place.saved ? 'Saved to ideas' : 'Save idea'}
        >
          <Bookmark size={13} fill={place.saved ? 'currentColor' : 'none'} />
          <span>{place.saved ? '✓ Saved' : 'Save idea'}</span>
        </button>

        <button
          type="button"
          className={`place-btn add-btn ${place.added ? 'added' : 'primary'}`}
          onClick={() => onAdd(place.id)}
          aria-label={
            mode === 'group'
              ? place.added
                ? 'Suggested to group'
                : 'Suggest to group'
              : place.added
              ? 'In plan'
              : 'Add to plan'
          }
        >
          <Send size={13} />
          <span>
            {mode === 'group'
              ? place.added
                ? '✓ Suggested'
                : 'Suggest to group'
              : place.added
              ? '✓ In plan'
              : 'Add to plan'}
          </span>
        </button>
      </div>

      </div>
    </article>
  );
};
export default ExplorePlaceCard;
