export type TravelProfile = { vibe: string; mustGo: string; veto: string; preference: string; flexible: string };
export type TripReview = 'yes' | 'mixed' | 'no';
export type ItemReview = 'worth' | 'mixed' | 'skip';

export type ReviewLearning = {
  foodAffinity: number;
  flexibleAffinity: number;
  paceAdjustment: number;
  notes: string[];
};

export function learnFromTrip(profile: TravelProfile, worthIt: TripReview): TravelProfile {
  if (worthIt === 'yes') return { ...profile, preference: 'Scenic cafés + flexible neighbourhood wandering' };
  if (worthIt === 'mixed') return { ...profile, flexible: 'Keep one evening open and protect recovery time' };
  return { ...profile, vibe: 'Slower pace + fewer scheduled stops' };
}

export function learnFromItemReviews(itemReviews: Record<string, ItemReview>): ReviewLearning {
  const entries = Object.entries(itemReviews);
  if (!entries.length) return { foodAffinity: 0, flexibleAffinity: 0, paceAdjustment: 0, notes: [] };

  let foodAffinity = 0;
  let flexibleAffinity = 0;
  let paceAdjustment = 0;
  const notes: string[] = [];

  for (const [item, review] of entries) {
    const delta = review === 'worth' ? 1 : review === 'skip' ? -1 : 0;
    if (/cafe|food|dinner|market|meal/i.test(item)) foodAffinity += delta;
    if (/cafe|floating|open|mystery/i.test(item)) flexibleAffinity += delta;
    if (review === 'skip') paceAdjustment -= 1;
    if (review === 'worth') notes.push(`${item} earned a future-ranking boost`);
    if (review === 'skip') notes.push(`${item} will be down-ranked next time`);
  }

  return { foodAffinity, flexibleAffinity, paceAdjustment, notes };
}

export function applyItemReviewLearning(profile: TravelProfile, itemReviews: Record<string, ItemReview>): TravelProfile {
  const learned = learnFromItemReviews(itemReviews);
  let next = { ...profile };
  if (learned.foodAffinity > 0) next = { ...next, preference: 'Food-led neighbourhood stops + scenic cafés' };
  if (learned.flexibleAffinity > 0) next = { ...next, flexible: 'Keep one open pocket for spontaneous neighbourhood finds' };
  if (learned.paceAdjustment < 0) next = { ...next, vibe: 'Slower pace + fewer scheduled stops' };
  return next;
}

export function reconcileTripLearning(profile: TravelProfile, worthIt: TripReview, itemReviews: Record<string, ItemReview>): TravelProfile {
  return applyItemReviewLearning(learnFromTrip(profile, worthIt), itemReviews);
}

export function reviewLearningSummary(itemReviews: Record<string, ItemReview>): string[] {
  return learnFromItemReviews(itemReviews).notes;
}

export function learningSummary(before: TravelProfile, after: TravelProfile): string[] {
  return (Object.keys(after) as (keyof TravelProfile)[]).filter(key => before[key] !== after[key]).map(key => `${key}: ${before[key]} → ${after[key]}`);
}
