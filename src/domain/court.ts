export type CourtOption = string;
export type CourtVote = { member: string; pick: CourtOption };
export type CourtResult = {
  counts: Record<CourtOption, number>;
  tied: boolean;
  majority: CourtOption | null;
  total: number;
};

export function courtTally(votes: CourtVote[]): CourtResult {
  const counts = votes.reduce<Record<CourtOption, number>>((result, vote) => {
    result[vote.pick] = (result[vote.pick] ?? 0) + 1;
    return result;
  }, {});

  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (ranked.length === 0) return { counts, tied: false, majority: null, total: 0 };

  const topCount = ranked[0][1];
  const tied = ranked.length > 1 && ranked.filter(([, count]) => count === topCount).length > 1;
  return {
    counts,
    tied,
    majority: tied ? null : ranked[0][0],
    total: votes.length,
  };
}

export function canUseGacha(votes: CourtVote[]): boolean {
  return courtTally(votes).tied;
}
