import type { EMIPlan } from './types';

/** Default EMI tenures in months (SPEC.md §6). */
export const DEFAULT_TENURES: number[] = [3, 6, 9, 12, 18, 24];

/**
 * Build 0%-interest EMI plans for a variant total price.
 *
 * `totalPrice` is the variant's total price
 * (`product.basePrice + variant.priceDelta`).
 * `monthlyAmount` is `Math.round(totalPrice / tenureMonths)` and
 * `totalPayable` always equals `totalPrice` (0% interest, no markup).
 */
export function calculateEmiPlans(
  totalPrice: number,
  tenures: number[] = DEFAULT_TENURES,
): EMIPlan[] {
  return tenures.map((tenureMonths) => ({
    id: `${tenureMonths}m`,
    tenureMonths,
    monthlyAmount: Math.round(totalPrice / tenureMonths),
    interestRate: 0,
    totalPayable: totalPrice,
    processingFee: 0,
  }));
}
