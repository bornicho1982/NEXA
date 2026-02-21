import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Allow Bungie.net images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.bungie.net",
        pathname: "/**",
      },
    ],
  },

  // PWA headers
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
