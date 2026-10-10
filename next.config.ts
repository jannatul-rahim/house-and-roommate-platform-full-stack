import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [60, 75, 85],
    remotePatterns: [
      // Curated fallback photography for properties without uploads.
      { protocol: "https", hostname: "images.unsplash.com" },
      // Profile pictures uploaded through the API land in Cloudflare R2.
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      // Property photos uploaded through the API are hosted on Cloudinary.
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
