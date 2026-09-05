import type { GroupDNA } from './group-dna';
import type { TingoBehavior } from './tingo';
import type { TripPlan } from './itinerary';

export type PlanHealthMetrics = {
  walkingKm: number;
  walkingDeduction: number;
  availableBufferMinutes: number;
  timePressureMinutes: number;
  timeDeduction: number;
  budgetOverrun: number;
  budgetDeduction: number;
  preferenceMisses: number;
  preferenceDeduction: number;
  transferMinutes: number;
  transferDeduction: number;
  protectedAnchors: number;
  unprotectedAnchors: number;
  anchorDeduction: number;
  unresolvedConflicts: number;
  conflictDeduction: number;
  unresolvedRisks: number;
  riskDeduction: number;
  dealBreakerViolations?: number;
  dealBreakerDeduction?: number;
};

export type PlanHealthDeduction = { component: string; points: number; reason: string };
export type PlanHealth = { overall: number; metrics: PlanHealthMetrics; deductions: PlanHealthDeduction[]; reasons: string[] };

export type PlanHealthInput = {
  plan: TripPlan;
  budget: number;
  groupDNA: GroupDNA;
  tingoBehavior: TingoBehavior;
  dealBreaker: string;
  resolvedConflictLabels?: string[];
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round(value: number): number {
  return Math.round(value);
}

/**
 * Transparent Plan Health formula. Every component is a separately capped deduction
 * from 100, and the returned metrics expose the exact values used by the calculation.
 *
 * overall = clamp(100 - walking - timePressure - budget - preferences - transfers
 *                 - unprotectedAnchors - conflicts - risks, 0, 100)
 * walking      = clamp(round(max(0, walkingKm - 5) * 2), 0, 18)
 * timePressure = clamp(round(max(0, tingoBuffer - availableBuffer) / 5), 0, 18)
 * budget       = clamp(round(max(0, overrun) / max(1, budget) * 40), 0, 24)
 * preferences  = clamp(preferenceMisses * 8, 0, 16)
 * transfers    = clamp(round(max(0, transferMinutes - 45) / 5), 0, 12)
 * anchors      = clamp(unprotectedAnchors * 25, 0, 25)
 * conflicts    = clamp(unresolvedConflicts * 10, 0, 20)
 * risks        = clamp(unresolvedOperationalRisks * 6, 0, 18)
 */
export function calculatePlanHealth(input: PlanHealthInput): PlanHealth {
  const walkingKm = Number(Math.max(0, input.plan.walkingKm).toFixed(1));
  const walkingDeduction = clamp(round(Math.max(0, walkingKm - 5) * 2), 0, 18);
  const availableBufferMinutes = input.plan.items
    .filter(item => item.kind === 'buffer')
    .reduce((total, item) => total + Math.max(0, item.endMinutes - item.startMinutes), 0);
  const timePressureMinutes = Math.max(0, input.tingoBehavior.bufferMinutes - availableBufferMinutes);
  const timeDeduction = clamp(round(timePressureMinutes / 5), 0, 18);
  const budgetOverrun = Math.max(0, Math.round(input.plan.totalEstimatedCost - Math.max(0, input.budget)));
  const budgetDeduction = clamp(round((budgetOverrun / Math.max(1, input.budget)) * 40), 0, 24);
  const preferenceEvidence = input.plan.items.flatMap(item => item.evidence).filter(item => item.source === 'constraint' || item.source === 'member-preference' || item.source === 'group-consensus');
  const optionalMisses = input.groupDNA.optionalPreferences.filter(signal => !preferenceEvidence.some(item => item.value.toLocaleLowerCase().includes(signal.label.toLocaleLowerCase()))).length;
  const selectedFloating = input.plan.items.find(item => item.kind === 'floating');
  const noFloatingPreference = selectedFloating && !selectedFloating.evidence.some(item => item.source === 'member-preference' || item.inputId === 'preference') ? 1 : 0;
  const preferenceMisses = optionalMisses + noFloatingPreference;
  const preferenceDeduction = clamp(preferenceMisses * 8, 0, 16);
  const transferMinutes = Math.max(0, Math.round(input.plan.transferMinutes));
  const transferDeduction = clamp(round(Math.max(0, transferMinutes - 45) / 5), 0, 12);
  const protectedAnchors = input.plan.items.filter(item => item.kind === 'anchor' && item.protected).length;
  const unprotectedAnchors = input.plan.items.filter(item => item.kind === 'anchor' && !item.protected).length;
  const anchorDeduction = clamp(unprotectedAnchors * 25, 0, 25);
  const resolvedConflicts = new Set((input.resolvedConflictLabels ?? []).map(label => label.trim().toLocaleLowerCase()));
  const unresolvedConflicts = input.groupDNA.conflicts.filter(conflict => !resolvedConflicts.has(conflict.label.trim().toLocaleLowerCase())).length;
  const conflictDeduction = clamp(unresolvedConflicts * 10, 0, 20);
  const unresolvedRisks = input.plan.unresolvedRisks.filter(risk => !risk.toLocaleLowerCase().includes('preference conflict')).length;
  const riskDeduction = clamp(unresolvedRisks * 6, 0, 18);
  const dealBreakerNeedle = input.dealBreaker.trim().toLocaleLowerCase();
  const dealBreakerViolations = dealBreakerNeedle
    ? input.plan.unresolvedRisks.filter(risk => risk.toLocaleLowerCase().includes(dealBreakerNeedle)).length
    : 0;
  const dealBreakerDeduction = clamp(dealBreakerViolations * 25, 0, 25);

  const deductions: PlanHealthDeduction[] = [];
  if (walkingDeduction > 0) deductions.push({ component: 'walking', points: walkingDeduction, reason: `Walking load is ${walkingKm.toFixed(1)} km, above the 5 km comfort threshold.` });
  if (timeDeduction > 0) deductions.push({ component: 'time-pressure', points: timeDeduction, reason: `${timePressureMinutes} minutes of Tingo breathing room are missing from the timeline.` });
  if (budgetDeduction > 0) deductions.push({ component: 'budget', points: budgetDeduction, reason: `The generated plan is RM ${budgetOverrun} over the supplied budget.` });
  if (preferenceDeduction > 0) deductions.push({ component: 'preferences', points: preferenceDeduction, reason: `${preferenceMisses} explicit preference signal${preferenceMisses === 1 ? '' : 's'} is not represented in the selected plan evidence.` });
  if (transferDeduction > 0) deductions.push({ component: 'transfers', points: transferDeduction, reason: `Transfer load is ${transferMinutes} minutes, above the 45 minute threshold.` });
  if (anchorDeduction > 0) deductions.push({ component: 'anchors', points: anchorDeduction, reason: `${unprotectedAnchors} anchor${unprotectedAnchors === 1 ? '' : 's'} is not protected.` });
  if (conflictDeduction > 0) deductions.push({ component: 'conflicts', points: conflictDeduction, reason: `${unresolvedConflicts} unresolved Group DNA conflict${unresolvedConflicts === 1 ? '' : 's'} still needs Court.` });
  if (riskDeduction > 0) deductions.push({ component: 'risks', points: riskDeduction, reason: `${unresolvedRisks} unresolved operational risk${unresolvedRisks === 1 ? '' : 's'} still needs attention.` });
  if (dealBreakerDeduction > 0) deductions.push({ component: 'deal-breaker', points: dealBreakerDeduction, reason: `${dealBreakerViolations} generated item${dealBreakerViolations === 1 ? '' : 's'} still conflicts with the Deal Breaker: ${input.dealBreaker}.` });

  const overall = clamp(100 - deductions.reduce((total, deduction) => total + deduction.points, 0), 0, 100);
  return { overall, metrics: { walkingKm, walkingDeduction, availableBufferMinutes, timePressureMinutes, timeDeduction, budgetOverrun, budgetDeduction, preferenceMisses, preferenceDeduction, transferMinutes, transferDeduction, protectedAnchors, unprotectedAnchors, anchorDeduction, unresolvedConflicts, conflictDeduction, unresolvedRisks, riskDeduction, dealBreakerViolations, dealBreakerDeduction }, deductions, reasons: deductions.map(deduction => deduction.reason) };
}
