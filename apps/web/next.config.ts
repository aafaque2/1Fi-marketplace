import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Placeholder catalog imagery (SPEC.md §7) — no brand CDN dependency.
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'placehold.co' }],
  },
};

export default nextConfig;
