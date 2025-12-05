import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Enable compression for smaller response sizes
  compress: true,

  // Disable source maps in production for smaller bundles
  productionBrowserSourceMaps: false,

  webpack: (config, { dev, isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };

    // Production optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: true,
      };
    }

    return config;
  },

  eslint: {
    // During production builds, ignore ESLint warnings
    ignoreDuringBuilds: true,
  },

  images: {
    // Enable modern image formats for better compression
    formats: ["image/avif", "image/webp"],

    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Cache optimized images for 7 days
    minimumCacheTTL: 60 * 60 * 24 * 7,

    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "maps.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "places.googleapis.com",
        pathname: "/**",
      },
    ],
  },

  // Experimental features for performance
  experimental: {
    // Optimize package imports for tree shaking
    optimizePackageImports: ["lucide-react", "date-fns", "@headlessui/react"],
  },
};

export default nextConfig;
