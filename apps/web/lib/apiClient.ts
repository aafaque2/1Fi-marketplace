import type {
  ApiEnvelope,
  CheckoutRequest,
  CheckoutResponse,
  EMIPlan,
  Product,
} from '@1fi/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export class ApiClientError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${withSimulateError(path)}`, init);
  } catch (error) {
    throw new ApiClientError(
      error instanceof Error ? error.message : 'Network request failed',
      0,
    );
  }

  let envelope: ApiEnvelope<T>;
  try {
    envelope = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiClientError(`Request failed with status ${res.status}`, res.status);
  }

  if (!envelope.ok) {
    throw new ApiClientError(envelope.error.message, res.status, envelope.error.code);
  }
  return envelope.data;
}

/**
 * Forwards `?simulateError=true` from the page URL to the API request so the
 * frontend's error states can be triggered on demand (SPEC.md §5, §13).
 * Browsers can't set request headers from the URL bar, which is what the
 * API's query-flag variant is for. No-op during SSR and when the flag is
 * absent.
 */
function withSimulateError(path: string): string {
  if (typeof window === 'undefined') return path;
  const flag = new URLSearchParams(window.location.search).get('simulateError');
  if (flag !== 'true' || path.includes('simulateError=')) return path;
  return `${path}${path.includes('?') ? '&' : '?'}simulateError=true`;
}

export function getProducts(category?: string): Promise<Product[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  return request<Product[]>(`/api/products${query}`);
}

export function getProduct(productId: string): Promise<Product> {
  return request<Product>(`/api/products/${encodeURIComponent(productId)}`);
}

export function getEmiPlans(productId: string, variantId: string): Promise<EMIPlan[]> {
  return request<EMIPlan[]>(
    `/api/products/${encodeURIComponent(productId)}/emi-plans?variantId=${encodeURIComponent(variantId)}`,
  );
}

export function postCheckout(body: CheckoutRequest): Promise<CheckoutResponse> {
  return request<CheckoutResponse>('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
