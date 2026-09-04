import type { GroupDNA } from './group-dna';
import type { RecommendationEvidence } from './evidence';
import type { TingoBehavior } from './tingo';
import type { TripMember } from './trip';

export type DestinationCandidate = {
  id: string;
  name: string;
  type: string;
  tags: string[];
  estimatedCost: number;
  durationMinutes: number;
  transferMinutes: number;
  walkingKm: number;
  indoor: boolean;
  why: string;
  source: 'prototype-catalog' | 'fallback';
};

export type ItineraryItem = {
  id: string;
  name: string;
  kind: 'anchor' | 'floating' | 'buffer' | 'open';
  startMinutes: number;
  endMinutes: number;
  timeLabel: string;
  estimatedCost: number;
  transferMinutes: number;
  walkingKm: number;
  protected: boolean;
  candidateId?: string;
  evidence: RecommendationEvidence[];
};

export type TripPlan = {
  destination: string;
  items: ItineraryItem[];
  tripPromise: string;
  totalEstimatedCost: number;
  walkingKm: number;
  transferMinutes: number;
  protectedAnchorIds: string[];
  unresolvedRisks: string[];
};

export type GenerateTripPlanInput = {
  destination: string;
  tingoBehavior: TingoBehavior;
  tripVibe: string;
  mustGo: string;
  dealBreaker: string;
  preference: string;
  flexible: string;
  budget: number;
  members: TripMember[];
  groupDNA: GroupDNA;
  candidates: DestinationCandidate[];
  floatingStartMinutes?: number;
  resolvedConflictLabels?: string[];
};

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function tokens(value: string): string[] {
  return normalize(value).split(/[^a-z0-9]+/).filter(token => token.length > 2);
}

function clock(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const remainder = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

function overlapsText(candidate: DestinationCandidate, value: string): boolean {
  const haystack = normalize(`${candidate.name} ${candidate.type} ${candidate.tags.join(' ')}`);
  const queryTokens = tokens(value);
  return queryTokens.length > 0 && queryTokens.some(token => haystack.includes(token));
}

function violatesDealBreaker(candidate: DestinationCandidate, dealBreaker: string): boolean {
  const rule = normalize(dealBreaker);
  if (!rule) return false;
  const text = normalize(`${candidate.name} ${candidate.type} ${candidate.tags.join(' ')}`);
  if (/raw/.test(rule)) return /raw/.test(text) || candidate.tags.some(tag => /raw/.test(tag));
  if (/red.?eye|overnight flight/.test(rule)) return candidate.tags.some(tag => /red.?eye|overnight/.test(tag));
  if (/long distance walk|long walk|too much walking/.test(rule)) return candidate.walkingKm > 3;
  if (/early morning|before 8/.test(rule)) return candidate.tags.includes('early');
  return false;
}

export function isDealBreakerSafe(candidate: DestinationCandidate, dealBreaker: string): boolean {
  return !violatesDealBreaker(candidate, dealBreaker);
}

function candidateScore(candidate: DestinationCandidate, input: GenerateTripPlanInput): number {
  const text = normalize(`${candidate.name} ${candidate.type} ${candidate.tags.join(' ')}`);
  let score = 0;
  if (overlapsText(candidate, input.preference)) score += 12;
  if (overlapsText(candidate, input.tripVibe)) score += 10;
  if (input.tingoBehavior.recommendationBias === 'food' && /food|market|cafe/.test(text)) score += 10;
  if (input.tingoBehavior.recommendationBias === 'adventure' && /walk|street|temple|scenery|vintage/.test(text)) score += 8;
  if (input.tingoBehavior.recommendationBias === 'value' && (candidate.estimatedCost === 0 || candidate.tags.includes('value'))) score += 8;
  if (input.tingoBehavior.itineraryDensity === 'gentle' && candidate.durationMinutes <= 90) score += 5;
  const perMemberBudget = input.budget / Math.max(1, input.members.length || 1);
  const groupBudgetCeiling = input.groupDNA.budgetRange.max > 0 ? Math.min(perMemberBudget, input.groupDNA.budgetRange.max) : perMemberBudget;
  if (candidate.estimatedCost <= groupBudgetCeiling) score += 4;
  if (input.groupDNA.budgetSensitivity === 'high' && input.groupDNA.budgetRange.min > 0 && candidate.estimatedCost <= input.groupDNA.budgetRange.min) score += 3;
  const sharedMatches = input.groupDNA.sharedPriorities.filter(signal => overlapsText(candidate, signal.label));
  score += sharedMatches.length * 9;
  return score;
}

function findAnchor(candidates: DestinationCandidate[], mustGo: string): DestinationCandidate | undefined {
  const exact = candidates.find(candidate => normalize(candidate.name) === normalize(mustGo));
  if (exact) return exact;
  const query = tokens(mustGo);
  return candidates.find(candidate => query.some(token => normalize(candidate.name).includes(token)));
}

function evidence(
  source: RecommendationEvidence['source'],
  value: string,
  effect: RecommendationEvidence['effect'],
  strength: RecommendationEvidence['strength'],
  inputId?: string,
  provenance?: RecommendationEvidence['provenance'],
): RecommendationEvidence {
  return { source, value, effect, strength, ...(inputId ? { inputId } : {}), ...(provenance ? { provenance } : {}) };
}

export function candidateFromDiscovery(place: {
  name: string;
  type: string;
  cost: string;
  duration: string;
  why: string;
  source: 'prototype-catalog' | 'fallback';
  estimatedCost?: number;
  durationMinutes?: number;
  transferMinutes?: number;
  walkingKm?: number;
  indoor?: boolean;
  tags?: string[];
}, index: number): DestinationCandidate {
  const parsedCost = Number(place.cost.match(/\d+/)?.[0] ?? 0);
  const parsedHours = Number(place.duration.match(/[\d.]+/)?.[0] ?? 1);
  return {
    id: `candidate-${index + 1}-${normalize(place.name).replace(/[^a-z0-9]+/g, '-')}`,
    name: place.name,
    type: place.type,
    tags: place.tags ?? tokens(place.type),
    estimatedCost: place.estimatedCost ?? parsedCost,
    durationMinutes: place.durationMinutes ?? Math.round(parsedHours * 60),
    transferMinutes: place.transferMinutes ?? 15,
    walkingKm: place.walkingKm ?? 1,
    indoor: place.indoor ?? false,
    why: place.why,
    source: place.source,
  };
}

export function generateTripPlan(input: GenerateTripPlanInput): TripPlan {
  const anchorCandidate = findAnchor(input.candidates, input.mustGo);
  const anchorId = anchorCandidate?.id ?? `anchor-${normalize(input.mustGo).replace(/[^a-z0-9]+/g, '-') || 'must-go'}`;
  const anchorDuration = anchorCandidate?.durationMinutes ?? 90;
  const anchorCost = anchorCandidate?.estimatedCost ?? 0;
  const anchorTransfer = anchorCandidate?.transferMinutes ?? 0;
  const anchorWalking = anchorCandidate?.walkingKm ?? 0;
  const anchorEvidence = [
    evidence('constraint', input.mustGo, 'protects', 'required', 'must-go'),
    ...(anchorCandidate
      ? [evidence('candidate', anchorCandidate.why, 'supports', 'context', anchorCandidate.id, anchorCandidate.source)]
      : [evidence('adapter', 'candidate detail missing', 'warns', 'context', anchorId)]),
  ];
  const anchor: ItineraryItem = {
    id: anchorId,
    name: input.mustGo,
    kind: 'anchor',
    startMinutes: 600,
    endMinutes: 600 + anchorDuration,
    timeLabel: clock(600),
    estimatedCost: anchorCost,
    transferMinutes: anchorTransfer,
    walkingKm: anchorWalking,
    protected: true,
    candidateId: anchorCandidate?.id,
    evidence: anchorEvidence,
  };

  const ranked = input.candidates
    .filter(candidate => candidate.id !== anchorCandidate?.id && !violatesDealBreaker(candidate, input.dealBreaker))
    .map(candidate => ({ candidate, score: candidateScore(candidate, input) }))
    .sort((left, right) => right.score - left.score || left.candidate.name.localeCompare(right.candidate.name));
  const selected = ranked[0]?.candidate;
  const resolvedConflicts = new Set((input.resolvedConflictLabels ?? []).map(normalize));
  const risks = input.groupDNA.conflicts
    .filter(conflict => !resolvedConflicts.has(normalize(conflict.label)))
    .map(conflict => `Preference conflict: ${conflict.label}. Group Court is required before a substantive change.`);
  if (!selected) risks.push('No Deal-Breaker-safe floating candidate was supplied.');

  const bufferStart = anchor.endMinutes;
  const bufferEnd = bufferStart + input.tingoBehavior.bufferMinutes;
  const buffer: ItineraryItem = {
    id: 'buffer-after-anchor',
    name: 'Breathing room',
    kind: 'buffer',
    startMinutes: bufferStart,
    endMinutes: bufferEnd,
    timeLabel: clock(bufferStart),
    estimatedCost: 0,
    transferMinutes: 0,
    walkingKm: 0,
    protected: false,
    evidence: [evidence('tingo', `${input.tingoBehavior.bufferMinutes} min buffer`, 'supports', 'supporting', 'buffer-minutes')],
  };
  const floatingStart = input.floatingStartMinutes ?? bufferEnd + (selected?.transferMinutes ?? 0);
  const floatingDuration = selected?.durationMinutes ?? 60;
  const filteredByDealBreaker = input.candidates.filter(candidate => candidate.id !== anchorCandidate?.id && violatesDealBreaker(candidate, input.dealBreaker));
  const floating: ItineraryItem = {
    id: 'floating-discovery',
    name: selected?.name ?? 'Open discovery block',
    kind: 'floating',
    startMinutes: floatingStart,
    endMinutes: floatingStart + floatingDuration,
    timeLabel: clock(floatingStart),
    estimatedCost: selected?.estimatedCost ?? 0,
    transferMinutes: selected?.transferMinutes ?? 0,
    walkingKm: selected?.walkingKm ?? 0,
    protected: false,
    candidateId: selected?.id,
    evidence: selected ? [
      evidence('candidate', selected.why, 'supports', 'context', selected.id, selected.source),
      evidence('trip-vibe', input.tripVibe || 'current trip vibe', 'supports', 'supporting', 'trip-vibe'),
      evidence('constraint', input.preference || 'No optional preference', 'supports', 'strong', 'preference'),
      evidence('tingo', input.tingoBehavior.recommendationBias, 'supports', 'supporting', 'tingo-ranking'),
      evidence('budget', `RM${selected.estimatedCost}`, 'constrains', 'supporting', 'budget'),
      ...(input.dealBreaker ? [evidence('constraint', input.dealBreaker, 'excludes', 'required', 'deal-breaker')] : []),
      ...input.members.flatMap(member => (member.preferenceProfile?.preferences ?? [])
        .filter(preference => preference.kind !== 'strongly-avoid' && overlapsText(selected, preference.label))
        .map(preference => evidence('member-preference', preference.label, 'supports', 'strong', preference.id))),
      ...input.groupDNA.sharedPriorities
        .filter(signal => overlapsText(selected, signal.label))
        .map(signal => evidence('group-consensus', signal.label, 'supports', 'strong')),
      ...(filteredByDealBreaker.length > 0 ? filteredByDealBreaker.map(candidate => evidence('constraint', candidate.name, 'excludes', 'required', 'deal-breaker')) : []),
    ] : [evidence('constraint', input.flexible || 'Open discovery block', 'supports', 'context', 'flexible')],
  };
  const openStart = floating.endMinutes + (selected?.transferMinutes ?? 0);
  const open: ItineraryItem = {
    id: 'open-flexible-window',
    name: 'Open flexible window',
    kind: 'open',
    startMinutes: openStart,
    endMinutes: openStart + 60,
    timeLabel: clock(openStart),
    estimatedCost: 0,
    transferMinutes: 0,
    walkingKm: 0,
    protected: false,
    evidence: [evidence('constraint', input.flexible || 'Open flexible window', 'supports', 'context', 'flexible')],
  };
  const items = [anchor, buffer, floating, open];
  const sharedPromise = input.groupDNA.sharedPriorities.slice(0, 2).map(signal => signal.label).join(' + ');
  const tripPromise = [input.tripVibe || 'A trip shaped around the group', sharedPromise, `${input.tingoBehavior.bufferMinutes} min breathing room`].filter(Boolean).join(' · ');
  return {
    destination: input.destination,
    items,
    tripPromise,
    totalEstimatedCost: items.reduce((total, item) => total + item.estimatedCost, 0),
    walkingKm: Number(items.reduce((total, item) => total + item.walkingKm, 0).toFixed(1)),
    transferMinutes: items.reduce((total, item) => total + item.transferMinutes, 0),
    protectedAnchorIds: items.filter(item => item.protected).map(item => item.id),
    unresolvedRisks: risks,
  };
}

export function moveItineraryItem(plan: TripPlan, itemId: string, startMinutes: number): TripPlan {
  const item = plan.items.find(candidate => candidate.id === itemId);
  if (!item || item.protected || item.kind === 'anchor' || !Number.isFinite(startMinutes)) return plan;
  const duration = item.endMinutes - item.startMinutes;
  const items = plan.items.map(candidate => candidate.id === itemId
    ? { ...candidate, startMinutes, endMinutes: startMinutes + duration, timeLabel: clock(startMinutes) }
    : candidate);
  return { ...plan, items };
}
