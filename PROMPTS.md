# Build prompts — 1Fi Marketplace

Use these with `AGENTS.md` and `SPEC.md` sitting at the repo root. opencode loads `AGENTS.md`
automatically every session; each prompt below tells the agent which `SPEC.md` sections to
read for that specific task.

## Notes on the model lineup
Worth knowing before you start: these aren't small models you need to baby. Big Pickle is an
unreleased stealth model OpenCode is running free while it collects feedback. Muse Spark 1.3
is Meta's agentic coding model with a 1M-token context window, purpose-built for long-running
multi-step coding work. Hy3 is Tencent's large reasoning mixture-of-experts model. They're
free or cheap because they're new/experimental tiers, not because they're weak — so don't
dumb the prompts down further than what's below. Do still verify each phase's output before
moving on, since stealth/contributor tiers can be inconsistent session to session.

Practical rotation strategy:
- Start a fresh opencode session per phase — a focused context beats one giant session
  regardless of which model is behind it.
- Since `AGENTS.md` auto-loads and every prompt names its `SPEC.md` sections explicitly,
  switching models between phases won't lose consistency.
- After each phase, skim the diff (or hand it back to any model and ask "does this match
  SPEC.md §X?") before committing. Commit after it passes — that's your rollback point if a
  later phase goes sideways.
- If a model invents an API, prop, or screen that isn't in `SPEC.md`, that's the signal to
  stop and re-run the phase fresh rather than let it improvise. `SPEC.md` is the single
  source of truth on purpose.

---

## Phase 0 — Bootstrap (do this yourself; scaffolding is more reliable by hand than by prompt)

```bash
mkdir 1fi-marketplace && cd 1fi-marketplace
git init
npm init -y
# edit package.json: add "private": true, "workspaces": ["apps/*", "packages/*"]

mkdir -p packages/shared/src
(cd packages/shared && npm init -y)

mkdir -p apps/api/src
(cd apps/api && npm init -y \
  && npm install express cors \
  && npm install -D typescript ts-node-dev @types/express @types/cors @types/node \
  && npx tsc --init)

npx create-next-app@latest apps/web --typescript --tailwind --eslint --app --import-alias "@/*"
(cd apps/web && npm install @tanstack/react-query)
```

Drop `AGENTS.md`, `SPEC.md`, and this file at the repo root, commit, then start Phase 1.

---

## Phase 1 — Shared types & EMI engine

```
Read AGENTS.md and SPEC.md sections 4 (Data model) and 6 (EMI calculation rules) before
starting.

Task: implement packages/shared exactly as described.

Create:
- packages/shared/package.json (name "@1fi/shared", main "src/index.ts")
- packages/shared/src/types.ts — Product, ProductVariant, EMIPlan, ApiEnvelope<T>, exactly
  as defined in SPEC.md §4
- packages/shared/src/emi.ts — export function calculateEmiPlans(totalPrice: number,
  tenures?: number[]): EMIPlan[] implementing SPEC.md §6
- packages/shared/src/index.ts — re-export everything from types.ts and emi.ts
- packages/shared/tsconfig.json — strict mode on

Do not add React, Express, or any framework dependency here — this package must stay pure
TypeScript so a future React Native app can import it unchanged.

Also write packages/shared/src/emi.test.ts with unit tests covering: a price that divides
evenly, a price that doesn't (check the rounding), and that totalPayable always equals
totalPrice. Use vitest or node:test, your choice.

Output complete file contents, not diffs. List every file you created.
```

---

## Phase 2 — Express mock API

```
Read AGENTS.md and SPEC.md §5 (API contract) and §7 (mock catalog) before starting.
packages/shared already exists — import types and calculateEmiPlans from it, don't redefine
them.

Task: implement apps/api exactly matching SPEC.md §5.

Create:
- apps/api/src/data/products.json — seeded with the 6 products from SPEC.md §7, verbatim
- apps/api/src/middleware/simulateNetwork.ts — 400-900ms random delay on every response;
  short-circuits to the simulated-failure response if header x-simulate-error: true or query
  ?simulateError=true is present, plus an independent 5% random chance of the same failure
- apps/api/src/routes/products.ts — GET /api/products (optional ?category=), GET
  /api/products/:id
- apps/api/src/routes/emiPlans.ts — GET /api/products/:id/emi-plans?variantId=
- apps/api/src/routes/checkout.ts — POST /api/checkout
- apps/api/src/server.ts — wires it together, listens on process.env.PORT || 4000, cors
  enabled for the web app's origin

Every response — success or error — uses the ApiEnvelope<T> shape alongside the correct HTTP
status code (200/404/500).

Output complete file contents. List every file you created and give me the exact curl command
to test GET /api/products.
```

---

## Phase 3 — Design tokens & base UI components

```
Read AGENTS.md and SPEC.md §9 (design tokens) and §10 (component inventory). apps/web is
already scaffolded with Next.js + Tailwind — don't re-run create-next-app.

Task:
- apps/web/tailwind.config.ts — extend theme.colors with the brand purple scale from
  SPEC.md §9
- apps/web/components/ui/Button.tsx
- apps/web/components/ui/Card.tsx
- apps/web/components/ui/Chip.tsx
- apps/web/components/ui/Badge.tsx
- apps/web/components/ui/PriceTag.tsx
- apps/web/components/ui/Skeleton.tsx
- apps/web/components/ui/EmptyState.tsx
- apps/web/components/ui/ErrorState.tsx

Follow the prop contracts in SPEC.md §10 exactly — don't add or rename props. PriceTag must
use Intl.NumberFormat('en-IN', ...) per AGENTS.md, not a manual ₹ string. ErrorState must
accept onRetry and render a retry button.

Pure presentational components only — no data fetching, no business logic. Output complete
file contents. List every file you created.
```

---

## Phase 4 — API client & data hooks

```
Read AGENTS.md and SPEC.md §5 (API contract) and §11 (state management). apps/api and
packages/shared already exist — do not modify them in this task.

Task:
- apps/web/lib/apiClient.ts — typed fetch wrapper. Base URL from
  process.env.NEXT_PUBLIC_API_BASE_URL, default http://localhost:4000. Returns unwrapped
  data on ok:true; throws a typed ApiClientError (message + status) on ok:false or a network
  failure.
- apps/web/hooks/useProducts.ts — GET /api/products via React Query, optional category filter
- apps/web/hooks/useProduct.ts — GET /api/products/:id
- apps/web/hooks/useEmiPlans.ts — GET /api/products/:id/emi-plans?variantId=
- apps/web/hooks/useCheckout.ts — POST /api/checkout as a React Query mutation
- apps/web/app/providers.tsx — QueryClientProvider, mounted in apps/web/app/layout.tsx

Every hook exposes React Query's default shape ({ data, isLoading, isError, error, refetch })
— don't rename them. No UI in this task, hooks and the client only.

Output complete file contents. List every file you created.
```

---

## Phase 5 — Shop landing & Marketplace listing

```
Read AGENTS.md and SPEC.md §3 (routes), §8.1-8.2 (Shop landing and Marketplace listing
specs), §10 (component contracts). Components from Phase 3 and hooks from Phase 4 already
exist — reuse them, don't rebuild them.

Task:
- apps/web/app/shop/page.tsx — three option cards (Top Brands, Nearby Stores,
  1Fi Marketplace) per SPEC.md §8.1
- apps/web/app/shop/top-brands/page.tsx — minimal placeholder (heading + EmptyState
  "Coming soon")
- apps/web/app/shop/nearby-stores/page.tsx — same pattern
- apps/web/components/marketplace/ProductCard.tsx — per SPEC.md §10
- apps/web/components/marketplace/ProductGrid.tsx — responsive grid of ProductCard, handles
  loading (skeleton grid), error (ErrorState + retry), empty (EmptyState) internally
- apps/web/app/shop/marketplace/page.tsx — useProducts() + ProductGrid, category filter chips
  at top using Chip

Follow SPEC.md §8.2 exactly for what's shown on each card and filter behavior. Output
complete file contents. List every file you created.
```

---

## Phase 6 — Product detail

```
Read AGENTS.md and SPEC.md §8.3 (product detail spec) and §10. Use useProduct() from Phase 4.

Task:
- apps/web/components/marketplace/VariantSelector.tsx — per SPEC.md §10
- apps/web/app/shop/marketplace/[productId]/page.tsx — image, name, brand, price recalculated
  for the selected variant, VariantSelector, spec list, sticky "View EMI plans" CTA that
  navigates to the emi route with the selected variantId in the query string. Handle
  loading/error/not-found states per AGENTS.md.

Selected-variant state is local (useState) to this page, not global. Output complete file
contents. List every file you created.
```

---

## Phase 7 — EMI plan selection & Review/confirm

```
Read AGENTS.md and SPEC.md §8.4-8.5 (EMI selection and review specs) and §10. Use
useEmiPlans() and useCheckout() from Phase 4.

Task:
- apps/web/components/marketplace/EmiPlanCard.tsx — per SPEC.md §10, radio-selectable
- apps/web/app/shop/marketplace/[productId]/emi/page.tsx — reads variantId from the query
  string (redirect to product detail if absent); lists EmiPlanCard per SPEC.md §8.4; CTA
  navigates to the review route with variantId + emiPlanId
- apps/web/app/shop/marketplace/[productId]/review/page.tsx — reads variantId + emiPlanId
  (redirect a step back if either is missing); summary per SPEC.md §8.5; CTA calls
  useCheckout(); success state shows the mock orderId; failure state shows ErrorState with
  retry while keeping the summary visible

Carry selection state between these routes via the query string, not global state, per
SPEC.md §11. Output complete file contents. List every file you created.
```

---

## Phase 8 — Polish pass

```
Read AGENTS.md and SPEC.md §13 (definition of done) in full before starting. Do not add new
screens or features here — only fix and document what already exists.

Task:
1. Walk every route in SPEC.md §3 and confirm it has a working loading, error (trigger with
   ?simulateError=true against the API), and empty state where applicable — fix any that
   don't.
2. Check layout at 375px and 1280px widths for every screen — fix overflow or cramped
   spacing.
3. Run npm run typecheck and npm run lint at the root and fix everything reported.
4. Write the root README.md: what this project is (one paragraph, your own words, based on
   SPEC.md §1), how to run it (all three workspaces), an assumptions section listing anything
   SPEC.md left ambiguous, and a short "what I'd do with more time" section.

List every file you changed and paste the final output of npm run typecheck and npm run lint.
```

---

## Phase 9 — Deployment prep

```
Read DEPLOYMENT.md §0 in full before starting. Do not change anything about app behavior in
this task — only build tooling.

Task: make every workspace buildable to plain JS the way DEPLOYMENT.md §0 specifies.

- packages/shared/tsconfig.json — outDir "dist", rootDir "src", declaration true, per
  DEPLOYMENT.md §0
- packages/shared/package.json — set main/types to the dist paths, add build/dev/typecheck
  scripts exactly as shown
- apps/api/tsconfig.json — same shape, rootDir "src", outDir "dist"
- apps/api/package.json — add/confirm dev/build/start/typecheck scripts exactly as shown;
  server.ts must read process.env.PORT (Render sets this) and process.env.CORS_ORIGIN for
  the cors() origin, both with sensible local-dev defaults
- Root package.json — add the dev/build/typecheck/lint scripts exactly as shown, add
  concurrently as a devDependency

Verify locally: npm run build at the root must succeed end to end (shared, then api, then
web), and node apps/api/dist/server.js must boot and serve GET /api/products without
ts-node-dev in the loop.

Output complete file contents for anything you change. List every file you touched, and
paste the output of npm run build run from the repo root.
```
