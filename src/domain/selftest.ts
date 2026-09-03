import { canUseGacha, courtTally, type CourtVote } from './court';
import { plannedBudget, updateBudget, defaultGroupBudget } from './budget';
import { discoverPlaces } from './discovery';

export function runDomainSelfTest(): void {
  const tie: CourtVote[] = [{ member: 'Mei', pick: 'ramen' }, { member: 'JH', pick: 'sushi' }, { member: 'Zi Shan', pick: 'ramen' }, { member: 'Alex', pick: 'sushi' }];
  if (!canUseGacha(tie)) throw new Error('Gacha must unlock for a true tie');
  const majority = tie.map(vote => vote.member === 'Alex' ? { ...vote, pick: 'ramen' as const } : vote);
  if (courtTally(majority).majority !== 'ramen' || canUseGacha(majority)) throw new Error('Gacha must stay locked for a majority');
  if (plannedBudget(updateBudget(defaultGroupBudget, 'food', -10)) !== plannedBudget(defaultGroupBudget) - defaultGroupBudget.food) throw new Error('Budget sanitization failed');
  if (discoverPlaces('Kyoto')[0].source !== 'prototype-catalog' || discoverPlaces('Unknown')[0].source !== 'fallback') throw new Error('Discovery source labeling failed');
}
