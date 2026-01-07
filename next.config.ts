import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  images: {
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    qualities: [50, 75, 100],
  },
  output: "standalone",
};

export default config;
