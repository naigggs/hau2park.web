import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['placehold.co', 'api.qrserver.com'], 
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;