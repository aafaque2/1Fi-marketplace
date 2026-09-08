export type Category = 'smartphone' | 'laptop';

export interface ProductVariant {
  id: string;
  label: string; // e.g. "256GB · Titanium Blue"
  priceDelta: number; // added to product.basePrice, may be 0
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  images: string[]; // placeholder image URLs, see SPEC.md §7
  basePrice: number; // INR, price of the first/default variant
  variants: ProductVariant[];
  specs: { label: string; value: string }[];
}

export interface EMIPlan {
  id: string; // `${tenureMonths}m`
  tenureMonths: number; // 3 | 6 | 9 | 12 | 18 | 24
  monthlyAmount: number; // rounded, see SPEC.md §6
  interestRate: 0;
  totalPayable: number; // equals the variant's total price
  processingFee: 0;
}

export type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { message: string; code?: string } };

export interface CheckoutRequest {
  productId: string;
  variantId: string;
  emiPlanId: string;
}

export interface CheckoutResponse {
  orderId: string;
  status: 'confirmed';
}
