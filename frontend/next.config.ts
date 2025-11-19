import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
  eslint: {
    // During production builds, ignore ESLint warnings
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
