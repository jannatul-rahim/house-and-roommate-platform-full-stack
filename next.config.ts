import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [60, 75, 85],
    remotePatterns: [
      // Curated listing photography (the API stores no property photos).
      { protocol: "https", hostname: "images.unsplash.com" },
      // Profile pictures uploaded through the API land in Cloudflare R2.
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
