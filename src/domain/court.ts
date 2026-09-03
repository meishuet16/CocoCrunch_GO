export type CourtOption = 'ramen' | 'sushi';
export type CourtVote = { member: string; pick: CourtOption };
export type CourtResult = { ramen: number; sushi: number; tied: boolean; majority: CourtOption | null };

export function courtTally(votes: CourtVote[]): CourtResult {
  const ramen = votes.filter(vote => vote.pick === 'ramen').length;
  const sushi = votes.filter(vote => vote.pick === 'sushi').length;
  return { ramen, sushi, tied: votes.length > 0 && ramen === sushi, majority: ramen === sushi ? null : ramen > sushi ? 'ramen' : 'sushi' };
}

export function canUseGacha(votes: CourtVote[]): boolean {
  return courtTally(votes).tied;
}
