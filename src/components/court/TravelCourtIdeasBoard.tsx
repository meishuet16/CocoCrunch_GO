import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, ChevronDown, Image as ImageIcon, MapPin,
  FileText, Link2, Upload, MessageSquare, MoreHorizontal, Pencil, Users, X, Clock
} from 'lucide-react';
import { TravelCourtCharacter, type CharacterVariant } from './TravelCourtCharacter';
import { playPop, playWhoosh, triggerHaptic } from './courtSoundAndHaptics';
import { MobileStatusBar, MobileHomeIndicator } from './TravelCourtCaseFlow';
import './court-styles.css';

export type GroupIdea = {
  id: string;
  author: string;
  characterVariant: CharacterVariant;
  timeAgo: string;
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
  photoCount: number;
  commentsCount: number;
  likes: number;
  likedByUser?: boolean;
};

const DEFAULT_IDEAS: GroupIdea[] = [
  {
    id: 'coastal-beach',
    author: 'Mavis',
    characterVariant: 'coral',
    timeAgo: '2h ago',
    title: 'Secret Seaside Cove',
    description: 'Clear turquoise water, soft white sand, and lovely oceanfront cafes. Perfect for a relaxing morning!',
    tags: ['#Beach', '#Scenic', '#Relax'],
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
    photoCount: 24,
    commentsCount: 4,
    likes: 12,
  },
  {
    id: 'local-bbq',
    author: 'Ken',
    characterVariant: 'blue',
    timeAgo: '5h ago',
    title: 'Gourmet Local Specialties',
    description: 'A must-try culinary experience! Delicious grilled dishes and fantastic group dining atmosphere.',
    tags: ['#Food', '#Local', '#MustTry'],
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
    photoCount: 18,
    commentsCount: 7,
    likes: 24,
  },
  {
    id: 'historic-viewpoint',
    author: 'Alex',
    characterVariant: 'green',
    timeAgo: '6h ago',
    title: 'Historic Scenic Viewpoint',
    description: 'Breathtaking panoramic views from the summit. Great photo spots and easy walking trails for everyone!',
    tags: ['#Views', '#Sunset', '#Photo'],
    imageUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=500&auto=format&fit=crop&q=80',
    photoCount: 12,
    commentsCount: 3,
    likes: 15,
  },
];

export interface TravelCourtIdeasBoardProps {
  onClose: () => void;
  onBackToCourt?: () => void;
  onEnterCourt: () => void;
  onOpenDiscussion?: (ideaId?: string) => void;
  onOpenPlayground?: () => void;
  membersCount?: number;
}

export function TravelCourtIdeasBoard({
  onClose,
  onBackToCourt,
  onEnterCourt,
  onOpenDiscussion,
  membersCount = 4,
}: TravelCourtIdeasBoardProps) {
  const discussionLabel = membersCount < 6 ? `(${membersCount}/6)` : '(6)';
  const [ideas, setIdeas] = useState<GroupIdea[]>(DEFAULT_IDEAS);
  const [newIdeaText, setNewIdeaText] = useState('');
  const [activeChip, setActiveChip] = useState<'photo' | 'place' | 'note' | 'link'>('photo');
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Deliberation countdown and progress bar (representing ticking towards answer limit)
  const TOTAL_LIMIT_SECONDS = 300; // 5 minutes limit
  const [elapsedSeconds, setElapsedSeconds] = useState(135); // starts ~45% progress

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => (prev < TOTAL_LIMIT_SECONDS ? prev + 1 : prev));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeLeft = Math.max(0, TOTAL_LIMIT_SECONDS - elapsedSeconds);
  const progress = Math.min(100, Math.round((elapsedSeconds / TOTAL_LIMIT_SECONDS) * 100));

  const formatTimeLeft = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleUploadIdea = () => {
    const text = newIdeaText.trim();
    if (!text) return;

    playPop();
    triggerHaptic('vote');

    const newIdea: GroupIdea = {
      id: `idea-${Date.now()}`,
      author: 'You',
      characterVariant: 'green',
      timeAgo: 'Just now',
      title: text.length > 24 ? text.substring(0, 24) + '...' : text,
      description: text,
      tags: [`#${activeChip.toUpperCase()}`, '#Idea', '#New'],
      imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=500&auto=format&fit=crop&q=80',
      photoCount: 1,
      commentsCount: 0,
      likes: 1,
      likedByUser: true,
    };

    setIdeas([newIdea, ...ideas]);
    setNewIdeaText('');
  };

  const handleBack = () => {
    playWhoosh();
    triggerHaptic('tap');
    if (onBackToCourt) {
      onBackToCourt();
    } else {
      onClose();
    }
  };

  return (
    <div className="court-phone-container court-shake-target">
      <div className="court-ideas-vintage-page">
        {/* Authentic iPhone 16/17 Pro Max Status Bar */}
        <MobileStatusBar />

        {/* Top Navbar: Back Button + Long Shaking Deliberation Pill */}
        <header
          className="court-navbar"
          style={{
            background: 'transparent',
            borderBottom: 'none',
            padding: '3px 14px 4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Back Button -> Goes to Court Lobby */}
          <button
            className="court-nav-back-btn"
            onClick={handleBack}
            aria-label="Back to court lobby"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <ChevronLeft size={22} color="#1e293b" />
          </button>

          {/* Long Shaking Deliberation Pill (Active in progress + growing progress bar to limit) */}
          <div
            className="court-live-deliberating-pill"
            onClick={() => {
              playWhoosh();
              triggerHaptic('tap');
              onEnterCourt();
            }}
            title="Deliberation in progress - click to join court"
          >
            <div className="court-pill-content-left">
              <div className="court-pill-icon-badge">
                <span className="court-pill-pulse-dot" />
              </div>
              <div className="court-pill-text-col">
                <span className="court-pill-kicker">NOW DISCUSSING</span>
                <span className="court-pill-title">Jeju</span>
              </div>
            </div>

            <div className="court-pill-content-right">
              <div className="court-pill-timer-badge">
                <Clock size={11} strokeWidth={2.4} />
                <span>{formatTimeLeft(timeLeft)}</span>
              </div>
              <ChevronRight size={17} className="court-pill-arrow-icon" strokeWidth={2.6} />
            </div>

            <div className="court-pill-progress-track">
              <div
                className="court-pill-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </header>

        {/* 4-Step Progress Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '2px 16px 6px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* 4 Progress Segments: 2 filled, 2 empty */}
          <div style={{ display: 'flex', gap: 6, flex: 1, maxWidth: 220 }}>
            <div style={{ height: 4, flex: 1, background: '#1877f2', borderRadius: 99 }} />
            <div style={{ height: 4, flex: 1, background: '#1877f2', borderRadius: 99 }} />
            <div style={{ height: 4, flex: 1, background: '#e2e8f0', borderRadius: 99 }} />
            <div style={{ height: 4, flex: 1, background: '#e2e8f0', borderRadius: 99 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.1 }}>
            <b style={{ fontSize: '12px', fontWeight: 900, color: '#0f172a' }}>2 / 4</b>
            <span style={{ fontSize: '9.5px', color: '#64748b', fontWeight: 600 }}>Share ideas</span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="court-ideas-vintage-scroll">
          {/* =============================================================
              HERO SECTION (VINTAGE SCRAPBOOK WITH POLAROIDS & STAMP)
              ============================================================= */}
          <section className="court-vintage-hero-section">
            {/* Left Botanical Eucalyptus Branch */}
            <svg
              width="92"
              height="116"
              viewBox="0 0 92 116"
              fill="none"
              style={{
                position: 'absolute',
                top: -8,
                left: -8,
                zIndex: 2,
                pointerEvents: 'none',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.06))',
              }}
            >
              <path
                d="M 2 12 Q 38 38 52 106"
                stroke="#5c705e"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
                opacity="0.85"
              />
              <ellipse cx="24" cy="20" rx="14" ry="9" transform="rotate(32 24 20)" fill="#628b6d" opacity="0.9" />
              <ellipse cx="14" cy="42" rx="15" ry="10" transform="rotate(-18 14 42)" fill="#4d7c5a" opacity="0.88" />
              <ellipse cx="40" cy="44" rx="16" ry="10" transform="rotate(45 40 44)" fill="#78a081" opacity="0.85" />
              <ellipse cx="32" cy="72" rx="16" ry="11" transform="rotate(-15 32 72)" fill="#568262" opacity="0.88" />
              <ellipse cx="56" cy="80" rx="15" ry="10" transform="rotate(30 56 80)" fill="#689674" opacity="0.82" />
              <ellipse cx="50" cy="108" rx="14" ry="9" transform="rotate(10 50 108)" fill="#446f50" opacity="0.85" />
            </svg>

            {/* Right Botanical Eucalyptus Branch */}
            <svg
              width="88"
              height="126"
              viewBox="0 0 88 126"
              fill="none"
              style={{
                position: 'absolute',
                top: 24,
                right: -8,
                zIndex: 2,
                pointerEvents: 'none',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.06))',
              }}
            >
              <path
                d="M 86 18 Q 54 44 38 120"
                stroke="#5c705e"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
                opacity="0.85"
              />
              <ellipse cx="64" cy="28" rx="14" ry="9" transform="rotate(-35 64 28)" fill="#628b6d" opacity="0.88" />
              <ellipse cx="46" cy="48" rx="15" ry="10" transform="rotate(25 46 48)" fill="#78a081" opacity="0.85" />
              <ellipse cx="68" cy="64" rx="16" ry="10" transform="rotate(-38 68 64)" fill="#4d7c5a" opacity="0.9" />
              <ellipse cx="44" cy="86" rx="15" ry="10" transform="rotate(15 44 86)" fill="#568262" opacity="0.86" />
              <ellipse cx="54" cy="110" rx="14" ry="9" transform="rotate(-20 54 110)" fill="#689674" opacity="0.82" />
            </svg>

            {/* Top-Right Vintage Cancellation Stamp & Handwritten Script */}
            <div className="court-stamp-badge-lockup">
              <div className="court-vintage-cancellation-stamp">
                <div className="court-stamp-round-seal">
                  <div className="court-stamp-inner-circle">
                    <span className="court-stamp-text-top">TRAVEL TOGETHR</span>
                    <span className="court-stamp-airplane">✈</span>
                    <span className="court-stamp-text-bottom">TOGETHER BETTER</span>
                  </div>
                </div>
                {/* Wavy cancellation postmark lines */}
                <div className="court-postmark-wavy-lines">
                  {[0, 1, 2].map((i) => (
                    <svg key={i} viewBox="0 0 30 6" fill="none">
                      <path
                        d="M 0 3 Q 7.5 0 15 3 Q 22.5 6 30 3"
                        stroke="#991b1b"
                        strokeWidth="1.2"
                        opacity="0.75"
                      />
                    </svg>
                  ))}
                </div>
              </div>

              {/* Slanted Handwritten Cursive */}
              <div className="court-vintage-cursive-slogan">
                Good<br />Ideas<br />Brighter<br />Journeys
              </div>
            </div>

            {/* Title Lockup (General travel copy, clean vertical spacing) */}
            <div className="court-vintage-title-lockup">
              <h2 className="court-vintage-main-title">
                Share ideas
                <div className="court-title-accent-ticks">
                  <span />
                  <span />
                </div>
              </h2>
              <div className="court-vintage-sub-title-crimson">
                to discuss
              </div>
              <p className="court-vintage-body-desc">
                Share your favorite places, food, activities or routes so everyone can compare and decide together.
              </p>
            </div>

            {/* 3 Overlapping Polaroids with 3D Pushpins and Sticky Notes (General) */}
            <div className="court-polaroids-scrapbook-stage" style={{ height: 176 }}>
              {/* Polaroid 1 (Left): Seaside / Beach */}
              <div
                className="court-polaroid-frame"
                style={{
                  width: 122,
                  height: 128,
                  left: 10,
                  top: 12,
                  transform: 'rotate(-6.5deg)',
                  zIndex: 2,
                }}
                onClick={() => setExpandedImage('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80')}
              >
                {/* Glossy Red Pushpin */}
                <div className="court-glossy-pushpin red" style={{ top: -7, left: 18 }} />

                {/* Blue Sticky Note */}
                <div
                  className="court-polaroid-sticky-note court-sticky-blue"
                  style={{
                    top: -10,
                    left: -4,
                    transform: 'rotate(-5deg)',
                  }}
                >
                  Beautiful Beaches
                </div>

                <div className="court-polaroid-photo-box" style={{ height: 92 }}>
                  <img
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80"
                    alt="Seaside Beach"
                  />
                </div>
                <div className="court-polaroid-caption">
                  <span>📍</span> COASTAL ESCAPE
                </div>
              </div>

              {/* Polaroid 2 (Center): Iconic Landmark */}
              <div
                className="court-polaroid-frame"
                style={{
                  width: 136,
                  height: 144,
                  left: 122,
                  top: 0,
                  transform: 'rotate(-1.5deg)',
                  zIndex: 4,
                }}
                onClick={() => setExpandedImage('https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80')}
              >
                {/* Glossy Blue Pushpin */}
                <div className="court-glossy-pushpin blue" style={{ top: -7, left: 60 }} />

                {/* Yellow Sticky Note */}
                <div
                  className="court-polaroid-sticky-note court-sticky-yellow"
                  style={{
                    top: -10,
                    right: -6,
                    transform: 'rotate(6deg)',
                  }}
                >
                  Hidden Gems?
                </div>

                <div className="court-polaroid-photo-box" style={{ height: 110 }}>
                  <img
                    src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=500&auto=format&fit=crop&q=80"
                    alt="Scenic Landmark"
                  />
                </div>
                <div className="court-polaroid-caption">
                  <span>📍</span> SCENIC LANDMARK
                </div>
              </div>

              {/* Polaroid 3 (Right): Delicious Local Food */}
              <div
                className="court-polaroid-frame"
                style={{
                  width: 122,
                  height: 128,
                  right: 10,
                  top: 14,
                  transform: 'rotate(5.5deg)',
                  zIndex: 3,
                }}
                onClick={() => setExpandedImage('https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80')}
              >
                {/* Glossy Red Pushpin */}
                <div className="court-glossy-pushpin red" style={{ top: -7, left: 22 }} />

                {/* Ivory / Light Yellow Sticky Note */}
                <div
                  className="court-polaroid-sticky-note court-sticky-ivory"
                  style={{
                    top: -9,
                    right: -4,
                    transform: 'rotate(-3deg)',
                  }}
                >
                  Local Food ♡
                </div>

                <div className="court-polaroid-photo-box" style={{ height: 92 }}>
                  <img
                    src="https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80"
                    alt="Local Food"
                  />
                </div>
                <div className="court-polaroid-caption">
                  <span>📍</span> LOCAL FLAVORS
                </div>
              </div>
            </div>
          </section>

          {/* =============================================================
              UPLOAD INPUT CARD (PENCIL + 4 LARGE CHIPS + SEPARATE UPLOAD ROW)
              ============================================================= */}
          <div className="court-ideas-upload-box">
            {/* Row 1: Text Input */}
            <div className="court-upload-input-wrap">
              <Pencil size={15} color="#94a3b8" />
              <input
                type="text"
                className="court-upload-text-input"
                placeholder="Share an idea with the group..."
                value={newIdeaText}
                onChange={(e) => setNewIdeaText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUploadIdea();
                }}
              />
            </div>

            {/* Row 2: 4 Enlarged Action Chips across the row */}
            <div className="court-upload-chips-grid">
              <button
                type="button"
                className={`court-large-action-chip ${activeChip === 'photo' ? 'active' : ''}`}
                onClick={() => setActiveChip('photo')}
              >
                <ImageIcon size={14} color="#0284c7" />
                <span>Photo</span>
              </button>
              <button
                type="button"
                className={`court-large-action-chip ${activeChip === 'place' ? 'active' : ''}`}
                onClick={() => setActiveChip('place')}
              >
                <MapPin size={14} color="#ef4444" />
                <span>Place</span>
              </button>
              <button
                type="button"
                className={`court-large-action-chip ${activeChip === 'note' ? 'active' : ''}`}
                onClick={() => setActiveChip('note')}
              >
                <FileText size={14} color="#eab308" />
                <span>Note</span>
              </button>
              <button
                type="button"
                className={`court-large-action-chip ${activeChip === 'link' ? 'active' : ''}`}
                onClick={() => setActiveChip('link')}
              >
                <Link2 size={14} color="#6366f1" />
                <span>Link</span>
              </button>
            </div>

            {/* Row 3: Dedicated Full-Width Upload Button */}
            <div className="court-upload-btn-row">
              <button
                type="button"
                className="court-upload-btn-full"
                onClick={handleUploadIdea}
              >
                <Upload size={15} strokeWidth={2.6} />
                <span>Upload idea</span>
              </button>
            </div>
          </div>

          {/* =============================================================
              FEED SECTION: "Ideas from the group" (CARTOON AVATARS)
              ============================================================= */}
          <div className="court-group-feed-container">
            <div className="court-feed-header-row">
              <h3 className="court-feed-title-serif">
                Ideas from the group
              </h3>
              <button type="button" className="court-feed-sort-dropdown">
                <span>Newest first</span>
                <ChevronDown size={13} color="#64748b" />
              </button>
            </div>

            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="court-feed-post-card"
                onClick={() => onOpenDiscussion && onOpenDiscussion(idea.id)}
              >
                {/* Left Thumbnail with photo count badge */}
                <div
                  className="court-feed-post-thumb-wrap"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedImage(idea.imageUrl);
                  }}
                >
                  <img src={idea.imageUrl} alt={idea.title} />
                  <div className="court-feed-photo-count-badge">
                    <ImageIcon size={10} />
                    <span>{idea.photoCount}</span>
                  </div>
                </div>

                {/* Right Post Content with Original Cartoon Character Avatar */}
                <div className="court-feed-post-content">
                  {/* Author line */}
                  <div className="court-feed-author-line">
                    <div className="court-feed-author-info">
                      {/* Original Cartoon Character Avatar */}
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          background: 'radial-gradient(circle at 50% 35%, #ffffff 0%, #f1f5f9 100%)',
                          border: '1.5px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                        }}
                      >
                        <TravelCourtCharacter
                          variant={idea.characterVariant}
                          isAvatar
                          size={32}
                          state="idle"
                          animated={false}
                        />
                      </div>
                      <span className="court-feed-author-name">{idea.author}</span>
                      <span className="court-feed-time-ago">{idea.timeAgo}</span>
                    </div>
                    <button
                      type="button"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, color: '#94a3b8' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal size={15} />
                    </button>
                  </div>

                  {/* Title */}
                  <div className="court-feed-post-title">{idea.title}</div>

                  {/* Description snippet */}
                  <p className="court-feed-post-desc">{idea.description}</p>

                  {/* Tags and comment count */}
                  <div className="court-feed-tags-and-comments">
                    <div className="court-feed-tags-list">
                      {idea.tags.map((tag) => (
                        <span key={tag} className="court-feed-tag-pill">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="court-feed-comment-stat">
                      <MessageSquare size={12} color="#64748b" />
                      <span>{idea.commentsCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =============================================================
            STICKY BOTTOM ACTION BAR: [ 👥 Open Discussion (6) → ]
            ============================================================= */}
        <div className="court-ideas-sticky-bar">
          <button
            type="button"
            className="court-open-discussion-btn"
            onClick={() => {
              playWhoosh();
              triggerHaptic('tap');
              onEnterCourt();
            }}
          >
            <Users size={18} />
            <span>Open Discussion {discussionLabel}</span>
            <span style={{ fontSize: '17px', marginLeft: 2 }}>→</span>
          </button>
          <MobileHomeIndicator />
        </div>

        {/* Image Lightbox Modal */}
        {expandedImage && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 20,
            }}
            onClick={() => setExpandedImage(null)}
          >
            <button
              type="button"
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setExpandedImage(null)}
            >
              <X size={20} />
            </button>
            <img
              src={expandedImage}
              alt="Enlarged view"
              style={{
                maxWidth: '100%',
                maxHeight: '80%',
                borderRadius: 16,
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

