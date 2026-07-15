import type { NextConfig } from "next";

// Static export (SSG) for exemplary SEO/GEO and simple Netlify hosting.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // Pin the workspace root so Next ignores the stray lockfile in the home dir.
  turbopack: { root: __dirname },
};

export default nextConfig;
