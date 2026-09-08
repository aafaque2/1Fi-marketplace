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
          <Skeleton key={index} className="aspect-[3/4] w-full" />
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
    <div className="grid animate-fade-in grid-cols-2 gap-4 md:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onClick={() => onSelect(product.id)} />
      ))}
    </div>
  );
}
