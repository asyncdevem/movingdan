import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['jose'],
  turbopack: {},
};

export default nextConfig;
