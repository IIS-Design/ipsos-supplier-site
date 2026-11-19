import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/supplier",
  output: "standalone",
  poweredByHeader: false,
  trailingSlash: true,
  experimental: {
    agentUpgrade: "security",
  },
};

export default nextConfig;
