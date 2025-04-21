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
        pathname: '/image/private/**', // Adjust pathname if needed, this allows any path under /image/private/
      },
      // Add other hostnames if needed, e.g., for your placeholder
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**', 
      }
    ],
  },
};

module.exports = nextConfig;