import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // allow unsplash images
   images: {
    domains: ['images.unsplash.com'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
  },
};

export default nextConfig;
