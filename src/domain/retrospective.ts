import { sanitizeAmount, type BudgetActuals, type BudgetCategory } from './budget';
import type { DecisionRecord } from '../persistence';

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
