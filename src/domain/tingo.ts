export type TingoDimension = 'pace' | 'experience' | 'budget' | 'comfort' | 'food' | 'adventure' | 'planning' | 'flexibility' | 'social';
export type TingoDimensions = Record<TingoDimension, number>;
export type TingoAnswer = { questionId: string; optionId: string };

export type TingoQuestion = {
  id: string;
  prompt: string;
  options: { id: string; label: string; hint: string; weights: Partial<Record<TingoDimension, number>> }[];
};

export type TingoBehavior = {
  itineraryDensity: 'gentle' | 'balanced' | 'full';
  dailyStops: number;
  bufferMinutes: number;
  recommendationBias: 'food' | 'adventure' | 'memory' | 'value' | 'balanced';
  accommodationBias: 'central-comfort' | 'character' | 'value';
  budgetMode: 'value-first' | 'balanced' | 'experience-first';
  changeStyle: 'adapt-fast' | 'explain-first' | 'protect-plan';
  groupRole: 'connector' | 'scout' | 'planner' | 'independent';
};

export type TingoGuidance = {
  roleSuggestion: string;
  itineraryGuidance: string;
  budgetGuidance: string;
  courtGuidance: string;
  accommodationGuidance: string;
};

export const tingoQuestions: TingoQuestion[] = [
  { id: 'morning', prompt: 'A free morning sounds best when…', options: [
    { id: 'slow', label: 'I follow the smell of breakfast', hint: 'slow pace', weights: { pace: -2, food: 2, flexibility: 1 } },
    { id: 'map', label: 'I have a route and three stops', hint: 'high density', weights: { pace: 2, planning: 2, adventure: 1 } },
    { id: 'mix', label: 'One plan, one open pocket', hint: 'balanced', weights: { pace: 0, planning: 1, flexibility: 2 } },
  ] },
  { id: 'tradeoff', prompt: 'When a choice gets expensive, you usually…', options: [
    { id: 'worth', label: 'Pay for the thing I’ll remember', hint: 'experience first', weights: { experience: 2, budget: -1, comfort: 1 } },
    { id: 'save', label: 'Find the clever cheaper version', hint: 'budget aware', weights: { experience: -1, budget: 2 } },
    { id: 'comfort', label: 'Choose the option that feels easy', hint: 'comfort first', weights: { comfort: 2, budget: 0 } },
  ] },
  { id: 'food', prompt: 'Food is part of the trip when…', options: [
    { id: 'hunt', label: 'The destination is on my plate', hint: 'food led', weights: { food: 3, adventure: 1 } },
    { id: 'pause', label: 'There is one good meal each day', hint: 'daily ritual', weights: { food: 1, pace: -1 } },
    { id: 'easy', label: 'It is close, familiar, and easy', hint: 'low friction', weights: { food: 1, comfort: 2 } },
  ] },
  { id: 'change', prompt: 'When plans change at the last minute…', options: [
    { id: 'adapt', label: 'Great, show me what is nearby', hint: 'very flexible', weights: { flexibility: 3, adventure: 1 } },
    { id: 'explain', label: 'Explain the impact before I decide', hint: 'needs context', weights: { planning: 2, flexibility: 0 } },
    { id: 'protect', label: 'Keep the important booking safe', hint: 'protect anchors', weights: { flexibility: -1, comfort: 1, planning: 1 } },
  ] },
  { id: 'company', prompt: 'On a group trip, you are usually the one who…', options: [
    { id: 'connect', label: 'Keeps everyone included', hint: 'social glue', weights: { social: 3 } },
    { id: 'scout', label: 'Finds the next good idea', hint: 'curious scout', weights: { adventure: 2, social: 1 } },
    { id: 'quiet', label: 'Protects a little alone time', hint: 'needs space', weights: { social: -2, flexibility: 1 } },
  ] },
  { id: 'sleep', prompt: 'For a place to stay, you value…', options: [
    { id: 'central', label: 'A central door-to-door location', hint: 'convenient', weights: { comfort: 2, budget: -1 } },
    { id: 'character', label: 'Character worth the extra ride', hint: 'experience led', weights: { experience: 2, adventure: 1 } },
    { id: 'value', label: 'A clean base that keeps costs calm', hint: 'good value', weights: { budget: 2, comfort: 1 } },
  ] },
];

export const defaultTingoDimensions: TingoDimensions = {
  pace: 0, experience: 0, budget: 0, comfort: 0, food: 0, adventure: 0, planning: 0, flexibility: 0, social: 0,
};

export function scoreTingo(answers: TingoAnswer[]): TingoDimensions {
  const score = { ...defaultTingoDimensions };
  answers.forEach(answer => {
    const question = tingoQuestions.find(item => item.id === answer.questionId);
    const option = question?.options.find(item => item.id === answer.optionId);
    if (!option) return;
    Object.entries(option.weights).forEach(([dimension, amount]) => {
      score[dimension as TingoDimension] += amount ?? 0;
    });
  });
  return score;
}

export function deriveTingoBehavior(dimensions: TingoDimensions): TingoBehavior {
  const itineraryDensity = dimensions.pace >= 2 ? 'full' : dimensions.pace <= -1 ? 'gentle' : 'balanced';
  const recommendationBias = dimensions.food >= 3 ? 'food' : dimensions.adventure >= 3 ? 'adventure' : dimensions.experience >= 2 ? 'memory' : dimensions.budget >= 2 ? 'value' : 'balanced';
  const accommodationBias = dimensions.budget >= 2 ? 'value' : dimensions.comfort >= 2 ? 'central-comfort' : dimensions.experience >= 2 ? 'character' : 'value';
  const budgetMode = dimensions.budget >= 2 ? 'value-first' : dimensions.experience >= 2 ? 'experience-first' : 'balanced';
  const changeStyle = dimensions.flexibility >= 2 ? 'adapt-fast' : dimensions.planning >= 2 ? 'explain-first' : 'protect-plan';
  const groupRole = dimensions.social >= 2 ? 'connector' : dimensions.adventure >= 3 ? 'scout' : dimensions.planning >= 2 ? 'planner' : 'independent';
  return {
    itineraryDensity,
    dailyStops: itineraryDensity === 'full' ? 5 : itineraryDensity === 'gentle' ? 3 : 4,
    bufferMinutes: itineraryDensity === 'full' ? 20 : itineraryDensity === 'gentle' ? 50 : 35,
    recommendationBias,
    accommodationBias,
    budgetMode,
    changeStyle,
    groupRole,
  };
}

export function tingoGuidance(dimensions: TingoDimensions): TingoGuidance {
  const behavior = deriveTingoBehavior(dimensions);
  return {
    roleSuggestion: behavior.groupRole === 'connector' ? 'Group coordinator' : behavior.groupRole === 'scout' ? 'Discovery scout' : behavior.groupRole === 'planner' ? 'Itinerary planner' : 'Independent flex lead',
    itineraryGuidance: `${behavior.dailyStops} meaningful stops/day with about ${behavior.bufferMinutes} min breathing room between fixed blocks.`,
    budgetGuidance: behavior.budgetMode === 'value-first' ? 'Prefer lower-cost equivalents before cutting a Must-Go.' : behavior.budgetMode === 'experience-first' ? 'Protect memorable experiences, then rebalance flexible spend.' : 'Balance fit and price before escalating spend.',
    courtGuidance: behavior.changeStyle === 'adapt-fast' ? 'Offer two viable options quickly and keep discussion short.' : behavior.changeStyle === 'explain-first' ? 'Show impact and reasoning before asking for a vote.' : 'Start by showing which anchors and commitments stay protected.',
    accommodationGuidance: behavior.accommodationBias === 'central-comfort' ? 'Prioritize central, low-friction stays.' : behavior.accommodationBias === 'character' ? 'Allow a longer transfer for a distinctive stay.' : 'Prioritize clean, well-connected value stays.',
  };
}

export function describeTingo(dimensions: TingoDimensions): string[] {
  const behavior = deriveTingoBehavior(dimensions);
  return [
    dimensions.pace <= 0 ? 'slow mornings' : 'full days with momentum',
    dimensions.experience >= 1 ? 'memory-first choices' : 'smart value choices',
    dimensions.food >= 2 ? 'food-led routes' : 'food as a daily ritual',
    dimensions.flexibility >= 2 ? 'easy adaptation' : 'clear context before changes',
    dimensions.social >= 2 ? 'group energy' : 'protected breathing room',
    `${behavior.dailyStops} stops/day · ${behavior.bufferMinutes} min buffers`,
    `${behavior.recommendationBias} discovery · ${behavior.budgetMode} budget`,
    `${behavior.groupRole} group role`,
  ];
}

export function tingoCompletion(answers: TingoAnswer[]): number {
  return Math.round((answers.length / tingoQuestions.length) * 100);
}
