/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'openweathermap.org',
      },
    ],
  },

  // Optional: if you want to force deployment even with lint errors
  eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
