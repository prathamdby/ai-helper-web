import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  // Configure Vercel Analytics
  analytics: {
    // Enable debug mode in development
    debug: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
