import type { NextConfig } from "next";
import path from "node:path";

// `@1fi/shared` resolves by package name when workspace hoisting is in
// place, but some checkouts (e.g. Vercel with an `apps/web` root directory
// doing a standalone install) have no hoisted link. Resolve it to the
// compiled output `prebuild` produces so the build never depends on hoisting.
const sharedEntry = path.join(__dirname, "../../packages/shared/dist/index.js");

type WebpackChain = NonNullable<NextConfig["webpack"]>;

const withSharedAlias: WebpackChain = (config) => {
  config.resolve = {
    ...config.resolve,
    alias: { ...config.resolve?.alias, "@1fi/shared": sharedEntry },
  };
  return config;
};

const nextConfig: NextConfig = {
  // Catalog imagery is served locally from public/images — no external
  // image dependency (SPEC.md §7 intent: no brand CDN, no copyrighted
  // photos, and placehold.co no longer serves optimizer-compatible PNGs).
  turbopack: {
    resolveAlias: {
      "@1fi/shared": sharedEntry,
    },
  },
  // Only for explicit webpack builds (`next build --webpack`): Next 16
  // fails Turbopack builds that carry a custom `webpack` key, so this is
  // added only when the flag is present.
  ...(process.argv.includes("--webpack") ? { webpack: withSharedAlias } : {}),
};

export default nextConfig;
