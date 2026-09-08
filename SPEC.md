# 1Fi Marketplace — Spec

## 1. Product context
1Fi is an Indian fintech app whose core product is a Loan-Against-Mutual-Funds (LAMF)
0%-interest EMI shopping platform: users pick a product and an EMI tenure, get an eligibility
check, pledge mutual fund units through an RTA (CAMS/KFin/MFCentral) as collateral, and pay
off the purchase over the chosen tenure while their funds stay invested. No CIBIL check, no
downpayment, no foreclosure charges advertised. Brand color is a deep purple. The real catalog
skews toward high-ticket electronics — flagship phones and laptops.

This assignment builds the **1Fi Marketplace** tab inside the Shop page: browse → product
detail → EMI plan → review/confirm. The real eligibility-check / MF-pledge / lending flow is
explicitly out of scope (see §12) — the CTA ends at a mocked order confirmation.

## 2. Scope
**In scope** — Shop page with three entry points; Top Brands and Nearby Stores as blank
placeholders; 1Fi Marketplace fully built per §8.

**Out of scope** — see §12.

## 3. Routes (Next.js App Router)
| Route | Screen |
|---|---|
| `/shop` | Shop landing — 3 option cards |
| `/shop/top-brands` | Placeholder |
| `/shop/nearby-stores` | Placeholder |
| `/shop/marketplace` | Marketplace listing |
| `/shop/marketplace/[productId]` | Product detail |
| `/shop/marketplace/[productId]/emi?variantId=` | EMI plan selection |
| `/shop/marketplace/[productId]/review?variantId=&emiPlanId=` | Review & confirm |

Selection state (chosen variant, chosen plan) travels between the last three routes via query
string, not a global store — see §11.

## 4. Data model (`packages/shared/src/types.ts`)
```ts
export type Category = 'smartphone' | 'laptop';

export interface ProductVariant {
  id: string;
  label: string;        // e.g. "256GB · Titanium Blue"
  priceDelta: number;    // added to product.basePrice, may be 0
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  images: string[];      // placeholder image URLs, see §7
  basePrice: number;     // INR, price of the first/default variant
  variants: ProductVariant[];
  specs: { label: string; value: string }[];
}

export interface EMIPlan {
  id: string;             // `${tenureMonths}m`
  tenureMonths: number;   // 3 | 6 | 9 | 12 | 18 | 24
  monthlyAmount: number;  // rounded, see §6
  interestRate: 0;
  totalPayable: number;   // equals the variant's total price
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
```

`packages/shared` compiles to `dist/` via its own `tsc` build (see `DEPLOYMENT.md`) — both
`apps/web` and `apps/api` import the compiled output, not the raw TypeScript, so behavior is
identical in local dev and in production hosting.

## 5. API contract (`apps/api`, base path `/api`)
| Method | Path | Query/body | Response |
|---|---|---|---|
| GET | `/products` | `?category=smartphone\|laptop` (optional) | `ApiEnvelope<Product[]>` |
| GET | `/products/:id` | — | `ApiEnvelope<Product>`, 404 if missing |
| GET | `/products/:id/emi-plans` | `?variantId=` (required) | `ApiEnvelope<EMIPlan[]>` |
| POST | `/checkout` | body `CheckoutRequest` | `ApiEnvelope<CheckoutResponse>` |

**Simulated network behavior** (middleware, applies to every route):
- Random delay 400–900ms on every response, so loading states are always visible.
- If the request carries header `x-simulate-error: true` or query `?simulateError=true`,
  respond `500` with `{ ok: false, error: { message: 'Simulated failure', code: 'SIMULATED' } }`.
  This lets the frontend's error states be triggered on demand for testing/demoing.
- Independently, a 5% random chance of the same failure on any request, so retry logic gets
  exercised even without the explicit flag.

Every response — success or error — uses the `ApiEnvelope<T>` shape, alongside the matching
HTTP status code.

## 6. EMI calculation rules (`packages/shared/src/emi.ts`)
- Default tenures: `[3, 6, 9, 12, 18, 24]` months.
- 0% interest only — no other rate is supported in this assignment.
- `monthlyAmount = Math.round(totalPrice / tenureMonths)`
- `totalPayable = totalPrice` (always — 0% interest means no markup)
- `processingFee = 0`
- `totalPrice` for a plan request = `product.basePrice + variant.priceDelta`

## 7. Mock catalog (seed `apps/api/src/data/products.json`)
Illustrative prices, not live pricing — six products, two variants each, matching 1Fi's real
category focus (flagship phones + one laptop). Use a placeholder image service
(e.g. `https://placehold.co/600x600?text=iPhone+17`) rather than scraped product photography —
avoids depending on any brand's real image CDN and sidesteps using copyrighted photos.

| Product | Category | Variant A | Variant B |
|---|---|---|---|
| iPhone 17 | smartphone | 128GB Black — ₹79,900 | 256GB Blue — ₹89,900 |
| iPhone 17 Pro Max | smartphone | 256GB Titanium — ₹1,59,900 | 512GB Titanium — ₹1,79,900 |
| Samsung Galaxy S25 Ultra | smartphone | 256GB Black — ₹1,29,999 | 512GB Gray — ₹1,44,999 |
| OnePlus 15 | smartphone | 256GB Sand Storm — ₹64,999 | 512GB Storm Blue — ₹69,999 |
| Google Pixel 10 | smartphone | 128GB Obsidian — ₹74,999 | 256GB Porcelain — ₹82,999 |
| MacBook Air (M4) | laptop | 13" 256GB — ₹99,900 | 13" 512GB — ₹1,19,900 |

`basePrice` = Variant A's price; Variant B's `priceDelta` = its price minus `basePrice`.
Give each product 3–4 `specs` rows (e.g. display, chip, battery, camera/ports as relevant).

## 8. Screen specs

### 8.1 Shop landing (`/shop`)
Three cards in a row (stack on mobile): **Top Brands**, **Nearby Stores**, **1Fi Marketplace**.
Each card: icon, title, one-line subtitle, tap navigates to its route. No data fetching here.

### 8.2 Marketplace listing (`/shop/marketplace`)
- Category filter chips at top: All / Smartphones / Laptops.
- Responsive grid of `ProductCard`: image, name, brand, "From ₹X" using `basePrice`, and the
  cheapest EMI tenure's monthly amount if easily available, else just the price.
- States: skeleton grid while loading, `ErrorState` with retry on failure, `EmptyState` if a
  filter returns zero products.
- Tapping a card navigates to `/shop/marketplace/[productId]`.

### 8.3 Product detail (`/shop/marketplace/[productId]`)
- Image (first of `images`), name, brand, price recalculated for the **selected variant**
  (local `useState`, defaults to the first variant).
- `VariantSelector` — chip/segmented control over `variants`, disabled chip if `!inStock`.
- Spec list from `product.specs`.
- Sticky bottom "View EMI plans" button — navigates to
  `/shop/marketplace/[productId]/emi?variantId=<selected>`.
- States: skeleton while loading, `ErrorState` with retry, not-found state if the id doesn't
  resolve (404 from the API).

### 8.4 EMI plan selection (`/shop/marketplace/[productId]/emi`)
- Reads `variantId` from the query string; if absent, redirect back to the product detail page.
- List of `EmiPlanCard`, one per tenure from `useEmiPlans`, radio-selected (default: the
  12-month plan if present, else the first). Each card shows tenure, monthly amount, a
  "0% interest" badge, and total payable.
- Primary CTA "Continue" — disabled until a plan is selected — navigates to
  `/shop/marketplace/[productId]/review?variantId=<id>&emiPlanId=<id>`.
- States: skeleton list while loading, `ErrorState` with retry, `EmptyState` if no plans come
  back for that variant.

### 8.5 Review & confirm (`/shop/marketplace/[productId]/review`)
- Reads `variantId` and `emiPlanId` from the query string; redirect back a step if either is
  missing.
- Summary card: product name + image, chosen variant label, chosen tenure, monthly amount,
  total payable.
- Primary CTA "Proceed" triggers `useCheckout()`'s mutation with
  `{ productId, variantId, emiPlanId }`.
- On success: replace the summary with a confirmation state showing the mock `orderId` and a
  "Back to Marketplace" link.
- On failure: show `ErrorState` with retry, keep the summary visible so nothing is lost.

## 9. Design tokens (`apps/web/tailwind.config.ts`)
Derived from 1Fi's one documented brand color (`#6C28D9`) — treat this scale, the font, and
the radii as a reasonable starting assumption to verify and correct once you've inspected the
real app or its screenshots.

```ts
colors: {
  brand: {
    50:  '#F4EEFC', 100: '#E5D6F8', 200: '#CBADF1', 300: '#AD82E8',
    400: '#9160DE', 500: '#7A3FD6', 600: '#6C28D9', // base
    700: '#571FB0', 800: '#421887', 900: '#2D1160',
  },
}
```
- Font: system UI stack as a placeholder (`font-sans` default) — swap for the real app's
  typeface once confirmed.
- Radius: cards `rounded-2xl` (16px), buttons/chips `rounded-xl` (12px).
- Spacing: Tailwind's default 4px scale — no custom spacing tokens needed.

## 10. Component inventory & prop contracts

```ts
// components/ui
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
interface CardProps { children: React.ReactNode; onClick?: () => void; className?: string; }
interface ChipProps {
  label: string; selected?: boolean; disabled?: boolean; onClick?: () => void;
}
interface BadgeProps { label: string; tone?: 'brand' | 'neutral' | 'success'; }
interface PriceTagProps { amount: number; size?: 'sm' | 'md' | 'lg'; suffix?: string; } // e.g. suffix="/mo"
interface SkeletonProps { className?: string; } // a single pulsing block; compose grids from multiple
interface EmptyStateProps { title: string; description?: string; actionLabel?: string; onAction?: () => void; }
interface ErrorStateProps { message?: string; onRetry: () => void; }

// components/marketplace
interface ProductCardProps { product: Product; onClick?: () => void; }
interface ProductGridProps {
  products: Product[]; isLoading: boolean; isError: boolean;
  onRetry: () => void; onSelect: (productId: string) => void;
}
interface VariantSelectorProps {
  variants: ProductVariant[]; selectedId: string; onSelect: (variantId: string) => void;
}
interface EmiPlanCardProps { plan: EMIPlan; selected: boolean; onSelect: () => void; }
```

## 11. State management
- Server state (products, product detail, EMI plans, checkout mutation): React Query only.
- UI-local state (selected variant, selected plan before navigating): `useState` on the page
  that owns it.
- Cross-screen selection (chosen variant/plan carried to the next route): query string params,
  not a global store or context. This assignment's flow is linear enough that a global store
  would be over-engineering — call it out if a future feature genuinely needs one.

## 12. Non-goals / explicit assumptions
- No real authentication or user accounts.
- No real PAN/mobile eligibility check, no real MF pledge integration with CAMS/KFin/MFCentral.
- No real payment gateway — `/checkout` is a mock that always "confirms" (modulo the simulated
  failure behavior in §5).
- Top Brands and Nearby Stores are intentionally blank per the assignment brief.
- Single currency (INR), no i18n.
- No admin/seller-side tooling.

## 13. Definition of done
A phase is complete when: it matches the relevant section(s) above, `npm run typecheck` and
`npm run lint` pass, every data-fetching screen it touches has visible loading/error/empty
states (error verified via `?simulateError=true`), and no file was created outside the
folder map in `AGENTS.md`.

## 14. Deployment
Build scripts, hosting setup for Vercel and Render, and the CORS/env-var wiring between them
live in `DEPLOYMENT.md`, along with the EAS/Expo path if `apps/mobile` gets built later.
