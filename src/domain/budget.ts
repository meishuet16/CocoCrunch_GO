export type BudgetCategory = 'food' | 'transport' | 'stay' | 'activities';
export type BudgetPlan = Record<BudgetCategory, number>;
export const defaultGroupBudget: BudgetPlan = { food: 720, transport: 360, stay: 520, activities: 160 };
export const defaultSoloBudget: BudgetPlan = { food: 320, transport: 180, stay: 250, activities: 70 };
export function plannedBudget(plan: BudgetPlan) { return Object.values(plan).reduce((sum, amount) => sum + Math.max(0, amount), 0); }
export function remainingBudget(total: number, spent: number, extraCost = 0) { return Math.max(0, total - spent - extraCost); }
