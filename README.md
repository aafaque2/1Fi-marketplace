# 1Fi Marketplace

1Fi is an Indian fintech app built around Loans Against Mutual Funds: instead of selling
their investments, users pledge mutual fund units as collateral and buy electronics on
0%-interest EMI while their money stays invested — no CIBIL check, no downpayment. This
repo is a take-home reproduction of the **1Fi Marketplace** tab inside 1Fi's Shop page,
covering the full browse → product detail → EMI plan → review/confirm flow against a
mock catalog of flagship phones and one laptop. Everything past the order button —
eligibility checks, fund pledging, payments — is intentionally mocked.

## How to run it

Three workspaces, all commands from the repo root. Start the API first — the web app
reads its URL from the environment.

```bash
npm install

# Terminal 1 — mock API on http://localhost:4000
npm run dev -w apps/api

# Terminal 2 — Next.js storefront (needs the API up)
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000 npm run dev -w apps/web
```

The shared package (`packages/shared`) holds the framework-agnostic types and the
0%-interest EMI engine; both apps consume its compiled `dist/` output, so build it
before the others if you ever clean the tree: `npm run build -w packages/shared`.
Per-workspace checks: `npm run typecheck -w packages/shared`, `npx tsc --noEmit -p
apps/api/tsconfig.json`, and inside `apps/web`, `npx tsc --noEmit` plus `npx eslint`.

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
- **Toolchain gaps left for later:** `ts-node-dev` (Phase 0) can't boot under the
  installed TypeScript 6 defaults, so the API is verified via its compiled `dist/`
  output; root `typecheck`/`lint` scripts don't exist yet (a Phase 9 job), so each
  workspace is checked individually. The `tailwind.config.ts` token file is loaded
  into the Tailwind v4 pipeline via `@config` in `globals.css`.

## What I'd do with more time

- Real device/browser pass at 375px and 1280px (layout here was reviewed statically),
  plus keyboard and screen-reader review of the radio-card controls.
- A loading skeleton that mirrors the card layout instead of plain blocks, and image
  `sizes` tuning for the product grid.
- API integration tests (supertest) covering the envelope shape, the 5% failure path
  with the randomness injected, and the checkout validation branches.
- Formalize the `@1fi/shared` dependency in the app `package.json` files instead of
  relying on workspace hoisting, and replace the API dev runner so `npm run dev`
  works uniformly everywhere.
