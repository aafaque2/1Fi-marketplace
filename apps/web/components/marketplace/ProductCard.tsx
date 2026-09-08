'use client';

import Image from 'next/image';
import { calculateEmiPlans } from '@1fi/shared';
import type { Product } from '@1fi/shared';
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
    <Card onClick={onClick} className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <span className="block overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          width={600}
          height={600}
          className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </span>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          {product.brand}
        </p>
        <p className="text-base font-semibold text-neutral-900">{product.name}</p>
        <p className="mt-1 text-sm text-neutral-500">
          From <PriceTag amount={product.basePrice} size="sm" />
        </p>
        {cheapest && (
          <p className="text-xs text-neutral-500">
            EMI from <PriceTag amount={cheapest.monthlyAmount} size="sm" suffix="/mo" />
          </p>
        )}
      </div>
    </Card>
  );
}
