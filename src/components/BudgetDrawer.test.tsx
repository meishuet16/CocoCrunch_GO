import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { BudgetDrawer } from './BudgetDrawer';
import type { BudgetActuals, BudgetPlan } from '../domain/budget';

describe('BudgetDrawer Component', () => {
  const defaultPlan: BudgetPlan = { stay: 520, food: 720, transport: 360, activities: 160 };
  const defaultActuals: BudgetActuals = { stay: 358, food: 548, transport: 302, activities: 80 };

  it('renders mascot header, tabs, and hero budget gauge', () => {
    const html = renderToStaticMarkup(
      <BudgetDrawer
        mode="group"
        total={1500}
        planned={1760}
        spent={1288}
        remaining={212}
        plan={defaultPlan}
        actuals={defaultActuals}
        days={4}
        onTotalChange={() => undefined}
        onPlanChange={() => undefined}
        onActualChange={() => undefined}
        onPrintReceipt={() => undefined}
        receiptPrinted={false}
      />,
    );

    // Mascot callout
    expect(html).toContain('Coco Budget Keeper');
    expect(html).toContain('Tracking shared group balances and category limits with zero guesswork');

    // Navigation tabs
    expect(html).toContain('Summary');
    expect(html).toContain('Spending');

    // Hero gauge
    expect(html).toContain('Total Spent vs Budget');
    expect(html).toContain('RM 1288');
    expect(html).toContain('/ RM 1500');
    expect(html).toContain('progressbar');
  });

  it('renders key metric cards with accurate values and signs', () => {
    const html = renderToStaticMarkup(
      <BudgetDrawer
        mode="group"
        total={1500}
        planned={1760}
        spent={1288}
        remaining={212}
        plan={defaultPlan}
        actuals={defaultActuals}
        days={4}
        onTotalChange={() => undefined}
        onPlanChange={() => undefined}
        onActualChange={() => undefined}
        onPrintReceipt={() => undefined}
        receiptPrinted={false}
      />,
    );

    expect(html).toContain('Estimated');
    expect(html).toContain('RM 1760');
    expect(html).toContain('Spent');
    expect(html).toContain('RM 1288');
    expect(html).toContain('Under plan');
    expect(html).toContain('+RM 472');
    expect(html).toContain('Left');
    expect(html).toContain('RM 212');
  });

  it('renders trip budget input field with currency adornment', () => {
    const html = renderToStaticMarkup(
      <BudgetDrawer
        mode="group"
        total={1500}
        planned={1760}
        spent={1288}
        remaining={212}
        plan={defaultPlan}
        actuals={defaultActuals}
        days={4}
        onTotalChange={() => undefined}
        onPlanChange={() => undefined}
        onActualChange={() => undefined}
        onPrintReceipt={() => undefined}
        receiptPrinted={false}
      />,
    );

    expect(html).toContain('Trip Budget');
    expect(html).toContain('Shared Group Target');
    expect(html).toContain('value="1500"');
    expect(html).toContain('aria-label="Group budget total"');
  });

  it('renders all four categories with progress bars, percentages, and inline plan inputs', () => {
    const html = renderToStaticMarkup(
      <BudgetDrawer
        mode="group"
        total={1500}
        planned={1760}
        spent={1288}
        remaining={212}
        plan={defaultPlan}
        actuals={defaultActuals}
        days={4}
        onTotalChange={() => undefined}
        onPlanChange={() => undefined}
        onActualChange={() => undefined}
        onPrintReceipt={() => undefined}
        receiptPrinted={false}
      />,
    );

    // Stay: 358 / 520 = 69%
    expect(html).toContain('Stay');
    expect(html).toContain('RM 358');
    expect(html).toContain('of RM 520');
    expect(html).toContain('69%');

    // Food: 548 / 720 = 76%
    expect(html).toContain('Food');
    expect(html).toContain('RM 548');
    expect(html).toContain('of RM 720');
    expect(html).toContain('76%');

    // Transit: 302 / 360 = 84%
    expect(html).toContain('Transit');
    expect(html).toContain('RM 302');
    expect(html).toContain('of RM 360');
    expect(html).toContain('84%');

    // Activities: 80 / 160 = 50%
    expect(html).toContain('Activities');
    expect(html).toContain('RM 80');
    expect(html).toContain('of RM 160');
    expect(html).toContain('50%');

    // Quick log buttons for categories
    expect(html).toContain('Log');
  });

  it('renders Coco budget advice powered by domain variance analysis', () => {
    const html = renderToStaticMarkup(
      <BudgetDrawer
        mode="group"
        total={1500}
        planned={1760}
        spent={1288}
        remaining={212}
        plan={defaultPlan}
        actuals={defaultActuals}
        days={4}
        onTotalChange={() => undefined}
        onPlanChange={() => undefined}
        onActualChange={() => undefined}
        onPrintReceipt={() => undefined}
        receiptPrinted={false}
      />,
    );

    expect(html).toContain('Coco Budget Advice');
    // From domain budgetLearning(actuals, plan)
    expect(html).toContain('under plan');
  });

  it('renders group settlement card when in group mode', () => {
    const html = renderToStaticMarkup(
      <BudgetDrawer
        mode="group"
        total={1500}
        planned={1760}
        spent={1288}
        remaining={212}
        plan={defaultPlan}
        actuals={defaultActuals}
        days={4}
        onTotalChange={() => undefined}
        onPlanChange={() => undefined}
        onActualChange={() => undefined}
        onPrintReceipt={() => undefined}
        receiptPrinted={false}
      />,
    );

    expect(html).toContain('You owe');
    // Math.round(1288 / 2) = 644
    expect(html).toContain('RM 644');
    expect(html).toContain('to the group');
    expect(html).toContain('Settle Up');
  });

  it('renders daily spending pace allowance in solo mode', () => {
    const html = renderToStaticMarkup(
      <BudgetDrawer
        mode="solo"
        total={800}
        planned={820}
        spent={604}
        remaining={196}
        plan={{ stay: 250, food: 320, transport: 180, activities: 70 }}
        actuals={{ stay: 174, food: 244, transport: 146, activities: 40 }}
        days={2}
        onTotalChange={() => undefined}
        onPlanChange={() => undefined}
        onActualChange={() => undefined}
        onPrintReceipt={() => undefined}
        receiptPrinted={false}
      />,
    );

    expect(html).toContain('Daily Spending Pace');
    // Math.round(196 / 2) = 98
    expect(html).toContain('RM 98 / day');
    expect(html).toContain('Based on 2 trip days remaining');
    // In solo mode, group settlement is not shown
    expect(html).not.toContain('to the group');
  });

  it('reflects over-budget status when spending exceeds total budget', () => {
    const html = renderToStaticMarkup(
      <BudgetDrawer
        mode="group"
        total={1000}
        planned={1200}
        spent={1150}
        remaining={0}
        plan={defaultPlan}
        actuals={defaultActuals}
        days={3}
        onTotalChange={() => undefined}
        onPlanChange={() => undefined}
        onActualChange={() => undefined}
        onPrintReceipt={() => undefined}
        receiptPrinted={false}
      />,
    );

    expect(html).toContain('RM 150 Over Budget');
    expect(html).toContain('danger');
  });
});
