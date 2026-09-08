# 1Fi Marketplace — Agent Instructions

## What this project is
A take-home assignment reproducing the "1Fi Marketplace" section inside 1Fi's Shop page —
a fintech app that lets users buy electronics on 0%-interest EMI backed by their mutual fund
holdings (Loan Against Mutual Funds / LAMF). Full product context, data model, API contract,
and screen-by-screen specs live in `SPEC.md`. Read the sections a task references before
starting. Never invent requirements `SPEC.md` doesn't cover — flag the gap instead of guessing.

## Stack (locked in — do not swap frameworks or add new ones without being asked)
- Monorepo, npm workspaces:
  - `apps/web` — Next.js 14+, App Router, TypeScript
  - `apps/api` — Express, TypeScript
  - `packages/shared` — framework-agnostic types + business logic, plain TypeScript only.
    No React, no Express, no DOM APIs in this package — a React Native app may be added
    later under `apps/mobile` and will import this same package unchanged.
- Styling: Tailwind CSS in `apps/web`. Tokens are defined in `apps/web/tailwind.config.ts`
  per `SPEC.md` §9 — never hardcode a hex color in a component.
- Data fetching: `@tanstack/react-query` in `apps/web`. Components never call `fetch`
  directly — always through a hook in `apps/web/hooks/`.

## Conventions
- TypeScript strict mode. No `any`, no implicit `any`.
- Functional components, named exports, one component per file. PascalCase filenames for
  components, camelCase for hooks/utils/routes.
- No data fetching or business logic inside screen (`page.tsx`) components — screens compose
  hooks and presentational components only.
- Every screen that fetches data renders three states: loading (skeleton), error (message +
  retry), empty (friendly empty state). Never ship just the happy path.
- Currency is INR, formatted with
  `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })`
  — never a hand-built `₹${n}` string.
- Commit small and often: one logical change per commit, message says what and why.

## Commands
- `npm run dev` (root) — runs `apps/web` and `apps/api` together
- `npm run dev -w apps/api` / `npm run dev -w apps/web` — run one at a time
- `npm run typecheck` and `npm run lint` (root) — run both before calling any task done

## Folder map — put new files exactly here, don't restructure
```
apps/web/app/shop/page.tsx                                Shop landing (3 option cards)
apps/web/app/shop/top-brands/page.tsx                      Blank placeholder
apps/web/app/shop/nearby-stores/page.tsx                   Blank placeholder
apps/web/app/shop/marketplace/page.tsx                     Marketplace listing
apps/web/app/shop/marketplace/[productId]/page.tsx         Product detail
apps/web/app/shop/marketplace/[productId]/emi/page.tsx     EMI plan selection
apps/web/app/shop/marketplace/[productId]/review/page.tsx  Review & confirm
apps/web/components/ui/*            Button, Card, Chip, Badge, PriceTag, Skeleton,
                                     EmptyState, ErrorState
apps/web/components/marketplace/*   ProductCard, ProductGrid, VariantSelector, EmiPlanCard
apps/web/hooks/*                    useProducts, useProduct, useEmiPlans, useCheckout
apps/web/lib/apiClient.ts           Typed fetch wrapper, base URL from env
apps/api/src/routes/*               products.ts, emiPlans.ts, checkout.ts
apps/api/src/data/products.json     Seed catalog
packages/shared/src/types.ts        Product, ProductVariant, EMIPlan, ApiEnvelope<T>
packages/shared/src/emi.ts          calculateEmiPlans()
```

## Deployment
Hosting setup (Vercel for `apps/web`, Render for `apps/api`, EAS for `apps/mobile` if it
gets built) and the build scripts they depend on live in `DEPLOYMENT.md` — read it before
touching any `package.json` build/start scripts or tsconfig `outDir`/`rootDir` settings.

## Before every task
1. Read the `SPEC.md` section(s) named in the prompt.
2. Check the folder map above — new files go exactly where they belong.
3. Match `SPEC.md` §9 design tokens exactly. No invented colors, spacing, or radii.
4. If the prompt conflicts with `SPEC.md`, say so in your response rather than silently
   picking one interpretation.
5. Output complete file contents, not partial diffs, unless the task says otherwise.
