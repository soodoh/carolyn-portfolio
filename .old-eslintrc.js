module.exports = {
  extends: ["next/core-web-vitals", "prettier"],
  plugins: ["import", "prettier"],
  rules: {
    "sort-imports": [
      "error",
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
      },
    ],
    "import/order": [
      1,
      {
        groups: [
          ["builtin", "external", "internal"],
          ["parent", "index", "sibling"],
          "object",
          "type",
        ],
        "newlines-between": "never",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
  },
};
