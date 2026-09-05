import type { ItemReview, TripReview } from './preferences';
import type { TingoAnswer, TingoDimensions } from './tingo';
import { scoreTingo } from './tingo';

export type LearningProposal = {
  id: string;
  status: 'proposed' | 'confirmed' | 'dismissed';
  changes: {
    questionId: string;
    beforeOptionId: string | null;
    afterOptionId: string;
    beforeDimensions: TingoDimensions;
    afterDimensions: TingoDimensions;
    reason: string;
  }[];
  source: {
    tripReview: TripReview;
    itemReviews: Record<string, ItemReview>;
    actualPace: string;
  };
  answerUpdates: { questionId: string; optionId: string; reason: string }[];
};

type LearningInput = {
  answers: TingoAnswer[];
  tripReview: TripReview;
  itemReviews: Record<string, ItemReview>;
  actualPace: string;
};

function hasReview(itemReviews: Record<string, ItemReview>, pattern: RegExp, value: ItemReview): boolean {
  return Object.entries(itemReviews).some(([item, review]) => review === value && pattern.test(item));
}

function replaceAnswer(answers: TingoAnswer[], questionId: string, optionId: string): TingoAnswer[] {
  return answers.map(answer => answer.questionId === questionId ? { ...answer, optionId } : answer);
}

function addChange(
  changes: LearningProposal['changes'],
  answers: TingoAnswer[],
  questionId: string,
  afterOptionId: string,
  reason: string,
): TingoAnswer[] {
  const beforeOptionId = answers.find(answer => answer.questionId === questionId)?.optionId ?? null;
  if (!beforeOptionId || beforeOptionId === afterOptionId) return answers;
  const beforeAnswers = answers;
  const afterAnswers = replaceAnswer(answers, questionId, afterOptionId);
  changes.push({
    questionId,
    beforeOptionId,
    afterOptionId,
    beforeDimensions: scoreTingo(beforeAnswers),
    afterDimensions: scoreTingo(afterAnswers),
    reason,
  });
  return afterAnswers;
}

function proposalId(input: LearningInput, changes: LearningProposal['changes']): string {
  const reviewKey = `${input.tripReview}:${input.actualPace}:${Object.entries(input.itemReviews).sort(([left], [right]) => left.localeCompare(right)).map(([item, review]) => `${item}=${review}`).join(',')}`;
  const changeKey = changes.map(change => `${change.questionId}:${change.beforeOptionId}->${change.afterOptionId}`).join('|');
  return `learning-${reviewKey}-${changeKey || 'none'}`.replace(/[^a-z0-9:_=,>|-]+/gi, '-').toLocaleLowerCase();
}

/**
 * Build an explainable proposal from retrospective evidence. This function is pure:
 * it never changes the answer source and never changes long-term Tingo by itself.
 */
export function buildLearningProposal(input: LearningInput): LearningProposal {
  const changes: LearningProposal['changes'] = [];
  let proposedAnswers = input.answers.map(answer => ({ ...answer }));

  const slowerEvidence = input.tripReview === 'no' || /tired|slower|delay/i.test(input.actualPace);
  if (slowerEvidence) {
    proposedAnswers = addChange(
      changes,
      proposedAnswers,
      'morning',
      'slow',
      `The ${input.tripReview === 'no' ? 'Not really' : 'slower pace'} reflection suggests a gentler morning next time.`,
    );
  }

  if (hasReview(input.itemReviews, /cafe|food|dinner|market|meal/i, 'worth')) {
    proposedAnswers = addChange(
      changes,
      proposedAnswers,
      'food',
      'hunt',
      'A Worth It food or café stop supports making destination-led food more prominent.',
    );
  }

  if (hasReview(input.itemReviews, /flexible|open|floating|mystery/i, 'worth')) {
    proposedAnswers = addChange(
      changes,
      proposedAnswers,
      'change',
      'adapt',
      'A Worth It flexible block supports showing nearby alternatives more readily when plans change.',
    );
  }

  const answerUpdates = changes.map(change => ({
    questionId: change.questionId,
    optionId: change.afterOptionId,
    reason: change.reason,
  }));
  return {
    id: proposalId(input, changes),
    status: 'proposed',
    changes,
    source: {
      tripReview: input.tripReview,
      itemReviews: { ...input.itemReviews },
      actualPace: input.actualPace,
    },
    answerUpdates,
  };
}

/** Apply a previously proposed update only after the user explicitly confirms it. */
export function confirmLearningProposal(answers: TingoAnswer[], proposal: LearningProposal): TingoAnswer[] {
  if (proposal.status !== 'proposed') return answers.map(answer => ({ ...answer }));
  return proposal.answerUpdates.reduce(
    (current, update) => replaceAnswer(current, update.questionId, update.optionId),
    answers.map(answer => ({ ...answer })),
  );
}
