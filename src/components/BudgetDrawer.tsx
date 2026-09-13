import { useState } from 'react';
import { BedDouble, Bus, CircleDollarSign, Utensils } from 'lucide-react';
import type { BudgetActuals, BudgetCategory, BudgetPlan } from '../domain/budget';

type BudgetDrawerProps = {
  mode: 'solo' | 'group'; total: number; planned: number; spent: number; remaining: number;
  plan: BudgetPlan; actuals: BudgetActuals; days: number;
  onTotalChange: (value: number) => void; onPlanChange: (category: BudgetCategory, value: number) => void;
  onActualChange: (category: BudgetCategory, value: number) => void; onPrintReceipt: () => void; receiptPrinted: boolean;
};

const categories: Array<{ id: BudgetCategory; label: string; Icon: typeof BedDouble }> = [
  { id: 'stay', label: 'Stay', Icon: BedDouble }, { id: 'food', label: 'Food', Icon: Utensils },
  { id: 'transport', label: 'Transit', Icon: Bus }, { id: 'activities', label: 'Activities', Icon: CircleDollarSign },
];

export function BudgetDrawer({ mode, total, planned, spent, remaining, plan, actuals, days: _days, onTotalChange, onPlanChange, onActualChange, onPrintReceipt, receiptPrinted }: BudgetDrawerProps) {
  const [view, setView] = useState<'summary' | 'spending'>('summary');
  const [entryMethod, setEntryMethod] = useState<'manual' | 'receipt'>('manual');
  const [category, setCategory] = useState<BudgetCategory>('food');
  const [amount, setAmount] = useState('');
  const [payer, setPayer] = useState('Me');
  const [splitWith, setSplitWith] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemOwner, setItemOwner] = useState('Me');
  const [receiptName, setReceiptName] = useState('');
  const difference = planned - spent;
  const saveEntry = () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return;
    onActualChange(category, actuals[category] + value);
    setAmount(''); setItemName('');
  };

  return <section className="budget-drawer ongoing-budget-drawer">
    <div className="budget-view-tabs" role="tablist" aria-label="Budget view">
      <button type="button" role="tab" aria-selected={view === 'summary'} className={view === 'summary' ? 'active' : ''} onClick={() => setView('summary')}>Summary</button>
      <button type="button" role="tab" aria-selected={view === 'spending'} className={view === 'spending' ? 'active' : ''} onClick={() => setView('spending')}>Spending</button>
    </div>

    {view === 'summary' ? <>
      <section className="budget-summary-grid cc-card"><span><small>Estimated</small><b>RM {planned}</b></span><span><small>Spent</small><b>RM {spent}</b></span><span><small>{difference >= 0 ? 'Under plan' : 'Over plan'}</small><b>RM {Math.abs(difference)}</b></span><span><small>Left</small><b>RM {remaining}</b></span></section>
      <label className="budget-total-field setup-field"><span>Trip budget</span><input aria-label={`${mode === 'group' ? 'Group' : 'Solo'} budget total`} type="number" min="0" value={total} onChange={event => onTotalChange(Number(event.target.value))} /></label>
      <div className="budget-category-list">
        {categories.map(({ id, label, Icon }) => <label className="budget-category-row" key={id}><span className={`budget-category-icon ${id}`}><Icon size={17} /></span><b>{label}</b><div><strong>RM {actuals[id]}</strong><small>of RM {plan[id]}</small></div><span className="budget-category-inputs"><input aria-label={`${label} planned spend`} type="number" min="0" value={plan[id]} onChange={event => onPlanChange(id, Number(event.target.value))} /></span></label>)}
      </div>
      {mode === 'group' && <section className="budget-settlement cc-card"><small>You owe</small><b>RM {Math.max(0, Math.round(spent / 2))}</b><span>to the group</span></section>}
    </> : <>
      <div className="budget-entry-tabs"><button className={entryMethod === 'manual' ? 'active' : ''} onClick={() => setEntryMethod('manual')}>Manual</button><button className={entryMethod === 'receipt' ? 'active' : ''} onClick={() => setEntryMethod('receipt')}>Pay receipt</button></div>
      <section className="budget-entry-form cc-card">
        {entryMethod === 'manual' ? <><label className="setup-field"><span>Paid by</span><input value={payer} onChange={event => setPayer(event.target.value)} /></label>{mode === 'group' && <label className="setup-field"><span>Split with</span><input value={splitWith} onChange={event => setSplitWith(event.target.value)} placeholder="Names, separated by commas" /></label>}<label className="setup-field"><span>Category</span><select value={category} onChange={event => setCategory(event.target.value as BudgetCategory)}>{categories.map(item => <option value={item.id} key={item.id}>{item.label}</option>)}</select></label><label className="setup-field"><span>Amount</span><input inputMode="decimal" type="number" min="0" value={amount} onChange={event => setAmount(event.target.value)} placeholder="RM 0" /></label></> : <><div className="receipt-capture"><label><span>Upload image</span><input type="file" accept="image/*" onChange={event => setReceiptName(event.target.files?.[0]?.name ?? '')} /></label><label><span>Take photo</span><input type="file" accept="image/*" capture="environment" onChange={event => setReceiptName(event.target.files?.[0]?.name ?? '')} /></label>{receiptName && <small>{receiptName}</small>}</div><label className="setup-field"><span>Item</span><input value={itemName} onChange={event => setItemName(event.target.value)} placeholder="e.g. Dinner" /></label><label className="setup-field"><span>Belongs to</span><input value={itemOwner} onChange={event => setItemOwner(event.target.value)} /></label><label className="setup-field"><span>Category</span><select value={category} onChange={event => setCategory(event.target.value as BudgetCategory)}>{categories.map(item => <option value={item.id} key={item.id}>{item.label}</option>)}</select></label><label className="setup-field"><span>Amount</span><input inputMode="decimal" type="number" min="0" value={amount} onChange={event => setAmount(event.target.value)} placeholder="RM 0" /></label></>}
        <button className="primary" onClick={saveEntry}>Add spending</button>
      </section>
      <button className="receipt-button" onClick={onPrintReceipt}>{receiptPrinted ? 'Receipt ready' : 'Pay receipt'}</button>
    </>}
  </section>;
}
