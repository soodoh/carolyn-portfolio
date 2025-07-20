import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  images: {
    loader: "custom",
    domains: ["images.ctfassets.net"],
  },
  output: "standalone",
};

export default config;
