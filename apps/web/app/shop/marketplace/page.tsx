'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Category } from '@1fi/shared';
import { Chip } from '@/components/ui/Chip';
import { ProductGrid } from '@/components/marketplace/ProductGrid';
import { useProducts } from '@/hooks/useProducts';

type Filter = 'all' | Category;

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'smartphone', label: 'Smartphones' },
  { id: 'laptop', label: 'Laptops' },
];

export default function MarketplacePage() {
  const [filter, setFilter] = useState<Filter>('all');
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useProducts(
    filter === 'all' ? undefined : filter,
  );

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-8">
      <h1 className="text-2xl font-semibold text-neutral-900">1Fi Marketplace</h1>
      <div className="flex gap-2">
        {filters.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            selected={filter === option.id}
            onClick={() => setFilter(option.id)}
          />
        ))}
      </div>
      <ProductGrid
        products={data ?? []}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onSelect={(productId) => router.push(`/shop/marketplace/${productId}`)}
      />
    </main>
  );
}
