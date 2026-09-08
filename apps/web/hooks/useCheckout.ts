'use client';

import { useMutation } from '@tanstack/react-query';
import type { CheckoutRequest } from '@1fi/shared';
import { postCheckout } from '../lib/apiClient';

export function useCheckout() {
  return useMutation({
    mutationFn: (body: CheckoutRequest) => postCheckout(body),
  });
}
