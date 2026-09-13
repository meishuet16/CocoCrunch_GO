import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryScreen } from './MemoryScreen';
import type { PhotoMemoryArtifact, DecisionRecord } from '../persistence';

describe('MemoryScreen Component', () => {
  const sampleArtifacts: PhotoMemoryArtifact[] = [
    {
      id: 'photo-1',
      title: 'Tsukiji Morning Seafood Don',
      body: 'The seafood don on the first morning was amazing!',
      source: 'EXIF 2099-10-12 09:30',
      locationLabel: 'Tsukiji',
      audience: 'personal',
      isPublic: true,
      capturedAt: '2099-10-12 09:30',
      archiveDay: 1,
      archivePlace: 'Tsukiji Outer Market',
    },
    {
      id: 'photo-2',
      title: 'Shibuya Sky Sunset',
      body: 'Spectacular sunset panorama.',
      source: 'EXIF 2099-10-13 17:00',
      locationLabel: 'Shibuya',
      audience: 'group',
      isPublic: false,
      capturedAt: '2099-10-13 17:00',
      archiveDay: 2,
      archivePlace: 'Shibuya Sky',
    },
  ];

  const sampleDecisions: DecisionRecord[] = [
    {
      id: 'dec-1',
      kind: 'court',
      topic: 'Dinner Choice: Ramen vs Yakiniku',
      decision: '18:30 Ramen + 21:00 Izakaya Drinks',
      voteSummary: '2:2 Deadlock tie',
      usedGacha: true,
      satisfaction: 'worth',
      createdAt: 'Day 1 17:45',
    },
  ];

  it('renders clean Trips-style list view matching Image 2 by default without redundant slogans or buttons', () => {
    const html = renderToStaticMarkup(
      <MemoryScreen
        destination="Tokyo"
        mode="group"
        photoArtifacts={sampleArtifacts}
        onPhotoArtifactsChange={vi.fn()}
        itemReviews={{}}
        onItemReviewChange={vi.fn()}
        decisionHistory={sampleDecisions}
      />
    );

    // List view matching Image 2
    expect(html).toContain('GROUP TRIPS');
    expect(html).toContain('g&#x27;g');
    expect(html).toContain('COMPLETED');
    expect(html).toContain('Tokyo');
    expect(html).toContain('trips-index-card');

    // No redundant old slogans or workspace buttons from Image 1
    expect(html).not.toContain('The trips that stayed with you. Private by default.');
    expect(html).not.toContain('Open trip workspace');
    expect(html).not.toContain('The retrospective starts with what actually happened.');
  });

  it('renders detail retrospective when initialTripId is provided with clean hero header', () => {
    const html = renderToStaticMarkup(
      <MemoryScreen
        initialTripId="past-trip-1"
        destination="Tokyo"
        mode="group"
        photoArtifacts={sampleArtifacts}
        onPhotoArtifactsChange={vi.fn()}
        itemReviews={{}}
        onItemReviewChange={vi.fn()}
        decisionHistory={sampleDecisions}
      />
    );

    // Header and metrics
    expect(html).toContain('Tokyo Memories');
    expect(html).toContain('Retrospective');
    expect(html).toContain('Trip Completed');
    expect(html).toContain('Archived');
    expect(html).toContain('Group Trip');
    expect(html).toContain('Photos Archived');
    expect(html).toContain('Places Visited');
    expect(html).toContain('Back to Past Trips');
  });

  it('renders auto-generated travel journal with Photo Map and Timeline presentations', () => {
    const html = renderToStaticMarkup(
      <MemoryScreen
        initialTripId="past-trip-1"
        destination="Tokyo"
        mode="solo"
        photoArtifacts={sampleArtifacts}
        onPhotoArtifactsChange={vi.fn()}
        itemReviews={{}}
        onItemReviewChange={vi.fn()}
        decisionHistory={[]}
      />
    );

    // Travel journal title
    expect(html).toContain('AUTOMATIC JOURNAL');
    expect(html).toContain('Photo Map');
    expect(html).toContain('Timeline Archive');

    // Photo map pins
    expect(html).toContain('Tsukiji · 1 photo');
    expect(html).toContain('Shibuya · 1 photo');

    // Timeline elements
    expect(html).toContain('Day 1');
    expect(html).toContain('Day 2');
    expect(html).toContain('Tsukiji Morning Seafood Don');
    expect(html).toContain('Shibuya Sky Sunset');
  });

  it('renders Memory Cards with thought notes and privacy status (private vs public)', () => {
    const html = renderToStaticMarkup(
      <MemoryScreen
        initialTripId="past-trip-1"
        destination="Tokyo"
        mode="solo"
        photoArtifacts={sampleArtifacts}
        onPhotoArtifactsChange={vi.fn()}
        itemReviews={{}}
        onItemReviewChange={vi.fn()}
        decisionHistory={[]}
      />
    );

    // First card is public
    expect(html).toContain('Public card');
    expect(html).toContain('The seafood don on the first morning was amazing!');

    // Second card is private
    expect(html).toContain('Private memory');
    expect(html).toContain('Spectacular sunset panorama.');

    // Action button to edit thoughts
    expect(html).toContain('Edit thought note');
  });

  it('renders "Worth It" review with rating buttons and AI learning note', () => {
    const html = renderToStaticMarkup(
      <MemoryScreen
        initialTripId="past-trip-1"
        destination="Tokyo"
        mode="solo"
        photoArtifacts={sampleArtifacts}
        onPhotoArtifactsChange={vi.fn()}
        itemReviews={{ tsukiji: 'worth', shibuya: 'mixed' }}
        onItemReviewChange={vi.fn()}
        decisionHistory={[]}
      />
    );

    expect(html).toContain('WORTH IT REVIEW');
    expect(html).toContain('Honest Experience Ratings');
    expect(html).toContain('Tsukiji Outer Market');
    expect(html).toContain('Shibuya Sky');

    // Ratings
    expect(html).toContain('🌟 Worth it');
    expect(html).toContain('🤔 Mixed');
    expect(html).toContain('🙅 Skip');

    // AI recommendation sync notice
    expect(html).toContain('Ratings are continuously ingested to automatically optimize recommendation ranking in your next trips.');
  });

  it('renders Said vs Done Comparison comparing vibe, must-go, deal-breaker, and time allocation', () => {
    const html = renderToStaticMarkup(
      <MemoryScreen
        initialTripId="past-trip-1"
        destination="Tokyo"
        mode="solo"
        photoArtifacts={sampleArtifacts}
        onPhotoArtifactsChange={vi.fn()}
        itemReviews={{}}
        onItemReviewChange={vi.fn()}
        decisionHistory={[]}
      />
    );

    expect(html).toContain('SAID VS DONE');
    expect(html).toContain('Initial Intent (Said)');
    expect(html).toContain('Actual Outcome (Done)');
    expect(html).toContain('Trip Vibe');
    expect(html).toContain('Rhythm');
    expect(html).toContain('Must-Go Priorities');
    expect(html).toContain('Deal-Breaker Guardrails');
    expect(html).toContain('Time Allocation Shift');
    expect(html).toContain('Outcome Insight:');
  });

  it('renders Budget vs Actual Spend Review with category breakdowns, variances, and satisfaction ratings', () => {
    const html = renderToStaticMarkup(
      <MemoryScreen
        initialTripId="past-trip-1"
        destination="Tokyo"
        mode="solo"
        photoArtifacts={sampleArtifacts}
        onPhotoArtifactsChange={vi.fn()}
        itemReviews={{}}
        onItemReviewChange={vi.fn()}
        decisionHistory={[]}
        spent={2480}
        totalBudget={2400}
      />
    );

    expect(html).toContain('BUDGET REVIEW');
    expect(html).toContain('Category Variance');
    expect(html).toContain('Spend Satisfaction');
    expect(html).toContain('Stay');
    expect(html).toContain('Dining');
    expect(html).toContain('Transit');
    expect(html).toContain('Activities');
    expect(html).toContain('Shopping');

    // Satisfaction ratings
    expect(html).toContain('Spend Satisfaction:');
    expect(html).toContain('>Worth it</button>');
    expect(html).toContain('>Fair</button>');
    expect(html).toContain('>Overpriced</button>');
  });

  it('renders Group Decision History when in group mode with dispute, votes, gacha, and final decision', () => {
    const html = renderToStaticMarkup(
      <MemoryScreen
        initialTripId="past-trip-1"
        destination="Tokyo"
        mode="group"
        photoArtifacts={sampleArtifacts}
        onPhotoArtifactsChange={vi.fn()}
        itemReviews={{}}
        onItemReviewChange={vi.fn()}
        decisionHistory={sampleDecisions}
      />
    );

    expect(html).toContain('GROUP COURT ARCHIVE');
    expect(html).toContain('Disputes, Votes');
    expect(html).toContain('Final Resolutions');
    expect(html).toContain('Dinner Choice: Ramen vs Yakiniku');
    expect(html).toContain('2:2 Deadlock tie');
    expect(html).toContain('Triggered Gacha Arbitration');
    expect(html).toContain('18:30 Ramen + 21:00 Izakaya Drinks');
    expect(html).toContain('Win-win outcome, resolved itinerary conflict smoothly');
  });

  it('renders AI adaptive preference evolution card learning from behavioral data without retaking survey', () => {
    const html = renderToStaticMarkup(
      <MemoryScreen
        initialTripId="past-trip-1"
        destination="Tokyo"
        mode="group"
        photoArtifacts={sampleArtifacts}
        onPhotoArtifactsChange={vi.fn()}
        itemReviews={{}}
        onItemReviewChange={vi.fn()}
        decisionHistory={sampleDecisions}
      />
    );

    expect(html).toContain('AI Preference Evolution · Adaptive Learning');
    expect(html).toContain('Preference Model Updated');
    expect(html).toContain('without retaking any surveys');
    expect(html).toContain('Food');
    expect(html).toContain('Dining weight +18%');
    expect(html).toContain('Pacing buffer +25 mins');
    expect(html).toContain('Dining budget flexibility');
    expect(html).toContain('Group arbitration playbook');
  });

  it('strictly adheres to the Black, Red, Gray color scheme constraint with no prohibited color styles', () => {
    const html = renderToStaticMarkup(
      <MemoryScreen
        destination="Tokyo"
        mode="group"
        photoArtifacts={sampleArtifacts}
        onPhotoArtifactsChange={vi.fn()}
        itemReviews={{}}
        onItemReviewChange={vi.fn()}
        decisionHistory={sampleDecisions}
      />
    );

    // Ensure no inline blue, green, orange, or purple font colors
    expect(html).not.toMatch(/color:\s*['"]?(blue|green|purple|orange|#00f|#0000ff)/i);
  });
});
