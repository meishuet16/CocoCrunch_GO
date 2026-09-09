export type TingoDimension = 'pace' | 'experience' | 'budget' | 'comfort' | 'food' | 'adventure' | 'planning' | 'flexibility' | 'social';
export type TingoDimensions = Record<TingoDimension, number>;
export type TingoAnswer = { questionId: string; optionId: string };

export type TingoQuestion = {
  id: string;
  category?: string;
  icon?: string;
  prompt: string;
  options: { id: string; label: string; hint: string; tags?: string[]; photoUrl?: string; weights: Partial<Record<TingoDimension, number>> }[];
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
  { id: 'morning', category: 'Pace', icon: '🏝️', prompt: 'Which sounds more like your ideal day?', options: [
    { id: 'slow', label: 'Chill at a beach cafe for hours', hint: 'Relaxing', tags: ['Take it slow', 'Enjoy the moment'], photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=460&auto=format&fit=crop&q=80', weights: { pace: -2, food: 2, flexibility: 1 } },
    { id: 'map', label: 'Visit 5 attractions in a day', hint: 'Keep moving', tags: ['See as much as possible', 'Feel accomplished'], photoUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=460&auto=format&fit=crop&q=80', weights: { pace: 2, planning: 2, adventure: 1 } },
  ] },
  { id: 'anchor-style', category: 'Enjoyment style', icon: '🧭', prompt: 'When a day opens up, what feels better?', options: [
    { id: 'wander', label: 'Follow the mood and see what appears', hint: 'Spontaneous', tags: ['Open-ended', 'Playful discoveries'], photoUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=460&auto=format&fit=crop&q=80', weights: { flexibility: 2, experience: 1, adventure: 1 } },
    { id: 'anchor', label: 'Choose one clear plan and build around it', hint: 'Structured', tags: ['Less uncertainty', 'Clear priority'], photoUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=460&auto=format&fit=crop&q=80', weights: { planning: 3, comfort: 1 } },
  ] },
  { id: 'transport', category: 'Budget & transport', icon: '🚃', prompt: 'Which would you choose?', options: [
    { id: 'save-route', label: 'RM6 - 50 min Take public transport', hint: 'Save money', tags: ['More local experience', "I don't mind the time"], photoUrl: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=460&auto=format&fit=crop&q=80', weights: { budget: 2, experience: 1, pace: -1 } },
    { id: 'comfort-ride', label: 'RM35 - 20 min Take a Grab / Taxi', hint: 'More comfortable', tags: ['Faster', 'Worth the convenience'], photoUrl: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=460&auto=format&fit=crop&q=80', weights: { comfort: 2, budget: -1, pace: 1 } },
  ] },
  { id: 'tradeoff', category: 'Money decisions', icon: '💳', prompt: 'When a choice gets expensive, you usually...', options: [
    { id: 'worth', label: "Pay for the thing I'll remember", hint: 'Experience first', tags: ['Special moment', 'Worth the splurge'], photoUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=460&auto=format&fit=crop&q=80', weights: { experience: 2, budget: -1, comfort: 1 } },
    { id: 'save', label: 'Find the clever cheaper version', hint: 'Budget aware', tags: ['Smart value', 'Same joy, less spend'], photoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=460&auto=format&fit=crop&q=80', weights: { experience: -1, budget: 2 } },
  ] },
  { id: 'food', category: 'Food', icon: '🍴', prompt: 'Which food experience excites you more?', options: [
    { id: 'hunt', label: 'Try local street food', hint: 'Authentic', tags: ['Affordable', 'A bit adventurous'], photoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=460&auto=format&fit=crop&q=80', weights: { food: 3, adventure: 1 } },
    { id: 'easy', label: 'A nice restaurant with good reviews', hint: 'Comfortable', tags: ['Reliable quality', 'Willing to spend more'], photoUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=460&auto=format&fit=crop&q=80', weights: { food: 1, comfort: 2, experience: 1 } },
  ] },
  { id: 'change', category: 'Flexibility', icon: '🔁', prompt: 'When plans change at the last minute...', options: [
    { id: 'adapt', label: 'Great, show me what is nearby', hint: 'Adapt fast', tags: ['Keep it light', 'Find another good option'], photoUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=460&auto=format&fit=crop&q=80', weights: { flexibility: 3, adventure: 1 } },
    { id: 'protect', label: 'Keep the important booking safe', hint: 'Protect anchors', tags: ['Avoid chaos', 'Explain the tradeoff'], photoUrl: 'https://images.unsplash.com/photo-1496950866446-3253e1470e8e?w=460&auto=format&fit=crop&q=80', weights: { flexibility: -1, comfort: 1, planning: 2 } },
  ] },
  { id: 'comfort-adventure', category: 'Comfort & adventure', icon: '⛰️', prompt: 'Which feels more like you?', options: [
    { id: 'beaten-path', label: 'Get off the beaten path', hint: 'Adventure', tags: ['New experiences', "Don't mind the unknown"], photoUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=460&auto=format&fit=crop&q=80', weights: { adventure: 3, flexibility: 1, experience: 1 } },
    { id: 'relaxed', label: 'Stay comfortable and relaxed', hint: 'Comfortable', tags: ['Well-planned', 'Prefer less hassle'], photoUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=460&auto=format&fit=crop&q=80', weights: { comfort: 3, planning: 1 } },
  ] },
  { id: 'company', category: 'Group energy', icon: '👥', prompt: 'On a group trip, you are usually the one who...', options: [
    { id: 'connect', label: 'Keeps everyone included', hint: 'Social glue', tags: ['Checks the mood', 'Makes people feel safe'], photoUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=460&auto=format&fit=crop&q=80', weights: { social: 3, comfort: 1 } },
    { id: 'scout', label: 'Finds the next good idea', hint: 'Curious scout', tags: ['Researches options', 'Brings the spark'], photoUrl: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=460&auto=format&fit=crop&q=80', weights: { adventure: 2, social: 1, planning: 1 } },
  ] },
  { id: 'sleep', category: 'Stay', icon: '🏨', prompt: 'For a place to stay, you value...', options: [
    { id: 'central', label: 'A central door-to-door location', hint: 'Convenient', tags: ['Easy transit', 'Less friction'], photoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=460&auto=format&fit=crop&q=80', weights: { comfort: 2, budget: -1, planning: 1 } },
    { id: 'value', label: 'A clean base that keeps costs calm', hint: 'Good value', tags: ['Simple', 'Budget control'], photoUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=460&auto=format&fit=crop&q=80', weights: { budget: 2, comfort: 1 } },
  ] },
  { id: 'memory', category: 'Memories', icon: '📸', prompt: 'Which moment would you protect?', options: [
    { id: 'story', label: 'A beautiful once-in-a-trip scene', hint: 'Story collector', tags: ['Photos', 'Meaningful memory'], photoUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=460&auto=format&fit=crop&q=80', weights: { experience: 3, adventure: 1 } },
    { id: 'ritual', label: 'A small daily ritual that feels good', hint: 'Comfort ritual', tags: ['Cafe break', 'Repeatable joy'], photoUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=460&auto=format&fit=crop&q=80', weights: { comfort: 2, food: 1, pace: -1 } },
  ] },
  { id: 'planning-role', category: 'Trip role', icon: '🗂️', prompt: 'Before the trip, what would you naturally do?', options: [
    { id: 'organize', label: 'Make the list, map and timing', hint: 'Plan keeper', tags: ['Details', 'Keeps everyone aligned'], photoUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=460&auto=format&fit=crop&q=80', weights: { planning: 3, social: 1 } },
    { id: 'inspire', label: 'Collect places that feel exciting', hint: 'Idea scout', tags: ['Mood board', 'Finds hidden gems'], photoUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=460&auto=format&fit=crop&q=80', weights: { adventure: 2, experience: 2 } },
  ] },
  { id: 'conflict', category: 'Decision style', icon: '💬', prompt: 'When friends disagree, what helps most?', options: [
    { id: 'mediate', label: 'Listen first and find the fair middle', hint: 'Mediator', tags: ['People-aware', 'Calm decisions'], photoUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=460&auto=format&fit=crop&q=80', weights: { social: 3, comfort: 1 } },
    { id: 'decide', label: 'Compare options and choose clearly', hint: 'Decision lead', tags: ['Pros and cons', 'Move forward'], photoUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=460&auto=format&fit=crop&q=80', weights: { planning: 2, pace: 1 } },
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

export type TingoIdentity = {
  title: string;
  role: string;
  roleReason: string;
  summary: string;
  personaKey: TingoPersonaKey;
  personaLabel: string;
  primaryStyle: 'enjoyer' | 'planner' | 'explorer' | 'comfort-seeker' | 'connector' | 'value-finder';
};

export type TingoPersonaKey =
  | 'foodie-hunter'
  | 'master-planner'
  | 'transit-navigator'
  | 'budget-keeper'
  | 'photo-chaser'
  | 'culture-explorer'
  | 'adventure-seeker'
  | 'relaxation-lover'
  | 'shopping-scout'
  | 'weather-watcher'
  | 'safety-guardian'
  | 'group-coordinator'
  | 'packing-pro'
  | 'night-owl'
  | 'memory-keeper'
  | 'hidden-gem-seeker';

export function deriveTingoIdentity(dimensions: TingoDimensions): TingoIdentity {
  const behavior = deriveTingoBehavior(dimensions);
  const primaryStyle =
    dimensions.planning >= 6 ? 'planner' :
    dimensions.adventure >= 6 ? 'explorer' :
    dimensions.social >= 6 ? 'connector' :
    dimensions.comfort >= 6 ? 'comfort-seeker' :
    dimensions.budget >= 5 ? 'value-finder' :
    'enjoyer';
  let title =
    dimensions.food >= 5 && dimensions.experience >= 3 ? 'Cultural Foodie' :
    primaryStyle === 'planner' ? 'Calm Trip Architect' :
    primaryStyle === 'explorer' ? 'Island Explorer' :
    primaryStyle === 'connector' ? 'Group Harmony Lead' :
    primaryStyle === 'comfort-seeker' ? 'Comfort Curator' :
    primaryStyle === 'value-finder' ? 'Smart Route Finder' :
    'Easygoing Enjoyer';
  let role =
    behavior.groupRole === 'connector' ? 'Mood Keeper' :
    behavior.groupRole === 'scout' ? 'Discovery Scout' :
    behavior.groupRole === 'planner' ? 'Plan Keeper' :
    dimensions.food >= 5 ? 'Food Scout' :
    'Flex Keeper';
  const personaKey: TingoPersonaKey =
    dimensions.food >= 6 ? 'foodie-hunter' :
    dimensions.planning >= 6 && dimensions.comfort >= 5 ? 'master-planner' :
    dimensions.budget >= 6 && dimensions.pace >= 1 ? 'transit-navigator' :
    dimensions.budget >= 5 ? 'budget-keeper' :
    dimensions.experience >= 6 && dimensions.adventure >= 3 ? 'photo-chaser' :
    dimensions.experience >= 5 && dimensions.food >= 3 ? 'culture-explorer' :
    dimensions.adventure >= 6 ? 'adventure-seeker' :
    dimensions.comfort >= 6 && dimensions.pace <= 0 ? 'relaxation-lover' :
    dimensions.comfort >= 5 && dimensions.budget <= 1 ? 'shopping-scout' :
    dimensions.flexibility >= 6 && dimensions.planning >= 3 ? 'weather-watcher' :
    dimensions.comfort >= 5 && dimensions.planning >= 5 ? 'safety-guardian' :
    dimensions.social >= 6 ? 'group-coordinator' :
    dimensions.planning >= 5 && dimensions.budget >= 3 ? 'packing-pro' :
    dimensions.pace >= 5 && dimensions.experience >= 4 ? 'night-owl' :
    dimensions.experience >= 5 ? 'memory-keeper' :
    'hidden-gem-seeker';
  const personaLabel = personaKey.split('-').map(word => `${word[0].toUpperCase()}${word.slice(1)}`).join(' ');
  title = personaLabel;
  role = personaLabel;
  const personaReason =
    personaKey === 'foodie-hunter' ? 'Handles food picks and reads the trip through memorable meals.' :
    personaKey === 'master-planner' ? 'Handles itinerary structure, timing and the important anchors.' :
    personaKey === 'transit-navigator' ? 'Handles routes, transport tradeoffs and smoother movement.' :
    personaKey === 'budget-keeper' ? 'Handles budget choices without making the trip feel smaller.' :
    personaKey === 'photo-chaser' ? 'Handles scenic stops and once-in-a-trip photo moments.' :
    personaKey === 'culture-explorer' ? 'Handles landmarks, local context and meaningful culture stops.' :
    personaKey === 'adventure-seeker' ? 'Handles activities, bold ideas and the trip’s discovery energy.' :
    personaKey === 'relaxation-lover' ? 'Handles rest stops, comfort windows and unhurried moments.' :
    personaKey === 'shopping-scout' ? 'Handles shopping stops, browsing time and small souvenir wins.' :
    personaKey === 'weather-watcher' ? 'Handles backup plans when weather or timing changes.' :
    personaKey === 'safety-guardian' ? 'Handles safety checks, low-chaos choices and emergency readiness.' :
    personaKey === 'group-coordinator' ? 'Handles group decisions and keeps everyone included.' :
    personaKey === 'packing-pro' ? 'Handles packing lists and makes the trip easier before it starts.' :
    personaKey === 'night-owl' ? 'Handles nightlife, late plans and evening momentum.' :
    personaKey === 'memory-keeper' ? 'Handles memories, keepsakes and the moments worth carrying home.' :
    'Handles unique spots and finds the interesting path beyond the obvious.';
  return {
    title,
    role,
    personaKey,
    personaLabel,
    primaryStyle,
    roleReason: personaReason,
    summary: primaryStyle === 'planner'
      ? 'You like trips that feel clear, thoughtful and low-chaos, with space for the good parts to actually happen.'
      : primaryStyle === 'explorer'
        ? 'You enjoy discovery, scenery and new experiences, especially when the trip leaves room for curiosity.'
        : primaryStyle === 'connector'
          ? 'You travel through people as much as places, and you help the group feel considered.'
          : primaryStyle === 'comfort-seeker'
            ? 'You enjoy beautiful trips more when comfort, recovery and convenience are protected.'
            : primaryStyle === 'value-finder'
              ? 'You like smart choices that keep the trip fun without wasting budget.'
              : 'You love meaningful local experiences, unhurried moments and good food along the way.',
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
