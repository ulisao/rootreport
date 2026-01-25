import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.convex.cloud", // Permite imágenes de Convex Storage
      },
      {
        protocol: "https",
        hostname: "img.clerk.com", // Permite avatares de Clerk
      },
    ],
  },
};

export default nextConfig;