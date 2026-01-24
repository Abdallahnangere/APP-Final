// next.config.pwa.mjs - PWA Optimization Configuration
// This file contains production-ready PWA optimizations

import withPWA from 'next-pwa';

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['placehold.co', 'picsum.photos'],
  },
  output: 'standalone',
  
  // Production optimizations
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,
  
  // Headers for PWA
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          }
        ]
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/'
          }
        ]
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/?source=web',
        permanent: false,
      }
    ];
  }
};

// Uncomment below when next-pwa is installed
// export default withPWA({
//   dest: 'public',
//   register: true,
//   skipWaiting: false,
//   sw: 'sw.js',
//   ...nextConfig
// });

export default nextConfig;
