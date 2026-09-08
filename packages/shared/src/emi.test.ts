import { describe, expect, it } from 'vitest';
import { calculateEmiPlans } from './emi';

describe('calculateEmiPlans', () => {
  it('divides evenly when the price splits cleanly', () => {
    const plans = calculateEmiPlans(120000, [12]);

    expect(plans).toHaveLength(1);
    expect(plans[0]).toEqual({
      id: '12m',
      tenureMonths: 12,
      monthlyAmount: 10000,
      interestRate: 0,
      totalPayable: 120000,
      processingFee: 0,
    });
  });

  it('rounds the monthly amount when the price does not split cleanly', () => {
    // 100000 / 3 = 33333.33… -> 33333; assert the exact Math.round value so
    // a change in rounding behavior fails loudly instead of hiding lost paise.
    const plans = calculateEmiPlans(100000, [3]);

    expect(plans).toHaveLength(1);
    expect(plans[0].monthlyAmount).toBe(Math.round(100000 / 3));
    expect(plans[0].monthlyAmount).toBe(33333);
    // Rounding means monthly * tenure need not equal the total…
    expect(plans[0].monthlyAmount * 3).not.toBe(100000);
    // …but the payable total still does (0% interest, no markup).
    expect(plans[0].totalPayable).toBe(100000);
  });

  it('totalPayable always equals totalPrice across the default tenures', () => {
    const totalPrice = 89900; // iPhone 17 256GB — does not divide evenly
    const plans = calculateEmiPlans(totalPrice);

    expect(plans.map((p) => p.id)).toEqual(['3m', '6m', '9m', '12m', '18m', '24m']);
    for (const plan of plans) {
      expect(plan.totalPayable).toBe(totalPrice);
      expect(plan.interestRate).toBe(0);
      expect(plan.processingFee).toBe(0);
      expect(plan.monthlyAmount).toBe(Math.round(totalPrice / plan.tenureMonths));
    }
  });
});
