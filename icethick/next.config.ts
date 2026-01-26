import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use static export for production deployment to Azure Static Web Apps
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Trailing slash ensures proper routing in static export
  trailingSlash: true,
};

export default nextConfig;
