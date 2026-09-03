import { deriveTingoBehavior, type TingoDimensions } from './tingo';

export type DiscoveryPlace = { name: string; type: string; match: number; cost: string; duration: string; why: string; source: 'prototype-catalog' | 'fallback' };
const catalog: Record<string, Omit<DiscoveryPlace, 'source'>[]> = {
  tokyo: [
    { name: 'Tsukiji Outer Market', type: 'Food · market', match: 96, cost: 'RM45 est.', duration: '1.5h', why: 'Food-first anchor with an easy morning slot.' },
    { name: 'Daikanyama', type: 'Cafés · streets', match: 91, cost: 'RM38 est.', duration: '2h', why: 'Scenic cafés and a relaxed walking pace.' },
    { name: 'Shimokitazawa', type: 'Vintage · neighbourhood', match: 87, cost: 'RM30 est.', duration: '2h', why: 'Flexible, low-commitment neighbourhood wandering.' },
  ],
  kyoto: [
    { name: 'Nishiki Market', type: 'Food · market', match: 94, cost: 'RM40 est.', duration: '1.5h', why: 'Compact food exploration that fits a gentle day.' },
    { name: 'Philosopher’s Path', type: 'Walk · scenery', match: 90, cost: 'Free', duration: '1.5h', why: 'A scenic low-cost floating block.' },
    { name: 'Kiyomizu area', type: 'Temple · streets', match: 86, cost: 'RM20 est.', duration: '2h', why: 'Strong shared highlight; schedule earlier to protect energy.' },
  ],
  osaka: [
    { name: 'Kuromon Market', type: 'Food · market', match: 95, cost: 'RM45 est.', duration: '1.5h', why: 'High food match and easy group browsing.' },
    { name: 'Nakazakicho', type: 'Cafés · streets', match: 89, cost: 'RM35 est.', duration: '2h', why: 'Relaxed café and neighbourhood wandering.' },
    { name: 'Nakanoshima', type: 'Walk · riverside', match: 84, cost: 'Free', duration: '1.5h', why: 'Low-cost flexible recovery block.' },
  ],
};

function scoreWithTingo(place: DiscoveryPlace, dimensions: TingoDimensions): DiscoveryPlace {
  const behavior = deriveTingoBehavior(dimensions);
  const text = `${place.name} ${place.type} ${place.cost}`.toLowerCase();
  let boost = 0;
  const reasons: string[] = [];

  if (behavior.recommendationBias === 'food' && /food|market|cafe|cafés/.test(text)) {
    boost += 8;
    reasons.push('food-first profile');
  }
  if (behavior.recommendationBias === 'adventure' && /walk|temple|vintage|streets|scenery/.test(text)) {
    boost += 6;
    reasons.push('exploration preference');
  }
  if (behavior.recommendationBias === 'value' && /free|walk|market/.test(text)) {
    boost += 5;
    reasons.push('value-first preference');
  }
  if (behavior.itineraryDensity === 'gentle' && place.duration === '1.5h') {
    boost += 3;
    reasons.push('gentle pacing');
  }

  return {
    ...place,
    match: Math.max(0, Math.min(100, place.match + boost)),
    why: reasons.length ? `${place.why} Tingo also boosts it for ${reasons.join(' + ')}.` : place.why,
  };
}

export function discoverPlaces(destination: string, dimensions?: TingoDimensions): DiscoveryPlace[] {
  const key = destination.trim().toLowerCase();
  const exact = catalog[key];
  const places = exact
    ? exact.map(place => ({ ...place, source: 'prototype-catalog' as const }))
    : catalog.tokyo.map(place => ({ ...place, match: Math.max(70, place.match - 12), why: `Fallback example only for ${destination || 'this destination'}; live destination data is not connected.`, source: 'fallback' as const }));
  return dimensions ? places.map(place => scoreWithTingo(place, dimensions)).sort((a, b) => b.match - a.match) : places;
}
