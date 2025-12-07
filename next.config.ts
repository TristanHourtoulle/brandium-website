import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable gzip compression
  compress: true,

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Optimize package imports (tree-shaking)
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },

  // Production optimizations
  ...(process.env.NODE_ENV === "production" && {
    compiler: {
      removeConsole: {
        exclude: ["error", "warn"],
      },
    },
  }),
};

export default nextConfig;
