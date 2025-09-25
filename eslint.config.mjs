import next from "eslint-config-next";

export default [
  ...next,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // keep things calm while we stabilize
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }]
    }
  }
];
