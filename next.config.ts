import type { NextConfig } from "next";
import path from "path";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }],
  },
  // Default Server Action body limit is 1MB — too small for photo uploads.
  // Kept under Vercel's own ~4.5MB hard cap for server-side function uploads.
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default withPayload(nextConfig);
