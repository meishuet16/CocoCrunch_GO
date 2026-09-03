import type { DiscoveryPlace } from './discovery';
import { deriveTingoBehavior, tingoGuidance, type TingoDimensions } from './tingo';

export type RankedPlace = DiscoveryPlace & {
  adjustedMatch: number;
  reasons: string[];
};

function typeText(place: DiscoveryPlace): string {
  return `${place.type} ${place.name}`.toLowerCase();
}

export function rankPlacesForTingo(places: DiscoveryPlace[], dimensions: TingoDimensions): RankedPlace[] {
  const behavior = deriveTingoBehavior(dimensions);
  return places.map(place => {
    const text = typeText(place);
    let boost = 0;
    const reasons: string[] = [];

    if (behavior.recommendationBias === 'food' && /food|market|cafe|café|meal/.test(text)) {
      boost += 8;
      reasons.push('boosted by your food-first Tingo profile');
    }
    if (behavior.recommendationBias === 'adventure' && /walk|temple|vintage|streets|scenery/.test(text)) {
      boost += 6;
      reasons.push('boosted by your exploration preference');
    }
    if (behavior.recommendationBias === 'value' && /free|market|walk/.test(`${text} ${place.cost}`.toLowerCase())) {
      boost += 6;
      reasons.push('boosted by your value-first budget preference');
    }
    if (behavior.itineraryDensity === 'gentle' && /1\.5h|2h/.test(place.duration)) {
      boost += 3;
      reasons.push('fits your gentler daily pacing');
    }
    if (behavior.itineraryDensity === 'full' && /1\.5h/.test(place.duration)) {
      boost += 3;
      reasons.push('compact enough for your fuller days');
    }

    return {
      ...place,
      adjustedMatch: Math.max(0, Math.min(100, place.match + boost)),
      reasons: reasons.length ? reasons : ['kept near its base fit because no strong Tingo preference changed its rank'],
    };
  }).sort((a, b) => b.adjustedMatch - a.adjustedMatch);
}

export function explainPlanFromTingo(dimensions: TingoDimensions): string[] {
  const guidance = tingoGuidance(dimensions);
  return [guidance.itineraryGuidance, guidance.budgetGuidance, guidance.accommodationGuidance, guidance.courtGuidance];
}
