'use client';

import { Suspense, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { PriceTag } from '@/components/ui/PriceTag';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCheckout } from '@/hooks/useCheckout';
import { useEmiPlans } from '@/hooks/useEmiPlans';
import { useProduct } from '@/hooks/useProduct';

function ReviewPageContent({ productId }: { productId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const variantId = searchParams.get('variantId');
  const emiPlanId = searchParams.get('emiPlanId');

  const productQuery = useProduct(productId);
  const plansQuery = useEmiPlans(productId, variantId ?? '');
  const checkout = useCheckout();

  if (!variantId) {
    router.replace(`/shop/marketplace/${productId}`);
    return null;
  }
  if (!emiPlanId) {
    router.replace(`/shop/marketplace/${productId}/emi?variantId=${variantId}`);
    return null;
  }

  const isLoading = productQuery.isLoading || plansQuery.isLoading;
  const isError = productQuery.isError || plansQuery.isError;

  if (isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 px-4 py-8">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-12 w-full" />
      </main>
    );
  }

  const variant = productQuery.data?.variants.find((v) => v.id === variantId);
  const plan = plansQuery.data?.find((p) => p.id === emiPlanId);

  if (isError || !productQuery.data || !variant || !plan) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8">
        <ErrorState
          message="Couldn't load your order summary. Please try again."
          onRetry={() => {
            productQuery.refetch();
            plansQuery.refetch();
          }}
        />
      </main>
    );
  }

  const product = productQuery.data;

  if (checkout.isSuccess && checkout.data) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-8">
        <Card className="flex flex-col items-center gap-2 p-8 text-center">
          <p className="text-xl font-semibold text-neutral-900">Order confirmed</p>
          <p className="text-sm text-neutral-500">
            Order ID <span className="font-medium text-neutral-900">{checkout.data.orderId}</span>
          </p>
          <p className="text-sm text-neutral-500">
            {product.name} · {variant.label} · {plan.tenureMonths} months
          </p>
          <Link href="/shop/marketplace" className="mt-2 text-sm font-medium text-brand-700">
            Back to Marketplace
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-8">
      <h1 className="text-2xl font-semibold text-neutral-900">Review &amp; confirm</h1>
      <Card className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-4">
          <Image
            src={product.images[0]}
            alt={product.name}
            width={96}
            height={96}
            className="h-24 w-24 rounded-xl object-cover"
          />
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold text-neutral-900">{product.name}</p>
            <p className="text-sm text-neutral-500">{variant.label}</p>
          </div>
        </div>
        <dl className="flex flex-col gap-2 border-t border-neutral-200 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500">Tenure</dt>
            <dd className="font-medium text-neutral-900">{plan.tenureMonths} months</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Monthly amount</dt>
            <dd>
              <PriceTag amount={plan.monthlyAmount} size="sm" suffix="/mo" />
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Total payable</dt>
            <dd>
              <PriceTag amount={plan.totalPayable} size="sm" />
            </dd>
          </div>
        </dl>
      </Card>
      {checkout.isError && (
        <ErrorState
          message="Couldn't place your order. Your summary above is unchanged — please try again."
          onRetry={() => checkout.mutate({ productId, variantId, emiPlanId })}
        />
      )}
      <div className="sticky bottom-0 border-t border-neutral-200 bg-white py-3 [&>button]:w-full">
        <Button
          variant="primary"
          size="lg"
          loading={checkout.isPending}
          onClick={() => checkout.mutate({ productId, variantId, emiPlanId })}
        >
          Proceed
        </Button>
      </div>
    </main>
  );
}

export default function ReviewPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params);
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 px-4 py-8">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-12 w-full" />
        </main>
      }
    >
      <ReviewPageContent productId={productId} />
    </Suspense>
  );
}
