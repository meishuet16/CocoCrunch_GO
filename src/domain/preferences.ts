export type TravelProfile = { vibe: string; mustGo: string; veto: string; preference: string; flexible: string };
export function learnFromTrip(profile: TravelProfile, worthIt: 'yes' | 'mixed' | 'no'): TravelProfile {
  if (worthIt === 'yes') return { ...profile, preference: 'Scenic cafés + flexible neighbourhood wandering' };
  if (worthIt === 'mixed') return { ...profile, flexible: 'Keep one evening open and protect recovery time' };
  return { ...profile, vibe: 'Slower pace + fewer scheduled stops' };
}
