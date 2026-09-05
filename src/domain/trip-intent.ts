export type TripIntent = {
  destination: string;
  dates: { start: string; end: string } | null;
  mode: 'solo' | 'group';
  tripVibe: string;
  mustGo: string;
  dealBreaker: string;
  preference: string;
  flexible: string;
  budget: number;
};

export const emptyTripIntent: TripIntent = {
  destination: '',
  dates: null,
  mode: 'solo',
  tripVibe: '',
  mustGo: '',
  dealBreaker: '',
  preference: '',
  flexible: '',
  budget: 0,
};

export function tripIntentFromLegacyState(input: {
  destination?: string;
  mode?: 'solo' | 'group';
  profile?: { vibe: string; mustGo: string; veto: string; preference: string; flexible: string };
  budget?: number;
}): TripIntent {
  return {
    destination: input.destination ?? '',
    dates: null,
    mode: input.mode ?? 'solo',
    tripVibe: input.profile?.vibe ?? '',
    mustGo: input.profile?.mustGo ?? '',
    dealBreaker: input.profile?.veto ?? '',
    preference: input.profile?.preference ?? '',
    flexible: input.profile?.flexible ?? '',
    budget: input.budget ?? 0,
  };
}

export function tripIntentIsReviewable(intent: TripIntent): boolean {
  return Boolean(intent.destination.trim() && intent.mustGo.trim() && intent.budget >= 0);
}
