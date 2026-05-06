import globals from "globals";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    // API serverless (Node.js ESM)
    files: ["api/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",          // console.error autorisé dans les API
      "eqeqeq": "error",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
    },
  },
  {
    // Scripts frontend (browser + vanilla JS)
    files: ["assets/js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
        // Libs chargées via CDN
        React: "readonly",
        ReactDOM: "readonly",
        THREE: "readonly",
        supabase: "readonly",
        Stripe: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "eqeqeq": "error",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-alert": "off",            // alerts légitimes en frontend
    },
  },
];
