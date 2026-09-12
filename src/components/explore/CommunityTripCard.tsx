import React, { useState } from 'react';
import { Bookmark, Calendar, ChevronRight, CircleDollarSign, Heart, MapPin, Share2, Sparkles, User, Camera } from 'lucide-react';
import { getCommunityTripCover } from './explorePhotos';

export interface CommunityTripItem {
  id: number;
  title: string;
  author: string;
  match: number;
  saved: boolean;
  destination?: string;
  country?: string;
  days?: number;
  budget?: string;
  highlights?: string[];
  stopsCount?: number;
  category?: string;
  authorAvatar?: string;
  initialLikes?: number;
  coverPhoto?: string;
  description?: string;
  places?: number;
}

interface CommunityTripCardProps {
  trip: CommunityTripItem;
  onToggleSave: (id: number) => void;
  onViewPlan: (trip: CommunityTripItem) => void;
  onCopyTrip?: (trip: CommunityTripItem) => void;
}

export const CommunityTripCard: React.FC<CommunityTripCardProps> = ({
  trip,
  onToggleSave,
  onViewPlan,
  onCopyTrip,
}) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(trip.initialLikes ?? 24 + trip.id * 7);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked) {
      setLiked(false);
      setLikeCount(c => Math.max(0, c - 1));
    } else {
      setLiked(true);
      setLikeCount(c => c + 1);
    }
  };

  const days = trip.days ?? (trip.id === 1 ? 5 : trip.id === 2 ? 3 : 4);
  const budget = trip.budget ?? (trip.id === 1 ? 'RM 1,400 est.' : trip.id === 2 ? 'RM 850 est.' : 'RM 1,100 est.');
  const highlights = trip.highlights ?? (
    trip.id === 1
      ? ['Tsukiji morning market', 'Daikanyama café stroll', 'Shimokitazawa vintage']
      : trip.id === 2
      ? ['Tokyo Station underground', 'Mori Art Museum', 'Ginza covered arcade']
      : ['Nishiki food street', 'Philosopher’s Path walk', 'Gion teahouse']
  );
  const destination = trip.destination ?? (
    trip.title.toLowerCase().includes('kyoto') ? 'Kyoto' :
    trip.title.toLowerCase().includes('osaka') ? 'Osaka' :
    trip.title.toLowerCase().includes('jeju') ? 'Jeju' : 'Tokyo'
  );
  const country = trip.country ?? (
    ['tokyo', 'kyoto', 'osaka'].includes(destination.toLowerCase()) ? 'Japan' :
    destination.toLowerCase().includes('jeju') || destination.toLowerCase().includes('seoul') ? 'South Korea' : 'Japan'
  );

  const coverPhoto = trip.coverPhoto || getCommunityTripCover(destination, trip.title, trip.category, trip.id);

  return (
    <article className="community-trip-card" aria-label={`Community trip by ${trip.author}: ${trip.title}`}>
      {/* Header: Author avatar, username, and trip title/destination */}
      <header className="trip-card-header">
        <div className="author-info">
          <div className="author-avatar" aria-hidden="true">
            {trip.authorAvatar ? (
              <img src={trip.authorAvatar} alt="" />
            ) : (
              <span>{trip.author.slice(0, 1).toUpperCase()}</span>
            )}
          </div>
          <div className="author-meta">
            <span className="full-trip-marker">FULL SHARED TRIP</span>
            <div className="author-name-row">
              <span className="author-name">{trip.author}</span>
              <span className="author-badge">Explicitly shared</span>
            </div>
            <div className="destination-row">
              <MapPin size={11} className="dest-icon" />
              <span className="destination-name">{destination}</span>
              <span className="country-tag">· {country}</span>
              <span className="bullet">·</span>
              <span className="match-pill">{trip.match}% fit</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className={`bookmark-btn ${trip.saved ? 'saved' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(trip.id);
          }}
          aria-label={trip.saved ? 'Remove saved trip idea' : 'Save trip idea'}
          title={trip.saved ? 'Saved to ideas' : 'Save idea'}
        >
          <Bookmark size={17} fill={trip.saved ? 'currentColor' : 'none'} />
        </button>
      </header>

      {/* Cover Photo Visual */}
      <div
        className="trip-cover-visual"
        onClick={() => onViewPlan(trip)}
        role="button"
        tabIndex={0}
        aria-label={`View full plan for ${trip.title}`}
      >
        <img
          src={coverPhoto}
          alt={`${trip.title} cover`}
          className="trip-cover-img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="trip-cover-scrim" />
        <div className="trip-cover-overlay-content">
          <span className="trip-cover-view-hint">
            <span>View Full Itinerary</span>
            <ChevronRight size={13} />
          </span>
        </div>
      </div>

      {/* Trip Title */}
      <h4 className="trip-card-title">{trip.title}</h4>

      {/* Summary Preview: Key trip snapshot (duration/number of days, estimated budget, main stops/highlights) */}
      <div className="trip-summary-preview">
        <div className="summary-snapshot-pills">
          <span className="snapshot-pill">
            <Calendar size={12} />
            <span>{days} days</span>
          </span>
          <span className="snapshot-pill">
            <CircleDollarSign size={12} />
            <span>{budget}</span>
          </span>
          <span className="snapshot-pill">
            <Sparkles size={12} />
            <span>{highlights.length} key stops</span>
          </span>
        </div>

        <div className="trip-highlights-stream">
          <span className="highlights-label">Main stops:</span>
          <div className="highlights-tags">
            {highlights.map((stop, index) => (
              <span key={stop} className="highlight-tag">
                <span className="stop-index">{index + 1}</span>
                {stop}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Footer: Functional-looking like counter & button, save/bookmark, and "View Full Plan" CTA */}
      <footer className="trip-card-footer">
        <div className="footer-interactions">
          <button
            type="button"
            className={`like-button ${liked ? 'liked' : ''}`}
            onClick={handleLike}
            aria-label={liked ? 'Unlike trip plan' : 'Like trip plan'}
          >
            <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
            <span className="like-count">{likeCount}</span>
          </button>

          <button
            type="button"
            className={`save-action-pill ${trip.saved ? 'saved' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(trip.id);
            }}
          >
            <Bookmark size={13} fill={trip.saved ? 'currentColor' : 'none'} />
            <span>{trip.saved ? 'Saved' : 'Save idea'}</span>
          </button>
        </div>

        <button
          type="button"
          className="view-plan-cta"
          onClick={() => onViewPlan(trip)}
        >
          <span>View Full Plan</span>
          <ChevronRight size={14} />
        </button>
        {onCopyTrip && <button
          type="button"
          className="view-plan-cta"
          onClick={() => onCopyTrip(trip)}
        >
          <span>Copy this trip</span>
          <ChevronRight size={14} />
        </button>}
      </footer>
    </article>
  );
};
export default CommunityTripCard;
