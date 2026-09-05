import { describe, expect, it } from 'vitest';
import { buildLearningProposal, confirmLearningProposal } from './learning';
import { scoreTingo } from './tingo';

describe('explicit retrospective learning', () => {
  it('returns a proposal without mutating the source Tingo answers', () => {
    const before = [{ questionId: 'morning', optionId: 'mix' }];
    const proposal = buildLearningProposal({
      answers: before,
      tripReview: 'mixed',
      itemReviews: { cafe: 'skip' },
      actualPace: 'tired',
    });
    expect(proposal.changes.length).toBeGreaterThan(0);
    expect(before).toEqual([{ questionId: 'morning', optionId: 'mix' }]);
    expect(proposal.status).toBe('proposed');
  });

  it('changes the Tingo answer source only after explicit confirmation', () => {
    const answers = [{ questionId: 'morning', optionId: 'mix' }];
    const proposal = buildLearningProposal({ answers, tripReview: 'no', itemReviews: {}, actualPace: 'tired' });
    const confirmed = confirmLearningProposal(answers, proposal);
    expect(confirmed).toEqual([{ questionId: 'morning', optionId: 'slow' }]);
    expect(scoreTingo(confirmed).pace).toBe(-2);
    expect(answers).toEqual([{ questionId: 'morning', optionId: 'mix' }]);
  });
});
