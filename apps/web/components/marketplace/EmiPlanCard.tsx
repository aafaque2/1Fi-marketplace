'use client';

import type { EMIPlan } from '@1fi/shared';
import { Badge } from '../ui/Badge';
import { PriceTag } from '../ui/PriceTag';

interface EmiPlanCardProps {
  plan: EMIPlan;
  selected: boolean;
  onSelect: () => void;
}

export function EmiPlanCard({ plan, selected, onSelect }: EmiPlanCardProps) {
  return (
    <div
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border bg-white p-4 transition-colors ${
        selected ? 'border-brand-600' : 'border-neutral-200 hover:border-brand-400'
      }`}
    >
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-neutral-900">
          {plan.tenureMonths} months
        </p>
        <PriceTag amount={plan.monthlyAmount} size="md" suffix="/mo" />
        <p className="text-xs text-neutral-500">
          Total <PriceTag amount={plan.totalPayable} size="sm" />
        </p>
      </div>
      <Badge label="0% interest" tone={selected ? 'brand' : 'neutral'} />
    </div>
  );
}
