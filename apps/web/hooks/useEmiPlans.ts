'use client';

import { useQuery } from '@tanstack/react-query';
import { getEmiPlans } from '../lib/apiClient';

export function useEmiPlans(productId: string, variantId?: string) {
  return useQuery({
    queryKey: ['emi-plans', productId, variantId],
    queryFn: () => getEmiPlans(productId, variantId ?? ''),
    enabled: productId !== '' && (variantId ?? '') !== '',
  });
}
