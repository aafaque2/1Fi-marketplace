'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { use } from 'react';
import { Button } from '@/components/ui/Button';
import { EmiPlanCard } from '@/components/marketplace/EmiPlanCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useEmiPlans } from '@/hooks/useEmiPlans';

function EmiPageContent({ productId }: { productId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const variantId = searchParams.get('variantId');

  const { data: plans, isLoading, isError, refetch } = useEmiPlans(productId, variantId ?? '');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  if (!variantId) {
    router.replace(`/shop/marketplace/${productId}`);
    return null;
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 px-4 py-8">
        <Skeleton className="h-6 w-1/2" />
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </main>
    );
  }

  if (isError || !plans) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8">
        <ErrorState message="Couldn't load EMI plans. Please try again." onRetry={() => refetch()} />
      </main>
    );
  }

  if (plans.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8">
        <EmptyState
          title="No EMI plans available"
          description="There are no EMI plans for this variant right now."
        />
      </main>
    );
  }

  const selected = plans.find((p) => p.id === selectedId)
    ?? plans.find((p) => p.tenureMonths === 12)
    ?? plans[0];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-8">
      <h1 className="text-2xl font-semibold text-neutral-900">Choose your EMI plan</h1>
      <div role="radiogroup" aria-label="EMI plans" className="flex animate-fade-in flex-col gap-3">
        {plans.map((plan) => (
          <EmiPlanCard
            key={plan.id}
            plan={plan}
            selected={plan.id === selected.id}
            onSelect={() => setSelectedId(plan.id)}
          />
        ))}
      </div>
      <div className="sticky bottom-0 border-t border-neutral-200 bg-white py-3 [&>button]:w-full">
        <Button
          variant="primary"
          size="lg"
          disabled={!selected}
          onClick={() =>
            router.push(
              `/shop/marketplace/${productId}/review?variantId=${variantId}&emiPlanId=${selected.id}`,
            )
          }
        >
          Continue
        </Button>
      </div>
    </main>
  );
}

export default function EmiPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params);
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 px-4 py-8">
          <Skeleton className="h-6 w-1/2" />
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </main>
      }
    >
      <EmiPageContent productId={productId} />
    </Suspense>
  );
}
