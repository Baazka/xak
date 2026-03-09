import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: {
              icon: true,
            },
          },
        ],
        as: "*.js",
      },
    },
  },
  output: "standalone",

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      // issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    // // const fileLoaderRule = config.module.rules.find((rule: any) => rule?.test?.test?.(".svg"));

    // // config.module.rules.push(
    // //   // өмнөх asset loader-ийг ?url үед ашиглана
    // //   {
    // //     ...fileLoaderRule,
    // //     test: /\.svg$/i,
    // //     resourceQuery: /url/,
    // //   },
    // //   // бусад svg-г React component болгоно
    // //   {
    // //     test: /\.svg$/i,
    // //     issuer: fileLoaderRule?.issuer,
    // //     resourceQuery: {
    // //       not: [...(fileLoaderRule?.resourceQuery?.not || []), /url/],
    // //     },
    // //     use: ["@svgr/webpack"],
    // //   }
    // // );

    // // if (fileLoaderRule) {
    // //   fileLoaderRule.exclude = /\.svg$/i;
    // }

    return config;
  },
};

export default nextConfig;
