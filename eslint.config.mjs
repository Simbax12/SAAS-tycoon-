// ESLint for the game code: app/, components/, data/, game/ and the root config files.
// Uses Next.js's own rules. Tooling folders and build output are not linted.
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Only matters with React Compiler, which this project does not use (owner, 2026-10-19).
    rules: { "react-hooks/preserve-manual-memoization": "off" },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    ".test-build/**",
    "next-env.d.ts",
    "public/**",
    "scripts/**",
    ".agents/**",
    ".claude/**",
    "testing/**",
  ]),
]);
