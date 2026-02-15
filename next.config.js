/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mnogoknig.com',
      },
      {
        protocol: 'https',
        hostname: '**.mnogoknig.com',
      },
    ],
  },
};

module.exports = nextConfig;
