import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Required for Docker deployment
  serverExternalPackages: [
    "@azure/monitor-opentelemetry",
    "@opentelemetry/api",
    "@opentelemetry/sdk-node",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
