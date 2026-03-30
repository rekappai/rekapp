import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/robots.txt', destination: '/api/robots' },
      { source: '/sitemap.xml', destination: '/api/sitemap' },
    ]
  },
};
export default nextConfig;
