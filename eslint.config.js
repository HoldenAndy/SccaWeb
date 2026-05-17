import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        window: "readonly",
        localStorage: "readonly",
        document: "readonly",
        console: "readonly",
        URL: "readonly",
        Blob: "readonly",
        Event: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        RequestInit: "readonly",
        Response: "readonly",
        React: "readonly",
        NodeJS: "readonly",
        navigator: "readonly",
        fetch: "readonly",
        Math: "readonly",
        Date: "readonly",
        Map: "readonly",
        Number: "readonly",
        String: "readonly",
        isNaN: "readonly",
        Promise: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "preserve-caught-error": "off",
      "no-undef": "off",
    },
  },
  eslintConfigPrettier,
];
