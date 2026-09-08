import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Catalog imagery is served locally from public/images — no external
  // image dependency (SPEC.md §7 intent: no brand CDN, no copyrighted
  // photos, and placehold.co no longer serves optimizer-compatible PNGs).
};

export default nextConfig;
