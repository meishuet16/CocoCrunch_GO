import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadPersisted, savePersisted, type PersistedState } from './persistence';

describe('persisted journey lifecycle', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('restores the completed onboarding-to-memory journey after a refresh', () => {
    let storedValue: string | null = null;
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => key === 'cococrunch:v1' ? storedValue : null,
      setItem: (key: string, value: string) => { if (key === 'cococrunch:v1') storedValue = value; },
      removeItem: () => { storedValue = null; },
    });

    // This fixture represents the same durable milestones as: onboarding → create and
    // confirm trip → During updates → end trip → archive a memory card.
    const journey: PersistedState = {
      version: 1,
      onboardingComplete: true,
      onboardingName: 'Priya',
      onboardingCountryCode: '+65',
      onboardingBirthday: '1998-05-16',
      basePackingPreferences: ['carry power bank', 'pack umbrella'],
      mode: 'group',
      destination: 'Tokyo',
      tripCreated: true,
      readyConfirmed: true,
      tripPhase: 'completed',
      destinationLockedByLeader: true,
      tripIntent: {
        destination: 'Tokyo', dates: { start: '2026-09-01', end: '2026-09-05' }, mode: 'group',
        tripVibe: 'Slow food and side streets', mustGo: 'Tsukiji food walk', dealBreaker: 'No red-eye return',
        preference: 'One cafe break each day', flexible: 'Leave one evening open', budget: 2400,
      },
      profile: { vibe: 'Slow food and side streets', mustGo: 'Tsukiji food walk', veto: 'No red-eye return', preference: 'One cafe break each day', flexible: 'Leave one evening open' },
      plannerTurn: 'Priya',
      courtVotes: [],
      courtConfirmed: true,
      courtDecision: 'Tsukiji food walk',
      groupBudgetTotal: 2400,
      soloBudgetTotal: 1200,
      groupBudgetPlan: { stay: 900, food: 600, transport: 300, activities: 600 },
      soloBudgetPlan: { stay: 500, food: 300, transport: 150, activities: 250 },
      groupBudgetActuals: { stay: 880, food: 650, transport: 320, activities: 620 },
      privacy: 'status',
      continuousLocation: false,
      recommendations: [{ name: 'Tsukiji Outer Market', saved: true, added: true }],
      worthIt: 'yes',
      profileLearned: true,
      tingoAnswers: [{ questionId: 'morning', optionId: 'slow' }],
      tingoDimensions: { pace: -2, experience: 0, budget: 0, comfort: 0, food: 3, adventure: 0, planning: 0, flexibility: 0, social: 0 },
      groupMemberBudgets: { priya: 1200, alex: 1200 },
      groupMemberVibes: { priya: ['relaxed'], alex: ['balanced'] },
      groupMemberDestinations: { priya: 'Tokyo' },
      members: [
        { id: 'priya', name: 'Priya', role: 'Trip lead', inviteStatus: 'joined', pace: 'steady' },
        { id: 'alex', name: 'Alex', role: 'Food scout', inviteStatus: 'joined', pace: 'fast' },
      ],
      flightBooking: { flightNumber: 'CC 118', departureTime: '2026-09-01 09:00', arrivalTime: '2026-09-01 17:00', checkInTime: '2026-09-01 07:00', sharedWithGroup: true, source: 'email-prototype' },
      accommodationBooking: { propertyName: 'Kumo House', checkInTime: '15:00', checkOutTime: '11:00', notes: 'Show passport at desk', cancellationDeadline: '2026-08-25 23:59', sharedWithGroup: true, source: 'quote-prototype' },
      emergencyContacts: [{ id: 'sam', name: 'Sam', contact: '+65 8123 4567', permission: 'both' }],
      emergencyCheckInFrequency: 60,
      selectedEmergencyContactId: 'sam',
      groupChannelMessages: [{ id: 'court-1', author: 'CocoCrunch', text: 'Group Court is open.', system: true, createdAt: '2026-09-02T09:00:00.000Z' }],
      groupCourtUnreadCount: 1,
      completedPaceEvidence: { delayed: false, mood: 'great', arrivalChecked: true },
      completedTodayItemIds: ['tsukiji'],
      automaticDeviationPrompted: true,
      tripEndPromptDismissed: false,
      photoMemoryArtifacts: [{ id: 'photo-1', title: 'Market breakfast', body: 'A shared morning.', source: 'local EXIF', locationLabel: 'Tsukiji', audience: 'group', isPublic: true, capturedAt: '2026-09-01T10:15:00.000Z', latitude: 35.6655, longitude: 139.7707, archiveDay: 1, archivePlace: 'Tsukiji food walk' }, { id: 'photo-2', title: 'Private note', body: 'Keep this private.', source: 'prototype fallback', locationLabel: 'Tokyo', audience: 'personal', isPublic: false }],
      published: true,
      memoryPublic: true,
      itemReviews: { tsukiji: 'worth' },
    };

    savePersisted(journey);
    const afterRefresh = loadPersisted();

    expect(afterRefresh.onboardingComplete).toBe(true);
    expect(afterRefresh).toMatchObject({
      onboardingName: 'Priya', onboardingCountryCode: '+65', onboardingBirthday: '1998-05-16',
      basePackingPreferences: ['carry power bank', 'pack umbrella'],
      tripCreated: true, readyConfirmed: true, tripPhase: 'completed',
      destinationLockedByLeader: true,
      tripIntent: journey.tripIntent,
      flightBooking: journey.flightBooking,
      accommodationBooking: journey.accommodationBooking,
      emergencyContacts: journey.emergencyContacts,
      emergencyCheckInFrequency: 60,
      selectedEmergencyContactId: 'sam',
      completedPaceEvidence: journey.completedPaceEvidence,
      photoMemoryArtifacts: journey.photoMemoryArtifacts,
      published: true,
      memoryPublic: true,
    });
    expect(afterRefresh.photoMemoryArtifacts).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'photo-1', isPublic: true, archivePlace: 'Tsukiji food walk' }),
      expect.objectContaining({ id: 'photo-2', isPublic: false }),
    ]));
    expect(afterRefresh.groupChannelMessages).toEqual(journey.groupChannelMessages);
    expect(afterRefresh.groupMemberBudgets).toEqual({ priya: 1200, alex: 1200 });
  });
});
