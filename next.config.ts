import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The local preview proxy keeps this host in the HMR Origin header.
  // Allow that exact development host; never allow arbitrary origins.
  allowedDevOrigins: ["terminal.local"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};
export default nextConfig;
