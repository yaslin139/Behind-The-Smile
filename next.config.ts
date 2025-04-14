import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['upload.wikimedia.org'],
    unoptimized: true,
  },
};

export default nextConfig;
