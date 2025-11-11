// eslint.config.js
import globals from "globals";
import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    ignores: ["node_modules/", "dist/", "build/", "coverage/"],
  },

  {
    files: ["**/*.js"],
    ...js.configs.recommended, 
    languageOptions: {
      globals: { ...globals.node }, 
      ecmaVersion: "latest",
      sourceType: "module", 
    },
    rules: {
    },
  },

  {
    files: ["**/*.ts"],
    plugins: {
      "@typescript-eslint": tseslint,
    },
    languageOptions: {
      parser: tsParser, 
      globals: { ...globals.node },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      ...tseslint.configs.recommended.rules, 
    },
  },

  eslintConfigPrettier,
];