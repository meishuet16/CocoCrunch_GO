import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { GroupSplit } from './GroupSplit';

describe('GroupSplit', () => {
  const sampleMembers = [
    { id: 'priya', name: 'Priya', role: 'Trip lead', inviteStatus: 'joined' as const, pace: 'steady' as const },
    { id: 'alex', name: 'Alex', role: 'Food scout', inviteStatus: 'joined' as const, pace: 'slow' as const },
    { id: 'sam', name: 'Sam', role: 'Navigator', inviteStatus: 'joined' as const, pace: 'fast' as const },
  ];

  it('makes its local midpoint suggestion and Court handoff explicit', () => {
    const html = renderToStaticMarkup(
      <GroupSplit
        members={sampleMembers}
        active={false}
        value={{
          memberIds: ['priya'],
          destination: 'Kappabashi',
          meetingPoint: 'Ueno Station · Central Concourse (Grand Clock)',
          meetingTime: '17:30 (in 45 min)',
          suggestionSource: 'prototype-midpoint',
        }}
        onChange={() => undefined}
        onRequest={() => undefined}
        onRequestReunion={() => undefined}
      />
    );
    expect(html).toContain('GROUP SPLIT');
    expect(html).toContain('Suggested meeting point');
    expect(html).toContain('Start Group Split');
    expect(html).toContain('Review this meeting point with your group.');
  });

  it('renders the 4 distinct steps of Group Split planning', () => {
    const html = renderToStaticMarkup(
      <GroupSplit
        members={sampleMembers}
        active={false}
        value={{
          memberIds: ['priya', 'alex'],
          destination: 'Akihabara Electric Town',
          meetingPoint: 'Tokyo Station · Marunouchi North Exit Dome',
          meetingTime: '18:00 (in 60 min)',
          suggestionSource: 'ai-midpoint',
          aiReasoning: 'Direct rail interchange between Akihabara and current route.',
        }}
        currentAnchorName="Shibuya Crossing"
        cityDestination="Tokyo"
        onChange={() => undefined}
        onRequest={() => undefined}
        onRequestReunion={() => undefined}
      />
    );

    // Step 1: Member selection
    expect(html).toContain('Select members splitting together');
    expect(html).toContain('Priya');
    expect(html).toContain('Alex');
    expect(html).toContain('Sam');
    expect(html).toContain('Splitting:');
    expect(html).toContain('Main group:');

    // Step 2: Destination input
    expect(html).toContain('Where does this branch want to go?');
    expect(html).toContain('Popular ideas:');
    expect(html).toContain('Kappabashi Kitchen Street');

    // Step 3: Meeting point (AI & Manual)
    expect(html).toContain('Meeting Point');
    expect(html).toContain('AI Suggestion');
    expect(html).toContain('Custom entry');
    expect(html).toContain('Adopted AI Meeting Point');

    // Step 4: Meeting time
    expect(html).toContain('Rendezvous Time');
    expect(html).toContain('+30 min');
    expect(html).toContain('+45 min');
    expect(html).toContain('+60 min');

    // Strict privacy guarantee
    expect(html).toContain('Strict Map Privacy:');
    expect(html).toContain('Only your own location is shown on the group map');

    // Action button
    expect(html).toContain('Start Group Split');
  });

  it('renders active split state when active is true', () => {
    const html = renderToStaticMarkup(
      <GroupSplit
        members={sampleMembers}
        active={true}
        value={{
          memberIds: ['priya'],
          destination: 'Akihabara',
          meetingPoint: 'Tokyo Station Rotunda Dome',
          meetingTime: '18:30',
          suggestionSource: 'ai-midpoint',
        }}
        currentAnchorName="Daikanyama"
        onChange={() => undefined}
        onRequest={() => undefined}
        onRequestReunion={() => undefined}
      />
    );

    expect(html).toContain('Split in Progress');
    expect(html).toContain('Tokyo Station Rotunda Dome');
    expect(html).toContain('Request reunion');
    expect(html).toContain('Reunited (End Split)');
  });
});
