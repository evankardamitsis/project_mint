import type { NextConfig } from "next";

/** Matches listing uploads: MAX_LISTING_IMAGES × LISTING_IMAGE_MAX_BYTES + multipart overhead. */
const LISTING_ACTION_BODY_LIMIT = "55mb";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: LISTING_ACTION_BODY_LIMIT,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
