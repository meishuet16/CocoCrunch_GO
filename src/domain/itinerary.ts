import type { GroupDNA } from './group-dna';
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

export type RecommendationEvidence = {
  source: 'tingo' | 'trip-vibe' | 'constraint' | 'member-preference' | 'group-consensus' | 'budget' | 'candidate';
  label: string;
  detail: string;
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

function evidence(source: RecommendationEvidence['source'], label: string, detail: string): RecommendationEvidence {
  return { source, label, detail };
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
    evidence('constraint', 'Must-Go anchor', 'This item came directly from the trip Must-Go input and is protected.'),
    ...(anchorCandidate ? [evidence('candidate', anchorCandidate.source, anchorCandidate.why)] : [evidence('constraint', 'Candidate detail missing', 'No matching destination candidate was supplied; cost and route load remain conservative defaults.')]),
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
    evidence: [evidence('tingo', 'Tingo pace', `${input.tingoBehavior.bufferMinutes} minutes of buffer follow the current long-term pace behavior.`)],
  };
  const floatingStart = input.floatingStartMinutes ?? bufferEnd + (selected?.transferMinutes ?? 0);
  const floatingDuration = selected?.durationMinutes ?? 60;
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
      evidence('candidate', selected.source, selected.why),
      evidence('trip-vibe', 'Trip Vibe', `The ${input.tripVibe || 'current'} trip goal contributed to this candidate ranking.`),
      evidence('constraint', 'Preference', input.preference || 'No optional preference was supplied.'),
      evidence('tingo', 'Tingo behavior', `${input.tingoBehavior.recommendationBias} recommendations and ${input.tingoBehavior.itineraryDensity} density influenced the ranking.`),
      evidence('budget', 'Budget fit', input.groupDNA.budgetRange.max > 0
        ? `RM${selected.estimatedCost} fits the observed member range of RM${input.groupDNA.budgetRange.min}–RM${input.groupDNA.budgetRange.max}; ${input.groupDNA.budgetSensitivity} sensitivity was included in ranking.`
        : `RM${selected.estimatedCost} fits the trip budget of RM${input.budget}.`),
      ...input.members.flatMap(member => (member.preferenceProfile?.preferences ?? [])
        .filter(preference => preference.kind !== 'strongly-avoid' && overlapsText(selected, preference.label))
        .map(preference => evidence('member-preference', `${member.name} preference`, preference.label))),
      ...input.groupDNA.sharedPriorities.filter(signal => overlapsText(selected, signal.label)).map(signal => evidence('group-consensus', `${signal.support} member supports`, signal.label)),
    ] : [evidence('constraint', 'Flexible fallback', input.flexible || 'This block stays open because no safe candidate matched.')],
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
    evidence: [evidence('constraint', 'Flexible input', input.flexible || 'This time remains intentionally open.')],
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
