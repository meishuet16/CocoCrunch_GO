import { sanitizeAmount, type BudgetActuals, type BudgetCategory, type BudgetPlan } from './budget';
import type { CompletedPaceEvidence, DecisionRecord } from '../persistence';

export type DecisionSatisfaction = NonNullable<DecisionRecord['satisfaction']>;

export function normalizeBudgetActuals(actuals: Partial<BudgetActuals> | undefined, fallback: BudgetActuals): BudgetActuals {
  return {
    food: sanitizeAmount(actuals?.food ?? fallback.food),
    transport: sanitizeAmount(actuals?.transport ?? fallback.transport),
    stay: sanitizeAmount(actuals?.stay ?? fallback.stay),
    activities: sanitizeAmount(actuals?.activities ?? fallback.activities),
  };
}

export function updateBudgetActual(actuals: BudgetActuals, category: BudgetCategory, value: number): BudgetActuals {
  return { ...actuals, [category]: sanitizeAmount(value) };
}

/** Fold a real disruption cost into the category where it was incurred, so total and category retrospective agree. */
export function applyActualAdjustment(actuals: BudgetActuals, category: BudgetCategory, amount: number): BudgetActuals {
  return updateBudgetActual(actuals, category, actuals[category] + sanitizeAmount(amount));
}

export function paceEvidenceSummary(evidence: CompletedPaceEvidence | undefined): string {
  if (!evidence) return 'No completed pace signal yet';
  if (evidence.delayed || evidence.mood === 'tired') return 'Slower than planned after disruption / energy change';
  if (evidence.arrivalChecked) return 'Matched the planned rhythm';
  return 'No completed pace signal yet';
}

export function plannedVsActualSummary(plan: BudgetPlan, actuals: BudgetActuals): string[] {
  return (Object.keys(plan) as BudgetCategory[]).map(category => {
    const delta = actuals[category] - plan[category];
    if (delta === 0) return `${category}: on plan`;
    return `${category}: RM ${Math.abs(delta)} ${delta > 0 ? 'over' : 'under'} plan`;
  });
}

export function rateDecision(history: DecisionRecord[], id: string, satisfaction: DecisionSatisfaction): DecisionRecord[] {
  return history.map(record => record.id === id ? { ...record, satisfaction } : record);
}

export function decisionSatisfactionSummary(history: DecisionRecord[]): string {
  const rated = history.filter(record => record.satisfaction);
  if (rated.length === 0) return 'No decision outcomes rated yet.';
  const worth = rated.filter(record => record.satisfaction === 'worth').length;
  const mixed = rated.filter(record => record.satisfaction === 'mixed').length;
  const skip = rated.filter(record => record.satisfaction === 'skip').length;
  return `${rated.length} rated · ${worth} worth it · ${mixed} mixed · ${skip} skip next time`;
}
