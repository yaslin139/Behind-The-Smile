import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    domains: ['upload.wikimedia.org'],
    unoptimized: true,
  },
};

export default nextConfig;
