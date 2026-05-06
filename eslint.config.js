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
      "no-console": "off",
      "eqeqeq": "error",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
    },
  },
  {
    // egypt-map.js — ES module (import/export Three.js)
    files: ["assets/js/egypt-map.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        THREE: "readonly",
        React: "readonly",
        ReactDOM: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "eqeqeq": "error",
      "no-eval": "error",
    },
  },
  {
    // Scripts browser (globals exposés au HTML via window)
    files: ["assets/js/*.js"],
    ignores: ["assets/js/egypt-map.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
        supabase: "readonly",
        Stripe: "readonly",
      },
    },
    rules: {
      // Ces fonctions sont appelées depuis le HTML (onclick, window.fn)
      // ESLint ne voit pas les usages cross-fichiers → on désactive
      "no-unused-vars": "off",
      "eqeqeq": "error",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
    },
  },
];
