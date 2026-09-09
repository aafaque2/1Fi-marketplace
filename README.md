# 1Fi Marketplace

1Fi is an Indian fintech app built around Loans Against Mutual Funds: instead of selling
their investments, users pledge mutual fund units as collateral and buy electronics on
0%-interest EMI while their money stays invested — no CIBIL check, no downpayment. This
repo is a take-home reproduction of the **1Fi Marketplace** tab inside 1Fi's Shop page,
covering the full browse → product detail → EMI plan → review/confirm flow against a
mock catalog of flagship phones and one laptop. Everything past the order button —
eligibility checks, fund pledging, payments — is intentionally mocked.

## Live links

- **Storefront:** https://1fi-marketplace-feat.vercel.app/shop/marketplace
- **Mock API:** https://onefi-marketplace-lcaw.onrender.com/api/products
- **Demo walkthrough (video):** https://www.youtube.com/watch?v=H1twU-LKS0g

Render's free tier sleeps when idle, so the first API request after a while can take
30–50s — that's the platform, not the app. Deployment notes (Vercel + Render env vars,
build commands) live in [DEPLOYMENT.md](./DEPLOYMENT.md).

## How to run it

Three npm workspaces; all commands from the repo root. The web app reads the API URL
from the environment, so start the API first.

```bash
npm install

# Terminal 1 — mock API on http://localhost:4000
# (builds shared + api, then serves the compiled output with auto-restart)
npm run dev -w apps/api

# Terminal 2 — Next.js storefront (needs the API up)
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000 npm run dev -w apps/web
```

Or `npm run dev` from the root to build `packages/shared` once and run the API and
the storefront side by side. `npm run build`, `npm run typecheck`, and `npm run lint`
(all from the root) cover every workspace.

The shared package (`packages/shared`) holds the framework-agnostic types and the
0%-interest EMI engine; both apps consume its compiled `dist/` output. The API has no
runtime TypeScript dependency — its dev script serves the compiled server the same way
production does.

## Assumptions (SPEC-silent areas)

- **Catalog stock:** the spec never mentions availability, so every seeded variant is
  `inStock: true`; the disabled-variant chip path in the UI is defensive only.
- **Unspecified API errors:** a missing `variantId` on the EMI-plans route 404s like the
  read routes; a checkout with missing fields is a 400 and with unknown ids a 404 —
  the spec only pins the success shape and the 404-for-missing-product case.
- **Error-state demos:** the API's `?simulateError=true` flag only works if the browser
  actually sends it, so the web `apiClient` forwards the flag from the page URL to API
  requests (browsers can't set headers from the URL bar, which is what the query
  variant is for). Visiting any data screen with `?simulateError=true` forces its
  error state.
- **Card EMI figure:** the listing card's "EMI from" line uses the 24-month plan from
  the same shared EMI engine the API uses, computed off `basePrice`.
- **Product photos:** catalog imagery is served locally from `public/images` — a mix of
  official product renders and freely licensed photos. Freely licensed photos don't
  exist in every SPEC colorway, so a photo may show a different finish than the
  variant label; sources are credited in `apps/web/public/images/ATTRIBUTION.md`.

## What I'd do with more time

- **UX polish and attention to detail:** micro-interactions on add-to-flow transitions,
  an animated EMI tenure slider with live monthly-amount updates, skeleton shimmer
  tuning, empty-cart/wishlist states, and a full 375px → 1280px responsive pass with
  keyboard and screen-reader review of the radio-card controls.
- **Richer motion:** page-transition choreography between listing → detail → EMI →
  review, spring-based image gallery swipes on the detail page, and animated price
  count-ups when switching variants.
- **Real database:** the API is already shaped for it — swap `products.json` for
  Postgres (Supabase/Neon) with a tiny schema (`products`, `variants`, `orders`),
  keep the `ApiEnvelope` contract untouched so the frontend doesn't change, and
  persist checkouts instead of returning a mock `orderId`. The shared types map
  1:1 to table rows, so this is a weekend-sized job.
- **API integration tests** (supertest) covering the envelope shape, the 5% failure
  path with the randomness injected, and the checkout validation branches.
