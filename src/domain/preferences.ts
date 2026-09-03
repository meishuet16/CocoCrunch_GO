export type TravelProfile = { vibe: string; mustGo: string; veto: string; preference: string; flexible: string };
export type TripReview = 'yes' | 'mixed' | 'no';
export function learnFromTrip(profile: TravelProfile, worthIt: TripReview): TravelProfile {
  if (worthIt === 'yes') return { ...profile, preference: 'Scenic cafés + flexible neighbourhood wandering' };
  if (worthIt === 'mixed') return { ...profile, flexible: 'Keep one evening open and protect recovery time' };
  return { ...profile, vibe: 'Slower pace + fewer scheduled stops' };
}
export function learningSummary(before: TravelProfile, after: TravelProfile): string[] {
  return (Object.keys(after) as (keyof TravelProfile)[]).filter(key => before[key] !== after[key]).map(key => `${key}: ${before[key]} → ${after[key]}`);
}
