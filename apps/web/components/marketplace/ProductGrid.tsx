'use client';

import type { Product } from '@1fi/shared';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { Skeleton } from '../ui/Skeleton';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onSelect: (productId: string) => void;
}

export function ProductGrid({ products, isLoading, isError, onRetry, onSelect }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="flex flex-col gap-2 p-5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (isError) {
    return <ErrorState message="Couldn't load products. Please try again." onRetry={onRetry} />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="No products found"
        description="Try a different category."
      />
    );
  }

  return (
    <div className="grid animate-fade-in grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onClick={() => onSelect(product.id)} />
      ))}
    </div>
  );
}
