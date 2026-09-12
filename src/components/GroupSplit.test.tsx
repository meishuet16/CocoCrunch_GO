import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { GroupSplit } from './GroupSplit';

describe('GroupSplit', () => {
  it('makes its local midpoint suggestion and Court handoff explicit', () => {
    const html = renderToStaticMarkup(<GroupSplit members={[{ id: 'mei', name: 'Mei', role: 'Trip lead', inviteStatus: 'joined', pace: 'steady' }]} active={false} value={{ memberIds: ['mei'], destination: 'Kappabashi', meetingPoint: 'Between Kappabashi and Mei', meetingTime: 'Meet in about 35 min', suggestionSource: 'prototype-midpoint' }} onChange={() => undefined} onRequest={() => undefined} onRequestReunion={() => undefined} />);
    expect(html).toContain('GROUP SPLIT');
    expect(html).toContain('AI midpoint example');
    expect(html).toContain('Send split to Group Court');
    expect(html).toContain('not live member locations');
  });
});
