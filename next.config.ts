import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  // Enables static optimization for pages without data fetching
  reactStrictMode: true,
};

export default nextConfig;
