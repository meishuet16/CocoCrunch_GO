import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { LearningProposal } from '../domain/learning';
import { TripRetrospective } from './TripRetrospective';

const proposal: LearningProposal = {
  id: 'learning-1',
  status: 'proposed',
  changes: [{
    questionId: 'morning',
    beforeOptionId: 'mix',
    afterOptionId: 'slow',
    beforeDimensions: { pace: 0, experience: 0, budget: 0, comfort: 0, food: 0, adventure: 0, planning: 0, flexibility: 0, social: 0 },
    afterDimensions: { pace: -2, experience: 0, budget: 0, comfort: 0, food: 0, adventure: 0, planning: 0, flexibility: 1, social: 0 },
    reason: 'The slower pace suggests a gentler morning next time.',
  }],
  source: { tripReview: 'mixed', itemReviews: { cafe: 'skip' }, actualPace: 'Slower than planned' },
  answerUpdates: [{ questionId: 'morning', optionId: 'slow', reason: 'The slower pace suggests a gentler morning next time.' }],
};

describe('TripRetrospective', () => {
  it('keeps actual outcome, reflection, and learning confirmation visibly ordered', () => {
    const html = renderToStaticMarkup(
      <TripRetrospective
        actualSummary={{ pace: 'Slower than planned', spent: 480, decisions: 2 }}
        worthIt="mixed"
        proposal={proposal}
        onRecordReflection={() => undefined}
        onBuildProposal={() => undefined}
        onConfirmLearning={() => undefined}
        onDismissLearning={() => undefined}
        onOpenMemory={() => undefined}
      />,
    );

    expect(html.indexOf('ACTUAL OUTCOME')).toBeLessThan(html.indexOf('WORTH IT?'));
    expect(html.indexOf('WORTH IT?')).toBeLessThan(html.indexOf('PROPOSED LEARNING'));
    expect(html).toContain('Slower than planned · RM 480 spent · 2 decisions');
    expect(html).toContain('Confirm this learning');
    expect(html).toContain('Learning evidence');
    expect(html).toContain('Keep the memory');
    expect(html).toContain('disabled=""');
  });

  it('keeps expressive memory closed until the learning handoff is terminal', () => {
    const pending = renderToStaticMarkup(
      <TripRetrospective
        actualSummary={{ pace: 'Matched the plan', spent: 300, decisions: 1 }}
        worthIt="yes"
        proposal={proposal}
        onRecordReflection={() => undefined}
        onBuildProposal={() => undefined}
        onConfirmLearning={() => undefined}
        onDismissLearning={() => undefined}
        onOpenMemory={() => undefined}
      />,
    );
    const dismissed = renderToStaticMarkup(
      <TripRetrospective
        actualSummary={{ pace: 'Matched the plan', spent: 300, decisions: 1 }}
        worthIt="yes"
        proposal={{ ...proposal, status: 'dismissed' }}
        onRecordReflection={() => undefined}
        onBuildProposal={() => undefined}
        onConfirmLearning={() => undefined}
        onDismissLearning={() => undefined}
        onOpenMemory={() => undefined}
      />,
    );

    expect(pending.match(/class="secondary retrospective-memory" disabled=""/)).not.toBeNull();
    expect(dismissed.match(/class="secondary retrospective-memory" disabled=""/)).toBeNull();
  });

  it('keeps confirmation unavailable until a proposal exists', () => {
    const html = renderToStaticMarkup(
      <TripRetrospective
        actualSummary={{ pace: 'Matched the plan', spent: 300, decisions: 0 }}
        worthIt={null}
        proposal={null}
        onRecordReflection={() => undefined}
        onBuildProposal={() => undefined}
        onConfirmLearning={() => undefined}
        onDismissLearning={() => undefined}
        onOpenMemory={() => undefined}
      />,
    );

    expect(html).toContain('Choose Worth It before learning can be proposed');
    expect(html).not.toContain('Confirm this learning');
  });

  it('does not open reflection before actual outcome evidence is recorded', () => {
    const html = renderToStaticMarkup(
      <TripRetrospective
        actualSummary={{ pace: 'No completed pace signal yet', spent: 0, decisions: 0, outcomeRecorded: false }}
        worthIt={null}
        proposal={null}
        onRecordReflection={() => undefined}
        onBuildProposal={() => undefined}
        onConfirmLearning={() => undefined}
        onDismissLearning={() => undefined}
        onOpenMemory={() => undefined}
      />,
    );

    expect(html).toContain('Record a check-in, stop review, or other actual outcome');
    expect(html).toContain('Reflection stays closed until actual outcome evidence exists.');
    expect(html).toContain('disabled=""');
  });

  it('can omit the duplicate memory action in the compressed Completed flow', () => {
    const html = renderToStaticMarkup(<TripRetrospective actualSummary={{ pace: 'Matched the plan', spent: 300, decisions: 1 }} worthIt="yes" proposal={{ ...proposal, status: 'dismissed' }} showMemoryAction={false} onRecordReflection={() => undefined} onBuildProposal={() => undefined} onConfirmLearning={() => undefined} onDismissLearning={() => undefined} onOpenMemory={() => undefined}/>);
    expect(html).not.toContain('Keep the memory');
  });
});
