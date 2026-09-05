import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "no-console": "error",
      "no-eval": "error",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "esbuild.mjs"],
  },
);
