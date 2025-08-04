/** @type {import('next').NextConfig} */
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

const config = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BUILD_ENV: process.env.NODE_ENV || "development",
  },
  serverExternalPackages: ["shiki"],
  images: {
    remotePatterns: [
      {
        hostname: "**",
      },
    ],
  },
  experimental: {
    mdxRs: true,
  },
  assetPrefix:
    process.env.NODE_ENV === "production" ? "https://luats.lol" : "",
  basePath: process.env.NODE_ENV === "production" ? "" : "",
};

export default withMDX(config);
