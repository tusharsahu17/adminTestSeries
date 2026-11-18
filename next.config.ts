import type { NextConfig } from "next";

const backendUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5001').replace(/\/+$/, '');

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "192.168.1.52",
    "192.168.68.46",
    "192.168.1.111"
  ],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
