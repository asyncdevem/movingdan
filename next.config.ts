import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark firebase-admin and its dependencies as external
      config.externals = [...(config.externals || []), 'firebase-admin'];
    }
    return config;
  },
};

export default nextConfig;
