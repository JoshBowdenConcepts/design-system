// @ts-check
import tseslint from "typescript-eslint";

/** Disallowed cross-package imports per the one-way matrix (secondary guard;
 *  `scripts/check-deps.mjs` is the authoritative gate). */
const boundary = (patterns) => ({
  "no-restricted-imports": [
    "error",
    {
      patterns: patterns.flatMap((p) => [p, `${p}/*`]),
    },
  ],
});

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/storybook-static/**",
      "**/.turbo/**",
      "**/node_modules/**",
      "**/*.snap",
    ],
  },
  tseslint.configs.recommended,
  {
    files: ["packages/tokens/**/*.{ts,tsx}"],
    rules: boundary(["@design-system/icons", "@design-system/components"]),
  },
  {
    files: ["packages/icons/**/*.{ts,tsx}"],
    rules: boundary(["@design-system/components"]),
  },
  {
    files: ["**/*.test.{ts,tsx}", "**/tests/**", "scripts/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
