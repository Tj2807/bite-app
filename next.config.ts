import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow Next.js Image optimization for local /public images (default)
    // and any external domains you may add later
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
