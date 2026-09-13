import { useState } from 'react';
import { BedDouble, Bus, CircleDollarSign, Utensils } from 'lucide-react';
import type { BudgetActuals, BudgetCategory, BudgetPlan } from '../domain/budget';
import { CocoCompanion } from './coco/CocoCompanion';

type BudgetDrawerProps = {
  mode: 'solo' | 'group';
  total: number;
  planned: number;
  spent: number;
  remaining: number;
  plan: BudgetPlan;
  actuals: BudgetActuals;
  days: number;
  onTotalChange: (value: number) => void;
  onPlanChange: (category: BudgetCategory, value: number) => void;
  onActualChange: (category: BudgetCategory, value: number) => void;
  onPrintReceipt: () => void;
  receiptPrinted: boolean;
};

const categories: Array<{ id: BudgetCategory; label: string; Icon: typeof BedDouble }> = [
  { id: 'stay', label: 'Stay', Icon: BedDouble },
  { id: 'food', label: 'Food', Icon: Utensils },
  { id: 'transport', label: 'Transit', Icon: Bus },
  { id: 'activities', label: 'Activities', Icon: CircleDollarSign },
];

export function BudgetDrawer({ mode, total, planned, spent, remaining, plan, actuals, days, onTotalChange, onPlanChange, onActualChange, onPrintReceipt, receiptPrinted }: BudgetDrawerProps) {
  const [view, setView] = useState<'categories' | 'daily'>('categories');
  const safeDays = Math.max(1, days);
  const progress = total > 0 ? Math.min(100, Math.round((spent / total) * 100)) : 0;
  const averageDailySpend = Math.round(spent / safeDays);

  return <section className="budget-drawer">
    <span className="drawer-kicker">TRIP BUDGET</span>
    <label className="budget-hero-card cc-card">
      <span>Total spent</span>
      <div><b>RM {spent}</b><small>/ RM {total} budget</small></div>
      <i aria-label={`${progress}% of budget spent`}><em style={{ width: `${progress}%` }} /></i>
      <small>{progress}% used · RM {remaining} remaining</small>
      <input aria-label={`${mode === 'group' ? 'Group' : 'Solo'} budget total`} type="number" min="0" value={total} onChange={event => onTotalChange(Number(event.target.value))} />
    </label>

    <div className="budget-view-tabs" role="tablist" aria-label="Budget view">
      <button type="button" role="tab" aria-selected={view === 'categories'} className={view === 'categories' ? 'active' : ''} onClick={() => setView('categories')}>Categories</button>
      <button type="button" role="tab" aria-selected={view === 'daily'} className={view === 'daily' ? 'active' : ''} onClick={() => setView('daily')}>Daily spend</button>
    </div>

    {view === 'categories' ? <div className="budget-category-list">
      {categories.map(({ id, label, Icon }) => {
        const actual = actuals[id];
        const percentage = total > 0 ? Math.round((actual / total) * 100) : 0;
        return <label className="budget-category-row" key={id}>
          <span className={`budget-category-icon ${id}`}><Icon size={17} /></span>
          <b>{label}</b>
          <div><strong>RM {actual}</strong><small>{percentage}%</small></div>
          <span className="budget-category-inputs"><input aria-label={`${label} planned spend`} type="number" min="0" value={plan[id]} onChange={event => onPlanChange(id, Number(event.target.value))} /><input aria-label={`${label} actual spend`} type="number" min="0" value={actual} onChange={event => onActualChange(id, Number(event.target.value))} /></span>
        </label>;
      })}
    </div> : <section className="budget-daily-list" aria-label="Daily budget summary">
      {Array.from({ length: safeDays }, (_, index) => <div key={index}><span>Day {index + 1}</span><b>RM {averageDailySpend}</b><small>Average from current actual spend</small></div>)}
    </section>}

    <section className="budget-tip-card cc-card">
      <CocoCompanion context="planning" pose="expression-thinking" size={64} />
      <div><b>{planned > total ? 'Your plan is over budget.' : 'A little room is still free.'}</b><small>{planned > total ? `Reduce RM ${planned - total} before confirming another plan item.` : 'Keep a small buffer for changes during the trip.'}</small></div>
    </section>
    <button className="receipt-button" onClick={onPrintReceipt}>{receiptPrinted ? 'Print receipt again' : 'Print split-bill receipt'}</button>
  </section>;
}
