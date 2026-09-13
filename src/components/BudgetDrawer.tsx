import { useState } from 'react';
import {
  BedDouble,
  Bus,
  CircleDollarSign,
  Utensils,
  Plus,
  Trash2,
  Receipt,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type { BudgetActuals, BudgetCategory, BudgetPlan } from '../domain/budget';
import {
  budgetLearning,
  defaultGroupTransactions,
  defaultSoloTransactions,
  type ExpenseTransaction,
} from '../domain/budget';
import budgetKeeper from '../assets/coco/personas/budget_keeper.png';
import './BudgetDrawer.css';

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

const categories: Array<{
  id: BudgetCategory;
  label: string;
  sublabel: string;
  Icon: typeof BedDouble;
}> = [
  { id: 'stay', label: 'Stay', sublabel: 'Hotels, ryokans & lodging', Icon: BedDouble },
  { id: 'food', label: 'Food', sublabel: 'Dining, street food & cafés', Icon: Utensils },
  { id: 'transport', label: 'Transit', sublabel: 'Metro, IC cards & trains', Icon: Bus },
  { id: 'activities', label: 'Activities', sublabel: 'Tickets, tours & shopping', Icon: CircleDollarSign },
];

const categorySuggestions: Record<BudgetCategory, string[]> = {
  food: ['🍜 Ramen dinner', '☕ Morning matcha', '🍢 Street snack', '🍱 Bento set'],
  stay: ['🏨 Hotel city tax', '🧳 Luggage storage', '♨️ Onsen pass', 'Deposit balance'],
  transport: ['🚇 Suica recharge', '🚄 Shinkansen ticket', '🚖 Evening taxi', 'Airport express'],
  activities: ['🎟️ Museum admission', '🎡 Theme park pass', '🎁 Omiyage gifts', 'Temple fortune'],
};

export function BudgetDrawer({
  mode,
  total,
  planned,
  spent,
  remaining,
  plan,
  actuals,
  days,
  onTotalChange,
  onPlanChange,
  onActualChange,
  onPrintReceipt,
  receiptPrinted,
}: BudgetDrawerProps) {
  const [view, setView] = useState<'summary' | 'spending'>('summary');
  const [entryMethod, setEntryMethod] = useState<'manual' | 'receipt'>('manual');
  const [category, setCategory] = useState<BudgetCategory>('food');
  const [amount, setAmount] = useState('');
  const [payer, setPayer] = useState('Me');
  const [splitWith, setSplitWith] = useState('');
  const [itemName, setItemName] = useState('');
  const [receiptName, setReceiptName] = useState('');
  const [receiptScanned, setReceiptScanned] = useState(false);
  const [settled, setSettled] = useState(false);
  const [transactions, setTransactions] = useState<ExpenseTransaction[]>(() =>
    mode === 'group' ? defaultGroupTransactions : defaultSoloTransactions,
  );

  const difference = planned - spent;
  const totalPercentSpent = total > 0 ? Math.min(100, Math.round((spent / total) * 100)) : 0;
  const isOverBudget = spent > total;
  const isNearLimit = !isOverBudget && totalPercentSpent >= 80;

  const healthStatus: 'healthy' | 'warning' | 'danger' = isOverBudget
    ? 'danger'
    : isNearLimit
      ? 'warning'
      : 'healthy';

  const insights = budgetLearning(actuals, plan);
  const primaryInsight =
    insights[0] ??
    (remaining > 0
      ? `You're tracking well under total budget with RM ${remaining} remaining.`
      : `Trip spend has reached the budget limit. Review upcoming optional plans.`);

  const saveEntry = () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return;

    const newTx: ExpenseTransaction = {
      id: `tx-${Date.now()}`,
      category,
      amount: value,
      description: itemName.trim() || `${categories.find(c => c.id === category)?.label} expense`,
      payer: mode === 'group' ? payer : 'Me',
      timestamp: 'Just now',
    };

    setTransactions(prev => [newTx, ...prev]);
    onActualChange(category, actuals[category] + value);
    setAmount('');
    setItemName('');
    setReceiptName('');
    setReceiptScanned(false);
  };

  const deleteTransaction = (tx: ExpenseTransaction) => {
    setTransactions(prev => prev.filter(item => item.id !== tx.id));
    onActualChange(tx.category, Math.max(0, actuals[tx.category] - tx.amount));
  };

  const quickAddAmount = (addVal: number) => {
    const currentVal = Number(amount) || 0;
    setAmount(String(currentVal + addVal));
  };

  const handleSimulateScan = (fileName: string) => {
    setReceiptName(fileName);
    setReceiptScanned(true);
    // Mock smart recognition
    setItemName('Kura Sushi Dining');
    setAmount('84');
    setCategory('food');
  };

  const quickLogForCategory = (cat: BudgetCategory) => {
    setCategory(cat);
    setView('spending');
  };

  return (
    <section className="budget-drawer-enhanced ongoing-budget-drawer" aria-label="Budget manager">
      {/* Mascot Header Banner */}
      <aside className="budget-mascot-header">
        <img
          src={budgetKeeper}
          alt="Coco Budget Keeper"
          className="budget-mascot-avatar"
        />
        <div className="budget-mascot-content">
          <span className="budget-mascot-tag">Coco Budget Keeper</span>
          <span className="budget-mascot-speech">
            {mode === 'group'
              ? 'Tracking shared group balances and category limits with zero guesswork.'
              : 'Keeping your daily spend comfortable so you can travel stress-free.'}
          </span>
        </div>
      </aside>

      {/* Navigation Tabs */}
      <nav className="budget-nav-tabs budget-view-tabs" role="tablist" aria-label="Budget view">
        <button
          type="button"
          role="tab"
          aria-selected={view === 'summary'}
          className={`budget-nav-tab ${view === 'summary' ? 'active' : ''}`}
          onClick={() => setView('summary')}
        >
          <Wallet size={15} />
          <span>Summary</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'spending'}
          className={`budget-nav-tab ${view === 'spending' ? 'active' : ''}`}
          onClick={() => setView('spending')}
        >
          <Receipt size={15} />
          <span>Spending</span>
          <span className="budget-tab-badge">{transactions.length}</span>
        </button>
      </nav>

      {view === 'summary' ? (
        <>
          {/* Hero Budget Gauge Card */}
          <section className="budget-hero-gauge-card cc-card" aria-label="Trip budget overview">
            <div className="budget-hero-top">
              <div className="budget-hero-title-group">
                <span>Total Spent vs Budget</span>
                <div className="budget-hero-amount">
                  RM {spent}
                  <small>/ RM {total}</small>
                </div>
              </div>
              <div className={`budget-health-pill ${healthStatus}`}>
                {healthStatus === 'healthy' && <CheckCircle2 size={13} />}
                {healthStatus === 'warning' && <AlertTriangle size={13} />}
                {healthStatus === 'danger' && <AlertTriangle size={13} />}
                <span>
                  {healthStatus === 'healthy' && `${totalPercentSpent}% Spent · On Track`}
                  {healthStatus === 'warning' && `${totalPercentSpent}% Spent · Caution`}
                  {healthStatus === 'danger' && `RM ${spent - total} Over Budget`}
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="budget-progress-track" role="progressbar" aria-valuenow={totalPercentSpent} aria-valuemin={0} aria-valuemax={100}>
              <div
                className={`budget-progress-fill ${healthStatus}`}
                style={{ width: `${Math.min(100, totalPercentSpent)}%` }}
              />
            </div>

            <div className="budget-hero-footer">
              <span>
                Remaining: <strong>RM {remaining}</strong>
              </span>
              <span>
                Category Plan: <strong>RM {planned}</strong>
              </span>
            </div>
          </section>

          {/* 4 Stats Grid */}
          <section className="budget-stats-grid budget-summary-grid cc-card" aria-label="Key budget metrics">
            <div className="budget-stat-card">
              <span className="budget-stat-label">Estimated</span>
              <b className="budget-stat-value">RM {planned}</b>
            </div>
            <div className="budget-stat-card">
              <span className="budget-stat-label">Spent</span>
              <b className="budget-stat-value">RM {spent}</b>
            </div>
            <div className="budget-stat-card">
              <span className="budget-stat-label">
                {difference >= 0 ? 'Under plan' : 'Over plan'}
              </span>
              <b className={`budget-stat-value ${difference >= 0 ? 'positive' : 'negative'}`}>
                {difference >= 0 ? `+RM ${difference}` : `-RM ${Math.abs(difference)}`}
              </b>
            </div>
            <div className="budget-stat-card">
              <span className="budget-stat-label">Left</span>
              <b className="budget-stat-value positive">RM {remaining}</b>
            </div>
          </section>

          {/* Trip Budget Interactive Editor */}
          <label className="budget-total-editor budget-total-field setup-field">
            <div className="budget-total-editor-label">
              <span>Trip Budget</span>
              <small>{mode === 'group' ? 'Shared Group Target' : 'Solo Target'}</small>
            </div>
            <div className="budget-input-with-currency">
              <span className="budget-currency-prefix">RM</span>
              <input
                aria-label={`${mode === 'group' ? 'Group' : 'Solo'} budget total`}
                type="number"
                min="0"
                value={total}
                onChange={event => onTotalChange(Number(event.target.value))}
              />
            </div>
          </label>

          {/* Category Budget Breakdown */}
          <section className="budget-categories-section" aria-label="Category allocations">
            <div className="budget-categories-heading">
              <span>Category Breakdown</span>
              <small>Spent vs Planned Limit</small>
            </div>

            <div className="budget-category-list">
              {categories.map(({ id, label, sublabel, Icon }) => {
                const catSpent = actuals[id];
                const catPlan = plan[id];
                const catPercent = catPlan > 0 ? Math.min(150, Math.round((catSpent / catPlan) * 100)) : 0;
                const catStatus: 'safe' | 'warn' | 'danger' =
                  catSpent > catPlan ? 'danger' : catPercent >= 80 ? 'warn' : 'safe';

                return (
                  <article className="budget-category-card budget-category-row" key={id}>
                    <div className="budget-cat-header">
                      <div className="budget-cat-identity">
                        <span className={`budget-cat-icon budget-category-icon ${id}`}>
                          <Icon size={18} />
                        </span>
                        <div className="budget-cat-text">
                          <b className="budget-cat-name">{label}</b>
                          <small className="budget-cat-subtext">{sublabel}</small>
                        </div>
                      </div>

                      <div className="budget-cat-spend-info">
                        <strong className="budget-cat-amount">RM {catSpent}</strong>
                        <span className="budget-cat-target">of RM {catPlan}</span>
                      </div>
                    </div>

                    {/* Progress Bar for Category */}
                    <div className="budget-cat-progress-row">
                      <div className="budget-cat-track">
                        <div
                          className={`budget-cat-fill ${catStatus}`}
                          style={{ width: `${Math.min(100, catPercent)}%` }}
                        />
                      </div>
                      <span className="budget-cat-percent-tag">{catPercent}%</span>
                    </div>

                    {/* Inline Plan Editor & Quick Log Button */}
                    <div className="budget-cat-actions-row">
                      <label className="budget-cat-inline-edit budget-category-inputs">
                        <span>Plan:</span>
                        <span>RM</span>
                        <input
                          aria-label={`${label} planned spend`}
                          type="number"
                          min="0"
                          value={catPlan}
                          onChange={event => onPlanChange(id, Number(event.target.value))}
                        />
                      </label>

                      <button
                        type="button"
                        className="budget-cat-add-btn"
                        onClick={() => quickLogForCategory(id)}
                        title={`Log spending in ${label}`}
                      >
                        <Plus size={13} />
                        <span>Log</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Coco Intelligence Variance Card */}
          <aside className="budget-coco-insights" aria-label="Coco insights">
            <Sparkles size={18} color="#1a4b8c" style={{ flexShrink: 0, marginTop: 2 }} />
            <div className="budget-coco-insights-text">
              <strong>Coco Budget Advice</strong>
              <p>{primaryInsight}</p>
            </div>
          </aside>

          {/* Group Settlement or Solo Daily Allowance */}
          {mode === 'group' ? (
            <section className="budget-settlement-card budget-settlement cc-card">
              <div className="budget-settlement-row">
                <div>
                  <small>You owe</small>
                  <b>RM {Math.max(0, Math.round(spent / 2))}</b>
                  <span> to the group</span>
                </div>
                <button
                  type="button"
                  className="budget-settle-btn"
                  onClick={() => setSettled(prev => !prev)}
                >
                  {settled ? '✓ Mark as Settled' : 'Settle Up'}
                </button>
              </div>
              <div className="budget-settlement-detail">
                <span>Shared calculations divide expenses evenly across all confirmed group members.</span>
              </div>
            </section>
          ) : (
            <section className="budget-daily-allowance-card cc-card">
              <div>
                <small>Daily Spending Pace</small>
                <b>RM {days > 0 ? Math.round(remaining / days) : remaining} / day</b>
              </div>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                Based on {days} trip day{days === 1 ? '' : 's'} remaining
              </span>
            </section>
          )}
        </>
      ) : (
        /* SPENDING TAB */
        <div className="budget-spending-view">
          {/* Entry Method Selector */}
          <div className="budget-method-pills budget-entry-tabs">
            <button
              type="button"
              className={`budget-method-btn ${entryMethod === 'manual' ? 'active' : ''}`}
              onClick={() => setEntryMethod('manual')}
            >
              <Wallet size={14} />
              <span>Manual Entry</span>
            </button>
            <button
              type="button"
              className={`budget-method-btn ${entryMethod === 'receipt' ? 'active' : ''}`}
              onClick={() => setEntryMethod('receipt')}
            >
              <Camera size={14} />
              <span>Scan Receipt</span>
            </button>
          </div>

          {/* Entry Form */}
          <section className="budget-spending-form budget-entry-form cc-card">
            {entryMethod === 'manual' ? (
              <>
                {/* Amount input with currency */}
                <label className="setup-field">
                  <span>Amount (RM)</span>
                  <div className="budget-input-with-currency">
                    <span className="budget-currency-prefix">RM</span>
                    <input
                      inputMode="decimal"
                      type="number"
                      min="0"
                      value={amount}
                      onChange={event => setAmount(event.target.value)}
                      placeholder="0.00"
                      autoFocus
                    />
                  </div>
                </label>

                {/* Quick Amount Chips */}
                <div className="budget-quick-chips">
                  {[10, 20, 50, 100].map(val => (
                    <button
                      type="button"
                      key={val}
                      className="budget-chip-btn"
                      onClick={() => quickAddAmount(val)}
                    >
                      +RM {val}
                    </button>
                  ))}
                </div>

                {/* Category Grid */}
                <div className="setup-field">
                  <span>Category</span>
                  <div className="budget-form-category-grid">
                    {categories.map(item => (
                      <button
                        type="button"
                        key={item.id}
                        className={`budget-form-cat-choice ${category === item.id ? 'active' : ''}`}
                        onClick={() => setCategory(item.id)}
                      >
                        <item.Icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description & Suggestions */}
                <label className="setup-field">
                  <span>Description / Place</span>
                  <input
                    value={itemName}
                    onChange={event => setItemName(event.target.value)}
                    placeholder="e.g. Ramen dinner, Metro pass…"
                  />
                </label>

                <div className="budget-suggestion-chips">
                  {categorySuggestions[category]?.map(sug => (
                    <button
                      type="button"
                      key={sug}
                      className="budget-suggest-chip"
                      onClick={() => setItemName(sug)}
                    >
                      {sug}
                    </button>
                  ))}
                </div>

                {mode === 'group' && (
                  <>
                    <label className="setup-field">
                      <span>Paid by</span>
                      <input value={payer} onChange={event => setPayer(event.target.value)} />
                    </label>
                    <label className="setup-field">
                      <span>Split with</span>
                      <input
                        value={splitWith}
                        onChange={event => setSplitWith(event.target.value)}
                        placeholder="All members, or comma-separated names"
                      />
                    </label>
                  </>
                )}
              </>
            ) : (
              /* Receipt Scanner Mode */
              <>
                <div className="receipt-capture">
                  <label className="budget-scanner-dropzone">
                    <Camera size={24} color="var(--sangria)" />
                    <span>Upload or Take Photo of Receipt</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={event => {
                        const name = event.target.files?.[0]?.name ?? 'receipt_tokyo.jpg';
                        handleSimulateScan(name);
                      }}
                    />
                  </label>
                </div>

                {receiptScanned && (
                  <div className="budget-scanner-detected-card">
                    <CheckCircle2 size={16} />
                    <span>Receipt Scanned: Auto-filled items &amp; amount below!</span>
                  </div>
                )}

                <label className="setup-field">
                  <span>Item / Vendor</span>
                  <input
                    value={itemName}
                    onChange={event => setItemName(event.target.value)}
                    placeholder="e.g. Izakaya dinner"
                  />
                </label>

                <label className="setup-field">
                  <span>Amount (RM)</span>
                  <div className="budget-input-with-currency">
                    <span className="budget-currency-prefix">RM</span>
                    <input
                      inputMode="decimal"
                      type="number"
                      min="0"
                      value={amount}
                      onChange={event => setAmount(event.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </label>

                <label className="setup-field">
                  <span>Category</span>
                  <select
                    value={category}
                    onChange={event => setCategory(event.target.value as BudgetCategory)}
                  >
                    {categories.map(item => (
                      <option value={item.id} key={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}

            <button
              type="button"
              className="primary budget-submit-btn"
              disabled={!amount || Number(amount) <= 0}
              onClick={saveEntry}
            >
              Add Spending {amount ? `(RM ${amount})` : ''}
            </button>
          </section>

          {/* Transaction History Feed */}
          <section className="budget-history-feed" aria-label="Recent expenses">
            <div className="budget-history-heading">
              <span>Recent Expenses ({transactions.length})</span>
              <small>Tap trash icon to remove</small>
            </div>

            {transactions.map(tx => {
              const catObj = categories.find(c => c.id === tx.category);
              const CatIcon = catObj?.Icon ?? CircleDollarSign;

              return (
                <article className="budget-history-item" key={tx.id}>
                  <div className="budget-history-left">
                    <span className={`budget-cat-icon ${tx.category}`} style={{ width: 32, height: 32 }}>
                      <CatIcon size={16} />
                    </span>
                    <div className="budget-history-info">
                      <b className="budget-history-title">{tx.description}</b>
                      <small className="budget-history-meta">
                        {tx.timestamp} · {catObj?.label} {mode === 'group' && `· by ${tx.payer}`}
                      </small>
                    </div>
                  </div>

                  <div className="budget-history-right">
                    <strong className="budget-history-amount">RM {tx.amount}</strong>
                    <button
                      type="button"
                      className="budget-history-delete-btn"
                      onClick={() => deleteTransaction(tx)}
                      title="Remove expense"
                      aria-label={`Remove ${tx.description}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </article>
              );
            })}
          </section>

          {/* Receipt Print Ritual Button */}
          <button
            type="button"
            className="receipt-button budget-receipt-ritual-btn"
            onClick={onPrintReceipt}
          >
            <Receipt size={16} />
            <span>{receiptPrinted ? 'Receipt Ready · Print Again' : 'Print Official Trip Receipt'}</span>
          </button>
        </div>
      )}
    </section>
  );
}
