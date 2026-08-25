import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "react-markdown", "react-zoom-pan-pinch"],
  },
};

export default nextConfig;

