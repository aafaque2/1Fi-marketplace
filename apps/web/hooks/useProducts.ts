'use client';

import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../lib/apiClient';

export function useProducts(category?: string) {
  return useQuery({
    queryKey: ['products', category ?? 'all'],
    queryFn: () => getProducts(category),
  });
}
