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
        headers: [
          // Keep the preview out of search engines until company approval.
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Restrict framing without blocking the existing Next.js scripts, styles or fonts.
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};
export default nextConfig;
