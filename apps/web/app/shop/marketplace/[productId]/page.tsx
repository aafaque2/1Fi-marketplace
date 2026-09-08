'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PriceTag } from '@/components/ui/PriceTag';
import { Skeleton } from '@/components/ui/Skeleton';
import { VariantSelector } from '@/components/marketplace/VariantSelector';
import { useProduct } from '@/hooks/useProduct';
import { ApiClientError } from '@/lib/apiClient';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);
  const router = useRouter();
  const { data: product, isLoading, isError, error, refetch } = useProduct(productId);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  if (isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-8">
        <Skeleton className="aspect-square w-full" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-10 w-full" />
      </main>
    );
  }

  if (isError || !product) {
    if (error instanceof ApiClientError && error.status === 404) {
      return (
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8">
          <EmptyState
            title="Product not found"
            description="This product doesn't exist or is no longer available."
            actionLabel="Back to Marketplace"
            onAction={() => router.push('/shop/marketplace')}
          />
        </main>
      );
    }
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8">
        <ErrorState message="Couldn't load this product. Please try again." onRetry={() => refetch()} />
      </main>
    );
  }

  const selected = product.variants.find((v) => v.id === selectedId) ?? product.variants[0];
  const price = product.basePrice + selected.priceDelta;

  return (
    <main className="mx-auto flex w-full max-w-3xl animate-fade-in flex-1 flex-col gap-4 px-4 py-8">
      <Image
        src={product.images[0]}
        alt={product.name}
        width={600}
        height={600}
        className="aspect-square w-full rounded-2xl object-cover"
      />
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {product.brand}
      </p>
      <h1 className="text-2xl font-semibold text-neutral-900">{product.name}</h1>
      <PriceTag amount={price} size="lg" />
      <VariantSelector
        variants={product.variants}
        selectedId={selected.id}
        onSelect={setSelectedId}
      />
      <dl className="flex flex-col divide-y divide-neutral-200 rounded-2xl border border-neutral-200">
        {product.specs.map((spec) => (
          <div key={spec.label} className="flex justify-between gap-4 px-4 py-3">
            <dt className="text-sm text-neutral-500">{spec.label}</dt>
            <dd className="text-right text-sm font-medium text-neutral-900">{spec.value}</dd>
          </div>
        ))}
      </dl>
      <div className="sticky bottom-0 border-t border-neutral-200 bg-white py-3 [&>button]:w-full">
        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push(`/shop/marketplace/${productId}/emi?variantId=${selected.id}`)}
        >
          View EMI plans
        </Button>
      </div>
    </main>
  );
}
