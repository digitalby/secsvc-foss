import base from "./eslint.config.base.mjs";
import jsxNbsp from "eslint-plugin-jsx-nbsp";

const baseConfig = Array.isArray(base) ? base : [base];

export default [
  ...baseConfig,
  {
    files: ["**/*.{jsx,tsx}"],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { "jsx-nbsp": jsxNbsp },
    rules: {
      "jsx-nbsp/no-breaking-space-before-dash": "error",
      "jsx-nbsp/no-text-to-text-jsx-space": "warn",
    },
  },
];
