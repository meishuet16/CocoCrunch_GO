export interface PastTripReviewItem {
  id: string;
  destination: string;
  country: string;
  flag: string;
  title: string;
  dates: string;
  durationDays: number;
  mode: 'group' | 'solo';
  travellersCount: number;
  travellerNames: string[];
  reviewVerdict: 'yes' | 'mixed' | 'no';
  ratingStars: number;
  spendActual: number;
  spendBudget: number;
  lat: number;
  lon: number;
  reviewReflection: string;
  visitedAnchors: string[];
  tingoTakeaway: string;
  keepsakeStatus: string;
  coverPhoto: string;
}

export const PAST_TRIP_REVIEWS: PastTripReviewItem[] = [
  {
    id: 'past-trip-jeju',
    destination: 'Jeju',
    country: 'South Korea',
    flag: '🇰🇷',
    title: 'Jeju: Salt Air & Citrus Road',
    dates: '12–17 May 2026',
    durationDays: 5,
    mode: 'group',
    travellersCount: 2,
    travellerNames: ['Mei', 'Kenji'],
    reviewVerdict: 'yes',
    ratingStars: 5,
    spendActual: 1300,
    spendBudget: 1400,
    lat: 33.4996,
    lon: 126.5312,
    reviewReflection:
      'The slow coastal drives along Aewol and quiet morning green tea fields at O’sulloc restored everyone’s energy. Protecting one open pocket every afternoon was our best pacing decision.',
    visitedAnchors: ['Seongsan Sunrise Peak', 'O’sulloc Green Tea Farm', 'Aewol Coastal Walk'],
    tingoTakeaway:
      'Reinforced preference for scenic cafés and gentle pacing over dense sightseeing schedules. Group energy stayed consistently high.',
    keepsakeStatus: '1 sealed future postcard written · 8 memory photos indexed',
    coverPhoto: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=700&auto=format&fit=crop&q=80',
  },
  {
    id: 'past-trip-tokyo',
    destination: 'Tokyo',
    country: 'Japan',
    flag: '🇯🇵',
    title: 'Tokyo: Slow Food & Small Discoveries',
    dates: '14–22 Oct 2025',
    durationDays: 8,
    mode: 'solo',
    travellersCount: 1,
    travellerNames: ['Mei'],
    reviewVerdict: 'yes',
    ratingStars: 5,
    spendActual: 1850,
    spendBudget: 2200,
    lat: 35.6762,
    lon: 139.6503,
    reviewReflection:
      'Wandering Shimokitazawa vintage lanes and Daikanyama without an hourly schedule made the trip unforgettable. Food was consistently exceptional and spontaneous discoveries beat rigid plans.',
    visitedAnchors: ['Tsukiji Outer Market', 'Daikanyama T-Site', 'Shimokitazawa Vintage Alleys'],
    tingoTakeaway:
      'Strengthened food-first profile. Solo flexibility allowed spontaneous 2-hour café blocks and unscripted neighbourhood detours.',
    keepsakeStatus: 'Memory Trunk updated · 3 anchor ideas saved for future group suggestions',
    coverPhoto: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=700&auto=format&fit=crop&q=80',
  },
  {
    id: 'past-trip-kyoto',
    destination: 'Kyoto',
    country: 'Japan',
    flag: '🇯🇵',
    title: 'Kyoto: Temple Mornings & Bamboo Groves',
    dates: '3–7 Nov 2024',
    durationDays: 4,
    mode: 'group',
    travellersCount: 3,
    travellerNames: ['Mei', 'Kenji', 'Sora'],
    reviewVerdict: 'mixed',
    ratingStars: 3,
    spendActual: 1420,
    spendBudget: 1400,
    lat: 35.0116,
    lon: 135.7681,
    reviewReflection:
      'Early morning at Philosopher’s Path was magical, but cramming four temples into Day 2 drained group energy. We learned the hard way to leave evenings completely open.',
    visitedAnchors: ['Nishiki Market', 'Philosopher’s Path', 'Gion Machiya Lane'],
    tingoTakeaway:
      'Tingo learned to adjust group density from packed to gentle, ensuring group recovery time is protected before dinner.',
    keepsakeStatus: '1 ghost wish remembered: Late-night observation deck rested for future solo trip',
    coverPhoto: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=700&auto=format&fit=crop&q=80',
  },
];
