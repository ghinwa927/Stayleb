import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async redirects() {
    return [
      { source: "/login", destination: "/auth/login", permanent: false },
      { source: "/register", destination: "/auth/register", permanent: false },
      { source: "/register/owner", destination: "/auth/register/owner", permanent: false },
      { source: "/forgot-password", destination: "/auth/forgot-password", permanent: false },
      { source: "/forgot-password/verify", destination: "/auth/verify", permanent: false },
      { source: "/verify", destination: "/auth/verify", permanent: false },
      { source: "/reset-password", destination: "/auth/reset-password", permanent: false },
      { source: "/reset-password/success", destination: "/auth/reset-success", permanent: false },
    ];
  },
};

export default nextConfig;
