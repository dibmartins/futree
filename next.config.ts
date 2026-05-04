import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@imgly/background-removal-node", "onnxruntime-node"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
