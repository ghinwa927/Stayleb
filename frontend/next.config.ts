import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Property photos are served by ImageKit; hero/marketing art is local
    // (public/). External property images render via LocalImage with
    // unoptimized, but keep the allowlist tight for any optimized usage.
    // Covers the ImageKit default hosts; add a custom CNAME here only if
    // IMAGEKIT_URL_ENDPOINT is ever moved to one.
    remotePatterns: [
      { protocol: "https", hostname: "ik.imagekit.io" },
      { protocol: "https", hostname: "imagekit.io" },
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
