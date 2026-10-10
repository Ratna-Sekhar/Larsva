import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdfjs-dist'],
  images: {
    // Add any external image domains here if needed
    // e.g., domains: ['example.com'],
  },
  async redirects() {
    return [];
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';
    const cleanUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
    return [
      {
        source: '/api/hrdocforensics/:path*',
        destination: `${cleanUrl}/api/hrdocforensics/:path*`, // Proxy to Python backend
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
