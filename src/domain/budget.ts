export type BudgetCategory = 'food' | 'transport' | 'stay' | 'activities';
export type BudgetPlan = Record<BudgetCategory, number>;
export type BudgetActuals = Record<BudgetCategory, number>;
export type BudgetVariance = {
  category: BudgetCategory;
  planned: number;
  actual: number;
  variance: number;
  status: 'under' | 'on-track' | 'over';
};

export const defaultGroupBudget: BudgetPlan = { food: 720, transport: 360, stay: 520, activities: 160 };
export const defaultSoloBudget: BudgetPlan = { food: 320, transport: 180, stay: 250, activities: 70 };
export const defaultGroupActuals: BudgetActuals = { food: 548, transport: 302, stay: 358, activities: 80 };
export const defaultSoloActuals: BudgetActuals = { food: 244, transport: 146, stay: 174, activities: 40 };

export function sanitizeAmount(value: number): number { return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0; }
export function updateBudget(plan: BudgetPlan, category: BudgetCategory, value: number): BudgetPlan { return { ...plan, [category]: sanitizeAmount(value) }; }
export function plannedBudget(plan: BudgetPlan): number { return Object.values(plan).reduce((sum, amount) => sum + sanitizeAmount(amount), 0); }
export function actualBudget(actuals: BudgetActuals): number { return Object.values(actuals).reduce((sum, amount) => sum + sanitizeAmount(amount), 0); }
export function remainingBudget(total: number, spent: number, extraCost = 0): number { return Math.max(0, sanitizeAmount(total) - sanitizeAmount(spent) - sanitizeAmount(extraCost)); }

export function budgetVariance(plan: BudgetPlan, actuals: BudgetActuals): BudgetVariance[] {
  return (Object.keys(plan) as BudgetCategory[]).map(category => {
    const planned = sanitizeAmount(plan[category]);
    const actual = sanitizeAmount(actuals[category]);
    const variance = actual - planned;
    const tolerance = Math.max(10, Math.round(planned * .05));
    return { category, planned, actual, variance, status: variance > tolerance ? 'over' : variance < -tolerance ? 'under' : 'on-track' };
  });
}

export function budgetLearning(actuals: BudgetActuals, plan: BudgetPlan): string[] {
  return budgetVariance(plan, actuals).filter(item => item.status !== 'on-track').map(item => item.status === 'over'
    ? `${item.category} ran RM ${Math.abs(item.variance)} over plan; surface a larger ${item.category} buffer next trip.`
    : `${item.category} finished RM ${Math.abs(item.variance)} under plan; Coco can avoid over-reserving this category next trip.`);
}

export type ExpenseTransaction = {
  id: string;
  category: BudgetCategory;
  amount: number;
  description: string;
  payer: string;
  timestamp: string;
};

export const defaultGroupTransactions: ExpenseTransaction[] = [
  { id: 'tx-1', category: 'stay', amount: 358, description: 'Boutique Hotel deposit', payer: 'Alex', timestamp: 'Yesterday 15:30' },
  { id: 'tx-2', category: 'food', amount: 320, description: 'Shinjuku Izakaya dinner', payer: 'Me', timestamp: 'Yesterday 20:15' },
  { id: 'tx-3', category: 'food', amount: 228, description: 'Tsukiji market brunch', payer: 'Me', timestamp: 'Today 09:40' },
  { id: 'tx-4', category: 'transport', amount: 302, description: 'JR Regional Rail passes', payer: 'Priya', timestamp: 'Today 11:00' },
  { id: 'tx-5', category: 'activities', amount: 80, description: 'Digital art museum tickets', payer: 'Me', timestamp: 'Today 14:20' },
];

export const defaultSoloTransactions: ExpenseTransaction[] = [
  { id: 'stx-1', category: 'stay', amount: 174, description: 'Capsule hotel stay', payer: 'Me', timestamp: 'Yesterday 14:00' },
  { id: 'stx-2', category: 'food', amount: 154, description: 'Ramen & bakery breakfast', payer: 'Me', timestamp: 'Today 12:30' },
  { id: 'stx-3', category: 'food', amount: 90, description: 'Café & matcha sweets', payer: 'Me', timestamp: 'Today 16:15' },
  { id: 'stx-4', category: 'transport', amount: 146, description: 'Metro travel card reload', payer: 'Me', timestamp: 'Today 10:15' },
  { id: 'stx-5', category: 'activities', amount: 40, description: 'Art museum admission', payer: 'Me', timestamp: 'Today 15:00' },
];

