module.exports = {
  plugins: {
    "postcss-normalize": {},
    "postcss-flexbugs-fixes": {},
    "@csstools/postcss-global-data": {
      files: ["./components/commonStyles/globals.css"],
    },
    "postcss-preset-env": {
      autoprefixer: {},
      stage: 3,
      features: {
        "custom-media-queries": true,
        "nesting-rules": true,
        "not-pseudo-class": true,
      },
    },
    cssnano: {
      preset: "default",
    },
  },
};
