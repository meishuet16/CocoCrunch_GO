export type CourtOption = 'ramen' | 'sushi';
export type CourtVote = { member: string; pick: CourtOption };

export function courtTally(votes: CourtVote[]) {
  const ramen = votes.filter(vote => vote.pick === 'ramen').length;
  const sushi = votes.filter(vote => vote.pick === 'sushi').length;
  return { ramen, sushi, tied: ramen === sushi, majority: ramen === sushi ? null : ramen > sushi ? 'ramen' as const : 'sushi' as const };
}
