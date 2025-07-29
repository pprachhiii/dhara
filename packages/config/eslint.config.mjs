// packages/config/eslint.config.mjs
import js from "@eslint/js"; // Base JS rules
import tseslint from "typescript-eslint"; // TS plugin
import parser from "@typescript-eslint/parser"; // TS parser
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";

export default [
  // Base JS
  js.configs.recommended,

  // TypeScript
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: parser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: process.cwd(),
        sourceType: "module", 
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      react: reactPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      // Example rules
      "no-unused-vars": "warn",
      "react-hooks/rules-of-hooks": "error",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // Prettier (last to override formatting)
  prettier,
];
