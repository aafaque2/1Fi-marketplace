'use client';

import Image from 'next/image';
import { calculateEmiPlans } from '@1fi/shared';
import type { Product } from '@1fi/shared';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { PriceTag } from '../ui/PriceTag';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  // Cheapest monthly amount = longest tenure's plan, when easily available.
  const plans = calculateEmiPlans(product.basePrice);
  const cheapest = plans[plans.length - 1];

  return (
    <Card onClick={onClick} className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <span className="block overflow-hidden bg-neutral-50">
        <Image
          src={product.images[0]}
          alt={product.name}
          width={600}
          height={600}
          className="aspect-square w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </span>
      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            {product.brand}
          </p>
          <Badge label="0% interest" tone="neutral" />
        </div>
        <p className="text-lg font-semibold leading-snug text-neutral-900">{product.name}</p>
        <div className="mt-auto flex items-baseline justify-between gap-2 pt-2">
          <p className="text-sm text-neutral-500">
            From <PriceTag amount={product.basePrice} size="md" />
          </p>
        </div>
        {cheapest && (
          <p className="text-xs text-neutral-500">
            EMI from <PriceTag amount={cheapest.monthlyAmount} size="sm" suffix="/mo" />
          </p>
        )}
      </div>
    </Card>
  );
}
