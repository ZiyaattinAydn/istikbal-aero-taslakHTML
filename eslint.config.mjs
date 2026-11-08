import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // This App Router root layout shares the prototype font stylesheet across all routes.
  {
    files: ["src/app/layout.tsx"],
    rules: { "@next/next/no-page-custom-font": "off" },
  },
  // SVG article images and the existing intrinsic image dimensions are intentional.
  { rules: { "@next/next/no-img-element": "off" } },
  globalIgnores([".next/**", "next-env.d.ts", "node_modules/**"]),
]);
