export type BudgetCategory = 'food' | 'transport' | 'stay' | 'activities';
export type BudgetPlan = Record<BudgetCategory, number>;
export const defaultGroupBudget: BudgetPlan = { food: 720, transport: 360, stay: 520, activities: 160 };
export const defaultSoloBudget: BudgetPlan = { food: 320, transport: 180, stay: 250, activities: 70 };
export function sanitizeAmount(value: number): number { return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0; }
export function updateBudget(plan: BudgetPlan, category: BudgetCategory, value: number): BudgetPlan { return { ...plan, [category]: sanitizeAmount(value) }; }
export function plannedBudget(plan: BudgetPlan): number { return Object.values(plan).reduce((sum, amount) => sum + sanitizeAmount(amount), 0); }
export function remainingBudget(total: number, spent: number, extraCost = 0): number { return Math.max(0, sanitizeAmount(total) - sanitizeAmount(spent) - sanitizeAmount(extraCost)); }
