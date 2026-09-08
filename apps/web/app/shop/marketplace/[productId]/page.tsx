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
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          <Skeleton className="aspect-square w-full" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <Skeleton className="h-32 w-full" />
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
  // Each product seeds images in variant order, so the photo follows the selection.
  const selectedIndex = Math.max(
    0,
    product.variants.findIndex((v) => v.id === selected.id),
  );
  const image = product.images[selectedIndex] ?? product.images[0];

  return (
    <main className="mx-auto flex w-full max-w-5xl animate-fade-in flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <Image
          key={selected.id}
          src={image}
          alt={`${product.name} — ${selected.label}`}
          width={600}
          height={600}
          className="aspect-square w-full animate-fade-in rounded-2xl bg-neutral-50 object-contain"
        />
        <div className="flex flex-col items-start gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            {product.brand}
          </p>
          <h1 className="text-3xl font-semibold text-neutral-900">{product.name}</h1>
          <PriceTag amount={price} size="lg" />
          <p className="text-sm font-medium text-neutral-700">Choose a variant</p>
          <VariantSelector
            variants={product.variants}
            selectedId={selected.id}
            onSelect={setSelectedId}
          />
          <p className="text-xs text-neutral-500">
            {selected.label} · {selected.inStock ? 'In stock' : 'Out of stock'}
          </p>
        </div>
      </div>
      <dl className="flex flex-col divide-y divide-neutral-200 rounded-2xl border border-neutral-200">
        {product.specs.map((spec) => (
          <div key={spec.label} className="flex justify-between gap-4 px-5 py-3.5">
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
