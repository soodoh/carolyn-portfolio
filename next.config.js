/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  images: {
    loader: "custom",
    domains: ["images.ctfassets.net"],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        "next-swc-loader",
        {
          loader: "@svgr/webpack",
          options: { babel: false },
        },
      ],
    });

    return config;
  },
};
