import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dev resources to load over the LAN IP and the localtunnel host,
  // otherwise Next blocks /_next/* cross-origin and the page renders blank.
  allowedDevOrigins: ["192.168.1.33", "*.loca.lt"],

  // Allow images from Supabase storage and Omise CDN (QR codes)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co"  },
      { protocol: "https", hostname: "*.supabase.in"  },
      { protocol: "https", hostname: "api.omise.co"   },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff"           },
          { key: "X-Frame-Options",           value: "SAMEORIGIN"        },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
