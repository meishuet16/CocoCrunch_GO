import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { GroupSplit } from './GroupSplit';

describe('GroupSplit', () => {
  it('makes its local midpoint suggestion and Court handoff explicit', () => {
    const html = renderToStaticMarkup(<GroupSplit members={[{ id: 'priya', name: 'Priya', role: 'Trip lead', inviteStatus: 'joined', pace: 'steady' }]} active={false} value={{ memberIds: ['priya'], destination: 'Kappabashi', meetingPoint: 'Between Kappabashi and Priya', meetingTime: 'Meet in about 35 min', suggestionSource: 'prototype-midpoint' }} onChange={() => undefined} onRequest={() => undefined} onRequestReunion={() => undefined} />);
    expect(html).toContain('GROUP SPLIT');
    expect(html).toContain('Suggested meeting point');
    expect(html).toContain('Send split to Group Court');
    expect(html).toContain('Review this meeting point with your group.');
  });
});
