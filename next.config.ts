import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // allow unsplash images
   images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
  },
};

export default nextConfig;
