import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // @ts-ignore
    allowedDevOrigins: ['localhost:3000', '192.168.29.146:3000', '192.168.29.146'],
  },
};

export default nextConfig;
