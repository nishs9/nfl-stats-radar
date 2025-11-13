// filepath: next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // other configurations...
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.www.nfl.com',
        port: '',
        pathname: '/**', // Allow all paths from NFL domain
      },
      // Add other hostnames if needed, e.g., for your placeholder
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**', 
      },
      // Allow GitHub images for team logos
      {
        protocol: 'https',
        hostname: 'github.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

module.exports = nextConfig;