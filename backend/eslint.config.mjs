
import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [
      "node_modules/**",
      "coverage/**",
      "dist/**",
      "build/**",
    ],
  },

  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],

    languageOptions: {
      globals: globals.node,
      ecmaVersion: "latest",
    },

    rules: {
      // Prevenir errores y código inseguro
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "no-eval": "error",
      "no-unreachable": "error",
      "no-unsafe-finally": "error",

      // Mejorar la calidad del código
      "no-var": "error",
      "prefer-const": "error",
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],

      // Evitar problemas de mantenimiento
      "no-console": "warn",
    },
  },

  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
    },
  },

  {
    files: ["tests/jest/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      "no-console": "off",
    },
  },
]);
