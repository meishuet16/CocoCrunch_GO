export type DiscoveryPlace = { name: string; type: string; match: number; cost: string; duration: string; why: string };

const catalog: Record<string, DiscoveryPlace[]> = {
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

export function discoverPlaces(destination: string): DiscoveryPlace[] {
  const key = destination.trim().toLowerCase();
  return catalog[key] ?? catalog.tokyo.map(place => ({ ...place, match: Math.max(70, place.match - 12), why: `Prototype fallback for ${destination || 'this destination'}; live recommendation data is not connected yet.` }));
}
