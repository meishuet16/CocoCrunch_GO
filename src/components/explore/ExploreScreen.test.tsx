import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { ExploreScreen } from './ExploreScreen';
import { EarthCenterpiece } from './EarthCenterpiece';
import { RotatableEarth } from './RotatableEarth';
import { EarthFullscreenModal } from './EarthFullscreenModal';
import { CommunityTripCard } from './CommunityTripCard';
import { ExplorePlaceCard } from './ExplorePlaceCard';
import AppRescued from '../../AppRescued';
import { discoverPlaces } from '../../domain/discovery';
import { defaultTingoDimensions, deriveTingoBehavior } from '../../domain/tingo';

describe('ExploreScreen (Community Trip Explore)', () => {
  const dummyTingoDimensions = defaultTingoDimensions;
  const dummyTingoBehavior = deriveTingoBehavior(dummyTingoDimensions);

  const mockPlaces = [
    {
      id: 1,
      name: 'Tsukiji Outer Market',
      type: 'Food · market',
      match: 96,
      cost: 'RM45 est.',
      duration: '1.5h',
      why: 'Food-first anchor with an easy morning slot.',
      source: 'prototype-catalog' as const,
      estimatedCost: 45,
      durationMinutes: 90,
      transferMinutes: 15,
      walkingKm: 1.2,
      indoor: false,
      tags: ['food', 'market'],
      saved: false,
      added: false,
    },
    {
      id: 2,
      name: 'Daikanyama',
      type: 'Cafés · streets',
      match: 91,
      cost: 'RM38 est.',
      duration: '2h',
      why: 'Scenic cafés and a relaxed walking pace.',
      source: 'prototype-catalog' as const,
      estimatedCost: 38,
      durationMinutes: 120,
      transferMinutes: 20,
      walkingKm: 1.8,
      indoor: false,
      tags: ['cafe', 'streets'],
      saved: true,
      added: false,
    },
  ];

  const mockCommunityTrips = [
    {
      id: 1,
      title: 'Tokyo: slow food + vintage streets',
      author: 'Aki',
      match: 92,
      saved: false,
      destination: 'Tokyo',
      days: 5,
      budget: 'RM 1,400 est.',
      highlights: ['Tsukiji morning market', 'Daikanyama café stroll'],
    },
    {
      id: 2,
      title: 'Rain-proof Tokyo weekend',
      author: 'Mina',
      match: 86,
      saved: true,
      destination: 'Tokyo',
      days: 3,
      budget: 'RM 850 est.',
      highlights: ['Tokyo Station underground', 'Mori Art Museum'],
    },
  ];

  it('renders top search bar and travel category filter chips', () => {
    const html = renderToStaticMarkup(
      <ExploreScreen
        activeTripDestination="Tokyo"
        mode="group"
        tingoBehavior={dummyTingoBehavior}
        tingoDimensions={dummyTingoDimensions}
        placeRecommendations={mockPlaces}
        onSavePlace={() => undefined}
        onAddPlace={() => undefined}
        communityTrips={mockCommunityTrips}
        onToggleSaveCommunityTrip={() => undefined}
        onOpenTripPlanning={() => undefined}
      />
    );

    expect(html).toContain('role="search"');
    expect(html).toContain('Search places');
    expect(html).toContain('Country:');
    expect(html).toContain('All Countries');
    expect(html).toContain('Japan');
    expect(html).toContain('South Korea');
    expect(html).toContain('>All</button>');
    expect(html).toContain('Duration');
    expect(html).toContain('Budget');
    expect(html).toContain('Solo');
    expect(html).toContain('Family');
    expect(html).toContain('Adventure');
  });

  it('renders country filter button on same row as search bar and alphabetical country dropdown', () => {
    const html = renderToStaticMarkup(
      <ExploreScreen
        activeTripDestination="Tokyo"
        mode="group"
        tingoBehavior={dummyTingoBehavior}
        tingoDimensions={dummyTingoDimensions}
        placeRecommendations={mockPlaces}
        onSavePlace={() => undefined}
        onAddPlace={() => undefined}
        communityTrips={mockCommunityTrips}
        onToggleSaveCommunityTrip={() => undefined}
        onOpenTripPlanning={() => undefined}
      />
    );

    // Search row has both search input and filter button on same level
    expect(html).toContain('class="explore-search-row"');
    expect(html).toContain('class="explore-search-bar"');
    expect(html).toContain('class="country-filter-btn');
    expect(html).toContain('aria-label="Country filters"');

    // Modal pop-up contains in-modal search, scrollable list, alphabetical countries, and floating circle close button
    expect(html).toContain('country-modal-overlay');
    expect(html).toContain('country-modal-card');
    expect(html).toContain('country-modal-search');
    expect(html).toContain('floating-close-circle-btn');
    expect(html).toContain('class="country-scroll-list"');
    expect(html).toContain('All Countries');
    expect(html).toContain('Argentina');
    expect(html).toContain('Australia');
    expect(html).toContain('Brazil');
    expect(html).toContain('Canada');
    expect(html).toContain('Egypt');
    expect(html).toContain('France');
    expect(html).toContain('Germany');
    expect(html).toContain('Greece');
    expect(html).toContain('Iceland');
    expect(html).toContain('Indonesia');
    expect(html).toContain('Italy');
    expect(html).toContain('Japan');
    expect(html).toContain('Malaysia');
    expect(html).toContain('New Zealand');
    expect(html).toContain('Singapore');
    expect(html).toContain('South Korea');
    expect(html).toContain('Spain');
    expect(html).toContain('Switzerland');
    expect(html).toContain('Taiwan');
    expect(html).toContain('Thailand');
    expect(html).toContain('United Kingdom');
    expect(html).toContain('United States');
    expect(html).toContain('Vietnam');

    // Includes flags
    expect(html).toContain('🇦🇷');
    expect(html).toContain('🇦🇺');
    expect(html).toContain('🇧🇷');
    expect(html).toContain('🇪🇬');
    expect(html).toContain('🇬🇷');
    expect(html).toContain('🇯🇵');
    expect(html).toContain('🇰🇷');
    expect(html).toContain('🇹🇼');
  });

  it('renders EarthCenterpiece with destinations covered, statistics, and YouTube-style fullscreen icon', () => {
    const html = renderToStaticMarkup(
      <EarthCenterpiece
        destinationsCovered={['Tokyo', 'Kyoto', 'Osaka']}
        totalItineraries={12}
        activeDestination="Tokyo"
      />
    );

    expect(html).toContain('DESTINATIONS COVERED');
    expect(html).not.toContain('3 regions mapped · 12 community itineraries');
    expect(html).not.toContain('Rotate the real-color Earth');
    expect(html).toContain('100%');
    expect(html).toContain('Explicit Sharing');
    // Verifies rotatable earth canvas and YouTube-style fullscreen icon button
    expect(html).toContain('rotatable-earth-canvas');
    expect(html).toContain('earth-yt-fullscreen-btn');
    expect(html).toContain('aria-label="Full screen"');
  });

  it('renders RotatableEarth with accessible canvas for real-color interactive globe', () => {
    const html = renderToStaticMarkup(
      <RotatableEarth
        size={140}
        interactive={true}
        autoRotate={false}
        markers={[
          { id: '1', name: 'Tokyo', lat: 35.6, lon: 139.6, label: 'Tokyo · Worth it', reviewStatus: 'yes' },
        ]}
      />
    );

    expect(html).toContain('rotatable-earth-wrapper');
    expect(html).toContain('rotatable-earth-canvas');
    expect(html).toContain('Real-Color 3D Earth Globe: drag to rotate');
  });

  it('renders EarthFullscreenModal defaulting to 3D Earth model only with icon-only back button', () => {
    const handleClose = vi.fn();
    const html = renderToStaticMarkup(
      <EarthFullscreenModal
        isOpen={true}
        onClose={handleClose}
      />
    );

    // 1. Back button without word
    expect(html).toContain('earth-floating-back-btn');
    expect(html).toContain('aria-label="Back to Explore"');
    expect(html).not.toContain('Back to Explore</span>');

    // 2. No top header bar or pinned trips dock
    expect(html).not.toContain('earth-fullscreen-header');
    expect(html).not.toContain('earth-pins-dock');
    expect(html).not.toContain('PINNED PAST TRIPS');

    // 3. 3D Earth stage is clean hero
    expect(html).toContain('earth-stage-viewport');
    expect(html).toContain('rotatable-earth-canvas');
    expect(html).toContain('Drag to rotate · Click any pin or title to view review');
    expect(html).toContain('Worth it (Reviewed)');
    expect(html).toContain('Mixed (Reviewed)');

    // 4. Details window is NOT shown by default until user clicks a pin
    expect(html).not.toContain('floating-review-window');
  });

  it('renders EarthFullscreenModal with floating review window when a pin is clicked or active', () => {
    const html = renderToStaticMarkup(
      <EarthFullscreenModal
        isOpen={true}
        onClose={() => undefined}
        initialTripId="past-trip-tokyo"
      />
    );

    // Floating review window beside the globe
    expect(html).toContain('floating-review-window');
    expect(html).toContain('floating-review-close-btn');
    expect(html).toContain('TRIP REVIEW');
    expect(html).toContain('Tokyo');
    expect(html).toContain('Tokyo: Slow Food &amp; Small Discoveries');

    // Review outcomes, reflections, spend, and Tingo wisdom
    expect(html).toContain('✦ Worth it');
    expect(html).toContain('Traveler Retrospective:');
    expect(html).toContain('Tingo wisdom recorded:');
    expect(html).toContain('RM 1850 actual');
    expect(html).toContain('Prev Pin');
    expect(html).toContain('Next Pin');
  });

  it('renders CommunityTripCard with author header, summary preview, and interactive footer', () => {
    const trip = mockCommunityTrips[0];
    const html = renderToStaticMarkup(
      <CommunityTripCard
        trip={trip}
        onToggleSave={() => undefined}
        onViewPlan={() => undefined}
      />
    );

    // Header
    expect(html).toContain(trip.author);
    expect(html).toContain('Explicitly shared');
    expect(html).toContain('Tokyo');
    expect(html).toContain('92% fit');

    // Visual Cover Photo
    expect(html).toContain('trip-cover-visual');
    expect(html).toContain('trip-cover-img');

    // Title
    expect(html).toContain('Tokyo: slow food + vintage streets');

    // Summary Preview
    expect(html).toContain('5 days');
    expect(html).toContain('RM 1,400 est.');
    expect(html).toContain('Main stops:');
    expect(html).toContain('Tsukiji morning market');
    expect(html).toContain('Daikanyama café stroll');

    // Interactive Footer
    expect(html).toContain('like-button');
    expect(html).toContain('View Full Plan');
  });

  it('renders ExplorePlaceCard with fit %, metrics, and explainability in group mode', () => {
    const place = mockPlaces[0];
    const html = renderToStaticMarkup(
      <ExplorePlaceCard
        place={place}
        mode="group"
        onSave={() => undefined}
        onAdd={() => undefined}
      />
    );

    // Visual photo banner
    expect(html).toContain('place-card-visual-frame');
    expect(html).toContain('place-photo-img');

    expect(html).toContain('Tsukiji Outer Market');
    expect(html).toContain('Food · market');
    expect(html).toContain('96% fit');
    expect(html).toContain('RM45 est.');
    expect(html).toContain('1.5h');
    expect(html).toContain('1.2 km');
    expect(html).toContain('Why it fits:');
    expect(html).toContain('Food-first anchor with an easy morning slot.');
    expect(html).toContain('Suggest to group');
    expect(html).toContain('Saved place catalog');
    expect(html).not.toContain('Suggestion creates a candidate; official group itinerary updates only upon consensus.');
  });

  it('truthfully exposes fallback source when destination is unknown', () => {
    const fallbackPlaces = discoverPlaces('Reykjavik', dummyTingoDimensions);
    const place = {
      ...fallbackPlaces[0],
      id: 1,
      saved: false,
      added: false,
    };

    const html = renderToStaticMarkup(
      <ExplorePlaceCard
        place={place}
        mode="solo"
        onSave={() => undefined}
        onAdd={() => undefined}
      />
    );

    expect(html).toContain('Fallback example · not live destination data');
    expect(html).toContain('Add to plan');
    expect(html).not.toContain('Suggestion creates a candidate');
  });

  it('renders saved ideas shelf when saved ideas exist', () => {
    const savedIdeas = [
      { name: 'Daikanyama', source: 'prototype-catalog' },
      { name: 'Nishiki Market', source: 'prototype-catalog' },
    ];

    const html = renderToStaticMarkup(
      <ExploreScreen
        activeTripDestination="Tokyo"
        mode="solo"
        tingoBehavior={dummyTingoBehavior}
        tingoDimensions={dummyTingoDimensions}
        placeRecommendations={mockPlaces}
        onSavePlace={() => undefined}
        onAddPlace={() => undefined}
        communityTrips={mockCommunityTrips}
        onToggleSaveCommunityTrip={() => undefined}
        savedIdeas={savedIdeas}
        onOpenTripPlanning={() => undefined}
      />
    );

    expect(html).toContain('Saved ideas for this trip · 2');
    expect(html).toContain('Daikanyama');
    expect(html).toContain('Nishiki Market');
  });

  it('guarantees unique, distinct photography across different places and community trips (no same picture)', async () => {
    const { getPlacePhoto, getCommunityTripCover, getStopThumbnail } = await import('./explorePhotos');

    // Test places have unique images
    const tsukijiPhoto = getPlacePhoto('Tsukiji Outer Market', 'Food · market', 'Tokyo');
    const daikanyamaPhoto = getPlacePhoto('Daikanyama', 'Cafés · streets', 'Tokyo');
    const shimoPhoto = getPlacePhoto('Shimokitazawa', 'Vintage · neighbourhood', 'Tokyo');
    const nishikiPhoto = getPlacePhoto('Nishiki Market', 'Food · market', 'Kyoto');
    const gionPhoto = getPlacePhoto('Gion', 'Temple · culture', 'Kyoto');
    const kuromonPhoto = getPlacePhoto('Kuromon Market', 'Food · market', 'Osaka');
    const dotonboriPhoto = getPlacePhoto('Dotonbori', 'Riverside · food', 'Osaka');

    const placeSet = new Set([
      tsukijiPhoto,
      daikanyamaPhoto,
      shimoPhoto,
      nishikiPhoto,
      gionPhoto,
      kuromonPhoto,
      dotonboriPhoto,
    ]);
    expect(placeSet.size).toBe(7); // All 7 places have completely distinct photos

    // Test community trips have unique covers
    const trip1Cover = getCommunityTripCover('Tokyo', 'Tokyo: slow food + vintage streets', 'Solo', 1);
    const trip2Cover = getCommunityTripCover('Tokyo', 'Rain-proof Tokyo weekend', 'Budget', 2);
    const trip3Cover = getCommunityTripCover('Kyoto', 'Kyoto: temple mornings', 'Duration', 3);
    const trip4Cover = getCommunityTripCover('Osaka', 'Osaka: street bites + night market', 'Family', 4);
    const trip5Cover = getCommunityTripCover('Jeju', 'Jeju: salt air and citrus', 'Adventure', 5);
    const trip6Cover = getCommunityTripCover('Taipei', 'Taipei: night markets and tea hills', 'Solo', 6);
    const trip7Cover = getCommunityTripCover('Florence', 'Tuscany: quiet stone lanes & vineyards', 'Adventure', 7);

    const tripSet = new Set([
      trip1Cover,
      trip2Cover,
      trip3Cover,
      trip4Cover,
      trip5Cover,
      trip6Cover,
      trip7Cover,
    ]);
    expect(tripSet.size).toBe(7); // All 7 trips have completely distinct covers

    // Test stop thumbnails have unique photos
    const stop1 = getStopThumbnail('Tsukiji food walk');
    const stop2 = getStopThumbnail('Daikanyama café stroll');
    const stop3 = getStopThumbnail('Shimokitazawa vintage');
    const stop4 = getStopThumbnail('Nishiki Market');
    const stop5 = getStopThumbnail('Philosopher’s Path walk');
    const stop6 = getStopThumbnail('Gion tea ceremony');

    const stopSet = new Set([stop1, stop2, stop3, stop4, stop5, stop6]);
    expect(stopSet.size).toBe(6); // All 6 stops have completely distinct thumbnails
  });

  it('renders community trip details view from ui/explore-discovery-redesign with hero, author, narrative, meta chips, places, and save CTA', () => {
    const trip = mockCommunityTrips[0];
    const html = renderToStaticMarkup(
      <ExploreScreen
        activeTripDestination="Tokyo"
        mode="solo"
        tingoBehavior={dummyTingoBehavior}
        tingoDimensions={dummyTingoDimensions}
        placeRecommendations={mockPlaces}
        onSavePlace={() => undefined}
        onAddPlace={() => undefined}
        communityTrips={mockCommunityTrips}
        onToggleSaveCommunityTrip={() => undefined}
        initialDetail={{ kind: 'trip', item: trip }}
        onOpenTripPlanning={() => undefined}
      />
    );

    // Full-screen overlay & hero styling
    expect(html).toContain('xr-fullscreen');
    expect(html).toContain('xr-detail');
    expect(html).toContain('xr-detail-hero');
    expect(html).toContain('xr-trip-hero');
    expect(html).toContain(trip.title);

    // Author row with shared traveller indication and follow button
    expect(html).toContain('xr-author');
    expect(html).toContain(trip.author);
    expect(html).toContain('Public trip · shared by traveller');
    expect(html).toContain('Follow');

    // Narrative description
    expect(html).toContain('A five-day trip filled with good food');

    // Meta chips
    expect(html).toContain('xr-trip-meta');
    expect(html).toContain('days');
    expect(html).toContain('places');
    expect(html).toContain('Budget-friendly');
    expect(html).toContain('Cafés');
    expect(html).toContain('Local');

    // Places in this trip
    expect(html).toContain('Places in this trip');
    expect(html).toContain('xr-trip-places');

    // Primary CTA button
    expect(html).toContain('xr-save-trip');
    expect(html).toContain('Save trip inspiration');
  });

  it('renders place detail inspection view from ui/explore-discovery-redesign when inspecting a stop', () => {
    const place = mockPlaces[0];
    const html = renderToStaticMarkup(
      <ExploreScreen
        activeTripDestination="Tokyo"
        mode="solo"
        tingoBehavior={dummyTingoBehavior}
        tingoDimensions={dummyTingoDimensions}
        placeRecommendations={mockPlaces}
        onSavePlace={() => undefined}
        onAddPlace={() => undefined}
        communityTrips={mockCommunityTrips}
        onToggleSaveCommunityTrip={() => undefined}
        initialDetail={{
          kind: 'place',
          item: {
            id: place.id,
            name: place.name,
            type: place.type,
            match: place.match,
            cost: place.cost,
            duration: place.duration,
            why: place.why,
            saved: place.saved,
            added: place.added,
          },
        }}
        onOpenTripPlanning={() => undefined}
      />
    );

    expect(html).toContain('xr-fullscreen');
    expect(html).toContain('xr-detail');
    expect(html).toContain(place.name);
    expect(html).toContain(`${place.match}% fit`);
    expect(html).toContain('xr-place-meta');
    expect(html).toContain('Practical information');
    expect(html).toContain('xr-practical-info');
    expect(html).toContain('Suggest to group');
  });
});


